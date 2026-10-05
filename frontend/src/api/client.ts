import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, AuthPayload } from "../types/api";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
export const rawClient = axios.create({ baseURL, withCredentials: true, headers: { "Content-Type": "application/json" } });
export const apiClient = axios.create({ baseURL, withCredentials: true, headers: { "Content-Type": "application/json" } });
let accessToken: string | null = null;
let refreshPromise: Promise<AuthPayload> | null = null;
let authFailure: (() => void) | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const setAuthFailureHandler = (handler: () => void) => { authFailure = handler; };

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

async function doRefresh() {
  const response = await rawClient.post<ApiResponse<AuthPayload>>("/auth/refresh", {});
  setAccessToken(response.data.data.accessToken);
  return response.data.data;
}

export async function refreshAccess(): Promise<AuthPayload> {
  if (!refreshPromise) {
    const execute = async () => {
      const locks = (navigator as Navigator & { locks?: { request: <T>(name: string, callback: () => Promise<T>) => Promise<T> } }).locks;
      return locks ? locks.request("mern-blog-refresh", doRefresh) : doRefresh();
    };
    refreshPromise = execute().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  if (error.response?.status !== 401 || !config || config._retried || config.url?.includes("/auth/")) return Promise.reject(error);
  config._retried = true;
  try { const auth = await refreshAccess(); config.headers.Authorization = `Bearer ${auth.accessToken}`; return apiClient(config); }
  catch (refreshError) { setAccessToken(null); authFailure?.(); return Promise.reject(refreshError); }
});

export function apiMessage(error: unknown) {
  if (axios.isAxiosError(error)) return (error.response?.data as any)?.message || (error.code === "ERR_NETWORK" ? "Cannot reach the server" : error.message);
  return error instanceof Error ? error.message : "Something went wrong";
}
