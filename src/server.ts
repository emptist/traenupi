import { createServer } from "http";
import { Hono } from "hono";
import { getPort } from "./config.js";
import * as workloop from "./workloop.js";
import * as nezha from "./nezha.js";
import * as opencode from "./opencode.js";
import { logger } from "./logger.js";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/status", async (c) => {
  const status = workloop.getStatus();
  status.nezhaConnected = await nezha.isNezhaRunning();
  status.opencodeConnected = await opencode.isOpenCodeRunning();
  return c.json(status);
});

app.post("/start", async (c) => {
  await workloop.start();
  return c.json({ ok: true, message: "daemon started" });
});

app.post("/stop", (c) => {
  workloop.stop();
  return c.json({ ok: true, message: "daemon stopped" });
});

app.post("/work", async (c) => {
  const result = await workloop.forceWork();
  return c.json({ ok: true, result });
});

app.post("/delegate", async (c) => {
  const body = await c.req.json<{ task: string }>();
  if (!body.task) {
    return c.json({ ok: false, error: "missing task" }, 400);
  }
  const result = await workloop.delegateTask(body.task);
  return c.json({ ok: true, result });
});

app.get("/usage", async (c) => {
  const usage = await opencode.checkUsage();
  return c.json({ usage });
});

export function startServer(): Promise<void> {
  const port = getPort();
  logger.info(`Starting HTTP API on port ${port}`);

  return new Promise((resolve) => {
    createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:${port}`);
      let body: string | undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        body = await new Promise<string>((resolveBody) => {
          let data = "";
          req.on("data", (chunk: Buffer) => {
            data += chunk;
          });
          req.on("end", () => resolveBody(data));
        });
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          headers.set(key, value.join(", "));
        }
      }

      const request = new Request(url, {
        method: req.method,
        headers,
        body,
      });

      const response = await app.fetch(request);
      res.statusCode = response.status;
      response.headers.forEach((v, k) => res.setHeader(k, v));
      res.end(await response.text());
    }).listen(port, () => {
      logger.info(`HTTP API listening on port ${port}`);
      resolve();
    });
  });
}
