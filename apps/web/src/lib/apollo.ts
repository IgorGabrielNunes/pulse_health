import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;

if (!graphqlUrl) {
  throw new Error('VITE_GRAPHQL_URL is not defined');
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlUrl }),
  cache: new InMemoryCache({
    typePolicies: {
      Application: {
        fields: {
          recentChecks: { merge: false },
        },
      },
      Query: {
        fields: {
          applications: { merge: false },
        },
      },
    },
  }),
});
