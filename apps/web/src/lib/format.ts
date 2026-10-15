const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'long' });

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

export function formatRelative(iso: string, now: number): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1_000);

  if (Math.abs(seconds) < 5) return 'just now';

  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeTime.format(Math.round(seconds / size), unit);
    }
  }

  return 'just now';
}

export function formatLatency(ms: number | null | undefined): string {
  if (ms == null) return '—';
  return ms >= 1_000 ? `${(ms / 1_000).toFixed(2)} s` : `${ms} ms`;
}

export function formatUptime(percent: number | null | undefined): string {
  if (percent == null) return '—';
  return percent === 100 ? '100%' : `${percent.toFixed(2)}%`;
}

export function formatInterval(seconds: number): string {
  if (seconds < 60) return `Every ${seconds} seconds`;
  const minutes = seconds / 60;
  if (minutes < 60) return minutes === 1 ? 'Every minute' : `Every ${minutes} minutes`;
  const hours = minutes / 60;
  return hours === 1 ? 'Every hour' : `Every ${hours} hours`;
}

export function displayHost(url: string): string {
  try {
    const { host, pathname } = new URL(url);
    return pathname === '/' ? host : `${host}${pathname}`;
  } catch {
    return url;
  }
}

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
