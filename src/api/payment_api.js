import api from './api_config';

export const initiatePayment = (data) => api.post('/payments/initiate', data);
export const confirmPayment = (data) => api.post('/payments/confirm', data);
export const myPayments = () => api.get('/payments/my');
