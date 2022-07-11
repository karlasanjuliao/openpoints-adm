export type Customer = {
    id?: number
    error?: unknown
    socialName: string
    name: string
    cnpj: string
    address: string
    number: string
    zipCode: string
    neighborhood: string
    phone: string
    email: string
    enabled: boolean
    createdAt?: number
  }