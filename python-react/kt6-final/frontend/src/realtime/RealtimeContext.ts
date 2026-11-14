import { createContext, useContext } from 'react'
import type { Activity, ServerEvent, Task } from '../types'

export type ConnectionStatus = 'connecting' | 'online' | 'reconnecting'

export type Notification = {
  id: number
  text: string
}

export type EventListener = (event: ServerEvent) => void

export type RealtimeContextValue = {
  username: string
  login: (name: string) => void
  logout: () => void
  connection: ConnectionStatus
  tasks: Task[] | null
  tasksError: string
  online: string[]
  activity: Activity[]
  notifications: Notification[]
  dismissNotification: (id: number) => void
  upsertTask: (task: Task) => void
  removeTask: (id: number) => void
  subscribe: (listener: EventListener) => () => void
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }
  return context
}
