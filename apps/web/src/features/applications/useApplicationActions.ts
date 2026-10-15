import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { messageOf } from '../../lib/graphql-errors';
import {
  CheckApplicationMutation,
  DashboardQuery,
  DeleteApplicationMutation,
  UpdateApplicationMutation,
} from './operations';

const refetchDashboard = { refetchQueries: [DashboardQuery] };

export function useApplicationActions(id: string) {
  const [error, setError] = useState<string | null>(null);

  const [checkMutation, checkState] = useMutation(CheckApplicationMutation, refetchDashboard);
  const [updateMutation, updateState] = useMutation(UpdateApplicationMutation, refetchDashboard);
  const [deleteMutation, deleteState] = useMutation(DeleteApplicationMutation, {
    ...refetchDashboard,
    update(cache) {
      cache.evict({ id: cache.identify({ __typename: 'Application', id }) });
      cache.gc();
    },
  });

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(messageOf(cause));
    }
  };

  return {
    error,
    busy: checkState.loading || updateState.loading || deleteState.loading,
    checking: checkState.loading,
    checkNow: () => run(() => checkMutation({ variables: { id } })),
    setPaused: (paused: boolean) => run(() => updateMutation({ variables: { id, input: { paused } } })),
    remove: () => run(() => deleteMutation({ variables: { id } })),
  };
}
