import { ApolloProvider } from '@apollo/client/react';
import { Dashboard } from '../features/applications/components/Dashboard';
import { apolloClient } from '../lib/apollo';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Dashboard />
    </ApolloProvider>
  );
}
