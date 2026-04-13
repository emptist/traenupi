const LOG_LEVELS = { info: "INFO", warn: "WARN", error: "ERROR" } as const;

type LogLevel = keyof typeof LOG_LEVELS;

function log(level: LogLevel, msg: string, data?: unknown): void {
  const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
  const prefix = LOG_LEVELS[level];
  const line = data !== undefined
    ? `[${prefix}] ${ts} ${msg} ${JSON.stringify(data)}`
    : `[${prefix}] ${ts} ${msg}`;
  console.log(line);
}

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
};
