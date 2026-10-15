import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import { useNow } from '../../../hooks/useNow';
import { formatRelative } from '../../../lib/format';
import { DashboardQuery } from '../operations';
import { AddApplicationDialog } from './AddApplicationDialog';
import { ApplicationRow } from './ApplicationRow';
import styles from './Dashboard.module.css';
import { StatusHeadline } from './StatusHeadline';

const POLL_INTERVAL_MS = 15_000;

function PulseMark() {
  return (
    <svg viewBox="0 0 32 32" className={styles.mark} aria-hidden="true">
      <path
        d="M3 17h7l3-8 5 15 3.5-7H29"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Dashboard() {
  const [adding, setAdding] = useState(false);
  const now = useNow();

  const { data, error, refetch } = useQuery(DashboardQuery, {
    pollInterval: POLL_INTERVAL_MS,
    skipPollAttempt: () => document.visibilityState === 'hidden',
  });

  const lastCheckAt = data?.applications
    .map((application) => application.lastCheckedAt)
    .filter((checkedAt): checkedAt is string => checkedAt !== null)
    .sort()
    .at(-1);

  const updatedLabel = error
    ? 'Cannot reach the monitor right now. Showing the last known status.'
    : lastCheckAt
      ? `Last check ${formatRelative(lastCheckAt, now)}. This page refreshes every 15 seconds.`
      : 'This page refreshes every 15 seconds.';

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <span className={styles.brand}>
          <PulseMark />
          Pulse
        </span>
        <Button variant="primary" onClick={() => setAdding(true)}>
          Add service
        </Button>
      </header>

      <main>
        {data ? (
          <>
            <StatusHeadline summary={data.statusSummary} updatedLabel={updatedLabel} />

            {data.applications.length > 0 ? (
              <ul className={styles.list} aria-label="Services">
                {data.applications.map((application) => (
                  <ApplicationRow key={application.id} application={application} />
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <p>Add the first URL you want to keep an eye on. Pulse checks it on a schedule and shows when it goes down or slows down.</p>
                <Button variant="primary" onClick={() => setAdding(true)}>
                  Add service
                </Button>
              </div>
            )}
          </>
        ) : error ? (
          <section className={styles.failure} role="alert">
            <h1>The monitor is unreachable</h1>
            <p>The status could not be loaded. If the API was idle it may take a few seconds to wake up.</p>
            <Button onClick={() => void refetch()}>Try again</Button>
          </section>
        ) : (
          <div className={styles.loading} aria-busy="true" aria-label="Loading status">
            <span />
            <span />
            <span />
          </div>
        )}
      </main>

      <AddApplicationDialog open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
