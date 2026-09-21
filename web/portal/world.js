const MAX_PIXEL_RATIO = 2;
const WORLD_LIMIT = 118;

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
    v_shade = clamp(1.0 + a_position.y * 0.05 + a_position.z * 0.015, 0.86, 1.12);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  varying float v_point_mode;
  varying float v_shade;

  void main() {
    if (v_point_mode > 0.5 && distance(gl_PointCoord, vec2(0.5)) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(u_color.rgb * v_shade, u_color.a);
  }
`;

const cubeTriangles = new Float32Array([
  -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1,
  -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, -1, 1, 1,
  -1, -1, 1, -1, 1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, -1,
  1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1,
]);

const cubeLines = new Float32Array([
  -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, 1,
  1, -1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, 1, 1, -1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1,
  -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, -1, -1, 1, 1,
]);

const landmarks = [
  {
    id: "archive",
    label: "SLIDE LIBRARY",
    x: -9,
    z: -20,
    color: [0.18, 0.98, 0.78, 1],
    secondary: [0.18, 0.75, 0.92, 1],
  },
  {
    id: "brief",
    label: "STORY BRIEF",
    x: 9,
    z: -37,
    color: [1, 0.48, 0.27, 1],
    secondary: [1, 0.78, 0.33, 1],
  },
  {
    id: "process",
    label: "DECK REVIEW",
    x: -11,
    z: -57,
    color: [0.57, 0.62, 1, 1],
    secondary: [0.3, 0.9, 1, 1],
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

function makeGroundGrid() {
  const vertices = [];
  for (let x = -30; x <= 30; x += 2) {
    vertices.push(x, 0, 18, x, 0, -124);
  }
  for (let z = 18; z >= -124; z -= 2) {
    vertices.push(-30, 0, z, 30, 0, z);
  }
  return new Float32Array(vertices);
}

function makeRing(radius, y = 0.04, segments = 36) {
  const vertices = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }
  return new Float32Array(vertices);
}

function makeVerticalRing(radius, segments = 36) {
  const vertices = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  }
  return new Float32Array(vertices);
}

function makeParticles() {
  const particles = [];
  for (let index = 0; index < 150; index += 1) {
    const seed = index * 12.9898;
    particles.push({
      x: ((Math.sin(seed) * 43758.5453) % 1) * 25,
      y: 0.8 + ((index * 29) % 60) / 10,
      z: -((index * 17) % 134) + 8,
      phase: (index * 0.73) % (Math.PI * 2),
      size: 1.8 + ((index * 11) % 7),
    });
  }
  return particles;
}

function makeStarfield(count = 360, seedOffset = 0) {
  const vertices = [];
  for (let index = 0; index < count; index += 1) {
    const seed = (index + seedOffset) * 17.237 + 4.91;
    const random = (value) => value - Math.floor(value);
    const x = random(Math.sin(seed) * 43758.5453) * 76 - 38;
    const y = 0.8 + random(Math.sin(seed * 1.7) * 24634.6345) * 19;
    const z = -10 - random(Math.sin(seed * 2.3) * 12457.821) * 116;
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
        background: [0.93, 0.97, 0.97, 1],
        grid: [0.02, 0.42, 0.44, 0.19],
        gridBright: [0.02, 0.6, 0.58, 0.38],
        starGlow: [0.18, 0.43, 0.56, 0.08],
        star: [0.32, 0.54, 0.62, 0.38],
        starWarm: [0.72, 0.38, 0.3, 0.22],
        vehicle: [0.02, 0.2, 0.23, 1],
        vehicleEdge: [0, 0.54, 0.52, 0.96],
        white: [0.1, 0.2, 0.22, 0.8],
      }
    : {
        background: [0.008, 0.018, 0.03, 1],
        grid: [0.03, 0.3, 0.34, 0.22],
        gridBright: [0.05, 0.65, 0.62, 0.46],
        starGlow: [0.2, 0.38, 0.96, 0.12],
        star: [0.67, 0.82, 1, 0.78],
        starWarm: [1, 0.49, 0.28, 0.62],
        vehicle: [0.02, 0.12, 0.17, 1],
        vehicleEdge: [0.13, 0.98, 0.78, 0.96],
        white: [0.75, 0.95, 0.94, 0.75],
      };
}

function setupDomControls(stage, onTarget, activateDrive) {
  const startButton = stage.querySelector("[data-world-start]");
  startButton?.addEventListener("click", activateDrive);

  stage.querySelectorAll("[data-world-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.worldTarget;
      if (target) onTarget?.(target);
    });
  });
}

export function setupXLabWorld({ canvas, stage, onTarget = () => {} }) {
  if (!canvas || !stage) return;

  const input = { forward: false, back: false, left: false, right: false };
  const vehicle = {
    x: 1.8,
    z: 5,
    speed: 0,
    heading: 0,
    targetX: null,
    targetZ: null,
  };
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const particles = makeParticles();
  const stars = makeStarfield(360, 13);
  const warmStars = makeStarfield(84, 947);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  let animationFrame = 0;
  let isVisible = true;
  let width = 1;
  let height = 1;
  let lastTime = 0;
  let frameDelta = 0;

  const activateDrive = () => {
    stage.classList.add("is-driving");
    if (statusElement) statusElement.textContent = "DRIVE MODE";
    stage.focus({ preventScroll: true });
  };

  const setInput = (command, active) => {
    if (!(command in input)) return;
    input[command] = active;
    if (active) activateDrive();
  };

  const keyMap = {
    ArrowUp: "forward",
    w: "forward",
    W: "forward",
    ArrowDown: "back",
    s: "back",
    S: "back",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };

  const handleKey = (event, active) => {
    const command = keyMap[event.key];
    if (!command) return;
    event.preventDefault();
    setInput(command, active);
  };

  stage.addEventListener("keydown", (event) => handleKey(event, true));
  stage.addEventListener("keyup", (event) => handleKey(event, false));
  window.addEventListener("blur", () => {
    Object.keys(input).forEach((key) => {
      input[key] = false;
    });
  });

  stage.querySelectorAll("[data-world-command]").forEach((button) => {
    const command = button.dataset.worldCommand;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      setInput(command, true);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
      button.addEventListener(eventName, () => setInput(command, false));
    });
  });

  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
  });
  stage.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });

  setupDomControls(
    stage,
    (target) => {
      const landmark = landmarks.find((item) => item.id === target);
      if (landmark) {
        vehicle.targetX = landmark.x;
        vehicle.targetZ = landmark.z + 7;
        vehicle.speed = 0;
        stage.classList.add("is-driving");
        if (statusElement) statusElement.textContent = "SIGNAL LOCK";
      }
      onTarget(target);
    },
    activateDrive,
  );

  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function updateHud() {
    const nearest = landmarks.reduce(
      (closest, landmark) => {
        const distance = Math.hypot(vehicle.x - landmark.x, vehicle.z - landmark.z);
        return distance < closest.distance ? { landmark, distance } : closest;
      },
      { landmark: null, distance: Number.POSITIVE_INFINITY },
    );
    if (coordinatesElement) {
      coordinatesElement.textContent = `${vehicle.x.toFixed(2).padStart(6, "0")} / ${Math.abs(vehicle.z).toFixed(2).padStart(6, "0")}`;
    }
    if (speedElement)
      speedElement.textContent = String(Math.round(Math.abs(vehicle.speed) * 8)).padStart(2, "0");
    if (targetLabelElement)
      targetLabelElement.textContent = nearest.distance < 15 ? nearest.landmark.label : "NO SIGNAL";
    locationButtons.forEach((button, id) =>
      button.classList.toggle("is-active", nearest.landmark?.id === id),
    );
  }

  function updateVehicle(delta) {
    if (vehicle.targetX !== null && vehicle.targetZ !== null) {
      const jumpBlend = 1 - Math.exp(-delta * 4.2);
      vehicle.x += (vehicle.targetX - vehicle.x) * jumpBlend;
      vehicle.z += (vehicle.targetZ - vehicle.z) * jumpBlend;
      vehicle.heading *= 1 - jumpBlend;
      if (Math.hypot(vehicle.targetX - vehicle.x, vehicle.targetZ - vehicle.z) < 0.04) {
        vehicle.x = vehicle.targetX;
        vehicle.z = vehicle.targetZ;
        vehicle.targetX = null;
        vehicle.targetZ = null;
      }
      return;
    }
    const targetSpeed = input.forward ? 9 : input.back ? -4.5 : 0;
    const speedBlend = 1 - Math.exp(-delta * 5.5);
    vehicle.speed += (targetSpeed - vehicle.speed) * speedBlend;
    vehicle.speed = clamp(vehicle.speed, -5, 10);
    const steering = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    vehicle.heading += steering * delta * (1.05 + Math.abs(vehicle.speed) * 0.08);
    vehicle.x += Math.sin(vehicle.heading) * vehicle.speed * delta;
    vehicle.z -= Math.cos(vehicle.heading) * vehicle.speed * delta;
    vehicle.x = clamp(vehicle.x, -22, 22);
    if (vehicle.z < -WORLD_LIMIT) vehicle.z = 12;
    if (vehicle.z > 18) vehicle.z = -WORLD_LIMIT + 6;
  }

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });
  if (!gl) {
    stage.classList.add("world-fallback");
    return;
  }

  const program = createProgram(gl);
  if (!program) {
    stage.classList.add("world-fallback");
    return;
  }

  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  const pointSizeLocation = gl.getUniformLocation(program, "u_point_size");
  const buffers = new Map();
  const grid = makeGroundGrid();
  const groundRing = makeRing(6, 0.05);
  const vehicleRing = makeRing(2.7, 0.08);
  const verticalRing = makeVerticalRing(2.8);

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

  const geometry = {
    cube: getBuffer("cube", cubeTriangles),
    cubeLines: getBuffer("cube-lines", cubeLines),
    grid: getBuffer("grid", grid),
    stars: getBuffer("stars", stars),
    warmStars: getBuffer("warm-stars", warmStars),
    groundRing: getBuffer("ground-ring", groundRing),
    vehicleRing: getBuffer("vehicle-ring", vehicleRing),
    verticalRing: getBuffer("vertical-ring", verticalRing),
  };

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

  function drawCube(x, y, z, scaleX, scaleY, scaleZ, rotation, color, edgeColor) {
    const matrix = multiplyMatrices(
      currentViewProjection,
      modelMatrix(x, y, z, scaleX, scaleY, scaleZ, rotation),
    );
    drawMesh(geometry.cube, gl.TRIANGLES, matrix, color);
    if (edgeColor) drawMesh(geometry.cubeLines, gl.LINES, matrix, edgeColor);
  }

  function drawRing(item, x, y, z, scale, rotation, color) {
    const matrix = multiplyMatrices(
      currentViewProjection,
      modelMatrix(x, y, z, scale, scale, scale, rotation),
    );
    drawMesh(item, gl.LINE_STRIP, matrix, color);
  }

  function drawSlidePanel(x, y, z, rotation, accent, secondary, scale = 1) {
    const panel = [0.025, 0.12, 0.16, 0.96];
    const panelEdge = [...secondary.slice(0, 3), 0.76];
    const faceAccent = [...accent.slice(0, 3), 0.9];
    drawCube(x, y, z, 1.45 * scale, 0.94 * scale, 0.08 * scale, rotation, panel, panelEdge);
    drawCube(
      x,
      y + 0.55 * scale,
      z + 0.12 * scale,
      0.88 * scale,
      0.045 * scale,
      0.045 * scale,
      rotation,
      faceAccent,
    );
    drawCube(
      x - 0.32 * scale,
      y + 0.12 * scale,
      z + 0.12 * scale,
      0.52 * scale,
      0.035 * scale,
      0.04 * scale,
      rotation,
      [...secondary.slice(0, 3), 0.72],
    );
    drawCube(
      x + 0.3 * scale,
      y - 0.18 * scale,
      z + 0.12 * scale,
      0.36 * scale,
      0.035 * scale,
      0.04 * scale,
      rotation,
      [...accent.slice(0, 3), 0.58],
    );
  }

  function drawLandmark(landmark, time, colors) {
    const rotation = time * 0.00025 + landmark.x * 0.08;
    const baseColor = landmark.color;
    const edgeColor = [...landmark.secondary.slice(0, 3), 0.8];
    drawCube(
      landmark.x,
      0.9,
      landmark.z,
      2.2,
      0.8,
      2.2,
      rotation,
      [baseColor[0] * 0.35, baseColor[1] * 0.28, baseColor[2] * 0.32, 0.7],
      edgeColor,
    );
    drawSlidePanel(
      landmark.x,
      3.05,
      landmark.z - 0.3,
      rotation * 0.55,
      baseColor,
      landmark.secondary,
      1.08,
    );
    drawSlidePanel(
      landmark.x + 2.5,
      1.85,
      landmark.z + 1.6,
      -rotation * 0.8,
      landmark.secondary,
      baseColor,
      0.58,
    );
    drawCube(landmark.x, 5.05, landmark.z, 0.12, 1.05, 0.12, rotation, baseColor, [
      ...colors.white.slice(0, 3),
      0.62,
    ]);
    drawRing(
      geometry.groundRing,
      landmark.x,
      0.11,
      landmark.z,
      3.4 + Math.sin(time * 0.001 + landmark.x) * 0.14,
      rotation,
      [...baseColor.slice(0, 3), 0.65],
    );
    drawRing(geometry.verticalRing, landmark.x, 2.9, landmark.z, 1.8, rotation * 1.6, [
      ...landmark.secondary.slice(0, 3),
      0.36,
    ]);
  }

  function drawVehicle(time, colors) {
    const bodyColor = colors.vehicle;
    const edgeColor = colors.vehicleEdge;
    const bounce = Math.sin(time * 0.006) * 0.035;
    drawRing(
      geometry.vehicleRing,
      vehicle.x,
      0.14,
      vehicle.z,
      1 + Math.sin(time * 0.004) * 0.04,
      vehicle.heading,
      [edgeColor[0], edgeColor[1], edgeColor[2], 0.72],
    );
    drawCube(
      vehicle.x,
      1.04 + bounce,
      vehicle.z - Math.cos(vehicle.heading) * 0.12,
      0.94,
      0.035,
      1.18,
      vehicle.heading,
      [edgeColor[0], edgeColor[1], edgeColor[2], 0.8],
    );
    drawCube(
      vehicle.x,
      0.64 + bounce,
      vehicle.z,
      1.28,
      0.35,
      2.05,
      vehicle.heading,
      bodyColor,
      edgeColor,
    );
    drawCube(
      vehicle.x,
      1.19 + bounce,
      vehicle.z + Math.cos(vehicle.heading) * 0.18,
      0.84,
      0.46,
      0.9,
      vehicle.heading,
      [0.03, 0.24, 0.28, 0.96],
      [0.7, 1, 0.93, 0.92],
    );
    drawCube(
      vehicle.x,
      0.43,
      vehicle.z - Math.cos(vehicle.heading) * 1.58,
      1.08,
      0.09,
      0.24,
      vehicle.heading,
      [edgeColor[0], edgeColor[1], edgeColor[2], 0.9],
    );
    const wheelOffsetX = Math.cos(vehicle.heading) * 0.92;
    const wheelOffsetZ = Math.sin(vehicle.heading) * 0.92;
    drawCube(
      vehicle.x - wheelOffsetX,
      0.31,
      vehicle.z - wheelOffsetZ,
      0.19,
      0.27,
      0.44,
      vehicle.heading,
      [0.01, 0.025, 0.04, 1],
    );
    drawCube(
      vehicle.x + wheelOffsetX,
      0.31,
      vehicle.z + wheelOffsetZ,
      0.19,
      0.27,
      0.44,
      vehicle.heading,
      [0.01, 0.025, 0.04, 1],
    );
  }

  let currentViewProjection = identityMatrix();
  const camera = {
    eye: [0, 6, 14],
    target: [0, 1.2, -6],
  };
  function draw(time) {
    const colors = getColors();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors.background[0], colors.background[1], colors.background[2], 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pointer.x += (pointer.targetX - pointer.x) * (reducedMotion ? 1 : 0.06);
    pointer.y += (pointer.targetY - pointer.y) * (reducedMotion ? 1 : 0.06);
    const forward = [Math.sin(vehicle.heading), 0, -Math.cos(vehicle.heading)];
    const behind = [-forward[0], 0, -forward[2]];
    const desiredEye = [
      vehicle.x + behind[0] * 9.3 + pointer.x * 2.1,
      6 + pointer.y * 1.3,
      vehicle.z + behind[2] * 9.3 + pointer.y * 1.5,
    ];
    const desiredTarget = [vehicle.x + forward[0] * 13 - 2.4, 1.2, vehicle.z + forward[2] * 13];
    const cameraBlend = reducedMotion ? 1 : 1 - Math.exp(-Math.max(frameDelta, 0.016) * 5);
    camera.eye = camera.eye.map(
      (value, index) => value + (desiredEye[index] - value) * cameraBlend,
    );
    camera.target = camera.target.map(
      (value, index) => value + (desiredTarget[index] - value) * cameraBlend,
    );
    const projection = perspectiveMatrix(Math.PI / 3.1, width / height, 0.1, 180);
    currentViewProjection = multiplyMatrices(projection, lookAtMatrix(camera.eye, camera.target));

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawMesh(geometry.stars, gl.POINTS, currentViewProjection, colors.starGlow, 4.8 * pixelRatio);
    drawMesh(geometry.stars, gl.POINTS, currentViewProjection, colors.star, 1.25 * pixelRatio);
    drawMesh(
      geometry.warmStars,
      gl.POINTS,
      currentViewProjection,
      colors.starWarm,
      1.55 * pixelRatio,
    );
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    drawMesh(geometry.grid, gl.LINES, currentViewProjection, colors.grid);
    drawRing(geometry.groundRing, 0, 0.05, -1, 6, time * 0.00012, colors.gridBright);
    landmarks.forEach((landmark) => drawLandmark(landmark, time, colors));
    drawVehicle(time, colors);

    const particleVertices = [];
    particles.forEach((particle) => {
      const drift = reducedMotion ? 0 : Math.sin(time * 0.0004 + particle.phase) * 0.32;
      particleVertices.push(
        particle.x + drift,
        particle.y + Math.sin(time * 0.001 + particle.phase) * 0.18,
        particle.z,
      );
    });
    const particleBuffer = getBuffer("particles", new Float32Array(particleVertices));
    if (particleBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleVertices), gl.DYNAMIC_DRAW);
      gl.depthMask(false);
      drawMesh(
        particleBuffer,
        gl.POINTS,
        currentViewProjection,
        colors.gridBright,
        2.5 * pixelRatio,
      );
      gl.depthMask(true);
    }
  }

  function loop(time) {
    animationFrame = 0;
    if (!isVisible || document.hidden) return;
    const delta = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
    lastTime = time;
    frameDelta = delta;
    updateVehicle(delta);
    updateHud();
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
