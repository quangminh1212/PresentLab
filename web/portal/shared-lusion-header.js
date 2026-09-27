const headerFrame = document.querySelector(
  "[data-shared-lusion-header-frame]",
);

if (headerFrame) {
  const headerHost = document.createElement("div");
  headerHost.id = "shared-lusion-header-render";
  headerHost.setAttribute("data-shared-lusion-header-render", "");
  document.body.appendChild(headerHost);

  let menuOpen = false;
  let languageMenuOpen = false;
  let renderTimer = 0;

  const sendTheme = () => {
    headerFrame.contentWindow?.postMessage(
      {
        type: "xlab-shared-header-theme",
        theme: document.documentElement.dataset.theme || "dark",
      },
      window.location.origin,
    );
  };

  const styleText = (style) => {
    const declarations = [];
    for (let index = 0; index < style.length; index += 1) {
      const property = style[index];
      const value = style.getPropertyValue(property);
      if (value) declarations.push(`${property}:${value} !important`);
    }
    return declarations.join(";");
  };

  const renderHeader = () => {
    const sourceDocument = headerFrame.contentDocument;
    const sourceHeader = sourceDocument?.querySelector("#header");
    if (!sourceHeader) return;

    const clonedHeader = sourceHeader.cloneNode(true);
    const sourceElements = [
      sourceHeader,
      ...sourceHeader.querySelectorAll("*"),
    ];
    const clonedElements = [
      clonedHeader,
      ...clonedHeader.querySelectorAll("*"),
    ];
    if (sourceElements.length !== clonedElements.length) return;

    const pseudoRules = [];
    for (let index = 0; index < sourceElements.length; index += 1) {
      const sourceElement = sourceElements[index];
      const clonedElement = clonedElements[index];
      clonedElement.setAttribute("style", styleText(getComputedStyle(sourceElement)));
      if (sourceElement.id === "lusion-language-trigger") {
        clonedElement.style.setProperty("opacity", "1", "important");
        clonedElement.style.setProperty("clip-path", "none", "important");
        clonedElement.style.setProperty("transform", "none", "important");
      }

      for (const pseudo of ["before", "after"]) {
        const pseudoStyle = getComputedStyle(sourceElement, `::${pseudo}`);
        const content = pseudoStyle.getPropertyValue("content");
        if (!content || content === "none" || content === "normal") continue;

        const attribute = `data-shared-${pseudo}`;
        clonedElement.setAttribute(attribute, String(index));
        pseudoRules.push(
          `[${attribute}="${index}"]::${pseudo}{${styleText(pseudoStyle)}}`,
        );
      }
    }

    const pseudoStyle = document.createElement("style");
    pseudoStyle.textContent = pseudoRules.join("\n");
    headerHost.replaceChildren(clonedHeader, pseudoStyle);
  };

  const scheduleRender = (delay = 0) => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderHeader, delay);
  };

  const mountFromSource = (attempt = 0) => {
    const sourceDocument = headerFrame.contentDocument;
    const sourceHeader = sourceDocument?.querySelector("#header");
    const hasLanguageTrigger = Boolean(
      sourceDocument?.querySelector("#lusion-language-trigger"),
    );
    if ((!sourceHeader || !hasLanguageTrigger) && attempt < 40) {
      window.setTimeout(() => mountFromSource(attempt + 1), 50);
      return;
    }
    if (!sourceHeader) return;

    renderHeader();
    sendTheme();
  };

  const sourceTargetFor = (target) => {
    const sourceDocument = headerFrame.contentDocument;
    if (!sourceDocument) return null;

    if (target.id) return sourceDocument.getElementById(target.id);

    for (const attribute of ["data-locale", "data-page", "data-scroll-to"]) {
      const value = target.getAttribute(attribute);
      if (value === null) continue;
      return sourceDocument.querySelector(
        `[${attribute}="${CSS.escape(value)}"]`,
      );
    }
    return null;
  };

  headerHost.addEventListener("click", (event) => {
    const target = event.target.closest(
      "a,button,[role='button'],[data-locale],[data-page],[data-scroll-to]",
    );
    if (!target) return;

    const sourceTarget = sourceTargetFor(target);
    if (!sourceTarget) return;

    event.preventDefault();
    event.stopPropagation();
    sourceTarget.click();

    if (target.id === "lusion-language-trigger") {
      languageMenuOpen =
        headerFrame.contentDocument?.querySelector("#lusion-language-menu")
          ?.hidden === false;
    } else if (target.hasAttribute("data-locale")) {
      languageMenuOpen = false;
    }
    if (target.id === "lusion-language-trigger" || target.hasAttribute("data-locale")) {
      scheduleRender();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      headerHost.contains(event.target) ||
      (!menuOpen && !languageMenuOpen)
    ) {
      return;
    }
    headerFrame.contentDocument?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    languageMenuOpen = false;
    scheduleRender();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || (!menuOpen && !languageMenuOpen)) return;
    headerFrame.contentDocument?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    languageMenuOpen = false;
    scheduleRender();
  });

  headerFrame.addEventListener("load", () => {
    menuOpen = false;
    languageMenuOpen = false;
    headerHost.style.height = menuOpen ? `${window.innerHeight}px` : "112px";
    window.setTimeout(() => mountFromSource(), 50);
  });

  window.addEventListener("resize", () => {
    headerHost.style.height = menuOpen ? `${window.innerHeight}px` : "112px";
    scheduleRender(100);
    sendTheme();
  });

  window.addEventListener("message", (event) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== headerFrame.contentWindow ||
      !event.data
    ) {
      return;
    }

    if (event.data.type === "xlab-shared-header-ready") {
      headerHost.style.height = `${Math.max(
        112,
        Number(event.data.height) || 0,
      )}px`;
      sendTheme();
      mountFromSource();
    } else if (event.data.type === "xlab-shared-header-theme-applied") {
      scheduleRender();
    } else if (event.data.type === "xlab-shared-header-menu") {
      menuOpen = event.data.open === true;
      headerHost.dataset.menuOpen = String(menuOpen);
      headerHost.style.height = menuOpen
        ? `${window.innerHeight}px`
        : "112px";
      scheduleRender(menuOpen ? 350 : 0);
    } else if (event.data.type === "xlab-shared-header-locale") {
      const locale = event.data.locale;
      const localeSelect = document.querySelector("select[data-locale]");
      if (!["en", "vi", "zh"].includes(locale)) return;

      try {
        localStorage.setItem("presentlab.locale", locale);
      } catch {
        // The visible language control remains usable if storage is unavailable.
      }
      if (localeSelect) {
        localeSelect.value = locale;
        localeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
      languageMenuOpen = false;
      headerFrame.contentWindow.postMessage(
        { type: "xlab-shared-header-locale-applied" },
        window.location.origin,
      );
    } else if (event.data.type === "xlab-shared-header-navigate") {
      const destination = new URL(event.data.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        !destination.hash
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.assign(destination.href);
      }
    } else if (event.data.type === "xlab-shared-header-contact") {
      document.querySelector("[data-open-request]")?.click();
    }
  });

  const themeObserver = new MutationObserver(() => {
    sendTheme();
    scheduleRender();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  if (headerFrame.contentDocument?.readyState === "complete") {
    mountFromSource();
  }
}
