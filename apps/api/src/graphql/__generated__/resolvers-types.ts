import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Application as ApplicationModel, HealthCheck as HealthCheckModel } from '../../generated/prisma/client.js';
import type { GraphQLContext } from '../context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date | string; }
};

export type Application = {
  __typename?: 'Application';
  checkIntervalSeconds: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  degradedThresholdMs: Scalars['Int']['output'];
  expectedStatus: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lastCheckedAt?: Maybe<Scalars['DateTime']['output']>;
  lastLatencyMs?: Maybe<Scalars['Int']['output']>;
  method: HttpMethod;
  name: Scalars['String']['output'];
  paused: Scalars['Boolean']['output'];
  /** Most recent checks, newest first. */
  recentChecks: Array<HealthCheck>;
  status: ServiceStatus;
  timeoutMs: Scalars['Int']['output'];
  /** Percentage of successful checks (UP or DEGRADED) within the window. Null when no checks exist. */
  uptime?: Maybe<Scalars['Float']['output']>;
  url: Scalars['String']['output'];
};


export type ApplicationRecentChecksArgs = {
  limit?: Scalars['Int']['input'];
};


export type ApplicationUptimeArgs = {
  window?: UptimeWindow;
};

export type CreateApplicationInput = {
  checkIntervalSeconds?: InputMaybe<Scalars['Int']['input']>;
  degradedThresholdMs?: InputMaybe<Scalars['Int']['input']>;
  expectedStatus?: InputMaybe<Scalars['Int']['input']>;
  method?: InputMaybe<HttpMethod>;
  name: Scalars['String']['input'];
  timeoutMs?: InputMaybe<Scalars['Int']['input']>;
  url: Scalars['String']['input'];
};

export type HealthCheck = {
  __typename?: 'HealthCheck';
  checkedAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  latencyMs: Scalars['Int']['output'];
  status: ServiceStatus;
  statusCode?: Maybe<Scalars['Int']['output']>;
};

export type HttpMethod =
  | 'GET'
  | 'HEAD';

export type Mutation = {
  __typename?: 'Mutation';
  checkApplication: Application;
  createApplication: Application;
  deleteApplication: Scalars['ID']['output'];
  updateApplication: Application;
};


export type MutationCheckApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};


export type MutationDeleteApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateApplicationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateApplicationInput;
};

export type Query = {
  __typename?: 'Query';
  application?: Maybe<Application>;
  applications: Array<Application>;
  statusSummary: StatusSummary;
};


export type QueryApplicationArgs = {
  id: Scalars['ID']['input'];
};

export type ServiceStatus =
  | 'DEGRADED'
  | 'DOWN'
  | 'PENDING'
  | 'UP';

export type StatusSummary = {
  __typename?: 'StatusSummary';
  degraded: Scalars['Int']['output'];
  down: Scalars['Int']['output'];
  paused: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  up: Scalars['Int']['output'];
};

export type UpdateApplicationInput = {
  checkIntervalSeconds?: InputMaybe<Scalars['Int']['input']>;
  degradedThresholdMs?: InputMaybe<Scalars['Int']['input']>;
  expectedStatus?: InputMaybe<Scalars['Int']['input']>;
  method?: InputMaybe<HttpMethod>;
  name?: InputMaybe<Scalars['String']['input']>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  timeoutMs?: InputMaybe<Scalars['Int']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UptimeWindow =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Application: ResolverTypeWrapper<ApplicationModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateApplicationInput: CreateApplicationInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  HealthCheck: ResolverTypeWrapper<HealthCheckModel>;
  HttpMethod: HttpMethod;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ServiceStatus: ServiceStatus;
  StatusSummary: ResolverTypeWrapper<StatusSummary>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateApplicationInput: UpdateApplicationInput;
  UptimeWindow: UptimeWindow;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Application: ApplicationModel;
  Boolean: Scalars['Boolean']['output'];
  CreateApplicationInput: CreateApplicationInput;
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  HealthCheck: HealthCheckModel;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  StatusSummary: StatusSummary;
  String: Scalars['String']['output'];
  UpdateApplicationInput: UpdateApplicationInput;
}>;

export type ApplicationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Application'] = ResolversParentTypes['Application']> = ResolversObject<{
  checkIntervalSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  degradedThresholdMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expectedStatus?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastCheckedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastLatencyMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  method?: Resolver<ResolversTypes['HttpMethod'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paused?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  recentChecks?: Resolver<Array<ResolversTypes['HealthCheck']>, ParentType, ContextType, RequireFields<ApplicationRecentChecksArgs, 'limit'>>;
  status?: Resolver<ResolversTypes['ServiceStatus'], ParentType, ContextType>;
  timeoutMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uptime?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType, RequireFields<ApplicationUptimeArgs, 'window'>>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type HealthCheckResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['HealthCheck'] = ResolversParentTypes['HealthCheck']> = ResolversObject<{
  checkedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  latencyMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ServiceStatus'], ParentType, ContextType>;
  statusCode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  checkApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationCheckApplicationArgs, 'id'>>;
  createApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationCreateApplicationArgs, 'input'>>;
  deleteApplication?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationDeleteApplicationArgs, 'id'>>;
  updateApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationUpdateApplicationArgs, 'id' | 'input'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  application?: Resolver<Maybe<ResolversTypes['Application']>, ParentType, ContextType, RequireFields<QueryApplicationArgs, 'id'>>;
  applications?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType>;
  statusSummary?: Resolver<ResolversTypes['StatusSummary'], ParentType, ContextType>;
}>;

export type StatusSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StatusSummary'] = ResolversParentTypes['StatusSummary']> = ResolversObject<{
  degraded?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  down?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  paused?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pending?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  up?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Application?: ApplicationResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  HealthCheck?: HealthCheckResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StatusSummary?: StatusSummaryResolvers<ContextType>;
}>;

