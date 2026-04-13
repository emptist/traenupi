import type { NezhaWorkItem, DaemonStatus } from "./types.js";
import * as nezha from "./nezha.js";
import * as opencode from "./opencode.js";
import { logger } from "./logger.js";
import { getPollInterval } from "./config.js";

const DELEGATE_TIMEOUT = 300000;

let running = false;
let startTime = 0;
let tasksCompleted = 0;
let tasksFailed = 0;
let activeDelegations = 0;
let lastActivity: string | null = null;
let loopTimer: ReturnType<typeof setInterval> | null = null;

export function getStatus(): DaemonStatus {
  return {
    running,
    uptime: running ? Date.now() - startTime : 0,
    tasksCompleted,
    tasksFailed,
    nezhaConnected: false,
    opencodeConnected: false,
    activeDelegations,
    lastActivity,
  };
}

async function processWorkItem(item: NezhaWorkItem): Promise<void> {
  const taskDesc = `${item.title} ${item.description || ""}`;
  logger.info(`Found work: [${item.type}] ${item.title}`);

  if (item.type === "task") {
    const taken = await nezha.takeTask(item.id);
    if (!taken) {
      logger.warn(`Failed to take task ${item.id.slice(0, 8)}`);
      return;
    }
    logger.info(`Took task ${item.id.slice(0, 8)}`);
  }

  logger.delegate(`Delegating to OpenCode: ${item.title.slice(0, 60)}`);
  activeDelegations++;
  lastActivity = new Date().toISOString();

  try {
    const result = await opencode.delegate(taskDesc, DELEGATE_TIMEOUT);

    if (result.success) {
      tasksCompleted++;
      logger.delegate(
        `Success: ${result.output?.slice(0, 100) || "no output"}`,
      );
      if (item.type === "task") {
        await nezha.completeTask(item.id, result.output || "completed");
      }
    } else {
      tasksFailed++;
      logger.error(`Failed: ${result.error}`);
      if (item.type === "task") {
        await nezha.failTask(item.id, result.error || "unknown error");
      }
    }
  } catch (e) {
    tasksFailed++;
    logger.error(
      `Exception: ${e instanceof Error ? e.message : String(e)}`,
    );
  } finally {
    activeDelegations--;
    lastActivity = new Date().toISOString();
  }
}

async function workCycle(): Promise<void> {
  const nezhaOk = await nezha.isNezhaRunning();
  const opencodeOk = await opencode.isOpenCodeRunning();

  if (!nezhaOk) {
    logger.warn("Nezha API not reachable");
    return;
  }

  if (!opencodeOk) {
    logger.warn("OpenCode not reachable");
    return;
  }

  const usage = await opencode.checkUsage();
  if (usage.includes("FREE USAGE EXCEEDED")) {
    logger.warn(`OpenCode quota: ${usage}`);
    return;
  }

  const work = await nezha.fetchWork();
  if (!work) {
    logger.info("No pending work");
    return;
  }

  await processWorkItem(work);
}

export async function start(): Promise<void> {
  if (running) {
    logger.warn("Already running");
    return;
  }

  running = true;
  startTime = Date.now();
  logger.info("TraeNuPI daemon started");

  const nezhaOk = await nezha.isNezhaRunning();
  logger.info(`Nezha: ${nezhaOk ? "connected" : "not reachable"}`);

  const opencodeOk = await opencode.isOpenCodeRunning();
  logger.info(`OpenCode: ${opencodeOk ? "connected" : "not reachable"}`);

  if (opencodeOk) {
    const usage = await opencode.checkUsage();
    logger.info(`OpenCode quota: ${usage}`);
  }

  await workCycle();

  const interval = getPollInterval();
  loopTimer = setInterval(workCycle, interval);
  logger.info(`Polling every ${interval / 1000}s`);
}

export function stop(): void {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  running = false;
  logger.info("TraeNuPI daemon stopped");
}

export async function forceWork(): Promise<string> {
  await workCycle();
  return "Work cycle triggered";
}

export async function delegateTask(task: string): Promise<string> {
  logger.delegate(`Manual delegation: ${task.slice(0, 60)}`);
  activeDelegations++;
  lastActivity = new Date().toISOString();

  try {
    const result = await opencode.delegate(task, DELEGATE_TIMEOUT);
    if (result.success) {
      tasksCompleted++;
      return result.output || "completed";
    } else {
      tasksFailed++;
      return `Error: ${result.error}`;
    }
  } catch (e) {
    tasksFailed++;
    return `Exception: ${e instanceof Error ? e.message : String(e)}`;
  } finally {
    activeDelegations--;
    lastActivity = new Date().toISOString();
  }
}
