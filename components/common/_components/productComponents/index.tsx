import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Tag, Layers, DollarSign, Archive, Star } from "lucide-react";
import TextInput from "../textInput";

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z
    .number({ invalid_type_error: "Price is required" })
    .positive("Must be greater than 0"),
  description: z.string().optional().nullable(),
  sale_price: z.number().optional().nullable(),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
  sku: z.string().optional().nullable(),
  category_id: z
    .string()
    .uuid("Invalid category tracking format")
    .or(z.literal("")),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  images: z.array(z.string()).default([]),
});

type TProductForm = z.infer<typeof productSchema>;

export function ProductForm({
  defaultValues,
  categories,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<TProductForm>;
  categories: any[];
  onSubmit: (data: TProductForm) => void;
  isPending: boolean;
}) {
  const { control, handleSubmit, register } = useForm<TProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: 0,
      description: "",
      stock: 0,
      is_featured: false,
      is_active: true,
      images: [],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          name="title"
          control={control}
          label="Product Title"
          placeholder="Amoxicillin 500mg"
          icon={Package}
        />
        <TextInput
          name="sku"
          control={control}
          label="SKU / Barcode Identifier"
          placeholder="AMX-500-100"
          icon={Tag}
        />

        <TextInput
          name="price"
          control={control}
          label="Retail Price (PKR)"
          type="number"
          placeholder="1200"
          icon={DollarSign}
        />
        <TextInput
          name="sale_price"
          control={control}
          label="Special Sale Price (PKR)"
          type="number"
          placeholder="950"
          icon={DollarSign}
        />

        <TextInput
          name="stock"
          control={control}
          label="Physical Inventory Units"
          type="number"
          placeholder="50"
          icon={Archive}
        />

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Layers size={13} /> Linked Classification Category
          </label>
          <select
            {...register("category_id")}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-secondary outline-none focus:border-primary/40 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">Select Target Category Block</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Product Description Log
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-secondary outline-none focus:border-primary/40 focus:bg-white transition-all resize-none"
          placeholder="Enter full specifications..."
        />
      </div>

      <div className="flex items-center gap-6 py-2">
        <Controller
          name="is_featured"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="rounded border-slate-300 text-primary"
              />
              Promote to Featured Carousel
            </label>
          )}
        />
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="rounded border-slate-300 text-primary"
              />
              Expose Visible to Public Marketplace
            </label>
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Writing Parameters..." : "Save Product Entity"}
      </button>
    </form>
  );
}
