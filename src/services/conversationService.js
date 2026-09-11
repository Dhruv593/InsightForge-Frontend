import { api } from './api';

export const conversationService = {
  list: (datasetId) => api.get('/conversations', { params: { dataset_id: datasetId } }).then(({ data }) => data),
  get: (conversationId) => api.get(`/conversations/${conversationId}`).then(({ data }) => data),
  create: (payload) => api.post('/conversations', payload).then(({ data }) => data),
  rename: (conversationId, title) => api.patch(`/conversations/${conversationId}`, { title }).then(({ data }) => data),
  remove: (conversationId) => api.delete(`/conversations/${conversationId}`).then(({ data }) => data),
  messages: (conversationId) => api.get(`/conversations/${conversationId}/messages`).then(({ data }) => data),
};
