import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: '/api', // Use proxy path in development
  headers: {
    'Client-Service': 'COHAPPRT',
    'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
    'rurl': 'login.etribes.in',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for sending cookies (ci_session)
});

// Add interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;