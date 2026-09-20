const TEMPLATE_INDEX_URL = "/resources/templates/index.json";
const PALETTE_INDEX_URL = "/resources/palettes/index.json";
const REQUEST_STORAGE_KEY = "presentlab.slide-requests";
const PAGE_SIZE = 24;
const MAX_SELECTIONS = 3;
const MAX_ATTACHMENT_FILES = 10;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const LOCAL_REQUEST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const FALLBACK_TEMPLATES = [
  {
    name: "aurora",
    title: "Aurora template",
    description:
      "Light editorial system with spacious cards, indigo accents, and calm narrative pacing.",
    family: "aurora",
    baseFamily: "aurora",
    palette: "base",
    modifier: "base",
    path: "aurora/deck.html",
  },
  {
    name: "midnight",
    title: "Midnight template",
    description:
      "Dark cinematic system with luminous cyan highlights and contrast-led storytelling.",
    family: "midnight",
    baseFamily: "midnight",
    palette: "cinematic",
    modifier: "base",
    path: "midnight/deck.html",
  },
  {
    name: "swiss",
    title: "Swiss template",
    description:
      "Swiss-inspired grid with hard edges, red signal color, and disciplined hierarchy.",
    family: "swiss",
    baseFamily: "swiss",
    palette: "base",
    modifier: "base",
    path: "swiss/deck.html",
  },
  {
    name: "brutalist",
    title: "Brutalist template",
    description: "Neo-brutalist system with bold borders, offset shadows, and playful emphasis.",
    family: "brutalist",
    baseFamily: "brutalist",
    palette: "base",
    modifier: "base",
    path: "brutalist/deck.html",
  },
  {
    name: "organic",
    title: "Organic template",
    description: "Warm studio system with earthy colors, serif headlines, and soft geometry.",
    family: "organic",
    baseFamily: "organic",
    palette: "base",
    modifier: "base",
    path: "organic/deck.html",
  },
  {
    name: "datanoir",
    title: "Data Noir template",
    description:
      "Terminal-inspired dark system for product, engineering, and operational narratives.",
    family: "datanoir",
    baseFamily: "datanoir",
    palette: "base",
    modifier: "base",
    path: "datanoir/deck.html",
  },
  {
    name: "luxury",
    title: "Luxury template",
    description: "Quiet luxury system with ivory paper, hairline rules, and restrained gold.",
    family: "luxury",
    baseFamily: "luxury",
    palette: "base",
    modifier: "base",
    path: "luxury/deck.html",
  },
  {
    name: "retrofuture",
    title: "Retro Future template",
    description: "Neon retro-future system with luminous grids and energetic pacing.",
    family: "retrofuture",
    baseFamily: "retrofuture",
    palette: "base",
    modifier: "base",
    path: "retrofuture/deck.html",
  },
];

const FALLBACK_PALETTES = [
  {
    name: "cinematic",
    title: "Cinematic",
    tokens: {
      paper: "#0b1020",
      ink: "#edf4ff",
      muted: "#9aaac2",
      accent: "#55e0d0",
      accentDeep: "#1e9994",
      accentSoft: "#183d4a",
      artOne: "#173d70",
      artTwo: "#d86d49",
    },
  },
  {
    name: "cobalt",
    title: "Cobalt",
    tokens: {
      paper: "#f4f7ff",
      ink: "#14213d",
      muted: "#5c6a83",
      accent: "#315efb",
      accentDeep: "#2340b4",
      accentSoft: "#dbe5ff",
      artOne: "#b5c6ff",
      artTwo: "#ffb29c",
    },
  },
  {
    name: "coral",
    title: "Coral",
    tokens: {
      paper: "#fff7f4",
      ink: "#321c24",
      muted: "#80656d",
      accent: "#ed5d52",
      accentDeep: "#b73a34",
      accentSoft: "#ffd7d1",
      artOne: "#ffc2b8",
      artTwo: "#f5b45f",
    },
  },
  {
    name: "forest",
    title: "Forest",
    tokens: {
      paper: "#f4faf4",
      ink: "#16372c",
      muted: "#627b6b",
      accent: "#1f8a62",
      accentDeep: "#146044",
      accentSoft: "#ccebdc",
      artOne: "#9cdbb7",
      artTwo: "#e7ad5c",
    },
  },
  {
    name: "saffron",
    title: "Saffron",
    tokens: {
      paper: "#fff9e8",
      ink: "#3b2a14",
      muted: "#806d4e",
      accent: "#e3a316",
      accentDeep: "#9d6b05",
      accentSoft: "#f9e5a8",
      artOne: "#f7cf68",
      artTwo: "#e57b52",
    },
  },
  {
    name: "plum",
    title: "Plum",
    tokens: {
      paper: "#fbf4ff",
      ink: "#311a3f",
      muted: "#786481",
      accent: "#9c4fd4",
      accentDeep: "#6e2ca2",
      accentSoft: "#ead4f7",
      artOne: "#d1a7ec",
      artTwo: "#f2a4a1",
    },
  },
  {
    name: "ocean",
    title: "Ocean",
    tokens: {
      paper: "#f1f9fb",
      ink: "#12323d",
      muted: "#5b7680",
      accent: "#0f9ec7",
      accentDeep: "#0a6e8b",
      accentSoft: "#c8ebf3",
      artOne: "#8bd3e5",
      artTwo: "#f1ae67",
    },
  },
  {
    name: "mono",
    title: "Mono",
    tokens: {
      paper: "#f5f5f4",
      ink: "#222222",
      muted: "#707070",
      accent: "#2f3437",
      accentDeep: "#111111",
      accentSoft: "#ddddda",
      artOne: "#b7b7b3",
      artTwo: "#e97759",
    },
  },
  {
    name: "mint",
    title: "Mint",
    tokens: {
      paper: "#f1fbf6",
      ink: "#143a32",
      muted: "#5b7d70",
      accent: "#2eae83",
      accentDeep: "#1b7c5e",
      accentSoft: "#c8efdf",
      artOne: "#9adfc5",
      artTwo: "#f1b35c",
    },
  },
  {
    name: "copper",
    title: "Copper",
    tokens: {
      paper: "#fff8f1",
      ink: "#3a251e",
      muted: "#806b60",
      accent: "#c66b3d",
      accentDeep: "#914622",
      accentSoft: "#f2d1bd",
      artOne: "#e5a37a",
      artTwo: "#525f8d",
    },
  },
  {
    name: "sand",
    title: "Sand",
    tokens: {
      paper: "#fbf7ee",
      ink: "#3c3328",
      muted: "#817467",
      accent: "#bd7a41",
      accentDeep: "#8d522a",
      accentSoft: "#efdcc4",
      artOne: "#dfb17f",
      artTwo: "#7c9d8b",
    },
  },
  {
    name: "violet",
    title: "Violet",
    tokens: {
      paper: "#f7f4ff",
      ink: "#282044",
      muted: "#706987",
      accent: "#7657df",
      accentDeep: "#5030af",
      accentSoft: "#ddd5fb",
      artOne: "#b7a5f0",
      artTwo: "#eb8d9c",
    },
  },
  {
    name: "ice",
    title: "Ice",
    tokens: {
      paper: "#f2f8ff",
      ink: "#172e48",
      muted: "#62758a",
      accent: "#4f91d1",
      accentDeep: "#31689f",
      accentSoft: "#d4e7f8",
      artOne: "#a6cbe9",
      artTwo: "#f1b274",
    },
  },
];

const FAMILY_TOKENS = {
  aurora: {
    paper: "#f7f8fc",
    ink: "#172033",
    muted: "#647086",
    accent: "#5b6cf2",
    accentSoft: "#dfe4ff",
    artOne: "#aab8ff",
    artTwo: "#ffb18e",
  },
  midnight: {
    paper: "#0b1020",
    ink: "#edf4ff",
    muted: "#9aaac2",
    accent: "#55e0d0",
    accentSoft: "#183d4a",
    artOne: "#173d70",
    artTwo: "#d86d49",
  },
  swiss: {
    paper: "#f7f7f5",
    ink: "#202020",
    muted: "#6f6f6b",
    accent: "#e04b40",
    accentSoft: "#ece5dc",
    artOne: "#e04b40",
    artTwo: "#e3a316",
  },
  brutalist: {
    paper: "#f8dc4f",
    ink: "#251f18",
    muted: "#5e4f32",
    accent: "#e44d3d",
    accentSoft: "#f8ed9b",
    artOne: "#f1f2e8",
    artTwo: "#e44d3d",
  },
  organic: {
    paper: "#f5efe3",
    ink: "#302c26",
    muted: "#766c5b",
    accent: "#9a6250",
    accentSoft: "#e3d4b9",
    artOne: "#bf9871",
    artTwo: "#7c9d7e",
  },
  datanoir: {
    paper: "#11171b",
    ink: "#e5f1ee",
    muted: "#8ca49f",
    accent: "#77f4c9",
    accentSoft: "#1b403b",
    artOne: "#2b8f76",
    artTwo: "#e49a55",
  },
  luxury: {
    paper: "#f5f0e7",
    ink: "#27211d",
    muted: "#766a5e",
    accent: "#b48a45",
    accentSoft: "#e3d3b4",
    artOne: "#d7bf91",
    artTwo: "#72777a",
  },
  retrofuture: {
    paper: "#17102b",
    ink: "#f8f0ff",
    muted: "#b3a1cc",
    accent: "#f3a7ff",
    accentSoft: "#352052",
    artOne: "#50d5ff",
    artTwo: "#ff718c",
  },
};

const state = {
  templates: FALLBACK_TEMPLATES,
  palettes: new Map(FALLBACK_PALETTES.map((palette) => [palette.name, palette])),
  query: "",
  family: "all",
  category: "all",
  palette: "all",
  sort: "featured",
  visibleCount: PAGE_SIZE,
  selected: new Map(),
  lastRequest: null,
  previewRequestId: 0,
  toastTimer: null,
};

const elements = {
  grid: document.querySelector("[data-template-grid]"),
  resultsCount: document.querySelector("[data-results-count]"),
  selectionSummary: document.querySelector("[data-selection-summary]"),
  selectionCounts: document.querySelectorAll("[data-selection-count]"),
  selectionTray: document.querySelector("[data-selection-tray]"),
  traySelections: document.querySelector("[data-tray-selections]"),
  drawerSelections: document.querySelector("[data-drawer-selections]"),
  drawer: document.querySelector("[data-request-drawer]"),
  overlay: document.querySelector("[data-overlay]"),
  formView: document.querySelector("[data-form-view]"),
  successView: document.querySelector("[data-success-view]"),
  successTitle: document.querySelector("[data-success-title]"),
  successCopy: document.querySelector("[data-success-copy]"),
  successId: document.querySelector("[data-success-id]"),
  successFootnote: document.querySelector("[data-success-footnote]"),
  fileList: document.querySelector("[data-file-list]"),
  previewModal: document.querySelector("[data-preview-modal]"),
  previewViewport: document.querySelector("[data-preview-viewport]"),
  previewFrame: document.querySelector("[data-preview-frame]"),
  previewTitle: document.querySelector("[data-preview-title]"),
  openTemplate: document.querySelector("[data-open-template]"),
  emptyState: document.querySelector("[data-empty-state]"),
  loadMore: document.querySelector("[data-load-more]"),
  loadMoreCount: document.querySelector("[data-load-more-count]"),
  sourceStatus: document.querySelector("[data-source-status]"),
  toast: document.querySelector("[data-toast]"),
  menu: document.querySelector(".topnav"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slug(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanize(value) {
  return String(value ?? "")
    .replaceAll("-", " ")
    .replaceAll("/", " / ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function templateName(template) {
  const title = template.title || template.name;
  return title.replace(/\s+template$/i, "");
}

function templateCategory(template) {
  return template.styleCategory || "Core systems";
}

function templatePalette(template) {
  return template.palette && template.palette !== "base"
    ? template.palette
    : template.stylePalette || "base";
}

function templateFamily(template) {
  return template.baseFamily || template.family || "aurora";
}

function paletteTitle(name) {
  return state.palettes.get(name)?.title || (name === "base" ? "Base system" : humanize(name));
}

function themeFor(template) {
  const familyTheme = FAMILY_TOKENS[templateFamily(template)] || FAMILY_TOKENS.aurora;
  const paletteTheme = state.palettes.get(templatePalette(template))?.tokens;
  return { ...familyTheme, ...(paletteTheme || {}) };
}

function previewMarkup(template, theme) {
  const familyClass = `family-${slug(templateFamily(template))}`;
  const safeTitle = escapeHtml(templateName(template).replace(/\s+\/\s+.*/, ""));
  const category = escapeHtml(template.styleCategory || humanize(templateFamily(template)));
  return `<div class="template-visual ${familyClass}" style="--preview-paper:${escapeHtml(theme.paper)};--preview-ink:${escapeHtml(theme.ink)};--preview-muted:${escapeHtml(theme.muted)};--preview-accent:${escapeHtml(theme.accent)};--preview-art:${escapeHtml(theme.artOne)};--preview-soft:${escapeHtml(theme.accentSoft)}">
    <div class="visual-top"><span>PL / 01</span><span>${escapeHtml(paletteTitle(templatePalette(template)))}</span></div>
    <div class="visual-shape"></div>
    <div class="visual-copy"><span class="visual-kicker">${category}</span><strong class="visual-title">${safeTitle}</strong><span class="visual-lines"></span></div>
    <div class="visual-footer"><span>${escapeHtml(template.modifier || "base")}</span><span>16:9</span></div>
  </div>`;
}

function previewDocument(template) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/web/portal/styles.css" />
    <style>
      html, body { margin: 0; padding: 0; overflow: hidden; background: #030a12; }
      body { width: 1600px; height: 900px; }
      .template-visual { width: 1600px; height: 900px; aspect-ratio: auto; border: 0; }
    </style>
  </head>
  <body>${previewMarkup(template, themeFor(template))}</body>
</html>`;
}

function cardMarkup(template) {
  const theme = themeFor(template);
  const selected = state.selected.has(template.name);
  const category = template.styleCategory || humanize(templateFamily(template));
  const treatment = template.styleTreatment || template.modifier || "base";
  return `<article class="template-card${selected ? " is-selected" : ""}" data-template-card="${escapeHtml(template.name)}">
    <span class="card-check" aria-hidden="true">✓</span>
    ${previewMarkup(template, theme)}
    <div class="card-content">
      <div class="card-kicker"><span>${escapeHtml(category)}</span><span>${escapeHtml(paletteTitle(templatePalette(template)))}</span></div>
      <h3 title="${escapeHtml(templateName(template))}">${escapeHtml(templateName(template))}</h3>
      <p>${escapeHtml(template.description || "Một hệ thống hình ảnh sẵn sàng để đội ngũ tùy chỉnh theo brief.")}</p>
      <div class="card-actions">
        <button class="card-action card-action-primary" type="button" data-select-template="${escapeHtml(template.name)}">${selected ? "Đã chọn ✓" : "Chọn mẫu"}</button>
        <button class="card-action" type="button" data-preview-template="${escapeHtml(template.name)}">Xem mẫu</button>
      </div>
      <span class="sr-only">${escapeHtml(humanize(treatment))}</span>
    </div>
  </article>`;
}

function filteredTemplates() {
  const query = state.query.trim().toLowerCase();
  const results = state.templates.filter((template) => {
    const haystack = [
      template.name,
      template.title,
      template.description,
      template.family,
      template.baseFamily,
      template.styleCategory,
      template.styleTreatment,
      templatePalette(template),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFamily = state.family === "all" || templateFamily(template) === state.family;
    const matchesCategory =
      state.category === "all" || templateCategory(template) === state.category;
    const matchesPalette = state.palette === "all" || templatePalette(template) === state.palette;
    return matchesQuery && matchesFamily && matchesCategory && matchesPalette;
  });

  if (state.sort === "name") {
    return results.sort((left, right) =>
      templateName(left).localeCompare(templateName(right), "vi"),
    );
  }
  if (state.sort === "style") {
    return results.sort((left, right) =>
      templateCategory(left).localeCompare(templateCategory(right), "vi"),
    );
  }
  return results;
}

function renderTemplates() {
  const results = filteredTemplates();
  const visible = results.slice(0, state.visibleCount);
  elements.grid.innerHTML = visible.map(cardMarkup).join("");
  elements.emptyState.hidden = results.length !== 0;
  elements.grid.hidden = results.length === 0;
  elements.resultsCount.textContent = `${results.length} mẫu`;
  elements.loadMore.hidden = visible.length >= results.length || results.length === 0;
  elements.loadMoreCount.textContent =
    results.length > visible.length ? `(${results.length - visible.length} còn lại)` : "";
  renderActiveFilters();
  elements.grid.querySelectorAll("[data-select-template]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(button.dataset.selectTemplate));
  });
  elements.grid.querySelectorAll("[data-preview-template]").forEach((button) => {
    button.addEventListener("click", () => openPreview(button.dataset.previewTemplate));
  });
}

function renderActiveFilters() {
  const filters = [];
  if (state.query) filters.push({ key: "query", label: `Từ khóa: ${state.query}` });
  if (state.family !== "all") filters.push({ key: "family", label: humanize(state.family) });
  if (state.category !== "all") filters.push({ key: "category", label: state.category });
  if (state.palette !== "all") filters.push({ key: "palette", label: paletteTitle(state.palette) });
  const container = document.querySelector("[data-active-filters]");
  container.hidden = filters.length === 0;
  container.innerHTML = filters
    .map(
      (filter) =>
        `<span class="filter-chip">${escapeHtml(filter.label)} <button type="button" aria-label="Xóa bộ lọc ${escapeHtml(filter.label)}" data-remove-filter="${filter.key}">×</button></span>`,
    )
    .join("");
  container.querySelectorAll("[data-remove-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.removeFilter;
      if (key === "query") {
        state.query = "";
        document.querySelector("[data-search]").value = "";
      } else {
        state[key] = "all";
        const field = document.querySelector(`[data-${key}-filter]`);
        if (field) field.value = "all";
      }
      state.visibleCount = PAGE_SIZE;
      renderTemplates();
    });
  });
}

function renderFilterOptions() {
  const familySelect = document.querySelector("[data-family-filter]");
  const categorySelect = document.querySelector("[data-category-filter]");
  const paletteSelect = document.querySelector("[data-palette-filter]");
  const families = [...new Set(state.templates.map(templateFamily))].sort((left, right) =>
    left.localeCompare(right, "vi"),
  );
  const categories = [...new Set(state.templates.map(templateCategory))].sort((left, right) =>
    left.localeCompare(right, "vi"),
  );
  const palettes = [...new Set(state.templates.map(templatePalette))].sort((left, right) =>
    paletteTitle(left).localeCompare(paletteTitle(right), "vi"),
  );
  familySelect.innerHTML = `<option value="all">Tất cả hệ thống</option>${families.map((family) => `<option value="${escapeHtml(family)}">${escapeHtml(humanize(family))}</option>`).join("")}`;
  categorySelect.innerHTML = `<option value="all">Tất cả phong cách</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  paletteSelect.innerHTML = `<option value="all">Tất cả bảng màu</option>${palettes.map((palette) => `<option value="${escapeHtml(palette)}">${escapeHtml(paletteTitle(palette))}</option>`).join("")}`;
}

function updateSelectionUi() {
  const selected = [...state.selected.values()];
  elements.selectionCounts.forEach((element) => {
    element.textContent = String(selected.length);
  });
  elements.selectionSummary.textContent = ` · ${selected.length} mẫu đang chọn`;
  elements.selectionTray.hidden = selected.length === 0;
  elements.traySelections.innerHTML = selected
    .map(
      (template) =>
        `<div class="tray-chip"><span>${escapeHtml(templateName(template))}</span><button type="button" aria-label="Bỏ chọn ${escapeHtml(templateName(template))}" data-remove-selected="${escapeHtml(template.name)}">×</button></div>`,
    )
    .join("");
  elements.traySelections.querySelectorAll("[data-remove-selected]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(button.dataset.removeSelected));
  });
  elements.drawerSelections.innerHTML = selected
    .map(
      (template, index) =>
        `<div class="selected-template"><span class="selected-template-index">0${index + 1}</span><span title="${escapeHtml(templateName(template))}">${escapeHtml(templateName(template))}</span><button type="button" aria-label="Bỏ chọn ${escapeHtml(templateName(template))}" data-remove-selected="${escapeHtml(template.name)}">×</button></div>`,
    )
    .join("");
  elements.drawerSelections.querySelectorAll("[data-remove-selected]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(button.dataset.removeSelected));
  });
}

function toggleSelection(name) {
  const template = state.templates.find((candidate) => candidate.name === name);
  if (!template) return;
  if (state.selected.has(name)) {
    state.selected.delete(name);
  } else if (state.selected.size >= MAX_SELECTIONS) {
    showToast("Bạn có thể chọn tối đa 3 mẫu cho một brief.");
    return;
  } else {
    state.selected.set(name, template);
  }
  updateSelectionUi();
  renderTemplates();
}

function openDrawer() {
  if (state.selected.size === 0) {
    showToast("Hãy chọn ít nhất một mẫu trước khi gửi brief.");
    document.querySelector("#templates").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  elements.drawer.classList.add("is-open");
  elements.drawer.setAttribute("aria-hidden", "false");
  elements.drawer.removeAttribute("inert");
  elements.overlay.hidden = false;
  document.body.classList.add("drawer-open");
  setTimeout(() => elements.drawer.querySelector("input")?.focus(), 80);
}

function closeDrawer() {
  elements.drawer.classList.remove("is-open");
  elements.drawer.setAttribute("aria-hidden", "true");
  elements.drawer.setAttribute("inert", "");
  elements.overlay.hidden = true;
  document.body.classList.remove("drawer-open");
}

async function templateIsAvailable(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: "HEAD", signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function openPreview(name) {
  const template = state.templates.find((candidate) => candidate.name === name);
  if (!template) return;
  const previewRequestId = ++state.previewRequestId;
  const templatePath = template.path.startsWith("templates/")
    ? template.path
    : `templates/${template.path}`;
  const templateUrl = new URL(`/${templatePath}`, window.location.origin).href;
  elements.previewTitle.textContent = templateName(template);
  elements.openTemplate.hidden = true;
  elements.openTemplate.removeAttribute("href");
  elements.previewFrame.removeAttribute("src");
  elements.previewFrame.srcdoc = previewDocument(template);
  elements.previewModal.hidden = false;
  elements.overlay.hidden = false;
  requestAnimationFrame(scalePreviewFrame);

  if (!(await templateIsAvailable(templateUrl)) || previewRequestId !== state.previewRequestId)
    return;
  elements.openTemplate.hidden = false;
  elements.openTemplate.href = templateUrl;
  elements.previewFrame.srcdoc = "";
  elements.previewFrame.src = templateUrl;
  requestAnimationFrame(scalePreviewFrame);
}

function closePreview() {
  state.previewRequestId += 1;
  elements.previewModal.hidden = true;
  elements.openTemplate.hidden = false;
  elements.openTemplate.removeAttribute("href");
  elements.previewFrame.srcdoc = "";
  elements.previewFrame.src = "about:blank";
  if (!elements.drawer.classList.contains("is-open")) elements.overlay.hidden = true;
}

function scalePreviewFrame() {
  if (elements.previewModal.hidden) return;
  const availableWidth = Math.max(elements.previewViewport.clientWidth - 8, 260);
  const scale = Math.min(availableWidth / 1600, 1);
  elements.previewFrame.style.transform = `scale(${scale})`;
  elements.previewViewport.style.height = `${Math.max(220, 900 * scale + 8)}px`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 3600);
}

function localDateValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function requestId() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PL-${datePart}-${randomPart}`;
}

function attachmentFiles(form) {
  const input = form.querySelector("[data-attachments]");
  return [...(input?.files || [])];
}

function attachmentValidationError(form) {
  const files = attachmentFiles(form);
  if (files.length > MAX_ATTACHMENT_FILES) {
    return `Bạn chỉ có thể đính kèm tối đa ${MAX_ATTACHMENT_FILES} tệp.`;
  }
  const oversizedFile = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
  if (oversizedFile) {
    return `${oversizedFile.name} vượt quá giới hạn 3 MB mỗi tệp.`;
  }
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    return "Tổng dung lượng tài liệu không được vượt quá 4 MB khi gửi qua Vercel.";
  }
  return "";
}

function formPayload(form) {
  const data = new FormData(form);
  return {
    id: requestId(),
    createdAt: new Date().toISOString(),
    status: "new",
    source: "presentlab-client-request-portal",
    customer: {
      name: String(data.get("contactName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
    },
    project: {
      name: String(data.get("projectName") || "").trim(),
      slideCount: Number(data.get("slideCount") || 0),
      deadline: String(data.get("deadline") || ""),
      service: String(data.get("service") || ""),
      notes: String(data.get("notes") || "").trim(),
    },
    templates: [...state.selected.values()].map((template) => ({
      name: template.name,
      title: templateName(template),
      path: template.path,
      family: templateFamily(template),
      palette: templatePalette(template),
      category: templateCategory(template),
      modifier: template.modifier || "base",
    })),
    attachments: attachmentFiles(form)
      .slice(0, MAX_ATTACHMENT_FILES)
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
  };
}

function saveRequestLocally(payload) {
  try {
    const cutoff = Date.now() - LOCAL_REQUEST_TTL_MS;
    const parsed = JSON.parse(localStorage.getItem(REQUEST_STORAGE_KEY) || "[]");
    const previous = Array.isArray(parsed)
      ? parsed.filter(
          (request) =>
            request &&
            typeof request.createdAt === "string" &&
            Number.isFinite(Date.parse(request.createdAt)) &&
            Date.parse(request.createdAt) >= cutoff,
        )
      : [];
    previous.push(payload);
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(previous));
    return true;
  } catch (error) {
    console.warn("Unable to save PresentLab request locally:", error);
    return false;
  }
}

function downloadRequest(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${payload.id.toLowerCase()}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function mailtoUrl(email, payload) {
  const subject = encodeURIComponent(
    `[PresentLab] ${payload.project.name || "Yêu cầu gia công slide"} — ${payload.id}`,
  );
  const body = encodeURIComponent(
    [
      `Mã yêu cầu: ${payload.id}`,
      `Dự án: ${payload.project.name}`,
      `Người liên hệ: ${payload.customer.name}`,
      `Email: ${payload.customer.email}`,
      `Số slide: ${payload.project.slideCount}`,
      `Deadline: ${payload.project.deadline || "Chưa chốt"}`,
      `Dịch vụ: ${payload.project.service}`,
      `Mẫu đã chọn: ${payload.templates.map((template) => template.title).join(", ")}`,
      "",
      payload.project.notes || "Không có ghi chú thêm.",
    ].join("\n"),
  );
  return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
}

async function postRequest(endpoint, payload, files) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const hasFiles = files.length > 0;
  let body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  if (hasFiles) {
    const multipart = new FormData();
    multipart.append("request", JSON.stringify(payload));
    files.forEach((file) => multipart.append("attachments", file, file.name));
    body = multipart;
    delete headers["Content-Type"];
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request endpoint returned ${response.status}.`);
  } finally {
    clearTimeout(timeout);
  }
}

async function sendRequest(payload, form) {
  const endpoint = document.documentElement.dataset.requestEndpoint?.trim();
  const handoffEmail = document.documentElement.dataset.handoffEmail?.trim();
  if (endpoint) {
    await postRequest(endpoint, payload, attachmentFiles(form));
    return { mode: "endpoint" };
  }
  if (handoffEmail) {
    window.location.href = mailtoUrl(handoffEmail, payload);
    return { mode: "email" };
  }
  saveRequestLocally(payload);
  downloadRequest(payload);
  return { mode: "local" };
}

function showSuccess(payload, result) {
  state.lastRequest = payload;
  elements.formView.hidden = true;
  elements.successView.hidden = false;
  elements.successId.textContent = payload.id;
  if (result.mode === "endpoint") {
    elements.successTitle.textContent = "Đã gửi yêu cầu thành công";
    elements.successCopy.textContent =
      "Brief đã được chuyển tới đội gia công. Chúng tôi sẽ phản hồi qua email của bạn sau khi xem phạm vi công việc.";
    elements.successFootnote.textContent = "Bạn có thể tải lại bản brief để lưu vào hồ sơ dự án.";
  } else if (result.mode === "email") {
    elements.successTitle.textContent = "Đã chuẩn bị email yêu cầu";
    elements.successCopy.textContent =
      "Ứng dụng email của bạn đã được mở với nội dung brief. Hãy bấm Send để hoàn tất việc gửi cho đội gia công.";
    elements.successFootnote.textContent =
      "Nếu cửa sổ email không mở, bạn có thể tải bản brief JSON bên dưới.";
  } else {
    elements.successTitle.textContent = "Đã tạo bản brief thành công";
    elements.successCopy.textContent =
      "Chưa cấu hình endpoint nhận yêu cầu, nên brief đã được lưu trên thiết bị và tải xuống để bạn chuyển cho đội gia công.";
    elements.successFootnote.textContent =
      "Để gửi tự động, cấu hình data-request-endpoint hoặc data-handoff-email trên thẻ html của trang.";
  }
}

function resetRequestView() {
  elements.formView.hidden = false;
  elements.successView.hidden = true;
  document.querySelector("[data-no-selection-hint]").hidden = true;
  document.querySelector("[data-request-form]").reset();
  document.querySelector("[data-file-list]").hidden = true;
  document.querySelector("[data-file-list]").innerHTML = "";
}

function handleFiles(input) {
  const files = [...input.files].slice(0, MAX_ATTACHMENT_FILES);
  elements.fileList.hidden = files.length === 0;
  elements.fileList.innerHTML = files
    .map(
      (file) =>
        `<div class="file-item"><span>${escapeHtml(file.name)}</span><span>${Math.ceil(file.size / 1024)} KB</span></div>`,
    )
    .join("");
}

function bindEvents() {
  document
    .querySelectorAll("[data-open-request]")
    .forEach((button) => button.addEventListener("click", openDrawer));
  document
    .querySelectorAll("[data-close-request]")
    .forEach((button) => button.addEventListener("click", closeDrawer));
  document.querySelector("[data-close-preview]").addEventListener("click", closePreview);
  elements.overlay.addEventListener("click", () => {
    closePreview();
    closeDrawer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePreview();
      closeDrawer();
    }
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
    ) {
      event.preventDefault();
      document.querySelector("[data-search]").focus();
    }
  });
  document.querySelector("[data-menu-toggle]").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const open = elements.menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
  document
    .querySelectorAll(".topnav-link")
    .forEach((link) =>
      link.addEventListener("click", () => elements.menu.classList.remove("is-open")),
    );
  document.querySelector("[data-search]").addEventListener("input", (event) => {
    state.query = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-family-filter]").addEventListener("change", (event) => {
    state.family = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-category-filter]").addEventListener("change", (event) => {
    state.category = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-palette-filter]").addEventListener("change", (event) => {
    state.palette = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-sort]").addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document
    .querySelectorAll("[data-clear-filters]")
    .forEach((button) => button.addEventListener("click", clearFilters));
  elements.loadMore.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-deadline]").min = localDateValue();
  document
    .querySelector("[data-attachments]")
    .addEventListener("change", (event) => handleFiles(event.target));
  document.querySelector("[data-request-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.selected.size === 0) {
      document.querySelector("[data-no-selection-hint]").hidden = false;
      return;
    }
    const form = event.currentTarget;
    const button = document.querySelector("[data-submit-request]");
    button.disabled = true;
    button.innerHTML = "Đang gửi brief... <span>↗</span>";
    let payload;
    try {
      const attachmentError = attachmentValidationError(form);
      if (attachmentError) {
        showToast(attachmentError);
        return;
      }
      payload = formPayload(form);
      const result = await sendRequest(payload, form);
      showSuccess(payload, result);
    } catch (error) {
      console.error(error);
      const saved = payload ? saveRequestLocally(payload) : false;
      showToast(
        saved
          ? "Không thể kết nối đội gia công. Brief đã được lưu cục bộ, bạn có thể thử gửi lại."
          : "Không thể gửi tự động. Vui lòng thử lại hoặc liên hệ đội ngũ.",
      );
    } finally {
      button.disabled = false;
      button.innerHTML = "Gửi yêu cầu cho đội gia công <span>→</span>";
    }
  });
  document.querySelector("[data-download-request]").addEventListener("click", () => {
    if (state.lastRequest) downloadRequest(state.lastRequest);
  });
  document.querySelector("[data-new-request]").addEventListener("click", resetRequestView);
}

function clearFilters() {
  state.query = "";
  state.family = "all";
  state.category = "all";
  state.palette = "all";
  state.visibleCount = PAGE_SIZE;
  document.querySelector("[data-search]").value = "";
  document.querySelector("[data-family-filter]").value = "all";
  document.querySelector("[data-category-filter]").value = "all";
  document.querySelector("[data-palette-filter]").value = "all";
  renderTemplates();
}

async function loadJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Unable to load ${url}: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function loadLibrary() {
  try {
    const [templates, paletteIndex] = await Promise.all([
      loadJson(TEMPLATE_INDEX_URL),
      loadJson(PALETTE_INDEX_URL),
    ]);
    if (!Array.isArray(templates) || templates.length === 0)
      throw new Error("Template index is empty.");
    state.templates = templates;
    if (Array.isArray(paletteIndex.palettes))
      state.palettes = new Map(paletteIndex.palettes.map((palette) => [palette.name, palette]));
    elements.sourceStatus.textContent = `${templates.length} mẫu · dữ liệu local của PresentLab`;
  } catch (error) {
    console.warn("PresentLab template library fallback:", error);
    elements.sourceStatus.textContent =
      "Đang dùng 8 mẫu nền tảng · chạy qua web server để xem toàn bộ thư viện.";
  }
  renderFilterOptions();
  renderTemplates();
}

window.addEventListener("resize", scalePreviewFrame);

bindEvents();
renderFilterOptions();
renderTemplates();
updateSelectionUi();
loadLibrary();
