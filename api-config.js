const API_BASE = (() => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin && origin.startsWith('http')) {
      return origin;
    }
  }
  return 'http://127.0.0.1:5000';
})();

function apiUrl(path = '') {
  if (!path) {
    return API_BASE;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}
