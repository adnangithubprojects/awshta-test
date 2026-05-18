import { useQuery } from '@tanstack/react-query'
import {
  asyncGetAllShopsStatement,
  asyncGetSingleShopStatement,
  TAllShopsStatementResponse,
  TSingleShopStatementResponse
} from './fetchers'

export enum LedgerQueryKeys {
  ALL_SHOPS_STATEMENT = 'ALL_SHOPS_STATEMENT',
  SINGLE_SHOP_STATEMENT = 'SINGLE_SHOP_STATEMENT'
}

export const useGetAllShopsStatement = (params?: { page?: number; search?: string }) =>
  useQuery<TAllShopsStatementResponse>({
    queryKey: [LedgerQueryKeys.ALL_SHOPS_STATEMENT, params],
    queryFn: () => asyncGetAllShopsStatement(params)
  })

export const useGetSingleShopStatement = (shopId: string, params?: { page?: number }) =>
  useQuery<TSingleShopStatementResponse>({
    queryKey: [LedgerQueryKeys.SINGLE_SHOP_STATEMENT, shopId, params],
    queryFn: () => asyncGetSingleShopStatement(shopId, params),
    enabled: !!shopId
  })
