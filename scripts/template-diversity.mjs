import { backgroundCss, createBackgroundProfile } from "./background-system.mjs";

const compositionModes = [
  {
    key: "rail",
    css: (scope) => `
      ${scope} .slide { border-left: calc(var(--profile-rule) * 1px) solid var(--accent); }
      ${scope} .section-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; }
      ${scope} .page-no { align-self: start; padding-top: 8px; }
    `,
  },
  {
    key: "split",
    css: (scope) => `
      ${scope} .hero-grid, ${scope} .compare { grid-template-columns: var(--profile-split) minmax(0, 1fr); }
      ${scope} .hero-grid .panel:first-child, ${scope} .compare .panel:first-child { min-height: calc(230px + var(--profile-lift) * 1px); }
    `,
  },
  {
    key: "poster",
    css: (scope) => `
      ${scope} .cover { justify-content: flex-end; padding-bottom: calc(var(--profile-pad) + 30px); }
      ${scope} .title, ${scope} .section-title { text-transform: uppercase; }
      ${scope} .section-head { align-items: end; }
      ${scope} .cover-copy { max-width: 900px; }
    `,
  },
  {
    key: "editorial",
    css: (scope) => `
      ${scope} .slide { border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line-strong); }
      ${scope} .section-head { align-items: end; }
      ${scope} .section-title { max-width: 880px; }
      ${scope} .panel, ${scope} .stat { background: transparent; }
    `,
  },
  {
    key: "dashboard",
    css: (scope) => `
      ${scope} .section-head { padding-bottom: 18px; border-bottom: 2px solid var(--accent); }
      ${scope} .stat-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      ${scope} .stat { min-height: calc(188px + var(--profile-lift) * 1px); }
      ${scope} .page-no { background: var(--accent); color: var(--paper); padding: 8px 10px; }
    `,
  },
  {
    key: "blueprint",
    css: (scope) => `
      ${scope} .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: var(--profile-grid) var(--profile-grid); }
      ${scope} .title, ${scope} .section-title, ${scope} .page-no { font-family: var(--sans); }
      ${scope} .panel, ${scope} .stat { border-style: dashed; background: color-mix(in srgb, var(--paper) 76%, transparent); }
    `,
  },
  {
    key: "catalog",
    css: (scope) => `
      ${scope} .section-head { display: grid; grid-template-columns: minmax(0, 1fr) 90px; gap: 22px; }
      ${scope} .page-no { border-top: 4px solid var(--accent); padding-top: 10px; text-align: right; }
      ${scope} .panel, ${scope} .stat { border-radius: 0; border-top: 5px solid var(--accent); }
      ${scope} .footer { border-top: 1px solid var(--line-strong); padding-top: 12px; }
    `,
  },
  {
    key: "manifest",
    css: (scope) => `
      ${scope} .section-head { flex-direction: column; gap: 18px; }
      ${scope} .page-no { order: -1; }
      ${scope} .section-title { max-width: 1040px; }
      ${scope} .hero-grid, ${scope} .compare { margin-top: calc(30px + var(--profile-lift) * 1px); }
    `,
  },
  {
    key: "asymmetric",
    css: (scope) => `
      ${scope} .section-head { padding-right: var(--profile-asym); }
      ${scope} .hero-grid, ${scope} .compare { grid-template-columns: 1.25fr .75fr; }
      ${scope} .hero-grid .panel:nth-child(2), ${scope} .compare .panel:nth-child(2) { transform: translateY(var(--profile-lift)); }
    `,
  },
  {
    key: "frame",
    css: (scope) => `
      ${scope} .slide { outline: var(--profile-rule) solid var(--line-strong); outline-offset: calc(var(--profile-rule) * -1px); }
      ${scope} .cover-art { right: calc(70px + var(--profile-lift) * 1px); }
      ${scope} .footer { padding-left: 12px; border-left: 3px solid var(--accent); }
    `,
  },
  {
    key: "stacked",
    css: (scope) => `
      ${scope} .hero-grid, ${scope} .compare { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
      ${scope} .hero-grid .panel:nth-child(2), ${scope} .compare .panel:nth-child(2) { margin-top: var(--profile-lift); }
      ${scope} .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    `,
  },
  {
    key: "columnar",
    css: (scope) => `
      ${scope} .section-head { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 28px; }
      ${scope} .kicker { writing-mode: vertical-rl; transform: rotate(180deg); margin: 0; }
      ${scope} .page-no { grid-column: 1; grid-row: 1; align-self: end; }
      ${scope} .section-head > div { grid-column: 2; grid-row: 1; }
    `,
  },
  {
    key: "offset",
    css: (scope) => `
      ${scope} .hero-grid, ${scope} .compare, ${scope} .steps { transform: translateX(var(--profile-offset)); }
      ${scope} .panel:nth-child(2n), ${scope} .step:nth-child(2n) { transform: translateY(var(--profile-lift)); }
      ${scope} .slide::before { background: linear-gradient(120deg, transparent 0 48%, color-mix(in srgb, var(--accent) 10%, transparent) 48% 49%, transparent 49%); }
    `,
  },
  {
    key: "orbital",
    css: (scope) => `
      ${scope} .cover-art { transform: rotate(var(--profile-angle)) scale(var(--profile-art-scale)); transform-origin: center; }
      ${scope} .orb-a { border-radius: 44% 56% 60% 40%; }
      ${scope} .orb-b { border-radius: 60% 40% 34% 66%; }
      ${scope} .section-head { border-radius: 999px; }
    `,
  },
  {
    key: "diagonal",
    css: (scope) => `
      ${scope} .slide::before { background: linear-gradient(var(--profile-angle), color-mix(in srgb, var(--accent) 15%, transparent), transparent 42%), var(--slide-overlay); }
      ${scope} .title, ${scope} .section-title { transform: skewX(-4deg); transform-origin: left center; }
      ${scope} .panel, ${scope} .stat { border-left: calc(4px + var(--profile-rule) * 1px) solid var(--accent); border-radius: 0; }
    `,
  },
  {
    key: "quiet",
    css: (scope) => `
      ${scope} .slide { padding-left: calc(var(--profile-pad) + 34px); padding-right: calc(var(--profile-pad) + 34px); }
      ${scope} .kicker, ${scope} .page-no { letter-spacing: .26em; }
      ${scope} .panel, ${scope} .stat { background: transparent; box-shadow: none; }
      ${scope} .section-lede, ${scope} .panel p { max-width: 660px; }
    `,
  },
  {
    key: "kinetic",
    css: (scope) => `
      ${scope} .title, ${scope} .section-title { transform: skewX(-8deg); transform-origin: left center; letter-spacing: -.09em; }
      ${scope} .page-no { transform: skewX(-8deg); }
      ${scope} .steps, ${scope} .stat-grid { gap: calc(var(--profile-gap) + 8px); }
      ${scope} .slide:not(.closing)::after { transform: skewX(-26deg) rotate(var(--profile-angle)); }
    `,
  },
  {
    key: "grid",
    css: (scope) => `
      ${scope} .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: var(--profile-grid) var(--profile-grid); }
      ${scope} .section-head, ${scope} .hero-grid, ${scope} .compare, ${scope} .steps { position: relative; }
      ${scope} .panel, ${scope} .stat, ${scope} .step { border-radius: 0; }
    `,
  },
  {
    key: "window",
    css: (scope) => `
      ${scope} .panel, ${scope} .stat { border: 1px solid var(--line-strong); box-shadow: inset 0 0 0 8px color-mix(in srgb, var(--accent-soft) 42%, transparent); }
      ${scope} .section-head { padding: 18px 20px; border: 1px solid var(--line-strong); background: color-mix(in srgb, var(--panel) 55%, transparent); }
      ${scope} .hero-grid, ${scope} .compare { margin-top: 28px; }
    `,
  },
  {
    key: "monolith",
    css: (scope) => `
      ${scope} .slide { background: var(--ink); color: var(--paper); }
      ${scope} .section-lede, ${scope} .panel p, ${scope} .stat .label, ${scope} .footer { color: color-mix(in srgb, var(--paper) 68%, transparent); }
      ${scope} .panel, ${scope} .stat { border-color: color-mix(in srgb, var(--paper) 28%, transparent); background: transparent; }
      ${scope} .title em, ${scope} .section-title { color: var(--paper); }
    `,
  },
  {
    key: "air",
    css: (scope) => `
      ${scope} .slide { padding-top: calc(var(--profile-pad) + 22px); padding-bottom: calc(var(--profile-pad) + 22px); }
      ${scope} .hero-grid, ${scope} .compare, ${scope} .steps { margin-top: calc(52px + var(--profile-lift) * 1px); }
      ${scope} .panel, ${scope} .stat, ${scope} .step { padding: calc(30px + var(--profile-lift) * .2px); }
    `,
  },
  {
    key: "dense",
    css: (scope) => `
      ${scope} .slide { padding: calc(var(--profile-pad) - 16px) calc(var(--profile-pad) - 12px); }
      ${scope} .hero-grid, ${scope} .compare, ${scope} .steps, ${scope} .stat-grid { gap: calc(var(--profile-gap) - 8px); margin-top: 28px; }
      ${scope} .panel, ${scope} .stat, ${scope} .step { padding: 22px; }
    `,
  },
  {
    key: "captioned",
    css: (scope) => `
      ${scope} .kicker { display: inline-flex; padding: 6px 10px; border: 1px solid var(--accent); }
      ${scope} .section-title { max-width: 980px; }
      ${scope} .footer { font-size: 12px; letter-spacing: .16em; }
      ${scope} .panel .label, ${scope} .stat .label { border-bottom: 1px solid var(--line); padding-bottom: 8px; }
    `,
  },
  {
    key: "ledger",
    css: (scope) => `
      ${scope} .slide { background-image: repeating-linear-gradient(0deg, transparent 0 40px, color-mix(in srgb, var(--line) 72%, transparent) 41px 42px); }
      ${scope} .section-head { border-bottom: 1px solid var(--line-strong); padding-bottom: 14px; }
      ${scope} .panel, ${scope} .stat { border: 0; border-bottom: 1px solid var(--line-strong); border-radius: 0; background: transparent; }
    `,
  },
  {
    key: "zigzag",
    css: (scope) => `
      ${scope} .panel:nth-child(odd), ${scope} .step:nth-child(odd), ${scope} .stat:nth-child(odd) { transform: translateY(calc(var(--profile-lift) * -1px)); }
      ${scope} .panel:nth-child(even), ${scope} .step:nth-child(even), ${scope} .stat:nth-child(even) { transform: translateY(var(--profile-lift)); }
      ${scope} .hero-grid, ${scope} .compare, ${scope} .steps, ${scope} .stat-grid { align-items: center; }
    `,
  },
  {
    key: "archival",
    css: (scope) => `
      ${scope} .slide { background-image: linear-gradient(90deg, transparent 0 11%, color-mix(in srgb, var(--accent) 12%, transparent) 11.1% 11.2%, transparent 11.3%), linear-gradient(0deg, transparent 0 88%, color-mix(in srgb, var(--line-strong) 72%, transparent) 88.1% 88.2%, transparent 88.3%); }
      ${scope} .title, ${scope} .section-title { font-family: var(--serif); font-weight: 500; }
      ${scope} .panel, ${scope} .stat { border: 1px solid var(--line-strong); border-radius: 0; box-shadow: none; }
    `,
  },
  {
    key: "signal",
    css: (scope) => `
      ${scope} .section-head { border-left: 8px solid var(--accent); padding-left: 18px; }
      ${scope} .title em, ${scope} .section-title, ${scope} .value, ${scope} .signal-value { color: var(--accent); }
      ${scope} .panel, ${scope} .stat { border: 0; border-left: 6px solid var(--accent); border-radius: 0; }
    `,
  },
  {
    key: "modular",
    css: (scope) => `
      ${scope} .panel, ${scope} .stat, ${scope} .step { border: 1px solid var(--line-strong); border-radius: var(--profile-radius); box-shadow: none; }
      ${scope} .hero-grid, ${scope} .compare, ${scope} .steps, ${scope} .stat-grid { gap: var(--profile-gap); }
      ${scope} .section-title { max-width: calc(760px + var(--profile-lift) * 8px); }
    `,
  },
  {
    key: "stair",
    css: (scope) => `
      ${scope} .steps { grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: end; }
      ${scope} .step:nth-child(1) { transform: translateY(24px); }
      ${scope} .step:nth-child(2) { transform: translateY(16px); }
      ${scope} .step:nth-child(3) { transform: translateY(8px); }
      ${scope} .step:nth-child(4) { transform: translateY(0); }
      ${scope} .section-head { padding-bottom: 12px; border-bottom: 4px solid var(--accent); }
    `,
  },
  {
    key: "radial",
    css: (scope) => `
      ${scope} .slide { background-image: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 13%, transparent) 0 10%, transparent 10.4% 24%, color-mix(in srgb, var(--line) 55%, transparent) 24.2% 24.4%, transparent 24.6%); }
      ${scope} .section-head { text-align: center; }
      ${scope} .section-head > div { margin-inline: auto; }
      ${scope} .page-no { align-self: center; }
      ${scope} .panel, ${scope} .stat { border-radius: 999px 18px 999px 18px; }
    `,
  },
  {
    key: "notched",
    css: (scope) => `
      ${scope} .panel, ${scope} .stat { border-radius: 0; border: 2px solid var(--ink); clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%); }
      ${scope} .section-head { padding-right: 26px; border-right: 6px solid var(--accent); }
      ${scope} .footer { border-right: 6px solid var(--accent); padding-right: 12px; }
    `,
  },
  {
    key: "gallery",
    css: (scope) => `
      ${scope} .cover-art { right: 30px; top: 36px; transform: scale(.78); }
      ${scope} .section-head { padding: 16px 20px; background: color-mix(in srgb, var(--panel) 72%, transparent); }
      ${scope} .hero-grid, ${scope} .compare { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      ${scope} .panel, ${scope} .stat { border: 1px solid var(--line-strong); border-radius: 2px; }
    `,
  },
];

const copyPacks = [
  {
    cover: "A distinct visual grammar gives the <em>next idea somewhere to land.</em>",
    lede: "A reusable system for agents that need a point of view, a readable sequence, and portable handoff artifacts.",
    thesis: "A page becomes memorable when its visual decision is impossible to miss.",
    thesisLede:
      "Let structure, type, and rhythm establish the reading path before detail competes for attention.",
    statement: "Give the important idea <em>a visible edge.</em>",
  },
  {
    cover: "Make the visual system carry the <em>weight of the argument.</em>",
    lede: "A presentation starting point for stories that need a clear stance, a strong sequence, and dependable exports.",
    thesis: "The strongest page tells the reader how to enter the idea.",
    thesisLede:
      "Use hierarchy as an invitation: first the subject, then the proof, then the consequence.",
    statement: "Put the essential thing <em>in the first glance.</em>",
  },
  {
    cover: "A good composition turns a complex thought into a <em>shared starting point.</em>",
    lede: "An HTML-first deck system for shaping content, testing rhythm, and handing the result to the next person.",
    thesis: "Every visual choice should answer a question about attention.",
    thesisLede:
      "The page earns trust when its focal point, supporting evidence, and next move stay in proportion.",
    statement: "Let the key signal <em>change the shape.</em>",
  },
  {
    cover: "The right visual rhythm lets the <em>story move without noise.</em>",
    lede: "A distinct template for turning briefs into inspectable pages, rendered examples, and editable handoffs.",
    thesis: "Clarity is not empty space; it is a deliberate order of signals.",
    thesisLede:
      "Give each layer a job so the audience can move from orientation to evidence without decoding the page.",
    statement: "Make the reading path <em>feel inevitable.</em>",
  },
  {
    cover: "Design can make the next decision <em>feel closer than the last one.</em>",
    lede: "A visual system for AI-assisted composition where structure, atmosphere, and export quality remain visible together.",
    thesis: "A visual system is useful when it changes what the audience can do next.",
    thesisLede:
      "Treat style as a practical choice about pace, trust, context, and the amount of attention the room can give.",
    statement: "Let the next move <em>have a place.</em>",
  },
  {
    cover: "When the form is specific, the <em>message travels further.</em>",
    lede: "A composed starting point for stories that need character without sacrificing a reliable source-to-artifact workflow.",
    thesis: "The page should reveal its point before it reveals its machinery.",
    thesisLede:
      "Lead with the signal, keep the context nearby, and let the visual grammar make the sequence legible.",
    statement: "Give the story a <em>recognizable pulse.</em>",
  },
  {
    cover: "A template is a small stage for a <em>large idea.</em>",
    lede: "A portable slide system for shaping narrative, evidence, and handoff into one inspectable visual object.",
    thesis: "Composition is the bridge between what is known and what must be decided.",
    thesisLede:
      "Use contrast, spacing, and sequence to help the audience cross that bridge at the right pace.",
    statement: "Give the central idea <em>room to perform.</em>",
  },
  {
    cover: "The page should feel like a <em>decision already taking shape.</em>",
    lede: "A deliberately authored deck source for agents, designers, and reviewers who need the visual logic to stay inspectable.",
    thesis: "A clear hierarchy turns a collection of facts into an experience.",
    thesisLede:
      "Make the first read generous, the second read useful, and the final action easy to name.",
    statement: "Turn attention into <em>a next step.</em>",
  },
];

function hashString(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createDiversityProfile(template, index) {
  const seed = hashString(`${template.name}:${index}`);
  const mode = compositionModes[(seed + index * 11) % compositionModes.length];
  const background = createBackgroundProfile(template, index);
  const copy = copyPacks[(seed + index * 3) % copyPacks.length];
  const variant = (seed + index * 17) % 97;
  const pad = 64 + (seed % 21);
  const gap = 16 + ((seed >>> 4) % 25);
  const lift = 4 + ((seed >>> 9) % 25);
  const titleScale = 0.86 + ((seed >>> 14) % 29) / 100;
  const split = (0.72 + ((seed >>> 19) % 37) / 100).toFixed(2);
  const radius = 4 + ((seed >>> 24) % 40);
  const grid = 24 + ((seed >>> 6) % 25);
  const profileId = `${String(index + 1).padStart(4, "0")}-${template.name}`;
  const token = `${mode.key}-${variant.toString(36)}-${(seed >>> 1).toString(36)}`;
  return {
    background,
    backgroundSignature: background.signature,
    copy,
    gap,
    grid,
    id: profileId,
    index,
    lift,
    mode,
    pad,
    radius,
    seed,
    signature: `${mode.key}|${variant}|${pad}|${gap}|${lift}|${titleScale.toFixed(2)}|${split}|${radius}|${grid}|${token}`,
    split,
    titleScale: titleScale.toFixed(2),
    token,
  };
}

function diversityCss(profile) {
  const scope = `body[data-pl-profile="${profile.id}"]`;
  const background = profile.background;
  const angle = `${-18 + (profile.seed % 37)}deg`;
  const artScale = (0.78 + ((profile.seed >>> 7) % 33) / 100).toFixed(2);
  const asym = `${160 + ((profile.seed >>> 11) % 160)}px`;
  const offset = `${-12 + ((profile.seed >>> 16) % 25)}px`;
  return `
    ${scope} {
      --profile-pad: ${profile.pad}px;
      --profile-gap: ${profile.gap}px;
      --profile-lift: ${profile.lift}px;
      --profile-radius: ${profile.radius}px;
      --profile-rule: ${2 + (profile.seed % 7)};
      --profile-grid: ${profile.grid}px;
      --profile-split: ${profile.split}fr;
      --profile-title-scale: ${profile.titleScale};
      --profile-angle: ${angle};
      --profile-art-scale: ${artScale};
      --profile-asym: ${asym};
      --profile-offset: ${offset};
      --profile-bg-a: color-mix(in srgb, var(--accent) ${background.opacity}%, transparent);
      --profile-bg-b: color-mix(in srgb, var(--accent-deep) ${Math.max(8, Math.round(background.opacity * 0.72))}%, transparent);
      --profile-bg-c: color-mix(in srgb, var(--accent-soft) ${Math.min(70, background.contrast)}%, transparent);
      --profile-bg-line: color-mix(in srgb, var(--ink) ${Math.max(5, Math.round(background.opacity * 0.45))}%, transparent);
    }
    ${scope} .slide { padding: var(--profile-pad); }
    ${scope} .title { font-size: calc(76px * var(--profile-title-scale)); }
    ${scope} .section-title { font-size: calc(62px * var(--profile-title-scale)); }
    ${scope} .hero-grid, ${scope} .compare { gap: var(--profile-gap); }
    ${scope} .stat-grid, ${scope} .steps { gap: var(--profile-gap); }
    ${scope} .panel, ${scope} .stat, ${scope} .step { border-radius: var(--profile-radius); }
    ${scope} .composition-mark { position: absolute; right: calc(var(--profile-pad) * .6); top: calc(var(--profile-pad) * .55); width: calc(16px + var(--profile-rule) * 2px); height: calc(16px + var(--profile-rule) * 2px); border: 1px solid var(--accent); border-radius: var(--profile-radius); opacity: .44; pointer-events: none; }
    ${scope} .composition-mark::after { position: absolute; right: calc(var(--profile-rule) * -2px); bottom: calc(var(--profile-rule) * -2px); width: 100%; height: 100%; border: 1px solid var(--accent-soft); content: ""; transform: rotate(var(--profile-angle)); }
    ${scope} .slide > *:not(.composition-mark):not(.cover-art) { position: relative; z-index: 1; }
    ${profile.mode.css(scope)}
    ${scope} .slide::before {
      background: ${backgroundCss(background)};
      background-blend-mode: ${background.blend};
      background-position: ${background.x}% ${background.y}%;
      background-repeat: repeat;
      background-size: ${background.scale}px ${background.scale}px;
    }
  `;
}

function decorateSlides(html, profile) {
  let slideIndex = 0;
  const decorated = html.replace(
    /<section class="slide([^"]*)" data-pl-slide data-slide-id="([^"]+)"([^>]*)>/g,
    (match, classes, slideId, attributes) => {
      const slot = String(slideIndex++).padStart(2, "0");
      const token = `${profile.token}-${slot}`;
      return `<section class="slide${classes} composition-${profile.mode.key} composition-slot-${slideIndex % 12}" data-pl-slide data-slide-id="${slideId}" data-template-profile="${profile.id}" data-diversity-token="${token}" data-diversity-signature="${profile.signature}"${attributes}><span class="composition-mark" aria-hidden="true"></span>`;
    },
  );
  if (slideIndex !== 45) {
    throw new Error(`${profile.id} expected 45 decorated slides, found ${slideIndex}.`);
  }
  return decorated;
}

function diversifyContent(html, profile) {
  return html
    .replaceAll(
      "A strong visual system makes the <em>story easier to follow.</em>",
      profile.copy.cover,
    )
    .replaceAll(
      "A reusable HTML-first template for AI agents that need polished slides, printable pages, and reliable handoff artifacts.",
      profile.copy.lede,
    )
    .replaceAll("One clear claim gives the slide its shape.", profile.copy.thesis)
    .replaceAll(
      "The layout keeps the main idea visible while the supporting detail stays close enough to scan.",
      profile.copy.thesisLede,
    )
    .replaceAll("Make the important thing <em>easy to see.</em>", profile.copy.statement)
    .replaceAll("Make the next idea <em>impossible to miss.</em>", profile.copy.cover)
    .replaceAll(
      "A narrative-first starting point for a deck that earns attention, shows proof, and leaves the next move easy to name.",
      profile.copy.lede,
    )
    .replaceAll("One decisive idea per slide.", profile.copy.thesis)
    .replaceAll("The rest of the page earns the second glance.", profile.copy.thesisLede)
    .replaceAll("Make the next move <em>visible.</em>", profile.copy.statement);
}

export { createDiversityProfile, decorateSlides, diversifyContent, diversityCss };
