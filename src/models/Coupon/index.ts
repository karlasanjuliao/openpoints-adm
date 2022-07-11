import { Campaign } from "models/Campaign"

export type CouponCode = {
    couponCodeId: number
    couponId: number
    couponCode: string
    qtAvailable: number
}

export type Coupon = {
    id?: number
    automaticCode: boolean
    description: string
    couponCode: string
    discountType: number,
    value: number,
    campaignId: number,
    campaign: Campaign,
    email: string | null,
    minPurchaseValue: number,
    maxPurchaseValue: number,
    quantity: number,
    expirationDate: string,
    air: boolean,
    hotel: boolean,
    car: boolean,
    experience: boolean
    couponCodes?: CouponCode[]
}