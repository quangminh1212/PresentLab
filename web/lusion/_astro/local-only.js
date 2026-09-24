(() => {
  const style = document.createElement("style");
  style.textContent = "#video-overlay.is-offline-media #video-overlay__controls,#video-overlay.is-offline-media #video-overlay-cursor{display:none!important}";
  document.head.appendChild(style);

  const offlineMessage = (detail) => detail && detail.project
    ? "This Porsche: Dream Machine video is not included in the local project files."
    : "The full Lusion Reel is not included in the local project files.";

  document.addEventListener("lusion:offline-media", (event) => {
    const overlay = document.getElementById("video-overlay");
    if (!overlay) return;
    let message = document.getElementById("video-overlay__offline-message");
    if (!message) {
      message = document.createElement("div");
      message.id = "video-overlay__offline-message";
      message.setAttribute("role", "status");
      message.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;gap:1.5rem;align-items:center;justify-content:center;padding:2rem;color:#fff;text-align:center;font:500 clamp(18px,2vw,28px)/1.4 Arial,sans-serif;background:#000;z-index:5";
      const label = document.createElement("span");
      label.id = "video-overlay__offline-label";
      const close = document.createElement("button");
      close.id = "video-overlay__offline-close";
      close.type = "button";
      close.textContent = "Close";
      close.style.cssText = "padding:.7rem 1.2rem;border:1px solid #fff;border-radius:999px;color:#fff;background:transparent;font:inherit;cursor:pointer";
      message.append(label, close);
      overlay.appendChild(message);
    }
    message.querySelector("#video-overlay__offline-label").textContent = offlineMessage(event.detail);
    overlay.style.display = "block";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    overlay.classList.add("is-offline-media");
    overlay.dataset.offlineMedia = "true";
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "footer-newsletter-form") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const message = document.getElementById("footer-newsletter-feedback-message");
    if (message) message.textContent = "Newsletter sign-up is unavailable in this local copy.";
  }, true);

  const closeOverlay = () => {
    const overlay = document.getElementById("video-overlay");
    if (!overlay || overlay.dataset.offlineMedia !== "true") return;
    overlay.style.opacity = "0";
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none";
    overlay.classList.remove("is-offline-media");
    delete overlay.dataset.offlineMedia;
    overlay.dispatchEvent(new CustomEvent("lusion:offline-media-closed"));
  };
  document.addEventListener("click", (event) => {
    const overlay = document.getElementById("video-overlay");
    if (!overlay || overlay.dataset.offlineMedia !== "true") return;
    if (event.target === overlay || event.target.closest("#video-overlay__mobile-close-btn, #video-overlay__offline-close")) closeOverlay();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeOverlay();
  });
})();
