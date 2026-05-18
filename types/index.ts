export type TRole = 'SUPER_ADMIN' | 'COMPANY' | 'SALES_MAN'

export type TOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export type TPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'REFUNDED'

export type TPaymentMethod = 'PAY_LATER' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'

export type TLedgerType = 'SEND' | 'CHARGE'

export type TUser = {
  id: string
  name: string
  email: string
  companyName: string
  phone: string | null
  profileImage: string | null
  companyLogo: string | null
  otp: string | null
  password: string
  role: TRole
  isActive: boolean
  createdAt: string
  updatedAt: string

  products?: TProduct[]
  orders?: TOrder[]
  createdShops?: TShop[]
}

export type TShop = {
  id: string
  name: string
  ownerName: string
  phone: string
  email: string | null
  address: string
  city: string
  dueBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string

  createdById: string

  // relations
  createdBy?: TUser
  orders?: TOrder[]
  ledgerEntries?: TLedger[]
}

export type TCategory = {
  id: string
  name: string
  createdAt: string

  // relations
  products?: TProduct[]
}

export type TProduct = {
  id: string
  name: string
  genericName: string | null
  barcode: string | null
  description: string | null
  unit: string
  unitsPerPack: number
  costPrice: number
  salePrice: number
  stock: number
  reorderLevel: number
  manufacturer: string | null
  image: string | null
  batchNo: string | null
  expiryDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string

  categoryId: string
  userId: string

  // relations
  category?: TCategory
  user?: TUser
  orderItems?: TOrderItem[]
}

export type TOrder = {
  id: string
  orderNumber: string
  orderNo: string
  shopId: string
  userId: string
  createdById: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID'
  paymentMethod: 'PAY_LATER' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'
  subtotal?: number
  discountPercent?: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  notes?: string
  items: TOrderItem[]
  shop?: TShop
  createdBy: Pick<TUser, 'name' | 'email'>
  deliveredAt?: string | null
  createdAt: string
  updatedAt: string
}

export type TOrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  price?: number
  unitPrice: number
  totalPrice: number
  discountPercent?: number
  discountAmount?: number
  isReturned: boolean
  returnedQuantity: number
  returnReason: string | null
  product: TProduct
}

export type TLedger = {
  id: string
  amount: number
  paymentMethod: TPaymentMethod
  type: TLedgerType
  description: string | null
  createdAt: string

  shopId: string
  orderId: string | null

  // relations
  shop?: TShop
  order?: TOrder | null
}

export type TMeta = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type TPaginatedResponse<T> = {
  status: string
  data: T[]
  meta: TMeta
}

export type TReturnOrder = {
  orderNo?: string
  orderNumber?: string
  totalAmount: number
  status: TOrderStatus
}

export type TReturnRecord = {
  id: string
  amount: number
  description: string | null
  createdAt: string
  shop?: Pick<TShop, 'name'>
  order?: TReturnOrder
}

export type TTopReturnedProduct = {
  productId: string
  productName: string
  totalReturnedQuantity: number
}

export type TReturnsSummary = {
  totalReturns: number
  totalReturnAmount: number
  period: {
    startDate: string
    endDate: string
  }
}

export type TReturnsResponse = {
  status: string
  data: {
    summary: TReturnsSummary
    returns: {
      data: TReturnRecord[]
      pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
      }
    }
    topReturnedProducts: TTopReturnedProduct[]
  }
}
