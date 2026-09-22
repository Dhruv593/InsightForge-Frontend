import { api } from './api';

export const datasetService = {
  list: () => api.get('/datasets').then(({ data }) => data),
  get: (datasetId) => api.get(`/datasets/${datasetId}`).then(({ data }) => data),
  preview: (datasetId, { limit = 50, offset = 0 } = {}) => api.get(`/datasets/${datasetId}/preview`, { params: { limit, offset } }).then(({ data }) => data),
  upload: (file) => {
    const body = new FormData();
    body.append('file', file);
    return api.post('/datasets', body).then(({ data }) => data);
  },
  remove: (datasetId) => api.delete(`/datasets/${datasetId}`).then(({ data }) => data),
};
