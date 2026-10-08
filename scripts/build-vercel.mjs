import { cp, mkdir, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = process.env.PRESENTLAB_BUILD_OUTPUT
  ? resolve(process.env.PRESENTLAB_BUILD_OUTPUT)
  : join(root, "public");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const assets = [
  ["web/portal", "web/portal"],
  ["web/vendor/three", "web/vendor/three"],
  ["web/portal/index.html", "index.html"],
  ["web/portal/index.html", "portal/index.html"],
  ["resources/templates/index.json", "resources/templates/index.json"],
  ["resources/palettes/index.json", "resources/palettes/index.json"],
  ["resources/palettes/catalog.html", "resources/palettes/catalog.html"],
  ["web/lusion/assets", "assets"],
  ["web/lusion/_astro", "_astro"],
  // Keep the current deployed URL while keeping first-party code outside generated bundles.
  ["web/lusion/scripts/site-overrides.js", "_astro/local-only.js"],
  ["web/lusion/about", "about"],
  ["web/lusion/projects", "projects"],
  ["web/lusion/home-scroll.css", "home-scroll.css"],
  ["web/lusion/xlab-chrome.css", "xlab-chrome.css"],
];

for (const [source, destination] of assets) {
  const target = join(output, destination);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, source), target, { recursive: true, force: true });
}

const xlabPageRoots = [join(output, "about"), join(output, "projects")];
const findHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
};
const xlabPageFiles = (await Promise.all(xlabPageRoots.map(findHtmlFiles))).flat();
const replaceBrandText = (text) =>
  text
    .replace(/hello@lusion\.co/gi, "Contact XLab")
    .replace(/business@lusion\.co/gi, "Business inquiries")
    .replace(/R&D:\s*labs\.lusion\.co/gi, "XLab R&D")
    .replace(
      "We create 3D visual storytelling and interactive web experiences that help brands stand out",
      "We create bold presentation slides and visual stories that help ideas stand out",
    )
    .replace(/\bLusion\b/gi, "XLab");
const headerLogoPattern = /(<a\b[^>]*id="header-logo"[^>]*>)[\s\S]*?(<\/a>)/gi;
const headerLogo =
  '$1<span class="xlab-logo-crop" aria-hidden="true"><img src="/web/portal/xlab-logo.webp" alt="" decoding="async"></span>$2';
const projectCardLinkPattern =
  /<a\b(?=[^>]*\bclass="[^"]*\bproject-item\b[^"]*")([^>]*)>([\s\S]*?)<\/a>/gi;
const labsMenuLinkPattern = /<a\b(?=[^>]*\bid="header-menu-labs")[^>]*>[\s\S]*?<\/a>/i;
for (const pagePath of xlabPageFiles) {
  let html = await readFile(pagePath, "utf8");
  const logos = html.match(headerLogoPattern);
  if (!logos || logos.length !== 1) {
    throw new Error(`Expected one Lusion header logo in ${pagePath}.`);
  }
  if (!labsMenuLinkPattern.test(html)) {
    throw new Error(`Expected one Labs menu link in ${pagePath}.`);
  }
  html = html.replace(labsMenuLinkPattern, "");
  html = html.replace(headerLogoPattern, headerLogo);
  html = html.replace(projectCardLinkPattern, (_match, attributes, content) => {
    const nonLinkAttributes = attributes.replace(/\s+href=(?:"[^"]*"|'[^']*')/i, "");
    return `<div${nonLinkAttributes}>${content}</div>`;
  });
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const content = tag.match(/\bcontent=(["'])(.*?)\1/i);
    if (!content) return tag;
    if (/^(?:https?:\/\/|mailto:)/i.test(content[2])) return tag;
    const updated = replaceBrandText(content[2]).replaceAll(
      "/assets/meta/social_sharing.jpg",
      "/assets/meta/social_sharing_xlab.png",
    );
    return tag.replace(content[0], `content=${content[1]}${updated}${content[1]}`);
  });
  html = html.replace(
    /\b(aria-label|alt|title)=("|')(.*?)\2/gi,
    (_match, name, quote, value) => `${name}=${quote}${replaceBrandText(value)}${quote}`,
  );
  html = html.replace(/>([^<>]*)</g, (_match, text) => `>${replaceBrandText(text)}<`);
  html = html.replace(/\bhref=("|')\/\1/gi, (_match, quote) => `href=${quote}/lusion/${quote}`);
  await writeFile(pagePath, html);
}

let lusionHomeSource = await readFile(join(root, "web/lusion/index.html"), "utf8");
const homeLogos = lusionHomeSource.match(headerLogoPattern);
if (!homeLogos || homeLogos.length !== 1) {
  throw new Error("Expected one Lusion header logo in the Portal section source.");
}
if (!labsMenuLinkPattern.test(lusionHomeSource)) {
  throw new Error("Expected one Labs menu link in the Portal section source.");
}
lusionHomeSource = lusionHomeSource.replace(labsMenuLinkPattern, "");
lusionHomeSource = lusionHomeSource.replace(headerLogoPattern, headerLogo);
lusionHomeSource = lusionHomeSource.replace(
  /\b(aria-label|alt|title)=("|')(.*?)\2/gi,
  (_match, name, quote, value) => `${name}=${quote}${replaceBrandText(value)}${quote}`,
);
lusionHomeSource = lusionHomeSource.replace(
  />([^<>]*)</g,
  (_match, text) => `>${replaceBrandText(text)}<`,
);
lusionHomeSource = lusionHomeSource.replace(
  /\bhref=("|')\/\1/gi,
  (_match, quote) => `href=${quote}/lusion/${quote}`,
);
const lusionBody = lusionHomeSource.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
if (!lusionBody) {
  throw new Error("The local Lusion home page is missing its body.");
}
const lusionHomeRoute = join(output, "lusion", "index.html");
await mkdir(dirname(lusionHomeRoute), { recursive: true });
await writeFile(lusionHomeRoute, lusionHomeSource);

const retiredShareImage = join(output, "assets", "meta", "social_sharing.jpg");
await unlink(retiredShareImage);
const siteOverridesPath = join(output, "_astro", "local-only.js");
const siteOverrides = (await readFile(siteOverridesPath, "utf8")).replaceAll(
  "Lusion Reel",
  "XLab Reel",
);
const lusionStylesPath = join(output, "_astro", "about.CNa9RfUh.css");
let lusionStyles = await readFile(lusionStylesPath, "utf8");
const blockingFontFaceCount = lusionStyles.split("font-display:block").length - 1;
if (blockingFontFaceCount !== 6) {
  throw new Error(
    `Expected six blocking Lusion font declarations, found ${blockingFontFaceCount}.`,
  );
}
lusionStyles = lusionStyles.replaceAll("font-display:block", "font-display:swap");
// The About title uses WebGL geometry anchored to its SVG, so hiding the SVG alone
// leaves the wordmark visible. Collapse the anchor and reserve the cue's lower-right box.
lusionStyles +=
  "#about-who-title-main{aspect-ratio:191.553/38.502}" +
  "#about-who-title-main-logo{position:absolute!important;width:0!important;height:0!important;visibility:hidden!important}" +
  "#about-who-title-main-scroll{right:0;bottom:0;transform:none}";
await writeFile(lusionStylesPath, lusionStyles);

for (const portalPagePath of [join(output, "index.html"), join(output, "portal", "index.html")]) {
  let portalHtml = await readFile(portalPagePath, "utf8");
  const placeholder = '<div class="lusion-home-content" data-lusion-home-content></div>';
  if (portalHtml.split(placeholder).length - 1 !== 1) {
    throw new Error(`Expected one direct Lusion section placeholder in ${portalPagePath}.`);
  }
  portalHtml = portalHtml.replace(
    placeholder,
    '<div class="lusion-home-content" data-lusion-home-content>' +
      '<iframe class="lusion-home-frame" data-lusion-home-frame title="XLab interactive home" src="/lusion/?water-page-embed" loading="eager" allow="autoplay; fullscreen"></iframe>' +
      "</div>",
  );
  if (portalHtml.split('src="/lusion/?water-page-embed"').length - 1 !== 1) {
    throw new Error(`Expected one same-origin Lusion iframe in ${portalPagePath}.`);
  }
  const portalAppScript = '<script type="module" src="/web/portal/app.js"></script>';
  if (portalHtml.split(portalAppScript).length - 1 !== 1) {
    throw new Error(`Expected one Portal app entry in ${portalPagePath}.`);
  }
  await writeFile(portalPagePath, portalHtml);
}

const siteOverridesAst = ts.createSourceFile(
  "site-overrides.js",
  siteOverrides,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.JS,
);
let languagePackDeclaration;
const findLanguagePackDeclaration = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === "languagePack"
  ) {
    languagePackDeclaration = node;
    return;
  }
  ts.forEachChild(node, findLanguagePackDeclaration);
};
findLanguagePackDeclaration(siteOverridesAst);
if (!languagePackDeclaration?.initializer) {
  throw new Error("The site override language pack could not be found.");
}
const parseStaticLocaleData = (node) => {
  if (ts.isObjectLiteralExpression(node)) {
    const object = Object.create(null);
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        throw new Error("The site override language pack must use static properties.");
      }
      const key = ts.isIdentifier(property.name)
        ? property.name.text
        : ts.isStringLiteralLike(property.name)
          ? property.name.text
          : null;
      if (!key || Object.hasOwn(object, key)) {
        throw new Error("The site override language pack contains an unsupported key.");
      }
      object[key] = parseStaticLocaleData(property.initializer);
    }
    return object;
  }
  if (ts.isStringLiteralLike(node)) return node.text;
  throw new Error("The site override language pack must contain only static text objects.");
};
const languagePack = parseStaticLocaleData(languagePackDeclaration.initializer);
const originalHomeHero =
  "We create 3D visual storytelling and interactive web experiences that help brands stand out";
const xlabHomeHero =
  "We create bold presentation slides and visual stories that help ideas stand out";
const localeOverrides = {
  vi: {
    "Contact XLab": "Liên hệ",
    "Business inquiries": "Yêu cầu hợp tác",
    "XLab R&D": "XLab · Nghiên cứu và phát triển",
  },
  "zh-CN": {
    "Contact XLab": "联系 XLab",
    "Business inquiries": "商务合作咨询",
    "XLab R&D": "XLab 研发",
  },
};
const localeTextCorrections = {
  vi: [
    ["Awwards HM", "Awwwards HM"],
    ["Github", "GitHub"],
  ],
  "zh-CN": [
    ["网页GL", "WebGL"],
    ["吉图布", "GitHub"],
    ["网络增强现实", "WebAR"],
    ["网络XR", "WebXR"],
    ["奖项 HM", "Awwwards HM"],
  ],
};
const rebrandTranslation = (translation) =>
  translation.replace(/(?<![\w@.])Lusion(?!\.\w+\b|\w)/gi, "XLab");
const correctTranslation = (locale, translation) =>
  (localeTextCorrections[locale] || []).reduce(
    (result, [incorrect, corrected]) => result.replaceAll(incorrect, corrected),
    translation,
  );
for (const [locale, dictionary] of Object.entries(languagePack)) {
  if (!dictionary[xlabHomeHero]) {
    throw new Error(`The XLab homepage hero is missing its ${locale} translation.`);
  }
  const brandedDictionary = Object.create(null);
  for (const [sourceText, translation] of Object.entries(dictionary)) {
    if (sourceText === originalHomeHero || sourceText.trim().length <= 1) continue;
    const brandedSource = replaceBrandText(sourceText);
    if (Object.hasOwn(brandedDictionary, brandedSource)) {
      throw new Error(
        `The ${locale} translation key collides after XLab branding: ${brandedSource}`,
      );
    }
    brandedDictionary[brandedSource] = correctTranslation(locale, rebrandTranslation(translation));
  }
  for (const [sourceText, translation] of Object.entries(localeOverrides[locale] || {})) {
    brandedDictionary[sourceText] = translation;
  }
  languagePack[locale] = brandedDictionary;
}
const escapedLanguagePack = JSON.stringify(languagePack).replace(
  /[\u0080-\uFFFF]/g,
  (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
);
const initializer = languagePackDeclaration.initializer;
const localizedSiteOverrides =
  siteOverrides.slice(0, initializer.getStart(siteOverridesAst)) +
  escapedLanguagePack +
  siteOverrides.slice(initializer.end);
const astronautHeaderStateRuntime = `
(() => {
  const style = document.createElement("style");
  style.textContent =
    "html.is-xlab-astronaut-scene #header-logo," +
    "html.is-xlab-astronaut-scene #header-right-menu-btn," +
    "html.is-xlab-astronaut-scene #lusion-language-trigger," +
    "html.is-xlab-astronaut-scene #header-menu{" +
    "visibility:hidden!important;opacity:0!important;pointer-events:none!important}" +
    "html:not(.is-lusion-preloading):not(.is-xlab-astronaut-scene) #lusion-language-trigger{" +
    "visibility:visible!important;opacity:1!important;clip-path:none!important}";
  document.head.appendChild(style);

  const attach = () => {
    const pageContainer = document.getElementById("page-container");
    const homeGoal = document.getElementById("home-goal");
    const aboutDescription = document.getElementById("about-who-desc-top");
    if (
      !pageContainer ||
      !homeGoal ||
      !aboutDescription
    ) {
      return false;
    }

    const syncVisibility = () => {
      const transform = getComputedStyle(pageContainer).transform;
      const matrix = /^matrix(3d)?\\((.+)\\)$/.exec(transform);
      const values = matrix ? matrix[2].split(",").map(Number) : [];
      const translateY = matrix ? values[matrix[1] ? 13 : 5] : 0;
      if (!Number.isFinite(translateY)) return;

      const viewportHeight = window.innerHeight;
      const homeGoalRect = homeGoal.getBoundingClientRect();
      const aboutDescriptionRect = aboutDescription.getBoundingClientRect();
      const start = homeGoalRect.top - translateY;
      const headerClearance = Math.min(
        132,
        Math.max(88, viewportHeight * 0.175),
      );
      const end = aboutDescriptionRect.top - translateY - headerClearance;
      const scrollPixel = -translateY;
      document.documentElement.classList.toggle(
        "is-xlab-astronaut-scene",
        scrollPixel >= start && scrollPixel < end,
      );
    };

    const observer = new MutationObserver(syncVisibility);
    observer.observe(pageContainer, {
      attributes: true,
      attributeFilter: ["style"],
    });
    window.addEventListener("resize", syncVisibility, { passive: true });
    syncVisibility();
    return true;
  };

  if (!attach()) {
    document.addEventListener("DOMContentLoaded", attach, { once: true });
  }
})();
`;
const responsiveHeroTypeRuntime = `
(() => {
  const style = document.createElement("style");
  style.textContent =
    "@media (min-width:561px) and (max-width:812px){" +
    "html[lang] body #home-hero-title{font-size:clamp(30px,4.8vw,36px)!important;line-height:1.08!important}" +
    "html[lang] body #home-hero-title .line{line-height:inherit!important;overflow:visible!important}" +
    "}";
  document.head.appendChild(style);
})();
`;
// The About scroll cue is only readable on the intro screen: hide it as soon as
// the viewport moves past the wordmark, and whenever the intro is not shown.
const aboutScrollCueVisibilityRuntime = `
(() => {
  const attach = () => {
    const cue = document.getElementById("about-who-title-main-scroll");
    const intro = document.getElementById("about-who-subsection-we-are");
    const homeGoal = document.getElementById("home-goal");
    if (!cue || !intro || !homeGoal) return false;

    const syncCue = () => {
      const rect = intro.getBoundingClientRect();
      window.__XLAB_ABOUT_SCROLL_CUE_VISIBLE__ =
        rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const observer = new MutationObserver(syncCue);
    observer.observe(intro, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("resize", syncCue, { passive: true });
    window.addEventListener("scroll", syncCue, { passive: true });
    syncCue();
    return true;
  };

  if (!attach()) {
    document.addEventListener("DOMContentLoaded", attach, { once: true });
  }
})();
`;
await writeFile(
  siteOverridesPath,
  localizedSiteOverrides +
    astronautHeaderStateRuntime +
    responsiveHeroTypeRuntime +
    aboutScrollCueVisibilityRuntime,
);

const lusionBundlePath = join(output, "_astro", "hoisted.CUO_IjfL.js");
let lusionBundle = await readFile(lusionBundlePath, "utf8");
for (const [source, replacement] of [
  [
    "const settings=new Settings;var commonjsGlobal$1",
    "const settings=new Settings;settings.USE_AUDIO=!1;var commonjsGlobal$1",
  ],
  [
    'this.containers.forEach((e,t)=>{e.style.setProperty("--open-delay",t/50+"s"),e.style.setProperty("--close-delay",Math.abs(t-this.containers.length)/50+"s")})',
    'this.containers.filter(Boolean).forEach((e,t)=>{e.style.setProperty("--open-delay",t/50+"s"),e.style.setProperty("--close-delay",Math.abs(t-this.containers.length)/50+"s")})',
  ],
]) {
  if (!lusionBundle.includes(source)) {
    throw new Error("The copied Lusion bundle no longer matches the runtime patch.");
  }
  lusionBundle = lusionBundle.replace(source, replacement);
}
for (const [source, replacement] of [
  ['color0:"#5a90ff",color1:"#2a38ee"', 'color0:"#57b5b4",color1:"#237478"'],
  ['color0:"#94fffb",color1:"#1285dc"', 'color0:"#57b5b4",color1:"#237478"'],
]) {
  if (lusionBundle.split(source).length - 1 !== 1) {
    throw new Error("Expected one blue Lusion line palette to recolor.");
  }
  lusionBundle = lusionBundle.replace(source, replacement);
}
const browserZoomGuard = [
  "function preventZoom(o){o.preventDefault(),document.body.style.zoom=1}",
  'window.addEventListener("wheel",o=>o.preventDefault(),{passive:!1});',
  'document.addEventListener("gesturestart",o=>preventZoom(o));',
  'document.addEventListener("gesturechange",o=>preventZoom(o));',
  'document.addEventListener("gestureend",o=>preventZoom(o));',
].join("");
const browserZoomSupport =
  'window.addEventListener("wheel",o=>{o.ctrlKey||o.preventDefault()},{passive:!1});';
if (lusionBundle.split(browserZoomGuard).length - 1 !== 1) {
  throw new Error(
    "The copied Lusion zoom guard no longer matches the browser accessibility patch.",
  );
}
lusionBundle = lusionBundle.replace(browserZoomGuard, browserZoomSupport);
const scrollIndicatorInitSource =
  'domScrollIndicatorBar:document.getElementById("scroll-indicator-bar")})}resize(e,t){';
const scrollIndicatorInitReplacement = `domScrollIndicatorBar:document.getElementById("scroll-indicator-bar")}),
this._initScrollIndicatorDrag()
}
_initScrollIndicatorDrag() {
  const indicator = this.domScrollIndicator;
  const bar = this.domScrollIndicatorBar;
  this.scrollIndicatorDragOffset = 0;
  const stopDragging = () => {
    indicator.classList.remove("is-dragging");
    bar.classList.remove("is-dragging");
  };
  indicator.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !this.isMoveable) return;
    event.preventDefault();
    event.stopPropagation();
    const trackBounds = indicator.getBoundingClientRect();
    const barBounds = bar.getBoundingClientRect();
    this.scrollIndicatorDragOffset = bar.contains(event.target)
      ? event.clientY - barBounds.top
      : barBounds.height / 2;
    indicator.setPointerCapture(event.pointerId);
    indicator.classList.add("is-dragging");
    bar.classList.add("is-dragging");
    const travel = Math.max(0, trackBounds.height - barBounds.height);
    if (travel > 0) {
      this.scrollToPixel(
        (math.clamp(
          event.clientY - trackBounds.top - this.scrollIndicatorDragOffset,
          0,
          travel,
        ) /
          travel) *
          this.contentSizePixel,
        !0,
      );
    }
  });
  indicator.addEventListener("pointermove", (event) => {
    if (!indicator.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    event.stopPropagation();
    const trackBounds = indicator.getBoundingClientRect();
    const barBounds = bar.getBoundingClientRect();
    const travel = Math.max(0, trackBounds.height - barBounds.height);
    if (travel > 0) {
      this.scrollToPixel(
        (math.clamp(
          event.clientY - trackBounds.top - this.scrollIndicatorDragOffset,
          0,
          travel,
        ) /
          travel) *
          this.contentSizePixel,
        !0,
      );
    }
  });
  indicator.addEventListener("pointerup", (event) => {
    event.stopPropagation();
    if (indicator.hasPointerCapture(event.pointerId)) {
      indicator.releasePointerCapture(event.pointerId);
    }
  });
  indicator.addEventListener("pointercancel", stopDragging);
  indicator.addEventListener("lostpointercapture", stopDragging);
  indicator.addEventListener("mousedown", (event) => event.stopPropagation());
  indicator.addEventListener(
    "touchstart",
    (event) => event.stopPropagation(),
    { passive: !0 },
  );
  indicator.addEventListener(
    "touchmove",
    (event) => event.stopPropagation(),
    { passive: !0 },
  );
}
resize(e,t){`;
if (lusionBundle.split(scrollIndicatorInitSource).length - 1 !== 1) {
  throw new Error("The Lusion scroll indicator init anchor changed.");
}
lusionBundle = lusionBundle.replace(scrollIndicatorInitSource, scrollIndicatorInitReplacement);
// The About hero word is WebGL geometry loaded from about/logo_text.buf, which still
// spells the upstream studio name. The engine already owns a morph from that geometry
// into the XLab svg anchor (#about-who-title-left-2), but it only runs while scrolling,
// so the very first view shows the old word. Start the morph already complete.
const aboutHeroWordMorphSource =
  "let c=aboutHero.introRatio<.05;this.logoHideRatio=math.saturate(this.logoHideRatio+e*(c?-1:1))";
const aboutHeroWordMorphReplacement = "let c=aboutHero.introRatio<.05;this.logoHideRatio=1";
if (lusionBundle.split(aboutHeroWordMorphSource).length - 1 !== 1) {
  throw new Error("The Lusion About hero word morph anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutHeroWordMorphSource, aboutHeroWordMorphReplacement);
// The About hero word is drawn on the WebGL canvas, not in the DOM, so hiding the
// headline markup cannot remove it. Keep the whole mesh container hidden instead.
const aboutHeroWordVisibleSource = "aboutWhoLogo.container.visible=t,t){";
const aboutHeroWordVisibleReplacement = "aboutWhoLogo.container.visible=!1,t){";
if (lusionBundle.split(aboutHeroWordVisibleSource).length - 1 !== 1) {
  throw new Error("The Lusion About hero word visibility anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutHeroWordVisibleSource, aboutHeroWordVisibleReplacement);
// The Team subsection is removed, so the About track only has two pages left. Trim the
// trailing scroll ranges that used to pan onto the team panel. RANGE_END_WAIT must stay
// positive: it is the length of the final scroll leg, and a zero leg makes math.fit
// divide by zero.
const aboutTeamScrollRangeSource = "RANGE_PAGE_34=1.75;RANGE_END_WAIT=2.5;";
const aboutTeamScrollRangeReplacement = "RANGE_PAGE_34=0;RANGE_END_WAIT=1;";
if (lusionBundle.split(aboutTeamScrollRangeSource).length - 1 !== 1) {
  throw new Error("The Lusion About team scroll range anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutTeamScrollRangeSource, aboutTeamScrollRangeReplacement);
// With the team panel gone the About track holds two panels instead of three, but the
// pan is computed as ratio * PAGE_DISTANCE * viewportWidth with ratio ending at 2.
// Each panel is 100vw wide and carries `margin-right: 25vw` from about.*.css, so the
// distance between the start of one panel and the start of the next is 1.25 * viewportWidth.
// The details panel must land flush with the left edge of the viewport, so the total pan
// has to be that same 1.25 * viewportWidth: 2 * 0.625 = 1.25.
// The previous value of .5 only panned 1.0 * viewportWidth, which left the details panel
// short by exactly the 25vw margin (360px at 1440px wide) and pushed the right-aligned
// closing paragraph off the screen.
const aboutTeamPanDistanceSource = "RANGE_END_WAIT=1;PAGE_DISTANCE=1.25;";
const aboutTeamPanDistanceReplacement = "RANGE_END_WAIT=1;PAGE_DISTANCE=.625;";
if (lusionBundle.split(aboutTeamPanDistanceSource).length - 1 !== 1) {
  throw new Error("The Lusion About pan distance anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutTeamPanDistanceSource, aboutTeamPanDistanceReplacement);
// The intro copy fades word by word as the panel pans past. The fade-out windows are
// anchored to r = c - PAGE_DISTANCE, so they move whenever PAGE_DISTANCE changes.
//
// The visible span of r is narrower than it first looks. WhoSubsectionDetails only shows
// itself while `0 < c && c < PAGE_DISTANCE * 2`, and c = r + PAGE_DISTANCE, so the panel is
// on screen for r in (-PAGE_DISTANCE, +PAGE_DISTANCE) and is hidden outright at r = 0.625.
// Within that span the panel is still travelling: panelX = (PAGE_DISTANCE - r) * viewportWidth,
// so the copy only finishes arriving at the flush position at the very moment the engine
// hides it.
//
// That means the exit has to happen inside r = -0.625 .. 0.625, and it has to be complete
// by r = 0.625 or the words are cut off mid-fade by the hard visibility switch.
// A previous attempt started the fade at r = 0.625, which is after the panel is already
// hidden, so the fade never ran and the copy simply snapped off.
//
// Run the fade-out over r = 0.30 .. 0.625: the copy is fully opaque while it travels into
// frame and while it is being read, then it dims smoothly and reaches zero exactly as the
// engine switches the panel off, so the handover is invisible.
// Words are staggered so they do not all dim in lock step, but the stagger has to END at
// r = 0.625 rather than start there: a window like 0.30 .. 0.625 + p*0.15 keeps the last
// word above zero past the point where the engine hides the panel, so it gets cut off
// mid-fade. Ending at 0.625 - (1 - p) * 0.10 keeps every word at zero on the last visible
// frame while preserving the trailing-word stagger.
const aboutDetailsFadeOutStart = ".30";
const aboutDetailsFadeOutEnd = ".625";
const aboutDetailsFadeOutStagger = ".10";
const aboutDetailsFadeWordEnd = `${aboutDetailsFadeOutEnd} - (1 - p) * ${aboutDetailsFadeOutStagger}`;
const aboutDetailsFadeLineEnd = `${aboutDetailsFadeOutEnd} - (1 - f) * ${aboutDetailsFadeOutStagger}`;
const aboutDetailsTopFadeSource = "T=math.fit(r,.1,.5+p*.5,0,1)";
const aboutDetailsTopFadeReplacement = `T=math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeWordEnd},0,1)`;
if (lusionBundle.split(aboutDetailsTopFadeSource).length - 1 !== 1) {
  throw new Error("The Lusion About top-word fade anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutDetailsTopFadeSource, aboutDetailsTopFadeReplacement);
const aboutDetailsBottomFadeSource = "T=math.fit(r,.2,.5+p*.5,0,1)";
const aboutDetailsBottomFadeReplacement = `T=math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeWordEnd},0,1)`;
if (lusionBundle.split(aboutDetailsBottomFadeSource).length - 1 !== 1) {
  throw new Error("The Lusion About bottom-word fade anchor changed.");
}
lusionBundle = lusionBundle.replace(
  aboutDetailsBottomFadeSource,
  aboutDetailsBottomFadeReplacement,
);
// The words also slide sideways, and those windows were anchored to the old pan too.
// Each word is drawn with a horizontal offset of, in viewport widths,
//     slide-in  fit(r, -1, 0, -50, 0)          (top words; -20 for the bottom set)
//   + slide-out fit(r, <start>, 1, 0, <end>)   (top words end at +20vw, bottom at +50vw)
// The slide-in finishes at r = 0, so from there the slide-out is the only term left.
// Start the slide-out on the same window as the fade so the words hold their positions
// while legible and only drift away as they dim.
const aboutDetailsTopSlideSource = "math.fit(r,.1,1,0,20)";
const aboutDetailsTopSlideReplacement = `math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeOutEnd},0,20)`;
if (lusionBundle.split(aboutDetailsTopSlideSource).length - 1 !== 1) {
  throw new Error("The Lusion About top-word slide anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutDetailsTopSlideSource, aboutDetailsTopSlideReplacement);
const aboutDetailsBottomSlideSource = "math.fit(r,0,1,0,50)";
const aboutDetailsBottomSlideReplacement = `math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeOutEnd},0,50)`;
if (lusionBundle.split(aboutDetailsBottomSlideSource).length - 1 !== 1) {
  throw new Error("The Lusion About bottom-word slide anchor changed.");
}
lusionBundle = lusionBundle.replace(
  aboutDetailsBottomSlideSource,
  aboutDetailsBottomSlideReplacement,
);
// Each word also gets an inline offset in em from
//     fit(g, 0, 1, 10, 0) + fit(_, 0, 1, 0, -10)
// which is the "scatter into place" motion. Its _ window was anchored to the same old
// ratios, so at the reading position the -10em term was already fully applied and every
// word sat up to 10em (about 480px here) to the left of its real position, which pushed the
// intro copy off the left edge of the viewport.
// Hold the scatter until the fade-out begins: the words then keep their true positions for
// the whole readable span and only scatter as they leave.
// Note the p-based twin of the top window shares its text with the fade term replaced
// above, so only the line-based f windows still need re-anchoring here. The bottom set
// keeps its own leading value (.2 rather than .1) on both variants.
const aboutDetailsTopScatterLineSource = "math.fit(r,.1,.5+f*.5,0,1)";
const aboutDetailsTopScatterLineReplacement = `math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeLineEnd},0,1)`;
if (lusionBundle.split(aboutDetailsTopScatterLineSource).length - 1 !== 1) {
  throw new Error("The Lusion About top-word line scatter anchor changed.");
}
lusionBundle = lusionBundle.replace(
  aboutDetailsTopScatterLineSource,
  aboutDetailsTopScatterLineReplacement,
);
const aboutDetailsBottomScatterLineSource = "math.fit(r,.2,.5+f*.5,0,1)";
const aboutDetailsBottomScatterLineReplacement = `math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeLineEnd},0,1)`;
if (lusionBundle.split(aboutDetailsBottomScatterLineSource).length - 1 !== 1) {
  throw new Error("The Lusion About bottom-word line scatter anchor changed.");
}
lusionBundle = lusionBundle.replace(
  aboutDetailsBottomScatterLineSource,
  aboutDetailsBottomScatterLineReplacement,
);
// On the mobile layout the whole container fades instead of the individual words, using
//     n = fit(r, -.75, -.25, 0, 1) * fit(r, .25, .5, 1, 0)
// The second factor closed the copy out at r = 0.5, well before the panel is hidden at
// r = 0.625, so the intro text read as pale grey for the last stretch and then vanished.
// Close it out over the same exit window as the desktop words instead.
const aboutDetailsMobileOpacitySource = "math.fit(r,.25,.5,1,0)";
const aboutDetailsMobileOpacityReplacement = `math.fit(r,${aboutDetailsFadeOutStart},${aboutDetailsFadeOutEnd},1,0)`;
if (lusionBundle.split(aboutDetailsMobileOpacitySource).length - 1 !== 1) {
  throw new Error("The Lusion About mobile container opacity anchor changed.");
}
lusionBundle = lusionBundle.replace(
  aboutDetailsMobileOpacitySource,
  aboutDetailsMobileOpacityReplacement,
);
// The team portraits are WebGL point clouds that fade in whenever the team subsection is
// on screen. Hiding that subsection cannot switch them off, and the About track still
// scrolls past its position, so the face keeps appearing. Pin the switch that gates it.
const aboutTeamFacesActiveSource = "aboutHeroFaces.isActive=aboutHeroFaces.showRatio>0";
const aboutTeamFacesActiveReplacement = "aboutHeroFaces.isActive=!1";
if (lusionBundle.split(aboutTeamFacesActiveSource).length - 1 !== 1) {
  throw new Error("The Lusion About team faces visibility anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutTeamFacesActiveSource, aboutTeamFacesActiveReplacement);
// The team subsection is hidden, so its portrait models are never displayed. The page
// show hook still loads all seven .buf files (about 610 KB), so skip those fetches while
// keeping the remaining bookkeeping that the rest of the section relies on.
const aboutTeamFacesLoadSource =
  "for(let e=0;e<this.teamDataList.length;e++){let t=this.teamDataList[e].id;aboutHeroFaces.load(t)}";
const aboutTeamFacesLoadReplacement = "";
if (lusionBundle.split(aboutTeamFacesLoadSource).length - 1 !== 1) {
  throw new Error("The Lusion About team face preload anchor changed.");
}
lusionBundle = lusionBundle.replace(aboutTeamFacesLoadSource, aboutTeamFacesLoadReplacement);
// One portrait is also fetched eagerly while the team section is constructed.
const aboutTeamFacesEagerLoadSource = "}),aboutHeroFaces.load(this.faceId),this.letterMesh=";
const aboutTeamFacesEagerLoadReplacement = "}),this.letterMesh=";
if (lusionBundle.split(aboutTeamFacesEagerLoadSource).length - 1 !== 1) {
  throw new Error("The Lusion About team face eager load anchor changed.");
}
lusionBundle = lusionBundle.replace(
  aboutTeamFacesEagerLoadSource,
  aboutTeamFacesEagerLoadReplacement,
);
const astronautRevealSource =
  "v.position.y-=(properties.useMobileLayout?0:.4)*ease.backInOut(p),v.updateMatrix();";
// Pull the astronaut back into the viewport during the heading, then release it into the tunnel.
const astronautRevealReplacement =
  "v.position.y-=(properties.useMobileLayout?0:.4)*ease.backInOut(p),v.position.z-=(properties.useMobileLayout?1.2:1.6)*math.smoothstep(.25,.45,a)*math.fit(a,.82,1,1,0),v.position.y+=(properties.useMobileLayout?.35:.55)*math.smoothstep(.25,.45,a)*math.fit(a,.82,1,1,0),v.updateMatrix();";
if (lusionBundle.split(astronautRevealSource).length - 1 !== 1) {
  throw new Error("The copied Lusion astronaut transform no longer matches the reveal patch.");
}
lusionBundle = lusionBundle.replace(astronautRevealSource, astronautRevealReplacement);

// Keep the Home scroll manual once its About intro reaches the viewport.
const homeScrollBoundarySource =
  "window.__AUTO_SCROLL__&&(scrollManager.autoScrollSpeed=window.__AUTO_SCROLL__),taskManager.update()";
const homeScrollBoundaryReplacement =
  'window.__AUTO_SCROLL__&&(scrollManager.autoScrollSpeed=window.__AUTO_SCROLL__),routeManager.currRoute.target===homePage&&(window.__XLAB_HOME_SCROLL_STOPPED__||document.getElementById("about-who-desc-top")&&scrollManager.scrollPixel>=scrollManager.getDomRange(document.getElementById("about-who-desc-top")).top-Math.min(132,Math.max(88,window.innerHeight*.175)))&&(window.__XLAB_HOME_SCROLL_STOPPED__=!0,scrollManager.autoScrollSpeed=0),taskManager.update()';
if (lusionBundle.split(homeScrollBoundarySource).length - 1 !== 1) {
  throw new Error(
    "The copied Lusion scroll manager no longer matches the Home intro boundary patch.",
  );
}
lusionBundle = lusionBundle.replace(homeScrollBoundarySource, homeScrollBoundaryReplacement);
const aboutScrollPauseSource =
  "this.scrollPixel=this._clampScrollPixel(this.scrollPixel+a),this.scrollView=this.scrollPixel/this.viewSizePixel";
const aboutScrollPauseReplacement = `(this===scrollManager&&routeManager.currRoute.target===homePage&&!window.__XLAB_ABOUT_SCROLL_PAUSE_DONE__&&(()=>{
    const description=document.getElementById("about-who-desc-top");
    const homeGoal=document.getElementById("home-goal");
    if(!description||!homeGoal)return!1;
    const clearance=Math.min(132,Math.max(88,window.innerHeight*.175));
    const homeGoalRange=this.getDomRange(homeGoal);
    const boundary=Math.max(
      this.getDomRange(description).top-clearance,
      homeGoalRange.top+homeGoalRange.height
    );
    const now=performance.now();
    const pauseUntil=window.__XLAB_ABOUT_SCROLL_PAUSE_UNTIL__||0;
    if(pauseUntil&&now<pauseUntil){
      if(a<0){
        window.__XLAB_ABOUT_SCROLL_PAUSE_DONE__=!0;
        window.__XLAB_ABOUT_SCROLL_PAUSE_UNTIL__=0;
        return!1
      }
      this.targetScrollPixel=boundary;
      this.scrollPixel=boundary;
      this.velocityPixel=0;
      this.dragHistory.length=0;
      this.isWheelScrolling=!1;
      input.deltaScrollY=0;
      input.deltaScrollX=0;
      input.isWheelScrolling=!1;
      input.deltaPixelXY&&(input.deltaPixelXY.x=0,input.deltaPixelXY.y=0);
      a=0;
      return!0
    }
    if(pauseUntil){
      window.__XLAB_ABOUT_SCROLL_PAUSE_DONE__=!0;
      window.__XLAB_ABOUT_SCROLL_PAUSE_UNTIL__=0;
      return!1
    }
    if(this.scrollPixel<boundary+32&&this.scrollPixel+a>=boundary&&a>=0){
      window.__XLAB_ABOUT_SCROLL_PAUSE_UNTIL__=now+1000;
      this.targetScrollPixel=boundary;
      this.scrollPixel=boundary;
      this.velocityPixel=0;
      this.dragHistory.length=0;
      this.isWheelScrolling=!1;
      input.deltaScrollY=0;
      input.deltaScrollX=0;
      input.isWheelScrolling=!1;
      input.deltaPixelXY&&(input.deltaPixelXY.x=0,input.deltaPixelXY.y=0);
      a=0;
      return!0
    }
    return!1
  })()),this.scrollPixel=this._clampScrollPixel(this.scrollPixel+a),this.scrollView=this.scrollPixel/this.viewSizePixel`;
if (lusionBundle.split(aboutScrollPauseSource).length - 1 !== 1) {
  throw new Error("The copied Lusion scroll pane no longer matches the About pause patch.");
}
lusionBundle = lusionBundle.replace(aboutScrollPauseSource, aboutScrollPauseReplacement);
const lusionScrollStateSource = "scrollManager.update(o),pagesManager.update(o)";
const lusionScrollStateReplacement =
  "scrollManager.update(o),window.__XLAB_LUSION_SCROLL_AT_TOP__=scrollManager.scrollPixel<=2,window.__XLAB_LUSION_SCROLL_AT_BOTTOM__=scrollManager.scrollPixel>=scrollManager.contentSizePixel-2,pagesManager.update(o)";
if (lusionBundle.split(lusionScrollStateSource).length - 1 !== 1) {
  throw new Error(
    "The copied Lusion scroll manager no longer matches the virtual scroll state patch.",
  );
}
lusionBundle = lusionBundle.replace(lusionScrollStateSource, lusionScrollStateReplacement);
const lusionLocalHomeRouteSource = "if(n.regExp.test(this.path)){t=n;break}";
const lusionLocalHomeRouteReplacement =
  'if(n.regExp.test(this.path)||this.path?.startsWith("lusion")&&n.target.id==="home"){t=n;break}';
if (lusionBundle.split(lusionLocalHomeRouteSource).length - 1 !== 1) {
  throw new Error("The copied Lusion route matcher no longer matches the local home route patch.");
}
lusionBundle = lusionBundle.replace(lusionLocalHomeRouteSource, lusionLocalHomeRouteReplacement);
const lusionAbsoluteRouteSource =
  'history.pushState(null,null,(e||"/")+(this.queryStr?"?"+this.queryStr:"")),this._onStatePop()';
const lusionAbsoluteRouteReplacement =
  'history.pushState(null,null,(e?"/"+e:"/")+(this.queryStr?"?"+this.queryStr:"")),this._onStatePop()';
if (lusionBundle.split(lusionAbsoluteRouteSource).length - 1 !== 1) {
  throw new Error(
    "The copied Lusion route writer no longer matches the absolute local route patch.",
  );
}
lusionBundle = lusionBundle.replace(lusionAbsoluteRouteSource, lusionAbsoluteRouteReplacement);
// Mobile layout writes a centering transform each frame; keep its vertical reveal only.
const aboutScrollCueMobileTransformSource =
  'this.domScroll.style.transform="translate3d(50%, "+(1-f)*120+"%, 0)"';
const aboutScrollCueMobileTransformReplacement =
  'this.domScroll.style.transform="translate3d(0, "+(1-f)*120+"%, 0)"';
if (lusionBundle.split(aboutScrollCueMobileTransformSource).length - 1 !== 1) {
  throw new Error("The About scroll cue mobile positioning no longer matches.");
}
lusionBundle = lusionBundle.replace(
  aboutScrollCueMobileTransformSource,
  aboutScrollCueMobileTransformReplacement,
);
// The About intro hides the scroll cue beside the wordmark, and LuaLusion never
// transitions it (it only writes transform), so it stays at its authored
// opacities of 0/0.2 forever and the prompt never appears. Reveal it while the
// intro is expanded and fade it back out as the cue starts to hide.
const aboutScrollCueRevealSource = "this.domScroll.style.opacity=f";
const aboutScrollCueRevealReplacement =
  "this.domScroll.style.opacity=window.__XLAB_ABOUT_SCROLL_CUE_VISIBLE__?1:2*f";
if (lusionBundle.split(aboutScrollCueRevealSource).length - 1 !== 1) {
  throw new Error("The About scroll cue opacity write no longer matches.");
}
lusionBundle = lusionBundle.replace(aboutScrollCueRevealSource, aboutScrollCueRevealReplacement);
await writeFile(lusionBundlePath, lusionBundle);

console.log(`Vercel static output prepared: ${output}`);
