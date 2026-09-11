import { api } from './api';

export const profileService = {
  create: (datasetId) => api.post(`/datasets/${datasetId}/profile`).then(({ data }) => data),
  get: (datasetId) => api.get(`/datasets/${datasetId}/profile`).then(({ data }) => data),
};
