import { apiClient } from "./client";
import type { DashboardSummary, StatusCount, UpcomingRenewal } from "./types";

export const dashboardApi = {
  summary: () => apiClient.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),
  contractStatus: () =>
    apiClient.get<StatusCount[]>("/dashboard/contract-status").then((r) => r.data),
  obligationStatus: () =>
    apiClient.get<StatusCount[]>("/dashboard/obligation-status").then((r) => r.data),
  upcomingRenewals: () =>
    apiClient.get<UpcomingRenewal[]>("/dashboard/upcoming-renewals").then((r) => r.data),
};
