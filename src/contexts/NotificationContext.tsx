import { createContext, FC, useContext, useState } from 'react'

export enum NotificationTypes {
  SUCCESS = 'success',
  ERROR = 'error'
}

export type Notification = {
  id: string
  message: string
  type?: NotificationTypes
}

type InnerNotification = Notification & {
  isVisible: boolean
}

type NotificationContextType = {
  notification: InnerNotification
  setNotification(notification: InnerNotification): void
}

const initialNotificationData = {
  id: '',
  type: NotificationTypes.SUCCESS,
  message: '',
  isVisible: false
}

const NotificationContext = createContext<NotificationContextType>({
  notification: initialNotificationData,
  setNotification: () => undefined
})

export const NotificationContextProvider: FC = (props) => {
  const [notification, setNotification] = useState<InnerNotification>(initialNotificationData)

  return (
    <NotificationContext.Provider
      value={{ notification, setNotification }}
      {...props}
    />
  )
}

type NotificationContextHookResult = [
  InnerNotification,
  (notification: InnerNotification) => void
]

export function useNotificationContext(): NotificationContextHookResult {
  const { notification, setNotification } = useContext(NotificationContext)

  return [notification, setNotification]
}

export default NotificationContext
