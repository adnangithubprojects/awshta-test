"use client";

import { memo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Package, Star, Eye } from "lucide-react";

import {
  useGetProducts,
  useGetProductBySlug,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  ProductQueryKeys,
} from "@/api/products/queries";
import {
  ProductForm,
  RowActions,
} from "@/components/common/_components/productComponents";
import { useGetCategories } from "@/api/category/queries";
import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import { IMAGE_URL } from "@/config/url-config";
import { ReviewQueryKeys, useCreateReview } from "@/api/review/queries";
import { ReviewForm } from "@/components/common/_components/reviewComponents";

const ProductsPage = memo(function ProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Dynamic Search & Paging Sync States ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Custom Filters State Map
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<boolean | null>(
    null,
  );

  // Modal Control Interceptors
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [inspectSlug, setInspectSlug] = useState<string | null>(null);
  const [reviewTargetProduct, setReviewTargetProduct] = useState<any | null>(
    null,
  );

  // Reset page counter whenever filters mutate
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, isFeaturedFilter]);

  // --- Core API Data Streams ---
  const filtersObj = {
    page,
    per_page: 12,
    search: debouncedSearch || null,
    category_id: selectedCategory || null,
    featured: isFeaturedFilter,
  };

  const { data: productData, isLoading } = useGetProducts(filtersObj);
  const { data: catData } = useGetCategories();
  const { data: slugDetails } = useGetProductBySlug(inspectSlug || "");

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const createReviewMutation = useCreateReview();

  const productList = Array.isArray(productData)
    ? productData
    : productData?.items || productData?.data?.items || productData?.data || [];

  const invalidateCacheMatrix = () => {
    queryClient.invalidateQueries({ queryKey: [ProductQueryKeys.PRODUCTS] });
    if (inspectSlug) {
      queryClient.invalidateQueries({
        queryKey: [ProductQueryKeys.PRODUCT_DETAILS, inspectSlug],
      });
    }
  };

  // --- Execution Handlers ---
  const handleCreate = (data: any) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (key === "images" && Array.isArray(value)) {
        value.forEach((imageFile) => {
          formData.append("images", imageFile);
        });
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    createMutation.mutate(formData, {
      onSuccess: () => {
        invalidateCacheMatrix();
        setCreateOpen(false);
        toast("Product added successfully", "success");
      },
      onError: (e: any) =>
        toast(e?.message || "Failed to create record", "error"),
    });
  };

  // const handleUpdate = (data: any) => {
  //   updateMutation.mutate(
  //     { id: editProduct.id, data },
  //     {
  //       onSuccess: () => {
  //         invalidateCacheMatrix();
  //         setEditProduct(null);
  //         toast("Product parameters aligned", "success");
  //       },
  //       onError: (e: any) =>
  //         toast(e?.message || "Mutation tracking failed", "error"),
  //     },
  //   );
  // };
  const handleUpdate = (data: any) => {
    if (!editProduct?.id) return;

    const formData = new FormData();

    // 1. Append standard primary data scalar parameters
    formData.append("title", data.title);
    formData.append("price", String(data.price));
    formData.append("stock", String(data.stock));
    formData.append("category_id", data.category_id || "");
    formData.append("is_featured", data.is_featured ? "true" : "false");
    formData.append("is_active", data.is_active ? "true" : "false");

    if (data.sku) formData.append("sku", data.sku);
    if (data.description) formData.append("description", data.description);

    if (
      data.sale_price !== null &&
      data.sale_price !== undefined &&
      data.sale_price !== ""
    ) {
      formData.append("sale_price", String(data.sale_price));
    }

    // 2. Separate local binary selections from untouched database configurations
    const existingImagesMetadata: any[] = [];

    if (Array.isArray(data.images)) {
      data.images.forEach((img) => {
        if (img instanceof File || img instanceof Blob) {
          // Push new image binary configurations directly into your api key array
          formData.append("images", img);
        } else if (img && typeof img === "object") {
          // Track existing media context fields to maintain sync mapping references
          existingImagesMetadata.push({
            id: img.id,
            image_path: img.image_path,
            is_primary: img.is_primary ?? true,
            sort_order: img.sort_order ?? 0,
          });
        }
      });
    }

    // 3. Stringify the database object arrays into a dedicated parameter slot
    // to avoid flat array mapping errors ("images[0][id]")
    // formData.append("images", JSON.stringify(existingImagesMetadata));

    // 4. Fire mutation execution sequence wrapper
    updateMutation.mutate(
      { id: editProduct.id, data: formData }, // Passing the multipart data instance payload directly
      {
        onSuccess: () => {
          invalidateCacheMatrix();
          setEditProduct(null);
          toast("Product parameters aligned successfully", "success");
        },
        onError: (e: any) =>
          toast(e?.message || "Mutation tracking failed", "error"),
      },
    );
  };
  const handleDelete = () => {
    deleteMutation.mutate(deleteProduct.id, {
      onSuccess: () => {
        invalidateCacheMatrix();
        setDeleteProduct(null);
        toast("Product dropped from inventory catalog", "info");
      },
      onError: (e: any) => toast(e?.message || "Failed to clean item", "error"),
    });
  };

  const handleCreateReview = (data: any) => {
    if (!reviewTargetProduct?.id) return;

    createReviewMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [ReviewQueryKeys.REVIEWS, reviewTargetProduct.id],
        });
        setReviewTargetProduct(null);
        toast("Review processed successfully", "success");
      },
      onError: (e: any) =>
        toast(e?.message || "Error logging response context", "error"),
    });
  };

  // --- Data Table Columns Blueprint Configuration ---
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Product Inventory Unit",
      accessorKey: "title",
      cell: ({ row }) => {
        const images = row.original.images;
        const foundImageObj =
          Array.isArray(images) && images.length > 0
            ? images.find((img: any) => img.is_primary) || images[0]
            : null;

        const primaryImgUrl = foundImageObj?.image_path
          ? `${IMAGE_URL}/uploads/${foundImageObj.image_path}`
          : null;

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative">
              {primaryImgUrl ? (
                <Image
                  src={primaryImgUrl}
                  fill
                  sizes="40px"
                  alt={
                    row?.original?.title ||
                    "Product catalog file description asset"
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={16} className="text-primary" />
              )}
            </div>
            <div>
              <p className="font-bold text-primary text-sm leading-tight">
                {row?.original?.title}
              </p>
              <button
                type="button"
                onClick={() => setInspectSlug(row?.original?.slug)}
                className="text-[11px] text-slate-400 hover:text-primary flex items-center gap-1 font-semibold transition-colors cursor-pointer mt-1"
              >
                <Eye size={11} />
                <span>Inspect slug parameters</span>
              </button>
            </div>
          </div>
        );
      },
    },
    {
      header: "Pricing Index",
      accessorKey: "price",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-black text-primary font-mono">
            PKR{" "}
            {Number(row.original.price).toLocaleString("en-PK", {
              minimumFractionDigits: 2,
            })}
          </p>
          {row.original.sale_price && (
            <p className="text-[10px] text-emerald-600 font-extrabold line-through decoration-rose-400 mt-0.5">
              Promo: PKR{" "}
              {Number(row.original.sale_price).toLocaleString("en-PK")}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Stock Status",
      accessorKey: "stock",
      cell: ({ row }) => {
        const hasStock = row.original.stock > 0;
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide border ${
              hasStock
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
          >
            {hasStock
              ? `${row.original.stock} UNITS AVAILABLE`
              : "OUT OF STOCK"}
          </span>
        );
      },
    },
    {
      header: "Rating Metrics",
      accessorKey: "avg_rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-slate-50 border border-slate-100 w-fit px-2 py-1 rounded-lg">
          <Star size={12} fill="currentColor" />{" "}
          <span>{row.original.avg_rating || "0.0"}</span>
          <span className="text-[10px] text-slate-400 font-semibold">
            ({row.original.review_count || 0})
          </span>
        </div>
      ),
    },
    {
      header: "Visibility Status",
      accessorKey: "is_featured",
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap items-center">
          {row.original.is_featured && (
            <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] px-2 py-0.5 rounded font-black tracking-wider">
              FEATURED
            </span>
          )}
          {row.original.is_active !== false ? (
            <span className="bg-primary/5 text-primary border border-primary/10 text-[9px] px-2 py-0.5 rounded font-black tracking-wider">
              LIVE
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-400 border border-slate-200 text-[9px] px-2 py-0.5 rounded font-black tracking-wider">
              ARCHIVED
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <RowActions
            product={row.original}
            onEdit={setEditProduct}
            onUpdateImage={() => {}}
            onDelete={setDeleteProduct}
            onAddReview={(p) => setReviewTargetProduct(p)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Structural Action Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Enterprise Products Catalog
          </h1>
          <p className="text-slate-400 text-sm">
            Control inventory limits, sync tracking SKUs, adjust target
            valuation indices.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Product Entity</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Management Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-primary/40 shadow-sm transition-all">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by title, internal SKU identifiers..."
            className="w-full bg-transparent outline-none text-sm font-semibold text-secondary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 outline-none focus:border-primary/40 cursor-pointer shadow-sm"
        >
          <option value="">All Categories</option>
          {catData?.data?.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={isFeaturedFilter === null ? "" : String(isFeaturedFilter)}
          onChange={(e) =>
            setIsFeaturedFilter(
              e.target.value === "" ? null : e.target.value === "true",
            )
          }
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 outline-none focus:border-primary/40 cursor-pointer shadow-sm"
        >
          <option value="">Any Promotion Level</option>
          <option value="true">Featured Units Only</option>
          <option value="false">Standard Distribution Only</option>
        </select>
      </div>

      {/* Primary Grid Ledger Workstation */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable data={productList || []} columns={columns} />
          {productData?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: productData.total,
                itemCount: productList.length,
                currentPage: productData.page,
                totalPages: productData.pages,
                itemsPerPage: productData.per_page,
                hasNextPage: productData.page < productData.pages,
                hasPreviousPage: productData.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- Overlay Modals Portal Matrix --- */}

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Product Entry"
      >
        <ProductForm
          categories={catData?.data || []}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
        />
      </Modal>

      {/* Edit Form Modal */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Modify Active Product Properties"
      >
        {editProduct && (
          <ProductForm
            defaultValues={editProduct}
            categories={catData?.data || []}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Slug Metadata Inspection Modal */}
      <Modal
        isOpen={!!inspectSlug}
        onClose={() => setInspectSlug(null)}
        title="Deep Object Diagnostic Tree"
      >
        {slugDetails ? (
          <pre className="p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-auto max-h-72 shadow-inner">
            {JSON.stringify(slugDetails.data, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-400 font-bold tracking-wide animate-pulse text-center py-4">
            Running secure infrastructure diagnostic query scan...
          </p>
        )}
      </Modal>

      {/* Delete Execution Modal */}
      <Modal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Confirm Catalog Eviction Sequence"
        size="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-500 leading-relaxed">
            Are you absolutely sure you want to drop{" "}
            <span className="font-bold text-primary">
              {deleteProduct?.title}
            </span>
            ? This permanently deletes this instance record across checkout
            indexes.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteProduct(null)}
              className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-500 transition-colors cursor-pointer"
            >
              Retain Entry
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {deleteMutation.isPending
                ? "Evicting Instance..."
                : "Confirm Purge"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Compose Review Modal */}
      <Modal
        isOpen={!!reviewTargetProduct}
        onClose={() => setReviewTargetProduct(null)}
        title={`Compose Review: ${reviewTargetProduct?.title || ""}`}
      >
        {reviewTargetProduct && (
          <ReviewForm
            productId={reviewTargetProduct.id}
            onSubmit={handleCreateReview}
            isPending={createReviewMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
});

export default ProductsPage;
