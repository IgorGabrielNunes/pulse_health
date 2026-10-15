import type { FastifyBaseLogger } from 'fastify';
import type { Database } from '../../infra/database.js';
import type { CheckRunner, CheckTarget } from './check-runner.js';

interface SchedulerOptions {
  tickMs: number;
  batchSize: number;
  retentionDays: number;
}

const PRUNE_INTERVAL_MS = 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

export class MonitorScheduler {
  private tickTimer: NodeJS.Timeout | undefined;
  private pruneTimer: NodeJS.Timeout | undefined;
  private inFlight: Promise<void> | undefined;

  constructor(
    private readonly db: Database,
    private readonly runner: CheckRunner,
    private readonly logger: FastifyBaseLogger,
    private readonly options: SchedulerOptions,
  ) {}

  start(): void {
    this.tickTimer = setInterval(() => this.tick(), this.options.tickMs);
    this.pruneTimer = setInterval(() => void this.prune(), PRUNE_INTERVAL_MS);
    this.tick();
    this.logger.info(this.options, 'monitor scheduler started');
  }

  async stop(): Promise<void> {
    clearInterval(this.tickTimer);
    clearInterval(this.pruneTimer);
    await this.inFlight;
  }

  private tick(): void {
    if (this.inFlight) return;

    this.inFlight = this.runDueChecks()
      .catch((error: unknown) => this.logger.error({ err: error }, 'monitor tick failed'))
      .finally(() => {
        this.inFlight = undefined;
      });
  }

  private async runDueChecks(): Promise<void> {
    const targets = await this.claimDueTargets();
    if (targets.length === 0) return;

    const results = await Promise.allSettled(targets.map((target) => this.runner.run(target)));

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn({ err: result.reason, applicationId: targets[index]?.id }, 'check failed to persist');
      }
    });
  }

  /**
   * Atomically pushes `next_check_at` forward for a batch of due applications.
   * `SKIP LOCKED` lets several API instances share the workload without
   * checking the same application twice.
   */
  private claimDueTargets(): Promise<CheckTarget[]> {
    return this.db.$queryRaw<CheckTarget[]>`
      UPDATE applications AS app
      SET next_check_at = now() + make_interval(secs => app.check_interval_seconds)
      FROM (
        SELECT id
        FROM applications
        WHERE paused = false AND next_check_at <= now()
        ORDER BY next_check_at
        LIMIT ${this.options.batchSize}
        FOR UPDATE SKIP LOCKED
      ) AS due
      WHERE app.id = due.id
      RETURNING
        app.id,
        app.url,
        app.method::text AS "method",
        app.expected_status AS "expectedStatus",
        app.timeout_ms AS "timeoutMs",
        app.degraded_threshold_ms AS "degradedThresholdMs",
        app.check_interval_seconds AS "checkIntervalSeconds"
    `;
  }

  private async prune(): Promise<void> {
    const cutoff = new Date(Date.now() - this.options.retentionDays * DAY_MS);

    try {
      const { count } = await this.db.healthCheck.deleteMany({ where: { checkedAt: { lt: cutoff } } });
      if (count > 0) this.logger.info({ count }, 'pruned expired health checks');
    } catch (error) {
      this.logger.error({ err: error }, 'failed to prune health checks');
    }
  }
}
