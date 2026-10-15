import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

export type TargetGuard = (url: URL) => Promise<void>;

export class BlockedTargetError extends Error {
  constructor(hostname: string) {
    super(`Target "${hostname}" resolves to a private or reserved address`);
    this.name = 'BlockedTargetError';
  }
}

const reservedRanges = new BlockList();

for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['224.0.0.0', 4],
] as const) {
  reservedRanges.addSubnet(network, prefix, 'ipv4');
}

for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  reservedRanges.addSubnet(network, prefix, 'ipv6');
}

const isReserved = (address: string): boolean =>
  reservedRanges.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4');

async function resolveAddresses(hostname: string): Promise<string[]> {
  if (isIP(hostname)) return [hostname];
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

/**
 * Prevents the monitor from being used to reach internal infrastructure (SSRF).
 * DNS is resolved right before each request, which narrows but does not fully
 * close the window for DNS rebinding.
 */
export function createTargetGuard({ allowPrivate }: { allowPrivate: boolean }): TargetGuard {
  if (allowPrivate) return async () => {};

  return async (url) => {
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = await resolveAddresses(hostname);

    if (addresses.some(isReserved)) {
      throw new BlockedTargetError(hostname);
    }
  };
}
