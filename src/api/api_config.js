import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request (if present)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }

  return config;
});

// Unwrap response data; on 401 clear token and redirect to login
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const isAuthRequest = requestUrl.startsWith('/auth/');

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      window.location.hash = 'Login';
    }

    const data = error.response?.data;
    const message =
      data?.error ||
      data?.message ||
      (status === 401
        ? 'Invalid email or password.'
        : status === 403
          ? 'Your account is not authorized to continue.'
          : 'Request failed. Please try again.');

    // Zod validation errors come back as { errors: [...] }
    if (data?.errors) {
      const message = data.errors.map((i) => i.message).join(', ');
      return Promise.reject({ error: message, status });
    }

    return Promise.reject({
      error: message,
      status,
      details: data,
    });
  }
);

export default api;
