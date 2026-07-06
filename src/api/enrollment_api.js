import api from './api_config';

export const getMyEnrollments = async () => {
  try {
    console.log('📡 API Request: GET /api/my-courses');
    const response = await api.get('/my-courses');
    console.log('📦 API Response: GET /api/my-courses', response);
    return response;
  } catch (error) {
    console.error('❌ API Error: GET /api/my-courses', error);
    // Return empty courses array as fallback
    return { courses: [] };
  }
};
export const enrollCourse = (data) => api.post('/enroll', data);
export const redeemAccessCode = (data) => api.post('/redeem-code', data);
export const markLessonComplete = async ({ lessonId }) => {
  console.log('📡 API Request: POST /api/progress', { lessonId });
  try {
    const response = await api.post('/progress', { lessonId });
    console.log('📦 API Response: POST /api/progress', response);
    return response;
  } catch (error) {
    console.error('❌ API Error: POST /api/progress', error);
    throw error;
  }
};
export const getCourseProgress = (courseId) => api.get(`/progress/${courseId}`);
export const getAdminStats = () => api.get('/admin/analytics');
export const getLearners = () => api.get('/admin/learners');
export const generateAccessCodes = (data) => api.post('/admin/access-codes', data);
export const getCoursesWithAccessCodes = () => api.get('/admin/access-codes');
export const getAccessCodesByCourse = (courseId) => api.get(`/admin/access-codes/${courseId}`);
export const getAdminAllCourses = () => api.get('/admin/courses');
export const deleteExpiredAccessCodes = (courseId) => api.delete(`/admin/access-codes/${courseId}/expired`);
