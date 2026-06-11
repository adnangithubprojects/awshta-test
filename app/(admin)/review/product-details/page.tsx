"use client";

import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Star,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
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

interface ReviewsPageProps {
  productId: string;
  productTitle?: string;
}

const ReviewsPage = memo(function ReviewsPage({
  productId,
  productTitle = "Product Reference Asset",
}: ReviewsPageProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);

  // Overlay Triggers Configurations
  const [createOpen, setCreateOpen] = useState(false);
  const [editReview, setEditReview] = useState<any | null>(null);
  const [deleteReview, setDeleteReview] = useState<any | null>(null);

  // --- React Query Data Sync Hooks ---
  const { data, isLoading } = useGetProductReviews(productId, {
    page,
    per_page: 10,
  });

  const reviewList = Array.isArray(data)
    ? data
    : data?.items || data?.data?.items || [];

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();

  const invalidateCache = () =>
    queryClient.invalidateQueries({
      queryKey: [ReviewQueryKeys.REVIEWS, productId],
    });

  // --- Mutative Transactions Pipelines ---
  const handleCreate = (formData: any) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        invalidateCache();
        setCreateOpen(false);
        toast("Review processed successfully", "success");
      },
      onError: (e: any) =>
        toast(e?.message || "Error logging response context", "error"),
    });
  };

  const handleUpdate = (formData: any) => {
    updateMutation.mutate(
      { id: editReview.id, data: formData },
      {
        onSuccess: () => {
          invalidateCache();
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
        invalidateCache();
        setDeleteReview(null);
        toast("Review record purged", "info");
      },
      onError: (e: any) =>
        toast(e?.message || "Purge request rejected", "error"),
    });
  };

  return (
    <div className="space-y-5">
      {/* Structural Header Context Banner */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-primary font-black text-[9px] uppercase tracking-wider bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-md">
            FEEDBACK INDEX
          </span>
          <h1 className="text-base font-black text-primary tracking-tight mt-2">
            {productTitle}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Displaying customer rating metrics and review text entries.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={14} /> <span>Leave a Review</span>
        </button>
      </div>

      {/* Primary Query View Distribution Layer */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : reviewList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-slate-200 text-center p-4">
          <MessageSquare size={28} className="text-slate-300 mb-2" />
          <p className="font-bold text-primary text-xs">
            No reviews submitted yet
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Be the first to share your validation experience with this item.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {reviewList.map((review: any) => (
              <div
                key={review.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-start group transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={11}
                        fill={idx < review.rating ? "currentColor" : "none"}
                        className={idx >= review.rating ? "text-slate-200" : ""}
                      />
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      {review.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      {review.comment}
                    </p>
                  </div>
                </div>

                {/* Hover Display Row Action Buttons */}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
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
          </div>

          {data?.pages > 1 && (
            <div className="pt-2">
              <Pagination
                meta={{
                  totalItems: data.total,
                  itemCount: reviewList.length,
                  currentPage: data.page,
                  totalPages: data.pages,
                  itemsPerPage: data.per_page || 10,
                  hasNextPage: data.page < data.pages,
                  hasPreviousPage: data.page > 1,
                }}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* --- OVERLAY VIEW PORTS STACK DIALOGS --- */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Compose Market Review"
      >
        <ReviewForm
          productId={productId}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
        />
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
            Are you sure you want to delete this rating item entry? This action
            drops its validation points from global product average rating
            calculation metrics immediately.
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
});

export default ReviewsPage;
