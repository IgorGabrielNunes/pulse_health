import type { CSSProperties } from 'react';
import type { ApplicationFieldsFragment } from '../../../graphql/__generated__/graphql';
import { formatLatency } from '../../../lib/format';
import { statusColor, statusLabel } from '../status';
import styles from './Heartbeat.module.css';

type Check = ApplicationFieldsFragment['recentChecks'][number];

const SLOTS = 40;

const timeFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'medium' });

function describe(check: Check): string {
  const outcome = check.error ?? `HTTP ${check.statusCode} in ${formatLatency(check.latencyMs)}`;
  return `${statusLabel[check.status]}: ${outcome}\n${timeFormat.format(new Date(check.checkedAt))}`;
}

function summarize(checks: Check[]): string {
  if (checks.length === 0) return 'No checks yet';
  const failed = checks.filter((check) => check.status === 'DOWN').length;
  return failed === 0
    ? `All of the last ${checks.length} checks succeeded`
    : `${failed} of the last ${checks.length} checks failed`;
}

interface HeartbeatProps {
  checks: Check[];
}

export function Heartbeat({ checks }: HeartbeatProps) {
  const chronological = checks.slice(0, SLOTS).reverse();
  const emptySlots = SLOTS - chronological.length;

  return (
    <span className={styles.track} role="img" aria-label={summarize(chronological)}>
      {Array.from({ length: emptySlots }, (_, index) => (
        <span key={`empty-${index}`} className={styles.bar} />
      ))}
      {chronological.map((check) => (
        <span
          key={check.id}
          className={styles.bar}
          title={describe(check)}
          style={{ '--bar-color': statusColor[check.status] } as CSSProperties}
        />
      ))}
    </span>
  );
}
