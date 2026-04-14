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

app.post("/tasks/:id/done", async (c) => {
  const id = c.req.param("id");
  const result = await workloop.completeTask(id);
  return c.json(result);
});

app.post("/tasks/:id/fail", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ error?: string }>().catch(() => ({ error: "failed" }));
  const result = await workloop.failTask(id, body.error || "failed");
  return c.json(result);
});

app.post("/broadcast", async (c) => {
  const body = await c.req.json<{ message: string }>();
  if (!body.message) return c.json({ ok: false, error: "missing message" }, 400);
  const result = await workloop.broadcast(body.message);
  return c.json(result);
});

app.post("/learn", async (c) => {
  const body = await c.req.json<{ content: string; tags?: string[] }>();
  if (!body.content) return c.json({ ok: false, error: "missing content" }, 400);
  const result = await workloop.saveLearning(body.content, body.tags);
  return c.json(result);
});

app.get("/prompt", async (c) => {
  const prompt = await workloop.generatePrompt();
  return c.text(prompt);
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
