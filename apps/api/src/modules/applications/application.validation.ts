import { z } from 'zod';

const applicationFields = {
  name: z.string().trim().min(1).max(80),
  url: z
    .url({ protocol: /^https?$/, error: 'Must be a valid http(s) URL' })
    .max(2048),
  method: z.enum(['GET', 'HEAD']),
  expectedStatus: z.number().int().min(100).max(599),
  checkIntervalSeconds: z.number().int().min(30).max(86_400),
  timeoutMs: z.number().int().min(1_000).max(30_000),
  degradedThresholdMs: z.number().int().min(100).max(30_000),
};

export const createApplicationSchema = z.object({
  ...applicationFields,
  method: applicationFields.method.default('GET'),
  expectedStatus: applicationFields.expectedStatus.default(200),
  checkIntervalSeconds: applicationFields.checkIntervalSeconds.default(60),
  timeoutMs: applicationFields.timeoutMs.default(10_000),
  degradedThresholdMs: applicationFields.degradedThresholdMs.default(1_500),
});

export const updateApplicationSchema = z
  .object({ ...applicationFields, paused: z.boolean() })
  .partial();

export type CreateApplicationData = z.output<typeof createApplicationSchema>;
export type UpdateApplicationData = z.output<typeof updateApplicationSchema>;

/**
 * Cross-field rule evaluated against the merged state, since updates are partial.
 */
export function thresholdErrors(timing: { timeoutMs: number; degradedThresholdMs: number }) {
  return timing.degradedThresholdMs < timing.timeoutMs
    ? null
    : { degradedThresholdMs: ['Must be lower than the request timeout'] };
}
