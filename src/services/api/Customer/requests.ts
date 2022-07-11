import { Customer } from "models/Customer"

export type GetCustomersRequest = {
  page: number
  search?: string
}

export type GetCustomerByIdRequest = {
  id: number
}

export type CreateCustomerRequest = Customer

export type DeleteCustomerRequest = {
  id: number
}

export type EditCustomerRequest = Customer