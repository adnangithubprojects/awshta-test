import { useQuery } from "@tanstack/react-query";

import { asyncGetAdminOrders, asyncGetSingleOrder, asyncGetSummary } from "./fetchers";

import { TAdminOrderFilters } from "@/types/order";

export const OrderQueryKeys = {
  ALL: ["ORDERS"] as const,

  ADMIN_LIST: (filters: TAdminOrderFilters) =>
    [...OrderQueryKeys.ALL, "admin", filters] as const,

  DETAIL: (id: string | null) => [...OrderQueryKeys.ALL, "detail", id] as const,

  SUMMARY: ["SUMMARY"] as const,
};

export const useGetAdminOrders = (filters: TAdminOrderFilters) => {
  return useQuery({
    queryKey: OrderQueryKeys.ADMIN_LIST(filters),

    queryFn: () => asyncGetAdminOrders(filters),
  });
};

export const useGetSingleOrder = (id: string | null) => {
  return useQuery({
    queryKey: OrderQueryKeys.DETAIL(id),

    queryFn: () => asyncGetSingleOrder(id!),

    enabled: !!id,
  });
};

export const useGetDashboardSummary = (params?: {
  startDate?: string;

  endDate?: string;
}) =>
  useQuery({
    queryKey: [OrderQueryKeys.SUMMARY, params],

    queryFn: () => asyncGetSummary(params),
  });
