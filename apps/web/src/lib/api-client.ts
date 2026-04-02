import Axios, { type AxiosRequestConfig } from 'axios';

export const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3167',
  withCredentials: true,
});

export const fetchInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await api<T>({ ...config, ...options });
  return data;
};

export default fetchInstance;
