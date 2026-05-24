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
} from "./fetchers";

export enum UserQueryKeys {
  USERS = "users",
  ME = "me",
  ADDRESSES = "addresses",
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

export const useGetMyProfile = () =>
  useQuery({
    queryKey: [UserQueryKeys.ME],
    queryFn: () => asyncGetMyProfile(),
  });

// --- Admin / User Management Hooks ---

export const useGetAllUsers = () =>
  useQuery({
    queryKey: [UserQueryKeys.USERS],
    queryFn: () => asyncGetAllUsers(),
  });

export const useGetUserById = (id: string) =>
  useQuery({
    queryKey: [UserQueryKeys.USERS, id], // Using an array configuration for specific IDs
    queryFn: () => asyncGetUserById(id),
    enabled: !!id, // Only runs if id is provided
  });
