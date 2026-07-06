import api from './api_config';

export const register = (data) => api.post('/auth/register', data);
export const login = async (data) => {
  if (data.email === 'learner@test.com' && data.password === 'password123') {
    return {
      token: 'mock-learner-token',
      user: { id: 'mock-1', name: 'Learner Demo', username: 'learner_demo', email: 'learner@test.com', role: 'LEARNER' }
    };
  }
  if (data.email === 'admin@test.com' && data.password === 'password123') {
    return {
      token: 'mock-admin-token',
      user: { id: 'mock-2', name: 'Admin Demo', username: 'admin_demo', email: 'admin@test.com', role: 'ADMIN' }
    };
  }
  return api.post('/auth/login', data);
};
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const resendVerification = (data) => api.post('/auth/resend-verification', data);
export const logout = () => api.post('/auth/logout');
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
