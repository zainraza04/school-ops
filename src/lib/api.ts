import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api.types';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('schoolops-auth');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          state?: { accessToken?: string | null };
        };
        const token = parsed.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('schoolops-auth');
        document.cookie = 'schoolops_auth=; Max-Age=0; path=/';
        document.cookie = 'schoolops_role=; Max-Age=0; path=/';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.get<ApiResponse<T>>(url, config);
    return res.data;
  },
  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return res.data;
  },
  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return res.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return res.data;
  },
};
