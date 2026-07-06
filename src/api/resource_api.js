import api from './api_config';

export const listResources = (params) => api.get('/resources', { params });

function appendIfPresent(form, key, value) {
  if (value === undefined || value === null || value === '') return;
  form.append(key, value instanceof File ? value : String(value));
}

function buildResourceFormData(data) {
  const form = new FormData();
  appendIfPresent(form, 'title', data.title);
  appendIfPresent(form, 'category', data.category);
  appendIfPresent(form, 'type', data.type);
  appendIfPresent(form, 'description', data.description);
  appendIfPresent(form, 'courseId', data.courseId ?? data.course_id);
  appendIfPresent(form, 'file_url', data.file_url);
  if (data.file) form.append('file', data.file);
  return form;
}

export const uploadResource = (data) => api.post('/resources', buildResourceFormData(data));
export const createResource = (data) => uploadResource(data);

export const updateResource = ({ id, ...data }) => {
  const form = new FormData();
  appendIfPresent(form, 'title', data.title);
  appendIfPresent(form, 'description', data.description);
  appendIfPresent(form, 'category', data.category);
  appendIfPresent(form, 'type', data.type);
  appendIfPresent(form, 'courseId', data.courseId ?? data.course_id);
  appendIfPresent(form, 'file_url', data.file_url);
  if (data.file) form.append('file', data.file);
  return api.put(`/resources/${id}`, form);
};
export const deleteResource = (id) => api.delete(`/resources/${id}`);
