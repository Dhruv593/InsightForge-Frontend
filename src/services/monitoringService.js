import { api } from './api';

export const monitoringService = {
  overview: () => api.get('/monitoring/overview').then(({ data }) => data),
};
