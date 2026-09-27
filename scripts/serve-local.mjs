import { appendFileSync, createReadStream, watch, writeFileSync } from "node:fs";
import { access, readFile, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { format } from "node:util";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logPath = join(projectRoot, "log.txt");
const host = "127.0.0.1";
const port = Number(process.env.PORT || process.argv[2] || 4173);
const localBuildRoot = join(
  tmpdir(),
  "presentlab-local-builds",
  `${process.pid}-${port}-${Date.now()}`,
);
const reloadClients = new Set();
const fileWatchers = [];
const localBuildOutputs = new Set();
const retiredLocalBuildOutputs = new Set();
const activeResponsesByRoot = new Map();
let publicRoot = join(projectRoot, "public");
let buildVersion = 0;
const reloadClientSource = `(() => {
  const events = new EventSource("/__local/events");
  window.__presentlabLocalReload = events;
  events.addEventListener("reload", () => window.location.reload());
})();
`;

function writeLog(level, ...values) {
  const message = format(...values).replace(/\r\n?/g, "\n");
  const lines = message.split("\n");
  if (lines.at(-1) === "") lines.pop();
  if (lines.length === 0) lines.push("");

  const timestamp = new Date().toISOString();
  const entry = `${lines.map((line) => `[${timestamp}] [${level}] ${line}`).join("\n")}\n`;
  const terminal = level.includes("ERR") ? process.stderr : process.stdout;
  terminal.write(entry);

  try {
    appendFileSync(logPath, entry, "utf8");
  } catch (error) {
    process.stderr.write(`[${timestamp}] [ERROR] Could not write ${logPath}: ${error.message}\n`);
  }
}

console.log = (...values) => writeLog("INFO", ...values);
console.warn = (...values) => writeLog("WARN", ...values);
console.error = (...values) => writeLog("ERROR", ...values);

function logBuildOutput(stream, level) {
  let remainder = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const lines = `${remainder}${chunk.replace(/\r\n?/g, "\n")}`.split("\n");
    remainder = lines.pop() ?? "";
    for (const line of lines) writeLog(level, line);
  });
  stream.once("end", () => {
    if (remainder) writeLog(level, remainder);
  });
}

function beginBuildLog(changes, outputPath) {
  try {
    writeFileSync(logPath, "", "utf8");
  } catch (error) {
    process.stderr.write(`[${new Date().toISOString()}] [ERROR] Could not clear ${logPath}: ${error.message}\n`);
  }

  console.log(`[LOG] Cleared the previous log for watched build #${buildVersion}.`);
  console.log(`[BUILD] Starting watched build #${buildVersion}.`);
  console.log(`[BUILD] Changed source paths: ${changes.join(", ") || "unknown"}.`);
  console.log(`[BUILD] Output directory: ${outputPath}`);
}

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT: ${port}. Choose a port between 1 and 65535.`);
  process.exit(1);
}

try {
  await access(join(publicRoot, "index.html"));
} catch {
  console.error("The local site is not built yet. Run npm run vercel:build first.");
  process.exit(1);
}

function broadcast(eventName) {
  for (const client of reloadClients) {
    client.write(`event: ${eventName}\ndata: {}\n\n`);
  }
}

function sendFile(response, filePath, fileInfo, requestMethod) {
  const contentType = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": fileInfo.size,
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });

  if (requestMethod === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

function watchSources(watchPath, recursive) {
  try {
    const watcher = watch(watchPath, { recursive }, (_eventType, filename) => {
      const changedPath = filename ? filename.toString() : "a watched source";
      queueBuild(`source changed: ${changedPath}`);
    });
    watcher.on("error", (error) => {
      console.error(`Source watcher error for ${watchPath}: ${error.message}`);
    });
    fileWatchers.push(watcher);
  } catch (error) {
    console.error(`Could not watch ${watchPath}: ${error.message}`);
  }
}

let buildTimer;
let buildInProgress = false;
const pendingChanges = new Set();
const buildDebounceMs = 800;

async function removeLocalBuildOutput(outputPath) {
  if (!localBuildOutputs.delete(outputPath)) {
    return;
  }

  try {
    await rm(outputPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Could not clean an old local build: ${error.message}`);
  }
}

function retireLocalBuildOutput(outputPath) {
  if (!localBuildOutputs.has(outputPath)) {
    return;
  }

  if ((activeResponsesByRoot.get(outputPath) || 0) > 0) {
    retiredLocalBuildOutputs.add(outputPath);
    return;
  }

  void removeLocalBuildOutput(outputPath);
}

function trackResponseRoot(response, root) {
  activeResponsesByRoot.set(root, (activeResponsesByRoot.get(root) || 0) + 1);
  let released = false;

  const release = () => {
    if (released) {
      return;
    }
    released = true;

    const activeResponses = activeResponsesByRoot.get(root) || 0;
    if (activeResponses <= 1) {
      activeResponsesByRoot.delete(root);
      if (retiredLocalBuildOutputs.delete(root)) {
        void removeLocalBuildOutput(root);
      }
      return;
    }

    activeResponsesByRoot.set(root, activeResponses - 1);
  };

  response.once("finish", release);
  response.once("close", release);
}

function queueBuild(reason) {
  pendingChanges.add(reason);
  clearTimeout(buildTimer);
  if (!buildInProgress) {
    buildTimer = setTimeout(rebuild, buildDebounceMs);
  }
}

function runBuild(outputPath) {
  return new Promise((resolveBuild) => {
    console.log(`[BUILD] Running node scripts/build-vercel.mjs.`);
    console.log(`[BUILD] Temporary output: ${outputPath}`);
    const build = spawn(process.execPath, [join(projectRoot, "scripts", "build-vercel.mjs")], {
      cwd: projectRoot,
      env: { ...process.env, PRESENTLAB_BUILD_OUTPUT: outputPath },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    logBuildOutput(build.stdout, "BUILD OUT");
    logBuildOutput(build.stderr, "BUILD ERR");
    build.once("error", (error) => {
      console.error("Could not start the local build:", error.stack || error.message);
      resolveBuild(false);
    });
    build.once("close", (code, signal) => {
      if (code === 0) {
        console.log("Build process exited successfully.");
      } else {
        console.error(`Build process failed: exit code ${code ?? "unknown"}; signal ${signal ?? "none"}.`);
      }
      resolveBuild(code === 0);
    });
  });
}

async function rebuild() {
  buildTimer = undefined;
  if (buildInProgress) {
    return;
  }

  const changes = [...pendingChanges];
  pendingChanges.clear();
  buildInProgress = true;
  const outputPath = join(localBuildRoot, String(++buildVersion));
  beginBuildLog(changes, outputPath);
  const buildStartedAt = Date.now();
  console.log(`[BUILD] Rebuilding after ${changes.length} local source change(s).`);

  let succeeded = false;
  try {
    succeeded = await runBuild(outputPath);
  } catch (error) {
    console.error("Local build threw an unexpected error:", error.stack || error.message);
  }

  console.log(`[BUILD] Build attempt finished in ${Date.now() - buildStartedAt} ms.`);
  if (succeeded) {
    const previousPublicRoot = publicRoot;
    console.log("[BUILD] Activating the newly generated site output.");
    publicRoot = outputPath;
    localBuildOutputs.add(outputPath);
    retireLocalBuildOutput(previousPublicRoot);
    console.log(`[BUILD] Build #${buildVersion} complete; reloading ${reloadClients.size} connected browser tab(s).`);
    broadcast("reload");
  } else {
    try {
      await rm(outputPath, { recursive: true, force: true });
    } catch (error) {
      console.error("Could not clean a failed local build:", error.stack || error.message);
    }
    console.error("Local build failed; the previous site output remains active and browser tabs were left open.");
  }
  buildInProgress = false;

  if (pendingChanges.size > 0) {
    buildTimer = setTimeout(rebuild, buildDebounceMs);
  }
}

const server = createServer(async (request, response) => {
  const requestStartedAt = Date.now();
  const requestPath = (request.url || "/").split("?")[0];
  let responseLogged = false;
  const logResponse = () => {
    if (responseLogged) return;
    responseLogged = true;
    console.log(
      `[HTTP] ${request.method || "UNKNOWN"} ${requestPath} -> ${response.statusCode} in ${Date.now() - requestStartedAt} ms.`,
    );
  };
  response.once("finish", logResponse);
  response.once("close", logResponse);

  if (request.method !== "GET" && request.method !== "HEAD") {
    console.warn(`[HTTP] Rejected unsupported method ${request.method || "UNKNOWN"} for ${requestPath}.`);
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(request.url || "/", `http://${host}`);
  } catch {
    console.warn(`[HTTP] Rejected malformed URL for ${requestPath}.`);
    response.writeHead(400).end("Bad request");
    return;
  }

  if (requestUrl.pathname === "/__local/events") {
    if (request.method === "HEAD") {
      response.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8" }).end();
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    });
    response.write(": connected\n\n");
    reloadClients.add(response);
    console.log(`Browser connected to the local reload channel (${reloadClients.size} open).`);
    const heartbeat = setInterval(() => response.write(": keep-alive\n\n"), 15000);
    response.on("close", () => {
      clearInterval(heartbeat);
      reloadClients.delete(response);
      console.log(`Browser left the local reload channel (${reloadClients.size} open).`);
    });
    return;
  }

  if (requestUrl.pathname === "/__local/reload.js") {
    const body = Buffer.from(reloadClientSource);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": body.length,
      "Content-Type": "text/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    console.warn(`[HTTP] Rejected invalid path encoding for ${requestPath}.`);
    response.writeHead(400).end("Bad request");
    return;
  }

  const requestPublicRoot = publicRoot;
  const filePath = resolve(requestPublicRoot, `.${pathname}`);
  if (
    filePath !== requestPublicRoot &&
    !filePath.startsWith(`${requestPublicRoot}${sep}`)
  ) {
    console.warn(`[HTTP] Blocked path outside the site output: ${requestPath}.`);
    response.writeHead(403).end("Forbidden");
    return;
  }

  trackResponseRoot(response, requestPublicRoot);

  try {
    const fileInfo = await stat(filePath);
    const resolvedFile = fileInfo.isDirectory() ? join(filePath, "index.html") : filePath;
    const resolvedInfo = fileInfo.isDirectory() ? await stat(resolvedFile) : fileInfo;

    if (!resolvedInfo.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }

    if (extname(resolvedFile).toLowerCase() === ".html" && request.method === "GET") {
      const source = await readFile(resolvedFile, "utf8");
      const scriptTag = '<script src="/__local/reload.js" defer></script>';
      const html = /<\/body\s*>/i.test(source)
        ? source.replace(/<\/body\s*>/i, `${scriptTag}</body>`)
        : `${source}\n${scriptTag}`;
      const body = Buffer.from(html);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": body.length,
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(body);
      return;
    }

    sendFile(response, resolvedFile, resolvedInfo, request.method);
  } catch (error) {
    const status = error.code === "ENOENT" || error.code === "ENOTDIR" ? 404 : 500;
    if (status === 404) {
      console.warn(`[HTTP] File not found for ${requestPath}.`);
    } else {
      console.error(`[HTTP] Request failed for ${requestPath}:`, error.stack || error.message);
    }
    response.writeHead(status).end(status === 404 ? "Not found" : "Server error");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Run with another port, for example: run.bat 4174.`);
    for (const watcher of fileWatchers) {
      watcher.close();
    }
    fileWatchers.length = 0;
    process.exitCode = 1;
    return;
  }
  console.error("Local HTTP server failed:", error.stack || error.message);
  for (const watcher of fileWatchers) {
    watcher.close();
  }
  fileWatchers.length = 0;
  process.exitCode = 1;
});

let isShuttingDown = false;
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[SERVER] Received ${signal}; stopping watchers and closing browser connections.`);
  clearTimeout(buildTimer);
  for (const watcher of fileWatchers) {
    watcher.close();
  }
  fileWatchers.length = 0;
  for (const client of reloadClients) {
    client.end();
  }
  reloadClients.clear();
  server.close(() => console.log("[SERVER] Local HTTP server stopped."));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

watchSources(join(projectRoot, "web"), true);
watchSources(join(projectRoot, "resources"), true);
watchSources(join(projectRoot, "scripts", "build-vercel.mjs"), false);

server.listen(port, host, () => {
  const url = `http://${host}:${port}/`;
  console.log(`[SERVER] PresentLab is available at ${url}`);
  console.log(`[SERVER] Project root: ${projectRoot}`);
  console.log(`[SERVER] Active site output: ${publicRoot}`);
  console.log(`[SERVER] Detailed log file: ${logPath}`);
  console.log("[WATCH] Watching web, resources, and scripts/build-vercel.mjs.");
  console.log("[SERVER] Press Ctrl+C to stop the local server.");

  if (process.env.NO_BROWSER !== "1") {
    console.log(`[BROWSER] Opening ${url}`);
    const browser = spawn("rundll32.exe", ["url.dll,FileProtocolHandler", url], {
      detached: true,
      shell: false,
      stdio: "ignore",
      windowsHide: true,
    });
    browser.once("error", (error) => console.error("Could not open the browser:", error.stack || error.message));
    browser.unref();
  } else {
    console.log("[BROWSER] Automatic browser launch disabled by NO_BROWSER=1.");
  }
});
