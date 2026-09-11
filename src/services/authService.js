import { api } from './api';

export const authService = {
  googleChallenge: () => api.post('/auth/google/challenge', {}, { withCredentials: true }).then(({ data }) => data),
  googleLogin: (credential) => api.post('/auth/google', { credential }, { withCredentials: true }).then(({ data }) => data),
  register: (payload) => api.post('/auth/register', payload).then(({ data }) => data),
  login: (payload) => api.post('/auth/login', payload).then(({ data }) => data),
  me: () => api.get('/auth/me').then(({ data }) => data),
  logout: (refreshToken) =>
    api.post('/auth/logout', { refresh_token: refreshToken }).then(({ data }) => data),
};
