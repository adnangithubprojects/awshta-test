"use client";
import { memo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  Package,
  Star,
  Eye,
  ShoppingBag,
} from "lucide-react";
// import useDebounce from "@renderer/hooks/useDebounce";

import {
  useGetProducts,
  useGetProductBySlug,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  ProductQueryKeys,
} from "@/api/products/queries";
import { ProductForm } from "@/components/common/_components/productComponents";
import { RowActions } from "@/components/common/_components/categoryComponents";
import { useGetCategories } from "@/api/category/queries";
import { OrderQueryKeys, useCreateOrder } from "@/api/orders/queries";
import type { TCreateOrderInput } from "@/api/orders/fetchers";
import { OrderForm } from "@/components/common/_components/ordersComponents";
import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import { IMAGE_URL } from "@/config/url-config";

type TProductRow = {
  id: string;
  title?: string;
  name?: string;
  stock?: number;
};

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
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<TProductRow | null>(null);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null);
  const [inspectSlug, setInspectSlug] = useState<string | null>(null);

  // Reset page counter whenever filters mutate
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, isFeaturedFilter]);

  // --- Core API Data Streams ---
  const filtersObj = {
    page,
    per_page: 10,
    search: debouncedSearch || null,
    category_id: selectedCategory || null,
    featured: isFeaturedFilter,
  };

  const { data: productData, isLoading } = useGetProducts(filtersObj);
  const { data: catData } = useGetCategories();
  const { data: slugDetails } = useGetProductBySlug(inspectSlug || "");

  const createMutation = useCreateProduct();
  const createOrderMutation = useCreateOrder();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const productList = Array.isArray(productData)
    ? productData
    : productData?.items || productData?.data?.items || productData?.data || [];

  const invalidateCacheMatrix = () => {
    queryClient.invalidateQueries({ queryKey: [ProductQueryKeys.PRODUCTS] });
    if (inspectSlug)
      queryClient.invalidateQueries({
        queryKey: [ProductQueryKeys.PRODUCT_DETAILS, inspectSlug],
      });
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return fallback;
  };

  // --- Execution Handlers ---
  const openOrderModal = (product?: TProductRow) => {
    setOrderProduct(product || null);
    setOrderOpen(true);
  };

  const handleCreateOrder = (payload: TCreateOrderInput) => {
    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [OrderQueryKeys.ORDERS] });
        setOrderOpen(false);
        setOrderProduct(null);
        toast("Order created successfully", "success");
      },
      onError: (e) =>
        toast(getErrorMessage(e, "Failed to create order"), "error"),
    });
  };

  const handleCreate = (data: any) => {
    const formData = new FormData();

    // 2. Loop through your data object keys and append them dynamically
    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (key === "images" && Array.isArray(value)) {
        // Handle the images array loop explicitly
        value.forEach((imageFile) => {
          // Append each file to the 'images' key bucket
          formData.append("images", imageFile);
        });
      } else if (typeof value === "boolean") {
        // Explicitly convert true/false values to strings so form data preserves them
        formData.append(key, value ? "true" : "false");
      } else if (value !== null && value !== undefined) {
        // For titles, prices, stock, etc.
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

  const handleUpdate = (data: any) => {
    updateMutation.mutate(
      { id: editProduct.id, data },
      {
        onSuccess: () => {
          invalidateCacheMatrix();
          setEditProduct(null);
          toast("Product parameters aligned", "success");
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

  // --- Data Table Columns Blueprint Configuration ---
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Product Inventory Unit",
      accessorKey: "title",
      cell: ({ row }) => {
        // const primaryImg =
        //   row.original.images?.find((img: any) => img.is_primary)?.image_path ||
        //   row.original.images?.[0]?.image_path;
        const images = row.original.images;

        const foundImageObj =
          Array.isArray(images) && images.length > 0
            ? images.find((img: any) => img.is_primary) || images
            : null;

        // 3. Prepend the base URL to the image path if found
        const primaryImgUrl = foundImageObj?.image_path
          ? `${IMAGE_URL}${foundImageObj.image_path}`
          : null;
        console.log(primaryImgUrl, "foundImageObj");

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              {primaryImgUrl ? (
                <Image
                  src={primaryImgUrl}
                  width={40}
                  height={40}
                  alt={row?.original?.title || "Product fallback image layout"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={16} className="text-primary" />
              )}
            </div>
            <div>
              <p className="font-bold text-primary text-sm">
                {row?.original?.title}
              </p>
              <button
                onClick={() => setInspectSlug(row?.original?.slug)}
                className="text-[11px] text-primary flex items-center gap-1 font-bold hover:underline cursor-pointer mt-0.5"
              >
                <Eye size={10} /> Inspect slug path
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
          <p className="text-sm font-bold text-primary">
            PKR {Number(row.original.price).toLocaleString("en-PK")}
          </p>
          {row.original.sale_price && (
            <p className="text-[10px] text-emerald-500 font-extrabold line-through decoration-red-400">
              On Sale: PKR{" "}
              {Number(row.original.sale_price).toLocaleString("en-PK")}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Stock Status",
      accessorKey: "stock",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black ${row.original.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
        >
          {row.original.stock > 0
            ? `${row.original.stock} UNITS`
            : "OUT OF STOCK"}
        </span>
      ),
    },
    {
      header: "Rating Metrics",
      accessorKey: "avg_rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
          <Star size={12} fill="currentColor" />{" "}
          {row.original.avg_rating || "0.0"}{" "}
          <span className="text-[10px] text-slate-400 font-medium">
            ({row.original.review_count || 0})
          </span>
        </div>
      ),
    },
    {
      header: "Visibility Status",
      accessorKey: "is_featured",
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          {row.original.is_featured && (
            <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-black">
              FEATURED
            </span>
          )}
          {row.original.is_active !== false && (
            <span className="bg-primary/5 text-primary text-[9px] px-1.5 py-0.5 rounded font-black">
              LIVE
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openOrderModal(row.original)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors cursor-pointer"
            title="Create order"
          >
            <ShoppingBag size={16} />
          </button>
          <RowActions
            category={row.original}
            onEdit={setEditProduct}
            onUpdateImage={() => {}}
            onDelete={setDeleteProduct}
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
            onClick={() => openOrderModal()}
            className="flex items-center gap-2 border border-slate-200 bg-white text-secondary px-5 py-3 rounded-2xl font-bold text-sm hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
          >
            <ShoppingBag size={16} /> Create Order
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Product Entity
          </button>
        </div>
      </div>

      {/* Advanced Filter Management Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-primary/40">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by title, internal parameters..."
            className="w-full bg-transparent outline-none text-sm text-secondary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 outline-none focus:border-primary/40 cursor-pointer"
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
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 outline-none focus:border-primary/40 cursor-pointer"
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

      {/* Create Order Modal */}
      <Modal
        isOpen={orderOpen}
        onClose={() => {
          setOrderOpen(false);
          setOrderProduct(null);
        }}
        title="Create Order"
        size="lg"
      >
        <OrderForm
          products={productList}
          defaultProductId={orderProduct?.id}
          onSubmit={handleCreateOrder}
          isPending={createOrderMutation.isPending}
        />
      </Modal>

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
          <pre className="p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-auto max-h-72">
            {JSON.stringify(slugDetails.data, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-slate-400 animate-pulse">
            Running data validation scan...
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
        <div className="space-y-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            Are you absolutely sure you want to drop{" "}
            <span className="font-bold text-primary">
              {deleteProduct?.title}
            </span>
            ? This permanently flags down this instance code across checkout
            indexes.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteProduct(null)}
              className="flex-1 py-3 border rounded-xl font-bold text-sm text-slate-400"
            >
              Retain Entry
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm"
            >
              {deleteMutation.isPending
                ? "Evicting Instance..."
                : "Confirm Purge"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default ProductsPage;
