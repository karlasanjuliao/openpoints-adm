import axios from 'axios'

import { Service, ApiServiceMethod } from 'services/api/types'
import { getAuthHeaders } from 'utils/auth/helpers'

import { Coupon } from 'models/Coupon'
import {
  GetCouponsRequest,
  GetCouponByIdRequest,
  CreateCouponRequest,
  EditCouponRequest,
  DeleteCouponRequest,
  DisableCouponCodeRequest,
  UsedCouponCodeRequest
} from './requests'
import { GetCouponsResponse } from './responses'

type CouponMethods = {
  getCoupons: ApiServiceMethod<GetCouponsResponse, GetCouponsRequest>
  getCouponById: ApiServiceMethod<
    Coupon,
    GetCouponByIdRequest
  >
  createCoupon: ApiServiceMethod<Coupon, CreateCouponRequest>
  editCoupon: ApiServiceMethod<Coupon, EditCouponRequest>
  deleteCoupon: ApiServiceMethod<
    Record<string, unknown>,
    DeleteCouponRequest
  >
  disableCouponCode: ApiServiceMethod<any, DisableCouponCodeRequest>
  usedCouponCode: ApiServiceMethod<any, UsedCouponCodeRequest>
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

const CouponService: Service<CouponMethods> = {
  api: axios.create({ baseURL }),

  getCoupons: async (params, token) => {
    const { page, code } = params
    const response = await CouponService.api.get(
      `/coupon?page=${page - 1}${code ? `&code=${code}` : ''}`,
      { headers: getAuthHeaders(token) }
    )
    return response.data
  },

  getCouponById: async ({ id }, token) => {
    const response = await CouponService.api.get(`/coupon?id=${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  createCoupon: async (request, token) => {
    const response = await CouponService.api.post('/coupon', request, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  editCoupon: async (request, token) => {
    const response = await CouponService.api.put(
      `/coupon`,
      request,
      {
        headers: getAuthHeaders(token)
      }
    )
    return response.data
  },

  deleteCoupon: async ({ id }, token) => {
    const response = await CouponService.api.delete(`/coupon/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  disableCouponCode: async ({ id }, token) => {
    const response = await CouponService.api.post(`/coupon/coupon-code/disable/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  usedCouponCode: async (request, token) => {
    const response = await CouponService.api.post('/coupon/coupon-code/used', request, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },
}

export default CouponService
