import { logger } from "./logger.js";
import { startServer } from "./server.js";
import { start } from "./workloop.js";

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;

async function main(): Promise<void> {
  logger.info("TraeNuPI v0.1.0 - Autonomous daemon for Trae AI");
  logger.info("Headless mode: no TUI, output via structured logs");
  logger.info("Control: curl http://localhost:5222/status");

  await startServer();

  const autoStart = process.env.TRAENUPI_AUTOSTART !== "false";
  if (autoStart) {
    logger.info("Auto-starting work loop...");
    await start();
  } else {
    logger.info("Auto-start disabled. POST /start to begin.");
  }

  for (const sig of SHUTDOWN_SIGNALS) {
    process.on(sig, () => {
      logger.info(`Received ${sig}, shutting down...`);
      process.exit(0);
    });
  }

  process.on("exit", () => {
    logger.info("TraeNuPI shutdown complete");
  });
}

main().catch((e) => {
  logger.error(`Fatal: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
