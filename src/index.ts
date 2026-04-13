import { logger } from "./logger.js";
import { startServer } from "./server.js";
import { start } from "./workloop.js";

async function main(): Promise<void> {
  logger.info("TraeNuPI v0.3.0 - Trae + NuPI");

  await startServer();

  if (process.env.TRAENUPI_AUTOSTART !== "false") {
    await start();
  } else {
    logger.info("Auto-start disabled. POST /start to begin.");
  }

  for (const sig of ["SIGINT", "SIGTERM", "SIGQUIT"] as const) {
    process.on(sig, () => {
      logger.info(`Received ${sig}, shutting down...`);
      process.exit(0);
    });
  }
}

main().catch((e) => {
  logger.error(`Fatal: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
