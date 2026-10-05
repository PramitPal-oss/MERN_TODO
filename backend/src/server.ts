import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

await connectDatabase();
const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, "API listening"));
const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down");
  server.close(async () => { await disconnectDatabase(); process.exit(0); });
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
