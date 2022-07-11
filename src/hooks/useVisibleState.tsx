import React from 'react'

type VisibleStateHookReturn = [boolean, () => void, () => void]

export default function useVisibleState(
  initialState?: boolean
): VisibleStateHookReturn {
  const [visible, setVisible] = React.useState(initialState || false)

  const show = React.useCallback(() => {
    setVisible(true)
  }, [setVisible])

  const hide = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  return [visible, show, hide]
}
