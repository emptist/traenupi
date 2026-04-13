import type { DaemonStatus } from "./types.js";
import * as nezha from "./nezha.js";
import * as nupi from "./nupi.js";
import { logger } from "./logger.js";

let running = false;
let startTime = 0;
let lastActivity: string | null = null;
let restartCount = 0;
let healthTimer: ReturnType<typeof setInterval> | null = null;

export function getStatus(): DaemonStatus {
  return {
    running,
    uptime: running ? Date.now() - startTime : 0,
    nupiPid: nupi.getNupiPid(),
    nupiConnected: nupi.isNupiRunning(),
    nezhaConnected: false,
    lastActivity,
    restartCount,
  };
}

async function healthCheck(): Promise<void> {
  if (!nupi.isNupiRunning() && running) {
    restartCount++;
    logger.warn(`NuPI died, restarting (attempt ${restartCount})...`);
    const ok = nupi.startNupi();
    if (ok) {
      lastActivity = new Date().toISOString();
    } else {
      logger.error("NuPI restart failed");
    }
  }
}

export async function start(): Promise<void> {
  if (running) {
    logger.warn("Already running");
    return;
  }

  running = true;
  startTime = Date.now();
  restartCount = 0;
  logger.info("TraeNuPI daemon started");

  const nezhaOk = await nezha.isNezhaRunning();
  logger.info(`Nezha: ${nezhaOk ? "connected" : "not reachable"}`);

  const ok = nupi.startNupi();
  if (ok) {
    lastActivity = new Date().toISOString();
    logger.info("NuPI started");
  } else {
    logger.error("NuPI failed to start");
  }

  healthTimer = setInterval(healthCheck, 30000);
  logger.info("Health check every 30s");
}

export function stop(): void {
  if (healthTimer) {
    clearInterval(healthTimer);
    healthTimer = null;
  }
  nupi.stopNupi();
  running = false;
  logger.info("TraeNuPI daemon stopped");
}

export function sendToNupi(text: string): boolean {
  return nupi.sendInput(text);
}
