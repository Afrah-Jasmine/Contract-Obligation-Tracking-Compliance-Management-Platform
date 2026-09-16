import axios from 'axios';

export const getAccessToken = () => localStorage.getItem('access_token') || localStorage.getItem('token');

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000', //  Ensure NO extra path like '/api' is appended here
});

// Attach JWT token if available
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;