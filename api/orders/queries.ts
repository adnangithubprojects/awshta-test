import { useQuery, useMutation } from "@tanstack/react-query";
import {
  asyncGetOrders,
  asyncCreateOrder,
  asyncGetOrderDetails,
  asyncUpdateOrderStatus,
  TOrderFilters,
  TCreateOrderInput,
  asyncGetSummary,
} from "./fetchers";

export enum OrderQueryKeys {
  ORDERS = "orders",
  ORDER_DETAILS = "order_details",
  SUMMARY = "SUMMARY",
}

export const useGetDashboardSummary = (params?: {
  startDate?: string;
  endDate?: string;
}) =>
  useQuery({
    queryKey: [OrderQueryKeys.SUMMARY, params],
    queryFn: () => asyncGetSummary(params),
  });

export const useGetOrders = (filters: TOrderFilters) =>
  useQuery({
    queryKey: [OrderQueryKeys.ORDERS, filters],
    queryFn: () => asyncGetOrders(filters),
  });

export const useGetOrderDetails = (orderId: string) =>
  useQuery({
    queryKey: [OrderQueryKeys.ORDER_DETAILS, orderId],
    queryFn: () => asyncGetOrderDetails(orderId),
    enabled: !!orderId,
  });

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (data: TCreateOrderInput) => asyncCreateOrder(data),
  });

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      asyncUpdateOrderStatus(id, status),
  });
