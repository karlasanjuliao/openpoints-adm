import { AxiosInstance } from 'axios'

export type Service<ServiceMethods> = {
  api: AxiosInstance
} & ServiceMethods

export type ApiServiceMethod<Response, Request = void> = (
  request: Request,
  token?: string
) => Promise<Response>