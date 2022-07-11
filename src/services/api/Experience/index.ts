import axios from 'axios'

import { Service, ApiServiceMethod } from 'services/api/types'
import { getAuthHeaders } from 'utils/auth/helpers'
import { Experience, ExperienceType } from 'models/Experience'

import {
  GetExperiencesRequest,
  CreateExperienceRequest,
  EditExperienceRequest,
  DeleteExperienceRequest,
  GetExperienceByIdRequest,
  GetExperienceTypesRequest,
  DeleteExperienceDateRequest
} from './requests'
import { GetExperiencesResponse, GetVoucherTypesResponse } from './responses'

type ExperienceMethods = {
  getExperiences: ApiServiceMethod<GetExperiencesResponse, GetExperiencesRequest>
  getExperienceById: ApiServiceMethod<
    Experience,
    GetExperienceByIdRequest
  >
  createExperience: ApiServiceMethod<Experience, CreateExperienceRequest>
  editExperience: ApiServiceMethod<Experience, EditExperienceRequest>
  deleteExperience: ApiServiceMethod<Record<string, unknown>, DeleteExperienceRequest>
  getExperienceTypes: ApiServiceMethod<
    ExperienceType[],
    GetExperienceTypesRequest
  >
  getVoucherTypes: ApiServiceMethod<GetVoucherTypesResponse, string>
  deleteExperienceDate: ApiServiceMethod<any, DeleteExperienceDateRequest>
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

const ExperienceService: Service<ExperienceMethods> = {
  api: axios.create({ baseURL }),

  getExperiences: async (params, token) => {
    const { page, search } = params
    const response = await ExperienceService.api.get(
      `/experience?page=${page - 1}${search ? `&search=${search}` : ''}`,
      { headers: getAuthHeaders(token) }
    )
    return response.data
  },

  getExperienceById: async ({ id }, token) => {
    const response = await ExperienceService.api.get(`/experience/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  createExperience: async (request, token) => {
    const response = await ExperienceService.api.post('/experience', request, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  editExperience: async (request, token) => {
    const response = await ExperienceService.api.put(
      `/experience`,
      request,
      {
        headers: getAuthHeaders(token)
      }
    )
    return response.data
  },

  deleteExperience: async ({ id }, token) => {
    const response = await ExperienceService.api.delete(`/experience/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  getExperienceTypes: async ({ customerId }, token) => {
    const response = await ExperienceService.api.get(`/experience/type?customerId=${customerId}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  getVoucherTypes: async (token) => {
    const response = await ExperienceService.api.get(`/experience/voucher-type`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  deleteExperienceDate: async (experienceDateId, token) => {
      const response = await ExperienceService.api.delete(`/experience/date/${experienceDateId}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },
}
export default ExperienceService
