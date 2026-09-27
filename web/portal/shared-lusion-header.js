const headerFrame = document.querySelector(
  "[data-shared-lusion-header-frame]",
);

if (headerFrame) {
  const minimumHeaderHeight = 112;
  const localeSelect = document.querySelector("select[data-locale]");
  let headerHeight = minimumHeaderHeight;
  let menuOpen = false;
  let sourceDocument = null;
  let headerObserver = null;
  let observedHeader = null;

  const setFrameHeight = () => {
    headerFrame.style.height = menuOpen
      ? `${window.innerHeight}px`
      : `${headerHeight}px`;
  };

  const syncTheme = () => {
    const root = headerFrame.contentDocument?.documentElement;
    if (!root) return;

    const dark = document.documentElement.dataset.theme !== "light";
    root.classList.toggle("is-black-bg", dark);
    root.classList.toggle("is-white-bg", !dark);
  };

  const localeValue = (locale) =>
    ["en", "vi", "zh"].includes(locale) ? locale : null;

  const syncLocale = () => {
    let storedLocale = null;
    try {
      storedLocale = localStorage.getItem("presentlab.locale");
    } catch {
      // The document language remains available when storage is blocked.
    }
    const locale =
      localeValue(localeSelect?.value) ||
      localeValue(document.documentElement.dataset.locale) ||
      localeValue(storedLocale) ||
      localeValue(document.documentElement.lang);
    if (!locale) return;

    let stored = true;
    try {
      localStorage.setItem("presentlab.locale", locale);
    } catch {
      // The page-two language control remains available if storage is blocked.
      stored = false;
    }

    const documentLocale =
      sourceDocument?.documentElement.dataset.lusionLanguage ||
      (sourceDocument?.documentElement.lang === "zh-CN"
        ? "zh"
        : sourceDocument?.documentElement.lang);
    if (stored && documentLocale && documentLocale !== locale) {
      headerFrame.style.opacity = "0";
      headerFrame.contentWindow?.location.reload();
      return false;
    }
    return true;
  };

  const isSourceMenuOpen = () => {
    if (!sourceDocument) return false;

    return Boolean(
      sourceDocument
        .querySelector("#header")
        ?.classList.contains("--menu-opened") ||
        sourceDocument
          .querySelector("#header-menu")
          ?.classList.contains("--opened") ||
        sourceDocument
          .querySelector("#header-right-menu-btn")
          ?.classList.contains("--opened") ||
        sourceDocument
          .querySelector("#lusion-language-switcher")
          ?.classList.contains("is-open") ||
        sourceDocument.querySelector("#lusion-language-menu")?.hidden === false
    );
  };

  const syncMenu = () => {
    menuOpen = isSourceMenuOpen();
    setFrameHeight();
  };

  const closeSourceMenu = () => {
    if (
      sourceDocument
        ?.querySelector("#lusion-language-menu")
        ?.hidden === false
    ) {
      sourceDocument.querySelector("#lusion-language-trigger")?.click();
    }
    if (
      sourceDocument?.querySelector("#header")?.classList.contains("--menu-opened") ||
      sourceDocument
        ?.querySelector("#header-menu")
        ?.classList.contains("--opened")
    ) {
      sourceDocument.querySelector("#header-right-menu-btn")?.click();
    }
  };

  const openPortalContact = () => {
    closeSourceMenu();
    document.querySelector("[data-open-request]")?.click();
  };

  const handleSourceClick = (event) => {
    const target = event.target.closest(
      "a[data-page], #header-logo, [data-scroll-to='contact'], #header-right-talk-btn, #header-menu-talk",
    );
    if (!target) return;

    if (
      target.matches("[data-scroll-to='contact'], #header-right-talk-btn, #header-menu-talk")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPortalContact();
      return;
    }

    const href = target.getAttribute("href");
    if (!href?.startsWith("/")) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const destination = new URL(href, window.location.href);
    if (
      destination.pathname === window.location.pathname &&
      !destination.hash
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.assign(destination.href);
    }
  };

  const mountSourceHeader = () => {
    const nextDocument = headerFrame.contentDocument;
    sourceDocument = nextDocument;
    const sourceHeader = sourceDocument?.querySelector("#header");
    if (!sourceHeader) return;

    headerHeight = Math.max(
      minimumHeaderHeight,
      Math.ceil(sourceHeader.getBoundingClientRect().height),
    );
    document.documentElement.style.setProperty(
      "--shared-lusion-header-height",
      `${headerHeight}px`,
    );
    setFrameHeight();
    syncTheme();
    const localeIsReady = syncLocale();

    if (observedHeader !== sourceHeader) {
      headerObserver?.disconnect();
      headerObserver = new MutationObserver(syncMenu);
      headerObserver.observe(sourceHeader, {
        attributes: true,
        attributeFilter: ["class", "hidden"],
        childList: true,
        subtree: true,
      });
      sourceDocument.addEventListener("click", handleSourceClick, true);
      sourceDocument.addEventListener(
        "click",
        () => setTimeout(syncMenu, 0),
        true,
      );
      observedHeader = sourceHeader;
    }

    if (localeIsReady) headerFrame.style.opacity = "1";
    syncMenu();
  };

  headerFrame.addEventListener("load", mountSourceHeader);
  window.addEventListener("resize", () => {
    setFrameHeight();
    syncTheme();
  });
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  window.addEventListener("message", (event) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== headerFrame.contentWindow
    ) return;

    if (event.data?.type === "xlab-shared-header-ready") {
      mountSourceHeader();
      return;
    }
    if (event.data?.type !== "xlab-shared-header-locale") return;

    const locale = localeValue(event.data.locale);
    if (!locale) return;
    let stored = true;
    try {
      localStorage.setItem("presentlab.locale", locale);
    } catch {
      // The Lusion language control remains available if storage is blocked.
      stored = false;
    }
    if (localeSelect && localeSelect.value !== locale) {
      localeSelect.value = locale;
      localeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      document.dispatchEvent(
        new CustomEvent("presentlab:locale-change", { detail: { locale } }),
      );
    }
    if (stored) {
      headerFrame.style.opacity = "0";
      headerFrame.contentWindow.location.reload();
    }
  });

  if (headerFrame.contentDocument?.readyState === "complete") {
    mountSourceHeader();
  } else if (headerFrame.contentDocument?.querySelector("#header")) {
    mountSourceHeader();
  }
}
