import type { ServiceStatus } from '../../graphql/__generated__/graphql';

export type DisplayStatus = ServiceStatus | 'PAUSED';

export const statusLabel: Record<DisplayStatus, string> = {
  UP: 'Up',
  DEGRADED: 'Slow',
  DOWN: 'Down',
  PENDING: 'Waiting',
  PAUSED: 'Paused',
};

export const statusColor: Record<DisplayStatus, string> = {
  UP: 'var(--status-up)',
  DEGRADED: 'var(--status-degraded)',
  DOWN: 'var(--status-down)',
  PENDING: 'var(--status-pending)',
  PAUSED: 'var(--status-paused)',
};

export const displayStatusOf = (application: { status: ServiceStatus; paused: boolean }): DisplayStatus =>
  application.paused ? 'PAUSED' : application.status;
