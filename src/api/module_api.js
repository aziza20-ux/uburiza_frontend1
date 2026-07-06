import api from './api_config';

export const createModule = (data) => api.post('/modules', data);
export const updateModule = ({ id, ...data }) => api.put(`/modules/${id}`, data);
export const deleteModule = (id) => api.delete(`/modules/${id}`);
