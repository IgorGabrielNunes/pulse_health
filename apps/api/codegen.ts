import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/graphql/schema.graphql',
  generates: {
    'src/graphql/__generated__/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context.js#GraphQLContext',
        useIndexSignature: true,
        enumsAsTypes: true,
        useTypeImports: true,
        scalars: {
          DateTime: { input: 'Date', output: 'Date | string' },
        },
        mappers: {
          Application: '../../generated/prisma/client.js#Application as ApplicationModel',
          HealthCheck: '../../generated/prisma/client.js#HealthCheck as HealthCheckModel',
        },
      },
    },
  },
};

export default config;
