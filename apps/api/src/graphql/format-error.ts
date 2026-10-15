import type { ApolloServerOptions } from '@apollo/server';
import { unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';
import { NotFoundError, ValidationError } from '../modules/shared/errors.js';

type FormatError = NonNullable<ApolloServerOptions<object>['formatError']>;

const KNOWN_CODES = new Set([
  'BAD_USER_INPUT',
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'BAD_REQUEST',
  'PERSISTED_QUERY_NOT_FOUND',
  'OPERATION_RESOLUTION_FAILURE',
]);

/**
 * Maps domain errors to stable error codes and hides unexpected failures
 * so internals (SQL, stack traces) never reach the client.
 */
export function createErrorFormatter(onUnexpected: (error: unknown) => void): FormatError {
  return (formatted, error): GraphQLFormattedError => {
    const original = unwrapResolverError(error);

    if (original instanceof ValidationError) {
      return {
        ...formatted,
        message: original.message,
        extensions: { code: 'BAD_USER_INPUT', fields: original.fieldErrors },
      };
    }

    if (original instanceof NotFoundError) {
      return { ...formatted, message: original.message, extensions: { code: 'NOT_FOUND' } };
    }

    const code = formatted.extensions?.code;
    if (typeof code === 'string' && KNOWN_CODES.has(code)) {
      return formatted;
    }

    onUnexpected(original);
    return {
      message: 'Internal server error',
      path: formatted.path,
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  };
}
