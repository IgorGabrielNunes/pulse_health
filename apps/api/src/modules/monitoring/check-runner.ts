import type { Application } from '../../generated/prisma/client.js';
import type { Database } from '../../infra/database.js';
import type { Probe, ProbeTarget } from './probe.js';

export interface CheckTarget extends ProbeTarget {
  id: string;
  checkIntervalSeconds: number;
}

export class CheckRunner {
  constructor(
    private readonly db: Database,
    private readonly probe: Probe,
  ) {}

  async run(target: CheckTarget): Promise<Application> {
    const result = await this.probe(target);
    const checkedAt = new Date();
    const nextCheckAt = new Date(checkedAt.getTime() + target.checkIntervalSeconds * 1_000);

    const [, application] = await this.db.$transaction([
      this.db.healthCheck.create({
        data: { applicationId: target.id, checkedAt, ...result },
      }),
      this.db.application.update({
        where: { id: target.id },
        data: {
          status: result.status,
          lastLatencyMs: result.latencyMs,
          lastCheckedAt: checkedAt,
          nextCheckAt,
        },
      }),
    ]);

    return application;
  }
}
