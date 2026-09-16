import axios from 'axios';
import { authStorage } from '../utils/authStorage';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error('VITE_API_BASE_URL is required.');
}

export const api = axios.create({ baseURL });
const publicApi = axios.create({ baseURL });

let refreshPromise = null;
let authFailureHandler = null;
let tokenUpdateHandler = null;

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

export function setTokenUpdateHandler(handler) {
  tokenUpdateHandler = handler;
}

export async function refreshStoredTokens() {
  const tokens = authStorage.getTokens();
  if (!tokens?.refreshToken) throw new Error('No refresh token available.');

  if (!refreshPromise) {
    refreshPromise = publicApi
      .post('/auth/refresh', { refresh_token: tokens.refreshToken })
      .then(({ data }) => {
        authStorage.setTokens(data);
        tokenUpdateHandler?.(authStorage.getTokens());
        return data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const accessToken = authStorage.getTokens()?.accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const path = request?.url ?? '';
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some(
      (endpoint) => path.includes(endpoint),
    );

    if (error.response?.status !== 401 || request?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const accessToken = await refreshStoredTokens();
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      authStorage.clear();
      authFailureHandler?.();
      return Promise.reject(refreshError);
    }
  },
);

const friendlyErrors = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  DATASET_NOT_PROFILED: 'Profile this dataset before running an analysis.',
  UNSUPPORTED_FILE_TYPE: 'This file type is not supported.',
  FILE_TOO_LARGE: 'This file exceeds the upload limit.',
  DATASET_NOT_FOUND: 'Dataset could not be found.',
  CONVERSATION_NOT_FOUND: 'Conversation could not be found.',
};

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const apiError = error?.response?.data?.error;
  return {
    code: apiError?.code ?? 'UNKNOWN_ERROR',
    message: friendlyErrors[apiError?.code] ?? apiError?.message ?? fallback,
    details: apiError?.details ?? null,
  };
}
