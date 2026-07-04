import { registerAssetProcessingJob } from "./jobs/asset-processing/index.js";
import { registerLearningSummaryJob } from "./jobs/learning-summary/index.js";
import { registerReportGenerationJob } from "./jobs/report-generation/index.js";

const serviceName = "worker";
const statusIntervalMs = Number(process.env.WORKER_STATUS_INTERVAL_MS ?? 30_000);

function startWorker() {
  console.log(`[${serviceName}] starting Werkelwelt worker service`);

  // Future Redis-backed queue setup can be initialized here without changing job modules.
  registerReportGenerationJob();
  registerLearningSummaryJob();
  registerAssetProcessingJob();

  const interval = setInterval(() => {
    console.log(`[${serviceName}] status=ok`);
  }, statusIntervalMs);

  process.on("SIGTERM", () => {
    console.log(`[${serviceName}] received SIGTERM, shutting down`);
    clearInterval(interval);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log(`[${serviceName}] received SIGINT, shutting down`);
    clearInterval(interval);
    process.exit(0);
  });
}

startWorker();
