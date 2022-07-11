import axios from 'axios'

import { Service, ApiServiceMethod } from 'services/api/types'
import { getAuthHeaders } from 'utils/auth/helpers'

import { Customer } from 'models/Customer'
import {
  GetCustomersRequest,
  GetCustomerByIdRequest,
  CreateCustomerRequest,
  EditCustomerRequest,
  DeleteCustomerRequest
} from './requests'
import { GetCustomersResponse } from './responses'

type CustomerMethods = {
  getCustomers: ApiServiceMethod<GetCustomersResponse, GetCustomersRequest>
  getAllCustomers: ApiServiceMethod<Customer[], string>
  getCustomerById: ApiServiceMethod<
  Customer,
  GetCustomerByIdRequest
  >
  createCustomer: ApiServiceMethod<Customer, CreateCustomerRequest>
  deleteCustomer: ApiServiceMethod<
    Record<string, unknown>,
    DeleteCustomerRequest
  >
  editCustomer: ApiServiceMethod<Customer, EditCustomerRequest>
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL

const CustomerService: Service<CustomerMethods> = {
  api: axios.create({ baseURL }),

  getCustomers: async (params, token) => {
    const { page, search } = params
    const response = await CustomerService.api.get(
      `/customer?page=${page - 1}${search ? `&search=${search}` : ''}`,
      { headers: getAuthHeaders(token) }
    )
    return response.data
  },

  getAllCustomers: async (token) => {
    const response = await CustomerService.api.get(
      `/customer`,
      { headers: getAuthHeaders(token) }
    )
    return response.data
  },

  getCustomerById: async ({ id }, token) => {
    const response = await CustomerService.api.get(`/customer/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  createCustomer: async (request, token) => {
    const response = await CustomerService.api.post('/customer', request, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  deleteCustomer: async ({ id }, token) => {
    const response = await CustomerService.api.delete(`/customer/${id}`, {
      headers: getAuthHeaders(token)
    })
    return response.data
  },

  editCustomer: async (request, token) => {
    const response = await CustomerService.api.put(
      `/customer`,
      request,
      {
        headers: getAuthHeaders(token)
      }
    )
    return response.data
  }
}

export default CustomerService
