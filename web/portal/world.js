import * as THREE from "../vendor/three/three.module.js";
import { Sky } from "../vendor/three/addons/objects/Sky.js";
import { Water } from "../vendor/three/addons/objects/Water.js";

const MAX_PIXEL_RATIO = 1.25;
const WORLD_RENDER_SCALE = 1;
const WATER_NORMALS_URL = "/web/vendor/three/textures/waternormals.jpg";
const RIPPLE_SLOT_COUNT = 4;
const RIPPLE_SPEED = 0.1;
const RIPPLE_GRID_SIZE = 256;
const RIPPLE_WORLD_MIN = new THREE.Vector2(-90, -74);
const RIPPLE_WORLD_SIZE = new THREE.Vector2(180, 240);
const RIPPLE_HEIGHT_RANGE = 0.55;
const RIPPLE_TIME_STEP = 1 / 60;
const RIPPLE_DAMPING = 0.012;
const RIPPLE_PENDING_LIMIT = 12;
const RIPPLE_HOVER_MIN_INTERVAL = 0.04;
const RIPPLE_HOVER_MIN_NDC_DISTANCE = 0.004;
const RIPPLE_HOVER_MIN_WORLD_DISTANCE = 1.35;
const RIPPLE_HOVER_STRENGTH = 0.17;
const RIPPLE_HOVER_MAX_STRENGTH = 0.25;
const RIPPLE_HOVER_RADIUS = 0.9;
const RIPPLE_HOVER_MAX_RADIUS = 1.25;
const RIPPLE_HOVER_LIFETIME = 0.18;
const RIPPLE_CLICK_STRENGTH = 0.3;
const RIPPLE_CLICK_RADIUS = 0.9;

/* The Three.js Water addon draws a reflective surface over a procedural sea horizon.
 * Its GPU height field adds ripples where the pointer meets the water plane. */
const landmarks = [
  {
    id: "archive",
    label: "SLIDE LIBRARY",
  },
  {
    id: "brief",
    label: "STORY BRIEF",
  },
  {
    id: "process",
    label: "DECK REVIEW",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createRippleField(renderer) {
  const renderTargetOptions = {
    depthBuffer: false,
    stencilBuffer: false,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  };
  const targets = [
    new THREE.WebGLRenderTarget(RIPPLE_GRID_SIZE, RIPPLE_GRID_SIZE, renderTargetOptions),
    new THREE.WebGLRenderTarget(RIPPLE_GRID_SIZE, RIPPLE_GRID_SIZE, renderTargetOptions),
  ];
  targets.forEach((target) => {
    target.texture.colorSpace = THREE.NoColorSpace;
    target.texture.generateMipmaps = false;
    target.texture.needsUpdate = true;
  });

  const simulationMaterial = new THREE.ShaderMaterial({
    uniforms: {
      rippleHeightMap: { value: targets[0].texture },
      rippleTexel: {
        value: new THREE.Vector2(1 / RIPPLE_GRID_SIZE, 1 / RIPPLE_GRID_SIZE),
      },
      rippleWorldSize: { value: RIPPLE_WORLD_SIZE.clone() },
      rippleTimeStep: { value: RIPPLE_TIME_STEP },
      rippleSpeed: { value: RIPPLE_SPEED },
      rippleDamping: { value: RIPPLE_DAMPING },
      rippleImpacts: {
        value: Array.from({ length: RIPPLE_SLOT_COUNT }, () => new THREE.Vector4()),
      },
      rippleHover: { value: new THREE.Vector4() },
      rippleHoverDirection: { value: new THREE.Vector2() },
      rippleHoverTravel: { value: 0 },
    },
    vertexShader: `
      varying vec2 rippleUv;
      void main() {
        rippleUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D rippleHeightMap;
      uniform vec2 rippleTexel;
      uniform vec2 rippleWorldSize;
      uniform float rippleTimeStep;
      uniform float rippleSpeed;
      uniform float rippleDamping;
      uniform vec4 rippleImpacts[${RIPPLE_SLOT_COUNT}];
      uniform vec4 rippleHover;
      uniform vec2 rippleHoverDirection;
      uniform float rippleHoverTravel;
      varying vec2 rippleUv;

      void main() {
        float center = texture2D(rippleHeightMap, rippleUv).r;
        float velocity = texture2D(rippleHeightMap, rippleUv).g;
        float left = texture2D(rippleHeightMap, rippleUv - vec2(rippleTexel.x, 0.0)).r;
        float right = texture2D(rippleHeightMap, rippleUv + vec2(rippleTexel.x, 0.0)).r;
        float back = texture2D(rippleHeightMap, rippleUv - vec2(0.0, rippleTexel.y)).r;
        float front = texture2D(rippleHeightMap, rippleUv + vec2(0.0, rippleTexel.y)).r;
        float frameScale = clamp(rippleTimeStep * 60.0, 0.25, 1.2);
        vec2 worldStep = rippleWorldSize * rippleTexel;
        float laplacian =
          ( left + right - 2.0 * center ) / ( worldStep.x * worldStep.x ) +
          ( back + front - 2.0 * center ) / ( worldStep.y * worldStep.y );
        float nextVelocity = velocity + laplacian * rippleSpeed * frameScale;
        nextVelocity *= exp(-rippleDamping * frameScale);
        float nextHeightOffset = 0.0;

        for (int index = 0; index < ${RIPPLE_SLOT_COUNT}; index += 1) {
          vec4 impact = rippleImpacts[index];
          if (impact.w <= 0.0) continue;
          vec2 worldDelta = (rippleUv - impact.xy) * rippleWorldSize;
          float distanceToImpact = length(worldDelta);
          float radius = max(impact.w, 0.001);
          float radiusSquared = radius * radius;
          float core = exp(-dot(worldDelta, worldDelta) / max(radiusSquared * 0.34, 0.001));
          float ringOffset = distanceToImpact - radius * 0.68;
          float ring = exp(-(ringOffset * ringOffset) / max(radiusSquared * 0.075, 0.001));
          float contact = core * 0.72 + ring * 0.26;
          contact *= 0.5 - 0.5 * cos(clamp(contact, 0.0, 1.0) * 3.14159265);
          contact *= clamp(
            1.0 +
              0.045 * sin(worldDelta.x * 0.52 + worldDelta.y * 0.31) +
              0.03 * sin(worldDelta.x * 0.21 - worldDelta.y * 0.39),
            0.9,
            1.1
          );
          nextHeightOffset -= impact.z * core * 0.012;
          nextVelocity -= impact.z * contact * 0.42;
        }

        if (rippleHover.z > 0.0 && rippleHover.w > 0.0) {
          vec2 hoverDelta = (rippleUv - rippleHover.xy) * rippleWorldSize;
          float hoverDistance = length(hoverDelta);
          float directionLength = length(rippleHoverDirection);
          float hoverRadius = rippleHover.w;
          float hoverCore = exp(-dot(hoverDelta, hoverDelta) / max(hoverRadius * hoverRadius * 0.52, 0.001));
          float hoverRingOffset = hoverDistance - hoverRadius * 0.72;
          float hoverRing = exp(-(hoverRingOffset * hoverRingOffset) / max(hoverRadius * hoverRadius * 0.09, 0.001));
          float hoverTrail = 0.0;
          if (directionLength > 0.001 && rippleHoverTravel > 0.01) {
            vec2 direction = rippleHoverDirection / directionLength;
            vec2 perpendicular = vec2(-direction.y, direction.x);
            float along = dot(hoverDelta, direction);
            float across = dot(hoverDelta, perpendicular);
            float trailLength = max(rippleHoverTravel + hoverRadius * 0.45, hoverRadius * 0.65);
            float trailGate = smoothstep(-trailLength, -hoverRadius * 0.08, along);
            float trailFade = exp(-max(-along, 0.0) / max(trailLength * 0.72, 0.001));
            float trailWidth = exp(-(across * across) / max(hoverRadius * hoverRadius * 0.42, 0.001));
            hoverTrail = trailGate * trailFade * trailWidth;
          }
          float hoverContact = hoverCore * 0.72 + hoverRing * 0.18 + hoverTrail * 0.24;
          hoverContact *= 0.5 - 0.5 * cos(clamp(hoverContact, 0.0, 1.0) * 3.14159265);
          nextHeightOffset -= rippleHover.z * hoverCore * 0.006;
          nextVelocity -= rippleHover.z * hoverContact * 0.16;
        }

        float nextHeight = center + nextHeightOffset + nextVelocity * frameScale;

        float edgeDistance = min(
          min(rippleUv.x, 1.0 - rippleUv.x),
          min(rippleUv.y, 1.0 - rippleUv.y)
        );
        nextVelocity *= mix(0.78, 1.0, smoothstep(0.0, 0.1, edgeDistance));

        if (center != center || nextVelocity != nextVelocity) {
          center = 0.0;
          nextVelocity = 0.0;
        }
        nextHeight = clamp(nextHeight, -0.5, 0.5);
        if (nextHeight != nextHeight) nextHeight = 0.0;
        float gradientX = (right - left) / (2.0 * worldStep.x);
        float gradientY = (front - back) / (2.0 * worldStep.y);
        gl_FragColor = vec4(nextHeight, nextVelocity, gradientX, gradientY);
      }
    `,
  });
  const simulationScene = new THREE.Scene();
  simulationScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simulationMaterial));
  const simulationCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const previousRenderTarget = renderer.getRenderTarget();
  targets.forEach((target) => {
    renderer.setRenderTarget(target);
    renderer.clear();
  });
  renderer.setRenderTarget(previousRenderTarget);

  return {
    size: RIPPLE_GRID_SIZE,
    targets,
    currentIndex: 0,
    texture: targets[0].texture,
    simulationMaterial,
    simulationScene,
    simulationCamera,
    lastTime: null,
    peak: 0,
    steps: 0,
    warmupSteps: 0,
    active: false,
    quietFrames: 0,
    pendingImpacts: [],
    hoverImpact: null,
  };
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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    impact: 0,
    lastHoverNdcX: null,
    lastHoverNdcY: null,
    lastHoverTime: -Infinity,
  };
  const rippleState = {
    centers: Array.from({ length: RIPPLE_SLOT_COUNT }, () => new THREE.Vector2(0, -1000)),
    starts: Array.from({ length: RIPPLE_SLOT_COUNT }, () => -1000),
    strengths: Array.from({ length: RIPPLE_SLOT_COUNT }, () => 0),
    nextSlot: 0,
    lastSlot: -1,
    lastStart: -1000,
    count: 0,
    clickCount: 0,
    hoverCount: 0,
    pending: [],
    ndc: new THREE.Vector2(),
    hoverPoint: new THREE.Vector2(),
    hasHoverPoint: false,
  };
  let rippleField;
  const waterVideoElement = stage.querySelector("[data-world-water-video]");
  const statusElement = stage.querySelector("[data-world-status]");
  const coordinatesElement = stage.querySelector("[data-world-coordinates]");
  const speedElement = stage.querySelector("[data-world-speed]");
  const targetLabelElement = stage.querySelector("[data-world-target-label]");
  const locationButtons = new Map(
    [...stage.querySelectorAll("[data-world-target]")].map((button) => [
      button.dataset.worldTarget,
      button,
    ]),
  );
  let selectedTarget = "archive";
  let animationFrame = 0;
  let isVisible = true;
  let width = 1;
  let height = 1;
  let pointerStrength = 0;
  let videoWaterReady = false;
  let videoWaterFailed = false;
  let videoPlaybackBlocked = false;
  let webglWaterAvailable = false;
  let renderer;
  let scene;
  let camera;
  let water;
  let sky;
  let waterNormals;
  let waterNormalMapState = "loading";
  let raycaster;

  const setFallbackState = () => {
    if (videoWaterReady) return;
    stage.classList.remove("is-video-water", "is-threejs-water");
    stage.dataset.worldRenderMode = "css-fallback";
    stage.dataset.worldShading = "water-css-fallback";
    stage.dataset.worldSurface = "css-water-fallback";
    stage.dataset.worldInteraction = "pointer-parallax-overlay";
    stage.dataset.worldRippleProvider = "css-fallback";
    stage.classList.add("world-fallback", "world-ready");
  };

  const getVideoPlaybackState = () => {
    if (videoWaterReady) return reducedMotion || videoPlaybackBlocked ? "paused" : "playing";
    if (videoWaterFailed) return "fallback";
    return waterVideoElement ? "loading" : "unavailable";
  };

  const setWebglWaterState = () => {
    stage.classList.remove("world-fallback");
    stage.classList.toggle("is-video-water", videoWaterReady);
    stage.classList.add("is-threejs-water", "world-ready");
    stage.dataset.worldVideoState = getVideoPlaybackState();
    stage.dataset.worldRenderMode = "threejs-water-addon-overlay";
    stage.dataset.worldShading = videoWaterReady
      ? "threejs-reflective-water-over-live-footage"
      : "threejs-reflective-water-over-css-backdrop";
    stage.dataset.worldSurface = videoWaterReady
      ? "threejs-water-normal-map-over-video"
      : "threejs-water-normal-map-over-css-backdrop";
    stage.dataset.worldWaterTexture = !waterVideoElement
      ? "not-used"
      : videoWaterReady
        ? "ready"
        : videoWaterFailed
          ? "unavailable"
          : "loading";
    stage.dataset.worldInteraction = "raycast-gpu-water-ripple";
    stage.dataset.worldWaterProvider = "threejs-water-addon";
    stage.dataset.worldRippleProvider = "threejs-gpu-heightfield";
    stage.dataset.worldRippleMode = "raycast-water-surface-ripple";
    stage.dataset.worldRippleField = `${RIPPLE_GRID_SIZE}x${RIPPLE_GRID_SIZE}`;
    stage.dataset.worldRippleCount = String(rippleState.count);
    stage.dataset.worldRipplePeak ||= "0.0000";
    stage.dataset.worldRippleSteps ||= "0";
    stage.dataset.worldRippleRadius ||= "0.000";
    stage.dataset.worldRippleState ||= "idle";
    stage.dataset.worldRippleQueued ||= "false";
    stage.dataset.worldRippleClickCount ||= "0";
    stage.dataset.worldRippleHoverCount ||= "0";
    stage.dataset.worldRippleLastType ||= "idle";
    stage.dataset.worldRippleInput ||= "gpu-world-space";
  };

  const setVideoWaterState = (ready) => {
    videoWaterReady = ready;
    videoWaterFailed = !ready;
    stage.classList.toggle("is-video-water", ready);
    stage.dataset.worldVideoState = ready ? getVideoPlaybackState() : "fallback";
    if (ready) {
      stage.classList.add("world-ready");
      stage.classList.remove("world-fallback");
      stage.dataset.worldWaterTexture = "ready";
      if (webglWaterAvailable) setWebglWaterState();
      else {
        stage.dataset.worldRenderMode = "video-water-fallback";
        stage.dataset.worldShading = "captured-water-loop";
        stage.dataset.worldSurface = "licensed-video-loop";
        stage.dataset.worldInteraction = "pointer-parallax-overlay";
      }
    } else {
      stage.dataset.worldWaterTexture = "unavailable";
      if (webglWaterAvailable) setWebglWaterState();
      else setFallbackState();
    }
  };

  const activateVideoWater = () => {
    if (!waterVideoElement) return;
    waterVideoElement.muted = true;
    setVideoWaterState(true);
    if (reducedMotion) {
      waterVideoElement.pause();
      stage.dataset.worldVideoState = "paused";
      return;
    }
    const playback = waterVideoElement.play();
    playback
      ?.then(() => {
        videoPlaybackBlocked = false;
        stage.dataset.worldVideoState = getVideoPlaybackState();
      })
      .catch(() => {
        videoPlaybackBlocked = true;
        stage.dataset.worldVideoState = "paused";
        if (webglWaterAvailable) setWebglWaterState();
      });
  };

  if (waterVideoElement) {
    stage.dataset.worldVideoState = "loading";
    waterVideoElement.addEventListener("loadedmetadata", activateVideoWater, { once: true });
    waterVideoElement.addEventListener("loadeddata", activateVideoWater, { once: true });
    const markVideoUnavailable = () => setVideoWaterState(false);
    waterVideoElement.addEventListener("error", markVideoUnavailable, { once: true });
    waterVideoElement.querySelectorAll("source").forEach((source) => {
      source.addEventListener("error", markVideoUnavailable, { once: true });
    });
    waterVideoElement.addEventListener("timeupdate", () => {
      stage.dataset.worldVideoTime = waterVideoElement.currentTime.toFixed(3);
    });
    if (waterVideoElement.readyState >= 1) activateVideoWater();
    else waterVideoElement.load();
  }

  const setSelectedTarget = (target) => {
    const landmark = landmarks.find((item) => item.id === target);
    if (!landmark) return;
    selectedTarget = target;
    stage.classList.add("is-focused");
    if (statusElement) statusElement.textContent = "WATER NODE LOCK";
    if (targetLabelElement) targetLabelElement.textContent = landmark.label;
    locationButtons.forEach((button, id) => button.classList.toggle("is-active", id === target));
    onTarget(target);
  };

  const focusField = () => {
    stage.classList.add("is-focused");
    if (statusElement) statusElement.textContent = "TIDE FIELD FOCUS";
    stage.focus({ preventScroll: true });
  };

  setupDomControls(stage, setSelectedTarget, focusField);
  stage.classList.remove("is-focused");
  if (statusElement) statusElement.textContent = "OPEN WATER";

  const isWorldControl = (event) =>
    event.target && typeof event.target.closest === "function" && event.target.closest("button, a");

  const queuePointerRipple = (event, type, strength, radius) => {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    const localX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const localY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    const pointerRipple = {
      x: localX * 2 - 1,
      y: 1 - localY * 2,
      type,
      strength,
      radius,
    };
    if (rippleState.pending.length >= RIPPLE_PENDING_LIMIT) {
      const hoverIndex = rippleState.pending.findIndex((item) => item.type === "hover");
      if (type === "click" && hoverIndex >= 0) {
        rippleState.pending.splice(hoverIndex, 1);
      } else if (type === "hover") {
        if (hoverIndex < 0) return false;
        rippleState.pending.splice(hoverIndex, 1);
      } else {
        rippleState.pending.shift();
      }
    }
    rippleState.pending.push(pointerRipple);
    stage.dataset.worldRippleQueued = "true";
    return true;
  };

  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    pointer.active = true;
    pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);

    if (
      reducedMotion ||
      !webglWaterAvailable ||
      event.pointerType === "touch" ||
      isWorldControl(event)
    ) {
      return;
    }

    const localX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const localY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    const ndcX = localX * 2 - 1;
    const ndcY = 1 - localY * 2;
    const now = window.performance.now() * 0.001;
    if (pointer.lastHoverNdcX === null || pointer.lastHoverNdcY === null) {
      pointer.lastHoverNdcX = ndcX;
      pointer.lastHoverNdcY = ndcY;
      pointer.lastHoverTime = now;
      return;
    }

    const ndcDistance = Math.hypot(ndcX - pointer.lastHoverNdcX, ndcY - pointer.lastHoverNdcY);
    const elapsed = now - pointer.lastHoverTime;
    if (elapsed < RIPPLE_HOVER_MIN_INTERVAL || ndcDistance < RIPPLE_HOVER_MIN_NDC_DISTANCE) {
      return;
    }

    const pointerSpeed = ndcDistance / Math.max(elapsed, 1 / 120);
    const strength = clamp(
      RIPPLE_HOVER_STRENGTH + pointerSpeed * 0.018,
      RIPPLE_HOVER_STRENGTH,
      RIPPLE_HOVER_MAX_STRENGTH,
    );
    const radius = clamp(
      RIPPLE_HOVER_RADIUS + pointerSpeed * 0.08,
      RIPPLE_HOVER_RADIUS,
      RIPPLE_HOVER_MAX_RADIUS,
    );
    if (queuePointerRipple(event, "hover", strength, radius)) {
      pointer.lastHoverNdcX = ndcX;
      pointer.lastHoverNdcY = ndcY;
      pointer.lastHoverTime = now;
    }
  });
  stage.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.targetX = 0;
    pointer.targetY = 0;
    pointer.lastHoverNdcX = null;
    pointer.lastHoverNdcY = null;
    pointer.lastHoverTime = -Infinity;
    rippleState.hasHoverPoint = false;
  });
  stage.addEventListener("pointerdown", (event) => {
    if (isWorldControl(event)) return;
    pointer.impact = 1;
    const bounds = stage.getBoundingClientRect();
    const localX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const localY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    pointer.lastHoverNdcX = localX * 2 - 1;
    pointer.lastHoverNdcY = 1 - localY * 2;
    pointer.lastHoverTime = window.performance.now() * 0.001;
    rippleState.hasHoverPoint = false;
    queuePointerRipple(event, "click", RIPPLE_CLICK_STRENGTH, RIPPLE_CLICK_RADIUS);
    stage.classList.remove("is-world-pulsing");
    void stage.offsetWidth;
    stage.classList.add("is-world-pulsing");
  });

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.75;
    rippleField = createRippleField(renderer);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1200);
    camera.position.set(0, 11, 18);
    camera.lookAt(0, 0, 0);
    raycaster = new THREE.Raycaster();

    sky = new Sky();
    sky.scale.setScalar(10000);
    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 2.4;
    skyUniforms.rayleigh.value = 1.7;
    skyUniforms.mieCoefficient.value = 0.003;
    skyUniforms.mieDirectionalG.value = 0.77;
    skyUniforms.sunPosition.value.set(-0.35, 0.65, 0.68).normalize().multiplyScalar(450);
    skyUniforms.showSunDisc.value = false;
    sky.visible = false;
    scene.add(sky);

    waterNormals = new THREE.TextureLoader().load(
      WATER_NORMALS_URL,
      () => {
        waterNormalMapState = "ready";
        stage.dataset.worldWaterNormalMap = waterNormalMapState;
        if (reducedMotion && webglWaterAvailable) draw(window.performance.now());
      },
      undefined,
      () => {
        waterNormalMapState = "unavailable";
        stage.dataset.worldWaterNormalMap = waterNormalMapState;
        if (reducedMotion && webglWaterAvailable) draw(window.performance.now());
      },
    );
    waterNormals.wrapS = THREE.RepeatWrapping;
    waterNormals.wrapT = THREE.RepeatWrapping;
    waterNormals.colorSpace = THREE.NoColorSpace;
    water = new Water(new THREE.PlaneGeometry(180, 240, 180, 240), {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(-0.35, 0.65, 0.68).normalize(),
      sunColor: 0xccecff,
      waterColor: 0x0b5f9c,
      distortionScale: 2.2,
      alpha: 0.58,
      fog: false,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.42, -46);
    water.material.transparent = true;
    water.material.depthWrite = false;
    water.material.uniforms.size.value = 1.25;
    water.material.uniforms.rippleWaveTime = { value: 0 };
    water.material.uniforms.rippleImpacts = {
      value: Array.from({ length: RIPPLE_SLOT_COUNT }, () => new THREE.Vector4(0, 0, -1000, 0)),
    };
    water.material.onBeforeCompile = (shader) => {
      shader.uniforms.rippleHeightMap = { value: rippleField.texture };
      shader.uniforms.rippleWorldSize = { value: RIPPLE_WORLD_SIZE };
      shader.uniforms.rippleWorldMin = { value: RIPPLE_WORLD_MIN };
      shader.uniforms.rippleHeightRange = { value: RIPPLE_HEIGHT_RANGE };
      shader.vertexShader = shader.vertexShader.replace(
        "uniform float time;",
        `uniform float time;
        uniform sampler2D rippleHeightMap;
        uniform vec2 rippleWorldSize;
        uniform vec2 rippleWorldMin;
        uniform float rippleHeightRange;`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "mirrorCoord = modelMatrix * vec4( position, 1.0 );",
        `vec3 ripplePosition = position;
        vec3 baseWorldPosition = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
        vec2 surfaceCoordinate = vec2( baseWorldPosition.x, -baseWorldPosition.z );
        vec2 rippleUv = ( surfaceCoordinate - rippleWorldMin ) / rippleWorldSize;
        ripplePosition.z += texture2D( rippleHeightMap, clamp( rippleUv, vec2( 0.001 ), vec2( 0.999 ) ) ).r * rippleHeightRange;
        mirrorCoord = modelMatrix * vec4( ripplePosition, 1.0 );`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "modelViewMatrix * vec4( position, 1.0 )",
        "modelViewMatrix * vec4( ripplePosition, 1.0 )",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "uniform float distortionScale;",
        `uniform float distortionScale;
        uniform sampler2D rippleHeightMap;
        uniform vec2 rippleWorldSize;
        uniform vec2 rippleWorldMin;
        uniform float rippleHeightRange;`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "uniform float distortionScale;",
        `uniform float distortionScale;
        uniform float rippleWaveTime;
        uniform vec4 rippleImpacts[${RIPPLE_SLOT_COUNT}];`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );",
        `vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );
        vec2 rippleCoordinate = vec2( worldPosition.x, -worldPosition.z );
        vec2 rippleUv = ( rippleCoordinate - rippleWorldMin ) / rippleWorldSize;
        vec4 rippleField = texture2D( rippleHeightMap, clamp( rippleUv, vec2( 0.001 ), vec2( 0.999 ) ) );
        vec2 rippleSlope = rippleField.ba * rippleHeightRange;
        float rippleCrestLight = 0.0;
        for ( int index = 0; index < ${RIPPLE_SLOT_COUNT}; index += 1 ) {
          vec4 impact = rippleImpacts[ index ];
          float age = rippleWaveTime - impact.z;
          if ( age >= 0.0 && age < 2.8 && impact.w > 0.0 ) {
            vec2 rippleDelta = ( rippleUv - impact.xy ) * rippleWorldSize;
            float distanceToImpact = length( rippleDelta );
          float waveFront = distanceToImpact - age * 1.4;
          float envelope = exp( -waveFront * waveFront * 2.4 ) * exp( -age * 0.9 );
          float wave = sin( waveFront * 4.2 ) * envelope * impact.w * 0.14;
            rippleSlope += rippleDelta / max( distanceToImpact, 0.001 ) * wave;
            float crest = exp( -waveFront * waveFront * 2.2 ) * exp( -age * 1.1 ) * impact.w;
            rippleCrestLight = max( rippleCrestLight, crest );
          }
        }
        surfaceNormal = normalize( surfaceNormal + vec3( -rippleSlope.x, 0.0, rippleSlope.y ) * 5.5 );`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec3 outgoingLight = albedo;",
        `vec3 outgoingLight = albedo;
        float rippleCrest = smoothstep( 0.012, 0.065, length( rippleSlope ) );
        float rippleFacingSun = max( 0.0, dot( surfaceNormal, normalize( sunDirection ) ) );
        outgoingLight += sunColor * rippleCrest * rippleFacingSun * 0.42;
        outgoingLight += sunColor * rippleCrestLight * 1.25;`,
      );
      stage.dataset.worldRippleShader =
        shader.vertexShader.includes("ripplePosition.z +=") &&
        shader.fragmentShader.includes("rippleSlope = rippleField.ba") &&
        shader.fragmentShader.includes("rippleCrest = smoothstep") &&
        shader.fragmentShader.includes("float waveFront = distanceToImpact") &&
        shader.fragmentShader.includes("rippleCrestLight * 1.25")
          ? "threejs-water-displacement-and-normal-map"
          : "threejs-water-patch-missing";
    };
    scene.add(water);
    const waterRender = water.onBeforeRender;
    water.onBeforeRender = function (targetRenderer, targetScene, targetCamera) {
      const wasVisible = sky.visible;
      sky.visible = true;
      try {
        return waterRender.call(this, targetRenderer, targetScene, targetCamera);
      } finally {
        sky.visible = wasVisible;
      }
    };
    stage.dataset.worldSurfaceProfile = waterVideoElement
      ? "threejs-water-addon-over-licensed-moving-water"
      : "threejs-water-addon-over-open-ocean-horizon";
    stage.dataset.worldWaterNormalMap = waterNormalMapState;
    stage.dataset.worldWaterTexture = waterVideoElement
      ? waterVideoElement.readyState >= 2
        ? "ready"
        : "loading"
      : "not-used";
  } catch {
    renderer?.dispose();
    water?.material?.uniforms?.mirrorSampler?.value?.dispose?.();
    water?.geometry?.dispose();
    water?.material?.dispose();
    waterNormals?.dispose();
    sky?.geometry?.dispose();
    sky?.material?.dispose();
    rippleField?.targets.forEach((target) => target.dispose());
    rippleField?.simulationMaterial.dispose();
    rippleField?.simulationScene.traverse((object) => object.geometry?.dispose());
    setFallbackState();
    return;
  }

  webglWaterAvailable = true;
  setWebglWaterState();
  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * WORLD_RENDER_SCALE;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    rippleField.simulationMaterial.uniforms.rippleWorldSize.value.copy(RIPPLE_WORLD_SIZE);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  }

  function setRippleTexture(texture) {
    rippleField.texture = texture;
    if (water?.material?.uniforms?.rippleHeightMap) {
      water.material.uniforms.rippleHeightMap.value = texture;
    }
  }

  function clearRippleTargets() {
    const previousRenderTarget = renderer.getRenderTarget();
    rippleField.targets.forEach((target) => {
      renderer.setRenderTarget(target);
      renderer.clear();
    });
    renderer.setRenderTarget(previousRenderTarget);
    rippleField.currentIndex = 0;
    setRippleTexture(rippleField.targets[0].texture);
  }

  function updateRippleImpactUniforms(impacts) {
    const uniforms = rippleField.simulationMaterial.uniforms.rippleImpacts.value;
    for (let index = 0; index < RIPPLE_SLOT_COUNT; index += 1) {
      const impact = impacts[index];
      uniforms[index].set(
        impact?.x ?? 0,
        impact?.y ?? 0,
        impact?.strength ?? 0,
        impact?.radius ?? 0,
      );
    }
  }

  function updateRippleHoverUniform(seconds) {
    const hover = rippleField.hoverImpact;
    const hoverUniform = rippleField.simulationMaterial.uniforms.rippleHover.value;
    const directionUniform = rippleField.simulationMaterial.uniforms.rippleHoverDirection.value;
    const travelUniform = rippleField.simulationMaterial.uniforms.rippleHoverTravel;
    if (!hover || seconds >= hover.until) {
      rippleField.hoverImpact = null;
      hoverUniform.set(0, 0, 0, 0);
      directionUniform.set(0, 0);
      travelUniform.value = 0;
      return;
    }
    const fade = clamp((hover.until - seconds) / RIPPLE_HOVER_LIFETIME, 0, 1);
    hoverUniform.set(hover.x, hover.y, hover.strength * fade, hover.radius);
    directionUniform.set(hover.directionX, hover.directionY);
    travelUniform.value = hover.travel;
  }

  function advanceRippleField(deltaSeconds) {
    if (
      reducedMotion ||
      deltaSeconds <= 0 ||
      rippleState.count === 0 ||
      (!rippleField.active && rippleField.pendingImpacts.length === 0)
    )
      return;

    const stepSeconds = clamp(deltaSeconds, RIPPLE_TIME_STEP * 0.25, 0.05);
    const passes = Math.min(
      4,
      Math.max(1, rippleField.warmupSteps > 0 ? 3 : Math.round(stepSeconds / RIPPLE_TIME_STEP)),
    );
    for (let pass = 0; pass < passes; pass += 1) {
      const currentTarget = rippleField.targets[rippleField.currentIndex];
      const nextIndex = 1 - rippleField.currentIndex;
      const nextTarget = rippleField.targets[nextIndex];
      updateRippleImpactUniforms(pass === 0 ? rippleField.pendingImpacts : []);
      rippleField.simulationMaterial.uniforms.rippleTimeStep.value = RIPPLE_TIME_STEP;
      rippleField.simulationMaterial.uniforms.rippleHeightMap.value = currentTarget.texture;
      renderer.setRenderTarget(nextTarget);
      renderer.render(rippleField.simulationScene, rippleField.simulationCamera);
      renderer.setRenderTarget(null);
      rippleField.currentIndex = nextIndex;
      setRippleTexture(nextTarget.texture);
      rippleField.steps += 1;
      stage.dataset.worldRippleSteps = String(rippleField.steps);
    }
    rippleField.pendingImpacts.length = 0;
    rippleField.warmupSteps = Math.max(0, rippleField.warmupSteps - 1);
    rippleField.peak *= Math.exp(-0.58 * stepSeconds);
    stage.dataset.worldRipplePeak = rippleField.peak.toFixed(4);
    if (rippleField.peak < 0.0005) {
      rippleField.quietFrames += 1;
      if (rippleField.quietFrames > 18) {
        clearRippleTargets();
        rippleField.active = false;
        rippleField.quietFrames = 0;
        rippleField.peak = 0;
        stage.dataset.worldRipplePeak = "0.0000";
      }
    } else {
      rippleField.quietFrames = 0;
    }
  }

  function commitPendingRipple(seconds) {
    if (!rippleState.pending.length || !rippleField) return;

    const pending = rippleState.pending.splice(0);
    let committed = 0;
    for (const pointerHit of pending) {
      const isHoverRipple = pointerHit.type === "hover";
      raycaster.setFromCamera(new THREE.Vector2(pointerHit.x, pointerHit.y), camera);
      const waterHit = raycaster.intersectObject(water, false)[0];
      if (!waterHit) continue;
      const rippleUv = new THREE.Vector2(
        clamp((waterHit.point.x - RIPPLE_WORLD_MIN.x) / RIPPLE_WORLD_SIZE.x, 0, 1),
        clamp((-waterHit.point.z - RIPPLE_WORLD_MIN.y) / RIPPLE_WORLD_SIZE.y, 0, 1),
      );
      const ripplePoint = new THREE.Vector2(
        (rippleUv.x - 0.5) * RIPPLE_WORLD_SIZE.x,
        (rippleUv.y - 0.5) * RIPPLE_WORLD_SIZE.y,
      );
      if (
        isHoverRipple &&
        rippleState.hasHoverPoint &&
        ripplePoint.distanceTo(rippleState.hoverPoint) < RIPPLE_HOVER_MIN_WORLD_DISTANCE
      ) {
        continue;
      }

      const impactStrength = pointerHit.strength ?? RIPPLE_CLICK_STRENGTH;
      const impactRadius = pointerHit.radius ?? RIPPLE_CLICK_RADIUS;
      const hoverDirection = new THREE.Vector2();
      const hoverTravel =
        isHoverRipple && rippleState.hasHoverPoint
          ? ripplePoint.distanceTo(rippleState.hoverPoint)
          : 0;
      if (isHoverRipple && rippleState.hasHoverPoint) {
        const direction = ripplePoint.clone().sub(rippleState.hoverPoint);
        if (direction.lengthSq() > 0.000001) hoverDirection.copy(direction.normalize());
      }

      const slot = rippleState.nextSlot;
      const start = seconds;
      rippleState.centers[slot].copy(rippleUv);
      rippleState.starts[slot] = start;
      rippleState.strengths[slot] = impactStrength;
      rippleState.nextSlot = (slot + 1) % RIPPLE_SLOT_COUNT;
      rippleState.lastSlot = slot;
      rippleState.lastStart = start;
      rippleState.count += 1;
      if (isHoverRipple) {
        rippleState.hoverPoint.copy(ripplePoint);
        rippleState.hasHoverPoint = true;
        rippleState.hoverCount += 1;
      } else {
        rippleState.clickCount += 1;
      }

      if (isHoverRipple) {
        rippleField.hoverImpact = {
          x: rippleUv.x,
          y: rippleUv.y,
          strength: impactStrength,
          radius: impactRadius,
          until: seconds + RIPPLE_HOVER_LIFETIME,
          directionX: hoverDirection.x,
          directionY: hoverDirection.y,
          travel: Math.min(hoverTravel, RIPPLE_HOVER_MAX_RADIUS * 2.5),
        };
      } else {
        rippleField.pendingImpacts.push({
          x: rippleUv.x,
          y: rippleUv.y,
          strength: impactStrength,
          radius: impactRadius,
        });
        rippleField.pendingImpacts.splice(
          0,
          Math.max(0, rippleField.pendingImpacts.length - RIPPLE_SLOT_COUNT),
        );
      }
      rippleField.active = true;
      rippleField.warmupSteps = Math.max(rippleField.warmupSteps, 2);
      rippleField.quietFrames = 0;
      rippleField.peak = Math.max(rippleField.peak, impactStrength * 0.9);
      stage.dataset.worldRippleCount = String(rippleState.count);
      stage.dataset.worldRippleClickCount = String(rippleState.clickCount);
      stage.dataset.worldRippleHoverCount = String(rippleState.hoverCount);
      stage.dataset.worldRippleLastType = isHoverRipple ? "hover" : "click";
      stage.dataset.worldRippleInput = isHoverRipple
        ? "raycast-gpu-water-hover"
        : "raycast-gpu-water-click";
      stage.dataset.worldRippleLastSlot = String(slot);
      stage.dataset.worldRippleState = [
        rippleState.count,
        slot,
        start.toFixed(3),
        rippleUv.x.toFixed(3) + "," + rippleUv.y.toFixed(3),
      ].join("|");
      stage.dataset.worldRipplePeak = rippleField.peak.toFixed(4);
      committed += 1;
    }

    stage.dataset.worldRippleQueued = "false";
    if (committed === 0) stage.dataset.worldRippleState = "idle";
  }
  function draw(time) {
    const seconds = time * 0.001;
    pointer.x += (pointer.targetX - pointer.x) * (reducedMotion ? 1 : 0.055);
    pointer.y += (pointer.targetY - pointer.y) * (reducedMotion ? 1 : 0.055);
    if (!reducedMotion) pointer.impact *= 0.94;
    const pointerDistance = Math.hypot(pointer.x, pointer.y);
    pointerStrength = reducedMotion
      ? 0
      : clamp(pointer.active ? 0.2 + pointerDistance * 1.25 : 0, 0, 1);
    const pointerIntensity = clamp(pointerStrength * 0.48, 0, 1);

    stage.style.setProperty("--world-pointer-x", (pointer.x + 0.5) * 100 + "%");
    stage.style.setProperty("--world-pointer-y", (0.5 - pointer.y) * 100 + "%");
    stage.style.setProperty("--world-pointer-intensity", pointerIntensity.toFixed(3));
    stage.style.setProperty("--water-ripple-strength", pointerStrength.toFixed(3));
    stage.style.setProperty("--world-image-shift-x", "0px");
    stage.style.setProperty("--world-image-shift-y", "0px");
    stage.style.setProperty("--world-image-tilt-x", "0deg");
    stage.style.setProperty("--world-image-tilt-y", "0deg");

    const deltaSeconds =
      rippleField.lastTime === null ? 0 : clamp(seconds - rippleField.lastTime, 0, 0.05);
    rippleField.lastTime = seconds;
    commitPendingRipple(seconds);
    updateRippleHoverUniform(seconds);
    advanceRippleField(deltaSeconds);

    const hasVideoFrame =
      waterVideoElement && waterVideoElement.readyState >= 2 && waterVideoElement.videoWidth > 0;
    if (hasVideoFrame) {
      stage.dataset.worldWaterTexture = "ready";
      stage.classList.add("is-threejs-water");
    }

    water.material.uniforms.time.value = reducedMotion ? 0 : seconds;
    water.material.uniforms.rippleWaveTime.value = reducedMotion ? 0 : seconds;
    const shaderImpacts = water.material.uniforms.rippleImpacts.value;
    for (let index = 0; index < RIPPLE_SLOT_COUNT; index += 1) {
      shaderImpacts[index].set(
        rippleState.centers[index].x,
        rippleState.centers[index].y,
        rippleState.starts[index],
        rippleState.strengths[index],
      );
    }
    stage.dataset.worldWaterNormalMap = waterNormalMapState;
    renderer.render(scene, camera);
    stage.dataset.worldGpuRender =
      renderer.info.render.calls + "|" + renderer.info.render.triangles;

    stage.dataset.worldAnimationTime = Math.round(time) + "";
    stage.dataset.worldWaterState =
      Math.round(time) +
      "|" +
      pointer.x.toFixed(3) +
      "," +
      pointer.y.toFixed(3) +
      "|" +
      pointerStrength.toFixed(3);
    stage.dataset.worldWaterPhase = (seconds * 0.45).toFixed(3);
    stage.dataset.worldPointerRipple = pointerStrength.toFixed(3);
    stage.dataset.worldRippleRadius =
      rippleState.lastSlot < 0 || reducedMotion
        ? "0.000"
        : (Math.max(0, seconds - rippleState.lastStart) * 6.2).toFixed(3);
    if (waterVideoElement) {
      stage.dataset.worldVideoTime = waterVideoElement.currentTime.toFixed(3);
    }
  }
  function loop(time) {
    animationFrame = 0;
    if (!isVisible || document.hidden) return;
    draw(time);
    if (!reducedMotion) animationFrame = window.requestAnimationFrame(loop);
  }

  function start() {
    if (!isVisible || document.hidden) return;
    if (reducedMotion) {
      loop(Date.now());
      return;
    }
    if (!animationFrame) animationFrame = window.requestAnimationFrame(loop);
  }

  if (coordinatesElement) coordinatesElement.textContent = "TIDE 03 / 770";
  if (speedElement) speedElement.textContent = "WAVE";
  if (targetLabelElement) targetLabelElement.textContent = landmarks[0].label;
  locationButtons.forEach((button, id) =>
    button.classList.toggle("is-active", id === selectedTarget),
  );

  const observer = window.ResizeObserver ? new window.ResizeObserver(resize) : null;
  observer?.observe(stage);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window) {
    const visibilityObserver = new window.IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(stage);
  }

  stage.classList.add("world-ready");
  resize();
  start();
}
