import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import serverModule from "./dist/server/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, "dist", "client");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const app = serverModule.default ?? serverModule;
const port = Number(process.env.PORT || 3020);
const host = process.env.HOST || "127.0.0.1";

function requestUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const hostHeader = req.headers.host || `${host}:${port}`;
  return `${proto}://${hostHeader}${req.url || "/"}`;
}

async function sendFetchResponse(res, response) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText || res.statusMessage;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const nodeStream = Readable.fromWeb(response.body);
  nodeStream.on("error", (error) => {
    console.error("Response stream error", error);
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  });
  nodeStream.pipe(res);
}

function tryServeStatic(req, res) {
  if (!req.url || req.method !== "GET" && req.method !== "HEAD") return false;
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const candidate = pathname === "/favicon.ico"
    ? path.join(clientDir, "favicon.ico")
    : path.join(clientDir, pathname.replace(/^\/+/, ""));
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(path.resolve(clientDir) + path.sep)) return false;
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return false;

  res.statusCode = 200;
  const ext = path.extname(resolved).toLowerCase();
  res.setHeader("content-type", contentTypes[ext] || "application/octet-stream");
  res.setHeader("cache-control", pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600");
  if (req.method === "HEAD") {
    res.end();
  } else {
    fs.createReadStream(resolved).pipe(res);
  }
  return true;
}

const httpServer = http.createServer(async (req, res) => {
  try {
    if (tryServeStatic(req, res)) return;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item);
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    const method = req.method || "GET";
    const requestInit = {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : Readable.toWeb(req),
      duplex: "half",
    };

    const request = new Request(requestUrl(req), requestInit);
    const response = await app.fetch(request, process.env, {});
    await sendFetchResponse(res, response);
  } catch (error) {
    console.error("Request handling error", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
    }
    res.end("Internal Server Error");
  }
});

httpServer.listen(port, host, () => {
  console.log(`digital-nexus-os listening on http://${host}:${port}`);
});
