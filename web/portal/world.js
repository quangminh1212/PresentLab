import * as THREE from "../vendor/three/three.module.js";
import { Sky } from "../vendor/three/addons/objects/Sky.js";
import { Water } from "../vendor/three/addons/objects/Water.js";

const MAX_PIXEL_RATIO = 2;
const WORLD_RENDER_SCALE = 0.82;
const WATER_NORMALS_URL = "/web/vendor/three/textures/waternormals.jpg";
const RIPPLE_SLOT_COUNT = 4;
const RIPPLE_SPEED = 7.2;
const RIPPLE_GRID_SIZE = 128;
const RIPPLE_WORLD_MIN = new THREE.Vector2(-90, -166);
const RIPPLE_WORLD_SIZE = new THREE.Vector2(180, 240);
const RIPPLE_HEIGHT_RANGE = 0.24;
const RIPPLE_TIME_STEP = 1 / 60;
const RIPPLE_DAMPING = 1.42;

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

function createRippleField() {
  const pixelCount = RIPPLE_GRID_SIZE * RIPPLE_GRID_SIZE;
  const pixels = new Uint8Array(pixelCount * 4);
  for (let index = 0; index < pixelCount; index += 1) {
    const pixel = index * 4;
    pixels[pixel] = 128;
    pixels[pixel + 1] = 128;
    pixels[pixel + 2] = 128;
    pixels[pixel + 3] = 255;
  }

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = RIPPLE_GRID_SIZE;
  textureCanvas.height = RIPPLE_GRID_SIZE;
  const textureContext = textureCanvas.getContext("2d");
  if (!textureContext) throw new Error("Ripple texture canvas is unavailable.");
  const textureImage = textureContext.createImageData(RIPPLE_GRID_SIZE, RIPPLE_GRID_SIZE);
  textureImage.data.set(pixels);
  textureContext.putImageData(textureImage, 0, 0);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return {
    size: RIPPLE_GRID_SIZE,
    texture,
    textureContext,
    textureImage,
    pixels,
    heights: new Float32Array(pixelCount),
    velocities: new Float32Array(pixelCount),
    nextHeights: new Float32Array(pixelCount),
    nextVelocities: new Float32Array(pixelCount),
    accumulator: 0,
    lastTime: null,
    peak: 0,
    active: false,
    quietFrames: 0,
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
  };
  const rippleState = {
    centers: Array.from({ length: RIPPLE_SLOT_COUNT }, () => new THREE.Vector2(0, -1000)),
    starts: Array.from({ length: RIPPLE_SLOT_COUNT }, () => -1000),
    strengths: Array.from({ length: RIPPLE_SLOT_COUNT }, () => 0),
    nextSlot: 0,
    lastSlot: -1,
    lastStart: -1000,
    count: 0,
    pending: null,
    ndc: new THREE.Vector2(),
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
    stage.dataset.worldRippleProvider = "threejs-water-shader";
    stage.dataset.worldRippleMode = "four-slot-heightfield";
    stage.dataset.worldRippleField = `${RIPPLE_GRID_SIZE}x${RIPPLE_GRID_SIZE}`;
    stage.dataset.worldRippleCount = String(rippleState.count);
    stage.dataset.worldRipplePeak ||= "0.0000";
    stage.dataset.worldRippleRadius ||= "0.000";
    stage.dataset.worldRippleState ||= "idle";
    stage.dataset.worldRippleQueued ||= "false";
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

  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    pointer.active = true;
    pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
  });
  stage.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.targetX = 0;
    pointer.targetY = 0;
  });
  stage.addEventListener("pointerdown", (event) => {
    if (
      event.target &&
      typeof event.target.closest === "function" &&
      event.target.closest("button, a")
    ) {
      return;
    }
    pointer.impact = 1;
    const bounds = stage.getBoundingClientRect();
    const localX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const localY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    rippleState.pending = {
      x: localX * 2 - 1,
      y: 1 - localY * 2,
    };
    stage.dataset.worldRippleQueued = "true";
    stage.classList.remove("is-world-pulsing");
    void stage.offsetWidth;
    stage.classList.add("is-world-pulsing");
  });

  try {
    rippleField = createRippleField();
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

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x789b99, 34, 178);
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
    skyUniforms.turbidity.value = 2.4;
    skyUniforms.rayleigh.value = 1.8;
    skyUniforms.mieCoefficient.value = 0.0018;
    skyUniforms.mieDirectionalG.value = 0.74;
    skyUniforms.cloudCoverage.value = 0.34;
    skyUniforms.cloudDensity.value = 0.32;
    skyUniforms.cloudElevation.value = 0.58;
    skyUniforms.cloudSpeed.value = 0.000012;
    skyUniforms.showSunDisc.value = 0;
    skyUniforms.sunPosition.value.copy(sunDirection).multiplyScalar(450);
    stage.dataset.worldSkyProvider = "threejs-official-sky";
    stage.dataset.worldSkyProfile = "hazy-lake-daylight";

    const shorelineShape = new THREE.Shape();
    shorelineShape.moveTo(-112, -14);
    for (let index = 0; index <= 22; index += 1) {
      const x = -112 + index * 10;
      const y =
        0.24 +
        Math.sin(index * 0.67) * 0.28 +
        Math.sin(index * 1.71) * 0.14 +
        Math.sin(index * 0.19) * 0.3;
      shorelineShape.lineTo(x, y);
    }
    shorelineShape.lineTo(112, -14);
    shorelineShape.closePath();
    const shoreline = new THREE.Mesh(
      new THREE.ShapeGeometry(shorelineShape),
      new THREE.MeshBasicMaterial({
        color: 0x315e57,
        fog: true,
        opacity: 0.48,
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
      new THREE.PlaneGeometry(180, 240, RIPPLE_GRID_SIZE - 1, RIPPLE_GRID_SIZE - 1),
      {
        textureWidth: 768,
        textureHeight: 768,
        waterNormals,
        sunDirection,
        sunColor: 0xcaa77f,
        waterColor: 0x14514f,
        distortionScale: 0.44,
        alpha: 0.98,
        fog: true,
      },
    );
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
      value: new THREE.Vector2(1 / (RIPPLE_GRID_SIZE - 1), 1 / (RIPPLE_GRID_SIZE - 1)),
    };
    water.material.onBeforeCompile = (shader) => {
      rippleState.uniforms = shader.uniforms;
      shader.vertexShader = shader.vertexShader.replace(
        "uniform mat4 textureMatrix;",
        `uniform mat4 textureMatrix;
uniform sampler2D rippleHeightMap;
uniform vec4 rippleHeightBounds;

float sampleRippleVertexHeight( vec2 position ) {
  vec2 uv = clamp(
    ( position - rippleHeightBounds.xy ) / rippleHeightBounds.zw,
    0.0,
    1.0
  );
  return ( texture2D( rippleHeightMap, uv ).r - 0.5 ) * ${RIPPLE_HEIGHT_RANGE.toFixed(2)};
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

float sampleRippleHeight( vec2 position ) {
  vec2 uv = clamp(
    ( position - rippleHeightBounds.xy ) / rippleHeightBounds.zw,
    0.0,
    1.0
  );
  return ( texture2D( rippleHeightMap, uv ).r - 0.5 ) * ${RIPPLE_HEIGHT_RANGE.toFixed(2)};
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
  float rippleCurvature =
    ( rippleLeft + rippleRight + rippleBack + rippleFront - rippleCenter * 4.0 ) /
    ( rippleStep.x * rippleStep.y );
  float rippleTextureBreakup = clamp( 0.82 + noise.x * 0.22 + noise.w * 0.12, 0.58, 1.08 );
  vec3 rippleNormal = vec3( -rippleGradient.x, 0.0, -rippleGradient.y ) * 23.0 * rippleTextureBreakup;
  vec2 rippleDistortion = -rippleGradient * ( 2.8 + noise.z * 0.45 );
  surfaceNormal = normalize( surfaceNormal + rippleNormal );`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;",
        "vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale + rippleDistortion;",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );",
        `sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );
  float rippleSlope = length( rippleGradient );
  float rippleCrest =
    smoothstep( 0.005, 0.055, abs( rippleCurvature ) ) *
    smoothstep( 0.01, 0.08, rippleSlope );
  float rippleSheen =
    pow( max( dot( eyeDirection, normalize( reflect( -sunDirection, surfaceNormal ) ) ), 0.0 ), 48.0 ) *
    rippleCrest *
    clamp( 0.65 + noise.x * 0.3, 0.35, 1.0 );
  specularLight += sunColor * rippleSheen * 0.78;`,
      );
    };
    stage.dataset.worldSurfaceProfile = "calm-lake";
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.42, -46);
    water.renderOrder = 2;
    scene.add(water);
  } catch {
    renderer?.dispose();
    rippleField?.texture.dispose();
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

  function writeRippleTexture() {
    const { heights, pixels } = rippleField;
    let peak = 0;
    for (let index = 0; index < heights.length; index += 1) {
      peak = Math.max(peak, Math.abs(heights[index]));
      const encodedHeight = clamp(0.5 + (heights[index] / RIPPLE_HEIGHT_RANGE) * 0.5, 0, 1);
      const pixel = index * 4;
      pixels[pixel] = Math.round(encodedHeight * 255);
    }
    rippleField.peak = peak;
    rippleField.textureImage.data.set(pixels);
    rippleField.textureContext.putImageData(rippleField.textureImage, 0, 0);
    rippleField.texture.needsUpdate = true;
    stage.dataset.worldRipplePeak = peak.toFixed(4);
  }

  function injectRipple(worldX, worldZ) {
    const { size, heights, velocities } = rippleField;
    rippleField.active = true;
    rippleField.quietFrames = 0;
    const cellSizeX = RIPPLE_WORLD_SIZE.x / (size - 1);
    const cellSizeZ = RIPPLE_WORLD_SIZE.y / (size - 1);
    const gridX = ((worldX - RIPPLE_WORLD_MIN.x) / RIPPLE_WORLD_SIZE.x) * (size - 1);
    const gridZ = ((worldZ - RIPPLE_WORLD_MIN.y) / RIPPLE_WORLD_SIZE.y) * (size - 1);
    const impactRadius = 1.8;
    const supportRadius = impactRadius * 2.35;
    const minX = Math.max(1, Math.floor(gridX - supportRadius / cellSizeX));
    const maxX = Math.min(size - 2, Math.ceil(gridX + supportRadius / cellSizeX));
    const minZ = Math.max(1, Math.floor(gridZ - supportRadius / cellSizeZ));
    const maxZ = Math.min(size - 2, Math.ceil(gridZ + supportRadius / cellSizeZ));

    for (let z = minZ; z <= maxZ; z += 1) {
      const positionZ = RIPPLE_WORLD_MIN.y + (z / (size - 1)) * RIPPLE_WORLD_SIZE.y;
      for (let x = minX; x <= maxX; x += 1) {
        const positionX = RIPPLE_WORLD_MIN.x + (x / (size - 1)) * RIPPLE_WORLD_SIZE.x;
        const distance = Math.hypot(positionX - worldX, positionZ - worldZ);
        const falloff = Math.exp(-((distance / impactRadius) ** 2) * 2.2);
        if (falloff < 0.002) continue;
        const index = z * size + x;
        const angularBreakup =
          Math.sin(positionX * 0.21 + positionZ * 0.13) * 0.24 +
          Math.cos(positionX * 0.11 - positionZ * 0.19) * 0.16;
        const capillaryEnvelope = Math.exp(-((distance / 4.6) ** 2) * 1.1);
        const capillaryKick = Math.sin(distance * 2.65 + angularBreakup) * capillaryEnvelope * 0.2;
        heights[index] -= 0.028 * falloff;
        velocities[index] -= 1.35 * falloff;
        velocities[index] += capillaryKick;
      }
    }
  }

  function advanceRippleField(deltaSeconds) {
    if (reducedMotion || deltaSeconds <= 0 || rippleState.count === 0 || !rippleField.active)
      return;

    rippleField.accumulator = Math.min(rippleField.accumulator + deltaSeconds, 0.12);
    const { size } = rippleField;
    let currentHeights = rippleField.heights;
    let currentVelocities = rippleField.velocities;
    let nextHeights = rippleField.nextHeights;
    let nextVelocities = rippleField.nextVelocities;
    let advanced = false;
    const cellSizeX = RIPPLE_WORLD_SIZE.x / (size - 1);
    const cellSizeZ = RIPPLE_WORLD_SIZE.y / (size - 1);
    const inverseCellSizeXSquared = 1 / (cellSizeX * cellSizeX);
    const inverseCellSizeZSquared = 1 / (cellSizeZ * cellSizeZ);
    const damping = Math.exp(-RIPPLE_DAMPING * RIPPLE_TIME_STEP);
    const waveSpeedSquared = RIPPLE_SPEED * RIPPLE_SPEED;

    while (rippleField.accumulator >= RIPPLE_TIME_STEP) {
      advanced = true;
      nextHeights.fill(0);
      nextVelocities.fill(0);
      for (let z = 1; z < size - 1; z += 1) {
        for (let x = 1; x < size - 1; x += 1) {
          const index = z * size + x;
          const center = currentHeights[index];
          const laplacian =
            (currentHeights[index - 1] + currentHeights[index + 1] - center * 2) *
              inverseCellSizeXSquared +
            (currentHeights[index - size] + currentHeights[index + size] - center * 2) *
              inverseCellSizeZSquared;
          const nextVelocity =
            (currentVelocities[index] + laplacian * waveSpeedSquared * RIPPLE_TIME_STEP) * damping;
          nextVelocities[index] = nextVelocity;
          nextHeights[index] = center + nextVelocity * RIPPLE_TIME_STEP;
        }
      }
      [currentHeights, nextHeights] = [nextHeights, currentHeights];
      [currentVelocities, nextVelocities] = [nextVelocities, currentVelocities];
      rippleField.accumulator -= RIPPLE_TIME_STEP;
    }

    rippleField.heights = currentHeights;
    rippleField.velocities = currentVelocities;
    rippleField.nextHeights = nextHeights;
    rippleField.nextVelocities = nextVelocities;
    if (!advanced) return;
    writeRippleTexture();
    if (rippleField.peak < 0.0005) {
      rippleField.quietFrames += 1;
      if (rippleField.quietFrames > 18) {
        rippleField.heights.fill(0);
        rippleField.velocities.fill(0);
        rippleField.nextHeights.fill(0);
        rippleField.nextVelocities.fill(0);
        rippleField.active = false;
        rippleField.quietFrames = 0;
        writeRippleTexture();
      }
    } else {
      rippleField.quietFrames = 0;
    }
  }

  function commitPendingRipple(seconds) {
    if (!rippleState.pending || !raycaster || !camera || !water || !rippleState.uniforms) return;

    const pending = rippleState.pending;
    rippleState.pending = null;
    rippleState.ndc.set(pending.x, pending.y);
    camera.updateMatrixWorld();
    water.updateMatrixWorld();
    raycaster.setFromCamera(rippleState.ndc, camera);
    const hit = raycaster.intersectObject(water, false)[0];
    if (!hit) {
      stage.dataset.worldRippleQueued = "false";
      stage.dataset.worldRippleState = "unmapped";
      return;
    }

    const slot = rippleState.nextSlot;
    const start = reducedMotion ? -0.35 : seconds;
    rippleState.centers[slot].set(hit.point.x, hit.point.z);
    rippleState.starts[slot] = start;
    rippleState.strengths[slot] = 1;
    rippleState.nextSlot = (slot + 1) % RIPPLE_SLOT_COUNT;
    rippleState.lastSlot = slot;
    rippleState.lastStart = start;
    rippleState.count += 1;
    injectRipple(hit.point.x, hit.point.z);
    stage.dataset.worldRippleCount = String(rippleState.count);
    stage.dataset.worldRippleLastSlot = String(slot);
    stage.dataset.worldRippleState = `${rippleState.count}|${slot}|${start.toFixed(3)}|${hit.point.x.toFixed(2)},${hit.point.z.toFixed(2)}`;
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
    advanceRippleField(deltaSeconds);

    const uniforms = water.material.uniforms;
    uniforms.time.value = reducedMotion ? 0 : seconds;
    uniforms.distortionScale.value = 0.44 + pointerStrength * 0.12;
    uniforms.size.value = 3.6;
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
