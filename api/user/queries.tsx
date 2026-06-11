import { useQuery, useMutation } from "@tanstack/react-query";
import {
  asyncAddAddress,
  asyncGetAddresses,
  asyncDeleteAddress,
  asyncUpdatePassword,
  asyncUpdateAvatar,
  asyncUpdateProfile,
  asyncGetMyProfile,
  asyncGetAllUsers,
  asyncGetUserById,
  TAddressInput,
  TPasswordInput,
  TProfileInput,
  asyncGetSellerRequests,
  asyncGetCustomers,
} from "./fetchers";
import { QUERY_KEYS } from "../query-keys";

export enum UserQueryKeys {
  USERS = "users",
  ME = "me",
  ADDRESSES = "addresses",
}

export type TSellerStatus = "pending" | "approved" | "rejected" | "suspended";

export interface TSellerRequestRow {
  id: string;
  user_id: string;
  seller_name: string;
  description: string;
  status: TSellerStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TSellerFilters {
  page: number;
  per_page: number;
  status: TSellerStatus;
}

export interface TUpdateSellerStatusInput {
  status: TSellerStatus;
  admin_note: string;
}

export interface TCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TCustomerFilters {
  page: number;
  per_page: number;
  search?: string | null;
}

// --- Addresses Hooks ---

export const useAddAddress = () =>
  useMutation({
    mutationFn: (data: TAddressInput) => asyncAddAddress(data),
  });

export const useGetAddresses = () =>
  useQuery({
    queryKey: [UserQueryKeys.ADDRESSES],
    queryFn: () => asyncGetAddresses(),
  });

export const useDeleteAddress = () =>
  useMutation({
    mutationFn: (addressId: string) => asyncDeleteAddress(addressId),
  });

// --- User Profile & Security Hooks ---

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: (data: TPasswordInput) => asyncUpdatePassword(data),
  });

export const useUpdateAvatar = () =>
  useMutation({
    mutationFn: (formData: FormData) => asyncUpdateAvatar(formData),
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (data: TProfileInput) => asyncUpdateProfile(data),
  });

export const useGetMyProfile = (options?: any) =>
  useQuery({
    queryKey: [UserQueryKeys.ME],
    queryFn: () => asyncGetMyProfile(),
    ...options,
  });

// --- Admin / User Management Hooks ---

export interface TUserFilters {
  page: number;
  per_page: number;
  role?: string | null;
  is_active?: boolean | null;
  search?: string | null;
}

export const useGetAllUsers = (filters: TUserFilters) =>
  useQuery({
    queryKey: [QUERY_KEYS.USER, filters],
    queryFn: () => asyncGetAllUsers(filters),
  });

export const useGetUserById = (id: string) =>
  useQuery({
    queryKey: [UserQueryKeys.USERS, id], // Using an array configuration for specific IDs
    queryFn: () => asyncGetUserById(id),
    enabled: !!id, // Only runs if id is provided
  });

export const useGetSellerRequests = (filters: TSellerFilters) =>
  useQuery({
    queryKey: [QUERY_KEYS.SELLER_REQUESTS, filters],
    queryFn: () => asyncGetSellerRequests(filters),
  });

export const useGetCustomers = (filters: TCustomerFilters) =>
  useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, filters],
    queryFn: () => asyncGetCustomers(filters),
  });
