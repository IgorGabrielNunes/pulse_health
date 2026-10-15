import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import cors from '@fastify/cors';
import Fastify, { type FastifyServerOptions } from 'fastify';
import type { Env } from './config/env.js';
import { createContextFactory, type GraphQLContext } from './graphql/context.js';
import { createErrorFormatter } from './graphql/format-error.js';
import { resolvers } from './graphql/resolvers.js';
import { typeDefs } from './graphql/schema.js';
import type { Database } from './infra/database.js';
import type { ApplicationService } from './modules/applications/application.service.js';

interface AppDependencies {
  env: Env;
  db: Database;
  applications: ApplicationService;
}

function loggerOptions(env: Env): FastifyServerOptions['logger'] {
  if (env.NODE_ENV === 'development') {
    return { level: 'debug', transport: { target: 'pino-pretty', options: { singleLine: true } } };
  }
  return { level: env.NODE_ENV === 'test' ? 'silent' : 'info' };
}

/**
 * Accepts exact origins and single-level wildcards such as
 * `https://*.vercel.app`, which is handy for preview deployments.
 */
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function toOriginMatchers(origins: string[]): Array<string | RegExp> {
  return origins.map((origin) => {
    if (!origin.includes('*')) return origin;
    const pattern = origin.split('*').map(escapeRegExp).join('[^./]+');
    return new RegExp(`^${pattern}$`);
  });
}

export async function buildApp({ env, db, applications }: AppDependencies) {
  const app = Fastify({ logger: loggerOptions(env), trustProxy: true });

  await app.register(cors, {
    origin: toOriginMatchers(env.CORS_ORIGINS),
    methods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 86_400,
  });

  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: env.NODE_ENV !== 'production',
    formatError: createErrorFormatter((error) => app.log.error({ err: error }, 'unhandled resolver error')),
    plugins: [fastifyApolloDrainPlugin(app)],
  });

  await apollo.start();
  await app.register(fastifyApollo(apollo), {
    context: createContextFactory({ db, applications }),
  });

  app.get('/healthz', async (_request, reply) => {
    await db.$queryRaw`SELECT 1`;
    return reply.send({ status: 'ok' });
  });

  return app;
}
