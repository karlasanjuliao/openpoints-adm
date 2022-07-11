import { User } from "models/User"

export type GetUserByCustomerIdRequest = {
  customerId: string
  page: number
  search?: string
}

export type GetUserByIdRequest = {
  id: string
}

export type CreateUserRequest = User

export type EditUserRequest = User

export type DeleteUserRequest = {
  id: number
}