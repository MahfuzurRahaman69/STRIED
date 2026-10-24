// ===== START: API CLIENT =====
const API_BASE = '/api';

// A guest id lets someone build a cart/wishlist before registering.
function getGuestId() {
  let id = localStorage.getItem('guestId');
  if (!id) {
    id = 'g' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('guestId', id);
  }
  return id;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'x-guest-id': getGuestId() };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

async function apiRequest(method, path, body) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });
  let data;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    throw new Error((data && data.error) || 'Something went wrong. Please try again.');
  }
  return data;
}

const api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  put: (path, body) => apiRequest('PUT', path, body),
  del: (path, body) => apiRequest('DELETE', path, body)
};

function isLoggedIn() { return !!localStorage.getItem('token'); }
function currentUserName() { return localStorage.getItem('userName') || ''; }
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}
// ===== END: API CLIENT =====

// Bangladesh Taka display helper. Product prices in db.json are demo placeholders.
function formatBDT(amount) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(Number(amount) || 0);
}
