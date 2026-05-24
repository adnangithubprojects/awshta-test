import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Notebook,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import TextInput from "../textInput";

const orderSchema = z.object({
  product_id: z.string().min(1, "Select a product for this order"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  payment_method: z.enum(["cod", "card", "wallet"]),
  label: z.enum(["home", "office", "other"]),
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  phone: z.string().min(7, "Phone number is required"),
  notes: z.string().optional().nullable(),
});

type TOrderForm = z.infer<typeof orderSchema>;

type TOrderFormProduct = {
  id: string;
  title?: string;
  name?: string;
  stock?: number;
};

export function OrderForm({
  products,
  defaultProductId,
  onSubmit,
  isPending,
}: {
  products: TOrderFormProduct[];
  defaultProductId?: string;
  onSubmit: (data: {
    items: Array<{ product_id: string; quantity: number }>;
    payment_method: "cod" | "card" | "wallet";
    shipping_address: {
      label: "home" | "office" | "other";
      street: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
      phone: string;
    };
    notes?: string | null;
  }) => void;
  isPending: boolean;
}) {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TOrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      product_id: defaultProductId || "",
      quantity: 1,
      payment_method: "cod",
      label: "home",
      street: "",
      city: "",
      state: "",
      country: "Pakistan",
      postal_code: "",
      phone: "",
      notes: "",
    },
  });

  const submitOrder = (data: TOrderForm) => {
    onSubmit({
      items: [{ product_id: data.product_id, quantity: data.quantity }],
      payment_method: data.payment_method,
      shipping_address: {
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
        phone: data.phone,
      },
      notes: data.notes || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submitOrder)}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
    >
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Package size={13} /> Product
        </label>
        <select
          {...register("product_id")}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary/40 transition-all cursor-pointer disabled:bg-slate-50"
          disabled={isPending}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title || product.name || product.id}
              {typeof product.stock === "number"
                ? ` (${product.stock} in stock)`
                : ""}
            </option>
          ))}
        </select>
        {errors.product_id && (
          <span className="mt-1 text-xs font-medium text-red-500">
            {errors.product_id.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          name="quantity"
          control={control}
          label="Quantity"
          type="number"
          placeholder="1"
          icon={Package}
          disabled={isPending}
        />

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CreditCard size={13} /> Payment Method
          </label>
          <select
            {...register("payment_method")}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary/40 transition-all cursor-pointer"
            disabled={isPending}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin size={13} /> Address Label
          </label>
          <select
            {...register("label")}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-primary outline-none focus:border-primary/40 transition-all cursor-pointer"
            disabled={isPending}
          >
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>
        <TextInput
          name="phone"
          control={control}
          label="Phone"
          placeholder="+92..."
          icon={Phone}
          disabled={isPending}
        />
      </div>

      <TextInput
        name="street"
        control={control}
        label="Street Address"
        placeholder="House, street, area"
        icon={MapPin}
        disabled={isPending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          name="city"
          control={control}
          label="City"
          placeholder="Lahore"
          disabled={isPending}
        />
        <TextInput
          name="state"
          control={control}
          label="State / Province"
          placeholder="Punjab"
          disabled={isPending}
        />
        <TextInput
          name="country"
          control={control}
          label="Country"
          placeholder="Pakistan"
          disabled={isPending}
        />
        <TextInput
          name="postal_code"
          control={control}
          label="Postal Code"
          placeholder="54000"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Notebook size={13} /> Notes
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          disabled={isPending}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-primary outline-none focus:border-primary/40 transition-all resize-none disabled:bg-slate-50"
          placeholder="Optional delivery notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Creating Order..." : "Create Order"}
      </button>
    </form>
  );
}

// Maps semantic state badges safely
export function StatusBadge({
  value,
}: {
  type: "order" | "payment";
  value: string;
}) {
  const norm = value?.toLowerCase();

  const config: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    processing: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    shipped: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
    delivered: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
    },
    completed: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
    },
    cancelled: { bg: "bg-rose-50 border-rose-100", text: "text-rose-600" },
    failed: { bg: "bg-red-50 border-red-100", text: "text-red-600" },
    paid: { bg: "bg-teal-50 border-teal-200", text: "text-teal-700" },
  };

  const match = config[norm] || {
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide border uppercase ${match.bg} ${match.text}`}
    >
      {value}
    </span>
  );
}

// Order Status Pipeline Progression Timeline Visualizer
export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const stages = ["pending", "processing", "shipped", "delivered"];
  const currentIdx = stages.indexOf(currentStatus?.toLowerCase());

  const getIcon = (idx: number) => {
    if (currentStatus?.toLowerCase() === "cancelled")
      return <XCircle size={14} className="text-rose-500" />;
    if (idx < currentIdx)
      return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (idx === currentIdx)
      return <Clock size={14} className="text-amber-500 animate-pulse" />;
    return <Truck size={14} className="text-slate-300" />;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto py-4">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center relative">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white transition-all z-10 ${i <= currentIdx ? "border-secondary shadow-sm" : "border-slate-100"}`}
            >
              {getIcon(i)}
            </div>
            <span
              className={`text-[10px] font-bold uppercase mt-1.5 absolute -bottom-5 whitespace-nowrap tracking-tight ${i <= currentIdx ? "text-secondary" : "text-slate-400"}`}
            >
              {stage}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 rounded transition-all ${i < currentIdx ? "bg-emerald-400" : "bg-slate-100"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
