// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   Package,
//   Tag,
//   Layers,
//   DollarSign,
//   Archive,
//   Star,
//   Image as ImageIcon,
//   Pencil,
//   MoreHorizontal,
//   Trash2,
// } from "lucide-react";
// import TextInput from "../textInput";
// import SelectInput from "../selectInput";
// import { useState } from "react";
// import Image from "next/image";

// export const productSchema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   price: z.coerce
//     .number({ invalid_type_error: "Price is required" })
//     .positive("Price must be greater than 0"),
//   description: z.string().optional().nullable(),

//   sale_price: z.preprocess(
//     (val) => (val === "" || val === undefined ? null : val),
//     z.coerce
//       .number()
//       .positive("Sale price must be greater than 0")
//       .nullable()
//       .optional(),
//   ),
//   stock: z.preprocess(
//     (val) => (val === "" || val === undefined ? 0 : val),
//     z.coerce
//       .number()
//       .int("Stock must be a whole number")
//       .nonnegative("Stock cannot be negative")
//       .default(0),
//   ),
//   sku: z.string().optional().nullable(),
//   category_id: z
//     .string()
//     .uuid("Invalid category tracking format")
//     .or(z.literal("")),
//   is_featured: z.boolean().default(false),
//   is_active: z.boolean().default(true),
//   images: z.array(z.string()).default([]),
// });

// type TProductForm = z.infer<typeof productSchema>;

// export function ProductForm({
//   defaultValues,
//   categories,
//   onSubmit,
//   isPending,
// }: {
//   defaultValues?: Partial<TProductForm>;
//   categories: any[];
//   onSubmit: (data: TProductForm) => void;
//   isPending: boolean;
// }) {
//   const { control, handleSubmit, register } = useForm<TProductForm>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       title: "",
//       price: 0,
//       description: "",
//       stock: 0,
//       is_featured: false,
//       is_active: true,
//       images: [],
//       ...defaultValues,
//     },
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <TextInput
//           name="title"
//           control={control}
//           label="Product Title"
//           placeholder="Amoxicillin 500mg"
//           icon={Package}
//         />
//         <TextInput
//           name="sku"
//           control={control}
//           label="SKU / Barcode Identifier"
//           placeholder="AMX-500-100"
//           icon={Tag}
//         />

//         <TextInput
//           name="price"
//           control={control}
//           label="Retail Price (PKR)"
//           type="number"
//           placeholder="1200"
//           icon={DollarSign}
//         />
//         <TextInput
//           name="sale_price"
//           control={control}
//           label="Special Sale Price (PKR)"
//           type="number"
//           placeholder="950"
//           icon={DollarSign}
//         />

//         <TextInput
//           name="stock"
//           control={control}
//           label="Physical Inventory Units"
//           type="number"
//           placeholder="50"
//           icon={Archive}
//         />

//         <div>
//           {/* <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
//             <Layers size={13} /> Linked Classification Category
//           </label>
//           <select
//             {...register("category_id")}
//             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary/40 focus:bg-white transition-all cursor-pointer"
//           >
//             <option value="">Select Target Category Block</option>
//             {categories?.map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select> */}
//           <SelectInput
//             name="category_id"
//             control={control}
//             label="Linked Classification Category"
//             placeholder="Choose tags..."
//             icon={Layers}
//             options={categories}
//             // isMulti={true} // Toggles custom multi-pill engine active
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
//           Product Description Log
//         </label>
//         <textarea
//           {...register("description")}
//           rows={3}
//           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-primary outline-none focus:border-primary/40 focus:bg-white transition-all resize-none"
//           placeholder="Enter full specifications..."
//         />
//       </div>

//       <div className="flex items-center gap-6 py-2">
//         <Controller
//           name="is_featured"
//           control={control}
//           render={({ field }) => (
//             <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600 select-none">
//               <input
//                 type="checkbox"
//                 checked={field.value}
//                 onChange={(e) => field.onChange(e.target.checked)}
//                 className="rounded border-slate-300 text-primary"
//               />
//               Promote to Featured Carousel
//             </label>
//           )}
//         />
//         <Controller
//           name="is_active"
//           control={control}
//           render={({ field }) => (
//             <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600 select-none">
//               <input
//                 type="checkbox"
//                 checked={field.value}
//                 onChange={(e) => field.onChange(e.target.checked)}
//                 className="rounded border-slate-300 text-primary"
//               />
//               Expose Visible to Public Marketplace
//             </label>
//           )}
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={isPending}
//         className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
//       >
//         {isPending ? "Writing Parameters..." : "Save Product Entity"}
//       </button>
//     </form>
//   );
// }

export function RowActions({
  product,
  onEdit,
  onUpdateImage,
  onDelete,
  onAddReview,
}: {
  product: any;
  onEdit: (cat: any) => void;
  onUpdateImage: (cat: any) => void;
  onDelete: (cat: any) => void;
  onAddReview: (product: any) => void;
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
                onAddReview(product);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Star size={14} className="text-amber-500 fill-amber-500" /> Add
              Review
            </button>
            <button
              onClick={() => {
                onEdit(product);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Pencil size={14} className="text-primary" /> Edit Product
            </button>
            <button
              onClick={() => {
                onUpdateImage(product);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ImageIcon size={14} className="text-amber-500" />
              Replace Image
            </button>
            <div className="border-t border-slate-50 my-1" />
            <button
              onClick={() => {
                onDelete(product);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete Product
            </button>
          </div>
        </>
      )}
    </div>
  );
}
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
  Image as ImageIcon,
  Pencil,
  MoreHorizontal,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import TextInput from "../textInput";
import SelectInput from "../selectInput";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import react-quill-new with SSR disabled to prevent hydration errors
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-40 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
  ),
});

// Import Quill's theme styles
import "react-quill-new/dist/quill.snow.css";
import { BASE_URL } from "@/config/url-config";
import { useGetProductBySlug } from "@/api/products/queries";
import { de } from "zod/v4/locales";

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
  images: z
    .array(z.any())
    .min(1, "At least one product image file is required"),
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
  const { data } = useGetProductBySlug(defaultValues?.slug || "");
  const singleProduct = data?.data;
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TProductForm>({
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

  const pickedImages = watch("images") || [];

  // Handle local multi-file image picking/uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setValue("images", [...pickedImages, ...filesArray], {
        shouldValidate: true,
      });
    }
  };

  // Remove selected image tracking
  const removeImage = (index: number) => {
    const updated = [...pickedImages];
    updated.splice(index, 1);
    setValue("images", updated, { shouldValidate: true });
  };

  // Custom Quill Toolbar configuration modules
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  useEffect(() => {
    if (singleProduct) {
      reset({
        title: singleProduct.title,
        sku: singleProduct.sku || "",
        price: singleProduct.price,
        sale_price: singleProduct.sale_price || null,
        stock: singleProduct.stock || 0,
        category_id: singleProduct.category_id || "", // Ensure this perfectly matches individual option .id keys
        description: singleProduct.description || "", // Feeds string explicitly into Quill
        is_featured: !!singleProduct.is_featured,
        is_active: !!singleProduct.is_active,
        images: singleProduct.images || [],
      });
    }
  }, [singleProduct, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Media Files (Images) Upload Block copied from App UX layout philosophy */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Media Files (Images)
        </label>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {/* Virtual File Trigger Box */}
          <label className="w-24 h-24 min-w-[6px] bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all cursor-pointer group">
            <UploadCloud
              size={24}
              className="text-slate-400 group-hover:text-primary transition-colors"
            />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary mt-1">
              Upload
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {/* Render Active Selected Images Preview */}
          {pickedImages.map((img, index) => {
            // 1. If it's already a direct absolute URL string
            let objectUrl = typeof img === "string" ? img : "";

            // 2. If it's a backend image metadata object from your database array
            if (img && typeof img === "object" && "image_path" in img) {
              // Replace BASE_URL with your actual config variable (e.g., process.env.NEXT_PUBLIC_API_URL)
              objectUrl = `${BASE_URL}/uploads/${img.image_path}`;
            }
            // 3. If it's a newly picked local file blob via the browser input upload
            else if (img instanceof Blob || img instanceof File) {
              objectUrl = URL.createObjectURL(img);
            }

            // Fallback to safely prevent rendering crashes if state contains junk data
            if (!objectUrl) return null;

            return (
              <div
                key={index}
                className="w-24 h-24 min-w-[96px] bg-slate-50 rounded-2xl relative overflow-hidden border border-slate-100 group"
              >
                <Image
                  src={objectUrl}
                  alt={`product-preview-${index}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
        {errors.images && (
          <p className="text-red-500 text-xs font-semibold mt-1">
            {errors.images.message}
          </p>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* 2. Form Grid Inputs Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <SelectInput
            name="category_id"
            control={control}
            label="Linked Classification Category"
            placeholder="Choose tags..."
            icon={Layers}
            options={categories}
          />
        </div>
      </div>

      {/* 3. React Quill New Rich Editor Implementation Block */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Product Description Log
        </label>
        <div className="prose-slate max-w-none">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value || ""}
                onChange={field.onChange}
                modules={quillModules}
                placeholder="Enter full specifications and rich text descriptions here..."
                className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 focus-within:border-primary/40 focus-within:bg-white transition-all [&>.ql-toolbar]:bg-slate-100/80 [&>.ql-toolbar]:border-none [&>.ql-container]:border-none [&>.ql-container]:min-h-[160px] [&>.ql-container]:text-sm"
              />
            )}
          />
        </div>
      </div>

      {/* 4. Toggles and Execution Action Controls */}
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
                className="rounded border-slate-300 text-primary focus:ring-primary"
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
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              Expose Visible to Public Marketplace
            </label>
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center"
      >
        {isPending ? "Writing Parameters..." : "Save Product Entity"}
      </button>
    </form>
  );
}
