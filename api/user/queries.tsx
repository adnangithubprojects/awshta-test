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
} from "./fetchers";

enum QueryKeys {
  USERS = "users",
  ME = "me",
  ADDRESSES = "addresses",
}

// --- Addresses Hooks ---

export const useAddAddress = () =>
  useMutation({
    mutationFn: (data: any) => asyncAddAddress(data),
  });

export const useGetAddresses = () =>
  useQuery({
    queryKey: [QueryKeys.ADDRESSES],
    queryFn: () => asyncGetAddresses(),
  });

export const useDeleteAddress = () =>
  useMutation({
    mutationFn: (addressId: string) => asyncDeleteAddress(addressId),
  });

// --- User Profile & Security Hooks ---

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: (data: any) => asyncUpdatePassword(data),
  });

export const useUpdateAvatar = () =>
  useMutation({
    mutationFn: (formData: FormData) => asyncUpdateAvatar(formData),
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (data: any) => asyncUpdateProfile(data),
  });

export const useGetMyProfile = () =>
  useQuery({
    queryKey: [QueryKeys.ME],
    queryFn: () => asyncGetMyProfile(),
  });

// --- Admin / User Management Hooks ---

export const useGetAllUsers = () =>
  useQuery({
    queryKey: [QueryKeys.USERS],
    queryFn: () => asyncGetAllUsers(),
  });

export const useGetUserById = (id: string) =>
  useQuery({
    queryKey: [QueryKeys.USERS, id], // Using an array configuration for specific IDs
    queryFn: () => asyncGetUserById(id),
    enabled: !!id, // Only runs if id is provided
  });
