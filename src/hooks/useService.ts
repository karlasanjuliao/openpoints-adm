import React from 'react'
import { ApiServiceMethod } from 'services/api/types'
import useVisibleState from './useVisibleState'

type ServiceHookReturn<Response, Request = void> = [
  (request: Request) => Promise<Response>,
  boolean
]

export default function useService<Response, Request = void>(
  method: ApiServiceMethod<Response, Request>
): ServiceHookReturn<Response, Request> {
  const [loading, show, hide] = useVisibleState()

  const memoizedMethod = React.useCallback(
    async (request: Request) => {
      try {
        show()
        const response = await method(request)
        return response
      } finally {
        hide()
      }
    },
    [show, method, hide]
  )

  return [memoizedMethod, loading]
}
