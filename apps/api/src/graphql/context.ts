import type { Database } from '../infra/database.js';
import {
  createApplicationLoaders,
  type ApplicationLoaders,
} from '../modules/applications/application.loaders.js';
import type { ApplicationService } from '../modules/applications/application.service.js';

export interface GraphQLContext {
  applications: ApplicationService;
  loaders: ApplicationLoaders;
}

export interface ContextDependencies {
  db: Database;
  applications: ApplicationService;
}

export function createContextFactory({ db, applications }: ContextDependencies) {
  return async (): Promise<GraphQLContext> => ({
    applications,
    loaders: createApplicationLoaders(db),
  });
}
