import type { LabDashboardPayload } from "@/lib/services/lab-dashboard.service";

export type LabDashboardState = {
  data: LabDashboardPayload | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

export type LabDashboardActions = {
  refresh: () => Promise<void>;
};

export const initialLabDashboardState: LabDashboardState = {
  data: null,
  loading: true,
  error: null,
  lastFetchedAt: null,
};
