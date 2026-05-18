import { useQuery, useMutation } from "@tanstack/react-query";
import {
  asyncGetCategories,
  asyncCreateCategory,
  asyncGetCategoriesTree,
  asyncGetCategoryById,
  asyncUpdateCategory,
  asyncDeleteCategory,
  asyncUpdateCategoryImage,
} from "./fetchers";

export enum CategoryQueryKeys {
  CATEGORIES = "categories",
  CATEGORIES_TREE = "categories_tree",
}

export const useGetCategories = () =>
  useQuery({
    queryKey: [CategoryQueryKeys.CATEGORIES],
    queryFn: () => asyncGetCategories(),
  });

export const useGetCategoriesTree = () =>
  useQuery({
    queryKey: [CategoryQueryKeys.CATEGORIES_TREE],
    queryFn: () => asyncGetCategoriesTree(),
  });

export const useGetCategoryById = (id: string) =>
  useQuery({
    queryKey: [CategoryQueryKeys.CATEGORIES, id],
    queryFn: () => asyncGetCategoryById(id),
    enabled: !!id,
  });

export const useCreateCategory = () =>
  useMutation({
    mutationFn: (data: any) => asyncCreateCategory(data),
  });

export const useUpdateCategory = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      asyncUpdateCategory(id, data),
  });

export const useDeleteCategory = () =>
  useMutation({
    mutationFn: (id: string) => asyncDeleteCategory(id),
  });

export const useUpdateCategoryImage = () =>
  useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      asyncUpdateCategoryImage(id, formData),
  });
