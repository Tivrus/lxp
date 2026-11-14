import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'

export type ConnectionStatus = 'connecting' | 'online' | 'offline'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000'

export function useChat(username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<string[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/ws/${encodeURIComponent(username)}`)
    socketRef.current = socket

    socket.onopen = () => setStatus('online')
    socket.onclose = () => setStatus('offline')
    socket.onmessage = (event) => {
      const message: ChatMessage = JSON.parse(event.data)
      setMessages((prev) => [...prev, message])
      if (message.users) {
        setUsers(message.users)
      }
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [username])

  const sendMessage = useCallback((text: string) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return false

    socket.send(JSON.stringify({ text }))
    return true
  }, [])

  return { messages, users, status, sendMessage }
}
