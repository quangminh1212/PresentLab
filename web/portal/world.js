const MAX_PIXEL_RATIO = 2;
const WORLD_RENDER_SCALE = 0.82;

const vertexShaderSource = `
  attribute vec3 a_position;
  uniform mat4 u_matrix;
  uniform float u_point_size;
  varying float v_point_mode;
  varying float v_shade;

  void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
    gl_PointSize = u_point_size;
    v_point_mode = u_point_size > 1.0 ? 1.0 : 0.0;
    v_shade = clamp(1.0 + a_position.y * 0.05 + a_position.z * 0.015, 0.82, 1.16);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  varying float v_point_mode;
  varying float v_shade;

  void main() {
    float alpha = u_color.a;
    if (v_point_mode > 0.5) {
      float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
      float softness = smoothstep(0.52, 0.06, distanceFromCenter);
      if (softness <= 0.01) discard;
      alpha *= softness;
    }
    gl_FragColor = vec4(u_color.rgb * v_shade, alpha);
  }
`;

const landmarks = [
  {
    id: "archive",
    label: "SLIDE LIBRARY",
    x: -8.5,
    y: 3.5,
    z: -22,
    radius: 3.4,
    color: [0.18, 0.98, 0.78, 0.5],
    secondary: [0.2, 0.7, 1, 0.72],
    orbit: { radiusX: 1.5, radiusY: 0.42, radiusZ: 1.65, speed: 0.00022, phase: 0.4 },
  },
  {
    id: "brief",
    label: "STORY BRIEF",
    x: 8.5,
    y: 2.4,
    z: -39,
    radius: 4.1,
    color: [1, 0.45, 0.27, 0.5],
    secondary: [1, 0.76, 0.38, 0.72],
    orbit: { radiusX: 1.85, radiusY: 0.58, radiusZ: 2.35, speed: 0.00017, phase: 2.1 },
  },
  {
    id: "process",
    label: "DECK REVIEW",
    x: -7,
    y: 5.4,
    z: -59,
    radius: 2.8,
    color: [0.58, 0.62, 1, 0.48],
    secondary: [0.3, 0.92, 1, 0.72],
    orbit: { radiusX: 1.25, radiusY: 0.5, radiusZ: 2.8, speed: 0.00013, phase: 4.7 },
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

function modelMatrix(x, y, z, scaleX, scaleY, scaleZ, rotation = 0) {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return new Float32Array([
    cosine * scaleX,
    0,
    -sine * scaleX,
    0,
    0,
    scaleY,
    0,
    0,
    sine * scaleZ,
    0,
    cosine * scaleZ,
    0,
    x,
    y,
    z,
    1,
  ]);
}

function makeRing(radius, y = 0, segments = 72) {
  const vertices = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }
  return new Float32Array(vertices);
}

function makeVerticalRing(radius, segments = 72) {
  const vertices = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  }
  return new Float32Array(vertices);
}

function makeSphere(segments = 26, rings = 16) {
  const vertices = [];
  const point = (latitude, longitude) => {
    const y = Math.cos(latitude);
    const radius = Math.sin(latitude);
    return [radius * Math.cos(longitude), y, radius * Math.sin(longitude)];
  };
  for (let ring = 0; ring < rings; ring += 1) {
    const top = (ring / rings) * Math.PI;
    const bottom = ((ring + 1) / rings) * Math.PI;
    for (let segment = 0; segment < segments; segment += 1) {
      const left = (segment / segments) * Math.PI * 2;
      const right = ((segment + 1) / segments) * Math.PI * 2;
      const a = point(top, left);
      const b = point(bottom, left);
      const c = point(bottom, right);
      const d = point(top, right);
      vertices.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  return new Float32Array(vertices);
}

function makeSphereLines(segments = 26, rings = 10) {
  const vertices = [];
  const point = (latitude, longitude) => {
    const y = Math.cos(latitude);
    const radius = Math.sin(latitude);
    return [radius * Math.cos(longitude), y, radius * Math.sin(longitude)];
  };
  for (let ring = 1; ring < rings; ring += 1) {
    const latitude = (ring / rings) * Math.PI;
    for (let segment = 0; segment < segments; segment += 1) {
      const left = (segment / segments) * Math.PI * 2;
      const right = ((segment + 1) / segments) * Math.PI * 2;
      vertices.push(...point(latitude, left), ...point(latitude, right));
    }
  }
  for (let segment = 0; segment < segments; segment += 1) {
    const longitude = (segment / segments) * Math.PI * 2;
    for (let ring = 0; ring < rings; ring += 1) {
      const top = (ring / rings) * Math.PI;
      const bottom = ((ring + 1) / rings) * Math.PI;
      vertices.push(...point(top, longitude), ...point(bottom, longitude));
    }
  }
  return new Float32Array(vertices);
}

function makeStarfield(count = 420, seedOffset = 0) {
  const vertices = [];
  for (let index = 0; index < count; index += 1) {
    const seed = (index + seedOffset) * 17.237 + 4.91;
    const random = (value) => value - Math.floor(value);
    const x = random(Math.sin(seed) * 43758.5453) * 78 - 39;
    const y = -2 + random(Math.sin(seed * 1.7) * 24634.6345) * 28;
    const z = -8 - random(Math.sin(seed * 2.3) * 12457.821) * 112;
    vertices.push(x, y, z);
  }
  return new Float32Array(vertices);
}

function makeDustField(count = 180, seedOffset = 0) {
  const vertices = [];
  for (let index = 0; index < count; index += 1) {
    const seed = (index + seedOffset) * 9.713 + 2.2;
    const random = (value) => value - Math.floor(value);
    const x = random(Math.sin(seed) * 52431.3) * 54 - 27;
    const y = random(Math.sin(seed * 1.4) * 13822.4) * 20 - 1;
    const z = -10 - random(Math.sin(seed * 2.1) * 33819.7) * 108;
    vertices.push(x, y, z);
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
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
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
        starGlow: [0.26, 0.76, 1, 0.14],
        star: [0.72, 0.92, 1, 0.82],
        dust: [0.3, 0.98, 0.9, 0.2],
        orbit: [0.23, 0.92, 0.85, 0.3],
        orbitWarm: [1, 0.44, 0.64, 0.22],
        white: [0.83, 1, 0.97, 0.75],
      }
    : {
        starGlow: [0.18, 0.52, 1, 0.18],
        star: [0.58, 0.83, 1, 0.78],
        dust: [0.17, 0.88, 0.84, 0.22],
        orbit: [0.15, 0.96, 0.84, 0.38],
        orbitWarm: [0.92, 0.34, 0.78, 0.26],
        white: [0.76, 0.96, 0.94, 0.72],
      };
}

function getLandmarkPose(landmark, time, reducedMotion) {
  const orbit = landmark.orbit;
  if (!orbit || reducedMotion) {
    return { x: landmark.x, y: landmark.y, z: landmark.z };
  }

  const angle = time * orbit.speed + orbit.phase;
  const bobAngle = time * orbit.speed * 0.73 + orbit.phase * 1.8;
  return {
    x: landmark.x + Math.cos(angle) * orbit.radiusX,
    y: landmark.y + Math.sin(bobAngle) * orbit.radiusY,
    z: landmark.z + Math.sin(angle) * orbit.radiusZ,
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
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
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
  const camera = { eye: [0, 5.8, 12], target: [0, 2.2, -34] };

  const setSelectedTarget = (target) => {
    const landmark = landmarks.find((item) => item.id === target);
    if (!landmark) return;
    selectedTarget = target;
    stage.classList.add("is-focused");
    if (statusElement) statusElement.textContent = "NODE LOCK";
    if (targetLabelElement) targetLabelElement.textContent = landmark.label;
    locationButtons.forEach((button, id) => button.classList.toggle("is-active", id === target));
    onTarget(target);
  };

  const focusField = () => {
    stage.classList.add("is-focused");
    if (statusElement) statusElement.textContent = "FIELD FOCUS";
    stage.focus({ preventScroll: true });
  };

  setupDomControls(stage, setSelectedTarget, focusField);
  stage.classList.remove("is-focused");
  if (statusElement) statusElement.textContent = "DEEP SPACE";

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
    const bounds = stage.getBoundingClientRect();
    stage.style.setProperty(
      "--world-click-x",
      `${clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100).toFixed(2)}%`,
    );
    stage.style.setProperty(
      "--world-click-y",
      `${clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100).toFixed(2)}%`,
    );
    stage.classList.remove("is-world-pulsing");
    void stage.offsetWidth;
    stage.classList.add("is-world-pulsing");
  });

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    stage.classList.add("world-fallback", "world-ready");
    return;
  }

  const program = createProgram(gl);
  if (!program) {
    stage.classList.add("world-fallback", "world-ready");
    return;
  }

  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  const pointSizeLocation = gl.getUniformLocation(program, "u_point_size");
  const buffers = new Map();
  const geometrySource = {
    stars: makeStarfield(460, 13),
    warmStars: makeStarfield(120, 947),
    dust: makeDustField(210, 311),
    sphere: makeSphere(),
    sphereLines: makeSphereLines(),
    ring: makeRing(1, 0, 88),
    verticalRing: makeVerticalRing(1, 88),
    skyRing: makeRing(18, 0, 96),
    skyRingWide: makeRing(28, 0, 112),
  };

  function getBuffer(key, vertices) {
    if (buffers.has(key)) return buffers.get(key);
    const buffer = gl.createBuffer();
    if (!buffer) return null;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const item = { buffer, count: vertices.length / 3 };
    buffers.set(key, item);
    return item;
  }

  const geometry = Object.fromEntries(
    Object.entries(geometrySource).map(([key, vertices]) => [key, getBuffer(key, vertices)]),
  );

  function drawMesh(item, mode, matrix, color, pointSize = 1) {
    if (!item) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniform4fv(colorLocation, color);
    gl.uniform1f(pointSizeLocation, pointSize);
    gl.drawArrays(mode, 0, item.count);
  }

  function drawRing(item, x, y, z, scaleX, scaleY, rotation, color) {
    const matrix = multiplyMatrices(
      currentViewProjection,
      modelMatrix(x, y, z, scaleX, scaleY, scaleX, rotation),
    );
    drawMesh(item, gl.LINE_STRIP, matrix, color);
  }

  function drawPlanet(landmark, time, colors, pose) {
    const rotation = landmark.x * 0.12 + (reducedMotion ? 0 : time * 0.00008);
    const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 0.001 + landmark.x) * 0.012;
    const matrix = multiplyMatrices(
      currentViewProjection,
      modelMatrix(
        pose.x,
        pose.y,
        pose.z,
        landmark.radius * pulse,
        landmark.radius * pulse,
        landmark.radius * pulse,
        rotation,
      ),
    );
    const selected = landmark.id === selectedTarget;
    const bodyColor = [...landmark.color.slice(0, 3), selected ? 0.66 : 0.42];
    const edgeColor = [...landmark.secondary.slice(0, 3), selected ? 0.84 : 0.56];
    drawMesh(geometry.sphere, gl.TRIANGLES, matrix, bodyColor);
    drawMesh(geometry.sphereLines, gl.LINES, matrix, edgeColor);
    drawRing(
      geometry.ring,
      pose.x,
      pose.y,
      pose.z,
      landmark.radius * 1.54,
      landmark.radius * 0.42,
      rotation * 0.38,
      [...landmark.secondary.slice(0, 3), selected ? 0.58 : 0.3],
    );
    drawRing(
      geometry.verticalRing,
      pose.x,
      pose.y,
      pose.z,
      landmark.radius * 1.18,
      landmark.radius * 0.86,
      rotation * -0.7,
      [...landmark.color.slice(0, 3), selected ? 0.36 : 0.18],
    );
    if (selected) {
      drawRing(
        geometry.ring,
        pose.x,
        pose.y,
        pose.z,
        landmark.radius * 1.95,
        landmark.radius * 0.55,
        -rotation,
        [...colors.white.slice(0, 3), 0.25],
      );
    }
  }

  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * WORLD_RENDER_SCALE;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function draw(time) {
    const colors = getColors();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * WORLD_RENDER_SCALE;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pointer.x += (pointer.targetX - pointer.x) * (reducedMotion ? 1 : 0.055);
    pointer.y += (pointer.targetY - pointer.y) * (reducedMotion ? 1 : 0.055);
    const cosmicShiftX = reducedMotion ? 0 : -pointer.x * 54;
    const cosmicShiftY = reducedMotion ? 0 : -pointer.y * 34;
    const imageDriftX = reducedMotion
      ? 0
      : Math.sin(time * 0.00011) * 18 + Math.cos(time * 0.000047) * 9;
    const imageDriftY = reducedMotion
      ? 0
      : Math.cos(time * 0.000085) * 13 + Math.sin(time * 0.000037) * 7;
    const pointerIntensity = pointer.active
      ? clamp(0.26 + Math.hypot(pointer.x, pointer.y) * 1.15, 0, 1)
      : 0;
    stage.style.setProperty("--cosmic-shift-x", `${cosmicShiftX.toFixed(2)}px`);
    stage.style.setProperty("--cosmic-shift-y", `${cosmicShiftY.toFixed(2)}px`);
    stage.style.setProperty(
      "--world-image-shift-x",
      `${(imageDriftX - pointer.x * 44).toFixed(2)}px`,
    );
    stage.style.setProperty(
      "--world-image-shift-y",
      `${(imageDriftY - pointer.y * 30).toFixed(2)}px`,
    );
    stage.style.setProperty("--world-image-tilt-x", `${(-pointer.x * 2.8).toFixed(2)}deg`);
    stage.style.setProperty("--world-image-tilt-y", `${(pointer.y * 2.2).toFixed(2)}deg`);
    stage.style.setProperty("--world-pointer-x", `${((pointer.x + 0.5) * 100).toFixed(2)}%`);
    stage.style.setProperty("--world-pointer-y", `${((pointer.y + 0.5) * 100).toFixed(2)}%`);
    stage.style.setProperty("--world-pointer-intensity", pointerIntensity.toFixed(3));
    if (imageElement)
      imageElement.style.setProperty("--world-image-scale", pointer.active ? "1.145" : "1.12");
    const desiredEye = [pointer.x * 5.4, 5.8 - pointer.y * 2.2, 12 + pointer.y * 3.2];
    const desiredTarget = [pointer.x * 3.2, 2.2 - pointer.y * 0.65, -34];
    const cameraBlend = reducedMotion ? 1 : 0.11;
    camera.eye = camera.eye.map(
      (value, index) => value + (desiredEye[index] - value) * cameraBlend,
    );
    camera.target = camera.target.map(
      (value, index) => value + (desiredTarget[index] - value) * cameraBlend,
    );
    const projection = perspectiveMatrix(Math.PI / 3.05, width / height, 0.1, 180);
    currentViewProjection = multiplyMatrices(projection, lookAtMatrix(camera.eye, camera.target));

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawMesh(geometry.stars, gl.POINTS, currentViewProjection, colors.starGlow, 4.4 * pixelRatio);
    drawMesh(geometry.stars, gl.POINTS, currentViewProjection, colors.star, 1.25 * pixelRatio);
    drawMesh(
      geometry.warmStars,
      gl.POINTS,
      currentViewProjection,
      [1, 0.48, 0.82, 0.48],
      1.5 * pixelRatio,
    );
    drawMesh(geometry.dust, gl.POINTS, currentViewProjection, colors.dust, 2.1 * pixelRatio);
    drawRing(geometry.skyRing, 0, 6.4, -44, 1.22, 0.78, time * 0.00006, colors.orbit);
    drawRing(geometry.skyRingWide, -4, 10.6, -76, 1.35, 0.64, -time * 0.00004, colors.orbitWarm);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    const planetPoses = landmarks.map((landmark) => getLandmarkPose(landmark, time, reducedMotion));
    landmarks.forEach((landmark, index) => drawPlanet(landmark, time, colors, planetPoses[index]));
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

  if (coordinatesElement) coordinatesElement.textContent = "ORBIT 03 / 770";
  if (speedElement) speedElement.textContent = "03";
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
