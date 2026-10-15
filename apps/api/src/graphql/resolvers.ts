import { stripNulls } from '../modules/shared/validation.js';
import type { Resolvers } from './__generated__/resolvers-types.js';
import { DateTime } from './scalars.js';

const MAX_RECENT_CHECKS = 100;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const resolvers: Resolvers = {
  DateTime,

  Query: {
    applications: (_parent, _args, { applications }) => applications.list(),
    application: (_parent, { id }, { applications }) => applications.findById(id),
    statusSummary: (_parent, _args, { applications }) => applications.summarize(),
  },

  Mutation: {
    createApplication: (_parent, { input }, { applications }) => applications.create(stripNulls(input)),
    updateApplication: (_parent, { id, input }, { applications }) =>
      applications.update(id, stripNulls(input)),
    deleteApplication: (_parent, { id }, { applications }) => applications.delete(id),
    checkApplication: (_parent, { id }, { applications }) => applications.check(id),
  },

  Application: {
    uptime: (application, { window }, { loaders }) =>
      loaders.uptime.load({ applicationId: application.id, window }),
    recentChecks: (application, { limit }, { loaders }) =>
      loaders.recentChecks.load({
        applicationId: application.id,
        limit: clamp(limit, 1, MAX_RECENT_CHECKS),
      }),
  },

  HealthCheck: {
    id: (check) => check.id.toString(),
  },
};
