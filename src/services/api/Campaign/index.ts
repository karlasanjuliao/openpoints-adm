import axios from 'axios'

import { Service, ApiServiceMethod } from 'services/api/types'
import { getAuthHeaders } from 'utils/auth/helpers'
import { Campaign } from 'models/Campaign'

import {
  GetCampaignsRequest,
  GetAllCampaignsRequest,
  GetCampaignByIdRequest,
  CreateCampaignRequest,
  EditCampaignRequest
} from './requests'

type CampaignMethods = {
  getCampaigns: ApiServiceMethod<
    Campaign[],
    GetCampaignsRequest
  >
  getAllCampaigns:  ApiServiceMethod<
    Campaign[],
    GetAllCampaignsRequest
  >
  getCampaignById: ApiServiceMethod<
    Campaign,
    GetCampaignByIdRequest
  >
  createCampaign: ApiServiceMethod<Campaign, CreateCampaignRequest>
  editCampaign: ApiServiceMethod<Campaign, EditCampaignRequest>
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

const CampaignService: Service<CampaignMethods> = {
  api: axios.create({ baseURL }),

  getCampaigns: async (params, token) => {
    const { customerId, page, search } = params
    const response = await CampaignService.api.get(`/campaign?customerId=${customerId}&page=${page - 1}${search ? `&search=${search}` : ''}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  getAllCampaigns: async (params, token) => {
    const response = await CampaignService.api.get(`/campaign?${params?.customerId ? `customerId=${params?.customerId}&` : ''}${params?.own ? `own=${params?.own}` : ''}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  getCampaignById: async ({ id }, token) => {
    const response = await CampaignService.api.get(`/campaign/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  createCampaign: async (request, token) => {
    const response = await CampaignService.api.post('/campaign', request, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  editCampaign: async (request, token) => {
    const response = await CampaignService.api.put(
      `/campaign`,
      request,
      {
        headers: getAuthHeaders(token)
      }
    )
    return response.data
  },
}
export default CampaignService
