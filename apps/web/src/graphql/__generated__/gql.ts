/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment ApplicationFields on Application {\n    id\n    name\n    url\n    method\n    expectedStatus\n    checkIntervalSeconds\n    paused\n    status\n    lastLatencyMs\n    lastCheckedAt\n    uptime(window: DAY)\n    recentChecks(limit: 40) {\n      id\n      status\n      statusCode\n      latencyMs\n      error\n      checkedAt\n    }\n  }\n": typeof types.ApplicationFieldsFragmentDoc,
    "\n  query Dashboard {\n    statusSummary {\n      total\n      up\n      degraded\n      down\n      pending\n      paused\n    }\n    applications {\n      ...ApplicationFields\n    }\n  }\n": typeof types.DashboardDocument,
    "\n  mutation CreateApplication($input: CreateApplicationInput!) {\n    createApplication(input: $input) {\n      ...ApplicationFields\n    }\n  }\n": typeof types.CreateApplicationDocument,
    "\n  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {\n    updateApplication(id: $id, input: $input) {\n      ...ApplicationFields\n    }\n  }\n": typeof types.UpdateApplicationDocument,
    "\n  mutation CheckApplication($id: ID!) {\n    checkApplication(id: $id) {\n      ...ApplicationFields\n    }\n  }\n": typeof types.CheckApplicationDocument,
    "\n  mutation DeleteApplication($id: ID!) {\n    deleteApplication(id: $id)\n  }\n": typeof types.DeleteApplicationDocument,
};
const documents: Documents = {
    "\n  fragment ApplicationFields on Application {\n    id\n    name\n    url\n    method\n    expectedStatus\n    checkIntervalSeconds\n    paused\n    status\n    lastLatencyMs\n    lastCheckedAt\n    uptime(window: DAY)\n    recentChecks(limit: 40) {\n      id\n      status\n      statusCode\n      latencyMs\n      error\n      checkedAt\n    }\n  }\n": types.ApplicationFieldsFragmentDoc,
    "\n  query Dashboard {\n    statusSummary {\n      total\n      up\n      degraded\n      down\n      pending\n      paused\n    }\n    applications {\n      ...ApplicationFields\n    }\n  }\n": types.DashboardDocument,
    "\n  mutation CreateApplication($input: CreateApplicationInput!) {\n    createApplication(input: $input) {\n      ...ApplicationFields\n    }\n  }\n": types.CreateApplicationDocument,
    "\n  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {\n    updateApplication(id: $id, input: $input) {\n      ...ApplicationFields\n    }\n  }\n": types.UpdateApplicationDocument,
    "\n  mutation CheckApplication($id: ID!) {\n    checkApplication(id: $id) {\n      ...ApplicationFields\n    }\n  }\n": types.CheckApplicationDocument,
    "\n  mutation DeleteApplication($id: ID!) {\n    deleteApplication(id: $id)\n  }\n": types.DeleteApplicationDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ApplicationFields on Application {\n    id\n    name\n    url\n    method\n    expectedStatus\n    checkIntervalSeconds\n    paused\n    status\n    lastLatencyMs\n    lastCheckedAt\n    uptime(window: DAY)\n    recentChecks(limit: 40) {\n      id\n      status\n      statusCode\n      latencyMs\n      error\n      checkedAt\n    }\n  }\n"): (typeof documents)["\n  fragment ApplicationFields on Application {\n    id\n    name\n    url\n    method\n    expectedStatus\n    checkIntervalSeconds\n    paused\n    status\n    lastLatencyMs\n    lastCheckedAt\n    uptime(window: DAY)\n    recentChecks(limit: 40) {\n      id\n      status\n      statusCode\n      latencyMs\n      error\n      checkedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dashboard {\n    statusSummary {\n      total\n      up\n      degraded\n      down\n      pending\n      paused\n    }\n    applications {\n      ...ApplicationFields\n    }\n  }\n"): (typeof documents)["\n  query Dashboard {\n    statusSummary {\n      total\n      up\n      degraded\n      down\n      pending\n      paused\n    }\n    applications {\n      ...ApplicationFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateApplication($input: CreateApplicationInput!) {\n    createApplication(input: $input) {\n      ...ApplicationFields\n    }\n  }\n"): (typeof documents)["\n  mutation CreateApplication($input: CreateApplicationInput!) {\n    createApplication(input: $input) {\n      ...ApplicationFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {\n    updateApplication(id: $id, input: $input) {\n      ...ApplicationFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {\n    updateApplication(id: $id, input: $input) {\n      ...ApplicationFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CheckApplication($id: ID!) {\n    checkApplication(id: $id) {\n      ...ApplicationFields\n    }\n  }\n"): (typeof documents)["\n  mutation CheckApplication($id: ID!) {\n    checkApplication(id: $id) {\n      ...ApplicationFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteApplication($id: ID!) {\n    deleteApplication(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteApplication($id: ID!) {\n    deleteApplication(id: $id)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;