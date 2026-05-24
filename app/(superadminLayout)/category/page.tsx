"use client";

import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Folder, FileText, Layers, Upload } from "lucide-react";

import {
  useGetCategories,
  useGetCategoriesTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryImage,
  CategoryQueryKeys,
} from "@/api/category/queries";
import { useToast } from "@/components/common/toast";
import {
  CategoryForm,
  RowActions,
} from "@/components/common/_components/categoryComponents";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";

const CategoriesPage = memo(function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Tab State: 'flat' for direct categorization / 'tree' for nesting layout view
  const [viewTab, setViewTab] = useState<"flat" | "tree">("flat");

  // Modal Structural States
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [imageCategory, setImageCategory] = useState<any | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<any | null>(null);

  // --- Network State Sync ---
  const { data: flatData, isLoading: flatLoading } = useGetCategories();
  const { data: treeData, isLoading: treeLoading } = useGetCategoriesTree();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const imageMutation = useUpdateCategoryImage();

  const refreshCache = () => {
    queryClient.invalidateQueries({ queryKey: [CategoryQueryKeys.CATEGORIES] });
    queryClient.invalidateQueries({
      queryKey: [CategoryQueryKeys.CATEGORIES_TREE],
    });
  };

  // --- Transaction Triggers ---
  const handleCreate = (data: any) => {
    const { parent_id, ...cleanedData } = data;

    // 2. Re-attach parent_id only if it contains a valid, non-empty value
    const finalPayload = {
      ...cleanedData,
      ...(parent_id && parent_id.trim() !== "" ? { parent_id } : {}),
    };

    createMutation.mutate(finalPayload, {
      onSuccess: () => {
        refreshCache();
        setCreateOpen(false);
        toast("New category generated", "success");
      },
      onError: (e: any) =>
        toast(e?.message || "Error executing request", "error"),
    });
  };

  const handleUpdate = (data: any) => {
    const { parent_id, ...cleanedData } = data;

    const finalPayload = {
      ...cleanedData,
      ...(parent_id && parent_id.trim() !== "" ? { parent_id } : {}),
    };

    updateMutation.mutate(
      { id: editCategory.id, data: finalPayload },
      {
        onSuccess: () => {
          refreshCache();
          setEditCategory(null);
          toast("Category layout modified", "success");
        },
        onError: (e: any) => toast(e?.message || "Update rejected", "error"),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(deleteCategory.id, {
      onSuccess: () => {
        refreshCache();
        setDeleteCategory(null);
        toast("Category deleted from records", "info");
      },
      onError: (e: any) => toast(e?.message || "Purge action failed", "error"),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && imageCategory) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      imageMutation.mutate(
        { id: imageCategory.id, formData },
        {
          onSuccess: () => {
            refreshCache();
            setImageCategory(null);
            toast("Binary asset attached successfully", "success");
          },
          onError: (e: any) =>
            toast(e?.message || "Image transfer halted", "error"),
        },
      );
    }
  };

  // --- Data Table Rules Configuration ---
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Category Workspace",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {row.original.image ? (
              <img
                src={row.original.image}
                alt="Icon layout vector"
                className="w-full h-full object-cover"
              />
            ) : (
              <Folder size={16} className="text-primary" />
            )}
          </div>
          <div>
            <p className="font-bold text-primary text-sm">
              {row.original.name}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              /{row.original.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Description Tracking",
      accessorKey: "description",
      cell: ({ row }) => (
        <p className="text-sm font-medium text-slate-500 max-w-xs truncate">
          {row.original.description}
        </p>
      ),
    },
    {
      header: "Hierarchy Anchor",
      accessorKey: "parent_id",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${row.original.parent_id ? "bg-slate-100 text-slate-500" : "bg-primary/10 text-primary"}`}
        >
          {row.original.parent_id ? "Child Node" : "Root Branch"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          category={row.original}
          onEdit={setEditCategory}
          onUpdateImage={setImageCategory}
          onDelete={setDeleteCategory}
        />
      ),
    },
  ];

  const activeLoading = viewTab === "flat" ? flatLoading : treeLoading;
  const activeDataset = viewTab === "flat" ? flatData?.data : treeData?.data;

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Taxonomy & Categories Framework
          </h1>
          <p className="text-slate-400 text-sm">
            Organize system classifications, map tree structures, and process
            asset blobs.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus size={16} /> Create Category Node
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setViewTab("flat")}
          className={`pb-3 font-bold text-sm transition-all cursor-pointer ${viewTab === "flat" ? "border-b-2 border-primary text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          Standard Registry Table
        </button>
        <button
          onClick={() => setViewTab("tree")}
          className={`pb-3 font-bold text-sm transition-all cursor-pointer ${viewTab === "tree" ? "border-b-2 border-primary text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          Nesting Tree Engine Matrix
        </button>
      </div>

      {/* Primary Data Display Workspace */}
      {activeLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <DataTable data={activeDataset || []} columns={columns} />
      )}

      {/* --- Overlay Modals Portal Matrix --- */}

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Generate Category Node"
        description="Append a new structural classification boundary."
      >
        <CategoryForm
          categoriesList={flatData?.data || []}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
        />
      </Modal>

      {/* Edit Data Modal */}
      <Modal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        title="Modify Classification Record"
      >
        {editCategory && (
          <CategoryForm
            defaultValues={editCategory}
            categoriesList={flatData?.data || []}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Image File Attachment Upload Modal */}
      <Modal
        isOpen={!!imageCategory}
        onClose={() => setImageCategory(null)}
        title="Attach Binary Image Asset"
        size="sm"
      >
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-white transition-all relative group">
          <Upload
            size={28}
            className="text-slate-400 group-hover:text-primary transition-colors mb-2"
          />
          <p className="text-xs font-bold text-slate-500">
            Click to stream file to server
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={imageMutation.isPending}
          />
          {imageMutation.isPending && (
            <p className="text-[11px] text-primary animate-pulse mt-2">
              Writing binary stream...
            </p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Deconstruct Structural Branch"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            Confirm execution sequence to drop category node:{" "}
            <span className="font-bold text-secondary">
              {deleteCategory?.name}
            </span>
            ? Any orphan objects below this line may disconnect.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteCategory(null)}
              className="flex-1 py-3 border rounded-xl text-slate-500 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm"
            >
              {deleteMutation.isPending
                ? "Dropping Record..."
                : "Confirm Purge"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default CategoriesPage;
