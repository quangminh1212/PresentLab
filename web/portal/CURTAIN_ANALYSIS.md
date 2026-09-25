# Page-Curtain Lifecycle Analysis

## 1. HTML Definition (Creation Point)
**File:** `web/portal/index.html`  
**Lines:** 19-20

```html
<div class="page-curtain" data-page-curtain aria-hidden="true">
  <span class="page-curtain-line"></span>
</div>
```

- **Static markup** - element exists from DOMContentLoaded
- No JavaScript creates this element; it's hardcoded in HTML
- Positioned at root level of `<body>`, before `.app-shell`

---

## 2. CSS Styling & Lifecycle States

### A. Base Curtain Styles
**File:** `web/portal/styles.css`  
**Lines:** 3220-3242

```css
.page-curtain {
  position: fixed;
  inset: 0;
  z-index: 90;                    /* sits above everything except overlays */
  display: grid;
  place-items: center;
  pointer-events: none;            /* allows clicking through when hidden */
  background: radial-gradient(circle at 50% 44%, rgb(140 232 216 / 9%), transparent 22rem), #050a12;
  transform-origin: top;
  transition: transform 900ms var(--ease-expo);  /* curtain drop animation */
}
```

**Animation Keyframes**  
**Lines:** 3750-3758

```css
@keyframes curtain-pulse {
  from { opacity: 0.35; transform: scaleX(0.65); }
  to   { opacity: 1;   transform: scaleX(1); }
}
```

### B. Active State (Curain Visible)
**Lines:** 3232-3237

```css
.page-curtain-line {
  width: min(180px, 28vw);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  box-shadow: 0 0 28px rgb(140 232 216 / 55%);
  animation: curtain-pulse 1000ms ease-in-out infinite alternate;  /* loading indicator */
}
```

### C. Ready State (Curtain Hidden)
**Line:** 3240-3242

```css
html.is-ready .page-curtain {
  transform: scaleY(0);    /* collapses vertically, effectively hidden */
}
```

### D. Light Theme Variation
**File:** `styles.css` Lines: 4108-4110

```css
html[data-theme="light"] .page-curtain {
  background: radial-gradient(circle at 50% 44%, rgb(47 80 183 / 10%), transparent 22rem), #f4efe4;
}
```

### E. Progressive Enhancement Fallback
**File:** `styles.css` Lines: 3883-3885

```css
/* When no JS loaded or JS fails - hide curtain permanently */
.page-curtain {
  display: none;
}
```

This is inside an `@supports (not (display: none))` block for IE/old browsers.

---

## 3. JavaScript Lifecycle Controller

**File:** `web/portal/app.js`  
**Function:** `setupExperience()`  
**Lines:** 2559-2572

```javascript
function setupExperience() {
  bindRevealMotion();
  bindAnchorNavigation();
  bindSectionObserver();
  bindStageParallax();
  bindAmbientSurfaceMotion();
  bindMagneticMotion();
  bindMotionScroll();
  deferLusionFrame();           // Lazy-load lusion iframe
  requestAnimationFrame(() => {
    document.documentElement.classList.add("is-ready");  /* CURTAIN REMOVAL TRIGGER */
    window.setTimeout(mountXLabWorld, 500);              // Start interactive world scene
  });
}
```

### Execution Flow (Script Entry Points)
**Lines:** 2583-2589

```javascript
document.documentElement.classList.add("js");
resetInitialFragmentToWater();
bindEvents();
applyLocale();
setupExperience();     /* Adds is-ready after ~0-500ms */
loadLibrary();         /* Loads template/palette JSON data */
```

### Timing Dependencies
**Lines:** 2526-2557 (`deferLusionFrame`)

```javascript
function deferLusionFrame() {
  const frame = document.querySelector("iframe[data-lazy-src]");
  if (!frame) return;

  const observeFrame = () => {
    const loadFrame = () => {
      frame.src = frame.dataset.lazySrc;
      delete frame.dataset.lazySrc;
    };

    if (!("IntersectionObserver" in window)) {
      loadFrame();
      return;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadFrame();          /* Lusion loads when catalog section scrolls into view */
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(frame);
  };

  if (document.readyState === "complete") {
    observeFrame();
  } else {
    window.addEventListener("load", observeFrame, { once: true });
  }
}
```

---

## 4. Timeline Summary

| Time Event | What Happens | Curtain State |
|------------|--------------|---------------|
| **t=0ms** | DOM parses, `.page-curtain` created from HTML | **Visible** (static HTML) |
| **t=0-50ms** | `app.js` executes, calls `setupExperience()` | **Visible** |
| **t=50-100ms** | `requestAnimationFrame` fires | |
| **t=50-100ms** | `document.documentElement.classList.add("is-ready")` | **Curtain begins fade out** (`transform: scaleY(0)` over 900ms) |
| **t=550ms** | `mountXLabWorld()` starts water canvas | Full interactivity available |
| **~scroll time** | Lusion iframe lazy-loads when catalog section visible | Unrelated to curtain timing |

---

## 5. Safest Replacement Point

### Target Line: **index.html lines 19-20**

**Current Code:**
```html
<div class="page-curtain" data-page-curtain aria-hidden="true">
  <span class="page-curtain-line"></span>
</div>
```

### Why This Is the Safe Point:

1. **Pure Markup**: No event listeners attached, no dynamic behavior
2. **CSS-Controlled**: All lifecycle handled via `.is-ready` class on `<html>`
3. **Zero Dependencies**: Replacing content doesn't break any script references
4. **Graceful Degradation**: Even without JS, curtain is styled appropriately
5. **Theming Support**: Works with both dark/light themes via `html[data-theme]`

### Lusion Loader Insertion Strategy:

Replace `line` span with Lusion-style loader while keeping wrapper intact:

```html
<div class="page-curtain" data-page-curtain aria-hidden="true">
  <!-- Replace this line with Lusion loader markup -->
  <!-- Example Lusion loader: -->
  <div class="lusion-loader" aria-label="Đang tải thư viện slide">
    <div class="loader-line"></div>
    <div class="loader-text">Đang chuẩn bị...</div>
  </div>
</div>
```

Then target via CSS:

```css
html.is-ready .lusion-loader {
  /* fade out animation, e.g., opacity + scale */
}
```

---

## 6. File References Summary

| File | Line(s) | Role |
|------|---------|------|
| `web/portal/index.html` | 19-20 | **CURTAIN DEFINITION** — static creation point |
| `web/portal/styles.css` | 3220-3242 | Base styling, active state |
| `web/portal/styles.css` | 3240-3242 | `is-ready` trigger (curtain removal) |
| `web/portal/styles.css` | 3750-3758 | Pulse animation keyframes |
| `web/portal/styles.css` | 4108-4110 | Light theme override |
| `web/portal/styles.css` | 3883-3885 | IE fallback (hide by default) |
| `web/portal/app.js` | 2568-2571 | **CURTAIN REMOVAL TRIGGER** |
| `web/portal/app.js` | 2526-2557 | Lusion lazy-loading logic |

---

## 7. Error/Fallback Conditions

1. **No JavaScript**: Curtain shows full screen; users must reload. Progressive enhancement assumes JS works.
2. **JS Error After `setupExperience`**: If `is-ready` never added, curtain stays visible forever.
3. **No IntersectionObserver**: Lusion iframe loads immediately instead of on scroll visibility.
4. **Network Failure** (templates/palettes): Independent from curtain; uses fallback data.

**Recommendation**: Consider adding timeout/fallback for curtain if not removed after X seconds for better error UX.
