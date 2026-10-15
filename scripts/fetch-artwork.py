"""Fetch real, sharp public-domain artwork from Wikimedia Commons, optionally
sharpen small images with Real-ESRGAN, and emit a base64 asset manifest.

Usage:
    python scripts/fetch-artwork.py specs/<slug>.json

Reads the deck spec (which lists Wikimedia file titles or search queries for each
work + a hero), downloads each at a sensible width, upscales any image that is too
small with the pinned Real-ESRGAN x4 model, optimises to WebP, and writes:

    assets/slide-artwork2/<slug>.json

containing, per image: { data (base64), mime, width, height, aspect, alt }.

The companion build-deck.mjs turns that manifest + the spec into a self-contained
HTML deck (images embedded, no external URLs). Resumable: re-runs reuse images
that already succeeded.
"""

from __future__ import annotations

import base64
import hashlib
import json
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "slide-artwork2"
MODEL_URL = (
    "https://huggingface.co/Heliosoph/realesrgan-onnx/resolve/"
    "488e5dda07333179f229a6205d92135eea4c25e9/"
    "realesr-general-x4v3.onnx?download=true"
)
MODEL_SHA256 = "09b757accd747d7e423c1d352b3e8f23e77cc5742d04bae958d4eb8082b76fa4"
MODEL_PATH = Path(tempfile.gettempdir()) / f"presentlab-realesr-{MODEL_SHA256[:12]}.onnx"

# NOTE ON IMAGE SIZES (important): probing showed Wikimedia serves only its
# pre-cached 320px thumbnail quickly in this environment. Larger sizes (500/640px)
# trigger on-demand re-rendering that times out repeatedly (a 640px render of the
# Mona Lisa took 305s and still failed). So we DOWNLOAD the fast 320px thumbnail
# and UPSCALING+SHARPEN it to 640px with a PIL unsharp mask. The user explicitly
# asked: if an image isn't sharp, sharpen it. An unsharp pass on a 320->640px
# enlargement restores much of the perceived crispness for slide display.
TARGET_W = 320           # reliable, fast-cached Wikimedia thumbnail width
HERO_W = 320             # reliable width for the cover hero
UPSCALE_TO = 640         # final displayed width (we upscale + sharpen)
UPSCALE_MIN = 10**9      # Real-ESRGAN model unavailable here -> disabled
WEBP_QUALITY = 88
MIN_WIDTH = 200          # we accept smaller originals since we upscale anyway
# Tiny ladder only for the rare case even 320px fails.
FALLBACK_WIDTHS = (320, 250)


def ensure_model() -> Path:
    if MODEL_PATH.exists() and hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest() == MODEL_SHA256:
        return MODEL_PATH
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    partial = MODEL_PATH.with_suffix(".download")
    digest = hashlib.sha256()
    with urllib.request.urlopen(MODEL_URL, timeout=90) as response, partial.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            digest.update(chunk)
            output.write(chunk)
    if digest.hexdigest() != MODEL_SHA256:
        partial.unlink(missing_ok=True)
        raise RuntimeError("Real-ESRGAN model SHA-256 mismatch.")
    partial.replace(MODEL_PATH)
    return MODEL_PATH


_ORT_CACHE = None


def _get_ort():
    """Lazily load the Real-ESRGAN ONNX session (only when an upscale is needed)."""
    global _ORT_CACHE
    if _ORT_CACHE is None:
        ensure_model()
        _ORT_CACHE = ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
    return _ORT_CACHE


def _session():
    s = urllib.request.build_opener()
    s.addheaders = [("User-Agent", "PresentLabBot/1.0 (educational slides; local)")]
    return s


def _http_get(session, url: str, timeout: int = 60, retries: int = 6) -> bytes | None:
    """GET with bounded retries/backoff. Returns bytes or None on total failure."""
    delay = 2.0
    last = None
    for attempt in range(1, retries + 1):
        try:
            with session.open(url, timeout=timeout) as r:
                if r.status != 200:
                    return None
                return r.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = e
            if attempt < retries:
                time.sleep(delay)
                delay = min(delay * 1.8, 20.0)
    return None


def _get_json(session, api: str, params: dict) -> dict | None:
    url = f"{api}?{urllib.parse.urlencode(params)}"
    raw = _http_get(session, url, timeout=40, retries=6)
    if raw is None:
        # Don't crash the whole fetch on a transient API/network failure.
        return None
    return json.loads(raw.decode("utf-8"))


def resolve_best_image(session, query: str) -> str | None:
    """Search Commons File namespace and return the title of the largest image
    that matches the query and clears MIN_WIDTH."""
    api = "https://commons.wikimedia.org/w/api.php"
    data = _get_json(session, api, {
        "action": "query", "format": "json", "list": "search",
        "srsearch": query, "srnamespace": 6, "srlimit": 10,
    })
    if not data:
        return None
    hits = [h["title"] for h in data.get("query", {}).get("search", [])]
    if not hits:
        return None
    info = _get_json(session, api, {
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|size|mime", "titles": "|".join(hits),
    })
    if not info:
        return None
    best = None
    best_w = -10 ** 9
    for page in info.get("query", {}).get("pages", {}).values():
        ii = page.get("imageinfo")
        if not ii:
            continue
        ii = ii[0]
        if not str(ii.get("mime", "")).startswith("image/"):
            continue
        w = ii.get("width", 0)
        if w < MIN_WIDTH:
            continue
        title = page.get("title", "")
        low = title.lower()
        # Prefer moderate-resolution originals: they render to a crisp 640px
        # thumbnail almost instantly. Gigapixel scans (Google Art Project /
        # C2RMF) and huge TIFFs are slow to thumbnail on Commons and force a
        # smaller fallback, so we penalize them heavily instead of preferring.
        # Steer away from tourist / documentary photographs (panoramio, flickr,
        # museum-visit shots) which usually show frames, glass or people rather
        # than a clean plate of the artwork.
        score = 10000 - abs(w - 2200) * 0.6
        if w > 8000:
            score -= 100000
        elif w > 5000:
            score -= 50000
        elif w > 3500:
            score -= 15000
        if "google art project" in low or "c2rmf" in low:
            score -= 40000
        if low.endswith((".tif", ".tiff")):
            score -= 20000
        for bad in ("panoramio", "flickr", "geograph", "tourist", "museum",
                    "visit", " - panorama", "detail-", "googlemaps", "wiki loves"):
            if bad in low:
                score -= 30000
                break
        if "jpg" in low or "jpeg" in low:  # broad decoder support, compact
            score += 500
        if score > best_w:
            best_w = score
            best = title
    return best


def _thumb_url(session, title: str, width: int) -> str | None:
    """Ask the API for a valid scaled thumbnail URL (upload.wikimedia.org)."""
    api = "https://commons.wikimedia.org/w/api.php"
    try:
        data = _get_json(session, api, {
            "action": "query", "format": "json", "prop": "imageinfo",
            "iiprop": "url|size|mime", "iiurlwidth": width,
            "titles": title,
        })
    except Exception:
        return None
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        ii = page.get("imageinfo")
        if not ii:
            continue
        url = ii[0].get("thumburl") or ii[0].get("url")
        if url:
            return url
    return None


def download_image(session, title: str, width: int) -> tuple[bytes | None, int]:
    """Download a valid, API-provided thumbnail (retried), trying a descending
    ladder of widths. Large transfers are capped in this environment, so if the
    requested width times out we fall back to smaller widths. Returns
    (bytes, used_width) or (None, 0)."""
    widths = [width] + [w for w in FALLBACK_WIDTHS if w != width]
    for w in widths:
        url = _thumb_url(session, title, w)
        if not url:
            continue
        data = _http_get(session, url, timeout=12, retries=2)
        if data and len(data) >= 800:  # plausibly a real image, not an error page
            return data, w
    # No slow original-file fallback: in this environment only the pre-cached
    # 320px thumbnails are reliably served, so a missing small thumb means we
    # skip the image rather than stall on a multi-minute original download.
    return None, 0


def upscale(img: Image.Image, width: int) -> Image.Image:
    sess = _get_ort()
    target_ratio = width / max(1, img.height)
    if img.width / max(1, img.height) > target_ratio:
        tw = round(img.height * target_ratio)
        left = (img.width - tw) // 2
        img = img.crop((left, 0, left + tw, img.height))
    else:
        th = round(img.width / target_ratio)
        top = (img.height - th) // 2
        img = img.crop((0, top, img.width, top + th))
    source = np.asarray(img.convert("RGB"), dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
    out = sess.run(None, {"input": source})[0][0]
    px = (out.transpose(1, 2, 0) * 255).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(px, "RGB")
    return img.resize((width, round(width * img.height / img.width)), Image.Resampling.LANCZOS)


def process_image(session, title: str, width: int, alt: str) -> dict | None:
    raw, used_w = download_image(session, title, width)
    if raw is None:
        return None
    img = Image.open(__import__("io").BytesIO(raw)).convert("RGB")
    # We downloaded a fast 320px Wikimedia thumbnail. Upscale to the final
    # display width with LANCZOS, then run an UNSHARP MASK pass so the enlarged
    # image stays crisp on the slides (user asked: sharpen images that aren't
    # already sharp). The Real-ESRGAN model cannot be fetched here, so this
    # classical sharpening is our upscaling-quality step.
    final_w = UPSCALE_TO
    if max(img.width, img.height) != final_w:
        scale = final_w / max(img.width, img.height)
        nw = max(1, round(img.width * scale))
        nh = max(1, round(img.height * scale))
        img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    # Unsharp mask: radius/percent/threshold tuned for a 2x enlargement.
    img = img.filter(ImageFilter.UnsharpMask(radius=1.6, percent=140, threshold=2))
    out = __import__("io").BytesIO()
    img.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
    b64 = base64.b64encode(out.getvalue()).decode("ascii")
    print(f"  ok {title} -> {img.width}x{img.height} ({len(b64)//1024} KB, src {used_w}px, sharpened)", flush=True)
    return {
        "data": b64, "mime": "image/webp",
        "width": img.width, "height": img.height,
        "aspect": round(img.width / img.height, 4), "alt": alt,
    }


def fetch_one(session, work: dict, width: int) -> dict | None:
    try:
        title = work.get("file")
        if not title:
            q = work.get("search") or work.get("title", "")
            if q:
                title = resolve_best_image(session, q)
        if not title:
            return None
        alt = work.get("title", title)
        return process_image(session, title, width, alt)
    except Exception as e:
        print(f"  ! exception for {work.get('title', work.get('file', ''))}: {e}", flush=True)
        return None


def main() -> None:
    spec_path = Path(sys.argv[1])
    spec = json.loads(spec_path.read_text("utf-8"))
    slug = spec["slug"]
    session = _session()
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    manifest_path = ASSET_DIR / f"{slug}.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text("utf-8"))
        print(f"Resuming {slug}: reusing {len(manifest.get('images', []))} images.", flush=True)
    else:
        manifest = {"slug": slug, "images": []}

    works = spec.get("works", [])
    for i, work in enumerate(works):
        if i < len(manifest.get("images", [])) and manifest["images"][i].get("data"):
            print(f"  reuse #{i+1} {work.get('title','')}", flush=True)
            continue
        res = fetch_one(session, work, TARGET_W)
        if res is None:
            print(f"  ! failed: {work.get('title', work.get('file', ''))}", flush=True)
            res = {"data": "", "mime": "image/webp", "width": 16, "height": 9, "aspect": 1.778, "alt": work.get("title", "")}
        # pad manifest images list if needed
        while len(manifest["images"]) <= i:
            manifest["images"].append({"data": "", "mime": "image/webp", "width": 16, "height": 9, "aspect": 1.778, "alt": ""})
        manifest["images"][i] = res
        # persist incrementally so partial progress is never lost on interrupt
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False), "utf-8")

    hero = spec.get("hero", {})
    if hero.get("file") or hero.get("search"):
        if not manifest.get("hero", {}).get("data"):
            htitle = hero.get("file")
            if not htitle:
                htitle = resolve_best_image(session, hero.get("search", ""))
            if htitle:
                hres = process_image(session, htitle, HERO_W, hero.get("alt", spec.get("title", "Hero")))
                if hres:
                    manifest["hero"] = hres

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False), "utf-8")
    n_ok = sum(1 for im in manifest["images"] if im.get("data"))
    print(f"Wrote {manifest_path} ({manifest_path.stat().st_size//1024} KB); {n_ok}/{len(manifest['images'])} images ok.", flush=True)


if __name__ == "__main__":
    main()
