export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type TPaymentMethod =
  | "cod"
  | "card"
  | "bank_transfer"
  | "easypaisa"
  | "jazzcash";
export type TPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface TOrderRow {
  id: string;
  order_number: string;
  status: TOrderStatus;
  payment_method: TPaymentMethod;
  payment_status: TPaymentStatus;
  total: string;
  created_at: string;
}

export interface TAdminOrderFilters {
  page: number;
  per_page: number;
  status?: TOrderStatus | "all";
  payment_status?: string;
  user_id?: string;
}
