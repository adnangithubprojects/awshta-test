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
  productId: string; // Passed contextually from the Active Product View
  productTitle?: string;
}

const ReviewsPage = memo(function ReviewsPage({
  productId,
  productTitle = "Product Reference Asset",
}: ReviewsPageProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Filter Pagination Sync States ---
  const [page, setPage] = useState(1);

  // Overlay Trigger Modals Configuration
  const [createOpen, setCreateOpen] = useState(false);
  const [editReview, setEditReview] = useState<any | null>(null);
  const [deleteReview, setDeleteReview] = useState<any | null>(null);

  // --- Cache Sync Hooks ---
  const { data, isLoading } = useGetProductReviews(productId, {
    page,
    per_page: 10,
  });

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();

  const invalidateCache = () =>
    queryClient.invalidateQueries({
      queryKey: [ReviewQueryKeys.REVIEWS, productId],
    });

  // --- Transactions Pipeline ---
  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        invalidateCache();
        setCreateOpen(false);
        toast("Review processed successfully", "success");
      },
      onError: (e: any) =>
        toast(e?.message || "Error logging response context", "error"),
    });
  };

  const handleUpdate = (data: any) => {
    updateMutation.mutate(
      { id: editReview.id, data },
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
    <div className="space-y-6">
      {/* Structural Header Context */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md">
            Feedback Index
          </span>
          <h1 className="text-xl font-black text-primary tracking-tight mt-2">
            {productTitle}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Displaying customer rating metrics and review text entries.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus size={16} /> Leave a Review
        </button>
      </div>

      {/* Primary Display Architecture */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-slate-100">
          <MessageSquare size={32} className="text-slate-300 mb-2" />
          <p className="font-bold text-primary text-sm">No reviews yet</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Be the first to share your experience with this item.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Loop Review Cards Pattern */}
          <div className="grid grid-cols-1 gap-4">
            {data.items.map((review: any) => (
              <div
                key={review.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-start group hover:shadow-sm transition-all"
              >
                <div className="space-y-2">
                  {/* Visual Star Matrix Display */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={12}
                        fill={idx < review.rating ? "currentColor" : "none"}
                        className={idx >= review.rating ? "text-slate-200" : ""}
                      />
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary text-sm">
                      {review.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {review.comment}
                    </p>
                  </div>
                </div>

                {/* Card Actions Options Group */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditReview(review)}
                    className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteReview(review)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Footer Pagination Engine */}
          {data?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: data.total,
                currentPage: data.page,
                totalPages: data.pages,
                perPage: data.per_page || 10,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- Overlay Modals Portal Stack --- */}

      {/* Create Modal */}
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

      {/* Edit Modal */}
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

      {/* Delete Confirmation Modal */}
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
            Are you sure you want to delete this rating item entry? This action
            drops its validation points from global product average rating
            calculation metrics immediately.
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
              {deleteMutation.isPending ? "Purging Record..." : "Confirm Purge"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default ReviewsPage;
