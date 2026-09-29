"""Build the licensed, title-only XLab Form Display font files."""

from __future__ import annotations

from pathlib import Path
import shutil

from fontTools.pens.recordingPen import DecomposingRecordingPen, RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "lusion" / "assets" / "fonts"
OUTPUT = ROOT / "web" / "portal" / "assets" / "fonts"
LICENSE = SOURCE / "BeVietnamPro-OFL.txt"
SCALE_X = 0.92
SHEAR_X = 0.04
TRANSFORM = (SCALE_X, 0, SHEAR_X, 1, 0, 0)


def transform_positioning_table(obj: object, seen: set[int]) -> None:
    """Apply the same horizontal transform to GPOS anchors and offsets."""
    if obj is None or id(obj) in seen:
        return
    seen.add(id(obj))

    if obj.__class__.__name__ == "Anchor":
        x = getattr(obj, "XCoordinate", None)
        y = getattr(obj, "YCoordinate", None)
        if x is not None and y is not None:
            obj.XCoordinate = round(SCALE_X * x + SHEAR_X * y)

    if obj.__class__.__name__ == "ValueRecord":
        y_placement = getattr(obj, "YPlacement", None) or 0
        y_advance = getattr(obj, "YAdvance", None) or 0
        for attribute, vertical in (
            ("XPlacement", y_placement),
            ("XAdvance", y_advance),
        ):
            value = getattr(obj, attribute, None)
            if value is not None:
                setattr(obj, attribute, round(SCALE_X * value + SHEAR_X * vertical))

    if isinstance(obj, dict):
        for value in obj.values():
            transform_positioning_table(value, seen)
    elif isinstance(obj, (list, tuple)):
        for value in obj:
            transform_positioning_table(value, seen)
    elif hasattr(obj, "__dict__"):
        for value in vars(obj).values():
            transform_positioning_table(value, seen)


def set_name(font: TTFont, name_id: int, value: str) -> None:
    name_table = font["name"]
    records = [record for record in name_table.names if record.nameID == name_id]
    for record in records:
        name_table.setName(
            value,
            name_id,
            record.platformID,
            record.platEncID,
            record.langID,
        )
    if not records:
        name_table.setName(value, name_id, 3, 1, 0x409)


def build_font(source_path: Path, output_path: Path) -> None:
    font = TTFont(source_path)
    if "glyf" not in font:
        raise ValueError(f"Expected a TrueType outline font: {source_path}")

    source_glyph_set = font.getGlyphSet()
    recordings: dict[str, RecordingPen] = {}
    for glyph_name in font.getGlyphOrder():
        recording = DecomposingRecordingPen(source_glyph_set)
        source_glyph_set[glyph_name].draw(recording)
        recordings[glyph_name] = recording

    glyf = font["glyf"]
    for glyph_name, recording in recordings.items():
        transformed = RecordingPen()
        recording.replay(TransformPen(transformed, TRANSFORM))
        glyph_pen = TTGlyphPen(None)
        transformed.replay(glyph_pen)
        glyph = glyph_pen.glyph()
        glyph.program.fromBytecode([])
        glyph.recalcBounds(glyf)
        glyf[glyph_name] = glyph

    metrics = font["hmtx"].metrics
    for glyph_name, (advance, _left_side_bearing) in list(metrics.items()):
        glyph = glyf[glyph_name]
        left_side_bearing = glyph.xMin if glyph.numberOfContours else 0
        metrics[glyph_name] = (round(advance * SCALE_X), left_side_bearing)

    bounds = [
        (glyf[name].xMin, glyf[name].yMin, glyf[name].xMax, glyf[name].yMax)
        for name in font.getGlyphOrder()
        if glyf[name].numberOfContours
    ]
    if bounds:
        font["head"].xMin = min(box[0] for box in bounds)
        font["head"].yMin = min(box[1] for box in bounds)
        font["head"].xMax = max(box[2] for box in bounds)
        font["head"].yMax = max(box[3] for box in bounds)

    hhea = font["hhea"]
    hhea.advanceWidthMax = max(advance for advance, _ in metrics.values())
    hhea.minLeftSideBearing = min(left for _, left in metrics.values())
    hhea.minRightSideBearing = min(
        advance - left - (glyf[name].xMax - glyf[name].xMin)
        for name, (advance, left) in metrics.items()
        if glyf[name].numberOfContours
    )
    hhea.xMaxExtent = max(
        left + (glyf[name].xMax - glyf[name].xMin)
        for name, (_, left) in metrics.items()
        if glyf[name].numberOfContours
    )

    maxp = font["maxp"]
    maxp.maxPoints = max(
        (len(glyf[name].coordinates) for name in font.getGlyphOrder()), default=0
    )
    maxp.maxContours = max(
        (len(glyf[name].endPtsOfContours) for name in font.getGlyphOrder()), default=0
    )
    maxp.maxCompositePoints = 0
    maxp.maxCompositeContours = 0
    maxp.maxComponentElements = 0
    maxp.maxComponentDepth = 0
    maxp.maxSizeOfInstructions = 0
    maxp.maxInstructionDefs = 0
    maxp.maxFunctionDefs = 0
    maxp.maxStackElements = 0
    maxp.maxStorage = 0
    maxp.maxTwilightPoints = 0

    os2 = font["OS/2"]
    os2.xAvgCharWidth = round(
        sum(advance for advance, _ in metrics.values()) / len(metrics)
    )
    os2.usWeightClass = 500

    if "GPOS" in font:
        transform_positioning_table(font["GPOS"].table, set())

    for table_tag in ("fpgm", "prep", "cvt "):
        if table_tag in font:
            del font[table_tag]

    set_name(font, 1, "XLAB Form Display")
    set_name(font, 2, "Regular")
    set_name(font, 3, "XLAB Form Display 1.0")
    set_name(font, 4, "XLAB Form Display")
    set_name(font, 5, "Version 1.000")
    set_name(font, 6, "XLABFormDisplay")
    set_name(font, 16, "XLAB Form Display")
    set_name(font, 17, "Regular")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(output_path)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for subset in ("latin", "vietnamese"):
        build_font(
            SOURCE / f"BeVietnamPro-Medium-{subset}.woff2",
            OUTPUT / f"XLAB-Form-Display-{subset.title()}.woff2",
        )
    shutil.copyfile(LICENSE, OUTPUT / "OFL.txt")
    print(f"Built XLAB Form Display subsets in {OUTPUT}")


if __name__ == "__main__":
    main()
