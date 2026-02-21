import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 30000,
  });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  let retryCount = 0;
  const maxRetries = 3;

  client.interceptors.response.use(
    (response) => {
      retryCount = 0;
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config;

      if (!config) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (
        error.response?.status &&
        error.response.status >= 500 &&
        retryCount < maxRetries &&
        config.method !== 'post'
      ) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
