import DataLoader from 'dataloader';
import type { HealthCheck } from '../../generated/prisma/client.js';
import type { Database } from '../../infra/database.js';

export type UptimeWindow = 'DAY' | 'WEEK' | 'MONTH';

interface RecentChecksKey {
  applicationId: string;
  limit: number;
}

interface UptimeKey {
  applicationId: string;
  window: UptimeWindow;
}

const HOUR_MS = 60 * 60 * 1_000;

const windowDurationMs: Record<UptimeWindow, number> = {
  DAY: 24 * HOUR_MS,
  WEEK: 7 * 24 * HOUR_MS,
  MONTH: 30 * 24 * HOUR_MS,
};

function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

function createRecentChecksLoader(db: Database) {
  const loadForLimit = async (applicationIds: string[], limit: number) => {
    const rows = await db.$queryRaw<HealthCheck[]>`
      SELECT id, application_id AS "applicationId", status, status_code AS "statusCode",
             latency_ms AS "latencyMs", error, checked_at AS "checkedAt"
      FROM (
        SELECT *, row_number() OVER (PARTITION BY application_id ORDER BY checked_at DESC) AS position
        FROM health_checks
        WHERE application_id = ANY(${applicationIds}::uuid[])
      ) AS ranked
      WHERE position <= ${limit}
      ORDER BY application_id, checked_at DESC
    `;
    return groupBy(rows, (row) => row.applicationId);
  };

  return new DataLoader<RecentChecksKey, HealthCheck[], string>(
    async (keys) => {
      const resultsByLimit = new Map(
        await Promise.all(
          [...groupBy(keys, (key) => key.limit)].map(
            async ([limit, group]) =>
              [limit, await loadForLimit(group.map((key) => key.applicationId), limit)] as const,
          ),
        ),
      );

      return keys.map((key) => resultsByLimit.get(key.limit)?.get(key.applicationId) ?? []);
    },
    { cacheKeyFn: (key) => `${key.applicationId}:${key.limit}` },
  );
}

function createUptimeLoader(db: Database) {
  const loadForWindow = async (applicationIds: string[], window: UptimeWindow) => {
    const since = new Date(Date.now() - windowDurationMs[window]);
    const groups = await db.healthCheck.groupBy({
      by: ['applicationId', 'status'],
      where: { applicationId: { in: applicationIds }, checkedAt: { gte: since } },
      _count: { _all: true },
    });

    const totals = new Map<string, { healthy: number; total: number }>();
    for (const { applicationId, status, _count } of groups) {
      const entry = totals.get(applicationId) ?? { healthy: 0, total: 0 };
      entry.total += _count._all;
      if (status === 'UP' || status === 'DEGRADED') entry.healthy += _count._all;
      totals.set(applicationId, entry);
    }
    return totals;
  };

  return new DataLoader<UptimeKey, number | null, string>(
    async (keys) => {
      const resultsByWindow = new Map(
        await Promise.all(
          [...groupBy(keys, (key) => key.window)].map(
            async ([window, group]) =>
              [window, await loadForWindow(group.map((key) => key.applicationId), window)] as const,
          ),
        ),
      );

      return keys.map((key) => {
        const entry = resultsByWindow.get(key.window)?.get(key.applicationId);
        if (!entry || entry.total === 0) return null;
        return Math.round((entry.healthy / entry.total) * 10_000) / 100;
      });
    },
    { cacheKeyFn: (key) => `${key.applicationId}:${key.window}` },
  );
}

export function createApplicationLoaders(db: Database) {
  return {
    recentChecks: createRecentChecksLoader(db),
    uptime: createUptimeLoader(db),
  };
}

export type ApplicationLoaders = ReturnType<typeof createApplicationLoaders>;
