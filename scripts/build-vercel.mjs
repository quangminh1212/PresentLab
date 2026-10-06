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
const lusionHomeRawSource = await readFile(join(root, "web/lusion/index.html"), "utf8");
// The About route opens with the same hero scene as the home route, so the two pages
// share one loader-to-hero reveal. The hero markup is lifted from the local home page
// and pushed through the same XLab branding pass as the rest of the page text.
const lusionHomeHeroMarkup = (() => {
  const markup = lusionHomeRawSource.match(
    /<div\b[^>]*\bid="home-hero"[\s\S]*?(?=<div\b[^>]*\bid="home-reel")/i,
  );
  if (!markup) {
    throw new Error("Could not locate the Home hero markup to reuse on the About route.");
  }
  return markup[0];
})();
const aboutWhoAnchorPattern = /<div\b[^>]*\bid="about-who"/i;
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
  if (pagePath.endsWith(join("about", "index.html"))) {
    if (html.split('id="home-hero"').length - 1 !== 0) {
      throw new Error(`The About route already contains a home-hero section: ${pagePath}.`);
    }
    if (!aboutWhoAnchorPattern.test(html)) {
      throw new Error(`Could not find the About opening section in ${pagePath}.`);
    }
    html = html.replace(
      aboutWhoAnchorPattern,
      (match) => `${lusionHomeHeroMarkup}${match}`,
    );
  }
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

let lusionHomeSource = lusionHomeRawSource;
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
await writeFile(
  siteOverridesPath,
  localizedSiteOverrides + astronautHeaderStateRuntime + responsiveHeroTypeRuntime,
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

// The About route reuses the Home hero as its opening scene so both pages share the
// same loader-to-hero reveal. The engine only ever drives homeHeroSection from
// HomePage, so AboutPage has to run the same section lifecycle. homeHeroSection.update()
// sets homeBalloons.isActive from the hero's own DOM range, so the balloons activate
// while the hero is on screen and hand back to the About scene once it is scrolled past.
const aboutPageHeroPatches = [
  [
    "AboutPage hero preInit",
    'class AboutPage extends Page{path="about";id="about";endVisualColor=properties.offWhiteColorHex;preInit(){let e=this.domContainer;aboutWhoSection.preInit(e)',
    'class AboutPage extends Page{path="about";id="about";endVisualColor=properties.offWhiteColorHex;preInit(){let e=this.domContainer;homeHeroSection.preInit(e),aboutWhoSection.preInit(e)',
  ],
  [
    "AboutPage hero init",
    'class AboutPage extends Page{path="about";id="about";endVisualColor=properties.offWhiteColorHex;preInit(){let e=this.domContainer;homeHeroSection.preInit(e),aboutWhoSection.preInit(e),aboutClientSection.preInit(e),aboutAwardSection.preInit(e),aboutCapabilitySection.preInit(e)}init(){aboutWhoSection.init()',
    'class AboutPage extends Page{path="about";id="about";endVisualColor=properties.offWhiteColorHex;preInit(){let e=this.domContainer;homeHeroSection.preInit(e),aboutWhoSection.preInit(e),aboutClientSection.preInit(e),aboutAwardSection.preInit(e),aboutCapabilitySection.preInit(e)}init(){homeHeroSection.init(),aboutWhoSection.init()',
  ],
  [
    "AboutPage hero resize",
    "aboutCapabilitySection.init(),super.init()}resize(e,t){aboutWhoSection.resize(e,t)",
    "aboutCapabilitySection.init(),super.init()}resize(e,t){homeHeroSection.resize(e,t),aboutWhoSection.resize(e,t)",
  ],
  [
    "AboutPage hero show",
    "aboutCapabilitySection.resize(e,t)}show(e,t,r){aboutWhoSection.show()",
    "aboutCapabilitySection.resize(e,t)}show(e,t,r){homeHeroSection.initEvent(),aboutWhoSection.show()",
  ],
  [
    "AboutPage hero update",
    "aboutCapabilitySection.update(e),aboutPageAudios.update(r)}}const aboutPage=new AboutPage",
    "aboutCapabilitySection.update(e),aboutPageAudios.update(r),homeHeroSection.update(e)}}const aboutPage=new AboutPage",
  ],
];
for (const [label, source, replacement] of aboutPageHeroPatches) {
  if (lusionBundle.split(source).length - 1 !== 1) {
    throw new Error(`The copied Lusion bundle no longer matches the ${label} patch.`);
  }
  lusionBundle = lusionBundle.replace(source, replacement);
}

// homeHeroSection needs to report whether its hero is off screen so the About stage can
// yield to it (see the About stage patch below). A plain prototype getter keeps the
// check cheap and inside the class, which is declared before aboutHero.
const heroSectionOffScreenSource =
  "class HomeHeroSection{domContainer;domHomeTitle;sectionDomRange;preInit(e){";
const heroSectionOffScreenReplacement =
  "class HomeHeroSection{domContainer;domHomeTitle;sectionDomRange;get isOffScreen(){return!this.sectionDomRange||!this.sectionDomRange.isActive};preInit(e){";
if (lusionBundle.split(heroSectionOffScreenSource).length - 1 !== 1) {
  throw new Error("The copied Lusion HomeHeroSection declaration no longer matches.");
}
lusionBundle = lusionBundle.replace(heroSectionOffScreenSource, heroSectionOffScreenReplacement);

// Both stages can be active at once on the About route: the About section activates
// aboutHero (its particle cloud) whenever the About content is on screen, while
// homeHeroSection activates homeBalloons for the reused opening hero. Visuals.syncProperties
// picks the LAST active stage in stage3DList, and aboutHero is registered after
// homeBalloons, so aboutHero always won and the hero scene never rendered. Gate the
// About stage on the hero being off screen; this runs where aboutHero is in scope,
// because aboutHero is declared after homeHeroSection.
const aboutStageSource = "aboutHero.isActive=!0}else aboutHero.isActive=!1,whoSubsectionTeam.wasActive=!1";
const aboutStageReplacement =
  "aboutHero.isActive=homeHeroSection.isOffScreen!==!1}else aboutHero.isActive=!1,whoSubsectionTeam.wasActive=!1";
if (lusionBundle.split(aboutStageSource).length - 1 !== 1) {
  throw new Error("The copied Lusion About stage activation no longer matches.");
}
lusionBundle = lusionBundle.replace(aboutStageSource, aboutStageReplacement);
// The reused hero animates its headline from homePage.time, but on the About route only
// aboutPage.time advances, so homePage.time stays 0 and every word keeps its initial
// transform (translated down 1.7em and rotated 15deg) and never becomes visible.
// homeHeroSection.update() is called with the already-advanced page time on whatever
// route is showing, so feed that in rather than reading homePage.time whose declaration
// also sits after this class.
const heroTimeSource = "_updateUi(e){scrollManager.scrollPixel,math.fit(this.sectionDomRange.ratio,.3,.7,0,1,ease.cubcInOut);let t=Math.max(0,homePage.time-1)";
const heroTimeReplacement =
  "_updateUi(e){scrollManager.scrollPixel,math.fit(this.sectionDomRange.ratio,.3,.7,0,1,ease.cubcInOut);let t=Math.max(0,(this.clockTime??homePage.time)-1)";
if (lusionBundle.split(heroTimeSource).length - 1 !== 1) {
  throw new Error("The copied Lusion hero update clock no longer matches.");
}
lusionBundle = lusionBundle.replace(heroTimeSource, heroTimeReplacement);

// Record the active page's clock before the hero reads it.
const heroClockSource = "aboutCapabilitySection.update(e),aboutPageAudios.update(r),homeHeroSection.update(e)";
const heroClockReplacement =
  "aboutCapabilitySection.update(e),aboutPageAudios.update(r),homeHeroSection.clockTime=this.time,homeHeroSection.update(e)";
if (lusionBundle.split(heroClockSource).length - 1 !== 1) {
  throw new Error("The copied Lusion About hero clock hook no longer matches.");
}
lusionBundle = lusionBundle.replace(heroClockSource, heroClockReplacement);

// HomeBalloons.syncProperties() also reads homePage.time to drive the camera dolly
// (z 25->17.5 and fov offset 100->0), which is what sweeps the teal ribbon into frame.
// On the About route that clock is frozen, so reuse the same advancing clock the hero
// already feeds in.
const balloonClockSource =
  "syncProperties(e){this.properties.defaultCameraPosition.z=math.fit(homePage.time,.3,2,25,17.5,ease.backOut),this.properties.cameraDollyZoomFovOffset=math.fit(homePage.time,.3,3,100,0,ease.backOut)}";
const balloonClockReplacement =
  "syncProperties(e){let _t=window.__XLAB_HERO_CLOCK__??homePage.time;this.properties.defaultCameraPosition.z=math.fit(_t,.3,2,25,17.5,ease.backOut),this.properties.cameraDollyZoomFovOffset=math.fit(_t,.3,3,100,0,ease.backOut)}";
if (lusionBundle.split(balloonClockSource).length - 1 !== 1) {
  throw new Error("The copied Lusion balloon camera dolly no longer matches.");
}
lusionBundle = lusionBundle.replace(balloonClockSource, balloonClockReplacement);

// Publish the advancing clock so HomeBalloons (declared earlier) can read it at runtime.
const heroClockPublishSource = "homeHeroSection.clockTime=this.time,homeHeroSection.update(e)";
const heroClockPublishReplacement =
  "homeHeroSection.clockTime=this.time,window.__XLAB_HERO_CLOCK__=this.time,homeHeroSection.update(e)";
if (lusionBundle.split(heroClockPublishSource).length - 1 !== 1) {
  throw new Error("The copied Lusion About hero clock publish no longer matches.");
}
lusionBundle = lusionBundle.replace(heroClockPublishSource, heroClockPublishReplacement);

await writeFile(lusionBundlePath, lusionBundle);

console.log(`Vercel static output prepared: ${output}`);
