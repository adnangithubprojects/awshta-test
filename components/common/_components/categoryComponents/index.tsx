import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Folder,
  FileText,
  Layers,
  MoreHorizontal,
  Pencil,
  Image,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import TextInput from "../textInput";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  parent_id: z.string().nullable().optional().or(z.literal("")),
});

type TCategoryForm = z.infer<typeof categorySchema>;

export function CategoryForm({
  defaultValues,
  categoriesList,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<TCategoryForm>;
  categoriesList: any[];
  onSubmit: (data: TCategoryForm) => void;
  isPending: boolean;
}) {
  const { control, handleSubmit, register } = useForm<TCategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: "",
      ...defaultValues,
    },
  });

  // Filter out current category from parent selection list to avoid infinite nesting loop
  const filteredParents =
    categoriesList?.filter(
      (c) => c.id !== defaultValues?.["id" as keyof TCategoryForm],
    ) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextInput
        name="name"
        control={control}
        label="Category Name"
        placeholder="Electronics"
        icon={Folder}
      />

      <TextInput
        name="description"
        control={control}
        label="Description"
        placeholder="Provide category details..."
        icon={FileText}
      />

      <div>
        <label className=" text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Layers size={13} /> Parent Category (Optional)
        </label>
        <select
          {...register("parent_id")}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary/40 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">None (Root Category)</option>
          {filteredParents.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Saving Variant..." : "Save Category"}
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
              <Image size={14} className="text-amber-500" /> Replace Image File
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
