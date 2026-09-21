import { api } from './api';

export const adminSettingsService = {
  getModel: () => api.get('/admin/settings/llm').then(({ data }) => data),
  updateModel: (provider) => api.put('/admin/settings/llm', { provider }).then(({ data }) => data),
};
