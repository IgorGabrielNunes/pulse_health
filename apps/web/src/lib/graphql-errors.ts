import { CombinedGraphQLErrors } from '@apollo/client';

export type FieldErrors = Partial<Record<string, string>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function fieldErrorsOf(error: unknown): FieldErrors {
  if (!CombinedGraphQLErrors.is(error)) return {};

  const fields = error.errors.find((entry) => entry.extensions?.code === 'BAD_USER_INPUT')
    ?.extensions?.fields;

  if (!isRecord(fields)) return {};

  return Object.fromEntries(
    Object.entries(fields).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? String(messages[0]) : String(messages),
    ]),
  );
}

export function messageOf(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message ?? 'The request was rejected by the server.';
  }
  return 'Could not reach the server. Check your connection and try again.';
}
