import { graphql } from '../../graphql/__generated__';

export const ApplicationFieldsFragment = graphql(`
  fragment ApplicationFields on Application {
    id
    name
    url
    method
    expectedStatus
    checkIntervalSeconds
    paused
    status
    lastLatencyMs
    lastCheckedAt
    uptime(window: DAY)
    recentChecks(limit: 40) {
      id
      status
      statusCode
      latencyMs
      error
      checkedAt
    }
  }
`);

export const DashboardQuery = graphql(`
  query Dashboard {
    statusSummary {
      total
      up
      degraded
      down
      pending
      paused
    }
    applications {
      ...ApplicationFields
    }
  }
`);

export const CreateApplicationMutation = graphql(`
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      ...ApplicationFields
    }
  }
`);

export const UpdateApplicationMutation = graphql(`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      ...ApplicationFields
    }
  }
`);

export const CheckApplicationMutation = graphql(`
  mutation CheckApplication($id: ID!) {
    checkApplication(id: $id) {
      ...ApplicationFields
    }
  }
`);

export const DeleteApplicationMutation = graphql(`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id)
  }
`);
