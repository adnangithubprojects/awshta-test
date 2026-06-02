"use client";
import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Plus,
  ShoppingBag,
  CreditCard,
  MapPin,
  Notebook,
  Layers,
} from "lucide-react";

import {
  useGetOrders,
  useGetOrderDetails,
  useCreateOrder,
  useUpdateOrderStatus,
  OrderQueryKeys,
} from "@/api/orders/queries";
import type { TCreateOrderInput } from "@/api/orders/fetchers";
import { useGetProducts } from "@/api/products/queries";

import { useToast } from "@/components/common/toast";
import {
  OrderForm,
  OrderTimeline,
  StatusBadge,
} from "@/components/common/_components/ordersComponents";
import Modal from "@/components/common/modal";
import { DataTable } from "@/components/common/table";
import Pagination from "@/components/common/paginations";

const OrdersPage = memo(function OrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Grid Pagination Filter States ---
  const [page, setPage] = useState(1);

  // Overlay Modal Interceptors
  const [createOpen, setCreateOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

  // --- Dynamic Sub-Streams ---
  const { data, isLoading } = useGetOrders({ page, per_page: 10 });
  const { data: productData } = useGetProducts({ page: 1, per_page: 100 });
  const { data: detailsData, isLoading: detailsLoading } = useGetOrderDetails(
    inspectOrderId || "",
  );

  const createMutation = useCreateOrder();
  const statusMutation = useUpdateOrderStatus();
  const orderData = data?.data || data;
  const productOptions = Array.isArray(productData)
    ? productData
    : productData?.items || productData?.data?.items || productData?.data || [];

  const refreshCacheGrid = () => {
    queryClient.invalidateQueries({ queryKey: [OrderQueryKeys.ORDERS] });
    if (inspectOrderId)
      queryClient.invalidateQueries({
        queryKey: [OrderQueryKeys.ORDER_DETAILS, inspectOrderId],
      });
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return fallback;
  };

  // --- Processing Transactions Pipelines ---
  const handleCreate = (payload: TCreateOrderInput) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        refreshCacheGrid();
        setCreateOpen(false);
        toast("Order created successfully", "success");
      },
      onError: (e) =>
        toast(getErrorMessage(e, "Failed to create order"), "error"),
    });
  };

  const handleStatusChange = (orderId: string, nextStatus: string) => {
    statusMutation.mutate(
      { id: orderId, status: nextStatus },
      {
        onSuccess: () => {
          refreshCacheGrid();
          setActiveOrderId(null);
          toast("Order routing pipeline shifted", "success");
        },
        onError: (e: any) =>
          toast(e?.message || "State modification tracking rejected", "error"),
      },
    );
  };

  // --- Data Table Columns Blueprint Configuration ---
  const columns: ColumnDef<any, any>[] = [
    {
      header: "Order Log Token",
      accessorKey: "order_number",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-primary shrink-0">
            <ShoppingBag size={15} />
          </div>
          <div>
            <p className="font-black text-primary text-sm tracking-tight">
              {row.original.order_number ||
                `ORD-#${row.original.id.slice(0, 8)}`}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {new Date(row.original.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Settlement Gross",
      accessorKey: "total",
      cell: ({ row }) => (
        <span className="font-extrabold text-primary text-sm">
          PKR {Number(row.original.total).toLocaleString("en-PK")}
        </span>
      ),
    },
    {
      header: "Method Flag",
      accessorKey: "payment_method",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase">
          <CreditCard size={12} className="text-slate-400" />
          {row.original.payment_method}
        </div>
      ),
    },
    {
      header: "Order State",
      accessorKey: "status",
      cell: ({ row }) => (
        <StatusBadge type="order" value={row.original.status} />
      ),
    },
    {
      header: "Payment Status",
      accessorKey: "payment_status",
      cell: ({ row }) => (
        <StatusBadge
          type="payment"
          value={row.original.payment_status || "pending"}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setInspectOrderId(row.original.id)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setActiveOrderId(row.original.id)}
            className="px-3 py-1.5 border border-slate-200 hover:border-secondary text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Route Pipeline
          </button>
        </div>
      ),
    },
  ];

  // Extract targeted object context if matching state
  const targetDetails = detailsData?.data || detailsData;

  return (
    <div className="space-y-6">
      {/* Module Title Header Layout */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Fulfillment Order Console
          </h1>
          <p className="text-slate-400 text-sm">
            Track real-time checkouts, route freight states, and review ledger
            updates.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus size={16} /> Create Order
        </button>
      </div>

      {/* Primary Ledgers Grid Matrix */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable data={orderData?.items || []} columns={columns} />
          {orderData?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: orderData.total,
                itemCount: orderData.items?.length || 0,
                currentPage: orderData.page,
                totalPages: orderData.pages,
                itemsPerPage: orderData.per_page,
                hasNextPage: orderData.page < orderData.pages,
                hasPreviousPage: orderData.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- Overlay Modals Portal Stack --- */}

      {/* Create Order Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Fulfillment Order"
        size="lg"
      >
        <OrderForm
          products={productOptions}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
        />
      </Modal>

      {/* Pipeline Router Selection Modal */}
      <Modal
        isOpen={!!activeOrderId}
        onClose={() => setActiveOrderId(null)}
        title="Shift Order Route Lifecycle"
        size="sm"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-400">
            Select target state mutation step to apply to this fulfillment
            tracking instance:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
              "refunded",
            ].map((st) => (
              <button
                key={st}
                disabled={statusMutation.isPending}
                onClick={() =>
                  activeOrderId && handleStatusChange(activeOrderId, st)
                }
                className="w-full text-left px-4 py-3 border border-slate-100 hover:border-primary/30 hover:bg-slate-50 rounded-xl font-bold text-xs text-primary capitalize transition-all cursor-pointer disabled:opacity-50"
              >
                Set Stage to: <span className="text-accent">{st}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Inspect Deep Metadata Order Details Drawer Modal */}
      <Modal
        isOpen={!!inspectOrderId}
        onClose={() => setInspectOrderId(null)}
        title="Fulfillment Diagnostics Registry"
        size="lg"
      >
        {detailsLoading ? (
          <div className="space-y-4 py-8 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto" />
            <div className="h-12 bg-slate-50 rounded-2xl" />
            <div className="h-24 bg-slate-50 rounded-2xl" />
          </div>
        ) : targetDetails ? (
          <div className="space-y-6 py-2">
            {/* Progression Bar Hook */}
            <div className="pb-4 border-b border-slate-100">
              <OrderTimeline currentStatus={targetDetails.status} />
            </div>

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping Blocks */}
              <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl space-y-2.5">
                <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> Logistics
                  Consignee Destination
                </h3>
                {targetDetails.shipping_address ? (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-primary uppercase text-[10px] bg-slate-200/60 inline-block px-1.5 py-0.5 rounded">
                      Label: {targetDetails.shipping_address.label || "Home"}
                    </p>
                    <p className="mt-1">
                      {targetDetails.shipping_address.street}
                    </p>
                    <p>
                      {targetDetails.shipping_address.city},{" "}
                      {targetDetails.shipping_address.state}
                    </p>
                    <p className="font-semibold">
                      {targetDetails.shipping_address.country} (
                      {targetDetails.shipping_address.postal_code})
                    </p>
                    <p className="font-bold text-primary pt-1">
                      Tel: {targetDetails.shipping_address.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No static shipping logs attached.
                  </p>
                )}
              </div>

              {/* Internal Memos */}
              <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl space-y-2.5">
                <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Notebook size={13} className="text-primary" /> Delivery Memos
                  & Instructions
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl min-h-[70px]">
                  {targetDetails.notes ||
                    "No operational delivery constraints or memos logged by client buyer profile."}
                </p>
              </div>
            </div>

            {/* Structured Line Items Collection List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-primary" /> Order Content
                Manifest Lines
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="p-3">Reference Token / ID</th>
                      <th className="p-3 text-center">Quantity Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-secondary">
                    {targetDetails.items?.map((item: any, index: number) => (
                      <tr key={item.product_id || index}>
                        <td className="p-3 font-mono text-slate-500">
                          {item.product_id}
                        </td>
                        <td className="p-3 text-center font-bold">
                          {item.quantity}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catch-all Diagnostic Code JSON View */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">
                Diagnostic Raw Response Matrix Block
              </p>
              <pre className="p-3 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-xl overflow-auto max-h-40">
                {JSON.stringify(targetDetails, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            Failed to query corresponding payload tree.
          </p>
        )}
      </Modal>
    </div>
  );
});

export default OrdersPage;
