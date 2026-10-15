"""Create sharp, aspect-correct sprite sheets for the medieval HTML decks.

Requires Pillow, NumPy, and ONNX Runtime. The 4x Real-ESRGAN model is cached in
the system temporary directory; generated WebP sheets remain in slide-artwork.
"""

from __future__ import annotations

import hashlib
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ARTWORK = ROOT / "assets" / "slide-artwork"
MODEL_URL = (
    "https://huggingface.co/Heliosoph/realesrgan-onnx/resolve/"
    "488e5dda07333179f229a6205d92135eea4c25e9/"
    "realesr-general-x4v3.onnx?download=true"
)
MODEL_SHA256 = "09b757accd747d7e423c1d352b3e8f23e77cc5742d04bae958d4eb8082b76fa4"
MODEL_PATH = Path(tempfile.gettempdir()) / f"presentlab-realesr-{MODEL_SHA256[:12]}.onnx"
PANEL_SIZE = (1024, 576)
SHEET_SIZE = (PANEL_SIZE[0] * 4, PANEL_SIZE[1] * 5)


def ensure_model() -> Path:
    if MODEL_PATH.exists() and hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest() == MODEL_SHA256:
        return MODEL_PATH

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    partial = MODEL_PATH.with_suffix(".download")
    digest = hashlib.sha256()
    with urllib.request.urlopen(MODEL_URL, timeout=60) as response, partial.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            digest.update(chunk)
            output.write(chunk)
    if digest.hexdigest() != MODEL_SHA256:
        partial.unlink(missing_ok=True)
        raise RuntimeError("Downloaded Real-ESRGAN model did not match the pinned SHA-256.")
    partial.replace(MODEL_PATH)
    return MODEL_PATH


def upscale_panel(session: ort.InferenceSession, panel: Image.Image) -> Image.Image:
    source = np.asarray(panel.convert("RGB"), dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
    output = session.run(None, {"input": source})[0][0]
    pixels = (output.transpose(1, 2, 0) * 255).clip(0, 255).astype(np.uint8)
    image = Image.fromarray(pixels, mode="RGB")

    target_ratio = PANEL_SIZE[0] / PANEL_SIZE[1]
    width, height = image.size
    if width / height > target_ratio:
        target_width = round(height * target_ratio)
        left = (width - target_width) // 2
        image = image.crop((left, 0, left + target_width, height))
    else:
        target_height = round(width / target_ratio)
        top = (height - target_height) // 2
        image = image.crop((0, top, width, top + target_height))

    return image.resize(PANEL_SIZE, Image.Resampling.LANCZOS)


def process_sheet(session: ort.InferenceSession, source_path: Path) -> Path:
    with Image.open(source_path) as source_image:
        source = source_image.convert("RGB")
    width, height = source.size
    sheet = Image.new("RGB", SHEET_SIZE, "#1d1914")

    for index in range(20):
        column, row = index % 4, index // 4
        left = round(column * width / 4) + 4
        top = round(row * height / 5) + 4
        right = round((column + 1) * width / 4) - 4
        bottom = round((row + 1) * height / 5) - 4
        panel = source.crop((left, top, right, bottom))
        enhanced = upscale_panel(session, panel)
        sheet.paste(enhanced, (column * PANEL_SIZE[0], row * PANEL_SIZE[1]))

        if index in (4, 9, 14, 19):
            print(f"  {source_path.stem}: {index + 1}/20 panels", flush=True)

    output_path = source_path.with_name(source_path.stem.removesuffix("-grid") + "-hd-grid.webp")
    sheet.save(output_path, "WEBP", quality=89, method=6)
    print(f"  wrote {output_path.name} ({output_path.stat().st_size:,} bytes)", flush=True)
    return output_path


def main() -> None:
    model = ensure_model()
    session = ort.InferenceSession(str(model), providers=["CPUExecutionProvider"])
    sheets = sorted(ARTWORK.glob("*-grid.jpg"))
    if len(sheets) != 10:
        raise RuntimeError(f"Expected 10 artwork sheets, found {len(sheets)} in {ARTWORK}")
    print(f"Upscaling {len(sheets)} sheets with Real-ESRGAN x4 on CPU.", flush=True)
    for source_path in sheets:
        process_sheet(session, source_path)


if __name__ == "__main__":
    main()
