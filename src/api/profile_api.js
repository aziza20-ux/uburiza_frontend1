import api from './api_config';

export const getMyProfile = () => api.get('/users/me/profile').then(d => d?.profile ?? d);

export const updateMyProfile = (formData) =>
  api.put('/users/me/profile', formData).then(d => d?.profile ?? d);

export const changePassword = (body) => api.post('/auth/change-password', body);
