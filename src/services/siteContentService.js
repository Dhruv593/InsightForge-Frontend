import { api } from './api';

export const siteContentService = {
  async getLanding() {
    const { data } = await api.get('/site-content/landing');
    return data;
  },
  async getAdminLanding() {
    const { data } = await api.get('/admin/site-content/landing');
    return data;
  },
  async updateLanding(content) {
    const { data } = await api.put('/admin/site-content/landing', { content });
    return data;
  },
  async submitContact(payload) {
    const { data } = await api.post('/site-content/contact', payload);
    return data;
  },
  async getPlans() {
    const { data } = await api.get('/site-content/plans');
    return data;
  },
  async getAdminPlans() {
    const { data } = await api.get('/admin/site-content/plans');
    return data;
  },
  async updatePlans(content) {
    const { data } = await api.put('/admin/site-content/plans', { content });
    return data;
  },
  async getLegal() {
    const { data } = await api.get('/site-content/legal');
    return data;
  },
  async getAdminLegal() {
    const { data } = await api.get('/admin/site-content/legal');
    return data;
  },
  async updateLegal(content) {
    const { data } = await api.put('/admin/site-content/legal', { content });
    return data;
  },
  async getEmailTemplates() {
    const { data } = await api.get('/admin/site-content/email-templates');
    return data;
  },
  async updateEmailTemplates(content) {
    const { data } = await api.put('/admin/site-content/email-templates', { content });
    return data;
  },
  async uploadImage(file) {
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post('/admin/site-content/images', form);
    return data;
  },
  async uploadVideo(file) {
    const form = new FormData();
    form.append('video', file);
    const { data } = await api.post('/admin/site-content/videos', form);
    return data;
  },
  async listBlogs() {
    const { data } = await api.get('/blogs');
    return data;
  },
  async getBlog(slug) {
    const { data } = await api.get(`/blogs/${slug}`);
    return data;
  },
  async listAdminBlogs() {
    const { data } = await api.get('/admin/blogs');
    return data;
  },
  async getAdminBlog(slug) {
    const { data } = await api.get(`/admin/blogs/${slug}`);
    return data;
  },
  async createBlog(payload) {
    const { data } = await api.post('/admin/blogs', payload);
    return data;
  },
  async updateBlog(slug, payload) {
    const { data } = await api.put(`/admin/blogs/${slug}`, payload);
    return data;
  },
  async deleteBlog(slug) {
    await api.delete(`/admin/blogs/${slug}`);
  },
};
