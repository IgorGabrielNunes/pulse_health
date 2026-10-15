import type { CSSProperties } from 'react';
import type { DashboardQuery } from '../../../graphql/__generated__/graphql';
import { pluralize } from '../../../lib/format';
import { statusColor, statusLabel, type DisplayStatus } from '../status';
import styles from './StatusHeadline.module.css';

type Summary = DashboardQuery['statusSummary'];

interface Verdict {
  title: string;
  tone: DisplayStatus;
}

function verdictOf(summary: Summary): Verdict {
  const active = summary.total - summary.paused;

  if (summary.total === 0) return { title: 'Nothing to watch yet', tone: 'PENDING' };
  if (summary.down > 0) {
    return { title: `${pluralize(summary.down, 'service is', 'services are')} down`, tone: 'DOWN' };
  }
  if (summary.degraded > 0) {
    return {
      title: `${pluralize(summary.degraded, 'service is', 'services are')} responding slowly`,
      tone: 'DEGRADED',
    };
  }
  if (active === 0) return { title: 'Every service is paused', tone: 'PAUSED' };
  if (summary.pending > 0) return { title: 'Running the first checks', tone: 'PENDING' };
  if (active === 1) return { title: 'Your service is up', tone: 'UP' };
  return { title: `All ${active} services are up`, tone: 'UP' };
}

const breakdown: Array<{ key: keyof Omit<Summary, 'total' | '__typename'>; status: DisplayStatus }> = [
  { key: 'up', status: 'UP' },
  { key: 'degraded', status: 'DEGRADED' },
  { key: 'down', status: 'DOWN' },
  { key: 'pending', status: 'PENDING' },
  { key: 'paused', status: 'PAUSED' },
];

interface StatusHeadlineProps {
  summary: Summary;
  updatedLabel: string;
}

export function StatusHeadline({ summary, updatedLabel }: StatusHeadlineProps) {
  const verdict = verdictOf(summary);

  return (
    <section className={styles.headline} aria-live="polite">
      <h1 className={styles.title} style={{ '--tone': statusColor[verdict.tone] } as CSSProperties}>
        {verdict.title}
      </h1>

      {summary.total > 0 && (
        <dl className={styles.breakdown}>
          {breakdown
            .filter(({ key, status }) => summary[key] > 0 || status === 'UP' || status === 'DOWN')
            .map(({ key, status }) => (
              <div key={key} className={styles.count} data-empty={summary[key] === 0 || undefined}>
                <dt style={{ '--tone': statusColor[status] } as CSSProperties}>{statusLabel[status]}</dt>
                <dd>{summary[key]}</dd>
              </div>
            ))}
        </dl>
      )}

      <p className={styles.updated}>{updatedLabel}</p>
    </section>
  );
}
