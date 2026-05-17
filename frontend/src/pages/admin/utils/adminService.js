/**
 * adminService.js
 * Centralized service layer for all admin API calls.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── helpers ──────────────────────────────────────────────────────────────────

function getAuthToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getStats = () => request('/admin/stats');

export const getRecentUsers = (limit = 5) =>
  request(`/admin/users/recent?limit=${limit}`);

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = ({ type = '', search = '', page = 1, limit = 10 } = {}) => {
  const qs = new URLSearchParams({
    ...(type ? { type } : {}),
    ...(search ? { search } : {}),
    page: String(page),
    limit: String(limit),
  });
  return request(`/admin/users?${qs}`);
};

export const toggleUserStatus = (userId, isActive) =>
  request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });

export const deleteUser = (userId) =>
  request(`/admin/users/${userId}`, { method: 'DELETE' });

// ── Subscriptions ─────────────────────────────────────────────────────────────

export const getSubscriptions = ({ status = '', search = '' } = {}) => {
  const qs = new URLSearchParams({
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });
  return request(`/admin/subscriptions?${qs}`);
};

export const getSubscriptionStats = () => request('/admin/subscriptions/stats');

// ── Named export ──────────────────────────────────────────────────────────────

export const adminService = {
  getStats,
  getRecentUsers,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getSubscriptions,
  getSubscriptionStats,
};

export default adminService;