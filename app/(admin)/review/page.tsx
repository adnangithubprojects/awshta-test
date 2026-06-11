"use client";

import { memo, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  Search,
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

    // --- Master-Detail Workspace Paging States ---
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [reviewPage, setReviewPage] = useState(1);
    const [productPage, setProductPage] = useState(1);

    // Filter Controls Matrix States
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    // Overlay State Parameters
    const [createOpen, setCreateOpen] = useState(false);
    const [editReview, setEditReview] = useState<any | null>(null);
    const [deleteReview, setDeleteReview] = useState<any | null>(null);

    // Sync Paging Index Reset Hooks on State Mutations
    useEffect(() => {
      setProductPage(1);
    }, [debouncedSearch]);

    // --- Active Data Stream Pipeline Hooks ---
    const { data: productList, isLoading: productsLoading } = useGetProducts({
      page: productPage,
      per_page: 10,
      search: debouncedSearch || null,
    });

    const productData = Array.isArray(productList)
      ? productList
      : productList?.items ||
        productList?.data?.items ||
        productList?.data ||
        [];

    const { data: reviewData, isLoading: reviewsLoading } =
      useGetProductReviews(
        selectedProduct?.id || "",
        {
          page: reviewPage,
          per_page: 5,
        },
        { enabled: !!selectedProduct?.id },
      );

    const reviewItems = Array.isArray(reviewData)
      ? reviewData
      : reviewData?.items || reviewData?.data?.items || [];

    const createMutation = useCreateReview();
    const updateMutation = useUpdateReview();
    const deleteMutation = useDeleteReview();

    const invalidateReviewCache = () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewQueryKeys.REVIEWS, selectedProduct?.id],
      });
    };

    // --- Mutative Execution Pipeline Blocks ---
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)] items-start">
        {/* LEFT COLUMN: Master Products Navigation Workspace Control */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm self-stretch flex flex-col">
          <div>
            <h2 className="text-sm font-black text-primary tracking-tight uppercase">
              Products Catalog
            </h2>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">
              Select an asset log row item to trace ratings.
            </p>
          </div>

          {/* Search Box Segment */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/30 transition-colors">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog index titles..."
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {productsLoading ? (
            <div className="space-y-2 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[500px] pr-0.5">
              {productData.map((product: any) => {
                const isCurrent = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(product);
                      setReviewPage(1);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                      isCurrent
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "bg-white border-slate-100 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-xs ${
                          isCurrent
                            ? "bg-white border-primary/20 text-primary"
                            : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                      >
                        <Package size={14} />
                      </div>
                      <div className="truncate">
                        <h4
                          className={`text-xs font-bold truncate ${isCurrent ? "text-primary" : "text-slate-700"}`}
                        >
                          {product.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 font-mono">
                          PKR {Number(product.price).toLocaleString("en-PK")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={13}
                      className={`transition-transform shrink-0 ${isCurrent ? "text-primary translate-x-0.5" : "text-slate-300 group-hover:translate-x-0.5"}`}
                    />
                  </button>
                );
              })}

              {productList?.pages > 1 && (
                <div className="pt-3 border-t border-slate-100">
                  <Pagination
                    meta={{
                      totalItems: productList.total,
                      itemCount: productData.length,
                      currentPage: productList.page,
                      totalPages: productList.pages,
                      itemsPerPage: productList.per_page,
                      hasNextPage: productList.page < productList.pages,
                      hasPreviousPage: productList.page > 1,
                    }}
                    onPageChange={setProductPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Contextual Detail Content Monitor Area */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedProduct ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 text-center p-6 shadow-sm">
              <Layers
                size={32}
                className="text-slate-300 animate-pulse mb-2.5"
              />
              <h3 className="font-bold text-primary text-sm">
                No Active Inspector Target Selected
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Select an active catalog element entry from the side list column
                matrix to audit ratings and metadata metrics.
              </p>
            </div>
          ) : (
            <>
              {/* Active Workspace Header Card banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <span className="text-primary font-black text-[9px] uppercase tracking-wider bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-md">
                      INSPECTION DOSSIER
                    </span>
                    <h1 className="text-lg font-black text-primary tracking-tight mt-2.5">
                      {selectedProduct.title}
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={13} /> <span>Leave Review</span>
                  </button>
                </div>

                {/* Micro Metric Param Grid Section mapping list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                      Base Price
                    </p>
                    <p className="font-black text-slate-800 font-mono mt-0.5">
                      PKR{" "}
                      {Number(selectedProduct.price).toLocaleString("en-PK")}
                    </p>
                  </div>
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                      Promo Price
                    </p>
                    <p className="font-black text-emerald-600 font-mono mt-0.5">
                      {selectedProduct.sale_price
                        ? `PKR ${Number(selectedProduct.sale_price).toLocaleString("en-PK")}`
                        : "None"}
                    </p>
                  </div>
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                      Physical Stock
                    </p>
                    <p className="font-black text-slate-800 mt-0.5">
                      {selectedProduct.stock} Units Available
                    </p>
                  </div>
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                      Global Rating
                    </p>
                    <p className="font-black text-amber-500 flex items-center gap-1 mt-0.5">
                      <Star size={12} fill="currentColor" />{" "}
                      {selectedProduct.avg_rating || "0.0"} / 5
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Review Loops Container Grid */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                  Customer Responses ({reviewData?.total || reviewItems.length})
                </h3>

                {reviewsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-slate-50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : reviewItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-slate-200">
                    <MessageSquare
                      size={24}
                      className="text-slate-300 mb-1.5"
                    />
                    <p className="font-bold text-primary text-xs">
                      No feedback entries verified
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Be the first to submit user perspective tracking records.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reviewItems.map((review: any) => (
                      <div
                        key={review.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-start group transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                size={11}
                                fill={
                                  idx < review.rating ? "currentColor" : "none"
                                }
                                className={
                                  idx >= review.rating ? "text-slate-200" : ""
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
                        <div className="flex gap-0.5 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={() => setEditReview(review)}
                            className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteReview(review)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {reviewData?.pages > 1 && (
                      <div className="pt-2">
                        <Pagination
                          meta={{
                            totalItems: reviewData.total,
                            itemCount: reviewItems.length,
                            currentPage: reviewData.page,
                            totalPages: reviewData.pages,
                            itemsPerPage: reviewData.per_page,
                            hasNextPage: reviewData.page < reviewData.pages,
                            hasPreviousPage: reviewData.page > 1,
                          }}
                          onPageChange={setReviewPage}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* --- OVERLAY SYSTEM MODAL STACK PORTALS --- */}
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
          <div className="space-y-4 pt-1">
            <div className="w-9 h-9 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this rating item entry? This
              action drops its validation points from global product average
              rating calculation metrics immediately.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteReview(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl disabled:opacity-60 transition-colors cursor-pointer"
              >
                {deleteMutation.isPending ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
);

export default ReviewsAndProductInspectorPage;
