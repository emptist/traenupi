import { spawn, type ChildProcess } from "child_process";
import { getNupiCommand } from "./config.js";
import { logger } from "./logger.js";

let nupiProcess: ChildProcess | null = null;
let nupiPid: number | null = null;

export function isNupiRunning(): boolean {
  return nupiProcess !== null && nupiProcess.exitCode === null;
}

export function getNupiPid(): number | null {
  return nupiPid;
}

export function startNupi(): boolean {
  if (isNupiRunning()) {
    logger.warn("NuPI already running");
    return false;
  }

  const cmd = getNupiCommand();
  logger.info(`Starting NuPI: ${cmd}`);

  try {
    nupiProcess = spawn(cmd, [], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        HTTP_PROXY: "",
        HTTPS_PROXY: "",
        ALL_PROXY: "",
      },
      detached: false,
    });

    nupiPid = nupiProcess.pid ?? null;
    logger.info(`NuPI spawned with PID ${nupiPid}`);

    nupiProcess.stdout?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").filter(Boolean);
      for (const line of lines) {
        logger.nupi(line);
      }
    });

    nupiProcess.stderr?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").filter(Boolean);
      for (const line of lines) {
        logger.nupi(`[stderr] ${line}`);
      }
    });

    nupiProcess.on("exit", (code, signal) => {
      const reason = signal ? `signal ${signal}` : `code ${code}`;
      logger.warn(`NuPI exited (${reason})`);
      nupiProcess = null;
      nupiPid = null;
    });

    nupiProcess.on("error", (err) => {
      logger.error(`NuPI spawn error: ${err.message}`);
      nupiProcess = null;
      nupiPid = null;
    });

    return true;
  } catch (e) {
    logger.error(`Failed to start NuPI: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

export function stopNupi(): void {
  if (!nupiProcess) {
    logger.warn("NuPI not running");
    return;
  }

  logger.info("Stopping NuPI...");
  nupiProcess.kill("SIGTERM");

  setTimeout(() => {
    if (nupiProcess && nupiProcess.exitCode === null) {
      logger.warn("NuPI did not exit, force killing...");
      nupiProcess.kill("SIGKILL");
    }
  }, 5000);
}

export function sendInput(text: string): boolean {
  if (!nupiProcess?.stdin) {
    logger.warn("NuPI stdin not available");
    return false;
  }

  nupiProcess.stdin.write(text + "\n");
  return true;
}
