const backgroundModes = [
  "radial-bloom",
  "linear-ribbon",
  "grid-cross",
  "dot-field",
  "checkerboard",
  "sunburst",
  "concentric-rings",
  "diagonal-hatch",
  "vertical-blinds",
  "horizontal-bars",
  "soft-cloud",
  "corner-cut",
  "diamond-lattice",
  "plaid",
  "arc-slice",
  "split-field",
  "spotlight",
  "paper-fold",
  "wave-ripples",
  "map-lines",
  "pixel-blocks",
  "barcode",
  "frame-lines",
  "crosshair",
  "ray-fan",
  "topo-contours",
  "halftone",
  "glaze",
  "architecture",
  "orbital",
  "stained-glass",
  "raster-scan",
  "triangular",
  "organic-loops",
  "blueprint",
  "torn-paper",
  "spot-grid",
  "portal",
  "ribbon-stack",
  "signal-pulse",
  "monochrome-noise",
  "window-light",
  "sun-disc",
  "labyrinth",
];

const blends = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "exclusion",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hue",
  "saturation",
  "luminosity",
];

function hashString(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createBackgroundProfile(template, index) {
  const field = (name, size, minimum = 0) =>
    minimum + (hashString(`${template.name}:background:${index}:${name}`) % size);
  const mode = backgroundModes[field("mode", backgroundModes.length)];
  const profile = {
    angle: field("angle", 360),
    angle2: field("angle2", 360),
    band: field("band", 43, 7),
    blend: blends[field("blend", blends.length)],
    contrast: field("contrast", 61, 20),
    density: field("density", 19, 2),
    focus: field("focus", 63, 14),
    layers: field("layers", 8, 2),
    mode,
    opacity: field("opacity", 39, 12),
    period: field("period", 107, 18),
    period2: field("period2", 137, 23),
    phase: field("phase", 360),
    serial: index,
    scale: field("scale", 231, 70),
    texture: field("texture", 997, 3),
    x: field("x", 91, 4),
    x2: field("x2", 83, 8),
    y: field("y", 91, 4),
    y2: field("y2", 83, 8),
  };
  profile.id = `bg-${String(index + 1).padStart(4, "0")}-${mode}`;
  profile.signature = [
    profile.serial,
    profile.mode,
    profile.angle,
    profile.angle2,
    profile.band,
    profile.blend,
    profile.contrast,
    profile.density,
    profile.focus,
    profile.layers,
    profile.opacity,
    profile.period,
    profile.period2,
    profile.phase,
    profile.scale,
    profile.texture,
    profile.x,
    profile.x2,
    profile.y,
    profile.y2,
  ].join("|");
  return profile;
}

function backgroundCss(profile) {
  const a = "var(--profile-bg-a)";
  const b = "var(--profile-bg-b)";
  const c = "var(--profile-bg-c)";
  const line = "var(--profile-bg-line)";
  const paper = "var(--paper)";
  const angle = `${profile.angle}deg`;
  const angle2 = `${profile.angle2}deg`;
  const x = `${profile.x}%`;
  const x2 = `${profile.x2}%`;
  const y = `${profile.y}%`;
  const y2 = `${profile.y2}%`;
  const period = profile.period;
  const period2 = profile.period2;
  const band = profile.band;
  const focus = profile.focus;
  const density = profile.density;

  switch (profile.mode) {
    case "radial-bloom":
      return `radial-gradient(circle at ${x} ${y}, ${a} 0 ${focus}%, transparent ${focus + 1}%), linear-gradient(${angle}, ${paper}, ${c})`;
    case "linear-ribbon":
      return `linear-gradient(${angle}, transparent 0 ${band}%, ${a} ${band + 1}% ${band + 8}%, transparent ${band + 9}% 100%), linear-gradient(${angle2}, ${paper}, ${c})`;
    case "grid-cross":
      return `repeating-linear-gradient(${angle}, ${line} 0 1px, transparent 1px ${period}px), repeating-linear-gradient(${angle2}, ${line} 0 1px, transparent 1px ${period2}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "dot-field":
      return `radial-gradient(circle, ${a} 0 ${Math.max(1, density - 1)}px, transparent ${density}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "checkerboard":
      return `repeating-conic-gradient(from ${angle} at ${x} ${y}, ${a} 0 25%, transparent 0 50%), linear-gradient(${angle2}, ${paper}, ${c})`;
    case "sunburst":
      return `conic-gradient(from ${angle} at ${x} ${y}, ${a}, transparent 14%, ${b} 28%, transparent 43%, ${c} 59%, transparent 76%), ${paper}`;
    case "concentric-rings":
      return `repeating-radial-gradient(circle at ${x} ${y}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px, transparent ${period + 3}px ${period2}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "diagonal-hatch":
      return `repeating-linear-gradient(${angle}, transparent 0 ${band}px, ${a} ${band + 1}px ${band + 2}px), repeating-linear-gradient(${angle2}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px), ${paper}`;
    case "vertical-blinds":
      return `repeating-linear-gradient(90deg, ${a} 0 ${band}px, transparent ${band + 1}px ${period}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "horizontal-bars":
      return `repeating-linear-gradient(0deg, ${b} 0 ${band}px, transparent ${band + 1}px ${period2}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "soft-cloud":
      return `radial-gradient(ellipse at ${x} ${y}, ${a} 0 ${focus}%, transparent ${focus + 18}%), radial-gradient(ellipse at ${x2} ${y2}, ${b} 0 ${Math.max(18, focus - 12)}%, transparent ${focus + 14}%), ${paper}`;
    case "corner-cut":
      return `linear-gradient(${angle} at 0 0, ${a} 0 ${band}%, transparent ${band + 1}% 100%), linear-gradient(${angle2} at 100% 100%, ${b} 0 ${band + 9}%, transparent ${band + 10}% 100%), ${paper}`;
    case "diamond-lattice":
      return `repeating-linear-gradient(${angle}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px), repeating-linear-gradient(${angle2}, transparent 0 ${period2}px, ${a} ${period2 + 1}px ${period2 + 2}px), ${paper}`;
    case "plaid":
      return `repeating-linear-gradient(90deg, ${a} 0 2px, transparent 2px ${period}px), repeating-linear-gradient(0deg, ${b} 0 2px, transparent 2px ${period2}px), repeating-linear-gradient(${angle}, ${line} 0 1px, transparent 1px ${period + 12}px), ${paper}`;
    case "arc-slice":
      return `radial-gradient(ellipse at ${x} ${y}, transparent 0 ${focus}%, ${a} ${focus + 1}% ${focus + 5}%, transparent ${focus + 6}% 100%), linear-gradient(${angle}, ${paper}, ${c})`;
    case "split-field":
      return `linear-gradient(${angle}, ${a} 0 ${25 + density}%, transparent ${26 + density}% ${62 - density}%, ${b} ${63 - density}% 100%), ${paper}`;
    case "spotlight":
      return `radial-gradient(circle at ${x} ${y}, ${a} 0 ${focus}%, transparent ${focus + 22}%), linear-gradient(${angle2}, ${line}, transparent 42%), ${paper}`;
    case "paper-fold":
      return `linear-gradient(${angle} at ${x} ${y}, transparent 0 38%, ${line} 38.5% 39%, transparent 39.5% 100%), linear-gradient(${angle2}, ${a} 0 ${band + 16}%, transparent ${band + 17}% 100%), ${paper}`;
    case "wave-ripples":
      return `repeating-radial-gradient(ellipse at ${x} ${y}, transparent 0 ${period}px, ${a} ${period + 1}px ${period + 2}px, transparent ${period + 3}px ${period2}px), ${paper}`;
    case "map-lines":
      return `repeating-linear-gradient(${angle}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px), repeating-linear-gradient(${angle2}, transparent 0 ${period2}px, ${a} ${period2 + 1}px ${period2 + 2}px), repeating-linear-gradient(${profile.phase}deg, transparent 0 ${band + 14}px, ${b} ${band + 15}px ${band + 16}px), ${paper}`;
    case "pixel-blocks":
      return `repeating-conic-gradient(from ${angle} at ${x} ${y}, ${a} 0 25%, transparent 0 50%) 0 0 / ${period}px ${period}px, repeating-linear-gradient(${angle2}, ${b} 0 1px, transparent 1px ${period2}px), ${paper}`;
    case "barcode":
      return `repeating-linear-gradient(90deg, ${a} 0 ${density}px, transparent ${density + 1}px ${period}px, ${b} ${period + 1}px ${period + 3}px, transparent ${period + 4}px ${period2}px), ${paper}`;
    case "frame-lines":
      return `linear-gradient(${a}, ${a}) top left / 100% ${density}px no-repeat, linear-gradient(${b}, ${b}) bottom right / 100% ${density}px no-repeat, linear-gradient(90deg, ${line}, ${line}) top left / ${density}px 100% no-repeat, linear-gradient(90deg, ${line}, ${line}) top right / ${density}px 100% no-repeat, ${paper}`;
    case "crosshair":
      return `radial-gradient(circle at ${x} ${y}, ${a} 0 ${density + 4}px, transparent ${density + 5}px), linear-gradient(${angle}, transparent 49%, ${line} 49.5% 50.5%, transparent 51%), linear-gradient(${angle2}, transparent 49%, ${b} 49.5% 50.5%, transparent 51%), ${paper}`;
    case "ray-fan":
      return `conic-gradient(from ${angle} at ${x} ${y}, transparent 0 ${density * 12}deg, ${a} ${density * 12 + 1}deg ${density * 18}deg, transparent ${density * 18 + 1}deg ${density * 28}deg, ${b} ${density * 28 + 1}deg ${density * 35}deg, transparent ${density * 35 + 1}deg), ${paper}`;
    case "topo-contours":
      return `repeating-radial-gradient(ellipse at ${x} ${y}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px, transparent ${period + 3}px ${period2}px), radial-gradient(ellipse at ${x2} ${y2}, ${a} 0 ${focus}%, transparent ${focus + 1}%), ${paper}`;
    case "halftone":
      return `radial-gradient(circle, ${a} 0 ${Math.max(1, density - 2)}px, transparent ${density}px) 0 0 / ${period}px ${period}px, radial-gradient(circle, ${b} 0 ${Math.max(1, density - 3)}px, transparent ${density - 1}px) ${period / 2}px ${period / 2}px / ${period2}px ${period2}px, ${paper}`;
    case "glaze":
      return `linear-gradient(${angle}, ${a} 0 ${band + 6}%, transparent ${band + 7}% 100%), linear-gradient(${angle2}, ${b} 0 ${Math.max(18, focus - 20)}%, transparent ${Math.max(19, focus - 19)}% 100%), ${paper}`;
    case "architecture":
      return `repeating-linear-gradient(0deg, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px), repeating-linear-gradient(90deg, transparent 0 ${period2}px, ${a} ${period2 + 1}px ${period2 + 2}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "orbital":
      return `repeating-radial-gradient(ellipse at ${x} ${y}, transparent 0 ${period}px, ${a} ${period + 1}px ${period + 2}px, transparent ${period + 3}px ${period2}px), linear-gradient(${angle}, ${paper}, ${c})`;
    case "stained-glass":
      return `conic-gradient(from ${angle} at ${x} ${y}, ${a} 0 12%, ${line} 12.5% 13%, ${b} 13.5% 29%, ${line} 29.5% 30%, ${c} 30.5% 53%, ${line} 53.5% 54%, ${a} 54.5% 78%, ${line} 78.5% 79%, ${b} 79.5% 100%), ${paper}`;
    case "raster-scan":
      return `repeating-linear-gradient(0deg, ${line} 0 1px, transparent 1px ${period}px), repeating-linear-gradient(${angle}, ${a} 0 1px, transparent 1px ${period2}px), ${paper}`;
    case "triangular":
      return `linear-gradient(${angle} at ${x} ${y}, transparent 0 42%, ${a} 42.5% 58%, transparent 58.5% 100%), linear-gradient(${angle2}, transparent 0 35%, ${b} 35.5% 64%, transparent 64.5% 100%), ${paper}`;
    case "organic-loops":
      return `radial-gradient(ellipse at ${x} ${y}, transparent 0 ${focus}%, ${a} ${focus + 1}% ${focus + 5}%, transparent ${focus + 6}% 100%), radial-gradient(ellipse at ${x2} ${y2}, transparent 0 ${Math.max(20, focus - 18)}%, ${b} ${Math.max(21, focus - 17)}% ${focus - 11}%, transparent ${focus - 10}% 100%), ${paper}`;
    case "blueprint":
      return `repeating-linear-gradient(${angle}, ${line} 0 1px, transparent 1px ${period}px), repeating-linear-gradient(${angle2}, ${line} 0 1px, transparent 1px ${period2}px), linear-gradient(${angle}, ${a}, transparent 36%), ${paper}`;
    case "torn-paper":
      return `linear-gradient(${angle} at ${x} ${y}, ${a} 0 ${band + 19}%, transparent ${band + 20}% 100%), repeating-linear-gradient(${angle2}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px), ${paper}`;
    case "spot-grid":
      return `radial-gradient(circle at ${x} ${y}, ${a} 0 ${focus}%, transparent ${focus + 1}%), radial-gradient(circle, ${line} 0 1px, transparent 1.5px) 0 0 / ${period}px ${period}px, ${paper}`;
    case "portal":
      return `radial-gradient(ellipse at ${x} ${y}, ${paper} 0 ${Math.max(18, focus - 20)}%, ${line} ${Math.max(19, focus - 19)}% ${Math.max(22, focus - 16)}%, transparent ${Math.max(23, focus - 15)}% 100%), linear-gradient(${angle}, ${a}, ${c})`;
    case "ribbon-stack":
      return `linear-gradient(${angle} at ${x} ${y}, transparent 0 ${band}%, ${a} ${band + 1}% ${band + 7}%, transparent ${band + 8}% ${band + 20}%, ${b} ${band + 21}% ${band + 27}%, transparent ${band + 28}% 100%), ${paper}`;
    case "signal-pulse":
      return `radial-gradient(circle at ${x} ${y}, ${a} 0 ${density + 6}px, transparent ${density + 7}px), repeating-radial-gradient(circle at ${x} ${y}, transparent 0 ${period}px, ${line} ${period + 1}px ${period + 2}px, transparent ${period + 3}px ${period2}px), ${paper}`;
    case "monochrome-noise":
      return `repeating-linear-gradient(${angle}, ${line} 0 1px, transparent 1px ${density + 6}px), repeating-linear-gradient(${angle2}, ${a} 0 1px, transparent 1px ${density + 11}px), ${paper}`;
    case "window-light":
      return `linear-gradient(${angle} at ${x} ${y}, ${a} 0 ${focus}%, transparent ${focus + 1}% 100%), linear-gradient(90deg, transparent 0 18%, ${line} 18.5% 19%, transparent 19.5% 81%, ${line} 81.5% 82%, transparent 82.5% 100%), ${paper}`;
    case "sun-disc":
      return `radial-gradient(circle at ${x} ${y}, ${a} 0 ${focus}%, transparent ${focus + 1}% 100%), linear-gradient(0deg, ${b} 0 ${band + 12}%, transparent ${band + 13}% 100%), ${paper}`;
    case "labyrinth":
      return `repeating-conic-gradient(from ${angle} at ${x} ${y}, ${line} 0 6%, transparent 6.5% 13%), repeating-linear-gradient(${angle2}, transparent 0 ${period}px, ${a} ${period + 1}px ${period + 2}px), ${paper}`;
    default:
      return `linear-gradient(${angle}, ${a}, ${c}), ${paper}`;
  }
}

export { backgroundCss, backgroundModes, createBackgroundProfile };
