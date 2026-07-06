import api from './api_config';

function appendCourseField(formData, key, value) {
	if (value === undefined || value === null || value === '') return;
	formData.append(key, String(value));
}

function buildCourseFormData(data) {
	if (typeof FormData !== 'undefined' && data instanceof FormData) {
		return data;
	}

	const formData = new FormData();
	appendCourseField(formData, 'title', data.title);
	appendCourseField(formData, 'description', data.description);
	appendCourseField(formData, 'category', data.category);
	appendCourseField(formData, 'level', data.level);
	appendCourseField(formData, 'is_free', data.is_free);
	appendCourseField(formData, 'published', data.published);
	appendCourseField(formData, 'price', data.price);

	if (data.imageFile) {
		formData.append('image', data.imageFile);
	}

	if (data.image_url) {
		appendCourseField(formData, 'image_url', data.image_url);
	}

	return formData;
}

export const listCourses = (params) => api.get('/courses', { params });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', buildCourseFormData(data));
export const updateCourse = ({ id, ...data }) => api.put(`/courses/${id}`, buildCourseFormData(data));
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
