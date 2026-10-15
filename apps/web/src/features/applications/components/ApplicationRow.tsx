import { useId, useState } from 'react';
import { Button } from '../../../components/Button';
import type { ApplicationFieldsFragment } from '../../../graphql/__generated__/graphql';
import { useNow } from '../../../hooks/useNow';
import {
  displayHost,
  formatInterval,
  formatLatency,
  formatRelative,
  formatUptime,
} from '../../../lib/format';
import { displayStatusOf } from '../status';
import { useApplicationActions } from '../useApplicationActions';
import styles from './ApplicationRow.module.css';
import { Heartbeat } from './Heartbeat';
import { StatusDot } from './StatusDot';

interface ApplicationRowProps {
  application: ApplicationFieldsFragment;
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const detailsId = useId();
  const now = useNow();
  const actions = useApplicationActions(application.id);

  const status = displayStatusOf(application);
  const latestError = application.status === 'DOWN' ? application.recentChecks[0]?.error : null;

  return (
    <li className={styles.row} data-expanded={expanded || undefined}>
      <button
        type="button"
        className={styles.summary}
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className={styles.identity}>
          <StatusDot status={status} />
          <span className={styles.names}>
            <span className={styles.name}>{application.name}</span>
            <span className={styles.host}>{displayHost(application.url)}</span>
          </span>
        </span>

        <span className={styles.heartbeat}>
          <Heartbeat checks={application.recentChecks} />
        </span>

        <span className={`${styles.metric} ${styles.uptime}`}>
          <span className={styles.metricValue}>{formatUptime(application.uptime)}</span>
          <span className={styles.metricLabel}>24h uptime</span>
        </span>

        <span className={`${styles.metric} ${styles.latency}`}>
          <span className={styles.metricValue}>{formatLatency(application.lastLatencyMs)}</span>
          <span className={styles.metricLabel}>response</span>
        </span>

        <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <div id={detailsId} className={styles.details} hidden={!expanded}>
        <div className={styles.detailsInner}>
          {latestError && <p className={styles.error}>{latestError}</p>}

          <dl className={styles.facts}>
            <div>
              <dt>Last checked</dt>
              <dd>{application.lastCheckedAt ? formatRelative(application.lastCheckedAt, now) : 'Not yet'}</dd>
            </div>
            <div>
              <dt>Frequency</dt>
              <dd>{formatInterval(application.checkIntervalSeconds)}</dd>
            </div>
            <div>
              <dt>Expects</dt>
              <dd>
                HTTP {application.expectedStatus} on {application.method}
              </dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                <a href={application.url} target="_blank" rel="noreferrer noopener">
                  {application.url}
                </a>
              </dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Button onClick={actions.checkNow} disabled={actions.busy}>
              {actions.checking ? 'Checking…' : 'Check now'}
            </Button>
            <Button onClick={() => actions.setPaused(!application.paused)} disabled={actions.busy}>
              {application.paused ? 'Resume checks' : 'Pause checks'}
            </Button>

            <span className={styles.spacer} />

            {confirmingDelete ? (
              <>
                <Button onClick={() => setConfirmingDelete(false)} disabled={actions.busy}>
                  Keep it
                </Button>
                <Button variant="danger" onClick={actions.remove} disabled={actions.busy}>
                  Delete {application.name} and its history
                </Button>
              </>
            ) : (
              <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                Delete
              </Button>
            )}
          </div>

          {actions.error && (
            <p className={styles.error} role="alert">
              {actions.error}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
