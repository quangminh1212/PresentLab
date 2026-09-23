import * as THREE from "../vendor/three/three.module.js";

const MAX_PIXEL_RATIO = 1.25;
const RIPPLE_COUNT = 4;
const NORMAL_MAP_URL = "/web/vendor/three/textures/waternormals.jpg";
const RIPPLE_SPEED = 0.19;
const RIPPLE_LIFETIME = 3.2;

const landmarks = [
  { id: "archive", label: "SLIDE LIBRARY" },
  { id: "brief", label: "STORY BRIEF" },
  { id: "process", label: "DECK REVIEW" },
];

const waterVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const waterFragmentShader = `
  precision highp float;

  uniform sampler2D uNormalMap;
  uniform float uNormalMapReady;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec4 uRipples[${RIPPLE_COUNT}];
  varying vec2 vUv;

  float gaussian(float value, float width) {
    float scaled = value / max(width, 0.0001);
    return exp(-scaled * scaled);
  }

  void main() {
    float aspect = max(uResolution.x / max(uResolution.y, 1.0), 0.5);
    vec2 surface = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    float time = uTime;

    float waveA = surface.x * 4.8 + surface.y * 1.9 + sin(surface.y * 3.4 + time * 0.18) * 0.9 + time * 0.26;
    float waveB = surface.y * 7.2 - surface.x * 2.3 - time * 0.21;
    float waveC = (surface.x - surface.y * 0.72) * 13.0 + sin(surface.y * 8.0 + time * 0.11) * 1.1;
    vec2 proceduralNormal = vec2(
      cos(waveA) * 0.060 + cos(waveC) * 0.023,
      cos(waveB) * 0.057 - cos(waveC) * 0.019
    );

    vec2 normalUvA = vUv * vec2(aspect * 2.0, 1.7) + vec2(time * 0.016, -time * 0.012);
    vec2 normalUvB = vec2(-vUv.y * 1.45, vUv.x * aspect * 1.65) + vec2(-time * 0.011, time * 0.009);
    vec2 mapA = texture2D(uNormalMap, normalUvA).xy * 2.0 - 1.0;
    vec2 mapB = texture2D(uNormalMap, normalUvB).xy * 2.0 - 1.0;
    vec2 normalDetail = (mapA * 0.26 + mapB * 0.17) * uNormalMapReady;

    vec2 rippleSlope = vec2(0.0);
    float rippleCrest = 0.0;
    for (int index = 0; index < ${RIPPLE_COUNT}; index += 1) {
      vec4 ripple = uRipples[index];
      float age = time - ripple.z;
      if (ripple.w > 0.0 && age >= 0.0 && age < ${RIPPLE_LIFETIME.toFixed(1)}) {
        vec2 delta = vec2((vUv.x - ripple.x) * aspect, vUv.y - ripple.y);
        float distanceToCenter = length(delta);
        float front = distanceToCenter - age * ${RIPPLE_SPEED.toFixed(2)};
        float envelope = exp(-abs(front) * 34.0) * exp(-age * 0.92) * ripple.w;
        float wave = sin(front * 255.0) * envelope;
        rippleSlope += normalize(delta + vec2(0.0001)) * wave * 0.15;
        rippleCrest = max(rippleCrest, envelope * exp(-front * front * 380.0));
      }
    }

    vec2 normalXY = normalDetail + proceduralNormal + rippleSlope;
    vec3 normal = normalize(vec3(normalXY * 1.75, 1.0));
    vec3 keyLight = normalize(vec3(-0.46, 0.72, 1.2));
    float broadReflection = pow(max(dot(normal, keyLight), 0.0), 3.3);
    float sharpReflection = pow(max(dot(normal, normalize(vec3(0.10, 0.72, 1.72))), 0.0), 34.0);

    float warpedX = vUv.x + normalXY.x * 0.18;
    float warpedY = vUv.y + normalXY.y * 0.16;
    float softbox = gaussian(warpedX - (0.82 + sin(time * 0.08) * 0.025), 0.22)
      * gaussian(warpedY - 0.23, 0.19);
    float ribbon = gaussian((warpedX - warpedY * 0.48) - (0.64 + sin(waveA * 0.18) * 0.026), 0.035);
    float causticCells = sin(waveA * 0.72 + waveC * 0.045) * sin(waveB * 0.63 - waveC * 0.04);
    float caustics = pow(max(causticCells, 0.0), 7.0) * 0.055;
    float longCrest = sin(vUv.y * 30.0 + sin(vUv.x * 8.0 + time * 0.16) * 1.9 + time * 0.22);
    float secondCrest = sin(vUv.y * 47.0 + sin(vUv.x * 12.0 - time * 0.12) * 1.3 - time * 0.17);
    float waterStreaks = smoothstep(0.72, 0.99, longCrest * 0.72 + secondCrest * 0.28)
      * smoothstep(0.0, 0.28, vUv.x);
    float normalTexture = smoothstep(0.08, 0.55, length(normalDetail));

    vec3 deepWater = vec3(0.012, 0.058, 0.068);
    vec3 blueWater = vec3(0.026, 0.17, 0.19);
    vec3 tealWater = vec3(0.062, 0.32, 0.32);
    float depthBand = smoothstep(-0.42, 0.46, surface.y + sin(waveA * 0.13) * 0.16);
    vec3 color = mix(deepWater, blueWater, depthBand * 0.66);
    color = mix(color, tealWater, clamp(broadReflection * 0.24 + caustics, 0.0, 0.32));
    color += vec3(0.14, 0.48, 0.47) * softbox * 0.60;
    color += vec3(0.25, 0.56, 0.53) * ribbon * (0.12 + broadReflection * 0.14);
    color += vec3(0.72, 0.92, 0.82) * sharpReflection * 0.36;
    color += vec3(0.35, 0.78, 0.68) * waterStreaks * 0.25;
    color += vec3(0.30, 0.73, 0.68) * rippleCrest * 0.65;
    color += vec3(0.025, 0.085, 0.09) * normalTexture;

    float pointerGlow = exp(-length(vec2((vUv.x - uPointer.x) * aspect, vUv.y - uPointer.y)) * 7.0);
    color += vec3(0.025, 0.11, 0.11) * pointerGlow * 0.18;
    float vignette = smoothstep(1.05, 0.18, length(surface * vec2(0.92, 1.0)));
    color *= mix(0.58, 1.0, vignette);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function setupDomControls(stage, onTarget, focusField) {
  stage.querySelector("[data-world-start]")?.addEventListener("click", focusField);
  stage.querySelectorAll("[data-world-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.worldTarget;
      if (target) onTarget(target);
    });
  });
}

export function setupXLabWorld({ canvas, stage, onTarget = () => {} }) {
  if (!canvas || !stage) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;
  const pointer = { x: 0.5, y: 0.5, lastX: null, lastY: null, lastTime: 0 };
  const rippleUniforms = Array.from(
    { length: RIPPLE_COUNT },
    () => new THREE.Vector4(0, 0, -1000, 0),
  );
  const rippleEvents = [];
  const locationButtons = new Map(
    [...stage.querySelectorAll("[data-world-target]")].map((button) => [
      button.dataset.worldTarget,
      button,
    ]),
  );
  const statusElement = stage.querySelector("[data-world-status]");
  const targetLabelElement = stage.querySelector("[data-world-target-label]");
  let renderer;
  let material;
  let geometry;
  let normalTexture;
  let animationFrame = 0;
  let rendererFailed = false;
  let rippleIndex = 0;
  let rippleCount = 0;
  let rippleSteps = 0;
  let startedAt = 0;
  let ripplePulseTimer = 0;
  let isVisible = true;
  let size = { width: 1, height: 1 };

  const setFallback = (reason) => {
    rendererFailed = true;
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    geometry?.dispose();
    renderer?.dispose();
    renderer = undefined;
    normalTexture?.dispose();
    material?.dispose();
    stage.classList.add("world-fallback", "world-ready");
    stage.classList.remove("is-threejs-water");
    stage.dataset.worldFallbackReason = reason;
    stage.dataset.worldRenderMode = "css-water-fallback";
    stage.dataset.worldShading = "layered-close-up-water";
    stage.dataset.worldSurface = "seamless-close-up-water";
    stage.dataset.worldInteraction = "css-water-ripple";
    stage.dataset.worldWaterProvider = "css-water-surface";
    stage.dataset.worldRippleProvider = "css-ripple-gradient";
    stage.dataset.worldWaterTexture = "procedural";
  };

  stage.dataset.worldReducedMotion = String(reducedMotion);
  stage.dataset.worldRenderMode = "css-water-fallback";
  stage.dataset.worldSurface = "seamless-close-up-water";
  stage.dataset.worldWaterTexture = "procedural";
  stage.dataset.worldWaterNormalMap = "loading";
  stage.dataset.worldRippleCount = "0";
  stage.dataset.worldRipplePeak = "0.0000";
  stage.dataset.worldRippleSteps = "0";
  stage.dataset.worldRippleRadius = "0.000";
  stage.dataset.worldRippleState = "idle";
  stage.dataset.worldRippleQueued = "false";
  stage.dataset.worldRippleClickCount = "0";
  stage.dataset.worldRippleHoverCount = "0";
  stage.dataset.worldRippleLastType = "idle";
  stage.dataset.worldRippleInput = "uv-screen-space";

  const setStatus = (text) => {
    if (statusElement) statusElement.textContent = text;
  };

  const setTarget = (target) => {
    const landmark = landmarks.find((item) => item.id === target);
    if (!landmark) return;
    stage.classList.add("is-focused");
    setStatus("SURFACE / INTERACTIVE");
    if (targetLabelElement) targetLabelElement.textContent = landmark.label;
    locationButtons.forEach((button, id) => button.classList.toggle("is-active", id === target));
    onTarget(target);
  };

  const focusWater = () => {
    stage.classList.add("is-focused");
    setStatus("SURFACE / INTERACTIVE");
    stage.focus({ preventScroll: true });
  };

  setupDomControls(stage, setTarget, focusWater);
  locationButtons.forEach((button, id) => button.classList.toggle("is-active", id === "archive"));
  setStatus("LIVE / WATER SURFACE");

  const secondsNow = () => (window.performance.now() - startedAt) * 0.001;
  const setPointer = (clientX, clientY) => {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    const x = clamp((clientX - bounds.left) / bounds.width, 0, 1);
    const y = clamp(1 - (clientY - bounds.top) / bounds.height, 0, 1);
    pointer.x = x;
    pointer.y = y;
    material?.uniforms.uPointer.value.set(x, y);
    stage.style.setProperty("--water-pointer-x", `${x * 100}%`);
    stage.style.setProperty("--water-pointer-y", `${(1 - y) * 100}%`);
    return { x, y };
  };

  const addRipple = (clientX, clientY, type, strength) => {
    if (reducedMotion || !renderer || !material) return false;
    const point = setPointer(clientX, clientY);
    if (!point) return false;

    const index = rippleIndex;
    rippleIndex = (rippleIndex + 1) % RIPPLE_COUNT;
    const time = secondsNow();
    rippleUniforms[index].set(point.x, point.y, time, strength);
    rippleCount += 1;
    rippleEvents[index] = { time, strength, type };
    stage.dataset.worldRippleCount = String(rippleCount);
    stage.dataset.worldRippleQueued = "false";
    stage.dataset.worldRippleLastType = type;
    stage.dataset.worldRippleInput = `uv-screen-space-${type}`;
    stage.dataset.worldRippleLastSlot = String(index);
    stage.dataset.worldRippleState = [
      rippleCount,
      index,
      time.toFixed(3),
      `${point.x.toFixed(3)},${point.y.toFixed(3)}`,
    ].join("|");
    if (type === "click") {
      stage.dataset.worldRippleClickCount = String(Number(stage.dataset.worldRippleClickCount) + 1);
    } else {
      stage.dataset.worldRippleHoverCount = String(Number(stage.dataset.worldRippleHoverCount) + 1);
    }

    stage.classList.remove("is-world-pulsing");
    void stage.offsetWidth;
    stage.classList.add("is-world-pulsing");
    window.clearTimeout(ripplePulseTimer);
    ripplePulseTimer = window.setTimeout(() => stage.classList.remove("is-world-pulsing"), 650);
    return true;
  };

  const isControl = (event) =>
    event.target && typeof event.target.closest === "function" && event.target.closest("a, button");

  stage.addEventListener("pointermove", (event) => {
    const point = setPointer(event.clientX, event.clientY);
    if (!point || reducedMotion || !renderer || event.pointerType === "touch" || isControl(event)) {
      return;
    }
    const now = window.performance.now();
    if (pointer.lastX === null) {
      pointer.lastX = point.x;
      pointer.lastY = point.y;
      pointer.lastTime = now;
      return;
    }
    const distance = Math.hypot(point.x - pointer.lastX, point.y - pointer.lastY);
    if (distance < 0.035 || now - pointer.lastTime < 90) return;
    if (addRipple(event.clientX, event.clientY, "hover", clamp(0.42 + distance * 2.8, 0.42, 0.8))) {
      pointer.lastX = point.x;
      pointer.lastY = point.y;
      pointer.lastTime = now;
    }
  });

  stage.addEventListener("pointerleave", () => {
    pointer.lastX = null;
    pointer.lastY = null;
    stage.style.setProperty("--water-pointer-x", "50%");
    stage.style.setProperty("--water-pointer-y", "50%");
  });

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || isControl(event)) return;
    addRipple(event.clientX, event.clientY, "click", 1);
  });

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x06171b, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    normalTexture = new THREE.TextureLoader().load(
      NORMAL_MAP_URL,
      () => {
        stage.dataset.worldWaterNormalMap = "ready";
        if (reducedMotion) draw(0);
      },
      undefined,
      () => {
        stage.dataset.worldWaterNormalMap = "unavailable";
        material.uniforms.uNormalMapReady.value = 0;
        if (reducedMotion) draw(0);
      },
    );
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.colorSpace = THREE.NoColorSpace;
    normalTexture.generateMipmaps = false;

    material = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uNormalMap: { value: normalTexture },
        uNormalMapReady: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uRipples: { value: rippleUniforms },
      },
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    stage.classList.remove("world-fallback");
    stage.classList.add("is-threejs-water", "world-ready");
    stage.dataset.worldFallbackReason = "";
    stage.dataset.worldRenderMode = "threejs-water-surface";
    stage.dataset.worldShading = "threejs-spectral-water-surface";
    stage.dataset.worldSurface = "seamless-close-up-water";
    stage.dataset.worldInteraction = "fragment-shader-ripples";
    stage.dataset.worldWaterProvider = "threejs-shader-material";
    stage.dataset.worldRippleProvider = "threejs-fragment-shader";
    stage.dataset.worldRippleMode = "screen-space-water-ripple";
    stage.dataset.worldRippleField = `${RIPPLE_COUNT}-shader-events`;
    stage.dataset.worldRippleShader = "threejs-spectral-water-surface";
    stage.dataset.worldWaterTexture = "procedural";

    const resize = () => {
      if (rendererFailed || !renderer || !material) return;
      const bounds = stage.getBoundingClientRect();
      size = { width: Math.max(bounds.width, 1), height: Math.max(bounds.height, 1) };
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
      renderer.setSize(size.width, size.height, false);
      material.uniforms.uResolution.value.set(size.width, size.height);
      if (reducedMotion) draw(0);
    };

    function draw(time) {
      if (rendererFailed || !renderer || !material) return;
      const elapsed = reducedMotion ? 0 : Math.max(0, time * 0.001 - startedAt * 0.001);
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uNormalMapReady.value = normalTexture.image ? 1 : 0;
      let peak = 0;
      let radius = 0;
      let activeRipples = 0;
      rippleEvents.forEach((ripple, index) => {
        if (!ripple) return;
        const age = elapsed - ripple.time;
        if (age < 0 || age >= RIPPLE_LIFETIME) {
          rippleUniforms[index].w = 0;
          rippleEvents[index] = undefined;
          return;
        }
        activeRipples += 1;
        peak = Math.max(peak, ripple.strength * Math.exp(-age * 0.92));
        radius = Math.max(radius, age * RIPPLE_SPEED);
      });
      if (activeRipples) rippleSteps += 1;
      stage.dataset.worldRipplePeak = peak.toFixed(4);
      stage.dataset.worldRippleRadius = radius.toFixed(3);
      stage.dataset.worldRippleSteps = String(rippleSteps);
      stage.dataset.worldGpuRender = `${renderer.info.render.calls + 1}|${renderer.info.render.triangles + 2}`;
      stage.dataset.worldAnimationTime = Math.round(time).toString();
      stage.dataset.worldWaterPhase = (elapsed * 0.45).toFixed(3);
      stage.dataset.worldWaterState = `${Math.round(time)}|${pointer.x.toFixed(3)},${pointer.y.toFixed(3)}|${peak.toFixed(3)}`;
      stage.dataset.worldPointerRipple = peak.toFixed(3);
      renderer.render(scene, camera);
      stage.dataset.worldGpuRender = `${renderer.info.render.calls}|${renderer.info.render.triangles}`;
    }

    const renderLoop = (time) => {
      animationFrame = 0;
      if (!isVisible || document.hidden || reducedMotion) return;
      draw(time);
      animationFrame = window.requestAnimationFrame(renderLoop);
    };

    const start = () => {
      if (rendererFailed || !renderer || !isVisible || document.hidden) return;
      if (reducedMotion) {
        draw(0);
      } else if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(renderLoop);
      }
    };

    const stop = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    startedAt = window.performance.now();
    resize();
    stage.dataset.worldWaterNormalMap = "loading";
    start();

    const resizeObserver = window.ResizeObserver ? new window.ResizeObserver(resize) : null;
    resizeObserver?.observe(stage);
    window.addEventListener("resize", resize, { passive: true });
    if ("IntersectionObserver" in window) {
      const visibilityObserver = new window.IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) start();
          else stop();
        },
        { threshold: 0.02 },
      );
      visibilityObserver.observe(stage);
    }

    const onMotionPreference = (event) => {
      reducedMotion = event.matches;
      stage.dataset.worldReducedMotion = String(reducedMotion);
      stage.classList.toggle("world-reduced-motion", reducedMotion);
      if (reducedMotion) {
        stop();
        rippleEvents.length = 0;
        rippleUniforms.forEach((ripple) => ripple.set(0, 0, -1000, 0));
        stage.dataset.worldRipplePeak = "0.0000";
        stage.dataset.worldRippleRadius = "0.000";
        draw(0);
      } else {
        startedAt = window.performance.now();
        start();
      }
    };
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener("change", onMotionPreference);
    } else {
      reducedMotionQuery.addListener?.(onMotionPreference);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      stop();
      setFallback("webgl-context-lost");
    });
  } catch (error) {
    setFallback(error instanceof Error ? "webgl-unavailable" : "water-renderer-failed");
    stage.dataset.worldWaterNormalMap = "unavailable";
    stage.dataset.worldRippleMode = "css-water-ripple";
  }

  stage.classList.toggle("world-reduced-motion", reducedMotion);
}
