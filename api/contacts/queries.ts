import { useQuery } from "@tanstack/react-query";
import { asyncGetContactMessages } from "./fetchers";
import { QUERY_KEYS } from "../query-keys";

export type TMessageStatus = "new" | "read" | "resolved";

export interface TContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: TMessageStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TContactFilters {
  page: number;
  per_page: number;
  status?: TMessageStatus;
}

// --- 1. Fetcher Operations ---

export const useGetContactMessages = (filters: TContactFilters) =>
  useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, filters],
    queryFn: () => asyncGetContactMessages(filters),
  });
