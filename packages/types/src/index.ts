// Product types from keys.foreignpay.ru
export type ProductType = 'TOPUP' | 'VOUCHER' | 'ESIM'

export type PaymentMethod = 'sbp' | 'card'

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'expired'

export interface Product {
  product_id: string
  name: string
  group: string
  price: string
  product_type: ProductType
  launcher?: string
  supported_platforms?: string
  activation_region?: string
  description?: string
  image?: string
  genres?: string
}

export interface ProductGroup {
  name: string
  image?: string
  category?: string
  description?: string
}

export interface GroupFormField {
  name: string
  label: string
  type: 'text' | 'number' | 'password' | 'options' | 'hidden'
  required?: boolean
  options?: string[]
  placeholder?: string
}

export interface GroupForm {
  group: string
  topup_fields?: GroupFormField[]
  voucher_fields?: GroupFormField[]
}

export interface Order {
  id: string
  productId: string
  productName: string
  productType: ProductType
  userAmount: number
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  payUrl?: string
  transactionUuid?: string
  result?: OrderResult
  email?: string
  createdAt: string
  updatedAt: string
}

export interface OrderResult {
  type: 'voucher' | 'esim' | 'topup' | 'vcard'
  key?: string
  redeemUrl?: string
  instructions?: string
}

// API response wrappers
export interface ApiSuccess<T> {
  result: T
  error?: never
}

export interface ApiError {
  result?: never
  error: {
    message: string
    code: number
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
