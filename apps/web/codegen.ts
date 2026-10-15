import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../api/src/graphql/schema.graphql',
  documents: ['src/**/*.{ts,tsx}', '!src/graphql/__generated__/**'],
  ignoreNoDocuments: true,
  generates: {
    'src/graphql/__generated__/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
        skipTypename: false,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
