(() => {
  if (document.documentElement.dataset.xlabSharedHeader !== "true") return;

  const header = document.getElementById("header");
  const ui = document.getElementById("ui");
  const headerContainer = document.getElementById("header-container");
  const headerBackground = document.getElementById("header-background");
  const menuButton = document.getElementById("header-right-menu-btn");
  const menu = document.getElementById("header-menu");
  if (!header || !ui || !headerContainer || !headerBackground || !menuButton || !menu) {
    return;
  }

  let menuOpen = false;
  const send = (type, values = {}) => {
    if (window.parent === window) return;
    window.parent.postMessage({ type, ...values }, window.location.origin);
  };

  const setMenuOpen = (open) => {
    menuOpen = open;
    ui.classList.toggle("--menu-opened", open);
    headerContainer.classList.toggle("--opened", open);
    headerBackground.classList.toggle("--opened", open);
    menuButton.classList.toggle("--opened", open);
    menuButton.setAttribute("aria-expanded", String(open));
    headerBackground.style.opacity = open
      ? window.innerWidth >= 1000
        ? "0.2"
        : "1"
      : "0";
    headerContainer.style.pointerEvents = "auto";
    send("xlab-shared-header-menu", { open });
  };

  headerContainer.style.pointerEvents = "auto";
  menuButton.setAttribute("aria-haspopup", "true");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.addEventListener("click", () => setMenuOpen(!menuOpen));

  header.addEventListener("click", (event) => {
    const target = event.target.closest("a[data-page], #header-logo");
    if (target) {
      const href = target.getAttribute("href");
      if (href && href.startsWith("/")) {
        event.preventDefault();
        setMenuOpen(false);
        send("xlab-shared-header-navigate", { href });
        return;
      }
    }

    const contact = event.target.closest("[data-scroll-to='contact']");
    if (contact) {
      event.preventDefault();
      setMenuOpen(false);
      send("xlab-shared-header-contact");
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menuOpen &&
      !menuButton.contains(event.target) &&
      !menu.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) {
      return;
    }
    if (event.data?.type === "xlab-shared-header-locale-applied") {
      window.location.reload();
    } else if (event.data?.type === "xlab-shared-header-theme") {
      const dark = event.data.theme !== "light";
      document.documentElement.classList.toggle("is-black-bg", dark);
      document.documentElement.classList.toggle("is-white-bg", !dark);
      send("xlab-shared-header-theme-applied");
    }
  });

  const reportReady = () => {
    send("xlab-shared-header-ready", {
      height: Math.ceil(header.getBoundingClientRect().height),
    });
  };
  window.addEventListener("resize", () => {
    reportReady();
    if (menuOpen) send("xlab-shared-header-menu", { open: true });
  });
  window.requestAnimationFrame(reportReady);
})();
