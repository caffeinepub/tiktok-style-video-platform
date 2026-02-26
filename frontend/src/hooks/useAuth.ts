import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';

export function useAuth() {
  const { identity, login, clear, loginStatus, isLoggingIn, isInitializing } = useInternetIdentity();
  const profileQuery = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || isLoggingIn;

  return {
    identity,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    isInitializing,
    loginStatus,
    login,
    logout: clear,
    userProfile: profileQuery.data ?? null,
    profileLoading: profileQuery.isLoading,
    profileFetched: profileQuery.isFetched,
    needsProfileSetup: isAuthenticated && profileQuery.isFetched && profileQuery.data === null,
  };
}
