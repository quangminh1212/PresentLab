import * as THREE from "../vendor/three/three.module.js";
import { Sky } from "../vendor/three/addons/objects/Sky.js";
import { Water } from "../vendor/three/addons/objects/Water.js";

const MAX_PIXEL_RATIO = 2;
const WORLD_RENDER_SCALE = 0.82;
const WATER_NORMALS_URL = "/web/vendor/three/textures/waternormals.jpg";
const RIPPLE_SLOT_COUNT = 4;
const RIPPLE_SPEED = 0.18;
const RIPPLE_GRID_SIZE = 256;
const RIPPLE_SURFACE_SEGMENTS = 180;
const RIPPLE_WORLD_MIN = new THREE.Vector2(-90, -166);
const RIPPLE_WORLD_SIZE = new THREE.Vector2(180, 240);
const RIPPLE_HEIGHT_RANGE = 0.36;
const RIPPLE_TIME_STEP = 1 / 60;
const RIPPLE_DAMPING = 0.012;
const RIPPLE_PENDING_LIMIT = 12;
const RIPPLE_HOVER_MIN_INTERVAL = 0.075;
const RIPPLE_HOVER_MIN_NDC_DISTANCE = 0.012;
const RIPPLE_HOVER_MIN_WORLD_DISTANCE = 1.35;
const RIPPLE_HOVER_STRENGTH = 0.17;
const RIPPLE_HOVER_MAX_STRENGTH = 0.25;
const RIPPLE_HOVER_RADIUS = 1.6;
const RIPPLE_HOVER_MAX_RADIUS = 2.2;
const RIPPLE_HOVER_LIFETIME = 0.22;
const RIPPLE_CLICK_STRENGTH = 0.24;
const RIPPLE_CLICK_RADIUS = 2.2;

const AMBIENT_WAVE_GLSL = `
float sampleAmbientWaveHeight( vec2 position ) {
  float height = 0.0;
  height += 0.105 * sin( dot( position, normalize( vec2( 0.82, 0.18 ) ) ) * 0.22 + rippleWaveTime * 0.46 );
  height += 0.050 * sin( dot( position, normalize( vec2( -0.28, 0.96 ) ) ) * 0.39 + rippleWaveTime * 0.68 + 1.7 );
  height += 0.022 * sin( dot( position, normalize( vec2( 0.62, -0.78 ) ) ) * 0.78 + rippleWaveTime * 1.02 + 3.1 );
  return height;
}

vec2 sampleAmbientWaveSlope( vec2 position ) {
  vec2 slope = vec2( 0.0 );
  vec2 direction = normalize( vec2( 0.82, 0.18 ) );
  float frequency = 0.22;
  slope += direction * ( 0.105 * frequency ) * cos( dot( position, direction ) * frequency + rippleWaveTime * 0.46 );
  direction = normalize( vec2( -0.28, 0.96 ) );
  frequency = 0.39;
  slope += direction * ( 0.050 * frequency ) * cos( dot( position, direction ) * frequency + rippleWaveTime * 0.68 + 1.7 );
  direction = normalize( vec2( 0.62, -0.78 ) );
  frequency = 0.78;
  slope += direction * ( 0.022 * frequency ) * cos( dot( position, direction ) * frequency + rippleWaveTime * 1.02 + 3.1 );
  return slope;
}
`;

/*
 * The surface is the official Three.js Water addon, vendored under web/vendor
 * with its MIT license. This file only connects that existing scene to the
 * portal camera, pointer state, and lifecycle. A small compile-time normal
 * blend is applied to the addon material so its open-ocean defaults read as a
 * calmer lake surface at this camera distance.
 */
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
        velocity += laplacian * rippleSpeed * frameScale;
        velocity *= exp(-rippleDamping * frameScale);
        float nextHeight = center + velocity * frameScale;

        for (int index = 0; index < ${RIPPLE_SLOT_COUNT}; index += 1) {
          vec4 impact = rippleImpacts[index];
          if (impact.w <= 0.0) continue;
          vec2 worldDelta = (rippleUv - impact.xy) * rippleWorldSize;
          float distanceToImpact = length(worldDelta);
          float radius = max(impact.w, 0.001);
          float contact = clamp(1.0 - distanceToImpact / radius, 0.0, 1.0);
          contact = 0.5 - 0.5 * cos(contact * 3.14159265);
          contact *= clamp(
            1.0 +
              0.045 * sin(worldDelta.x * 0.52 + worldDelta.y * 0.31) +
              0.03 * sin(worldDelta.x * 0.21 - worldDelta.y * 0.39),
            0.9,
            1.1
          );
          nextHeight -= impact.z * contact * 0.07;
          velocity -= impact.z * contact * 0.36;
        }

        if (rippleHover.z > 0.0 && rippleHover.w > 0.0) {
          vec2 hoverDelta = (rippleUv - rippleHover.xy) * rippleWorldSize;
          float hoverDistance = length(hoverDelta);
          float hoverContact = clamp(1.0 - hoverDistance / rippleHover.w, 0.0, 1.0);
          hoverContact = 0.5 - 0.5 * cos(hoverContact * 3.14159265);
          float directionLength = length(rippleHoverDirection);
          float directionalBias = directionLength > 0.001
            ? dot(hoverDelta / max(hoverDistance, 0.001), rippleHoverDirection / directionLength)
            : 0.0;
          hoverContact *= clamp(1.0 + directionalBias * 0.18, 0.82, 1.18);
          nextHeight -= rippleHover.z * hoverContact * 0.016;
          velocity -= rippleHover.z * hoverContact * 0.09;
        }

        float edgeDistance = min(
          min(rippleUv.x, 1.0 - rippleUv.x),
          min(rippleUv.y, 1.0 - rippleUv.y)
        );
        velocity *= mix(0.78, 1.0, smoothstep(0.0, 0.1, edgeDistance));

        if (center != center || velocity != velocity) {
          center = 0.0;
          velocity = 0.0;
        }
        nextHeight = clamp(nextHeight, -0.5, 0.5);
        if (nextHeight != nextHeight) nextHeight = 0.0;
        gl_FragColor = vec4(nextHeight, velocity, 0.0, 1.0);
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
    uniforms: null,
  };
  let rippleField;
  const waterVideoElement = stage.querySelector("[data-world-water-video]");
  const imageElement = stage.querySelector(".world-space-image");
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
  let webglWaterAvailable = false;
  let renderer;
  let scene;
  let camera;
  let raycaster;
  let sky;
  let water;
  let cameraTarget;
  let desiredCameraPosition;
  let desiredCameraTarget;

  const setFallbackState = () => {
    if (videoWaterReady) return;
    stage.dataset.worldRenderMode = "css-fallback";
    stage.dataset.worldShading = "water-css-fallback";
    stage.dataset.worldSurface = "css-water-fallback";
    stage.dataset.worldInteraction = "pointer-parallax-overlay";
    stage.dataset.worldRippleProvider = "css-fallback";
    stage.classList.add("world-fallback", "world-ready");
  };

  const setWebglWaterState = () => {
    videoWaterReady = false;
    waterVideoElement?.pause();
    stage.classList.remove("is-video-water", "world-fallback");
    stage.dataset.worldVideoState = waterVideoElement ? "standby" : "unavailable";
    stage.dataset.worldRenderMode = "webgl-water-3d";
    stage.dataset.worldShading = "threejs-water-addon";
    stage.dataset.worldSurface = "official-water-module";
    stage.dataset.worldInteraction = "pointer-camera-ripple";
    stage.dataset.worldWaterProvider = "threejs-official-water";
    stage.dataset.worldRippleProvider = "threejs-gpu-heightfield";
    stage.dataset.worldRippleMode = "gpu-heightfield-pingpong";
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
    stage.dataset.worldRippleInput ||= "gpu-raycast";
  };

  const setVideoWaterState = (ready) => {
    if (ready && webglWaterAvailable) {
      setWebglWaterState();
      return;
    }
    videoWaterReady = ready;
    stage.classList.toggle("is-video-water", ready);
    stage.dataset.worldVideoState = ready ? "playing" : "fallback";
    if (ready) {
      stage.classList.add("world-ready");
      stage.classList.remove("world-fallback");
      stage.dataset.worldRenderMode = "video-water-fallback";
      stage.dataset.worldShading = "captured-water-loop";
      stage.dataset.worldSurface = "licensed-video-loop";
      stage.dataset.worldInteraction = "pointer-parallax-overlay";
    } else if (webglWaterAvailable) {
      setWebglWaterState();
    } else {
      setFallbackState();
    }
  };

  const activateVideoWater = () => {
    if (!waterVideoElement) return;
    if (webglWaterAvailable) {
      setWebglWaterState();
      return;
    }
    waterVideoElement.muted = true;
    setVideoWaterState(true);
    if (reducedMotion) {
      waterVideoElement.pause();
      return;
    }
    const playback = waterVideoElement.play();
    playback?.catch(() => setVideoWaterState(false));
  };

  if (waterVideoElement) {
    stage.dataset.worldVideoState = "loading";
    waterVideoElement.addEventListener("loadedmetadata", activateVideoWater, { once: true });
    waterVideoElement.addEventListener("error", () => setVideoWaterState(false));
    waterVideoElement.addEventListener("timeupdate", () => {
      stage.dataset.worldVideoTime = waterVideoElement.currentTime.toFixed(3);
    });
    if (waterVideoElement.readyState >= 1) activateVideoWater();
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
    renderer.toneMappingExposure = 0.1;
    rippleField = createRippleField(renderer);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x6c8f94, 38, 188);
    camera = new THREE.PerspectiveCamera(47, 1, 0.1, 320);
    raycaster = new THREE.Raycaster();
    camera.position.set(0, 7.8, 15);
    cameraTarget = new THREE.Vector3(0, -0.2, -46);
    desiredCameraPosition = new THREE.Vector3();
    desiredCameraTarget = new THREE.Vector3();

    const sunDirection = new THREE.Vector3(0.34, 0.4, -0.85).normalize();
    sky = new Sky();
    sky.scale.setScalar(10000);
    sky.renderOrder = -2;
    scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 1.7;
    skyUniforms.rayleigh.value = 1.45;
    skyUniforms.mieCoefficient.value = 0.0011;
    skyUniforms.mieDirectionalG.value = 0.7;
    skyUniforms.cloudCoverage.value = 0.28;
    skyUniforms.cloudDensity.value = 0.26;
    skyUniforms.cloudElevation.value = 0.58;
    skyUniforms.cloudSpeed.value = 0.000012;
    skyUniforms.showSunDisc.value = 0;
    skyUniforms.sunPosition.value.copy(sunDirection).multiplyScalar(450);
    stage.dataset.worldSkyProvider = "threejs-official-sky";
    stage.dataset.worldSkyProfile = "hazy-lake-daylight";

    const shorelineShape = new THREE.Shape();
    shorelineShape.moveTo(-112, -4.2);
    for (let index = 0; index <= 22; index += 1) {
      const x = -112 + index * 10;
      const y =
        0.24 +
        Math.sin(index * 0.67) * 0.28 +
        Math.sin(index * 1.71) * 0.14 +
        Math.sin(index * 0.19) * 0.3;
      shorelineShape.lineTo(x, y);
    }
    shorelineShape.lineTo(112, -4.2);
    shorelineShape.closePath();
    const shoreline = new THREE.Mesh(
      new THREE.ShapeGeometry(shorelineShape),
      new THREE.MeshBasicMaterial({
        color: 0x315e57,
        fog: true,
        opacity: 0.24,
        transparent: true,
        depthWrite: false,
      }),
    );
    shoreline.position.z = -128;
    shoreline.renderOrder = -1;
    scene.add(shoreline);

    const waterNormals = new THREE.TextureLoader().load(
      WATER_NORMALS_URL,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.NoColorSpace;
        stage.dataset.worldWaterTexture = "ready";
      },
      undefined,
      () => {
        stage.dataset.worldWaterTexture = "error";
      },
    );
    stage.dataset.worldWaterTexture = "loading";

    water = new Water(
      new THREE.PlaneGeometry(180, 240, RIPPLE_SURFACE_SEGMENTS, RIPPLE_SURFACE_SEGMENTS),
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals,
        sunDirection,
        sunColor: 0xfff2d3,
        waterColor: 0x0c414c,
        distortionScale: 3.6,
        alpha: 0.98,
        fog: true,
      },
    );
    water.material.uniforms.rippleWaveTime = { value: 0 };
    water.material.uniforms.rippleHeightMap = { value: rippleField.texture };
    water.material.uniforms.rippleHeightBounds = {
      value: new THREE.Vector4(
        RIPPLE_WORLD_MIN.x,
        RIPPLE_WORLD_MIN.y,
        RIPPLE_WORLD_SIZE.x,
        RIPPLE_WORLD_SIZE.y,
      ),
    };
    water.material.uniforms.rippleHeightTexel = {
      value: new THREE.Vector2(1 / RIPPLE_GRID_SIZE, 1 / RIPPLE_GRID_SIZE),
    };
    water.material.onBeforeCompile = (shader) => {
      rippleState.uniforms = shader.uniforms;
      shader.vertexShader = shader.vertexShader.replace(
        "uniform mat4 textureMatrix;",
        `uniform mat4 textureMatrix;
uniform sampler2D rippleHeightMap;
uniform vec4 rippleHeightBounds;
uniform float rippleWaveTime;
${AMBIENT_WAVE_GLSL}

float sampleRippleVertexHeight( vec2 position ) {
  vec2 uv = clamp(
    ( position - rippleHeightBounds.xy ) / rippleHeightBounds.zw,
    0.0,
    1.0
  );
  return texture2D( rippleHeightMap, uv ).r * ${RIPPLE_HEIGHT_RANGE.toFixed(2)} + sampleAmbientWaveHeight( position );
}`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "mirrorCoord = modelMatrix * vec4( position, 1.0 );\n\t\t\t\t\tworldPosition = mirrorCoord.xyzw;",
        `vec3 ripplePosition = position;
  vec3 rippleWorldPosition = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
  ripplePosition.z += sampleRippleVertexHeight( rippleWorldPosition.xz );
  mirrorCoord = modelMatrix * vec4( ripplePosition, 1.0 );
  worldPosition = mirrorCoord.xyzw;`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );",
        "vec4 mvPosition =  modelViewMatrix * vec4( ripplePosition, 1.0 );",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "uniform vec3 waterColor;",
        `uniform vec3 waterColor;
uniform sampler2D rippleHeightMap;
uniform vec4 rippleHeightBounds;
uniform vec2 rippleHeightTexel;
uniform float rippleWaveTime;
${AMBIENT_WAVE_GLSL}

float sampleRippleHeight( vec2 position ) {
  vec2 uv = clamp(
    ( position - rippleHeightBounds.xy ) / rippleHeightBounds.zw,
    0.0,
    1.0
  );
  return texture2D( rippleHeightMap, uv ).r * ${RIPPLE_HEIGHT_RANGE.toFixed(2)};
}`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );",
        `vec3 surfaceNormal = normalize( mix( vec3( 0.0, 1.0, 0.0 ), noise.xzy * vec3( 1.5, 1.0, 1.5 ), 0.3 ) );
  vec2 rippleStep = rippleHeightTexel * rippleHeightBounds.zw;
  float rippleCenter = sampleRippleHeight( worldPosition.xz );
  float rippleLeft = sampleRippleHeight( worldPosition.xz - vec2( rippleStep.x, 0.0 ) );
  float rippleRight = sampleRippleHeight( worldPosition.xz + vec2( rippleStep.x, 0.0 ) );
  float rippleBack = sampleRippleHeight( worldPosition.xz - vec2( 0.0, rippleStep.y ) );
  float rippleFront = sampleRippleHeight( worldPosition.xz + vec2( 0.0, rippleStep.y ) );
  vec2 rippleGradient = vec2(
    ( rippleRight - rippleLeft ) / ( 2.0 * rippleStep.x ),
    ( rippleFront - rippleBack ) / ( 2.0 * rippleStep.y )
  );
  vec2 ambientSlope = sampleAmbientWaveSlope( worldPosition.xz );
  vec4 microNoiseSample =
    texture2D( normalSampler, worldPosition.xz * 0.082 + vec2( rippleWaveTime * 0.008, -rippleWaveTime * 0.011 ) ) +
    texture2D( normalSampler, worldPosition.xz * 0.137 - vec2( rippleWaveTime * 0.006, rippleWaveTime * 0.009 ) );
  vec3 microNormal = normalize( ( microNoiseSample.xzy - 1.0 ) * vec3( 1.15, 0.42, 1.15 ) );
  float rippleCurvature =
    ( rippleLeft + rippleRight + rippleBack + rippleFront - rippleCenter * 4.0 ) /
    ( rippleStep.x * rippleStep.y );
  float rippleVelocity = abs( texture2D( rippleHeightMap, clamp(
    ( worldPosition.xz - rippleHeightBounds.xy ) / rippleHeightBounds.zw,
    0.0,
    1.0
  ) ).g );
  float rippleEnergy = clamp( rippleVelocity * 8.0 + abs( rippleCurvature ) * 0.028, 0.0, 1.0 );
  float rippleTextureBreakup = clamp( 0.82 + noise.x * 0.22 + noise.w * 0.12, 0.58, 1.08 );
  vec3 rippleNormal = vec3( -rippleGradient.x, 0.0, -rippleGradient.y ) *
    ( 4.2 + noise.x * 0.75 ) * rippleTextureBreakup;
  vec3 ambientNormal = vec3( -ambientSlope.x, 0.0, -ambientSlope.y ) * 0.72;
  vec2 rippleDistortion = -rippleGradient * ( 3.2 + noise.z * 0.5 ) * rippleTextureBreakup;
  surfaceNormal = normalize( surfaceNormal + ambientNormal + rippleNormal + microNormal * 0.16 );`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;",
        "vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale + rippleDistortion;",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );",
        `sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );
  float microGlint = pow( max( dot( eyeDirection, normalize( reflect( -sunDirection, surfaceNormal ) ) ), 0.0 ), 180.0 );
  specularLight += sunColor * microGlint * ( 0.38 + noise.x * 0.16 );
  float rippleSlope = length( rippleGradient );
  float rippleCrest =
    smoothstep( 0.00005, 0.0015, abs( rippleCurvature ) ) *
    smoothstep( 0.0004, 0.009, rippleSlope ) * rippleTextureBreakup;
  float rippleVelocityCrest = smoothstep( 0.008, 0.04, rippleVelocity ) *
    ( 0.22 + rippleEnergy * 0.2 );
  rippleCrest = clamp( rippleCrest + rippleVelocityCrest, 0.0, 1.0 );
  float rippleSheen =
    pow( max( dot( eyeDirection, normalize( reflect( -sunDirection, surfaceNormal ) ) ), 0.0 ), 42.0 ) *
    rippleCrest *
    clamp( 0.65 + noise.x * 0.3, 0.35, 1.0 ) *
    ( 0.72 + rippleEnergy * 1.35 );
  float rippleCaustic = smoothstep( 0.00006, 0.0016, abs( rippleCurvature ) ) *
    ( 0.35 + rippleEnergy * 0.65 );
  diffuseLight += sunColor * rippleCrest * 0.8;
  specularLight += sunColor * ( rippleSheen * 1.65 + rippleCaustic * 0.42 );`,
      );
      stage.dataset.worldRippleShader =
        shader.vertexShader.includes("sampleRippleVertexHeight") &&
        shader.vertexShader.includes("ripplePosition") &&
        shader.fragmentShader.includes("rippleCrest")
          ? "gpu-heightfield-gradient"
          : "unpatched";
    };
    stage.dataset.worldSurfaceProfile = "calm-lake";
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.42, -46);
    water.renderOrder = 2;
    scene.add(water);
  } catch {
    renderer?.dispose();
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
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function setRippleTexture(texture) {
    rippleField.texture = texture;
    if (water?.material?.uniforms?.rippleHeightMap) {
      water.material.uniforms.rippleHeightMap.value = texture;
    }
    if (rippleState.uniforms?.rippleHeightMap) {
      rippleState.uniforms.rippleHeightMap.value = texture;
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
    if (!hover || seconds >= hover.until) {
      rippleField.hoverImpact = null;
      hoverUniform.set(0, 0, 0, 0);
      directionUniform.set(0, 0);
      return;
    }
    const fade = clamp((hover.until - seconds) / RIPPLE_HOVER_LIFETIME, 0, 1);
    hoverUniform.set(hover.x, hover.y, hover.strength * fade, hover.radius);
    directionUniform.set(hover.directionX, hover.directionY);
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
    if (!rippleState.pending.length || !raycaster || !camera || !water || !rippleField) return;

    const pending = rippleState.pending.splice(0);
    let lastHit = null;
    for (const pointerHit of pending) {
      rippleState.ndc.set(pointerHit.x, pointerHit.y);
      camera.updateMatrixWorld();
      water.updateMatrixWorld();
      raycaster.setFromCamera(rippleState.ndc, camera);
      const hit = raycaster.intersectObject(water, false)[0];
      if (!hit) continue;

      const isHoverRipple = pointerHit.type === "hover";
      if (
        isHoverRipple &&
        rippleState.hasHoverPoint &&
        Math.hypot(hit.point.x - rippleState.hoverPoint.x, hit.point.z - rippleState.hoverPoint.y) <
          RIPPLE_HOVER_MIN_WORLD_DISTANCE
      ) {
        continue;
      }

      const impactStrength = pointerHit.strength ?? RIPPLE_CLICK_STRENGTH;
      const impactRadius = pointerHit.radius ?? RIPPLE_CLICK_RADIUS;
      const hoverDirection = new THREE.Vector2();
      if (isHoverRipple && rippleState.hasHoverPoint) {
        const directionX = hit.point.x - rippleState.hoverPoint.x;
        const directionY = hit.point.z - rippleState.hoverPoint.y;
        const directionLength = Math.hypot(directionX, directionY);
        if (directionLength > 0.001) {
          hoverDirection.set(directionX / directionLength, directionY / directionLength);
        }
      }

      const slot = rippleState.nextSlot;
      const start = reducedMotion ? -0.35 : seconds;
      const rippleUv = new THREE.Vector2(
        clamp((hit.point.x - RIPPLE_WORLD_MIN.x) / RIPPLE_WORLD_SIZE.x, 0, 1),
        clamp((hit.point.z - RIPPLE_WORLD_MIN.y) / RIPPLE_WORLD_SIZE.y, 0, 1),
      );
      rippleState.centers[slot].set(hit.point.x, hit.point.z);
      rippleState.starts[slot] = start;
      rippleState.strengths[slot] = pointerHit.strength ?? RIPPLE_CLICK_STRENGTH;
      rippleState.nextSlot = (slot + 1) % RIPPLE_SLOT_COUNT;
      rippleState.lastSlot = slot;
      rippleState.lastStart = start;
      rippleState.count += 1;
      if (isHoverRipple) {
        rippleState.hoverPoint.set(hit.point.x, hit.point.z);
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
      stage.dataset.worldRippleInput = isHoverRipple ? "gpu-raycast-hover" : "gpu-raycast-click";
      stage.dataset.worldRippleLastSlot = String(slot);
      stage.dataset.worldRippleState = `${rippleState.count}|${slot}|${start.toFixed(3)}|${hit.point.x.toFixed(2)},${hit.point.z.toFixed(2)}`;
      stage.dataset.worldRipplePeak = rippleField.peak.toFixed(4);
      lastHit = hit;
    }

    if (!lastHit) {
      stage.dataset.worldRippleQueued = "false";
      stage.dataset.worldRippleState = "unmapped";
      return;
    }
    stage.dataset.worldRippleQueued = "false";
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
    const waterShiftX = reducedMotion
      ? 0
      : Math.sin(time * 0.0001) * 15 + Math.cos(time * 0.000043) * 8;
    const waterShiftY = reducedMotion
      ? 0
      : Math.cos(time * 0.000082) * 10 + Math.sin(time * 0.000039) * 6;
    const pointerIntensity = clamp(pointerStrength * 0.95, 0, 1);
    const waterTiltX = -pointer.x * 2.35;
    const waterTiltY = pointer.y * 1.75;

    stage.style.setProperty("--cosmic-shift-x", -pointer.x * 32 + "px");
    stage.style.setProperty("--cosmic-shift-y", -pointer.y * 22 + "px");
    stage.style.setProperty("--water-shift-x", waterShiftX - pointer.x * 35 + "px");
    stage.style.setProperty("--water-shift-y", waterShiftY - pointer.y * 24 + "px");
    stage.style.setProperty("--world-image-shift-x", waterShiftX - pointer.x * 35 + "px");
    stage.style.setProperty("--world-image-shift-y", waterShiftY - pointer.y * 24 + "px");
    stage.style.setProperty("--world-image-tilt-x", waterTiltX + "deg");
    stage.style.setProperty("--world-image-tilt-y", waterTiltY + "deg");
    stage.style.setProperty("--world-pointer-x", (pointer.x + 0.5) * 100 + "%");
    stage.style.setProperty("--world-pointer-y", (pointer.y + 0.5) * 100 + "%");
    stage.style.setProperty("--world-pointer-intensity", pointerIntensity.toFixed(3));
    stage.style.setProperty("--water-ripple-strength", pointerStrength.toFixed(3));
    [imageElement, waterVideoElement].forEach((element) => {
      element?.style.setProperty(
        "--world-image-scale",
        pointer.active || pointer.impact > 0.03 ? "1.12" : "1.08",
      );
    });

    desiredCameraPosition.set(pointer.x * 4.8, 7.8 - pointer.y * 1.8, 15 + pointer.y * 2.8);
    desiredCameraTarget.set(pointer.x * 2.8, -0.2 - pointer.y * 0.4, -46 + pointer.y * 7);
    camera.position.lerp(desiredCameraPosition, reducedMotion ? 1 : 0.11);
    cameraTarget.lerp(desiredCameraTarget, reducedMotion ? 1 : 0.11);
    camera.lookAt(cameraTarget);
    camera.updateMatrixWorld();
    const deltaSeconds =
      rippleField.lastTime === null ? 0 : clamp(seconds - rippleField.lastTime, 0, 0.05);
    rippleField.lastTime = seconds;
    commitPendingRipple(seconds);
    updateRippleHoverUniform(seconds);
    advanceRippleField(deltaSeconds);

    const uniforms = water.material.uniforms;
    uniforms.time.value = reducedMotion ? 0 : seconds;
    uniforms.rippleWaveTime.value = reducedMotion ? 0 : seconds;
    uniforms.distortionScale.value = 3.4 + pointerStrength * 0.8;
    uniforms.size.value = 3.8;
    if (sky) sky.material.uniforms.time.value = reducedMotion ? 0 : seconds;
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
    stage.dataset.worldRippleRadius = reducedMotion
      ? (RIPPLE_SPEED * 0.35).toFixed(3)
      : rippleState.lastSlot < 0
        ? "0.000"
        : (Math.max(0, seconds - rippleState.lastStart) * RIPPLE_SPEED).toFixed(3);
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
  camera.lookAt(cameraTarget);
  start();
}
