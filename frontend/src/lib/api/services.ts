import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./client";

function routerService(prefix: string) {
  return {
    get: <T>(path = "", config?: AxiosRequestConfig) =>
      apiClient.get<T>(`${prefix}${path}`, config),
    post: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.post<T>(`${prefix}${path}`, data, config),
    put: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.put<T>(`${prefix}${path}`, data, config),
    patch: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.patch<T>(`${prefix}${path}`, data, config),
    delete: <T>(path: string, config?: AxiosRequestConfig) =>
      apiClient.delete<T>(`${prefix}${path}`, config),
  };
}

// Prefixes mirror the existing FastAPI router modules. Endpoint paths remain caller-supplied.
export const authApi = routerService("/auth");
export const contractsApi = routerService("/contracts");
export const obligationsApi = routerService("/obligations");
export const renewalsApi = routerService("/renewals");
export const complianceApi = routerService("/compliance");
export const notificationsApi = routerService("/notifications");
export const reportsApi = routerService("/reports");
export const dashboardApi = routerService("/dashboard");
export const activitiesApi = routerService("/activities");
export const auditLogsApi = routerService("/audit-logs");
export const usersApi = routerService("/users");
