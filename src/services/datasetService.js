import { api } from './api';

export const datasetService = {
  list: () => api.get('/datasets').then(({ data }) => data),
  get: (datasetId) => api.get(`/datasets/${datasetId}`).then(({ data }) => data),
  upload: (file) => {
    const body = new FormData();
    body.append('file', file);
    return api.post('/datasets', body).then(({ data }) => data);
  },
  remove: (datasetId) => api.delete(`/datasets/${datasetId}`).then(({ data }) => data),
};
