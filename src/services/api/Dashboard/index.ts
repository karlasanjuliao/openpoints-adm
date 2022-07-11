import axios from 'axios'

import { Service, ApiServiceMethod } from 'services/api/types'
import { getAuthHeaders } from 'utils/auth/helpers'
import { ExperiencesInfo } from 'models/Dashboard/Experiences'

import {
  GetExperienceInfoRequest,
} from './requests'

type DashboardMethods = {
  getExperienceInfo:  ApiServiceMethod<
    ExperiencesInfo,
    GetExperienceInfoRequest
  >
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

const DashboardService: Service<DashboardMethods> = {
  api: axios.create({ baseURL }),

  getExperienceInfo: async ({ customerId }, token) => {
    const response = await DashboardService.api.get(`/dashboard/experiences?customerId=${customerId}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

}
export default DashboardService
