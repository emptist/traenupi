import { createServer } from "http";
import { Hono } from "hono";
import { getPort } from "./config.js";
import * as workloop from "./workloop.js";
import { logger } from "./logger.js";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/status", async (c) => {
  const status = await workloop.getStatus();
  return c.json(status);
});

app.post("/start", async (c) => {
  await workloop.start();
  return c.json({ ok: true, message: "started" });
});

app.post("/stop", (c) => {
  workloop.stop();
  return c.json({ ok: true, message: "stopped" });
});

app.get("/tasks", async (c) => {
  const summary = await workloop.checkTasks();
  return c.text(summary);
});

app.get("/issues", async (c) => {
  const summary = await workloop.checkIssues();
  return c.text(summary);
});

app.post("/work", async (c) => {
  await workloop.forceWork();
  return c.json({ ok: true });
});

export function startServer(): Promise<void> {
  const port = getPort();
  logger.info(`HTTP API on port ${port}`);

  return new Promise((resolve) => {
    createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:${port}`);
      let body: string | undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        body = await new Promise<string>((resolveBody) => {
          let data = "";
          req.on("data", (chunk: Buffer) => { data += chunk; });
          req.on("end", () => resolveBody(data));
        });
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers.set(key, value);
        else if (Array.isArray(value)) headers.set(key, value.join(", "));
      }

      const request = new Request(url, { method: req.method, headers, body });
      const response = await app.fetch(request);
      res.statusCode = response.status;
      response.headers.forEach((v, k) => res.setHeader(k, v));
      res.end(await response.text());
    }).listen(port, () => {
      logger.info(`Listening on port ${port}`);
      resolve();
    });
  });
}
