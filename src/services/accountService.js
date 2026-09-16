import { api } from './api';

export const accountService = {
  updateProfile: (payload) => api.patch('/account/profile', payload).then(({ data }) => data),
  changePassword: (payload) => api.post('/account/password', payload).then(({ data }) => data),
  sessions: () => api.get('/account/sessions').then(({ data }) => data),
  revokeSession: (sessionId) => api.delete(`/account/sessions/${sessionId}`).then(({ data }) => data),
  revokeAllSessions: () => api.delete('/account/sessions').then(({ data }) => data),
  deleteAccount: (payload) => api.post('/account/delete', payload).then(({ data }) => data),
  forgotPassword: (email) => api.post('/account/forgot-password', { email }).then(({ data }) => data),
  resetPassword: (token, newPassword) => api.post('/account/reset-password', { token, new_password: newPassword }).then(({ data }) => data),
  verifyEmail: (token) => api.post('/account/verify-email', { token }).then(({ data }) => data),
  resendVerification: () => api.post('/account/verification-email').then(({ data }) => data),
};
