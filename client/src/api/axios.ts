import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

const BUSINESS_APPROVAL_REQUIRED_MESSAGE =
  'Isletme onayi bekleniyor. MAIN_ADMIN onayi sonrasi giris yapabilirsiniz.';

const isApprovalPendingError = (error: any) =>
  error.response?.status === 403 &&
  error.response?.data?.message === BUSINESS_APPROVAL_REQUIRED_MESSAGE;

const isAuthEntryRequest = (requestUrl?: string) =>
  requestUrl?.includes('/auth/login') || requestUrl?.includes('/auth/demo-login');

// Request interceptor — her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 401 gelirse refresh token ile yenile
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isApprovalPendingError(error)) {
      if (isAuthEntryRequest(originalRequest?.url)) {
        return Promise.reject(error);
      }

      useAuthStore.getState().logout();
      window.location.href = '/login?approvalPending=true';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/refresh`, { refreshToken });
        const newToken = res.data.token;

        useAuthStore.getState().setToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
