import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, MessageSquare, Type } from "lucide-react";
import TextInput from "../textInput";

export const reviewSchema = z.object({
  product_id: z
    .string()
    .uuid("Invalid product reference identifier")
    .optional(),
  rating: z
    .number()
    .min(1, "Please select at least 1 star")
    .max(5, "Max scale exceeded"),
  title: z.string().min(3, "Summary header must be at least 3 characters"),
  comment: z
    .string()
    .min(5, "Feedback explanation must be at least 5 characters"),
});

type TReviewForm = z.infer<typeof reviewSchema>;

// Interactive Star Input Component
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-1 transition-transform active:scale-90 cursor-pointer ${star <= value ? "text-amber-500" : "text-slate-200"}`}
        >
          <Star size={22} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({
  productId,
  defaultValues,
  onSubmit,
  isPending,
}: {
  productId?: string;
  defaultValues?: Partial<TReviewForm>;
  onSubmit: (data: TReviewForm) => void;
  isPending: boolean;
}) {
  const { control, handleSubmit, register } = useForm<TReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: "", comment: "", ...defaultValues },
  });

  const handleFormSubmit = (data: TReviewForm) => {
    onSubmit({
      ...data,
      ...(productId && { product_id: productId }),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Score Assignment
        </label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRatingInput value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <TextInput
        name="title"
        control={control}
        label="Review Summary Header"
        placeholder="Exceptional quality, highly recommended"
        icon={Type}
      />

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MessageSquare size={13} /> Detailed Feedback Context
        </label>
        <textarea
          {...register("comment")}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-secondary outline-none focus:border-primary/40 focus:bg-white transition-all resize-none"
          placeholder="Describe your user experience with this asset item..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Publishing Context..." : "Submit Feedback"}
      </button>
    </form>
  );
}
