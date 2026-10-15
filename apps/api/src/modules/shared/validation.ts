import { z } from 'zod';
import { ValidationError } from './errors.js';

type WithoutNulls<T> = { [K in keyof T]: Exclude<T[K], null> };

/**
 * GraphQL represents an omitted optional input as either `undefined` or `null`.
 * Normalizing to `undefined` keeps Zod schemas free of `.nullish()` noise.
 */
export function stripNulls<T extends object>(input: T): WithoutNulls<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== null),
  ) as WithoutNulls<T>;
}

export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    throw new ValidationError('Invalid input', fieldErrors as Record<string, string[]>);
  }

  return result.data;
}

export const isUuid = (value: string): boolean => z.uuid().safeParse(value).success;
