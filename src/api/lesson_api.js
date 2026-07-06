import api from './api_config';

export const listLessons = (moduleId) => api.get('/lessons', { params: { moduleId } });
export const getLessonById = (id) => api.get(`/lessons/${id}`);
export const getAdminLessonById = (id) => api.get(`/lessons/${id}/admin`);
export const createLesson = (data) => api.post('/lessons', data);
export const updateLesson = ({ id, ...data }) => api.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => api.delete(`/lessons/${id}`);
export const submitQuiz = ({ id, ...data }) => api.post(`/lessons/${id}/quiz/submit`, data);
