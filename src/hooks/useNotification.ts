import { useNotificationContext, Notification } from 'contexts/NotificationContext'
import React from 'react'

export default function useNotification() {
  const [notification, setNotification] = useNotificationContext()

  const notify = React.useCallback(
    (notification: Notification) => {
      setNotification({
        ...notification,
        isVisible: true
      })
    },
    [setNotification, notification]
  )

  return { notification, notify }
}
