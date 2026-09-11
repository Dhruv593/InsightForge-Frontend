import { api } from './api';

export const analysisService = {
  createQuery: (conversationId, payload) => api.post(`/conversations/${conversationId}/query`, payload).then(({ data }) => data),
  execute: (analysisRunId) => api.post(`/analysis-runs/${analysisRunId}/execute`).then(({ data }) => data),
  listForConversation: (conversationId) => api.get(`/conversations/${conversationId}/analysis-runs`).then(({ data }) => data),
  get: (analysisRunId) => api.get(`/analysis-runs/${analysisRunId}`).then(({ data }) => data),
  listAgentRuns: (analysisRunId) => api.get(`/analysis-runs/${analysisRunId}/agent-runs`).then(({ data }) => data),
  getPlan: (analysisRunId) => api.get(`/analysis-runs/${analysisRunId}/plan`).then(({ data }) => data),
  listClaims: (analysisRunId) => api.get(`/analysis-runs/${analysisRunId}/claims`).then(({ data }) => data),
  listCharts: (analysisRunId) => api.get(`/analysis-runs/${analysisRunId}/charts`).then(({ data }) => data),
  getReport: (analysisRunId) => api.get(`/analysis-runs/${analysisRunId}/report`).then(({ data }) => data),
};
