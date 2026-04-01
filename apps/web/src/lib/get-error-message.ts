import { AxiosError } from 'axios';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message: string | string[] }).message;
      return Array.isArray(msg) ? msg[0] : msg;
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
