import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Tag,
  Layers,
  DollarSign,
  Archive,
  Star,
  Pencil,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import TextInput from "../textInput";
import SelectInput from "../selectInput";
import { useState } from "react";

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.coerce
    .number({ invalid_type_error: "Price is required" })
    .positive("Price must be greater than 0"),
  description: z.string().optional().nullable(),

  sale_price: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.coerce
      .number()
      .positive("Sale price must be greater than 0")
      .nullable()
      .optional(),
  ),
  stock: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : val),
    z.coerce
      .number()
      .int("Stock must be a whole number")
      .nonnegative("Stock cannot be negative")
      .default(0),
  ),
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
          {/* <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Layers size={13} /> Linked Classification Category
          </label>
          <select
            {...register("category_id")}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary/40 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">Select Target Category Block</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select> */}
          <SelectInput
            name="category_id"
            control={control}
            label="Linked Classification Category"
            placeholder="Choose tags..."
            icon={Layers}
            options={categories}
            // isMulti={true} // Toggles custom multi-pill engine active
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Product Description Log
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-primary outline-none focus:border-primary/40 focus:bg-white transition-all resize-none"
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

export function RowActions({
  category,
  onEdit,
  onUpdateImage,
  onDelete,
}: {
  category: any;
  onEdit: (cat: any) => void;
  onUpdateImage: (cat: any) => void;
  onDelete: (cat: any) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors cursor-pointer"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 w-48 overflow-hidden">
            <button
              onClick={() => {
                onEdit(category);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Pencil size={14} className="text-primary" /> Edit Structural Data
            </button>
            <button
              onClick={() => {
                onUpdateImage(category);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {/* <Image size={14} className="text-amber-500" /> Replace Image File */}
            </button>
            <div className="border-t border-slate-50 my-1" />
            <button
              onClick={() => {
                onDelete(category);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete Category
            </button>
          </div>
        </>
      )}
    </div>
  );
}
