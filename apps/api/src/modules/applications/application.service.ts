import type { Application } from '../../generated/prisma/client.js';
import type { Database } from '../../infra/database.js';
import type { CheckRunner } from '../monitoring/check-runner.js';
import { NotFoundError, ValidationError } from '../shared/errors.js';
import { isUuid, parseOrThrow } from '../shared/validation.js';
import {
  createApplicationSchema,
  thresholdErrors,
  updateApplicationSchema,
} from './application.validation.js';

export interface StatusSummary {
  total: number;
  up: number;
  degraded: number;
  down: number;
  pending: number;
  paused: number;
}

export class ApplicationService {
  constructor(
    private readonly db: Database,
    private readonly checkRunner: CheckRunner,
  ) {}

  list(): Promise<Application[]> {
    return this.db.application.findMany({ orderBy: [{ name: 'asc' }, { createdAt: 'asc' }] });
  }

  async findById(id: string): Promise<Application | null> {
    if (!isUuid(id)) return null;
    return this.db.application.findUnique({ where: { id } });
  }

  async getById(id: string): Promise<Application> {
    const application = await this.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    return application;
  }

  async create(input: unknown): Promise<Application> {
    const data = parseOrThrow(createApplicationSchema, input);
    this.assertValidThreshold(data);

    return this.db.application.create({ data });
  }

  async update(id: string, input: unknown): Promise<Application> {
    const changes = parseOrThrow(updateApplicationSchema, input);
    const current = await this.getById(id);

    this.assertValidThreshold({ ...current, ...changes });

    const resumed = current.paused && changes.paused === false;
    const intervalChanged =
      changes.checkIntervalSeconds !== undefined &&
      changes.checkIntervalSeconds !== current.checkIntervalSeconds;

    return this.db.application.update({
      where: { id },
      data: {
        ...changes,
        ...(changes.url !== undefined && changes.url !== current.url && { status: 'PENDING' }),
        ...((resumed || intervalChanged) && { nextCheckAt: new Date() }),
      },
    });
  }

  async delete(id: string): Promise<string> {
    await this.getById(id);
    await this.db.application.delete({ where: { id } });
    return id;
  }

  async check(id: string): Promise<Application> {
    const application = await this.getById(id);
    return this.checkRunner.run(application);
  }

  async summarize(): Promise<StatusSummary> {
    const [byStatus, paused] = await Promise.all([
      this.db.application.groupBy({
        by: ['status'],
        where: { paused: false },
        _count: { _all: true },
      }),
      this.db.application.count({ where: { paused: true } }),
    ]);

    const countOf = (status: Application['status']) =>
      byStatus.find((group) => group.status === status)?._count._all ?? 0;

    const up = countOf('UP');
    const degraded = countOf('DEGRADED');
    const down = countOf('DOWN');
    const pending = countOf('PENDING');

    return { total: up + degraded + down + pending + paused, up, degraded, down, pending, paused };
  }

  private assertValidThreshold(timing: { timeoutMs: number; degradedThresholdMs: number }): void {
    const errors = thresholdErrors(timing);
    if (errors) throw new ValidationError('Invalid input', errors);
  }
}
