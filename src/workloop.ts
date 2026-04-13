import { getNuPIClient, isSelfModelStrong } from "@nezha/nupi";
import { logger } from "./logger.js";

let running = false;
let startTime = 0;
let lastActivity: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollInterval = 120000;

export async function getStatus() {
  const client = getNuPIClient();
  let nezhaConnected = false;
  try {
    nezhaConnected = await client.isHealthy();
  } catch { /* ignore */ }

  return {
    running,
    uptime: running ? Date.now() - startTime : 0,
    nezhaConnected,
    modelStrong: isSelfModelStrong(),
    lastActivity,
  };
}

async function workCycle(): Promise<void> {
  const client = getNuPIClient();

  try {
    if (!await client.isHealthy()) {
      logger.warn("Nezha not healthy");
      return;
    }
  } catch {
    logger.warn("Nezha API not reachable");
    return;
  }

  try {
    const task = await client.getPendingTask();
    if (task) {
      logger.info(`[WORK] Task [P${task.priority}]: ${task.title} (id: ${task.id})`);
      if (task.description) logger.info(`[WORK] ${task.description.slice(0, 200)}`);
      lastActivity = new Date().toISOString();
      return;
    }
  } catch (e) {
    logger.warn(`Tasks check failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const issues = await client.getIssues(5);
    if (Array.isArray(issues) && issues.length > 0) {
      const i = issues[0] as any;
      logger.info(`[WORK] Issue [${i.severity || "?"}]: ${i.title} (id: ${i.id})`);
      lastActivity = new Date().toISOString();
      return;
    }
  } catch (e) {
    logger.warn(`Issues check failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  logger.info("No pending work");
}

export async function start(): Promise<void> {
  if (running) {
    logger.warn("Already running");
    return;
  }

  running = true;
  startTime = Date.now();
  logger.info("TraeNuPI daemon started");

  const status = await getStatus();
  logger.info(`Nezha: ${status.nezhaConnected ? "connected" : "not reachable"}`);
  logger.info(`Model: ${status.modelStrong ? "strong" : "weak"}`);

  await workCycle();

  pollTimer = setInterval(workCycle, pollInterval);
  logger.info(`Polling every ${pollInterval / 1000}s`);
}

export function stop(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  running = false;
  logger.info("TraeNuPI daemon stopped");
}

export async function forceWork(): Promise<void> {
  await workCycle();
}

export async function checkTasks(): Promise<string> {
  const client = getNuPIClient();
  try {
    const result = await client.getTasks({ status: "PENDING", limit: 10 });
    if (!result.rows || result.rows.length === 0) return "No pending tasks.";
    return result.rows.map((t, i) => `${i + 1}. [P${t.priority}] ${t.title} (id: ${t.id})`).join("\n");
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function checkIssues(): Promise<string> {
  const client = getNuPIClient();
  try {
    const issues = await client.getIssues(10);
    if (!Array.isArray(issues) || issues.length === 0) return "No open issues.";
    return issues.map((t: any, i: number) => `${i + 1}. [${t.severity || "?"}] ${t.title} (id: ${t.id})`).join("\n");
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}
