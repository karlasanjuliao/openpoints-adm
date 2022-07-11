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

enum BalanceActionTypes {
  credit,
  debit,
  refund
}

export type BalanceRequest = {
  type: BalanceActionTypes
  userId: number
  value: number
  description: string
}