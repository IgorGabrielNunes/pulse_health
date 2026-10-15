import type { CSSProperties } from 'react';
import { statusColor, statusLabel, type DisplayStatus } from '../status';
import styles from './StatusDot.module.css';

interface StatusDotProps {
  status: DisplayStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={styles.dot}
      data-alert={status === 'DOWN' || undefined}
      style={{ '--dot-color': statusColor[status] } as CSSProperties}
      role="img"
      aria-label={statusLabel[status]}
    />
  );
}
