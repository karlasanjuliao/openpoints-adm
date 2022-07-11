import axios from 'axios'

import { Service, ApiServiceMethod } from 'services/api/types'
import { getAuthHeaders } from 'utils/auth/helpers'

import { User } from 'models/User'
import {
  GetUserByCustomerIdRequest,
  GetUserByIdRequest,
  CreateUserRequest,
  EditUserRequest,
  DeleteUserRequest
} from './requests'
import { GetUsersResponse, GetProfilesResponse } from './responses'

type UserMethods = {
  getUser: ApiServiceMethod<GetUsersResponse, string>
  getUsersByCustomerId: ApiServiceMethod<
    User[],
    GetUserByCustomerIdRequest
  >
  getUserById: ApiServiceMethod<
    User,
    GetUserByIdRequest
  >
  createUser: ApiServiceMethod<User, CreateUserRequest>
  editUser: ApiServiceMethod<User, EditUserRequest>
  deleteUser: ApiServiceMethod<
    Record<string, unknown>,
    DeleteUserRequest
  >
  getProfiles: ApiServiceMethod<GetProfilesResponse, string>
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

const UserService: Service<UserMethods> = {
  api: axios.create({ baseURL }),

  getUser: async (token) => {
    const response = await UserService.api.get(
      '/user',
      { headers: getAuthHeaders(token) }
    )
    return response.data
  },

  getUsersByCustomerId: async ({ customerId, page, search }, token) => {
    const response = await UserService.api.get(`/user?customerId=${customerId}&page=${page - 1}${search ? `&search=${search}` : ''}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  getUserById: async ({ id }, token) => {
    const response = await UserService.api.get(`/user/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  createUser: async (request, token) => {
    const response = await UserService.api.post('/user', request, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  editUser: async (request, token) => {
    const response = await UserService.api.put(
      `/user`,
      request,
      {
        headers: getAuthHeaders(token)
      }
    )
    return response.data
  },


  deleteUser: async ({ id }, token) => {
    const response = await UserService.api.delete(`/user/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  getProfiles: async (token) => {
    const response = await UserService.api.get(
      '/profile',
      { headers: getAuthHeaders(token) }
    )
    return response.data
  },
}

export default UserService
