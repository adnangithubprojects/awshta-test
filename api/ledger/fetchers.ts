import { API_URL } from "@/config/url-config";

export type TShopLedgerSummary = {
  totalMarketDebt: number;
  activeDebtors: number;
  totalShopsInSystem: number;
};

export type TShopStatement = {
  id: string;
  name: string;
  dueBalance: number;
  phone: string;
  address: string;
  lastTransaction: string | null;
};

export type TAllShopsStatementResponse = {
  status: string;
  data: {
    summary: TShopLedgerSummary;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
    };
    shops: TShopStatement[];
  };
};

export type TLedgerEntry = {
  id: string;
  amount: number;
  paymentMethod: string;
  type: "SEND" | "CHARGE";
  description: string | null;
  createdAt: string;
  order: { id: string; orderNo: string } | null;
};

export type TSingleShopStatementResponse = {
  status: string;
  data: {
    shop: {
      id: string;
      name: string;
      ownerName: string;
      phone: string;
      address: string;
      city: string;
      dueBalance: number;
    };
    summary: {
      totalCharged: number;
      totalSent: number;
      netBalance: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
    };
    ledger: TLedgerEntry[];
  };
};

export const asyncGetAllShopsStatement = async (params?: {
  page?: number;
  search?: string;
}): Promise<TAllShopsStatementResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    const response = await API_URL.get(
      `/api/v1/all-shop/statement?${q.toString()}`,
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const asyncGetSingleShopStatement = async (
  shopId: string,
  params?: { page?: number },
): Promise<TSingleShopStatementResponse> => {
  try {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    const response = await API_URL.get(
      `/api/v1/shop/statement/${shopId}?${q.toString()}`,
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
