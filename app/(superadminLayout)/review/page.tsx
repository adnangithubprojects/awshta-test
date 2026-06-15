"use client";
import { memo, useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Star,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  Package,
  Layers,
  ChevronRight,
} from "lucide-react";

import {
  useGetProductReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  ReviewQueryKeys,
} from "@/api/review/queries";

import { ReviewForm } from "@/components/common/_components/reviewComponents";
import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import Modal from "@/components/common/modal";
import useDebounce from "@/hooks/useDebounce";
import { useGetProducts } from "@/api/products/queries";

export const ReviewsAndProductInspectorPage = memo(
  function ReviewsAndProductInspectorPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // --- Core State Machine ---
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [reviewPage, setReviewPage] = useState(1);
    const [productPage, setProductPage] = useState(1);

    // Overlay Modals Configuration
    const [createOpen, setCreateOpen] = useState(false);
    const [editReview, setEditReview] = useState<any | null>(null);
    const [deleteReview, setDeleteReview] = useState<any | null>(null);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 400);

    // Custom Filters State Map
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isFeaturedFilter, setIsFeaturedFilter] = useState<boolean | null>(
      null,
    );

    useEffect(() => {
      setPage(1);
    }, [debouncedSearch, selectedCategory, isFeaturedFilter]);

    // --- Query 1: Fetch Global Products List ---
    const filtersObj = {
      page,
      per_page: 10,
      search: debouncedSearch || null,
      category_id: selectedCategory || null,
      featured: isFeaturedFilter,
    };

    const { data: productList, productsLoading } = useGetProducts(filtersObj);

    const productData = Array.isArray(productList)
      ? productList
      : productList?.items ||
        productList?.data?.items ||
        productList?.data ||
        [];

    // --- Query 2: Contextual Reviews Cache Hook (Only runs when a product is chosen)
    const { data: reviewResponse, isLoading: reviewsLoading } =
      useGetProductReviews(
        selectedProduct?.id || "",
        {
          page: reviewPage,
          per_page: 5,
        },
        // Prevent query firing if no target selected
        { enabled: !!selectedProduct?.id },
      );

    // ✅ Safe fallback check for data structure to prevent compilation exceptions
    const reviewData = Array.isArray(reviewResponse)
      ? reviewResponse
      : reviewResponse?.items || reviewResponse?.data || [];

    const totalReviews = reviewResponse?.total || reviewData?.length || 0;
    const totalPages = reviewResponse?.pages || 0;

    const createMutation = useCreateReview();
    const updateMutation = useUpdateReview();
    const deleteMutation = useDeleteReview();

    const invalidateReviewCache = () =>
      queryClient.invalidateQueries({
        queryKey: [ReviewQueryKeys.REVIEWS, selectedProduct?.id],
      });

    // --- Mutations Pipeline ---
    const handleCreate = (data: any) => {
      createMutation.mutate(data, {
        onSuccess: () => {
          invalidateReviewCache();
          setCreateOpen(false);
          toast("Review processed successfully", "success");
        },
        onError: (e: any) =>
          toast(e?.message || "Error logging response", "error"),
      });
    };

    const handleUpdate = (data: any) => {
      const { product_id, ...cleanedData } = data;

      updateMutation.mutate(
        { id: editReview.id, data: cleanedData },
        {
          onSuccess: () => {
            invalidateReviewCache();
            setEditReview(null);
            toast("Feedback block updated", "success");
          },
          onError: (e: any) =>
            toast(e?.message || "Failed to apply mutations", "error"),
        },
      );
    };

    const handleDelete = () => {
      deleteMutation.mutate(deleteReview.id, {
        onSuccess: () => {
          invalidateReviewCache();
          setDeleteReview(null);
          toast("Review record purged", "info");
        },
        onError: (e: any) =>
          toast(e?.message || "Purge request rejected", "error"),
      });
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-100px)] items-start">
        {/* LEFT COLUMN: Products Navigator Panel */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 p-5 space-y-4 shadow-sm self-stretch">
          <div>
            <h2 className="text-base font-black text-primary tracking-tight">
              Products Ledger
            </h2>
            <p className="text-slate-400 text-[11px]">
              Select an asset tracking row item to query logs.
            </p>
          </div>

          {productsLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {productData?.map((product: any) => {
                const isCurrent = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setReviewPage(1);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
                      isCurrent
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "bg-white border-slate-100 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          isCurrent
                            ? "bg-white border-primary/20 text-primary"
                            : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                      >
                        <Package size={15} />
                      </div>
                      <div className="truncate">
                        <h4
                          className={`text-xs font-bold truncate ${isCurrent ? "text-primary" : "text-primary/80"}`}
                        >
                          {product.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          SKU: {product.sku || "N/A"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`transition-transform shrink-0 ${
                        isCurrent
                          ? "text-primary translate-x-0.5"
                          : "text-slate-300 group-hover:translate-x-0.5"
                      }`}
                    />
                  </button>
                );
              })}

              {productData?.pages > 1 && (
                <div className="pt-2">
                  <Pagination
                    meta={{
                      totalItems: productData.total,
                      currentPage: productData.page,
                      totalPages: productData.pages,
                      perPage: productData.per_page || 8,
                    }}
                    onPageChange={setProductPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Details & Reviews Engine */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedProduct ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-slate-100 text-center p-6 shadow-sm">
              <Layers
                size={36}
                className="text-slate-300 animate-bounce duration-1000 mb-3"
              />
              <h3 className="font-bold text-primary text-sm">
                No Active Inspector Target
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Select a catalog element entry from the side list column array
                to audit performance fields.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <span className="text-primary font-bold text-[10px] uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md">
                      Inspection Summary
                    </span>
                    <h1 className="text-xl font-black text-primary tracking-tight mt-2.5">
                      {selectedProduct.title}
                    </h1>
                  </div>
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={14} /> Leave a Review
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-50 text-xs">
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                    <p className="text-slate-400 font-medium text-[10px]">
                      Price Registry
                    </p>
                    <p className="font-bold text-primary mt-0.5">
                      PKR {selectedProduct.price}
                    </p>
                  </div>
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                    <p className="text-slate-400 font-medium text-[10px]">
                      Sale Index
                    </p>
                    <p className="font-bold text-amber-600 mt-0.5">
                      {selectedProduct.sale_price
                        ? `PKR ${selectedProduct.sale_price}`
                        : "Standard Pricing"}
                    </p>
                  </div>
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                    <p className="text-slate-400 font-medium text-[10px]">
                      Physical Stock
                    </p>
                    <p className="font-bold text-primary mt-0.5">
                      {selectedProduct.stock} Units
                    </p>
                  </div>
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                    <p className="text-slate-400 font-medium text-[10px]">
                      System Quality Rating
                    </p>
                    <p className="font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                      <Star size={11} fill="currentColor" />{" "}
                      {selectedProduct.avg_rating || 0} / 5
                    </p>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="pt-1 text-xs">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">
                      Description Parameters
                    </p>
                    <p className="text-slate-500 leading-relaxed mt-1">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* ✅ Safe reference using safe total calculation variable */}
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Customer Responses ({totalReviews})
                </h3>

                {reviewsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-slate-50 rounded-2xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : !reviewData || reviewData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[2rem] border border-slate-100">
                    <MessageSquare size={24} className="text-slate-300 mb-2" />
                    <p className="font-bold text-primary text-xs">
                      No feedback entries verified
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Be the first to leave user perspective tracking records.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewData.map((review: any) => (
                      <div
                        key={review.id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-start group hover:shadow-sm transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                size={11}
                                fill={
                                  idx < review.rating ? "currentColor" : "none"
                                }
                                className={
                                  idx >= review.rating ? "text-slate-100" : ""
                                }
                              />
                            ))}
                          </div>
                          <div>
                            <h4 className="font-bold text-primary text-xs">
                              {review.title}
                            </h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ">
                          <button
                            onClick={() => setEditReview(review)}
                            className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteReview(review)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {totalPages > 1 && (
                      <Pagination
                        meta={{
                          totalItems: totalReviews,
                          currentPage: reviewResponse?.page || 1,
                          totalPages: totalPages,
                          perPage: reviewResponse?.per_page || 5,
                        }}
                        onPageChange={setReviewPage}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* --- Overlay Modals Portal Stack --- */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Compose Market Review"
        >
          {selectedProduct && (
            <ReviewForm
              productId={selectedProduct.id}
              onSubmit={handleCreate}
              isPending={createMutation.isPending}
            />
          )}
        </Modal>

        <Modal
          isOpen={!!editReview}
          onClose={() => setEditReview(null)}
          title="Modify Feedback Entry"
        >
          {editReview && (
            <ReviewForm
              defaultValues={editReview}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
            />
          )}
        </Modal>

        <Modal
          isOpen={!!deleteReview}
          onClose={() => setDeleteReview(null)}
          title="Purge Feedback Record"
          size="sm"
        >
          <div className="space-y-4">
            <div className="w-10 h-10 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this rating item entry? This
              action drops its validation points immediately.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteReview(null)}
                className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600"
              >
                {deleteMutation.isPending ? "Purging..." : "Confirm"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
);

export default ReviewsAndProductInspectorPage;
