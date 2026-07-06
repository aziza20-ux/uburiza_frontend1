import api from './api_config';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export const getUserCertificates = (userId) => api.get(`/certificates/user/${userId}`);
export const generateCertificate = (courseId) => api.post('/certificates/generate', { courseId });
export const autoGenerateCertificate = (courseId) => api.post('/certificates/auto-generate', { courseId });
export const verifyCertificate = (uid) => api.get(`/certificates/${uid}`);
export const downloadCertificate = (courseId) =>
  axios.post(
    `${BASE_URL}/certificates/generate`,
    { courseId },
    {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  ).then((res) => res.data);
