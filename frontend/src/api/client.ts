import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE || '/api';

const client = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = import.meta.env.VITE_BASE_PATH ? `${import.meta.env.VITE_BASE_PATH}/login` : '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
