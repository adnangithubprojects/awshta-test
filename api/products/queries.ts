import { useQuery, useMutation } from "@tanstack/react-query";
import {
  asyncGetProducts,
  asyncCreateProduct,
  asyncGetProductBySlug,
  asyncUpdateProduct,
  asyncDeleteProduct,
  TProductFilters,
} from "./fetchers";

export enum ProductQueryKeys {
  PRODUCTS = "products",
  PRODUCT_DETAILS = "product_details",
}

export const useGetProducts = (filters: TProductFilters) =>
  useQuery({
    queryKey: [ProductQueryKeys.PRODUCTS, filters],
    queryFn: () => asyncGetProducts(filters),
  });

export const useGetProductBySlug = (slug: string) =>
  useQuery({
    queryKey: [ProductQueryKeys.PRODUCT_DETAILS, slug],
    queryFn: () => asyncGetProductBySlug(slug),
    enabled: !!slug,
  });

export const useCreateProduct = () =>
  useMutation({
    mutationFn: (data: any) => asyncCreateProduct(data),
  });

export const useUpdateProduct = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      asyncUpdateProduct(id, data),
  });

export const useDeleteProduct = () =>
  useMutation({
    mutationFn: (id: string) => asyncDeleteProduct(id),
  });
