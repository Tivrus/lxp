import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getActivity, getErrorMessage, getTasks, setCurrentUser, WS_URL } from '../api'
import type { Activity, ServerEvent, Task } from '../types'
import { upsertById } from '../utils/upsert'
import {
  RealtimeContext,
  type ConnectionStatus,
  type EventListener,
  type Notification,
} from './RealtimeContext'

const USERNAME_KEY = 'username'
const RECONNECT_DELAY_MS = 3000
const NOTIFICATION_TTL_MS = 6000
const ACTIVITY_LIMIT = 50

const initialUsername = sessionStorage.getItem(USERNAME_KEY) ?? ''
setCurrentUser(initialUsername || null)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState(initialUsername)
  const [connection, setConnection] = useState<ConnectionStatus>('connecting')
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [tasksError, setTasksError] = useState('')
  const [online, setOnline] = useState<string[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const listenersRef = useRef(new Set<EventListener>())
  const notificationIdRef = useRef(0)

  const upsertTask = useCallback((task: Task) => {
    setTasks((prev) => (prev ? upsertById(prev, task) : prev))
  }, [])

  const removeTask = useCallback((id: number) => {
    setTasks((prev) => prev?.filter((task) => task.id !== id) ?? prev)
  }, [])

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const pushNotification = useCallback(
    (text: string) => {
      const id = ++notificationIdRef.current
      setNotifications((prev) => [...prev, { id, text }])
      setTimeout(() => dismissNotification(id), NOTIFICATION_TTL_MS)
    },
    [dismissNotification],
  )

  const subscribe = useCallback((listener: EventListener) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const handleEvent = useCallback(
    (event: ServerEvent) => {
      switch (event.type) {
        case 'presence':
          setOnline(event.users)
          break
        case 'task_created':
        case 'task_updated':
          upsertTask(event.task)
          break
        case 'task_deleted':
          removeTask(event.task_id)
          break
        case 'activity':
          setActivity((prev) =>
            prev.some((item) => item.id === event.activity.id)
              ? prev
              : [event.activity, ...prev].slice(0, ACTIVITY_LIMIT),
          )
          break
        case 'notification':
          pushNotification(event.text)
          break
      }
      listenersRef.current.forEach((listener) => listener(event))
    },
    [upsertTask, removeTask, pushNotification],
  )

  useEffect(() => {
    if (!username) return

    let isDisposed = false
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined

    getTasks()
      .then((data) => {
        setTasks(data)
        setTasksError('')
      })
      .catch((error) => setTasksError(getErrorMessage(error)))

    getActivity()
      .then(setActivity)
      .catch(() => setActivity([]))

    const socket = new WebSocket(`${WS_URL}/ws/${encodeURIComponent(username)}`)

    socket.onopen = () => setConnection('online')
    socket.onmessage = (message) => handleEvent(JSON.parse(message.data))
    socket.onclose = () => {
      if (isDisposed) return
      setConnection('reconnecting')
      reconnectTimer = setTimeout(() => setReconnectAttempt((attempt) => attempt + 1), RECONNECT_DELAY_MS)
    }

    return () => {
      isDisposed = true
      clearTimeout(reconnectTimer)
      socket.close()
    }
  }, [username, reconnectAttempt, handleEvent])

  const login = useCallback((name: string) => {
    sessionStorage.setItem(USERNAME_KEY, name)
    setCurrentUser(name)
    setConnection('connecting')
    setUsername(name)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(USERNAME_KEY)
    setCurrentUser(null)
    setUsername('')
    setTasks(null)
    setTasksError('')
    setOnline([])
    setActivity([])
    setNotifications([])
  }, [])

  const value = useMemo(
    () => ({
      username,
      login,
      logout,
      connection,
      tasks,
      tasksError,
      online,
      activity,
      notifications,
      dismissNotification,
      upsertTask,
      removeTask,
      subscribe,
    }),
    [
      username,
      login,
      logout,
      connection,
      tasks,
      tasksError,
      online,
      activity,
      notifications,
      dismissNotification,
      upsertTask,
      removeTask,
      subscribe,
    ],
  )

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
