// hooks/useGetTokenStatus.ts
import { CHECK_TOKEN_STATUS, GET_TOKEN_STATUS } from '../helper/APIUtils';
import { clearStorage, KEYS, retrieveItem } from '../helper/Utils';
import store from '../stores/ReduxStore';
import { resetUserState } from '../stores/UserSlice';
import { TokenStatus, TokenUser } from '../type';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Call the checkTokenStatus API using the provided token or the token stored in AsyncStorage.
 * Primary endpoint: /api/checkTokenStatus (GET with Authorization Bearer header)
 */
export const checkTokenStatusApi = async (
  token?: string,
): Promise<TokenStatus> => {
  try {
    const activeToken = token || (await retrieveItem(KEYS.USER_TOKEN));
    if (!activeToken) {
      return {
        isValid: false,
        message: 'Token is missing',
      };
    }

    const res = await axios.get<TokenStatus>(CHECK_TOKEN_STATUS || GET_TOKEN_STATUS, {
      headers: {
        Authorization: `Bearer ${activeToken}`,
        'x-type': 'mobile',
        'x-client-type': 'mobile',
        'x-type-header': 'mobile',
      },
      timeout: 5000,
    });

    return res.data;
  } catch (err: any) {
    const isNetworkError = !err.response;
    return {
      isValid: false,
      message:
        err?.response?.data?.message ||
        err?.message ||
        'Token status check failed',
      isNetworkError,
    };
  }
};

export const checkTokenStatus = checkTokenStatusApi;

/**
 * Validates the current session token.
 * If valid: returns authenticated user info.
 * If invalid: clears storage, resets redux user state, and navigates to LoginScreen.
 */
export const checkAuth = async (
  navigation?: any,
): Promise<TokenUser | null> => {
  try {
    const res = await checkTokenStatusApi();

    if (res.isValid && res.user) {
      console.log('Authenticated user:', res.user);
      return res.user;
    } else {
      console.warn('Session invalid:', res.message);
      if (!res.isNetworkError) {
        await clearStorage();
        store.dispatch(resetUserState());
        if (navigation?.reset) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          });
        }
      }
      return null;
    }
  } catch (err) {
    console.error('Network error checking token:', err);
    return null;
  }
};

/**
 * React Query hook for components requiring reactive token status validation.
 */
export const useCheckTokenStatus = (options?: { enabled?: boolean }) => {
  return useQuery<TokenStatus>({
    queryKey: ['token-status'],
    queryFn: async () => {
      return checkTokenStatusApi();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: false,
    ...options,
  });
};
