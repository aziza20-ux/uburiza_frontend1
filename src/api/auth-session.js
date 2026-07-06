export function getStoredUser() {
  if (!localStorage.getItem('token')) return null;

  try {
    const stored = localStorage.getItem('loggedInUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function getPostLoginView(user) {
  return user.role === 'ADMIN' ? 'Analytics' : 'Dashboard';
}

export function persistSession(data, { setUser, setUserRole }) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('loggedInUser', JSON.stringify(data.user));
  setUser(data.user);
  setUserRole(data.user.role.toLowerCase());
  return getPostLoginView(data.user);
}

export function clearSession({ setUser, setUserRole }) {
  localStorage.removeItem('token');
  localStorage.removeItem('loggedInUser');
  setUser(null);
  setUserRole('learner');
}

export function getAuthErrorMessage(err, fallback) {
  return err?.error || fallback;
}
