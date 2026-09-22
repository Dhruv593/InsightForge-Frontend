import { api } from './api';

export const adminUserService = {
  list: (search = '') => api.get('/admin/users', { params: { search } }).then(({ data }) => data),
  setAdminAccess: (userId, isAdmin) => api.patch(`/admin/users/${userId}/admin-access`, { is_admin: isAdmin }).then(({ data }) => data),
  adjustCredits: (userId, delta) => api.patch(`/admin/users/${userId}/credits`, { delta }).then(({ data }) => data),
};
