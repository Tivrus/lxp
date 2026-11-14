import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useChat, type ConnectionStatus } from '../hooks/useChat'
import MessageItem from './MessageItem'

type Props = {
  username: string
  onLeave: () => void
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connecting: 'подключение...',
  online: 'в сети',
  offline: 'отключено',
}

function Chat({ username, onLeave }: Props) {
  const { messages, users, status, sendMessage } = useChat(username)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const isOnline = status === 'online'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed && sendMessage(trimmed)) {
      setText('')
    }
  }

  return (
    <>
      <div className="top">
        <span>
          Вы: {username} ({STATUS_LABELS[status]})
        </span>
        <button onClick={onLeave}>Выйти</button>
      </div>

      <div className="layout">
        <div className="messages">
          {messages.map((message, index) => (
            <MessageItem key={index} message={message} isOwn={message.username === username} />
          ))}
          <div ref={bottomRef} />
        </div>

        <aside className="users">
          <b>В чате ({users.length})</b>
          {users.map((user) => (
            <div key={user}>{user}</div>
          ))}
        </aside>
      </div>

      <form className="send" onSubmit={handleSubmit}>
        <input
          value={text}
          placeholder="Сообщение"
          disabled={!isOnline}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!isOnline || !text.trim()}>
          Отправить
        </button>
      </form>
    </>
  )
}

export default Chat
