import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('electra_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// Handle 401 globally → auto-logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('electra_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string; voterId: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  profile: () => api.get('/auth/profile')
};

// ─── Voting ─────────────────────────────────────────────
export const votingAPI = {
  getCandidates: () => api.get('/voting/candidates'),
  getStatus: () => api.get('/voting/status'),
  castVote: (candidateId: string) => api.post('/voting/vote', { candidateId }),
  getResults: () => api.get('/voting/results')
};

// ─── Admin ──────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  startElection: (data: { title: string; description?: string; startTime: string; endTime: string }) =>
    api.post('/admin/election/start', data),
  endElection: () => api.post('/admin/election/end'),
  getElections: () => api.get('/admin/elections'),
  addCandidate: (data: { name: string; party: string; description?: string; color?: string; symbol?: string }) =>
    api.post('/admin/candidates', data),
  removeCandidate: (id: string) => api.delete(`/admin/candidates/${id}`),
  getUsers: () => api.get('/admin/users'),
  unflagUser: (id: string) => api.post(`/admin/users/${id}/unflag`),
  getFraudReport: () => api.get('/admin/fraud-report'),
  exportCSV: () => api.get('/admin/export/csv', { responseType: 'blob' })
};

export default api;
