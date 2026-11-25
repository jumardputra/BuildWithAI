/** Klien API tipis dengan penanganan galat seragam. */

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return { ok: true, data: null };

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Permintaan gagal.');
    err.status = res.status;
    err.code = data?.error?.code;
    err.fields = data?.error?.fields || {};
    throw err;
  }
  return { ok: true, data };
}

export const api = {
  me: () => request('/api/auth/me'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  listDocs: () => request('/api/documents'),
  saveDoc: (payload) => request('/api/documents', { method: 'POST', body: payload }),
  deleteDoc: (id) => request(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  health: () => request('/api/health')
};
