const MAX_PIXEL_RATIO = 2;
const WORLD_RENDER_SCALE = 0.82;
const WATER_COLUMNS = 104;
const WATER_ROWS = 76;
const WATER_WIDTH = 88;
const WATER_DEPTH = 124;

/*
 * The water pass is a small native WebGL implementation inspired by the
 * low-cost procedural ocean approach in Nugget8/Three.js-Ocean-Scene (MIT)
 * and the interactive ripple work in Evan Wallace's webgl-water family.
 * No third-party runtime asset or remote texture is required by the portal.
 */
const waterVertexShaderSource = `
  precision mediump float;
  attribute vec3 a_position;
  uniform mat4 u_matrix;
  uniform float u_time;
  uniform vec2 u_pointer;
  uniform float u_pointer_strength;
  varying vec3 v_world_position;
  varying vec3 v_normal;
  varying float v_ripple;
  varying float v_depth;

  vec2 pointerPosition() {
    return vec2(u_pointer.x * 32.0, -42.0 + u_pointer.y * 58.0);
  }

  float pointerWave(vec2 position) {
    float distanceToPointer = distance(position, pointerPosition());
    float wavefront = sin(distanceToPointer * 1.65 - u_time * 4.0);
    return wavefront * exp(-distanceToPointer * 0.085) * u_pointer_strength * 0.46;
  }

  float surfaceHeight(vec2 position) {
    float broadWaves = sin(dot(position, vec2(0.16, 0.10)) + u_time * 0.45) * 0.28;
    broadWaves += sin(dot(position, vec2(-0.27, 0.08)) - u_time * 0.35 + 1.5) * 0.17;
    broadWaves += sin(dot(position, vec2(0.07, -0.34)) + u_time * 0.68 + 2.0) * 0.09;
    broadWaves += sin(length(position * vec2(0.11, 0.045)) - u_time * 0.26) * 0.11;
    broadWaves += sin(position.x * 0.72 + position.y * 0.38 + u_time * 0.92) * 0.035;
    broadWaves += cos(position.x * -0.48 + position.y * 0.66 - u_time * 0.77) * 0.025;
    return broadWaves + pointerWave(position);
  }

  void main() {
    vec2 position = a_position.xz;
    float height = surfaceHeight(position);
    float delta = 0.12;
    float slopeX = (surfaceHeight(position + vec2(delta, 0.0)) -
      surfaceHeight(position - vec2(delta, 0.0))) / (delta * 2.0);
    float slopeZ = (surfaceHeight(position + vec2(0.0, delta)) -
      surfaceHeight(position - vec2(0.0, delta))) / (delta * 2.0);
    vec3 normal = normalize(vec3(-slopeX, 1.0, -slopeZ));
    float distanceToPointer = distance(position, pointerPosition());

    v_world_position = vec3(position.x, height, position.y);
    v_normal = normal;
    v_ripple = sin(distanceToPointer * 1.65 - u_time * 4.0) *
      exp(-distanceToPointer * 0.085) * u_pointer_strength;
    v_depth = clamp((-position.y - 4.0) / 124.0, 0.0, 1.0);
    gl_Position = u_matrix * vec4(position.x, height, position.y, 1.0);
  }
`;

const waterFragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec3 u_deep_color;
  uniform vec3 u_shallow_color;
  uniform vec3 u_sun_color;
  uniform vec3 u_foam_color;
  uniform vec3 u_light_direction;
  uniform vec3 u_camera_position;
  varying vec3 v_world_position;
  varying vec3 v_normal;
  varying float v_ripple;
  varying float v_depth;

  void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDirection = normalize(u_light_direction);
    vec3 viewDirection = normalize(u_camera_position - v_world_position);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
    float specular = pow(
      max(dot(reflect(-lightDirection, normal), viewDirection), 0.0),
      44.0
    );
    float flowA = 0.5 + 0.5 * sin(
      v_world_position.x * 0.34 - v_world_position.z * 0.052 + u_time * 0.33
    );
    float flowB = 0.5 + 0.5 * sin(
      v_world_position.x * -0.22 + v_world_position.z * 0.11 - u_time * 0.25 + 1.7
    );
    float shimmer = smoothstep(0.62, 0.96, flowA * 0.64 + flowB * 0.36);
    float microA = 0.5 + 0.5 * sin(
      v_world_position.x * 1.46 + v_world_position.z * 0.23 + u_time * 0.88
    );
    float microB = 0.5 + 0.5 * sin(
      v_world_position.x * -1.96 + v_world_position.z * 0.41 - u_time * 0.72 + 1.7
    );
    float glint = smoothstep(0.72, 0.98, microA * 0.58 + microB * 0.42);
    float caustic = smoothstep(
      0.78,
      0.99,
      0.5 + 0.5 * sin(v_world_position.x * 0.52 - v_world_position.z * 0.18 + u_time * 0.32)
    );
    float pointerRing = smoothstep(0.06, 0.34, abs(v_ripple));
    vec3 baseColor = mix(u_shallow_color, u_deep_color, v_depth * 0.94);
    vec3 horizonColor = mix(u_shallow_color, u_sun_color, 0.24 + fresnel * 0.3);
    vec3 color = baseColor * (0.46 + diffuse * 0.72);

    color += u_shallow_color * (flowA * 0.1 + flowB * 0.08);
    color += horizonColor * (fresnel * 0.2 + glint * 0.08);
    color += u_sun_color * (specular * 1.08 + glint * 0.14 + caustic * 0.07);
    color += u_foam_color * (shimmer * (0.06 + fresnel * 0.16));
    color += u_foam_color * pointerRing * 0.3;

    float alpha = clamp(0.86 + fresnel * 0.12 + glint * 0.04, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

const landmarks = [
  {
    id: "archive",
    label: "SLIDE LIBRARY",
    x: -14,
    z: -24,
  },
  {
    id: "brief",
    label: "STORY BRIEF",
    x: 12,
    z: -51,
  },
  {
    id: "process",
    label: "DECK REVIEW",
    x: -5,
    z: -82,
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalize(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function identityMatrix() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function multiplyMatrices(a, b) {
  const output = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      output[column * 4 + row] =
        a[row] * b[column * 4] +
        a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] +
        a[12 + row] * b[column * 4 + 3];
    }
  }
  return output;
}

function perspectiveMatrix(fieldOfView, aspect, near, far) {
  const scale = 1 / Math.tan(fieldOfView / 2);
  const range = near - far;
  return new Float32Array([
    scale / aspect,
    0,
    0,
    0,
    0,
    scale,
    0,
    0,
    0,
    0,
    (near + far) / range,
    -1,
    0,
    0,
    (2 * near * far) / range,
    0,
  ]);
}

function lookAtMatrix(eye, target) {
  const zAxis = normalize(subtract(eye, target));
  const xAxis = normalize(cross([0, 1, 0], zAxis));
  const yAxis = cross(zAxis, xAxis);
  return new Float32Array([
    xAxis[0],
    yAxis[0],
    zAxis[0],
    0,
    xAxis[1],
    yAxis[1],
    zAxis[1],
    0,
    xAxis[2],
    yAxis[2],
    zAxis[2],
    0,
    -dot(xAxis, eye),
    -dot(yAxis, eye),
    -dot(zAxis, eye),
    1,
  ]);
}

function makeWaterGrid(columns = WATER_COLUMNS, rows = WATER_ROWS) {
  const vertices = [];
  const xStep = WATER_WIDTH / (columns - 1);
  const zStep = WATER_DEPTH / (rows - 1);
  for (let row = 0; row < rows - 1; row += 1) {
    const nearZ = 10 - row * zStep;
    const farZ = nearZ - zStep;
    for (let column = 0; column < columns - 1; column += 1) {
      const leftX = -WATER_WIDTH / 2 + column * xStep;
      const rightX = leftX + xStep;
      vertices.push(
        leftX,
        0,
        nearZ,
        rightX,
        0,
        nearZ,
        rightX,
        0,
        farZ,
        leftX,
        0,
        nearZ,
        rightX,
        0,
        farZ,
        leftX,
        0,
        farZ,
      );
    }
  }
  return new Float32Array(vertices);
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, waterVertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, waterFragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function getColors() {
  const light = document.documentElement.dataset.theme === "light";
  return light
    ? {
        deep: [0.006, 0.1, 0.16],
        shallow: [0.03, 0.4, 0.4],
        sun: [0.46, 1, 0.86],
        foam: [0.76, 1, 0.95],
      }
    : {
        deep: [0.002, 0.028, 0.075],
        shallow: [0.01, 0.25, 0.3],
        sun: [0.28, 1, 0.86],
        foam: [0.58, 1, 0.94],
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
  let currentViewProjection = identityMatrix();
  let pointerStrength = 0;
  let videoWaterReady = false;
  let webglWaterAvailable = false;
  const camera = { eye: [0, 7.2, 14], target: [0, 0.2, -42] };

  const setFallbackState = () => {
    if (videoWaterReady) return;
    stage.dataset.worldRenderMode = "css-fallback";
    stage.dataset.worldShading = "water-css-fallback";
    stage.dataset.worldSurface = "css-water-fallback";
    stage.classList.add("world-fallback", "world-ready");
  };

  const setWebglWaterState = () => {
    videoWaterReady = false;
    waterVideoElement?.pause();
    stage.classList.remove("is-video-water", "world-fallback");
    stage.dataset.worldVideoState = waterVideoElement ? "standby" : "unavailable";
    stage.dataset.worldRenderMode = "webgl-water-3d";
    stage.dataset.worldShading = "fresnel-water";
    stage.dataset.worldSurface = "procedural-wave-grid";
    stage.dataset.worldInteraction = "pointer-ripple-camera";
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
    waterVideoElement.addEventListener("canplay", activateVideoWater, { once: true });
    waterVideoElement.addEventListener("error", () => setVideoWaterState(false));
    waterVideoElement.addEventListener("timeupdate", () => {
      stage.dataset.worldVideoTime = waterVideoElement.currentTime.toFixed(3);
    });
    if (waterVideoElement.readyState >= 3) activateVideoWater();
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
    stage.style.setProperty(
      "--world-click-x",
      clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100).toFixed(2) + "%",
    );
    stage.style.setProperty(
      "--world-click-y",
      clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100).toFixed(2) + "%",
    );
    stage.classList.remove("is-world-pulsing");
    void stage.offsetWidth;
    stage.classList.add("is-world-pulsing");
  });

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    setFallbackState();
    return;
  }

  const program = createProgram(gl);
  if (!program) {
    setFallbackState();
    return;
  }

  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const pointerLocation = gl.getUniformLocation(program, "u_pointer");
  const pointerStrengthLocation = gl.getUniformLocation(program, "u_pointer_strength");
  const deepColorLocation = gl.getUniformLocation(program, "u_deep_color");
  const shallowColorLocation = gl.getUniformLocation(program, "u_shallow_color");
  const sunColorLocation = gl.getUniformLocation(program, "u_sun_color");
  const foamColorLocation = gl.getUniformLocation(program, "u_foam_color");
  const lightDirectionLocation = gl.getUniformLocation(program, "u_light_direction");
  const cameraPositionLocation = gl.getUniformLocation(program, "u_camera_position");
  const waterBuffer = gl.createBuffer();

  if (
    positionLocation < 0 ||
    !matrixLocation ||
    !timeLocation ||
    !pointerLocation ||
    !pointerStrengthLocation ||
    !deepColorLocation ||
    !shallowColorLocation ||
    !sunColorLocation ||
    !foamColorLocation ||
    !lightDirectionLocation ||
    !cameraPositionLocation ||
    !waterBuffer
  ) {
    gl.deleteProgram(program);
    setFallbackState();
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, waterBuffer);
  const waterVertices = makeWaterGrid();
  gl.bufferData(gl.ARRAY_BUFFER, waterVertices, gl.STATIC_DRAW);
  const waterVertexCount = waterVertices.length / 3;
  webglWaterAvailable = true;
  setWebglWaterState();

  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * WORLD_RENDER_SCALE;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function draw(time) {
    const colors = getColors();
    const seconds = time * 0.001;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pointer.x += (pointer.targetX - pointer.x) * (reducedMotion ? 1 : 0.055);
    pointer.y += (pointer.targetY - pointer.y) * (reducedMotion ? 1 : 0.055);
    if (!reducedMotion) pointer.impact *= 0.94;
    const pointerDistance = Math.hypot(pointer.x, pointer.y);
    pointerStrength = reducedMotion
      ? 0
      : clamp((pointer.active ? 0.2 + pointerDistance * 1.25 : 0) + pointer.impact, 0, 1);
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

    const desiredEye = [pointer.x * 4.8, 7.2 - pointer.y * 1.8, 14 + pointer.y * 2.8];
    const desiredTarget = [pointer.x * 2.8, 0.2 - pointer.y * 0.4, -42 + pointer.y * 7];
    const cameraBlend = reducedMotion ? 1 : 0.11;
    camera.eye = camera.eye.map(
      (value, index) => value + (desiredEye[index] - value) * cameraBlend,
    );
    camera.target = camera.target.map(
      (value, index) => value + (desiredTarget[index] - value) * cameraBlend,
    );
    const projection = perspectiveMatrix(Math.PI / 3.1, width / height, 0.1, 190);
    currentViewProjection = multiplyMatrices(projection, lookAtMatrix(camera.eye, camera.target));

    if (!videoWaterReady) {
      gl.bindBuffer(gl.ARRAY_BUFFER, waterBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(matrixLocation, false, currentViewProjection);
      gl.uniform1f(timeLocation, reducedMotion ? 0 : seconds);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(pointerStrengthLocation, pointerStrength);
      gl.uniform3fv(deepColorLocation, colors.deep);
      gl.uniform3fv(shallowColorLocation, colors.shallow);
      gl.uniform3fv(sunColorLocation, colors.sun);
      gl.uniform3fv(foamColorLocation, colors.foam);
      gl.uniform3f(lightDirectionLocation, -0.42, 0.86, 0.38);
      gl.uniform3fv(cameraPositionLocation, camera.eye);
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.drawArrays(gl.TRIANGLES, 0, waterVertexCount);
    }

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
