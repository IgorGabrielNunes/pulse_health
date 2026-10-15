import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createDatabase } from './infra/database.js';
import { ApplicationService } from './modules/applications/application.service.js';
import { CheckRunner } from './modules/monitoring/check-runner.js';
import { createHttpProbe } from './modules/monitoring/probe.js';
import { MonitorScheduler } from './modules/monitoring/scheduler.js';
import { createTargetGuard } from './modules/monitoring/target-guard.js';

const env = loadEnv();
const db = createDatabase(env.DATABASE_URL);

const probe = createHttpProbe(createTargetGuard({ allowPrivate: env.ALLOW_PRIVATE_TARGETS }));
const checkRunner = new CheckRunner(db, probe);
const applications = new ApplicationService(db, checkRunner);

const app = await buildApp({ env, db, applications });

const scheduler = new MonitorScheduler(db, checkRunner, app.log, {
  tickMs: env.MONITOR_TICK_MS,
  batchSize: env.MONITOR_BATCH_SIZE,
  retentionDays: env.CHECK_RETENTION_DAYS,
});

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, 'shutting down');

  try {
    await scheduler.stop();
    await app.close();
    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    app.log.error({ err: error }, 'graceful shutdown failed');
    process.exit(1);
  }
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

await app.listen({ host: env.HOST, port: env.PORT });
scheduler.start();
