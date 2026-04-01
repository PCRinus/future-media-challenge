import Axios, { type AxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'access_token';

export const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3167',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const fetchInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await api<T>({ ...config, ...options });
  return data;
};

export default fetchInstance;
