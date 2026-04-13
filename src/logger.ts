import type { LogEntry } from "./types.js";

const LOG_LEVELS = { info: "INFO", warn: "WARN", error: "ERROR", nupi: "NUPI" } as const;

export function log(level: LogEntry["level"], message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  const prefix = LOG_LEVELS[level];
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  console.log(`[${prefix}] ${entry.timestamp.slice(11, 19)} ${message}${dataStr}`);
}

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
  nupi: (msg: string, data?: unknown) => log("nupi", msg, data),
};
