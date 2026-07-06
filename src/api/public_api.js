const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Public API error: ${res.status}`);
  return res.json();
}

export const getPublicStats = () => get('/public/stats');
export const getPublicCourses = (limit = 3) => get(`/public/courses?limit=${limit}`);
