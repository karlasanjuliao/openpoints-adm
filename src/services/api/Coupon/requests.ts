import { Coupon } from "models/Coupon"

export type GetCouponsRequest = {
  page: number
  code?: string
}

export type GetCouponByIdRequest = {
  id: string
}

export type CreateCouponRequest = Coupon

export type EditCouponRequest = Coupon

export type DeleteCouponRequest = {
  id: number
}

export type DisableCouponCodeRequest = {
  id: string
}

export type UsedCouponCodeRequest = {
  couponCodeId?: number
  bookingCode?: string
  note: string
}