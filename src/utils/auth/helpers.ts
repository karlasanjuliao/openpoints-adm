import { parseCookies } from 'nookies'

export function getAuthHeaders(token?: string) {
  const authToken = token || parseCookies()['destino-ferias-admin.token']

  return {
    authorization: authToken
  }
}