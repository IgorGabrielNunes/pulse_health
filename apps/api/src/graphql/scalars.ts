import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

function toDate(value: unknown): Date {
  const date = typeof value === 'string' || value instanceof Date ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    throw new GraphQLError('DateTime must be a valid ISO-8601 string');
  }

  return date;
}

export const DateTime = new GraphQLScalarType<Date, string>({
  name: 'DateTime',
  description: 'ISO-8601 timestamp in UTC',
  serialize: (value) => toDate(value).toISOString(),
  parseValue: toDate,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) throw new GraphQLError('DateTime must be a string');
    return toDate(ast.value);
  },
});
