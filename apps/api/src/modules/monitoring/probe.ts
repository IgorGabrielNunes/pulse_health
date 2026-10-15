import type { HttpMethod, ServiceStatus } from '../../generated/prisma/client.js';
import { BlockedTargetError, type TargetGuard } from './target-guard.js';

export interface ProbeTarget {
  url: string;
  method: HttpMethod;
  expectedStatus: number;
  timeoutMs: number;
  degradedThresholdMs: number;
}

export interface ProbeResult {
  status: Exclude<ServiceStatus, 'PENDING'>;
  statusCode: number | null;
  latencyMs: number;
  error: string | null;
}

export type Probe = (target: ProbeTarget) => Promise<ProbeResult>;

const MAX_REDIRECTS = 5;
const MAX_ERROR_LENGTH = 500;
const USER_AGENT = 'PulseMonitor/1.0';

const networkErrorMessages: Record<string, string> = {
  ENOTFOUND: 'DNS lookup failed',
  EAI_AGAIN: 'DNS lookup timed out',
  ECONNREFUSED: 'Connection refused',
  ECONNRESET: 'Connection reset by peer',
  EHOSTUNREACH: 'Host unreachable',
  CERT_HAS_EXPIRED: 'TLS certificate has expired',
  DEPTH_ZERO_SELF_SIGNED_CERT: 'Self-signed TLS certificate',
  ERR_TLS_CERT_ALTNAME_INVALID: 'TLS certificate does not match host',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Unable to verify TLS certificate',
};

const isRedirect = (status: number) => status >= 300 && status < 400;

function describeFailure(error: unknown, timeoutMs: number): string {
  if (error instanceof BlockedTargetError) return error.message;

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return `Timed out after ${timeoutMs} ms`;
  }

  if (error instanceof Error) {
    const code = (error.cause as { code?: string } | undefined)?.code;
    const message = (code && networkErrorMessages[code]) ?? code ?? error.message;
    return message.slice(0, MAX_ERROR_LENGTH);
  }

  return 'Unknown error';
}

/**
 * Redirects are followed manually so every hop goes through the target guard.
 */
async function request(target: ProbeTarget, guard: TargetGuard, signal: AbortSignal) {
  let url = new URL(target.url);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await guard(url);

    const response = await fetch(url, {
      method: target.method,
      redirect: 'manual',
      signal,
      headers: { 'user-agent': USER_AGENT, accept: '*/*' },
    });

    const location = response.headers.get('location');
    await response.body?.cancel();

    if (!isRedirect(response.status) || !location || target.expectedStatus === response.status) {
      return response;
    }

    url = new URL(location, url);
  }

  throw new Error(`Exceeded ${MAX_REDIRECTS} redirects`);
}

export function createHttpProbe(guard: TargetGuard): Probe {
  return async (target) => {
    const startedAt = performance.now();
    const elapsed = () => Math.round(performance.now() - startedAt);

    try {
      const response = await request(target, guard, AbortSignal.timeout(target.timeoutMs));
      const latencyMs = elapsed();

      if (response.status !== target.expectedStatus) {
        return {
          status: 'DOWN',
          statusCode: response.status,
          latencyMs,
          error: `Expected HTTP ${target.expectedStatus}, received ${response.status}`,
        };
      }

      return {
        status: latencyMs > target.degradedThresholdMs ? 'DEGRADED' : 'UP',
        statusCode: response.status,
        latencyMs,
        error: null,
      };
    } catch (error) {
      return {
        status: 'DOWN',
        statusCode: null,
        latencyMs: elapsed(),
        error: describeFailure(error, target.timeoutMs),
      };
    }
  };
}
