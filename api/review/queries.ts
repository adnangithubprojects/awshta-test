import { useQuery, useMutation } from "@tanstack/react-query";
import {
  asyncCreateReview,
  asyncGetProductReviews,
  asyncUpdateReview,
  asyncDeleteReview,
  TReviewFilters,
} from "./fetchers";

export enum ReviewQueryKeys {
  REVIEWS = "reviews",
}

export const useGetProductReviews = (
  productId: string,
  filters: TReviewFilters,
) =>
  useQuery({
    queryKey: [ReviewQueryKeys.REVIEWS, productId, filters],
    queryFn: () => asyncGetProductReviews(productId, filters),
    enabled: !!productId,
  });

export const useCreateReview = () =>
  useMutation({
    mutationFn: (data: any) => asyncCreateReview(data),
  });

export const useUpdateReview = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      asyncUpdateReview(id, data),
  });

export const useDeleteReview = () =>
  useMutation({
    mutationFn: (id: string) => asyncDeleteReview(id),
  });
