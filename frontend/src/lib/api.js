const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('accessToken');
}

function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (err) {
    return { statusCode: 0, message: 'Cannot connect to the server. Is the backend running?', data: null, success: false };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = { statusCode: response.status, message: response.statusText, data: null, success: response.ok };
  }

  if (response.status === 401 && !path.includes('/refreshAccessToken')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request(path, options);
    }
    clearTokens();
  }

  return data;
}

let refreshing = false;
async function tryRefreshToken() {
  if (refreshing) return false;
  refreshing = true;
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/userAuth/refreshAccessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) return false;
    const data = await response.json();
    if (data.success && data.data?.accessToken) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    refreshing = false;
  }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, isFormData = false) =>
    request(path, { method: 'POST', body: isFormData ? body : JSON.stringify(body) }),
  put: (path, body, isFormData = false) =>
    request(path, { method: 'PUT', body: isFormData ? body : JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  setTokens,
  clearTokens,
  getToken,
};

export { API_BASE_URL };
