(() => {
  const style = document.createElement("style");
  style.textContent =
    "#video-overlay.is-offline-media #video-overlay__controls,#video-overlay.is-offline-media #video-overlay-cursor{display:none!important}" +
    "#header-logo .xlab-logo-crop{display:block;position:relative;flex:0 0 80px;width:80px;height:28px;overflow:hidden}" +
    "#header-logo .xlab-logo-crop img{position:absolute;top:-8.9px;left:0;display:block;width:80px;height:auto;max-width:none}" +
    "html.is-black-bg #header-logo .xlab-logo-crop img,html.is-blue-bg #header-logo .xlab-logo-crop img{filter:brightness(0) invert(1)}";
  document.head.appendChild(style);

  // Aeonik is missing several extended Vietnamese glyphs; use one complete font for Vietnamese text.
  const vietnameseFontStyle = document.createElement("style");
  vietnameseFontStyle.textContent =
    'html[lang="vi"] body,html[lang="vi"] h1,html[lang="vi"] h2,html[lang="vi"] h3,html[lang="vi"] h4,html[lang="vi"] h5,html[lang="vi"] h6,html[lang="vi"] button,html[lang="vi"] input{font-family:system-ui,sans-serif!important}' +
    'html[lang="vi"] #lusion-language-trigger,html[lang="vi"] #lusion-language-menu .lusion-language-choice,html[lang="vi"] #lusion-mobile-language-controls .lusion-mobile-language-choice{font-family:system-ui,sans-serif!important}' +
    '@media (min-width:813px){html[lang="vi"] #home-hero-title{grid-column:2/span 10!important;font-size:clamp(22px,2.5vw,48px)!important;line-height:1.08!important;text-wrap:balance!important}}' +
    '@media (max-width:812px){html[lang="vi"] #home-hero-title{grid-column:1/span 6!important;width:100%!important;font-size:clamp(12px,3.2vw,20px)!important;line-height:1.08!important;text-wrap:balance!important}}';
  document.head.appendChild(vietnameseFontStyle);

  if (new URLSearchParams(window.location.search).has("water-page-embed")) {
    const embeddedLoaderStyle = document.createElement("style");
    embeddedLoaderStyle.textContent =
      "html,body{background:#000!important}#transition-overlay{display:none!important}html:not(.lusion-embed-preloader-complete) #header-logo{visibility:hidden!important}html:not(.is-white-bg) #header-logo{color:#2eb7ad!important}html:not(.is-white-bg) #header-logo svg text{fill:#2eb7ad!important}html:not(.is-white-bg) #header-logo .xlab-logo-crop img{filter:brightness(0) saturate(100%) invert(67%) sepia(62%) saturate(559%) hue-rotate(126deg) brightness(92%) contrast(88%)!important}";
    document.head.appendChild(embeddedLoaderStyle);

    const revealLogoAfterPreloader = () => {
      const preloader = document.getElementById("preloader");
      if (!preloader) {
        document.documentElement.classList.add("lusion-embed-preloader-complete");
        return;
      }

      const observer = new MutationObserver(() => {
        if (preloader.style.display !== "none") return;
        document.documentElement.classList.add("lusion-embed-preloader-complete");
        observer.disconnect();
      });
      observer.observe(preloader, { attributes: true, attributeFilter: ["style"] });
      if (preloader.style.display === "none") {
        document.documentElement.classList.add("lusion-embed-preloader-complete");
        observer.disconnect();
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", revealLogoAfterPreloader, { once: true });
    } else {
      revealLogoAfterPreloader();
    }
  }

  const offlineMessage = (detail) =>
    detail && detail.project
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
      message.style.cssText =
        "position:absolute;inset:0;display:flex;flex-direction:column;gap:1.5rem;align-items:center;justify-content:center;padding:2rem;color:#fff;text-align:center;font:500 clamp(18px,2vw,28px)/1.4 Arial,sans-serif;background:#000;z-index:5";
      const label = document.createElement("span");
      label.id = "video-overlay__offline-label";
      const close = document.createElement("button");
      close.id = "video-overlay__offline-close";
      close.type = "button";
      close.textContent = "Close";
      close.style.cssText =
        "padding:.7rem 1.2rem;border:1px solid #fff;border-radius:999px;color:#fff;background:transparent;font:inherit;cursor:pointer";
      message.append(label, close);
      overlay.appendChild(message);
    }
    message.querySelector("#video-overlay__offline-label").textContent = offlineMessage(
      event.detail,
    );
    overlay.style.display = "block";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    overlay.classList.add("is-offline-media");
    overlay.dataset.offlineMedia = "true";
  });

  document.addEventListener(
    "submit",
    (event) => {
      if (event.target.id !== "footer-newsletter-form") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const message = document.getElementById("footer-newsletter-feedback-message");
      if (message) message.textContent = "Newsletter sign-up is unavailable in this local copy.";
    },
    true,
  );

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
    if (
      event.target === overlay ||
      event.target.closest("#video-overlay__mobile-close-btn, #video-overlay__offline-close")
    )
      closeOverlay();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeOverlay();
  });
  // Lusion multilingual support.
  const languagePack = {
    vi: {
      back: "quay l\u1ea1i",
      Contact: "Li\u00ean h\u1ec7",
      "Let's talk": "Li\u00ean h\u1ec7",
      Close: "\u0110\u00f3ng",
      "Subscribe to": "\u0110\u0103ng k\u00fd",
      Projects: "D\u1ef1 \u00e1n",
      Home: "Trang ch\u1ee7",
      Menu: "Danh m\u1ee5c",
      "About us": "V\u1ec1 ch\u00fang t\u00f4i",
      "Our Approach": "C\u00e1ch ti\u1ebfp c\u1eadn",
      Labs: "Ph\u00f2ng th\u00ed nghi\u1ec7m",
      "Featured Work": "D\u1ef1 \u00e1n ti\u00eau bi\u1ec3u",
      "scroll to explore": "cu\u1ed9n \u0111\u1ec3 kh\u00e1m ph\u00e1",
      "our newsletter": "b\u1ea3n tin c\u1ee7a ch\u00fang t\u00f4i",
      "We create 3D visual storytelling and interactive web experiences that help brands stand out":
        "Ch\u00fang t\u00f4i t\u1ea1o ra tr\u1ea3i nghi\u1ec7m web t\u01b0\u01a1ng t\u00e1c v\u00e0 k\u1ec3 chuy\u1ec7n b\u1eb1ng h\u00ecnh \u1ea3nh 3D \u0111\u1ec3 gi\u00fap c\u00e1c th\u01b0\u01a1ng hi\u1ec7u n\u1ed5i b\u1eadt",
      "We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.":
        "Ch\u00fang t\u00f4i k\u1ebft h\u1ee3p thi\u1ebft k\u1ebf, chuy\u1ec3n \u0111\u1ed9ng, 3D v\u00e0 ph\u00e1t tri\u1ec3n \u0111\u1ec3 t\u1ea1o ra nh\u1eefng tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1 \u1ea5n t\u01b0\u1ee3ng v\u1ec1 m\u1eb7t h\u00ecnh \u1ea3nh v\u00e0 li\u1ec1n m\u1ea1ch v\u1ec1 m\u1eb7t k\u1ef9 thu\u1eadt. T\u1eeb vi\u1ec7c ra m\u1eaft chi\u1ebfn d\u1ecbch \u0111\u1ebfn th\u1ebf gi\u1edbi th\u01b0\u01a1ng hi\u1ec7u s\u1ed1ng \u0111\u1ed9ng, ch\u00fang t\u00f4i x\u00e2y d\u1ef1ng c\u00f4ng vi\u1ec7c thu h\u00fat s\u1ef1 ch\u00fa \u00fd v\u00e0 m\u1eddi g\u1ecdi s\u1ef1 t\u01b0\u01a1ng t\u00e1c.",
      "Oryzo AI": "Oryzo AI",
      "A selection of immersive digital experiences created for ambitious brands and forward thinking teams.":
        "Tuy\u1ec3n t\u1eadp c\u00e1c tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1 phong ph\u00fa \u0111\u01b0\u1ee3c t\u1ea1o ra cho c\u00e1c th\u01b0\u01a1ng hi\u1ec7u \u0111\u1ea7y tham v\u1ecdng v\u00e0 c\u00e1c nh\u00f3m c\u00f3 t\u01b0 duy ti\u1ebfn b\u1ed9.",
      "Bold Ideas,": "\u00dd t\u01b0\u1edfng t\u00e1o b\u1ea1o,",
      "Brought to Life": "Mang \u0111\u1ebfn cho cu\u1ed9c s\u1ed1ng",
      "Play Reel": "Ch\u01a1i cu\u1ed9n",
      "Porsche: Dream Machine": "Porsche: Dream Machine",
      "Of The Oak": "Of The Oak",
      Everswap: "Everswap",
      "Synthetic Human": "Synthetic Human",
      "Atlas Motion": "Atlas Motion",
      "Devin AI": "Devin AI",
      "web \u2022 design \u2022 development \u2022 3d":
        "web \u2022 thi\u1ebft k\u1ebf \u2022 ph\u00e1t tri\u1ec3n \u2022 3d",
      "concept \u2022 3D illustration \u2022 mograph \u2022 video":
        "kh\u00e1i ni\u1ec7m \u2022 minh h\u1ecda 3D \u2022 \u1ea3nh ch\u1ee5p \u2022 video",
      "concept \u2022 web \u2022 design \u2022 development \u2022 3d \u2022 animation":
        "kh\u00e1i ni\u1ec7m \u2022 web \u2022 thi\u1ebft k\u1ebf \u2022 ph\u00e1t tri\u1ec3n \u2022 3d \u2022 ho\u1ea1t h\u00ecnh",
      "Choo Choo World": "Choo Choo World",
      "DDD 2024": "DDD 2024",
      "Meta: Spatial Fusion": "Meta: Spatial Fusion",
      "Spaace - NFT Marketplace": "Spaace - NFT Marketplace",
      "See all projects": "Xem t\u1ea5t c\u1ea3 d\u1ef1 \u00e1n",
      "web \u2022 design \u2022 development \u2022 3d \u2022 animation":
        "web \u2022 thi\u1ebft k\u1ebf \u2022 ph\u00e1t tri\u1ec3n \u2022 3d \u2022 ho\u1ea1t h\u00ecnh",
      "web \u2022 design \u2022 development \u2022 3d \u2022 web3":
        "web \u2022 thi\u1ebft k\u1ebf \u2022 ph\u00e1t tri\u1ec3n \u2022 3d \u2022 web3",
      "AR \u2022 development \u2022 3d": "AR \u2022 ph\u00e1t tri\u1ec3n \u2022 3d",
      "concept \u2022 web \u2022 game design \u2022 3d":
        "kh\u00e1i ni\u1ec7m \u2022 web \u2022 thi\u1ebft k\u1ebf tr\u00f2 ch\u01a1i \u2022 3d",
      "Where Creative Ideas Become Immersive Experiences":
        "N\u01a1i \u00fd t\u01b0\u1edfng s\u00e1ng t\u1ea1o tr\u1edf th\u00e0nh tr\u1ea3i nghi\u1ec7m s\u1ed1ng \u0111\u1ed9ng",
      PRODUCTION: "S\u1ea2N XU\u1ea4T",
      "We do not chase trends or produce work that looks like everyone else. We focus on creating visually distinctive digital experiences that reflect your brand, engage your audience, and make people remember what they saw.":
        "Ch\u00fang t\u00f4i kh\u00f4ng theo \u0111u\u1ed5i xu h\u01b0\u1edbng ho\u1eb7c t\u1ea1o ra t\u00e1c ph\u1ea9m gi\u1ed1ng nh\u01b0 nh\u1eefng ng\u01b0\u1eddi kh\u00e1c. Ch\u00fang t\u00f4i t\u1eadp trung v\u00e0o vi\u1ec7c t\u1ea1o ra nh\u1eefng tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1 \u0111\u1eb7c bi\u1ec7t v\u1ec1 m\u1eb7t h\u00ecnh \u1ea3nh \u0111\u1ec3 ph\u1ea3n \u00e1nh th\u01b0\u01a1ng hi\u1ec7u c\u1ee7a b\u1ea1n, thu h\u00fat kh\u00e1n gi\u1ea3 v\u00e0 khi\u1ebfn m\u1ecdi ng\u01b0\u1eddi ghi nh\u1edb nh\u1eefng g\u00ec h\u1ecd \u0111\u00e3 th\u1ea5y.",
      "Our process blends creative direction, 3D craft, and interactive development to build tailored digital journeys that feel original, polished, and built for impact.":
        "Quy tr\u00ecnh c\u1ee7a ch\u00fang t\u00f4i k\u1ebft h\u1ee3p \u0111\u1ecbnh h\u01b0\u1edbng s\u00e1ng t\u1ea1o, k\u1ef9 thu\u1eadt 3D v\u00e0 ph\u00e1t tri\u1ec3n t\u01b0\u01a1ng t\u00e1c \u0111\u1ec3 x\u00e2y d\u1ef1ng c\u00e1c h\u00e0nh tr\u00ecnh k\u1ef9 thu\u1eadt s\u1ed1 ph\u00f9 h\u1ee3p mang l\u1ea1i c\u1ea3m gi\u00e1c nguy\u00ean b\u1ea3n, b\u00f3ng b\u1ea9y v\u00e0 \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng \u0111\u1ec3 t\u1ea1o ra t\u00e1c \u0111\u1ed9ng.",
      "Step into a new world": "B\u01b0\u1edbc v\u00e0o m\u1ed9t th\u1ebf gi\u1edbi m\u1edbi",
      "Soda Experience": "Soda Experience",
      STUDIO: "PH\u00d2NG THU",
      "imagination run wild": "tr\u00ed t\u01b0\u1edfng t\u01b0\u1ee3ng bay b\u1ed5ng",
      "and let your": "v\u00e0 \u0111\u1ec3 b\u1ea1n",
      of: "c\u1ee7a",
      "A CREATIVE": "M\u1ed8T S\u00c1NG T\u1ea0O",
      "WE ARE": "CH\u00daNG T\u00d4I L\u00c0",
      "SCROLL TO EXPLORE": "CU\u1ed8N \u0110\u1ec2 KH\u00c1M PH\u00c1",
      "DIGITAL EXPERIENCES": "TR\u1ea2I NGHI\u1ec6M K\u1ef8 THU\u1eacT S\u1ed0",
      "experiences.": "nh\u1eefng tr\u1ea3i nghi\u1ec7m.",
      "Creative Director": "Gi\u00e1m \u0111\u1ed1c s\u00e1ng t\u1ea1o",
      "motion, 3D, and technology": "chuy\u1ec3n \u0111\u1ed9ng, 3D v\u00e0 c\u00f4ng ngh\u1ec7",
      "turn ambitious ideas into":
        "bi\u1ebfn nh\u1eefng \u00fd t\u01b0\u1edfng \u0111\u1ea7y tham v\u1ecdng th\u00e0nh",
      "Edan Kwan": "Edan Kwan",
      "working together to": "l\u00e0m vi\u1ec7c c\u00f9ng nhau \u0111\u1ec3",
      "A worldwide team": "M\u1ed9t \u0111\u1ed9i to\u00e0n c\u1ea7u",
      "specialists in design,": "chuy\u00ean gia thi\u1ebft k\u1ebf,",
      "immersive digital": "k\u1ef9 thu\u1eadt s\u1ed1 nh\u1eadp vai",
      "Cofounder &": "\u0110\u1ed3ng s\u00e1ng l\u1eadp &",
      "CRAFTING UNIQUE": "TH\u1ee6 C\u00d4NG \u0110\u1ed8C \u0110\u00c1O",
      "BRANDS WE WORK WITH":
        "TH\u01af\u01a0NG HI\u1ec6U CH\u00daNG T\u00d4I L\u00c0M VI\u1ec6C V\u1edaI",
      Awwwards: "Awwwards",
      Awards: "gi\u1ea3i th\u01b0\u1edfng",
      "Site of the Month": "Trang web c\u1ee7a th\u00e1ng",
      "Honorable Mention": "\u0110\u1ec1 c\u1eadp \u0111\u00e1ng tr\u00e2n tr\u1ecdng",
      "Site of the Day": "Trang web c\u1ee7a ng\u00e0y",
      "We combine different disciplines into one creative production process, allowing ideas to move from concept to execution with clarity and craft. The result is digital work that feels distinctive, technically refined, and built to make a lasting impact.":
        "Ch\u00fang t\u00f4i k\u1ebft h\u1ee3p c\u00e1c nguy\u00ean t\u1eafc kh\u00e1c nhau v\u00e0o m\u1ed9t quy tr\u00ecnh s\u1ea3n xu\u1ea5t s\u00e1ng t\u1ea1o, cho ph\u00e9p c\u00e1c \u00fd t\u01b0\u1edfng chuy\u1ec3n t\u1eeb \u00fd t\u01b0\u1edfng sang th\u1ef1c hi\u1ec7n m\u1ed9t c\u00e1ch r\u00f5 r\u00e0ng v\u00e0 kh\u00e9o l\u00e9o. K\u1ebft qu\u1ea3 l\u00e0 t\u00e1c ph\u1ea9m k\u1ef9 thu\u1eadt s\u1ed1 mang l\u1ea1i c\u1ea3m gi\u00e1c kh\u00e1c bi\u1ec7t, tinh t\u1ebf v\u1ec1 m\u1eb7t k\u1ef9 thu\u1eadt v\u00e0 \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng \u0111\u1ec3 t\u1ea1o ra t\u00e1c \u0111\u1ed9ng l\u00e2u d\u00e0i.",
      "Site of the Year": "Trang web c\u1ee7a n\u0103m",
      "Swipe to change": "Vu\u1ed1t \u0111\u1ec3 thay \u0111\u1ed5i",
      CSSDA: "CSSDA",
      "Webby Winner": "Ng\u01b0\u1eddi chi\u1ebfn th\u1eafng Webby",
      "Webby Awards": "Webby Awards",
      FWA: "FWA",
      "Agency Site of the Year": "Trang web \u0111\u1ea1i l\u00fd c\u1ee7a n\u0103m",
      "Developer Site of the Year":
        "Trang web d\u00e0nh cho nh\u00e0 ph\u00e1t tri\u1ec3n c\u1ee7a n\u0103m",
      Articles: "b\u00e0i vi\u1ebft",
      "Trusted by global brands, cultural institutions, and forward thinking teams.":
        "\u0110\u01b0\u1ee3c c\u00e1c th\u01b0\u01a1ng hi\u1ec7u to\u00e0n c\u1ea7u, c\u00e1c t\u1ed5 ch\u1ee9c v\u0103n h\u00f3a v\u00e0 c\u00e1c nh\u00f3m t\u01b0 duy ti\u1ebfn b\u1ed9 tin c\u1eady.",
      "Porsche Newsroom - Driven By Dream":
        "Ph\u00f2ng tin t\u1ee9c Porsche - D\u1eabn d\u1eaft b\u1edfi \u01b0\u1edbc m\u01a1",
      "The Drum Awards for Design":
        "Gi\u1ea3i th\u01b0\u1edfng Tr\u1ed1ng v\u1ec1 Thi\u1ebft k\u1ebf",
      CommArts: "CommArts",
      "Lovie Winner": "Ng\u01b0\u1eddi chi\u1ebfn th\u1eafng t\u00ecnh y\u00eau",
      "Best-in-show Interactive":
        "T\u01b0\u01a1ng t\u00e1c t\u1ed1t nh\u1ea5t trong ch\u01b0\u01a1ng tr\u00ecnh",
      "Lovie Awards": "Lovie Awards",
      "Drum Awards": "Gi\u1ea3i tr\u1ed1ng",
      "Webby Nominee": "Ng\u01b0\u1eddi \u0111\u01b0\u1ee3c \u0111\u1ec1 c\u1eed Webby",
      Talks: "Cu\u1ed9c n\u00f3i chuy\u1ec7n",
      "Opera North - The Turn of the Screw": "Opera North - The Turn of the Screw",
      "Wallpaper - Driven by Dreams":
        "H\u00ecnh n\u1ec1n - \u0110\u01b0\u1ee3c th\u00fac \u0111\u1ea9y b\u1edfi nh\u1eefng gi\u1ea5c m\u01a1",
      "Digital Design Days": "Digital Design Days",
      EXPERTISE: "KINH NGHI\u1ec6M",
      "KIKK Festival": "KIKK Festival",
      "Oct 2024 Milan": "Th\u00e1ng 10 n\u0103m 2024 Milano",
      "Oct 2023 Amsterdam": "Th\u00e1ng 10 n\u0103m 2023 Amsterdam",
      "Oct 2022 Amsterdam": "Th\u00e1ng 10 n\u0103m 2022 Amsterdam",
      "Grow Paris": "Grow Paris",
      "AREA OF": "DI\u1ec6N T\u00cdCH C\u1ee6A",
      "Awwwards Conf": "Awwwards Conf",
      "Oct 2023 Namur": "Th\u00e1ng 10 n\u0103m 2023",
      "Nov 2018 Paris": "Th\u00e1ng 11 n\u0103m 2018 Paris",
      "Multidisciplinary expertise across strategy, creative, technology, and production.":
        "Chuy\u00ean m\u00f4n \u0111a ng\u00e0nh v\u1ec1 chi\u1ebfn l\u01b0\u1ee3c, s\u00e1ng t\u1ea1o, c\u00f4ng ngh\u1ec7 v\u00e0 s\u1ea3n xu\u1ea5t.",
      Strategy: "Chi\u1ebfn l\u01b0\u1ee3c",
      s: "S",
      Research: "Nghi\u00ean c\u1ee9u",
      "Technology Strategy": "Chi\u1ebfn l\u01b0\u1ee3c c\u00f4ng ngh\u1ec7",
      d: "d",
      "Creative Direction": "H\u01b0\u1edbng s\u00e1ng t\u1ea1o",
      Discovery: "Kh\u00e1m ph\u00e1",
      t: "t",
      c: "c",
      "UX/UI Design": "Thi\u1ebft k\u1ebf UX/UI",
      "Motion Design": "Thi\u1ebft k\u1ebf chuy\u1ec3n \u0111\u1ed9ng",
      Illustration: "H\u00ecnh minh h\u1ecda",
      Creative: "S\u00e1ng t\u1ea1o",
      Tech: "C\u00f4ng ngh\u1ec7",
      "Interactive Design": "Thi\u1ebft k\u1ebf t\u01b0\u01a1ng t\u00e1c",
      Production: "S\u1ea3n xu\u1ea5t",
      P: "P",
      "Digital Experience Strategy":
        "Chi\u1ebfn l\u01b0\u1ee3c tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1",
      "Interactive Installations": "C\u00e0i \u0111\u1eb7t t\u01b0\u01a1ng t\u00e1c",
      Animation: "Ho\u1ea1t h\u00ecnh",
      "WebGL Development": "Ph\u00e1t tri\u1ec3n WebGL",
      "Art Direction": "Ch\u1ec9 \u0111\u1ea1o ngh\u1ec7 thu\u1eadt",
      "3D Optimization": "T\u1ed1i \u01b0u h\u00f3a 3D",
      "3D Asset Creation": "T\u1ea1o n\u1ed9i dung 3D",
      "Front End Development": "Ph\u00e1t tri\u1ec3n giao di\u1ec7n ng\u01b0\u1eddi d\u00f9ng",
      "Procedural Modeling": "M\u00f4 h\u00ecnh th\u1ee7 t\u1ee5c",
      "Unity/Unreal": "Th\u1ed1ng nh\u1ea5t/Kh\u00f4ng th\u1ef1c",
      "AR and VR Experiences": "Tr\u1ea3i nghi\u1ec7m AR v\u00e0 VR",
      "api design \u2022 webgl \u2022 3d": "thi\u1ebft k\u1ebf api \u2022 webgl \u2022 3d",
      "design \u2022 development \u2022 3d":
        "thi\u1ebft k\u1ebf \u2022 ph\u00e1t tri\u1ec3n \u2022 3d",
      "concept \u2022 design \u2022 development \u2022 3d":
        "kh\u00e1i ni\u1ec7m \u2022 thi\u1ebft k\u1ebf \u2022 ph\u00e1t tri\u1ec3n \u2022 3d",
      "Worldcoin Globe": "Worldcoin Globe",
      "3D Pipeline Development": "Ph\u00e1t tri\u1ec3n \u0111\u01b0\u1eddng \u1ed1ng 3D",
      "Zero Tech": "Zero Tech",
      "Lusion Labs": "Lusion Labs",
      PROJECTS: "D\u1ef0 \u00c1N",
      "together!": "c\u00f9ng nhau!",
      "Let's work": "H\u00e3y l\u00e0m vi\u1ec7c",
      "Max Mara: Bearing Gifts": "Max Mara: Bearing Gifts",
      "development \u2022 3D": "ph\u00e1t tri\u1ec3n \u2022 3D",
      "CONTINUE TO SCROLL": "TI\u1ebeP T\u1ee4C CU\u1ed8N",
      "The Turn Of The Screw": "The Turn Of The Screw",
      "Suite 2": "Ph\u00f2ng 2",
      "Is Your Big Idea Ready to Go Wild?":
        "\u00dd t\u01b0\u1edfng l\u1edbn c\u1ee7a b\u1ea1n \u0111\u00e3 s\u1eb5n s\u00e0ng \u0111\u1ec3 ph\u00e1t tri\u1ec3n ch\u01b0a?",
      "My Little Storybook": "My Little Storybook",
      "Infinite Passerella": "Infinite Passerella",
      "United Kingdom": "United Kingdom",
      Instagram: "Instagram",
      Linkedin: "Linkedin",
      "Built by Lusion with \u2764\ufe0f":
        "\u0110\u01b0\u1ee3c x\u00e2y d\u1ef1ng b\u1edfi Lusion v\u1edbi \u2764\ufe0f",
      "9 Marsh Street": "9 \u0111\u01b0\u1eddng \u0111\u1ea7m l\u1ea7y",
      "R&D: labs.lusion.co": "R&D: labs.lusion.co",
      "Twitter / X": "Twitter / X",
      "business@lusion.co": "business@lusion.co",
      "New business": "Kinh doanh m\u1edbi",
      "\u00a92026 LUSION Creative Studio": "\u00a92026 LUSION Creative Studio",
      "General enquires": "Th\u1eafc m\u1eafc chung",
      "Bristol, BS1 4AA": "Bristol, BS1 4AA",
      "hello@lusion.co": "hello@lusion.co",
      "Your email": "Email c\u1ee7a b\u1ea1n",
      "Next Page": "Trang ti\u1ebfp theo",
      "About Us": "V\u1ec1 ch\u00fang t\u00f4i",
      PLAY: "PH\u00c1T",
      Back: "M\u1eb7t sau",
      MUTE: "T\u1eaeT TI\u1ebeNG",
      "Our Projects": "D\u1ef1 \u00e1n c\u1ee7a ch\u00fang t\u00f4i",
      "to Learn More": "\u0111\u1ec3 t\u00ecm hi\u1ec3u th\u00eam",
      "Keep Scrolling": "Ti\u1ebfp t\u1ee5c cu\u1ed9n",
      "Go to home page": "T\u1edbi trang ch\u1ee7",
      "Lusion - About Us": "Lusion - V\u1ec1 ch\u00fang t\u00f4i",
      "Watch reel button": "N\u00fat cu\u1ed9n \u0111\u1ed3ng h\u1ed3",
      "Menu button": "N\u00fat tr\u00ecnh \u0111\u01a1n",
      "Send newsletter form button": "N\u00fat g\u1eedi b\u1ea3n tin",
      Services: "D\u1ecbch v\u1ee5",
      Concept: "\u00dd t\u01b0\u1edfng",
      "Web Development": "Ph\u00e1t tri\u1ec3n Web",
      WebGL: "WebGL",
      "We design and produce 3D visual storytelling, immersive websites, and interactive digital experiences that help brands stand out online.":
        "Ch\u00fang t\u00f4i thi\u1ebft k\u1ebf v\u00e0 s\u1ea3n xu\u1ea5t c\u00e1ch k\u1ec3 chuy\u1ec7n b\u1eb1ng h\u00ecnh \u1ea3nh 3D, trang web s\u1ed1ng \u0111\u1ed9ng v\u00e0 tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1 t\u01b0\u01a1ng t\u00e1c gi\u00fap c\u00e1c th\u01b0\u01a1ng hi\u1ec7u n\u1ed5i b\u1eadt tr\u1ef1c tuy\u1ebfn.",
      "Lusion works with a wide range of clients including global brands, startups and agencies.":
        "Lusion l\u00e0m vi\u1ec7c v\u1edbi nhi\u1ec1u kh\u00e1ch h\u00e0ng bao g\u1ed3m c\u00e1c th\u01b0\u01a1ng hi\u1ec7u to\u00e0n c\u1ea7u, c\u00e1c c\u00f4ng ty kh\u1edfi nghi\u1ec7p v\u00e0 \u0111\u1ea1i l\u00fd.",
      "Lusion is a boutique creative production studio with wide range of talents and capabilities for your next project.":
        "Lusion l\u00e0 m\u1ed9t studio s\u1ea3n xu\u1ea5t s\u00e1ng t\u1ea1o mang phong c\u00e1ch boutique v\u1edbi nhi\u1ec1u t\u00e0i n\u0103ng v\u00e0 n\u0103ng l\u1ef1c cho d\u1ef1 \u00e1n ti\u1ebfp theo c\u1ee7a b\u1ea1n.",
      Links: "Li\u00ean k\u1ebft",
      "3D Design": "Thi\u1ebft k\u1ebf 3D",
      "Web Design": "Thi\u1ebft K\u1ebf Web",
      "Lusion - Our Projects": "Lusion - D\u1ef1 \u00e1n c\u1ee7a ch\u00fang t\u00f4i",
      "Launch Project": "Xem d\u1ef1 \u00e1n",
      "Game Design": "Thi\u1ebft k\u1ebf tr\u00f2 ch\u01a1i",
      "Lusion - Atlas Motion": "Lusion - Atlas Motion",
      "Our detailed case study on Atlas Motion. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Atlas Motion. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "NEXT PROJECT": "D\u1ef1 \u00c1N TI\u1ebeP THEO",
      "FWA SOTD": "FWA SOTD",
      "Awwwards HM": "Awwards HM",
      "Lusion - Award Winning 3D and Interactive Web Studio":
        "Lusion - Studio web t\u01b0\u01a1ng t\u00e1c v\u00e0 3D t\u1eebng \u0111o\u1ea1t gi\u1ea3i th\u01b0\u1edfng",
      "Creative Coding": "M\u00e3 h\u00f3a s\u00e1ng t\u1ea1o",
      "Frontend development": "Ph\u00e1t tri\u1ec3n giao di\u1ec7n ng\u01b0\u1eddi d\u00f9ng",
      "Lusion - Choo Choo World": "Lusion - Choo Choo World",
      "UI/UX design": "Thi\u1ebft k\u1ebf UI/UX",
      "3D Visual design": "Thi\u1ebft k\u1ebf tr\u1ef1c quan 3D",
      "Our detailed case study on Choo Choo World. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u tr\u01b0\u1eddng h\u1ee3p chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Choo Choo World. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Our detailed case study on DDD 2024. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 DDD 2024. Do Lusion s\u1ea3n xu\u1ea5t.",
      "We partnered with Cognition AI to create a modern website for Devin, their AI software engineer. The challenge was to communicate a complex AI product in a way that felt clear, sleek, and accessible.":
        "Ch\u00fang t\u00f4i h\u1ee3p t\u00e1c v\u1edbi Cognition AI \u0111\u1ec3 t\u1ea1o m\u1ed9t trang web hi\u1ec7n \u0111\u1ea1i cho Devin, k\u1ef9 s\u01b0 ph\u1ea7n m\u1ec1m AI c\u1ee7a h\u1ecd. Th\u00e1ch th\u1ee9c l\u00e0 truy\u1ec1n \u0111\u1ea1t m\u1ed9t s\u1ea3n ph\u1ea9m AI ph\u1ee9c t\u1ea1p theo c\u00e1ch r\u00f5 r\u00e0ng, m\u01b0\u1ee3t m\u00e0 v\u00e0 d\u1ec5 ti\u1ebfp c\u1eadn.",
      Spaace: "kh\u00f4ng gian",
      "Lusion - DDD 2024": "Lusion - DDD 2024",
      "With a community-building feature, users shared game snapshots on social media, showcasing engagement strategies. Choo Choo World embodies Lusion's commitment to innovative web technology, inspiring both children and adults":
        "V\u1edbi t\u00ednh n\u0103ng x\u00e2y d\u1ef1ng c\u1ed9ng \u0111\u1ed3ng, ng\u01b0\u1eddi d\u00f9ng \u0111\u00e3 chia s\u1ebb \u1ea3nh ch\u1ee5p nhanh tr\u00f2 ch\u01a1i tr\u00ean m\u1ea1ng x\u00e3 h\u1ed9i, th\u1ec3 hi\u1ec7n c\u00e1c chi\u1ebfn l\u01b0\u1ee3c t\u01b0\u01a1ng t\u00e1c. Choo Choo World th\u1ec3 hi\u1ec7n cam k\u1ebft c\u1ee7a Lusion \u0111\u1ed1i v\u1edbi c\u00f4ng ngh\u1ec7 web \u0111\u1ed5i m\u1edbi, truy\u1ec1n c\u1ea3m h\u1ee9ng cho c\u1ea3 tr\u1ebb em v\u00e0 ng\u01b0\u1eddi l\u1edbn",
      "Lusion - Devin AI": "Lusion - Devin AI",
      "Our detailed case study on Devin AI. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Devin AI. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Through subtle storytelling, animation, and interactive design, we introduced Devin\u2019s features in a more engaging way and created a polished experience that felt both advanced and approachable.":
        "Th\u00f4ng qua c\u00e1ch k\u1ec3 chuy\u1ec7n tinh t\u1ebf, ho\u1ea1t h\u00ecnh v\u00e0 thi\u1ebft k\u1ebf t\u01b0\u01a1ng t\u00e1c, ch\u00fang t\u00f4i \u0111\u00e3 gi\u1edbi thi\u1ec7u c\u00e1c t\u00ednh n\u0103ng c\u1ee7a Devin theo c\u00e1ch h\u1ea5p d\u1eabn h\u01a1n v\u00e0 t\u1ea1o ra tr\u1ea3i nghi\u1ec7m b\u00f3ng b\u1ea9y, v\u1eeba n\u00e2ng cao v\u1eeba d\u1ec5 ti\u1ebfp c\u1eadn.",
      "Digital Design Days is a 3-day experience that gathers in one place thousands of the world\u2019s best professionals with the brightest creativity minds in the industry and the most innovative brands.":
        "Digital Design Days l\u00e0 tr\u1ea3i nghi\u1ec7m k\u00e9o d\u00e0i 3 ng\u00e0y quy t\u1ee5 h\u00e0ng ngh\u00ecn chuy\u00ean gia gi\u1ecfi nh\u1ea5t th\u1ebf gi\u1edbi v\u1edbi nh\u1eefng b\u1ed9 \u00f3c s\u00e1ng t\u1ea1o xu\u1ea5t s\u1eafc nh\u1ea5t trong ng\u00e0nh v\u00e0 nh\u1eefng th\u01b0\u01a1ng hi\u1ec7u s\u00e1ng t\u1ea1o nh\u1ea5t t\u1ea1i m\u1ed9t n\u01a1i.",
      "Atlas is building next generation motion systems for drones, robotics, and autonomous hardware. We worked with the team to create a focused digital experience that turns a complex manufacturing story into something clear, confident, and tangible. The site introduces Atlas\u2019 joint development model, brings their product and factory story to the surface, and uses precise motion, visual pacing, and selective WebGL to communicate the scale of their ambition without losing the seriousness of the category.":
        "Atlas \u0111ang x\u00e2y d\u1ef1ng c\u00e1c h\u1ec7 th\u1ed1ng chuy\u1ec3n \u0111\u1ed9ng th\u1ebf h\u1ec7 ti\u1ebfp theo cho m\u00e1y bay kh\u00f4ng ng\u01b0\u1eddi l\u00e1i, robot v\u00e0 ph\u1ea7n c\u1ee9ng t\u1ef1 \u0111\u1ed9ng. Ch\u00fang t\u00f4i \u0111\u00e3 l\u00e0m vi\u1ec7c v\u1edbi nh\u00f3m \u0111\u1ec3 t\u1ea1o ra tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1 t\u1eadp trung, bi\u1ebfn c\u00e2u chuy\u1ec7n s\u1ea3n xu\u1ea5t ph\u1ee9c t\u1ea1p th\u00e0nh \u0111i\u1ec1u g\u00ec \u0111\u00f3 r\u00f5 r\u00e0ng, t\u1ef1 tin v\u00e0 h\u1eefu h\u00ecnh. Trang web gi\u1edbi thi\u1ec7u m\u00f4 h\u00ecnh ph\u00e1t tri\u1ec3n chung c\u1ee7a Atlas, gi\u1edbi thi\u1ec7u c\u00e2u chuy\u1ec7n v\u1ec1 s\u1ea3n ph\u1ea9m v\u00e0 nh\u00e0 m\u00e1y c\u1ee7a h\u1ecd, \u0111\u1ed3ng th\u1eddi s\u1eed d\u1ee5ng chuy\u1ec3n \u0111\u1ed9ng ch\u00ednh x\u00e1c, nh\u1ecbp \u0111\u1ed9 tr\u1ef1c quan v\u00e0 WebGL ch\u1ecdn l\u1ecdc \u0111\u1ec3 truy\u1ec1n \u0111\u1ea1t quy m\u00f4 tham v\u1ecdng c\u1ee7a h\u1ecd m\u00e0 kh\u00f4ng l\u00e0m m\u1ea5t \u0111i t\u00ednh nghi\u00eam t\u00fac c\u1ee7a danh m\u1ee5c.",
      "Choo Choo World, a research project by Lusion, aimed to create an enjoyable mini game for all ages, demonstrating web technology's positive potential. It offered a fun introduction to the web, aligned with Lusion\u2019s founders' experiences as parents.":
        "Choo Choo World, m\u1ed9t d\u1ef1 \u00e1n nghi\u00ean c\u1ee9u c\u1ee7a Lusion, nh\u1eb1m m\u1ee5c \u0111\u00edch t\u1ea1o ra m\u1ed9t tr\u00f2 ch\u01a1i nh\u1ecf th\u00fa v\u1ecb d\u00e0nh cho m\u1ecdi l\u1ee9a tu\u1ed5i, th\u1ec3 hi\u1ec7n ti\u1ec1m n\u0103ng t\u00edch c\u1ef1c c\u1ee7a c\u00f4ng ngh\u1ec7 web. N\u00f3 cung c\u1ea5p ph\u1ea7n gi\u1edbi thi\u1ec7u th\u00fa v\u1ecb v\u1ec1 web, ph\u00f9 h\u1ee3p v\u1edbi tr\u1ea3i nghi\u1ec7m c\u1ee7a nh\u1eefng ng\u01b0\u1eddi s\u00e1ng l\u1eadp Lusion v\u1edbi t\u01b0 c\u00e1ch l\u00e0 cha m\u1eb9.",
      "Porsche:<br>Dream Machine": "Porsche:<br>Dream Machine",
      "Our detailed case study on Everswap. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Everswap. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Lusion - Everswap": "Lusion - Everswap",
      "Awwwards SOTD": "Gi\u1ea3i th\u01b0\u1edfng SOTD",
      "A New Era in Fashion Showcase. Lusion's R&D journey transforms fashion shows into interactive virtual experiences, inviting viewers worldwide to a 24/7 spectacle.":
        "M\u1ed9t k\u1ef7 nguy\u00ean m\u1edbi trong tr\u01b0ng b\u00e0y th\u1eddi trang. H\u00e0nh tr\u00ecnh R&D c\u1ee7a Lusion bi\u1ebfn c\u00e1c bu\u1ed5i tr\u00ecnh di\u1ec5n th\u1eddi trang th\u00e0nh nh\u1eefng tr\u1ea3i nghi\u1ec7m t\u01b0\u01a1ng t\u00e1c \u1ea3o, m\u1eddi ng\u01b0\u1eddi xem tr\u00ean to\u00e0n th\u1ebf gi\u1edbi \u0111\u1ebfn xem bu\u1ed5i tr\u00ecnh di\u1ec5n 24/7.",
      "Our detailed case study on Lusion Labs. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Lusion Labs. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Our detailed case study on Infinite Passerella. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u tr\u01b0\u1eddng h\u1ee3p chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Passerella v\u00f4 h\u1ea1n. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Lusion - Infinite Passerella": "Lusion - Infinite Passerella",
      "Strategic decisions ensured consistent experiences across devices, including non-real-time lighting for optimized performance. Collaborating with 3D modeling vendors enriched the application with carefully designed assets, seamlessly integrating our services.":
        "C\u00e1c quy\u1ebft \u0111\u1ecbnh chi\u1ebfn l\u01b0\u1ee3c \u0111\u1ea3m b\u1ea3o tr\u1ea3i nghi\u1ec7m nh\u1ea5t qu\u00e1n tr\u00ean c\u00e1c thi\u1ebft b\u1ecb, bao g\u1ed3m c\u1ea3 h\u1ec7 th\u1ed1ng chi\u1ebfu s\u00e1ng kh\u00f4ng theo th\u1eddi gian th\u1ef1c \u0111\u1ec3 c\u00f3 hi\u1ec7u su\u1ea5t t\u1ed1i \u01b0u. Vi\u1ec7c c\u1ed9ng t\u00e1c v\u1edbi c\u00e1c nh\u00e0 cung c\u1ea5p m\u00f4 h\u00ecnh 3D \u0111\u00e3 l\u00e0m phong ph\u00fa th\u00eam \u1ee9ng d\u1ee5ng b\u1eb1ng c\u00e1c n\u1ed9i dung \u0111\u01b0\u1ee3c thi\u1ebft k\u1ebf c\u1ea9n th\u1eadn, t\u00edch h\u1ee3p li\u1ec1n m\u1ea1ch c\u00e1c d\u1ecbch v\u1ee5 c\u1ee7a ch\u00fang t\u00f4i.",
      "Meticulously crafted clothing textures and 3D models seamlessly merge fashion and technology, captivating enthusiasts. This pioneering project bridges the realms of fashion and digital innovation, paving the way for the future of virtual fashion.":
        "H\u1ecda ti\u1ebft qu\u1ea7n \u00e1o \u0111\u01b0\u1ee3c ch\u1ebf t\u00e1c t\u1ec9 m\u1ec9 v\u00e0 m\u00f4 h\u00ecnh 3D k\u1ebft h\u1ee3p ho\u00e0n h\u1ea3o gi\u1eefa th\u1eddi trang v\u00e0 c\u00f4ng ngh\u1ec7, l\u00e0m say l\u00f2ng nh\u1eefng ng\u01b0\u1eddi \u0111am m\u00ea. D\u1ef1 \u00e1n ti\u00ean phong n\u00e0y l\u00e0 c\u1ea7u n\u1ed1i gi\u1eefa l\u0129nh v\u1ef1c th\u1eddi trang v\u00e0 \u0111\u1ed5i m\u1edbi k\u1ef9 thu\u1eadt s\u1ed1, m\u1edf \u0111\u01b0\u1eddng cho t\u01b0\u01a1ng lai c\u1ee7a th\u1eddi trang \u1ea3o.",
      "Pioneering the Future of Tech-Driven Advertising. For our clients, this website unveils uncharted possibilities. Displaying our prowess with groundbreaking tech, it inspires fresh avenues for captivating and engaging target audiences.":
        "Ti\u00ean phong cho t\u01b0\u01a1ng lai c\u1ee7a qu\u1ea3ng c\u00e1o d\u1ef1a tr\u00ean c\u00f4ng ngh\u1ec7. \u0110\u1ed1i v\u1edbi kh\u00e1ch h\u00e0ng c\u1ee7a ch\u00fang t\u00f4i, trang web n\u00e0y ti\u1ebft l\u1ed9 nh\u1eefng kh\u1ea3 n\u0103ng ch\u01b0a \u0111\u01b0\u1ee3c kh\u00e1m ph\u00e1. Th\u1ec3 hi\u1ec7n n\u0103ng l\u1ef1c c\u1ee7a ch\u00fang t\u00f4i b\u1eb1ng c\u00f4ng ngh\u1ec7 \u0111\u1ed9t ph\u00e1, n\u00f3 truy\u1ec1n c\u1ea3m h\u1ee9ng cho nh\u1eefng con \u0111\u01b0\u1eddng m\u1edbi \u0111\u1ec3 thu h\u00fat v\u00e0 thu h\u00fat kh\u00e1n gi\u1ea3 m\u1ee5c ti\u00eau.",
      "Collaborating with LOW: Transforming Digital Experiences. Our partnership on the MaxMara project showcases how creativity shapes digital landscapes. LOW's vision for a charming interactive web experience led to Max the Teddy guiding users through playful scenes and product showcases.":
        "H\u1ee3p t\u00e1c v\u1edbi LOW: Chuy\u1ec3n \u0111\u1ed5i tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1. S\u1ef1 h\u1ee3p t\u00e1c c\u1ee7a ch\u00fang t\u00f4i trong d\u1ef1 \u00e1n MaxMara cho th\u1ea5y s\u1ef1 s\u00e1ng t\u1ea1o \u0111\u1ecbnh h\u00ecnh c\u1ea3nh quan k\u1ef9 thu\u1eadt s\u1ed1 nh\u01b0 th\u1ebf n\u00e0o. T\u1ea7m nh\u00ecn c\u1ee7a LOW v\u1ec1 tr\u1ea3i nghi\u1ec7m web t\u01b0\u01a1ng t\u00e1c h\u1ea5p d\u1eabn \u0111\u00e3 d\u1eabn \u0111\u1ebfn vi\u1ec7c Max Teddy h\u01b0\u1edbng d\u1eabn ng\u01b0\u1eddi d\u00f9ng qua c\u00e1c c\u1ea3nh vui nh\u1ed9n v\u00e0 gi\u1edbi thi\u1ec7u s\u1ea3n ph\u1ea9m.",
      "Lusion - Lusion Labs": "Lusion - Lusion Labs",
      "Lusion's Dedication to Innovation and Exploration. Our dedicated space showcases internal R&D initiatives, reflecting our commitment to tech advancement. With a sleek, enchanting design, the site offers exclusive insights into our ongoing research, sparking curiosity and inspiring engaging experiences.":
        "S\u1ef1 c\u1ed1ng hi\u1ebfn c\u1ee7a Lusion cho s\u1ef1 \u0111\u1ed5i m\u1edbi v\u00e0 kh\u00e1m ph\u00e1. Kh\u00f4ng gian d\u00e0nh ri\u00eang c\u1ee7a ch\u00fang t\u00f4i tr\u01b0ng b\u00e0y c\u00e1c s\u00e1ng ki\u1ebfn \u200b\u200bR&D n\u1ed9i b\u1ed9, ph\u1ea3n \u00e1nh cam k\u1ebft c\u1ee7a ch\u00fang t\u00f4i \u0111\u1ed1i v\u1edbi ti\u1ebfn b\u1ed9 c\u00f4ng ngh\u1ec7. V\u1edbi thi\u1ebft k\u1ebf \u0111\u1eb9p m\u1eaft, \u0111\u1ea7y m\u00ea ho\u1eb7c, trang web cung c\u1ea5p nh\u1eefng hi\u1ec3u bi\u1ebft \u0111\u1ed9c quy\u1ec1n v\u1ec1 nghi\u00ean c\u1ee9u \u0111ang di\u1ec5n ra c\u1ee7a ch\u00fang t\u00f4i, kh\u01a1i d\u1eady s\u1ef1 t\u00f2 m\u00f2 v\u00e0 tr\u1ea3i nghi\u1ec7m h\u1ea5p d\u1eabn \u0111\u1ea7y c\u1ea3m h\u1ee9ng.",
      "We were commissioned by the EverSwap team to create an immersive storytelling experience that makes their Web3 products feel intuitive and engaging. Inspired by the natural flow of liquidity, we built a journey through evolving terrains, rivers and lakes - transforming the complexities of trading, lending and borrowing into a fluid visual narrative of movement, connection and exchange.":
        "Ch\u00fang t\u00f4i \u0111\u01b0\u1ee3c nh\u00f3m EverSwap \u1ee7y quy\u1ec1n \u0111\u1ec3 t\u1ea1o ra tr\u1ea3i nghi\u1ec7m k\u1ec3 chuy\u1ec7n s\u1ed1ng \u0111\u1ed9ng gi\u00fap c\u00e1c s\u1ea3n ph\u1ea9m Web3 c\u1ee7a h\u1ecd tr\u1edf n\u00ean tr\u1ef1c quan v\u00e0 h\u1ea5p d\u1eabn. L\u1ea5y c\u1ea3m h\u1ee9ng t\u1eeb d\u00f2ng thanh kho\u1ea3n t\u1ef1 nhi\u00ean, ch\u00fang t\u00f4i \u0111\u00e3 x\u00e2y d\u1ef1ng m\u1ed9t h\u00e0nh tr\u00ecnh xuy\u00ean qua c\u00e1c \u0111\u1ecba h\u00ecnh, s\u00f4ng h\u1ed3 \u0111ang ph\u00e1t tri\u1ec3n - bi\u1ebfn s\u1ef1 ph\u1ee9c t\u1ea1p c\u1ee7a giao d\u1ecbch, cho vay v\u00e0 vay th\u00e0nh m\u1ed9t c\u00e2u chuy\u1ec7n tr\u1ef1c quan tr\u00f4i ch\u1ea3y v\u1ec1 chuy\u1ec3n \u0111\u1ed9ng, k\u1ebft n\u1ed1i v\u00e0 trao \u0111\u1ed5i.",
      "Lusion - Max Mara: Bearing Gifts": "Lusion - Max Mara: Bearing Gifts",
      "Lusion - My Little Storybook": "Lusion - My Little Storybook",
      "Our detailed case study on My Little Storybook. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u tr\u01b0\u1eddng h\u1ee3p chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 My Little Storybook. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Central to our approach is meticulous planning, aligning render quality, timelines, and budgets for creative practicality. Transparent communication with LOW's team fostered a shared vision, enabling us to explore unique possibilities.":
        "Tr\u1ecdng t\u00e2m trong c\u00e1ch ti\u1ebfp c\u1eadn c\u1ee7a ch\u00fang t\u00f4i l\u00e0 l\u1eadp k\u1ebf ho\u1ea1ch t\u1ec9 m\u1ec9, \u0111i\u1ec1u ch\u1ec9nh ch\u1ea5t l\u01b0\u1ee3ng k\u1ebft xu\u1ea5t, ti\u1ebfn tr\u00ecnh v\u00e0 ng\u00e2n s\u00e1ch \u0111\u1ec3 mang t\u00ednh th\u1ef1c ti\u1ec5n s\u00e1ng t\u1ea1o. Giao ti\u1ebfp minh b\u1ea1ch v\u1edbi nh\u00f3m c\u1ee7a LOW \u0111\u00e3 th\u00fac \u0111\u1ea9y t\u1ea7m nh\u00ecn chung, cho ph\u00e9p ch\u00fang t\u00f4i kh\u00e1m ph\u00e1 nh\u1eefng kh\u1ea3 n\u0103ng \u0111\u1ed9c \u0111\u00e1o.",
      "Our detailed case study on Max Mara: Bearing Gifts. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u tr\u01b0\u1eddng h\u1ee3p chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Max Mara: Qu\u00e0 t\u1eb7ng mang theo. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      blooloop: "v\u00f2ng tr\u00f2n",
      MLF: "MLF",
      "Expanding Boundaries through Cinematic Innovation. An R&D feat by Lusion, this project showcased team versatility and artistry. We crafted 3D assets from scratch and seamlessly blended hand-drawn sketches into a captivating WebGL environment for a unique experience.":
        "M\u1edf r\u1ed9ng ranh gi\u1edbi th\u00f4ng qua \u0111\u1ed5i m\u1edbi \u0111i\u1ec7n \u1ea3nh. L\u00e0 m\u1ed9t th\u00e0nh t\u1ef1u R&D c\u1ee7a Lusion, d\u1ef1 \u00e1n n\u00e0y th\u1ec3 hi\u1ec7n t\u00ednh linh ho\u1ea1t v\u00e0 t\u00ednh ngh\u1ec7 thu\u1eadt c\u1ee7a nh\u00f3m. Ch\u00fang t\u00f4i \u0111\u00e3 t\u1ea1o n\u1ed9i dung 3D t\u1eeb \u0111\u1ea7u v\u00e0 k\u1ebft h\u1ee3p li\u1ec1n m\u1ea1ch c\u00e1c b\u1ea3n ph\u00e1c th\u1ea3o v\u1ebd tay v\u00e0o m\u00f4i tr\u01b0\u1eddng WebGL quy\u1ebfn r\u0169 \u0111\u1ec3 mang l\u1ea1i tr\u1ea3i nghi\u1ec7m \u0111\u1ed9c \u0111\u00e1o.",
      "approached us to create a web companion for Of The Oak, their physical installation created in collaboration with":
        "\u0111\u00e3 ti\u1ebfp c\u1eadn ch\u00fang t\u00f4i \u0111\u1ec3 t\u1ea1o m\u1ed9t trang web \u0111\u1ed3ng h\u00e0nh cho Of The Oak, b\u1ea3n c\u00e0i \u0111\u1eb7t v\u1eadt l\u00fd c\u1ee7a h\u1ecd \u0111\u01b0\u1ee3c t\u1ea1o ra v\u1edbi s\u1ef1 c\u1ed9ng t\u00e1c c\u1ee7a",
      "Royal Botanic Gardens, Kew": "Royal Botanic Gardens, Kew",
      "Lusion - Of The Oak": "Lusion - Of The Oak",
      "Crafting My Little Storybook's Triumph. The Lusion team meticulously shaped every element in this challenging one-month project. Their dedication resulted in acclaim, with multiple awards, including the coveted 2022 Webby Award for Best Visual Design Aesthetic, recognizing the blend of innovation and creativity.":
        "X\u00e2y d\u1ef1ng chi\u1ebfn th\u1eafng c\u1ee7a My Little Storybook. Nh\u00f3m Lusion \u0111\u00e3 \u0111\u1ecbnh h\u00ecnh t\u1ec9 m\u1ec9 t\u1eebng y\u1ebfu t\u1ed1 trong d\u1ef1 \u00e1n k\u00e9o d\u00e0i m\u1ed9t th\u00e1ng \u0111\u1ea7y th\u1eed th\u00e1ch n\u00e0y. S\u1ef1 c\u1ed1ng hi\u1ebfn c\u1ee7a h\u1ecd \u0111\u00e3 nh\u1eadn \u0111\u01b0\u1ee3c s\u1ef1 hoan ngh\u00eanh, v\u1edbi nhi\u1ec1u gi\u1ea3i th\u01b0\u1edfng, bao g\u1ed3m Gi\u1ea3i th\u01b0\u1edfng Webby n\u0103m 2022 \u0111\u00e1ng th\u00e8m mu\u1ed1n d\u00e0nh cho Th\u1ea9m m\u1ef9 thi\u1ebft k\u1ebf h\u00ecnh \u1ea3nh \u0111\u1eb9p nh\u1ea5t, c\u00f4ng nh\u1eadn s\u1ef1 k\u1ebft h\u1ee3p gi\u1eefa \u0111\u1ed5i m\u1edbi v\u00e0 s\u00e1ng t\u1ea1o.",
      "Our detailed case study on Of The Oak. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Of The Oak. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "We built a robust Houdini to WebGL pipeline that compresses complex 3D tree, branch, and node structures into a custom web format, reducing the download size to just 3.5 MB while leveraging WebGL instancing for fast delivery.":
        "Ch\u00fang t\u00f4i \u0111\u00e3 x\u00e2y d\u1ef1ng m\u1ed9t \u0111\u01b0\u1eddng d\u1eabn Houdini t\u1edbi WebGL m\u1ea1nh m\u1ebd \u0111\u1ec3 n\u00e9n c\u00e1c c\u1ea5u tr\u00fac c\u00e2y, nh\u00e1nh v\u00e0 n\u00fat 3D ph\u1ee9c t\u1ea1p th\u00e0nh \u0111\u1ecbnh d\u1ea1ng web t\u00f9y ch\u1ec9nh, gi\u1ea3m k\u00edch th\u01b0\u1edbc t\u1ea3i xu\u1ed1ng ch\u1ec9 c\u00f2n 3,5 MB trong khi t\u1eadn d\u1ee5ng phi\u00ean b\u1ea3n WebGL \u0111\u1ec3 ph\u00e2n ph\u1ed1i nhanh.",
      ". Designed to extend the project beyond the installation itself, the experience gave onsite visitors a more interactive way to engage with the work while also making it accessible to online audiences.":
        ". \u0110\u01b0\u1ee3c thi\u1ebft k\u1ebf \u0111\u1ec3 m\u1edf r\u1ed9ng d\u1ef1 \u00e1n ra ngo\u00e0i ph\u1ea1m vi l\u1eafp \u0111\u1eb7t, tr\u1ea3i nghi\u1ec7m n\u00e0y \u0111\u00e3 mang l\u1ea1i cho kh\u00e1ch truy c\u1eadp t\u1ea1i ch\u1ed7 m\u1ed9t c\u00e1ch t\u01b0\u01a1ng t\u00e1c h\u01a1n \u0111\u1ec3 t\u01b0\u01a1ng t\u00e1c v\u1edbi c\u00f4ng vi\u1ec7c \u0111\u1ed3ng th\u1eddi gi\u00fap kh\u00e1n gi\u1ea3 tr\u1ef1c tuy\u1ebfn c\u00f3 th\u1ec3 truy c\u1eadp \u0111\u01b0\u1ee3c.",
      "The website helped bridge the physical and digital experience, offering a space for visitors to explore the project in greater depth and learn more about its story, ideas, and context.":
        "Trang web \u0111\u00e3 gi\u00fap k\u1ebft n\u1ed1i tr\u1ea3i nghi\u1ec7m v\u1eadt l\u00fd v\u00e0 k\u1ef9 thu\u1eadt s\u1ed1, mang \u0111\u1ebfn kh\u00f4ng gian cho kh\u00e1ch truy c\u1eadp kh\u00e1m ph\u00e1 d\u1ef1 \u00e1n s\u00e2u h\u01a1n v\u00e0 t\u00ecm hi\u1ec3u th\u00eam v\u1ec1 c\u00e2u chuy\u1ec7n, \u00fd t\u01b0\u1edfng v\u00e0 b\u1ed1i c\u1ea3nh c\u1ee7a d\u1ef1 \u00e1n.",
      "Oryzo AI is a self initiated project by Lusion built around a deliberately ridiculous idea: presenting a simple cork coaster as a serious AI era product launch. We treated it as a full campaign, combining premium visual production with satire to see how far craft, storytelling, and presentation could push an ordinary object.":
        "Oryzo AI l\u00e0 m\u1ed9t d\u1ef1 \u00e1n do Lusion t\u1ef1 kh\u1edfi x\u01b0\u1edbng, \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng d\u1ef1a tr\u00ean m\u1ed9t \u00fd t\u01b0\u1edfng l\u1ed1 b\u1ecbch c\u00f3 ch\u1ee7 \u00fd: gi\u1edbi thi\u1ec7u m\u1ed9t chi\u1ebfc t\u00e0u l\u01b0\u1ee3n si\u00eau t\u1ed1c \u0111\u01a1n gi\u1ea3n nh\u01b0 m\u1ed9t bu\u1ed5i ra m\u1eaft s\u1ea3n ph\u1ea9m nghi\u00eam t\u00fac trong k\u1ef7 nguy\u00ean AI. Ch\u00fang t\u00f4i coi \u0111\u00e2y l\u00e0 m\u1ed9t chi\u1ebfn d\u1ecbch \u0111\u1ea7y \u0111\u1ee7, k\u1ebft h\u1ee3p s\u1ea3n xu\u1ea5t h\u00ecnh \u1ea3nh cao c\u1ea5p v\u1edbi ch\u00e2m bi\u1ebfm \u0111\u1ec3 xem k\u1ef9 thu\u1eadt th\u1ee7 c\u00f4ng, c\u00e1ch k\u1ec3 chuy\u1ec7n v\u00e0 c\u00e1ch tr\u00ecnh b\u00e0y c\u00f3 th\u1ec3 \u0111\u1ea9y m\u1ed9t v\u1eadt th\u1ec3 b\u00ecnh th\u01b0\u1eddng \u0111\u1ebfn m\u1ee9c n\u00e0o.",
      "GitHub page": "trang GitHub",
      "Product Hunt launch": "Ra m\u1eaft s\u0103n s\u1ea3n ph\u1ea9m",
      "Product Hunt": "Product Hunt",
      Github: "Github",
      "founder video": "video ng\u01b0\u1eddi s\u00e1ng l\u1eadp",
      "FWA SOTM": "FWA SOTM",
      ", and social content. It gave us room to experiment more freely with tone and campaign thinking, while showing the same level of design, motion, and digital production we bring to client work.":
        "v\u00e0 n\u1ed9i dung x\u00e3 h\u1ed9i. N\u00f3 cho ph\u00e9p ch\u00fang t\u00f4i th\u1eed nghi\u1ec7m t\u1ef1 do h\u01a1n v\u1edbi gi\u1ecdng \u0111i\u1ec7u v\u00e0 t\u01b0 duy chi\u1ebfn d\u1ecbch, \u0111\u1ed3ng th\u1eddi th\u1ec3 hi\u1ec7n c\u00f9ng m\u1ee9c \u0111\u1ed9 thi\u1ebft k\u1ebf, chuy\u1ec3n \u0111\u1ed9ng v\u00e0 s\u1ea3n xu\u1ea5t k\u1ef9 thu\u1eadt s\u1ed1 m\u00e0 ch\u00fang t\u00f4i mang \u0111\u1ebfn cho kh\u00e1ch h\u00e0ng.",
      "Watch Video": "Xem video",
      "Our detailed case study on Oryzo AI. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Oryzo AI. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Wallpaper*": "Wallpaper*",
      "Dream Machine": "Dream Machine",
      Compositing: "So\u1ea1n",
      "Porsche:": "Porsche:",
      "Awwwards SOTM": "Gi\u1ea3i th\u01b0\u1edfng SOTM",
      "Lusion - Oryzo AI": "Lusion - Oryzo AI",
      WebAR: "WebAR",
      "Commissioned by Wallpaper* and Porsche GB, Lusion created a CG short film inspired by the visionary ambitions of Porsche founder Ferry Porsche.":
        "\u0110\u01b0\u1ee3c \u1ee7y quy\u1ec1n b\u1edfi Wallpaper* v\u00e0 Porsche GB, Lusion \u0111\u00e3 t\u1ea1o ra m\u1ed9t b\u1ed9 phim ng\u1eafn CG l\u1ea5y c\u1ea3m h\u1ee9ng t\u1eeb tham v\u1ecdng c\u00f3 t\u1ea7m nh\u00ecn xa c\u1ee7a ng\u01b0\u1eddi s\u00e1ng l\u1eadp Porsche Ferry Porsche.",
      "Beyond the main website, we extended the idea across a":
        "Ngo\u00e0i trang web ch\u00ednh, ch\u00fang t\u00f4i \u0111\u00e3 m\u1edf r\u1ed9ng \u00fd t\u01b0\u1edfng tr\u00ean m\u1ed9t",
      "Lusion - Porsche: Dream Machine": "Lusion - Porsche: Dream Machine",
      "Lusion teamed up with GoSpooky to embark on an exciting journey with Coca-Cola European Partners. Our mission? To elevate the way soft drinks are served by bringing the magic of web-based augmented reality (AR) to the beverage experience.":
        "Lusion h\u1ee3p t\u00e1c v\u1edbi GoSpooky \u0111\u1ec3 b\u1eaft \u0111\u1ea7u cu\u1ed9c h\u00e0nh tr\u00ecnh th\u00fa v\u1ecb v\u1edbi Coca-Cola European Partners. S\u1ee9 m\u1ec7nh c\u1ee7a ch\u00fang t\u00f4i? \u0110\u1ec3 n\u00e2ng cao c\u00e1ch ph\u1ee5c v\u1ee5 n\u01b0\u1edbc gi\u1ea3i kh\u00e1t b\u1eb1ng c\u00e1ch \u0111\u01b0a s\u1ef1 k\u1ef3 di\u1ec7u c\u1ee7a th\u1ef1c t\u1ebf t\u0103ng c\u01b0\u1eddng (AR) d\u1ef1a tr\u00ean web v\u00e0o tr\u1ea3i nghi\u1ec7m \u0111\u1ed3 u\u1ed1ng.",
      "Our detailed case study on Porsche: Dream Machine. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Porsche: Dream Machine. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Porsche Newsroom": "Porsche Newsroom",
      "8th Wall Blog": "8th Wall Blog",
      "From creative and production, we took their raw brand material and take it into a whole new level of storytelling in this interactive web experience.":
        "T\u1eeb ho\u1ea1t \u0111\u1ed9ng s\u00e1ng t\u1ea1o v\u00e0 s\u1ea3n xu\u1ea5t, ch\u00fang t\u00f4i \u0111\u00e3 l\u1ea5y t\u00e0i li\u1ec7u th\u01b0\u01a1ng hi\u1ec7u th\u00f4 c\u1ee7a h\u1ecd v\u00e0 \u0111\u01b0a n\u00f3 l\u00ean m\u1ed9t c\u1ea5p \u0111\u1ed9 k\u1ec3 chuy\u1ec7n ho\u00e0n to\u00e0n m\u1edbi trong tr\u1ea3i nghi\u1ec7m web t\u01b0\u01a1ng t\u00e1c n\u00e0y.",
      "Faced with a tight timeline due to a previous vendor's shortfall, Lusion undertook the challenge to create a lifelike WebAR encounter that would make Coca-Cola's drink offerings burst to life.":
        "\u0110\u1ed1i m\u1eb7t v\u1edbi th\u1eddi gian ch\u1eb7t ch\u1ebd do s\u1ef1 thi\u1ebfu h\u1ee5t c\u1ee7a nh\u00e0 cung c\u1ea5p tr\u01b0\u1edbc \u0111\u00f3, Lusion \u0111\u00e3 th\u1ef1c hi\u1ec7n th\u1eed th\u00e1ch t\u1ea1o ra tr\u1ea3i nghi\u1ec7m WebAR gi\u1ed1ng nh\u01b0 th\u1eadt \u0111\u1ec3 l\u00e0m cho c\u00e1c s\u1ea3n ph\u1ea9m \u0111\u1ed3 u\u1ed1ng c\u1ee7a Coca-Cola tr\u1edf n\u00ean s\u1ed1ng \u0111\u1ed9ng.",
      "Directed by Edan Kwan, the piece takes audiences on a four phase journey through the evolution of Porsche sports cars, expressed through digital art and motion design. The work was later showcased at Outernet London across 23,000 square feet of wraparound floor to ceiling 16K LED screens.":
        "Do Edan Kwan \u0111\u1ea1o di\u1ec5n, t\u00e1c ph\u1ea9m \u0111\u01b0a kh\u00e1n gi\u1ea3 v\u00e0o cu\u1ed9c h\u00e0nh tr\u00ecnh b\u1ed1n giai \u0111o\u1ea1n xuy\u00ean su\u1ed1t qu\u00e1 tr\u00ecnh ph\u00e1t tri\u1ec3n c\u1ee7a xe th\u1ec3 thao Porsche, \u0111\u01b0\u1ee3c th\u1ec3 hi\u1ec7n th\u00f4ng qua ngh\u1ec7 thu\u1eadt k\u1ef9 thu\u1eadt s\u1ed1 v\u00e0 thi\u1ebft k\u1ebf chuy\u1ec3n \u0111\u1ed9ng. T\u00e1c ph\u1ea9m sau \u0111\u00f3 \u0111\u00e3 \u0111\u01b0\u1ee3c tr\u01b0ng b\u00e0y t\u1ea1i Outernet London tr\u00ean 23.000 feet vu\u00f4ng m\u00e0n h\u00ecnh LED 16K bao quanh t\u1eeb tr\u1ea7n \u0111\u1ebfn s\u00e0n.",
      "Lusion - Spaace - NFT Marketplace": "Lusion - Spaace - NFT Marketplace",
      "Lusion - Soda Experience": "Lusion - Soda Experience",
      "Our detailed case study on Soda Experience. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Tr\u1ea3i nghi\u1ec7m Soda. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      WebXR: "WebXR",
      "3D Visual optimization": "T\u1ed1i \u01b0u h\u00f3a h\u00ecnh \u1ea3nh 3D",
      "Lusion partnered with Phoria and Meta to create Spatial Fusion, an immersive WebXR experience that pushed the possibilities of web based mixed reality. Built with technologies such as spatial anchors, plane detection, and full color passthrough, the project explored new ways for users to interact with digital content in physical space.":
        "Lusion h\u1ee3p t\u00e1c v\u1edbi Phoria v\u00e0 Meta \u0111\u1ec3 t\u1ea1o ra Spatial Fusion, m\u1ed9t tr\u1ea3i nghi\u1ec7m WebXR s\u1ed1ng \u0111\u1ed9ng gi\u00fap n\u00e2ng cao kh\u1ea3 n\u0103ng c\u1ee7a th\u1ef1c t\u1ebf h\u1ed7n h\u1ee3p d\u1ef1a tr\u00ean web. \u0110\u01b0\u1ee3c x\u00e2y d\u1ef1ng b\u1eb1ng c\u00e1c c\u00f4ng ngh\u1ec7 nh\u01b0 neo kh\u00f4ng gian, ph\u00e1t hi\u1ec7n m\u1eb7t ph\u1eb3ng v\u00e0 truy\u1ec1n qua \u0111\u1ea7y \u0111\u1ee7 m\u00e0u s\u1eafc, d\u1ef1 \u00e1n \u0111\u00e3 kh\u00e1m ph\u00e1 nh\u1eefng c\u00e1ch m\u1edbi \u0111\u1ec3 ng\u01b0\u1eddi d\u00f9ng t\u01b0\u01a1ng t\u00e1c v\u1edbi n\u1ed9i dung k\u1ef9 thu\u1eadt s\u1ed1 trong kh\u00f4ng gian v\u1eadt l\u00fd.",
      "Our detailed case study on Meta: Spatial Fusion. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Meta: Spatial Fusion. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "We worked with Spaace to bring this immersive brand website for their newly released gamification NFT marketplace.":
        "Ch\u00fang t\u00f4i \u0111\u00e3 l\u00e0m vi\u1ec7c v\u1edbi Spaace \u0111\u1ec3 mang trang web th\u01b0\u01a1ng hi\u1ec7u s\u1ed1ng \u0111\u1ed9ng n\u00e0y \u0111\u1ebfn v\u1edbi th\u1ecb tr\u01b0\u1eddng tr\u00f2 ch\u01a1i NFT m\u1edbi ph\u00e1t h\u00e0nh c\u1ee7a h\u1ecd.",
      "Our detailed case study on Spaace - NFT Marketplace. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Spaace - Th\u1ecb tr\u01b0\u1eddng NFT. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "We partnered with Fantasy to launch the campaign website for Synthetic Humans, their new AI product. The goal was to create a visually rich digital experience that could support the ambition and identity of the launch.":
        "Ch\u00fang t\u00f4i h\u1ee3p t\u00e1c v\u1edbi Fantasy \u0111\u1ec3 ra m\u1eaft trang web chi\u1ebfn d\u1ecbch d\u00e0nh cho Synthetic Humans, s\u1ea3n ph\u1ea9m AI m\u1edbi c\u1ee7a h\u1ecd. M\u1ee5c ti\u00eau l\u00e0 t\u1ea1o ra tr\u1ea3i nghi\u1ec7m k\u1ef9 thu\u1eadt s\u1ed1 phong ph\u00fa v\u1ec1 m\u1eb7t h\u00ecnh \u1ea3nh c\u00f3 th\u1ec3 h\u1ed7 tr\u1ee3 tham v\u1ecdng v\u00e0 b\u1ea3n s\u1eafc c\u1ee7a bu\u1ed5i ra m\u1eaft.",
      "Our detailed case study on The Turn Of The Screw. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 The Turn Of The Screw. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Lusion - Meta: Spatial Fusion": "Lusion - Meta: Spatial Fusion",
      "Our detailed case study on Synthetic Human. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Synthetic Human. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Bringing together expertise across creative technology, immersive design, and web development, the collaboration helped turn a complex technical challenge into a seamless spatial storytelling experience. The result was a forward looking mixed reality venture that invited users into a new kind of interactive world.":
        "K\u1ebft h\u1ee3p ki\u1ebfn \u200b\u200bth\u1ee9c chuy\u00ean m\u00f4n v\u1ec1 c\u00f4ng ngh\u1ec7 s\u00e1ng t\u1ea1o, thi\u1ebft k\u1ebf s\u1ed1ng \u0111\u1ed9ng v\u00e0 ph\u00e1t tri\u1ec3n web, s\u1ef1 h\u1ee3p t\u00e1c n\u00e0y \u0111\u00e3 gi\u00fap bi\u1ebfn th\u00e1ch th\u1ee9c k\u1ef9 thu\u1eadt ph\u1ee9c t\u1ea1p th\u00e0nh tr\u1ea3i nghi\u1ec7m k\u1ec3 chuy\u1ec7n kh\u00f4ng gian li\u1ec1n m\u1ea1ch. K\u1ebft qu\u1ea3 l\u00e0 m\u1ed9t d\u1ef1 \u00e1n kinh doanh th\u1ef1c t\u1ebf h\u1ed7n h\u1ee3p h\u01b0\u1edbng t\u1edbi t\u01b0\u01a1ng lai \u0111\u00e3 m\u1eddi ng\u01b0\u1eddi d\u00f9ng v\u00e0o m\u1ed9t lo\u1ea1i th\u1ebf gi\u1edbi t\u01b0\u01a1ng t\u00e1c m\u1edbi.",
      "Lusion - Synthetic Human": "Lusion - Synthetic Human",
      "In collaboration with": "Ph\u1ed1i h\u1ee3p v\u1edbi",
      "All dot positions are procedrually generated and animated in real-time. We used the index breakpoints to reduce the data needed to store the country data and the dot positions. This allowed us to store the data in a single image file, which is then decoded and rendered on the fly.":
        "T\u1ea5t c\u1ea3 c\u00e1c v\u1ecb tr\u00ed d\u1ea5u ch\u1ea5m \u0111\u01b0\u1ee3c t\u1ea1o theo th\u1ee7 t\u1ee5c v\u00e0 ho\u1ea1t h\u00ecnh trong th\u1eddi gian th\u1ef1c. Ch\u00fang t\u00f4i \u0111\u00e3 s\u1eed d\u1ee5ng c\u00e1c \u0111i\u1ec3m d\u1eebng ch\u1ec9 m\u1ee5c \u0111\u1ec3 gi\u1ea3m l\u01b0\u1ee3ng d\u1eef li\u1ec7u c\u1ea7n thi\u1ebft nh\u1eb1m l\u01b0u tr\u1eef d\u1eef li\u1ec7u qu\u1ed1c gia v\u00e0 v\u1ecb tr\u00ed d\u1ea5u ch\u1ea5m. \u0110i\u1ec1u n\u00e0y cho ph\u00e9p ch\u00fang t\u00f4i l\u01b0u tr\u1eef d\u1eef li\u1ec7u trong m\u1ed9t t\u1ec7p h\u00ecnh \u1ea3nh duy nh\u1ea5t, sau \u0111\u00f3 \u0111\u01b0\u1ee3c gi\u1ea3i m\u00e3 v\u00e0 hi\u1ec3n th\u1ecb nhanh ch\u00f3ng.",
      "Our team developed a Houdini FX based workflow to optimize high quality 3D assets for real time use on the web, alongside building the interactive front end of the site. We also created the procedural animations and visual effects that gave the experience its depth, movement, and character.":
        "Nh\u00f3m c\u1ee7a ch\u00fang t\u00f4i \u0111\u00e3 ph\u00e1t tri\u1ec3n quy tr\u00ecnh l\u00e0m vi\u1ec7c d\u1ef1a tr\u00ean Houdini FX \u0111\u1ec3 t\u1ed1i \u01b0u h\u00f3a n\u1ed9i dung 3D ch\u1ea5t l\u01b0\u1ee3ng cao \u0111\u1ec3 s\u1eed d\u1ee5ng theo th\u1eddi gian th\u1ef1c tr\u00ean web, b\u00ean c\u1ea1nh vi\u1ec7c x\u00e2y d\u1ef1ng giao di\u1ec7n ng\u01b0\u1eddi d\u00f9ng t\u01b0\u01a1ng t\u00e1c c\u1ee7a trang web. Ch\u00fang t\u00f4i c\u0169ng t\u1ea1o ra c\u00e1c ho\u1ea1t \u1ea3nh theo quy tr\u00ecnh v\u00e0 hi\u1ec7u \u1ee9ng h\u00ecnh \u1ea3nh mang l\u1ea1i cho tr\u1ea3i nghi\u1ec7m chi\u1ec1u s\u00e2u, chuy\u1ec3n \u0111\u1ed9ng v\u00e0 \u0111\u1eb7c s\u1eafc.",
      "In October 2019, Opera North, alongside the Audiolab of York University and the sound artist James Bulley, came to Lusion for a collaboration on an innovative cultural project. Their idea was to record the Turn of the Screw opera in a spatialized way, then place these recordings in an explorable 3D environment. The main goal of this project was to create an audiovisual walk through a binaural landscape.":
        "V\u00e0o th\u00e1ng 10 n\u0103m 2019, Opera North, c\u00f9ng v\u1edbi Audiolab c\u1ee7a \u0110\u1ea1i h\u1ecdc York v\u00e0 ngh\u1ec7 s\u0129 \u00e2m thanh James Bulley, \u0111\u00e3 \u0111\u1ebfn Lusion \u0111\u1ec3 h\u1ee3p t\u00e1c trong m\u1ed9t d\u1ef1 \u00e1n v\u0103n h\u00f3a \u0111\u1ed5i m\u1edbi. \u00dd t\u01b0\u1edfng c\u1ee7a h\u1ecd l\u00e0 ghi l\u1ea1i v\u1edf opera Turn of the Screw theo c\u00e1ch kh\u00f4ng gian h\u00f3a, sau \u0111\u00f3 \u0111\u1eb7t nh\u1eefng b\u1ea3n ghi n\u00e0y v\u00e0o m\u00f4i tr\u01b0\u1eddng 3D \u0111\u1ec3 kh\u00e1m ph\u00e1. M\u1ee5c ti\u00eau ch\u00ednh c\u1ee7a d\u1ef1 \u00e1n n\u00e0y l\u00e0 t\u1ea1o ra m\u1ed9t chuy\u1ebfn \u0111i nghe nh\u00ecn qua khung c\u1ea3nh hai tai.",
      "Lusion - The Turn Of The Screw": "Lusion - The Turn Of The Screw",
      "Our detailed case study on Worldcoin Globe. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Worldcoin Globe. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Our detailed case study on Zero Tech. Produced by Lusion.":
        "Nghi\u00ean c\u1ee9u \u0111i\u1ec3n h\u00ecnh chi ti\u1ebft c\u1ee7a ch\u00fang t\u00f4i v\u1ec1 Zero Tech. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t b\u1edfi Lusion.",
      "Select language": "Ch\u1ecdn ng\u00f4n ng\u1eef",
      Language: "Ng\u00f4n ng\u1eef",
      "Lusion - Zero Tech": "Lusion - Zero Tech",
      "Tools for Humanity": "Tools for Humanity",
      "Lusion - Worldcoin Globe": "Lusion - Worldcoin Globe",
      "API Design": "Thi\u1ebft k\u1ebf API",
      ", we successfully integrated the dynamic Worldcoin 3D globe visualizer onto their website.":
        ", ch\u00fang t\u00f4i \u0111\u00e3 t\u00edch h\u1ee3p th\u00e0nh c\u00f4ng tr\u00ecnh hi\u1ec3n th\u1ecb h\u00ecnh \u1ea3nh \u0111\u1ecba c\u1ea7u Worldcoin 3D \u0111\u1ed9ng v\u00e0o trang web c\u1ee7a h\u1ecd.",
      "Our team crafted specialized APIs, empowering the Worldcoin developer team to seamlessly activate visual effects in response to real-time user registration data. Furthermore, we innovatively embedded and compressed country and visual information into an image data format, optimizing GPU-based rendering for efficiency and speed.":
        "Nh\u00f3m c\u1ee7a ch\u00fang t\u00f4i \u0111\u00e3 t\u1ea1o ra c\u00e1c API chuy\u00ean d\u1ee5ng, trao quy\u1ec1n cho nh\u00f3m nh\u00e0 ph\u00e1t tri\u1ec3n Worldcoin k\u00edch ho\u1ea1t li\u1ec1n m\u1ea1ch c\u00e1c hi\u1ec7u \u1ee9ng h\u00ecnh \u1ea3nh \u0111\u1ec3 \u0111\u00e1p \u1ee9ng d\u1eef li\u1ec7u \u0111\u0103ng k\u00fd ng\u01b0\u1eddi d\u00f9ng theo th\u1eddi gian th\u1ef1c. H\u01a1n n\u1eefa, ch\u00fang t\u00f4i \u0111\u00e3 c\u1ea3i ti\u1ebfn nh\u00fang v\u00e0 n\u00e9n th\u00f4ng tin h\u00ecnh \u1ea3nh v\u00e0 qu\u1ed1c gia th\u00e0nh \u0111\u1ecbnh d\u1ea1ng d\u1eef li\u1ec7u h\u00ecnh \u1ea3nh, t\u1ed1i \u01b0u h\u00f3a k\u1ebft xu\u1ea5t d\u1ef1a tr\u00ean GPU \u0111\u1ec3 \u0111\u1ea1t \u0111\u01b0\u1ee3c hi\u1ec7u qu\u1ea3 v\u00e0 t\u1ed1c \u0111\u1ed9.",
      "This created an immersive, visually stunning platform that effectively communicated Zero's innovation and solidified their position as a technology leader.":
        "\u0110i\u1ec1u n\u00e0y \u0111\u00e3 t\u1ea1o ra m\u1ed9t n\u1ec1n t\u1ea3ng s\u1ed1ng \u0111\u1ed9ng, c\u00f3 h\u00ecnh \u1ea3nh \u1ea5n t\u01b0\u1ee3ng, gi\u00fap truy\u1ec1n \u0111\u1ea1t hi\u1ec7u qu\u1ea3 s\u1ef1 \u0111\u1ed5i m\u1edbi c\u1ee7a Zero v\u00e0 c\u1ee7ng c\u1ed1 v\u1ecb tr\u00ed d\u1eabn \u0111\u1ea7u v\u1ec1 c\u00f4ng ngh\u1ec7 c\u1ee7a h\u1ecd.",
      "Zero approached us to design an engaging interactive website for Zero.Tech. With a focus on captivating and informing their tech-savvy audience, we seamlessly merged realtime 3D visuals and scroll navigation.":
        "Zero \u0111\u00e3 ti\u1ebfp c\u1eadn ch\u00fang t\u00f4i \u0111\u1ec3 thi\u1ebft k\u1ebf m\u1ed9t trang web t\u01b0\u01a1ng t\u00e1c h\u1ea5p d\u1eabn cho Zero.Tech. V\u1edbi tr\u1ecdng t\u00e2m l\u00e0 thu h\u00fat v\u00e0 cung c\u1ea5p th\u00f4ng tin cho kh\u00e1n gi\u1ea3 am hi\u1ec3u c\u00f4ng ngh\u1ec7, ch\u00fang t\u00f4i \u0111\u00e3 k\u1ebft h\u1ee3p li\u1ec1n m\u1ea1ch h\u00ecnh \u1ea3nh 3D th\u1eddi gian th\u1ef1c v\u00e0 \u0111i\u1ec1u h\u01b0\u1edbng cu\u1ed9n.",
      "This Porsche: Dream Machine video is not included in the local project files.":
        "Video Porsche: Dream Machine n\u00e0y kh\u00f4ng c\u00f3 trong t\u1ec7p d\u1ef1 \u00e1n c\u1ee5c b\u1ed9.",
      "The full Lusion Reel is not included in the local project files.":
        "Lusion reel \u0111\u1ea7y \u0111\u1ee7 kh\u00f4ng \u0111\u01b0\u1ee3c bao g\u1ed3m trong c\u00e1c t\u1ec7p d\u1ef1 \u00e1n c\u1ee5c b\u1ed9.",
      "Newsletter sign-up is unavailable in this local copy.":
        "\u0110\u0103ng k\u00fd b\u1ea3n tin kh\u00f4ng c\u00f3 s\u1eb5n trong b\u1ea3n sao \u0111\u1ecba ph\u01b0\u01a1ng n\u00e0y.",
      "We create bold presentation slides and visual stories that help ideas stand out":
        "Ch\u00fang t\u00f4i t\u1ea1o n\u00ean nh\u1eefng b\u1ea3n tr\u00ecnh chi\u1ebfu \u1ea5n t\u01b0\u1ee3ng v\u00e0 k\u1ec3 chuy\u1ec7n b\u1eb1ng h\u00ecnh \u1ea3nh, gi\u00fap \u00fd t\u01b0\u1edfng tr\u1edf n\u00ean n\u1ed5i b\u1eadt.",
    },
    "zh-CN": {
      back: "\u8fd4\u56de",
      "Let's talk": "\u8054\u7cfb",
      Close: "\u5173\u95ed",
      Menu: "\u83dc\u5355",
      Home: "\u9996\u9875",
      "About us": "\u5173\u4e8e\u6211\u4eec",
      Projects: "\u9879\u76ee",
      Contact: "\u8054\u7cfb",
      "our newsletter": "\u6211\u4eec\u7684\u901a\u8baf",
      "Subscribe to": "\u8ba2\u9605",
      Labs: "\u5b9e\u9a8c\u5ba4",
      "Our Approach": "\u6211\u4eec\u7684\u65b9\u5f0f",
      "Featured Work": "\u7cbe\u9009\u4f5c\u54c1",
      "We create 3D visual storytelling and interactive web experiences that help brands stand out":
        "\u6211\u4eec\u521b\u9020 3D \u89c6\u89c9\u53d9\u4e8b\u548c\u4ea4\u4e92\u5f0f\u7f51\u7edc\u4f53\u9a8c\uff0c\u5e2e\u52a9\u54c1\u724c\u8131\u9896\u800c\u51fa",
      "Bold Ideas,": "\u5927\u80c6\u7684\u60f3\u6cd5\uff0c",
      "scroll to explore": "\u6eda\u52a8\u63a2\u7d22",
      "Brought to Life": "\u6829\u6829\u5982\u751f",
      "We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.":
        "\u6211\u4eec\u5c06\u8bbe\u8ba1\u3001\u52a8\u4f5c\u30013D \u548c\u5f00\u53d1\u7ed3\u5408\u8d77\u6765\uff0c\u521b\u9020\u51fa\u89c6\u89c9\u4e0a\u5f15\u4eba\u6ce8\u76ee\u4e14\u6280\u672f\u4e0a\u65e0\u7f1d\u7684\u6570\u5b57\u4f53\u9a8c\u3002\u4ece\u6d3b\u52a8\u53d1\u5e03\u5230\u6c89\u6d78\u5f0f\u54c1\u724c\u4e16\u754c\uff0c\u6211\u4eec\u6253\u9020\u7684\u4f5c\u54c1\u80fd\u591f\u5438\u5f15\u6ce8\u610f\u529b\u5e76\u9080\u8bf7\u4e92\u52a8\u3002",
      "Play Reel": "\u73a9\u5377\u8f74",
      "concept \u2022 web \u2022 design \u2022 development \u2022 3d \u2022 animation":
        "\u6982\u5ff5\u2022\u7f51\u9875\u2022\u8bbe\u8ba1\u2022\u5f00\u53d1\u20223D\u2022\u52a8\u753b",
      "Oryzo AI": "Oryzo AI",
      "A selection of immersive digital experiences created for ambitious brands and forward thinking teams.":
        "\u4e3a\u96c4\u5fc3\u52c3\u52c3\u7684\u54c1\u724c\u548c\u5177\u6709\u524d\u77bb\u6027\u601d\u7ef4\u7684\u56e2\u961f\u6253\u9020\u7684\u4e00\u7cfb\u5217\u6c89\u6d78\u5f0f\u6570\u5b57\u4f53\u9a8c\u3002",
      "web \u2022 design \u2022 development \u2022 3d":
        "\u7f51\u9875 \u2022 \u8bbe\u8ba1 \u2022 \u5f00\u53d1 \u2022 3d",
      "Atlas Motion": "Atlas Motion",
      "web \u2022 design \u2022 development \u2022 3d \u2022 animation":
        "\u7f51\u9875 \u2022 \u8bbe\u8ba1 \u2022 \u5f00\u53d1 \u2022 3d \u2022 \u52a8\u753b",
      "concept \u2022 3D illustration \u2022 mograph \u2022 video":
        "\u6982\u5ff5 \u2022 3D \u63d2\u56fe \u2022 \u6444\u5f71\u673a \u2022 \u89c6\u9891",
      Everswap: "Everswap",
      "Devin AI": "Devin AI",
      "Of The Oak": "Of The Oak",
      "Porsche: Dream Machine": "Porsche: Dream Machine",
      "Synthetic Human": "Synthetic Human",
      "Meta: Spatial Fusion": "Meta: Spatial Fusion",
      "Choo Choo World": "Choo Choo World",
      "DDD 2024": "DDD 2024",
      "Soda Experience": "Soda Experience",
      "See all projects": "\u67e5\u770b\u6240\u6709\u9879\u76ee",
      "concept \u2022 web \u2022 game design \u2022 3d":
        "\u6982\u5ff5\u2022\u7f51\u9875\u2022\u6e38\u620f\u8bbe\u8ba1\u20223D",
      "web \u2022 design \u2022 development \u2022 3d \u2022 web3":
        "\u7f51\u9875 \u2022 \u8bbe\u8ba1 \u2022 \u5f00\u53d1 \u2022 3d \u2022 web3",
      "Spaace - NFT Marketplace": "Spaace - NFT Marketplace",
      "WE ARE": "\u6211\u4eec\u662f",
      "Where Creative Ideas Become Immersive Experiences":
        "\u521b\u610f\u7406\u5ff5\u53d8\u6210\u6c89\u6d78\u5f0f\u4f53\u9a8c",
      PRODUCTION: "\u751f\u4ea7",
      "AR \u2022 development \u2022 3d": "AR \u2022 \u5f00\u53d1 \u2022 3d",
      STUDIO: "\u5de5\u4f5c\u5ba4",
      "Our process blends creative direction, 3D craft, and interactive development to build tailored digital journeys that feel original, polished, and built for impact.":
        "\u6211\u4eec\u7684\u6d41\u7a0b\u878d\u5408\u4e86\u521b\u610f\u6307\u5bfc\u30013D \u5de5\u827a\u548c\u4e92\u52a8\u5f00\u53d1\uff0c\u6253\u9020\u51fa\u539f\u521b\u3001\u7cbe\u81f4\u4e14\u5177\u6709\u5f71\u54cd\u529b\u7684\u5b9a\u5236\u6570\u5b57\u65c5\u7a0b\u3002",
      "Step into a new world": "\u6b65\u5165\u65b0\u4e16\u754c",
      "imagination run wild": "\u60f3\u8c61\u529b\u75af\u72c2",
      "A CREATIVE": "\u521b\u610f",
      "and let your": "\u5e76\u8ba9\u4f60\u7684",
      "SCROLL TO EXPLORE": "\u6eda\u52a8\u63a2\u7d22",
      "We do not chase trends or produce work that looks like everyone else. We focus on creating visually distinctive digital experiences that reflect your brand, engage your audience, and make people remember what they saw.":
        "\u6211\u4eec\u4e0d\u8ffd\u9010\u6f6e\u6d41\uff0c\u4e5f\u4e0d\u751f\u4ea7\u4e0e\u5176\u4ed6\u4eba\u4e00\u6837\u7684\u4f5c\u54c1\u3002\u6211\u4eec\u4e13\u6ce8\u4e8e\u521b\u9020\u89c6\u89c9\u4e0a\u72ec\u7279\u7684\u6570\u5b57\u4f53\u9a8c\uff0c\u4ee5\u53cd\u6620\u60a8\u7684\u54c1\u724c\u3001\u5438\u5f15\u53d7\u4f17\u5e76\u8ba9\u4eba\u4eec\u8bb0\u4f4f\u4ed6\u4eec\u6240\u770b\u5230\u7684\u5185\u5bb9\u3002",
      of: "\u7684",
      "experiences.": "\u7ecf\u9a8c\u3002",
      "CRAFTING UNIQUE": "\u6253\u9020\u72ec\u7279",
      "DIGITAL EXPERIENCES": "\u6570\u5b57\u4f53\u9a8c",
      "Creative Director": "\u521b\u610f\u603b\u76d1",
      "turn ambitious ideas into": "\u5c06\u96c4\u5fc3\u52c3\u52c3\u7684\u60f3\u6cd5\u53d8\u6210",
      "motion, 3D, and technology": "\u8fd0\u52a8\u30013D \u548c\u6280\u672f",
      "We combine different disciplines into one creative production process, allowing ideas to move from concept to execution with clarity and craft. The result is digital work that feels distinctive, technically refined, and built to make a lasting impact.":
        "\u6211\u4eec\u5c06\u4e0d\u540c\u7684\u5b66\u79d1\u7ed3\u5408\u5230\u4e00\u4e2a\u521b\u610f\u751f\u4ea7\u6d41\u7a0b\u4e2d\uff0c\u8ba9\u60f3\u6cd5\u4ee5\u6e05\u6670\u548c\u5de5\u827a\u7684\u65b9\u5f0f\u4ece\u6982\u5ff5\u8f6c\u53d8\u4e3a\u6267\u884c\u3002\u5176\u7ed3\u679c\u662f\u6570\u5b57\u4f5c\u54c1\u611f\u89c9\u72ec\u7279\u3001\u6280\u672f\u7cbe\u70bc\u3001\u65e8\u5728\u4ea7\u751f\u6301\u4e45\u7684\u5f71\u54cd\u3002",
      "A worldwide team": "\u5168\u7403\u56e2\u961f",
      "specialists in design,": "\u8bbe\u8ba1\u4e13\u5bb6\uff0c",
      "immersive digital": "\u6c89\u6d78\u5f0f\u6570\u5b57\u5316",
      "Edan Kwan": "Edan Kwan",
      "working together to": "\u5171\u540c\u52aa\u529b",
      Awards: "\u5956\u9879",
      Awwwards: "Awwwards",
      "Cofounder &": "\u8054\u5408\u521b\u59cb\u4eba&",
      "Trusted by global brands, cultural institutions, and forward thinking teams.":
        "\u53d7\u5230\u5168\u7403\u54c1\u724c\u3001\u6587\u5316\u673a\u6784\u548c\u524d\u77bb\u6027\u601d\u7ef4\u56e2\u961f\u7684\u4fe1\u8d56\u3002",
      "Swipe to change": "\u6ed1\u52a8\u5207\u6362",
      "Honorable Mention": "\u8363\u8a89\u5956",
      "BRANDS WE WORK WITH": "\u6211\u4eec\u5408\u4f5c\u7684\u54c1\u724c",
      "Webby Awards": "Webby Awards",
      CSSDA: "CSSDA",
      "Site of the Month": "\u672c\u6708\u7f51\u7ad9",
      "Site of the Year": "\u5e74\u5ea6\u7f51\u7ad9",
      FWA: "FWA",
      "Site of the Day": "\u4eca\u65e5\u7f51\u7ad9",
      "Agency Site of the Year": "\u5e74\u5ea6\u6700\u4f73\u4ee3\u7406\u7f51\u7ad9",
      "Lovie Awards": "Lovie Awards",
      "Webby Winner": "\u5a01\u6bd4\u83b7\u80dc\u8005",
      "Webby Nominee": "\u5a01\u6bd4\u63d0\u540d\u8005",
      "Developer Site of the Year": "\u5e74\u5ea6\u5f00\u53d1\u8005\u7f51\u7ad9",
      Articles: "\u6587\u7ae0",
      Talks: "\u4f1a\u8c08",
      "The Drum Awards for Design": "\u9f13\u8bbe\u8ba1\u5956",
      "Wallpaper - Driven by Dreams": "\u58c1\u7eb8 - \u68a6\u60f3\u9a71\u52a8",
      "Opera North - The Turn of the Screw": "Opera North - The Turn of the Screw",
      "Porsche Newsroom - Driven By Dream":
        "\u4fdd\u65f6\u6377\u65b0\u95fb\u4e2d\u5fc3 - \u68a6\u60f3\u9a71\u52a8",
      "Drum Awards": "\u9f13\u5956",
      "Lovie Winner": "\u6d1b\u7ef4\u83b7\u80dc\u8005",
      "Best-in-show Interactive": "\u6700\u4f73\u4e92\u52a8\u5c55\u793a",
      CommArts: "CommArts",
      "Digital Design Days": "Digital Design Days",
      EXPERTISE: "\u4e13\u4e1a\u77e5\u8bc6",
      "Awwwards Conf": "Awwwards Conf",
      "Oct 2024 Milan": "2024 \u5e74 10 \u6708 \u7c73\u5170",
      "KIKK Festival": "KIKK Festival",
      "Oct 2023 Namur": "2023 \u5e74 10 \u6708 \u90a3\u6155\u5c14",
      "Oct 2023 Amsterdam": "2023 \u5e74 10 \u6708 \u963f\u59c6\u65af\u7279\u4e39",
      "Oct 2022 Amsterdam": "2022 \u5e74 10 \u6708 \u963f\u59c6\u65af\u7279\u4e39",
      "AREA OF": "\u9762\u79ef",
      "Nov 2018 Paris": "2018 \u5e74 11 \u6708 \u5df4\u9ece",
      "Grow Paris": "Grow Paris",
      s: "s",
      d: "d",
      "Multidisciplinary expertise across strategy, creative, technology, and production.":
        "\u8de8\u6218\u7565\u3001\u521b\u610f\u3001\u6280\u672f\u548c\u5236\u4f5c\u7684\u591a\u5b66\u79d1\u4e13\u4e1a\u77e5\u8bc6\u3002",
      Strategy: "\u6218\u7565",
      Discovery: "\u53d1\u73b0",
      "Creative Direction": "\u521b\u610f\u65b9\u5411",
      c: "c",
      Research: "\u7814\u7a76",
      "Art Direction": "\u827a\u672f\u6307\u5bfc",
      Creative: "\u6709\u521b\u9020\u529b\u7684",
      t: "t",
      "Motion Design": "\u8fd0\u52a8\u8bbe\u8ba1",
      Illustration: "\u63d2\u56fe",
      Tech: "\u79d1\u6280",
      "Digital Experience Strategy": "\u6570\u5b57\u4f53\u9a8c\u7b56\u7565",
      Production: "\u751f\u4ea7",
      P: "\u78f7",
      "Interactive Installations": "\u4e92\u52a8\u88c5\u7f6e",
      "Technology Strategy": "\u6280\u672f\u6218\u7565",
      "3D Optimization": "3D\u4f18\u5316",
      "Front End Development": "\u524d\u7aef\u5f00\u53d1",
      "UX/UI Design": "\u7528\u6237\u4f53\u9a8c/\u7528\u6237\u754c\u9762\u8bbe\u8ba1",
      "AR and VR Experiences": "AR \u548c VR \u4f53\u9a8c",
      "Interactive Design": "\u4ea4\u4e92\u8bbe\u8ba1",
      "WebGL Development": "WebGL\u5f00\u53d1",
      "Unity/Unreal": "\u7edf\u4e00/\u865a\u5e7b",
      PROJECTS: "\u9879\u76ee",
      Animation: "\u52a8\u753b\u7247",
      "Procedural Modeling": "\u7a0b\u5e8f\u5efa\u6a21",
      "3D Asset Creation": "3D \u8d44\u4ea7\u521b\u5efa",
      "design \u2022 development \u2022 3d": "\u8bbe\u8ba1 \u2022 \u5f00\u53d1 \u2022 3d",
      "concept \u2022 design \u2022 development \u2022 3d":
        "\u6982\u5ff5\u2022\u8bbe\u8ba1\u2022\u5f00\u53d1\u20223d",
      "api design \u2022 webgl \u2022 3d": "API \u8bbe\u8ba1 \u2022 webgl \u2022 3d",
      "Worldcoin Globe": "Worldcoin Globe",
      "3D Pipeline Development": "3D \u7ba1\u9053\u5f00\u53d1",
      "Infinite Passerella": "Infinite Passerella",
      "Lusion Labs": "Lusion Labs",
      "Zero Tech": "Zero Tech",
      "My Little Storybook": "My Little Storybook",
      "together!": "\u4e00\u8d77\uff01",
      "Let's work": "\u8ba9\u6211\u4eec\u5de5\u4f5c\u5427",
      "United Kingdom": "United Kingdom",
      "Twitter / X": "Twitter / X",
      "The Turn Of The Screw": "The Turn Of The Screw",
      Instagram: "Instagram",
      "Is Your Big Idea Ready to Go Wild?":
        "\u60a8\u7684\u4f1f\u5927\u521b\u610f\u51c6\u5907\u597d\u4ed8\u8bf8\u5b9e\u8df5\u4e86\u5417\uff1f",
      Linkedin: "Linkedin",
      "Max Mara: Bearing Gifts": "Max Mara: Bearing Gifts",
      "development \u2022 3D": "\u5f00\u53d1 \u2022 3D",
      "9 Marsh Street": "\u9a6c\u4ec0\u88579\u53f7",
      "Suite 2": "\u5957\u623f2",
      "CONTINUE TO SCROLL": "\u7ee7\u7eed\u6eda\u52a8",
      "New business": "\u65b0\u4e1a\u52a1",
      "About Us": "\u5173\u4e8e\u6211\u4eec",
      "Bristol, BS1 4AA": "Bristol, BS1 4AA",
      "Next Page": "\u4e0b\u4e00\u9875",
      PLAY: "\u64ad\u653e",
      MUTE: "\u9759\u97f3",
      "R&D: labs.lusion.co": "\u7814\u53d1\uff1alabs.lusion.co",
      "business@lusion.co": "business@lusion.co",
      "General enquires": "\u4e00\u822c\u67e5\u8be2",
      "hello@lusion.co": "hello@lusion.co",
      "Go to home page": "\u8f6c\u5230\u4e3b\u9875",
      "\u00a92026 LUSION Creative Studio": "\u00a92026 LUSION\u521b\u610f\u5de5\u4f5c\u5ba4",
      "Built by Lusion with \u2764\ufe0f": "\u7531 Lusion \u4e0e \u2764\ufe0f \u6253\u9020",
      Back: "\u540e\u9000",
      "Your email": "\u60a8\u7684\u7535\u5b50\u90ae\u7bb1",
      "to Learn More": "\u4e86\u89e3\u66f4\u591a",
      "Keep Scrolling": "\u7ee7\u7eed\u6eda\u52a8",
      "Our Projects": "\u6211\u4eec\u7684\u9879\u76ee",
      "Lusion works with a wide range of clients including global brands, startups and agencies.":
        "Lusion \u4e0e\u5e7f\u6cdb\u7684\u5ba2\u6237\u5408\u4f5c\uff0c\u5305\u62ec\u5168\u7403\u54c1\u724c\u3001\u521d\u521b\u516c\u53f8\u548c\u4ee3\u7406\u673a\u6784\u3002",
      "Lusion is a boutique creative production studio with wide range of talents and capabilities for your next project.":
        "Lusion \u662f\u4e00\u5bb6\u7cbe\u54c1\u521b\u610f\u5236\u4f5c\u5de5\u4f5c\u5ba4\uff0c\u4e3a\u60a8\u7684\u4e0b\u4e00\u4e2a\u9879\u76ee\u63d0\u4f9b\u5e7f\u6cdb\u7684\u4eba\u624d\u548c\u80fd\u529b\u3002",
      "Lusion - Award Winning 3D and Interactive Web Studio":
        "Lusion - \u5c61\u83b7\u6b8a\u8363\u7684 3D \u548c\u4ea4\u4e92\u5f0f\u7f51\u7edc\u5de5\u4f5c\u5ba4",
      "Watch reel button": "\u624b\u8868\u5377\u8f74\u6309\u94ae",
      "Menu button": "\u83dc\u5355\u6309\u94ae",
      Services: "\u670d\u52a1",
      "Send newsletter form button": "\u53d1\u9001\u65b0\u95fb\u901a\u8baf\u8868\u5355\u6309\u94ae",
      "We design and produce 3D visual storytelling, immersive websites, and interactive digital experiences that help brands stand out online.":
        "\u6211\u4eec\u8bbe\u8ba1\u548c\u5236\u4f5c 3D \u89c6\u89c9\u53d9\u4e8b\u3001\u6c89\u6d78\u5f0f\u7f51\u7ad9\u548c\u4ea4\u4e92\u5f0f\u6570\u5b57\u4f53\u9a8c\uff0c\u5e2e\u52a9\u54c1\u724c\u5728\u7f51\u4e0a\u8131\u9896\u800c\u51fa\u3002",
      Concept: "\u6982\u5ff5",
      "Web Design": "\u7f51\u9875\u8bbe\u8ba1",
      "Atlas is building next generation motion systems for drones, robotics, and autonomous hardware. We worked with the team to create a focused digital experience that turns a complex manufacturing story into something clear, confident, and tangible. The site introduces Atlas\u2019 joint development model, brings their product and factory story to the surface, and uses precise motion, visual pacing, and selective WebGL to communicate the scale of their ambition without losing the seriousness of the category.":
        "Atlas \u6b63\u5728\u4e3a\u65e0\u4eba\u673a\u3001\u673a\u5668\u4eba\u548c\u81ea\u4e3b\u786c\u4ef6\u6784\u5efa\u4e0b\u4e00\u4ee3\u8fd0\u52a8\u7cfb\u7edf\u3002\u6211\u4eec\u4e0e\u56e2\u961f\u5408\u4f5c\u521b\u9020\u4e86\u4e13\u6ce8\u7684\u6570\u5b57\u4f53\u9a8c\uff0c\u5c06\u590d\u6742\u7684\u5236\u9020\u6545\u4e8b\u53d8\u6210\u6e05\u6670\u3001\u81ea\u4fe1\u548c\u5207\u5b9e\u7684\u4e1c\u897f\u3002\u8be5\u7f51\u7ad9\u4ecb\u7ecd\u4e86 Atlas \u7684\u8054\u5408\u5f00\u53d1\u6a21\u5f0f\uff0c\u5c06\u4ed6\u4eec\u7684\u4ea7\u54c1\u548c\u5de5\u5382\u6545\u4e8b\u6d6e\u51fa\u6c34\u9762\uff0c\u5e76\u4f7f\u7528\u7cbe\u786e\u7684\u52a8\u4f5c\u3001\u89c6\u89c9\u8282\u594f\u548c\u9009\u62e9\u6027\u7684 WebGL \u6765\u4f20\u8fbe\u4ed6\u4eec\u7684\u96c4\u5fc3\u58ee\u5fd7\uff0c\u540c\u65f6\u53c8\u4e0d\u5931\u8be5\u7c7b\u522b\u7684\u4e25\u8083\u6027\u3002",
      "Web Development": "\u7f51\u9875\u5f00\u53d1",
      WebGL: "\u7f51\u9875GL",
      Links: "\u94fe\u63a5",
      "Lusion - About Us": "Lusion - \u5173\u4e8e\u6211\u4eec",
      "Lusion - Our Projects": "Lusion - \u6211\u4eec\u7684\u9879\u76ee",
      "Game Design": "\u6e38\u620f\u8bbe\u8ba1",
      "Launch Project": "\u67e5\u770b\u9879\u76ee",
      "NEXT PROJECT": "\u4e0b\u4e00\u4e2a\u9879\u76ee",
      "Lusion - Atlas Motion": "Lusion - Atlas Motion",
      "3D Design": "3D\u8bbe\u8ba1",
      "With a community-building feature, users shared game snapshots on social media, showcasing engagement strategies. Choo Choo World embodies Lusion's commitment to innovative web technology, inspiring both children and adults":
        "\u901a\u8fc7\u793e\u533a\u5efa\u8bbe\u529f\u80fd\uff0c\u7528\u6237\u53ef\u4ee5\u5728\u793e\u4ea4\u5a92\u4f53\u4e0a\u5206\u4eab\u6e38\u620f\u5feb\u7167\uff0c\u5c55\u793a\u53c2\u4e0e\u7b56\u7565\u3002 Choo Choo World \u4f53\u73b0\u4e86 Lusion \u5bf9\u521b\u65b0\u7f51\u7edc\u6280\u672f\u7684\u627f\u8bfa\uff0c\u6fc0\u52b1\u513f\u7ae5\u548c\u6210\u4eba",
      "UI/UX design": "\u7528\u6237\u754c\u9762/\u7528\u6237\u4f53\u9a8c\u8bbe\u8ba1",
      "Our detailed case study on Atlas Motion. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Atlas Motion \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Creative Coding": "\u521b\u610f\u7f16\u7801",
      "Choo Choo World, a research project by Lusion, aimed to create an enjoyable mini game for all ages, demonstrating web technology's positive potential. It offered a fun introduction to the web, aligned with Lusion\u2019s founders' experiences as parents.":
        "Choo Choo World \u662f Lusion \u7684\u4e00\u4e2a\u7814\u7a76\u9879\u76ee\uff0c\u65e8\u5728\u521b\u9020\u4e00\u6b3e\u9002\u5408\u6240\u6709\u5e74\u9f84\u6bb5\u7684\u6709\u8da3\u7684\u8ff7\u4f60\u6e38\u620f\uff0c\u5c55\u793a\u7f51\u7edc\u6280\u672f\u7684\u79ef\u6781\u6f5c\u529b\u3002\u5b83\u5bf9\u7f51\u7edc\u8fdb\u884c\u4e86\u6709\u8da3\u7684\u4ecb\u7ecd\uff0c\u4e0e Lusion \u521b\u59cb\u4eba\u4f5c\u4e3a\u7236\u6bcd\u7684\u7ecf\u5386\u76f8\u4e00\u81f4\u3002",
      "Awwwards HM": "\u5956\u9879 HM",
      "FWA SOTD": "FWA SOTD",
      "Our detailed case study on Choo Choo World. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Choo Choo World \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Our detailed case study on DDD 2024. Produced by Lusion.":
        "\u6211\u4eec\u5173\u4e8e DDD 2024 \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531 Lusion \u5236\u4f5c\u3002",
      "Digital Design Days is a 3-day experience that gathers in one place thousands of the world\u2019s best professionals with the brightest creativity minds in the industry and the most innovative brands.":
        "\u6570\u5b57\u8bbe\u8ba1\u65e5\u662f\u4e00\u9879\u4e3a\u671f 3 \u5929\u7684\u4f53\u9a8c\uff0c\u805a\u96c6\u4e86\u6570\u5343\u540d\u4e16\u754c\u4e0a\u6700\u4f18\u79c0\u7684\u4e13\u4e1a\u4eba\u58eb\u3001\u4e1a\u5185\u6700\u806a\u660e\u7684\u521b\u610f\u5934\u8111\u548c\u6700\u5177\u521b\u65b0\u6027\u7684\u54c1\u724c\u3002",
      "Lusion - Choo Choo World": "Lusion - Choo Choo World",
      "We partnered with Cognition AI to create a modern website for Devin, their AI software engineer. The challenge was to communicate a complex AI product in a way that felt clear, sleek, and accessible.":
        "\u6211\u4eec\u4e0e Cognition AI \u5408\u4f5c\uff0c\u4e3a\u4ed6\u4eec\u7684\u4eba\u5de5\u667a\u80fd\u8f6f\u4ef6\u5de5\u7a0b\u5e08 Devin \u521b\u5efa\u4e86\u4e00\u4e2a\u73b0\u4ee3\u7f51\u7ad9\u3002\u6211\u4eec\u9762\u4e34\u7684\u6311\u6218\u662f\u4ee5\u4e00\u79cd\u6e05\u6670\u3001\u6d41\u7545\u4e14\u6613\u4e8e\u7406\u89e3\u7684\u65b9\u5f0f\u4f20\u8fbe\u590d\u6742\u7684\u4eba\u5de5\u667a\u80fd\u4ea7\u54c1\u3002",
      "Through subtle storytelling, animation, and interactive design, we introduced Devin\u2019s features in a more engaging way and created a polished experience that felt both advanced and approachable.":
        "\u901a\u8fc7\u5fae\u5999\u7684\u6545\u4e8b\u8bb2\u8ff0\u3001\u52a8\u753b\u548c\u4ea4\u4e92\u8bbe\u8ba1\uff0c\u6211\u4eec\u4ee5\u66f4\u5177\u5438\u5f15\u529b\u7684\u65b9\u5f0f\u4ecb\u7ecd\u4e86 Devin \u7684\u529f\u80fd\uff0c\u5e76\u521b\u9020\u4e86\u4e00\u79cd\u65e2\u5148\u8fdb\u53c8\u5e73\u6613\u8fd1\u4eba\u7684\u7cbe\u81f4\u4f53\u9a8c\u3002",
      "3D Visual design": "3D\u89c6\u89c9\u8bbe\u8ba1",
      "Our detailed case study on Devin AI. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Devin AI \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      Spaace: "\u7a7a\u95f4",
      "Frontend development": "\u524d\u7aef\u5f00\u53d1",
      "Lusion - DDD 2024": "Lusion - DDD 2024",
      "Lusion - Devin AI": "Lusion - Devin AI",
      "We were commissioned by the EverSwap team to create an immersive storytelling experience that makes their Web3 products feel intuitive and engaging. Inspired by the natural flow of liquidity, we built a journey through evolving terrains, rivers and lakes - transforming the complexities of trading, lending and borrowing into a fluid visual narrative of movement, connection and exchange.":
        "\u6211\u4eec\u53d7 EverSwap \u56e2\u961f\u59d4\u6258\u521b\u5efa\u4e00\u79cd\u8eab\u4e34\u5176\u5883\u7684\u8bb2\u6545\u4e8b\u4f53\u9a8c\uff0c\u4f7f\u4ed6\u4eec\u7684 Web3 \u4ea7\u54c1\u611f\u89c9\u76f4\u89c2\u4e14\u5f15\u4eba\u5165\u80dc\u3002\u53d7\u5230\u6d41\u52a8\u6027\u81ea\u7136\u6d41\u52a8\u7684\u542f\u53d1\uff0c\u6211\u4eec\u6784\u5efa\u4e86\u4e00\u6bb5\u7a7f\u8d8a\u4e0d\u65ad\u53d8\u5316\u7684\u5730\u5f62\u3001\u6cb3\u6d41\u548c\u6e56\u6cca\u7684\u65c5\u7a0b\u2014\u2014\u5c06\u4ea4\u6613\u3001\u501f\u8d37\u7684\u590d\u6742\u6027\u8f6c\u5316\u4e3a\u6d41\u52a8\u3001\u8054\u7cfb\u548c\u4ea4\u6362\u7684\u6d41\u7545\u89c6\u89c9\u53d9\u4e8b\u3002",
      "Lusion - Infinite Passerella": "Lusion - Infinite Passerella",
      "A New Era in Fashion Showcase. Lusion's R&D journey transforms fashion shows into interactive virtual experiences, inviting viewers worldwide to a 24/7 spectacle.":
        "\u65f6\u5c1a\u5c55\u793a\u7684\u65b0\u65f6\u4ee3\u3002 Lusion \u7684\u7814\u53d1\u4e4b\u65c5\u5c06\u65f6\u88c5\u79c0\u8f6c\u53d8\u4e3a\u4ea4\u4e92\u5f0f\u865a\u62df\u4f53\u9a8c\uff0c\u9080\u8bf7\u4e16\u754c\u5404\u5730\u7684\u89c2\u4f17\u89c2\u770b 24/7 \u7684\u7cbe\u5f69\u8868\u6f14\u3002",
      "Our detailed case study on Everswap. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Everswap \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Porsche:<br>Dream Machine": "Porsche:<br>Dream Machine",
      "Awwwards SOTD": "SOTD \u5956\u9879",
      "Lusion - Everswap": "Lusion - Everswap",
      "Lusion's Dedication to Innovation and Exploration. Our dedicated space showcases internal R&D initiatives, reflecting our commitment to tech advancement. With a sleek, enchanting design, the site offers exclusive insights into our ongoing research, sparking curiosity and inspiring engaging experiences.":
        "Lusion\u81f4\u529b\u4e8e\u521b\u65b0\u548c\u63a2\u7d22\u3002\u6211\u4eec\u7684\u4e13\u7528\u7a7a\u95f4\u5c55\u793a\u4e86\u5185\u90e8\u7814\u53d1\u8ba1\u5212\uff0c\u4f53\u73b0\u4e86\u6211\u4eec\u5bf9\u6280\u672f\u8fdb\u6b65\u7684\u627f\u8bfa\u3002\u8be5\u7f51\u7ad9\u91c7\u7528\u65f6\u5c1a\u3001\u8ff7\u4eba\u7684\u8bbe\u8ba1\uff0c\u63d0\u4f9b\u5bf9\u6211\u4eec\u6b63\u5728\u8fdb\u884c\u7684\u7814\u7a76\u7684\u72ec\u5bb6\u89c1\u89e3\uff0c\u6fc0\u53d1\u597d\u5947\u5fc3\u5e76\u63d0\u4f9b\u9f13\u821e\u4eba\u5fc3\u7684\u53c2\u4e0e\u4f53\u9a8c\u3002",
      "Our detailed case study on Infinite Passerella. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Infinite Passerella \u8fdb\u884c\u4e86\u8be6\u7ec6\u7684\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Meticulously crafted clothing textures and 3D models seamlessly merge fashion and technology, captivating enthusiasts. This pioneering project bridges the realms of fashion and digital innovation, paving the way for the future of virtual fashion.":
        "\u7cbe\u5fc3\u5236\u4f5c\u7684\u670d\u88c5\u7eb9\u7406\u548c3D\u6a21\u578b\u5c06\u65f6\u5c1a\u4e0e\u79d1\u6280\u65e0\u7f1d\u878d\u5408\uff0c\u4ee4\u7231\u597d\u8005\u7740\u8ff7\u3002\u8fd9\u4e2a\u5f00\u521b\u6027\u7684\u9879\u76ee\u67b6\u8d77\u4e86\u65f6\u5c1a\u548c\u6570\u5b57\u521b\u65b0\u9886\u57df\u7684\u6865\u6881\uff0c\u4e3a\u865a\u62df\u65f6\u5c1a\u7684\u672a\u6765\u94fa\u5e73\u4e86\u9053\u8def\u3002",
      "Our detailed case study on Lusion Labs. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Lusion Labs \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Pioneering the Future of Tech-Driven Advertising. For our clients, this website unveils uncharted possibilities. Displaying our prowess with groundbreaking tech, it inspires fresh avenues for captivating and engaging target audiences.":
        "\u5f00\u521b\u6280\u672f\u9a71\u52a8\u5e7f\u544a\u7684\u672a\u6765\u3002\u5bf9\u4e8e\u6211\u4eec\u7684\u5ba2\u6237\u6765\u8bf4\uff0c\u8be5\u7f51\u7ad9\u63ed\u793a\u4e86\u672a\u77e5\u7684\u53ef\u80fd\u6027\u3002\u5b83\u5c55\u793a\u4e86\u6211\u4eec\u5728\u7a81\u7834\u6027\u6280\u672f\u65b9\u9762\u7684\u5b9e\u529b\uff0c\u6fc0\u53d1\u4e86\u5438\u5f15\u548c\u5438\u5f15\u76ee\u6807\u53d7\u4f17\u7684\u65b0\u9014\u5f84\u3002",
      "Collaborating with LOW: Transforming Digital Experiences. Our partnership on the MaxMara project showcases how creativity shapes digital landscapes. LOW's vision for a charming interactive web experience led to Max the Teddy guiding users through playful scenes and product showcases.":
        "\u4e0e LOW \u5408\u4f5c\uff1a\u8f6c\u53d8\u6570\u5b57\u4f53\u9a8c\u3002\u6211\u4eec\u5728 MaxMara \u9879\u76ee\u4e0a\u7684\u5408\u4f5c\u5c55\u793a\u4e86\u521b\u9020\u529b\u5982\u4f55\u5851\u9020\u6570\u5b57\u666f\u89c2\u3002 LOW \u5bf9\u8ff7\u4eba\u7684\u4ea4\u4e92\u5f0f\u7f51\u7edc\u4f53\u9a8c\u7684\u613f\u666f\u5bfc\u81f4 Max the Teddy \u5f15\u5bfc\u7528\u6237\u6d4f\u89c8\u6709\u8da3\u7684\u573a\u666f\u548c\u4ea7\u54c1\u5c55\u793a\u3002",
      "Our detailed case study on Max Mara: Bearing Gifts. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Max Mara \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\uff1a\u8f74\u627f\u793c\u54c1\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Strategic decisions ensured consistent experiences across devices, including non-real-time lighting for optimized performance. Collaborating with 3D modeling vendors enriched the application with carefully designed assets, seamlessly integrating our services.":
        "\u6218\u7565\u51b3\u7b56\u786e\u4fdd\u8de8\u8bbe\u5907\u7684\u4e00\u81f4\u4f53\u9a8c\uff0c\u5305\u62ec\u7528\u4e8e\u4f18\u5316\u6027\u80fd\u7684\u975e\u5b9e\u65f6\u7167\u660e\u3002\u4e0e 3D \u5efa\u6a21\u4f9b\u5e94\u5546\u5408\u4f5c\uff0c\u901a\u8fc7\u7cbe\u5fc3\u8bbe\u8ba1\u7684\u8d44\u4ea7\u4e30\u5bcc\u4e86\u5e94\u7528\u7a0b\u5e8f\uff0c\u65e0\u7f1d\u96c6\u6210\u4e86\u6211\u4eec\u7684\u670d\u52a1\u3002",
      "Central to our approach is meticulous planning, aligning render quality, timelines, and budgets for creative practicality. Transparent communication with LOW's team fostered a shared vision, enabling us to explore unique possibilities.":
        "\u6211\u4eec\u65b9\u6cd5\u7684\u6838\u5fc3\u662f\u7cbe\u5fc3\u89c4\u5212\uff0c\u8c03\u6574\u6e32\u67d3\u8d28\u91cf\u3001\u65f6\u95f4\u8868\u548c\u9884\u7b97\u4ee5\u5b9e\u73b0\u521b\u610f\u5b9e\u7528\u6027\u3002\u4e0e LOW \u56e2\u961f\u7684\u900f\u660e\u6c9f\u901a\u57f9\u517b\u4e86\u5171\u540c\u7684\u613f\u666f\uff0c\u4f7f\u6211\u4eec\u80fd\u591f\u63a2\u7d22\u72ec\u7279\u7684\u53ef\u80fd\u6027\u3002",
      "Lusion - Lusion Labs": "Lusion - Lusion Labs",
      "Royal Botanic Gardens, Kew": "Royal Botanic Gardens, Kew",
      "Expanding Boundaries through Cinematic Innovation. An R&D feat by Lusion, this project showcased team versatility and artistry. We crafted 3D assets from scratch and seamlessly blended hand-drawn sketches into a captivating WebGL environment for a unique experience.":
        "\u901a\u8fc7\u7535\u5f71\u521b\u65b0\u62d3\u5c55\u8fb9\u754c\u3002\u8be5\u9879\u76ee\u662f Lusion \u7684\u7814\u53d1\u58ee\u4e3e\uff0c\u5c55\u793a\u4e86\u56e2\u961f\u7684\u591a\u529f\u80fd\u6027\u548c\u827a\u672f\u6027\u3002\u6211\u4eec\u4ece\u5934\u5f00\u59cb\u5236\u4f5c 3D \u8d44\u6e90\uff0c\u5e76\u5c06\u624b\u7ed8\u8349\u56fe\u65e0\u7f1d\u878d\u5408\u5230\u8ff7\u4eba\u7684 WebGL \u73af\u5883\u4e2d\uff0c\u4ee5\u83b7\u5f97\u72ec\u7279\u7684\u4f53\u9a8c\u3002",
      "Lusion - Max Mara: Bearing Gifts": "Lusion - Max Mara: Bearing Gifts",
      "Crafting My Little Storybook's Triumph. The Lusion team meticulously shaped every element in this challenging one-month project. Their dedication resulted in acclaim, with multiple awards, including the coveted 2022 Webby Award for Best Visual Design Aesthetic, recognizing the blend of innovation and creativity.":
        "\u6253\u9020My Little Storybook\u7684\u80dc\u5229\u3002 Lusion \u56e2\u961f\u5728\u8fd9\u4e2a\u4e3a\u671f\u4e00\u4e2a\u6708\u7684\u5145\u6ee1\u6311\u6218\u7684\u9879\u76ee\u4e2d\u7cbe\u5fc3\u5851\u9020\u4e86\u6bcf\u4e00\u4e2a\u5143\u7d20\u3002\u4ed6\u4eec\u7684\u5949\u732e\u7cbe\u795e\u8d62\u5f97\u4e86\u8d5e\u8a89\uff0c\u8363\u83b7\u591a\u9879\u5956\u9879\uff0c\u5305\u62ec\u4ee4\u4eba\u5782\u6d8e\u7684 2022 \u5e74\u5a01\u6bd4\u6700\u4f73\u89c6\u89c9\u8bbe\u8ba1\u7f8e\u5b66\u5956\uff0c\u8be5\u5956\u8868\u5f70\u4e86\u521b\u65b0\u4e0e\u521b\u9020\u529b\u7684\u878d\u5408\u3002",
      blooloop: "\u5e03\u5362\u6d1b\u666e",
      ". Designed to extend the project beyond the installation itself, the experience gave onsite visitors a more interactive way to engage with the work while also making it accessible to online audiences.":
        "\u3002\u8fd9\u79cd\u4f53\u9a8c\u65e8\u5728\u5c06\u9879\u76ee\u6269\u5c55\u5230\u88c5\u7f6e\u672c\u8eab\u4e4b\u5916\uff0c\u4e3a\u73b0\u573a\u53c2\u89c2\u8005\u63d0\u4f9b\u4e86\u4e00\u79cd\u66f4\u5177\u4e92\u52a8\u6027\u7684\u65b9\u5f0f\u6765\u53c2\u4e0e\u4f5c\u54c1\uff0c\u540c\u65f6\u4e5f\u4f7f\u5728\u7ebf\u89c2\u4f17\u53ef\u4ee5\u8bbf\u95ee\u5b83\u3002",
      MLF: "MLF",
      "Our detailed case study on My Little Storybook. Produced by Lusion.":
        "\u6211\u4eec\u5bf9\u300aMy Little Storybook\u300b\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Lusion - My Little Storybook": "Lusion - My Little Storybook",
      "approached us to create a web companion for Of The Oak, their physical installation created in collaboration with":
        "\u8054\u7cfb\u6211\u4eec\u4e3a Of The Oak \u521b\u5efa\u4e00\u4e2a\u7f51\u7edc\u4f34\u4fa3\uff0c\u4ed6\u4eec\u7684\u7269\u7406\u88c5\u7f6e\u662f\u4e0e",
      "We built a robust Houdini to WebGL pipeline that compresses complex 3D tree, branch, and node structures into a custom web format, reducing the download size to just 3.5 MB while leveraging WebGL instancing for fast delivery.":
        "\u6211\u4eec\u6784\u5efa\u4e86\u4e00\u4e2a\u5f3a\u5927\u7684 Houdini \u5230 WebGL \u7ba1\u9053\uff0c\u53ef\u5c06\u590d\u6742\u7684 3D \u6811\u3001\u5206\u652f\u548c\u8282\u70b9\u7ed3\u6784\u538b\u7f29\u4e3a\u81ea\u5b9a\u4e49 Web \u683c\u5f0f\uff0c\u5c06\u4e0b\u8f7d\u5927\u5c0f\u51cf\u5c11\u81f3\u4ec5 3.5 MB\uff0c\u540c\u65f6\u5229\u7528 WebGL \u5b9e\u4f8b\u5b9e\u73b0\u5feb\u901f\u4ea4\u4ed8\u3002",
      "Product Hunt launch": "\u4ea7\u54c1\u641c\u7d22\u542f\u52a8",
      "Our detailed case study on Of The Oak. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Of The Oak \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "The website helped bridge the physical and digital experience, offering a space for visitors to explore the project in greater depth and learn more about its story, ideas, and context.":
        "\u8be5\u7f51\u7ad9\u5e2e\u52a9\u8fde\u63a5\u4e86\u7269\u7406\u548c\u6570\u5b57\u4f53\u9a8c\uff0c\u4e3a\u8bbf\u95ee\u8005\u63d0\u4f9b\u4e86\u4e00\u4e2a\u66f4\u6df1\u5165\u5730\u63a2\u7d22\u8be5\u9879\u76ee\u5e76\u66f4\u591a\u5730\u4e86\u89e3\u5176\u6545\u4e8b\u3001\u60f3\u6cd5\u548c\u80cc\u666f\u7684\u7a7a\u95f4\u3002",
      "Lusion - Of The Oak": "Lusion - Of The Oak",
      "Oryzo AI is a self initiated project by Lusion built around a deliberately ridiculous idea: presenting a simple cork coaster as a serious AI era product launch. We treated it as a full campaign, combining premium visual production with satire to see how far craft, storytelling, and presentation could push an ordinary object.":
        "Oryzo AI \u662f Lusion \u81ea\u884c\u53d1\u8d77\u7684\u9879\u76ee\uff0c\u56f4\u7ed5\u4e00\u4e2a\u523b\u610f\u8352\u8c2c\u7684\u60f3\u6cd5\u800c\u5efa\u7acb\uff1a\u5c06\u4e00\u4e2a\u7b80\u5355\u7684\u8f6f\u6728\u676f\u57ab\u4f5c\u4e3a\u4e25\u8083\u7684\u4eba\u5de5\u667a\u80fd\u65f6\u4ee3\u4ea7\u54c1\u53d1\u5e03\u3002\u6211\u4eec\u5c06\u5176\u89c6\u4e3a\u4e00\u573a\u5b8c\u6574\u7684\u6d3b\u52a8\uff0c\u5c06\u4f18\u8d28\u7684\u89c6\u89c9\u5236\u4f5c\u4e0e\u8bbd\u523a\u7ed3\u5408\u8d77\u6765\uff0c\u770b\u770b\u5de5\u827a\u3001\u8bb2\u6545\u4e8b\u548c\u5c55\u793a\u53ef\u4ee5\u5c06\u4e00\u4e2a\u666e\u901a\u7684\u7269\u4f53\u63a8\u5411\u591a\u8fdc\u3002",
      Github: "\u5409\u56fe\u5e03",
      "Beyond the main website, we extended the idea across a":
        "\u9664\u4e86\u4e3b\u7f51\u7ad9\u4e4b\u5916\uff0c\u6211\u4eec\u8fd8\u5c06\u8fd9\u4e2a\u60f3\u6cd5\u6269\u5c55\u5230\u4e86\u5176\u4ed6\u7f51\u7ad9",
      "Product Hunt": "Product Hunt",
      "GitHub page": "GitHub \u9875\u9762",
      "founder video": "\u521b\u59cb\u4eba\u89c6\u9891",
      ", and social content. It gave us room to experiment more freely with tone and campaign thinking, while showing the same level of design, motion, and digital production we bring to client work.":
        "\u548c\u793e\u4ea4\u5185\u5bb9\u3002\u5b83\u4e3a\u6211\u4eec\u63d0\u4f9b\u4e86\u66f4\u81ea\u7531\u5730\u5c1d\u8bd5\u57fa\u8c03\u548c\u6d3b\u52a8\u601d\u7ef4\u7684\u7a7a\u95f4\uff0c\u540c\u65f6\u5c55\u793a\u4e86\u6211\u4eec\u4e3a\u5ba2\u6237\u5de5\u4f5c\u5e26\u6765\u7684\u76f8\u540c\u6c34\u5e73\u7684\u8bbe\u8ba1\u3001\u52a8\u4f5c\u548c\u6570\u5b57\u5236\u4f5c\u3002",
      Compositing: "\u5408\u6210",
      "Watch Video": "\u89c2\u770b\u89c6\u9891",
      "Our detailed case study on Oryzo AI. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Oryzo AI \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "FWA SOTM": "FWA SOTM",
      "Awwwards SOTM": "SOTM \u5956\u9879",
      "Wallpaper*": "Wallpaper*",
      "Lusion - Oryzo AI": "Lusion - Oryzo AI",
      "Commissioned by Wallpaper* and Porsche GB, Lusion created a CG short film inspired by the visionary ambitions of Porsche founder Ferry Porsche.":
        "\u53d7 Wallpaper* \u548c Porsche GB \u7684\u59d4\u6258\uff0cLusion \u521b\u4f5c\u4e86\u4e00\u90e8 CG \u77ed\u7247\uff0c\u5176\u7075\u611f\u6e90\u81ea\u4fdd\u65f6\u6377\u521b\u59cb\u4eba\u8d39\u91cc\u00b7\u4fdd\u65f6\u6377 (Ferry Porsche) \u7684\u8fdc\u89c1\u5353\u8bc6\u3002",
      "Porsche:": "\u4fdd\u65f6\u6377\uff1a",
      "Dream Machine": "Dream Machine",
      "Directed by Edan Kwan, the piece takes audiences on a four phase journey through the evolution of Porsche sports cars, expressed through digital art and motion design. The work was later showcased at Outernet London across 23,000 square feet of wraparound floor to ceiling 16K LED screens.":
        "\u8be5\u4f5c\u54c1\u7531 Edan Kwan \u6267\u5bfc\uff0c\u5e26\u9886\u89c2\u4f17\u8e0f\u4e0a\u901a\u8fc7\u6570\u5b57\u827a\u672f\u548c\u52a8\u6001\u8bbe\u8ba1\u8868\u8fbe\u7684\u4fdd\u65f6\u6377\u8dd1\u8f66\u6f14\u53d8\u7684\u56db\u4e2a\u9636\u6bb5\u7684\u65c5\u7a0b\u3002\u8be5\u4f5c\u54c1\u968f\u540e\u5728\u4f26\u6566 Outernet \u7684 23,000 \u5e73\u65b9\u82f1\u5c3a\u7684\u73af\u7ed5\u5f0f\u843d\u5730 16K LED \u5c4f\u5e55\u4e0a\u8fdb\u884c\u4e86\u5c55\u793a\u3002",
      "Our detailed case study on Porsche: Dream Machine. Produced by Lusion.":
        "\u6211\u4eec\u5bf9Porsche\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\uff1aDream Machine\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Porsche Newsroom": "Porsche Newsroom",
      "Lusion teamed up with GoSpooky to embark on an exciting journey with Coca-Cola European Partners. Our mission? To elevate the way soft drinks are served by bringing the magic of web-based augmented reality (AR) to the beverage experience.":
        "Lusion \u4e0e GoSpooky \u8054\u624b\uff0c\u4e0e\u53ef\u53e3\u53ef\u4e50\u6b27\u6d32\u5408\u4f5c\u4f19\u4f34\u4e00\u8d77\u8e0f\u4e0a\u4e86\u6fc0\u52a8\u4eba\u5fc3\u7684\u65c5\u7a0b\u3002\u6211\u4eec\u7684\u4f7f\u547d\uff1f\u901a\u8fc7\u5c06\u57fa\u4e8e\u7f51\u7edc\u7684\u589e\u5f3a\u73b0\u5b9e (AR) \u7684\u9b54\u529b\u5f15\u5165\u996e\u6599\u4f53\u9a8c\u4e2d\uff0c\u63d0\u5347\u8f6f\u996e\u6599\u7684\u4f9b\u5e94\u65b9\u5f0f\u3002",
      "Lusion - Porsche: Dream Machine": "Lusion - Porsche: Dream Machine",
      "We worked with Spaace to bring this immersive brand website for their newly released gamification NFT marketplace.":
        "\u6211\u4eec\u4e0e Spaace \u5408\u4f5c\uff0c\u4e3a\u4ed6\u4eec\u65b0\u53d1\u5e03\u7684\u6e38\u620f\u5316 NFT \u5e02\u573a\u5e26\u6765\u4e86\u8fd9\u4e2a\u6c89\u6d78\u5f0f\u54c1\u724c\u7f51\u7ad9\u3002",
      WebAR: "\u7f51\u7edc\u589e\u5f3a\u73b0\u5b9e",
      "Lusion - Soda Experience": "Lusion - Soda Experience",
      "8th Wall Blog": "8th Wall Blog",
      "Our detailed case study on Soda Experience. Produced by Lusion.":
        "\u6211\u4eec\u5173\u4e8e\u82cf\u6253\u4f53\u9a8c\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Faced with a tight timeline due to a previous vendor's shortfall, Lusion undertook the challenge to create a lifelike WebAR encounter that would make Coca-Cola's drink offerings burst to life.":
        "\u7531\u4e8e\u4e4b\u524d\u4f9b\u5e94\u5546\u7684\u8d44\u91d1\u77ed\u7f3a\uff0c\u65f6\u95f4\u7d27\u8feb\uff0cLusion \u63a5\u53d7\u4e86\u6311\u6218\uff0c\u521b\u5efa\u4e00\u4e2a\u903c\u771f\u7684 WebAR \u4f53\u9a8c\uff0c\u8ba9\u53ef\u53e3\u53ef\u4e50\u7684\u996e\u6599\u4ea7\u54c1\u7115\u53d1\u6d3b\u529b\u3002",
      "Our detailed case study on Spaace - NFT Marketplace. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Spaace - NFT \u5e02\u573a\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      WebXR: "\u7f51\u7edcXR",
      "Lusion partnered with Phoria and Meta to create Spatial Fusion, an immersive WebXR experience that pushed the possibilities of web based mixed reality. Built with technologies such as spatial anchors, plane detection, and full color passthrough, the project explored new ways for users to interact with digital content in physical space.":
        "Lusion \u4e0e Phoria \u548c Meta \u5408\u4f5c\u521b\u5efa\u4e86 Spatial Fusion\uff0c\u8fd9\u662f\u4e00\u79cd\u8eab\u4e34\u5176\u5883\u7684 WebXR \u4f53\u9a8c\uff0c\u63a8\u52a8\u4e86\u57fa\u4e8e\u7f51\u7edc\u7684\u6df7\u5408\u73b0\u5b9e\u7684\u53ef\u80fd\u6027\u3002\u8be5\u9879\u76ee\u91c7\u7528\u7a7a\u95f4\u951a\u70b9\u3001\u5e73\u9762\u68c0\u6d4b\u548c\u5168\u5f69\u76f4\u901a\u7b49\u6280\u672f\u6784\u5efa\uff0c\u63a2\u7d22\u4e86\u7528\u6237\u5728\u7269\u7406\u7a7a\u95f4\u4e2d\u4e0e\u6570\u5b57\u5185\u5bb9\u4ea4\u4e92\u7684\u65b0\u65b9\u5f0f\u3002",
      "From creative and production, we took their raw brand material and take it into a whole new level of storytelling in this interactive web experience.":
        "\u4ece\u521b\u610f\u548c\u5236\u4f5c\u4e2d\uff0c\u6211\u4eec\u91c7\u7528\u4e86\u4ed6\u4eec\u7684\u539f\u59cb\u54c1\u724c\u6750\u6599\uff0c\u5e76\u5c06\u5176\u5e26\u5165\u4ea4\u4e92\u5f0f\u7f51\u7edc\u4f53\u9a8c\u4e2d\u8bb2\u6545\u4e8b\u7684\u5168\u65b0\u6c34\u5e73\u3002",
      "Lusion - Spaace - NFT Marketplace": "Lusion - Spaace - NFT Marketplace",
      "Our detailed case study on Synthetic Human. Produced by Lusion.":
        "\u6211\u4eec\u5bf9Synthetic Human\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Lusion - Meta: Spatial Fusion": "Lusion - Meta: Spatial Fusion",
      "Our detailed case study on Meta: Spatial Fusion. Produced by Lusion.":
        "\u6211\u4eec\u5bf9Meta: Spatial Fusion\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "3D Visual optimization": "3D\u89c6\u89c9\u4f18\u5316",
      "Bringing together expertise across creative technology, immersive design, and web development, the collaboration helped turn a complex technical challenge into a seamless spatial storytelling experience. The result was a forward looking mixed reality venture that invited users into a new kind of interactive world.":
        "\u6b64\u6b21\u5408\u4f5c\u6c47\u96c6\u4e86\u521b\u610f\u6280\u672f\u3001\u6c89\u6d78\u5f0f\u8bbe\u8ba1\u548c\u7f51\u7edc\u5f00\u53d1\u65b9\u9762\u7684\u4e13\u4e1a\u77e5\u8bc6\uff0c\u5e2e\u52a9\u5c06\u590d\u6742\u7684\u6280\u672f\u6311\u6218\u8f6c\u5316\u4e3a\u65e0\u7f1d\u7684\u7a7a\u95f4\u53d9\u4e8b\u4f53\u9a8c\u3002\u7ed3\u679c\u662f\u4e00\u4e2a\u5177\u6709\u524d\u77bb\u6027\u7684\u6df7\u5408\u73b0\u5b9e\u4f01\u4e1a\uff0c\u9080\u8bf7\u7528\u6237\u8fdb\u5165\u4e00\u4e2a\u65b0\u7684\u4e92\u52a8\u4e16\u754c\u3002",
      "We partnered with Fantasy to launch the campaign website for Synthetic Humans, their new AI product. The goal was to create a visually rich digital experience that could support the ambition and identity of the launch.":
        "\u6211\u4eec\u4e0e Fantasy \u5408\u4f5c\u63a8\u51fa\u4e86\u4ed6\u4eec\u7684\u65b0\u4eba\u5de5\u667a\u80fd\u4ea7\u54c1 Synthetic Humans \u7684\u6d3b\u52a8\u7f51\u7ad9\u3002\u76ee\u6807\u662f\u521b\u9020\u89c6\u89c9\u4e30\u5bcc\u7684\u6570\u5b57\u4f53\u9a8c\uff0c\u4ee5\u652f\u6301\u53d1\u5e03\u7684\u96c4\u5fc3\u548c\u7279\u8272\u3002",
      "Our team developed a Houdini FX based workflow to optimize high quality 3D assets for real time use on the web, alongside building the interactive front end of the site. We also created the procedural animations and visual effects that gave the experience its depth, movement, and character.":
        "\u6211\u4eec\u7684\u56e2\u961f\u5f00\u53d1\u4e86\u57fa\u4e8e Houdini FX \u7684\u5de5\u4f5c\u6d41\u7a0b\uff0c\u4ee5\u4f18\u5316\u9ad8\u8d28\u91cf\u7684 3D \u8d44\u6e90\uff0c\u4ee5\u4fbf\u5728\u7f51\u7edc\u4e0a\u5b9e\u65f6\u4f7f\u7528\uff0c\u540c\u65f6\u6784\u5efa\u7f51\u7ad9\u7684\u4ea4\u4e92\u5f0f\u524d\u7aef\u3002\u6211\u4eec\u8fd8\u521b\u5efa\u4e86\u7a0b\u5e8f\u52a8\u753b\u548c\u89c6\u89c9\u6548\u679c\uff0c\u8d4b\u4e88\u4f53\u9a8c\u6df1\u5ea6\u3001\u52a8\u611f\u548c\u4e2a\u6027\u3002",
      "In collaboration with": "\u4e0e\u5408\u4f5c",
      "API Design": "API\u8bbe\u8ba1",
      "In October 2019, Opera North, alongside the Audiolab of York University and the sound artist James Bulley, came to Lusion for a collaboration on an innovative cultural project. Their idea was to record the Turn of the Screw opera in a spatialized way, then place these recordings in an explorable 3D environment. The main goal of this project was to create an audiovisual walk through a binaural landscape.":
        "2019 \u5e74 10 \u6708\uff0cOpera North \u4e0e\u7ea6\u514b\u5927\u5b66 Audiolab \u548c\u58f0\u97f3\u827a\u672f\u5bb6 James Bulley \u6765\u5230 Lusion \u5408\u4f5c\u5f00\u5c55\u4e00\u9879\u521b\u65b0\u6587\u5316\u9879\u76ee\u3002\u4ed6\u4eec\u7684\u60f3\u6cd5\u662f\u4ee5\u7a7a\u95f4\u5316\u7684\u65b9\u5f0f\u5f55\u5236\u300a\u87ba\u4e1d\u5728\u62e7\u7d27\u300b\u6b4c\u5267\uff0c\u7136\u540e\u5c06\u8fd9\u4e9b\u5f55\u97f3\u653e\u7f6e\u5728\u53ef\u63a2\u7d22\u7684 3D \u73af\u5883\u4e2d\u3002\u8be5\u9879\u76ee\u7684\u4e3b\u8981\u76ee\u6807\u662f\u521b\u5efa\u4e00\u4e2a\u7a7f\u8d8a\u53cc\u8033\u666f\u89c2\u7684\u89c6\u542c\u6f2b\u6b65\u3002",
      "Tools for Humanity": "Tools for Humanity",
      "Our detailed case study on The Turn Of The Screw. Produced by Lusion.":
        "\u6211\u4eec\u5bf9\u87ba\u4e1d\u8f6c\u52a8\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Lusion - Synthetic Human": "Lusion - Synthetic Human",
      "Lusion - The Turn Of The Screw": "Lusion - The Turn Of The Screw",
      "All dot positions are procedrually generated and animated in real-time. We used the index breakpoints to reduce the data needed to store the country data and the dot positions. This allowed us to store the data in a single image file, which is then decoded and rendered on the fly.":
        "\u6240\u6709\u70b9\u4f4d\u7f6e\u5747\u6309\u7a0b\u5e8f\u751f\u6210\u5e76\u5b9e\u65f6\u52a8\u753b\u5316\u3002\u6211\u4eec\u4f7f\u7528\u7d22\u5f15\u65ad\u70b9\u6765\u51cf\u5c11\u5b58\u50a8\u56fd\u5bb6/\u5730\u533a\u6570\u636e\u548c\u70b9\u4f4d\u7f6e\u6240\u9700\u7684\u6570\u636e\u3002\u8fd9\u4f7f\u6211\u4eec\u80fd\u591f\u5c06\u6570\u636e\u5b58\u50a8\u5728\u5355\u4e2a\u56fe\u50cf\u6587\u4ef6\u4e2d\uff0c\u7136\u540e\u5373\u65f6\u89e3\u7801\u548c\u6e32\u67d3\u3002",
      ", we successfully integrated the dynamic Worldcoin 3D globe visualizer onto their website.":
        "\uff0c\u6211\u4eec\u6210\u529f\u5730\u5c06\u52a8\u6001 Worldcoin 3D \u5730\u7403\u53ef\u89c6\u5316\u5de5\u5177\u96c6\u6210\u5230\u4ed6\u4eec\u7684\u7f51\u7ad9\u4e0a\u3002",
      "Select language": "\u9009\u62e9\u8bed\u8a00",
      "Our detailed case study on Worldcoin Globe. Produced by Lusion.":
        "\u6211\u4eec\u5bf9 Worldcoin Globe \u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "Lusion - Worldcoin Globe": "Lusion - Worldcoin Globe",
      Language: "\u8bed\u8a00",
      "Lusion - Zero Tech": "Lusion - Zero Tech",
      "Our team crafted specialized APIs, empowering the Worldcoin developer team to seamlessly activate visual effects in response to real-time user registration data. Furthermore, we innovatively embedded and compressed country and visual information into an image data format, optimizing GPU-based rendering for efficiency and speed.":
        "\u6211\u4eec\u7684\u56e2\u961f\u7cbe\u5fc3\u8bbe\u8ba1\u4e86\u4e13\u95e8\u7684 API\uff0c\u4f7f Worldcoin \u5f00\u53d1\u56e2\u961f\u80fd\u591f\u65e0\u7f1d\u6fc0\u6d3b\u89c6\u89c9\u6548\u679c\uff0c\u4ee5\u54cd\u5e94\u5b9e\u65f6\u7528\u6237\u6ce8\u518c\u6570\u636e\u3002\u6b64\u5916\uff0c\u6211\u4eec\u521b\u65b0\u5730\u5c06\u56fd\u5bb6\u548c\u89c6\u89c9\u4fe1\u606f\u5d4c\u5165\u5e76\u538b\u7f29\u5230\u56fe\u50cf\u6570\u636e\u683c\u5f0f\u4e2d\uff0c\u4f18\u5316\u57fa\u4e8e GPU \u7684\u6e32\u67d3\u4ee5\u63d0\u9ad8\u6548\u7387\u548c\u901f\u5ea6\u3002",
      "This created an immersive, visually stunning platform that effectively communicated Zero's innovation and solidified their position as a technology leader.":
        "\u8fd9\u521b\u5efa\u4e86\u4e00\u4e2a\u8eab\u4e34\u5176\u5883\u3001\u89c6\u89c9\u9707\u64bc\u7684\u5e73\u53f0\uff0c\u6709\u6548\u5730\u4f20\u8fbe\u4e86 Zero \u7684\u521b\u65b0\u5e76\u5de9\u56fa\u4e86\u4ed6\u4eec\u4f5c\u4e3a\u6280\u672f\u9886\u5bfc\u8005\u7684\u5730\u4f4d\u3002",
      "Zero approached us to design an engaging interactive website for Zero.Tech. With a focus on captivating and informing their tech-savvy audience, we seamlessly merged realtime 3D visuals and scroll navigation.":
        "Zero \u8054\u7cfb\u6211\u4eec\uff0c\u4e3a Zero.Tech \u8bbe\u8ba1\u4e00\u4e2a\u5f15\u4eba\u5165\u80dc\u7684\u4e92\u52a8\u7f51\u7ad9\u3002\u6211\u4eec\u4e13\u6ce8\u4e8e\u5438\u5f15\u7cbe\u901a\u6280\u672f\u7684\u53d7\u4f17\u5e76\u4e3a\u5176\u63d0\u4f9b\u4fe1\u606f\uff0c\u56e0\u6b64\u65e0\u7f1d\u878d\u5408\u4e86\u5b9e\u65f6 3D \u89c6\u89c9\u6548\u679c\u548c\u6eda\u52a8\u5bfc\u822a\u3002",
      "Our detailed case study on Zero Tech. Produced by Lusion.":
        "\u6211\u4eec\u5bf9\u96f6\u6280\u672f\u7684\u8be6\u7ec6\u6848\u4f8b\u7814\u7a76\u3002\u7531Lusion\u5236\u4f5c\u3002",
      "This Porsche: Dream Machine video is not included in the local project files.":
        "\u6b64\u4fdd\u65f6\u6377\uff1a\u68a6\u60f3\u673a\u5668\u89c6\u9891\u4e0d\u5305\u542b\u5728\u672c\u5730\u9879\u76ee\u6587\u4ef6\u4e2d\u3002",
      "The full Lusion Reel is not included in the local project files.":
        "\u5b8c\u6574\u7684 Lusion Reel \u4e0d\u5305\u542b\u5728\u672c\u5730\u9879\u76ee\u6587\u4ef6\u4e2d\u3002",
      "Newsletter sign-up is unavailable in this local copy.":
        "\u5728\u6b64\u672c\u5730\u526f\u672c\u4e2d\u65e0\u6cd5\u6ce8\u518c\u65f6\u4e8b\u901a\u8baf\u3002",
      "We create bold presentation slides and visual stories that help ideas stand out":
        "\u6211\u4eec\u6253\u9020\u5927\u80c6\u7684\u6f14\u793a\u6587\u7a3f\u548c\u89c6\u89c9\u53d9\u4e8b\uff0c\u8ba9\u521b\u610f\u8131\u9896\u800c\u51fa\u3002",
    },
  };
  const languageKey = "lusion-language";
  const languages = ["en", "vi", "zh-CN"];
  let activeLanguage = "en";
  try {
    const savedLanguage = window.localStorage.getItem(languageKey);
    if (languages.includes(savedLanguage)) activeLanguage = savedLanguage;
  } catch {
    // Browser storage may be unavailable in private or restricted browsing contexts.
  }

  const metaLocale = { en: "en_US", vi: "vi_VN", "zh-CN": "zh_CN" };
  document.documentElement.lang = activeLanguage;
  document.documentElement.dataset.lusionLanguage = activeLanguage;
  const localeMeta = document.querySelector('meta[property="og:locale"]');
  if (localeMeta) localeMeta.setAttribute("content", metaLocale[activeLanguage]);

  style.textContent +=
    '#lusion-language-switcher{position:absolute;top:var(--base-padding-y);right:calc(var(--base-padding-x) + 7.8em);z-index:56;pointer-events:auto;font-size:.875em;color:#fff}#lusion-language-trigger{display:flex;align-items:center;justify-content:center;gap:.65em;box-sizing:border-box;min-width:4.2em;height:3.2em;min-height:44px;padding:0 1em;border:1px solid rgba(255,255,255,.18);border-radius:6.25em;background:var(--color-grey-blue);color:#fff;font-family:inherit;font-size:1em;font-weight:500;line-height:1;text-transform:uppercase;cursor:pointer;transition:opacity .45s,background-color .3s,color .3s}#lusion-language-trigger:after{content:"";width:.36em;height:.36em;margin-top:-.2em;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(45deg);transition:transform .2s,margin .2s}#lusion-language-switcher.is-open #lusion-language-trigger:after{margin-top:0;transform:rotate(315deg)}#lusion-language-trigger:hover{background:#071bdf}#lusion-language-menu{position:absolute;top:calc(100% + .55em + var(--lusion-menu-motion-y,0px));left:0;right:auto;z-index:58;display:flex;flex-direction:column;width:12em;max-width:calc(100vw - var(--base-padding-x)*2);min-width:0;gap:0;padding:.65em .3125em;border-radius:.625em;background:#fff;color:#080808;box-shadow:0 12px 30px rgba(0,0,0,.12);font-size:1.142857em}#lusion-language-menu[hidden]{display:none!important}.lusion-language-choice{display:block;position:relative;width:100%;box-sizing:border-box;min-height:44px;padding:.7em 1.3em;border:0;border-radius:6.25em;background:transparent;color:inherit;font-family:inherit;font-size:1.1em;font-weight:400;line-height:1;text-align:left;text-transform:uppercase;cursor:pointer;transition:background-color .3s,color .3s}.lusion-language-choice:hover{background:rgba(0,0,0,.045)}.lusion-language-choice:after{content:"";position:absolute;top:calc(50% - .2em);right:1.55em;width:.4em;height:.4em;margin:0;border:0;border-radius:50%;background:currentColor;opacity:0;transform:scale(0);transition:opacity .2s,transform .2s}.lusion-language-choice[aria-checked="true"]:after{opacity:1;transform:scale(1)}#lusion-language-trigger:focus-visible,.lusion-language-choice:focus-visible{outline:2px solid #c1ff00;outline-offset:3px}@media(max-width:812px){#lusion-language-switcher{right:calc(var(--base-padding-x) + 8.2em)}#lusion-language-trigger{min-width:3.5em;padding:0 .75em}}html[lang="vi"] body,html[lang="vi"] h1,html[lang="vi"] h2,html[lang="vi"] h3,html[lang="vi"] button,html[lang="vi"] input{font-family:Aeonik,system-ui,sans-serif}html[lang="zh-CN"] body,html[lang="zh-CN"] h1,html[lang="zh-CN"] h2,html[lang="zh-CN"] h3,html[lang="zh-CN"] button,html[lang="zh-CN"] input{font-family:Aeonik,system-ui,"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif}#lusion-language-trigger,#lusion-language-menu .lusion-language-choice,#lusion-mobile-language-controls .lusion-mobile-language-choice{font-family:Aeonik}html[lang="vi"] #lusion-language-trigger,html[lang="vi"] #lusion-language-menu .lusion-language-choice,html[lang="vi"] #lusion-mobile-language-controls .lusion-mobile-language-choice{font-family:Aeonik,system-ui,sans-serif}html[lang="zh-CN"] #lusion-language-trigger,html[lang="zh-CN"] #lusion-language-menu .lusion-language-choice,html[lang="zh-CN"] #lusion-mobile-language-controls .lusion-mobile-language-choice{font-family:Aeonik,system-ui,"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif}';

  style.textContent +=
    '#lusion-mobile-language-controls{display:none;margin-top:.35em;padding:.8em .35em .25em;border-top:1px solid rgba(0,0,0,.14);color:#080808;text-transform:none}#lusion-mobile-language-controls .lusion-mobile-language-label{display:block;margin-bottom:.65em;font-size:.72em;font-weight:500;letter-spacing:.08em;text-transform:uppercase;opacity:.55}#lusion-mobile-language-controls .lusion-mobile-language-options{display:flex;gap:.4em}#lusion-mobile-language-controls .lusion-mobile-language-choice{flex:1;min-height:2.7em;padding:.5em .75em;border:1px solid #e4e6ef;border-radius:999px;background:#fff;color:#080808;font-family:inherit;font-size:.78em;font-weight:500;line-height:1;text-align:center;text-transform:uppercase;cursor:pointer}#lusion-mobile-language-controls .lusion-mobile-language-choice[aria-pressed="true"]{background:#080808;color:#fff;border-color:#080808}@media(max-width:812px){#lusion-language-switcher{display:block!important;right:calc(var(--base-padding-x) + 8.2em)}#lusion-language-menu{position:fixed;top:calc(var(--base-padding-y)*2 + 3*var(--header-size) + var(--lusion-menu-motion-y,0px));left:auto;right:var(--base-padding-x);width:12em;max-width:calc(100vw - var(--base-padding-x)*2);max-height:calc(100vh - var(--base-padding-y)*3 - var(--header-size));overflow-y:auto}#lusion-mobile-language-controls{display:none!important}}';
  const normalizeLanguageText = (value) => value.replace(/\s+/g, " ").trim();
  const translatedTextNodes = new WeakMap();
  const ignoredContentSelector = "script,style,noscript,svg,[data-lusion-no-translate]";
  const translateTextNode = (node) => {
    if (activeLanguage === "en" || !node.nodeValue.trim()) return;
    const parent = node.parentElement;
    if (!parent || parent.closest(ignoredContentSelector)) return;
    const raw = node.nodeValue;
    if (translatedTextNodes.get(node) === raw) return;
    const leading = (raw.match(/^\s*/) || [""])[0];
    const trailing = (raw.match(/\s*$/) || [""])[0];
    const end = Math.max(leading.length, raw.length - trailing.length);
    const key = normalizeLanguageText(raw.slice(leading.length, end));
    const translated = languagePack[activeLanguage]?.[key];
    if (typeof translated !== "string") return;
    const localized = leading + translated + trailing;
    translatedTextNodes.set(node, localized);
    if (translated !== key) node.nodeValue = localized;
  };
  const translatedAttributes = ["aria-label", "placeholder", "title", "alt", "value"];
  const localizeAttribute = (element, name) => {
    if (activeLanguage === "en" || !element.hasAttribute(name)) return;
    if (name === "value" && !/^(INPUT|BUTTON|OPTION)$/.test(element.tagName)) return;
    const raw = element.getAttribute(name);
    const translated = languagePack[activeLanguage]?.[normalizeLanguageText(raw)];
    if (typeof translated === "string" && translated !== raw)
      element.setAttribute(name, translated);
  };
  const translateElementAttributes = (element) => {
    if (element.closest(ignoredContentSelector)) return;
    translatedAttributes.forEach((name) => localizeAttribute(element, name));
    if (element.tagName === "META") {
      const metaName = (element.getAttribute("name") || "").toLowerCase();
      const property = (element.getAttribute("property") || "").toLowerCase();
      if (
        metaName === "description" ||
        metaName === "twitter:title" ||
        metaName === "twitter:description" ||
        property === "og:description" ||
        property === "og:title" ||
        property === "og:site_name"
      ) {
        localizeAttribute(element, "content");
      }
    }
  };
  const translateTree = (root) => {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root);
    if (
      root.nodeType !== Node.ELEMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    )
      return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node);
      else translateTextNode(node);
    }
  };
  const translateCompositeHero = (root) => {
    if (activeLanguage === "en" || !root) return;
    const element = root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement;
    const hero = element?.closest("#home-hero-title") || element?.querySelector("#home-hero-title");
    if (!hero) return;
    const words = [...hero.querySelectorAll(".word")];
    const current = words.length
      ? words
          .map((word) => word.textContent.trim())
          .filter(Boolean)
          .join(" ")
      : hero.textContent;
    const key = normalizeLanguageText(current);
    const translated = languagePack[activeLanguage]?.[key];
    if (typeof translated !== "string" || normalizeLanguageText(translated) === key) return;
    if (normalizeLanguageText(current) === normalizeLanguageText(translated)) return;
    hero.textContent = translated;
  };

  const languageObserver = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") translateElementAttributes(record.target);
      else if (record.type === "characterData") {
        translateTextNode(record.target);
        translateCompositeHero(record.target);
      } else {
        record.addedNodes.forEach(translateTree);
        translateCompositeHero(record.target);
      }
    }
  });
  languageObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-label", "placeholder", "title", "alt", "value", "content"],
    characterData: true,
  });
  translateTree(document.documentElement);

  const languageOptions = [
    { code: "en", label: "EN", name: "English", htmlLang: "en" },
    { code: "vi", label: "VI", name: "Ti\u1ebfng Vi\u1ec7t", htmlLang: "vi" },
    { code: "zh-CN", label: "\u4e2d\u6587", name: "\u7b80\u4f53\u4e2d\u6587", htmlLang: "zh-CN" },
  ];
  const chooseLanguage = (code) => {
    if (code === activeLanguage) return;
    try {
      window.localStorage.setItem(languageKey, code);
    } catch {
      // Keep the language switcher usable when browser storage is unavailable.
    }
    window.location.reload();
  };
  function mountLanguageSwitcher() {
    const header = document.getElementById("header");
    if (!header) return;
    if (!document.getElementById("lusion-language-switcher")) {
      const root = document.createElement("div");
      root.id = "lusion-language-switcher";
      root.dataset.lusionNoTranslate = "true";
      const trigger = document.createElement("button");
      trigger.id = "lusion-language-trigger";
      trigger.type = "button";
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-controls", "lusion-language-menu");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute(
        "aria-label",
        languagePack[activeLanguage]?.["Select language"] || "Select language",
      );
      trigger.textContent = languageOptions.find((option) => option.code === activeLanguage).label;
      trigger.style.visibility = "hidden";
      trigger.style.opacity = "0";
      const menu = document.createElement("div");
      menu.id = "lusion-language-menu";
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", languagePack[activeLanguage]?.Language || "Language");
      menu.hidden = true;
      for (const option of languageOptions) {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "lusion-language-choice";
        choice.dataset.locale = option.code;
        choice.lang = option.htmlLang;
        choice.setAttribute("role", "menuitemradio");
        choice.setAttribute("aria-checked", String(option.code === activeLanguage));
        choice.textContent = option.name;
        choice.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (option.code === activeLanguage) closeLanguageMenu();
          else chooseLanguage(option.code);
        });
        menu.appendChild(choice);
      }
      root.append(trigger, menu);
      header.appendChild(root);
      const syncMenuButton = (menuButton) => {
        const headerContainer = document.getElementById("header-container");
        let lastMenuTransform = "";
        let initialFrameReady = false;
        const syncMenuMotion = () => {
          const menuStyle = getComputedStyle(menuButton);
          const transform = menuStyle.transform;
          if (transform !== lastMenuTransform) {
            const motionMatrix = transform === "none" ? null : new DOMMatrixReadOnly(transform);
            const motionY = motionMatrix ? motionMatrix.m42 : 0;
            trigger.style.transform = transform;
            root.style.setProperty("--lusion-menu-motion-y", `${motionY}px`);
            lastMenuTransform = transform;
          }
          const headerBounds = header.getBoundingClientRect();
          const menuBounds = menuButton.getBoundingClientRect();
          const spacing = activeLanguage === "vi" ? 36 : 24;
          root.style.right = Math.max(0, headerBounds.right - menuBounds.left + spacing) + "px";
          const triggerBounds = trigger.getBoundingClientRect();
          const clipBounds = headerContainer?.getBoundingClientRect();
          let clipPath = "none";
          let fullyClipped = triggerBounds.width <= 0 || triggerBounds.height <= 0;
          if (clipBounds && !fullyClipped) {
            const visibleWidth =
              Math.min(triggerBounds.right, clipBounds.right) -
              Math.max(triggerBounds.left, clipBounds.left);
            const visibleHeight =
              Math.min(triggerBounds.bottom, clipBounds.bottom) -
              Math.max(triggerBounds.top, clipBounds.top);
            fullyClipped = visibleWidth <= 0 || visibleHeight <= 0;
            if (fullyClipped) {
              clipPath = "inset(50%)";
            } else {
              const toPercent = (value, size) =>
                `${Math.min(100, Math.max(0, (value / size) * 100))}%`;
              const top = toPercent(clipBounds.top - triggerBounds.top, triggerBounds.height);
              const right = toPercent(triggerBounds.right - clipBounds.right, triggerBounds.width);
              const bottom = toPercent(
                triggerBounds.bottom - clipBounds.bottom,
                triggerBounds.height,
              );
              const left = toPercent(clipBounds.left - triggerBounds.left, triggerBounds.width);
              clipPath = `inset(${top} ${right} ${bottom} ${left})`;
            }
          }
          trigger.style.clipPath = clipPath;
          let menuVisible = !fullyClipped;
          let menuOpacity = 1;
          for (
            let element = menuButton;
            element && header.contains(element);
            element = element.parentElement
          ) {
            const elementStyle = getComputedStyle(element);
            if (
              elementStyle.display === "none" ||
              elementStyle.visibility === "hidden" ||
              elementStyle.visibility === "collapse"
            ) {
              menuVisible = false;
            }
            menuOpacity *= Number(elementStyle.opacity);
            if (element === header) break;
          }
          if (!initialFrameReady || !menuVisible) {
            trigger.style.visibility = "hidden";
            trigger.style.opacity = "0";
          } else {
            trigger.style.visibility = "visible";
            trigger.style.opacity = String(menuOpacity);
          }
        };
        const menuMotionObserver = new MutationObserver(syncMenuMotion);
        for (
          let element = menuButton;
          element && header.contains(element);
          element = element.parentElement
        ) {
          menuMotionObserver.observe(element, {
            attributes: true,
            attributeFilter: ["style", "class"],
          });
          if (element === header) break;
        }
        window.addEventListener("resize", syncMenuMotion, { passive: true });
        header.addEventListener("transitionend", syncMenuMotion, true);
        header.addEventListener("animationend", syncMenuMotion, true);
        if ("ResizeObserver" in window) {
          const menuSizeObserver = new ResizeObserver(syncMenuMotion);
          menuSizeObserver.observe(menuButton);
        }
        if (document.fonts?.ready) document.fonts.ready.then(syncMenuMotion);
        syncMenuMotion();
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            initialFrameReady = true;
            syncMenuMotion();
          }),
        );
      };
      const menuButton = document.getElementById("header-right-menu-btn");
      if (menuButton) {
        syncMenuButton(menuButton);
      } else {
        const menuButtonObserver = new MutationObserver(() => {
          const delayedMenuButton = document.getElementById("header-right-menu-btn");
          if (!delayedMenuButton) return;
          menuButtonObserver.disconnect();
          syncMenuButton(delayedMenuButton);
        });
        menuButtonObserver.observe(header, { childList: true, subtree: true });
      }

      const openLanguageMenu = (focusSelected = false) => {
        root.classList.add("is-open");
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        if (focusSelected) menu.querySelector('[aria-checked="true"]')?.focus();
      };
      function closeLanguageMenu(returnFocus = false) {
        root.classList.remove("is-open");
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        if (returnFocus) trigger.focus();
      }
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (menu.hidden) openLanguageMenu();
        else closeLanguageMenu();
      });
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          openLanguageMenu(true);
        }
      });
      menu.addEventListener("keydown", (event) => {
        const choices = Array.from(menu.querySelectorAll("button"));
        const index = choices.indexOf(document.activeElement);
        if (event.key === "Escape") {
          event.preventDefault();
          closeLanguageMenu(true);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const delta = event.key === "ArrowDown" ? 1 : -1;
          choices[(index + delta + choices.length) % choices.length].focus();
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          choices[event.key === "Home" ? 0 : choices.length - 1].focus();
        }
      });
      document.addEventListener("click", (event) => {
        if (!root.contains(event.target)) closeLanguageMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !menu.hidden) closeLanguageMenu(true);
      });
    }
    mountMobileLanguageSwitcher();
  }
  function mountMobileLanguageSwitcher() {
    const menuLinks = document.getElementById("header-menu-links");
    if (!menuLinks || document.getElementById("lusion-mobile-language-controls")) return;
    const group = document.createElement("div");
    group.id = "lusion-mobile-language-controls";
    group.dataset.lusionNoTranslate = "true";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", languagePack[activeLanguage]?.Language || "Language");
    const label = document.createElement("span");
    label.className = "lusion-mobile-language-label";
    label.textContent = languagePack[activeLanguage]?.Language || "Language";
    const choices = document.createElement("div");
    choices.className = "lusion-mobile-language-options";
    for (const option of languageOptions) {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = "lusion-mobile-language-choice";
      choice.dataset.locale = option.code;
      choice.lang = option.htmlLang;
      choice.setAttribute("aria-label", option.name);
      choice.setAttribute("aria-pressed", String(option.code === activeLanguage));
      choice.textContent = option.label;
      choice.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        chooseLanguage(option.code);
      });
      choices.appendChild(choice);
    }
    group.append(label, choices);
    menuLinks.appendChild(group);
  }
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      translateTree(document.documentElement);
      mountLanguageSwitcher();
    },
    { once: true },
  );
})();
