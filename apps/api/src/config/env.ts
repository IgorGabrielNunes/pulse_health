import { z } from 'zod';

const originList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  CORS_ORIGINS: originList,
  MONITOR_TICK_MS: z.coerce.number().int().min(1_000).default(5_000),
  MONITOR_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(20),
  CHECK_RETENTION_DAYS: z.coerce.number().int().min(1).default(30),
  ALLOW_PRIVATE_TARGETS: z.stringbool().default(false),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Invalid environment configuration\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
