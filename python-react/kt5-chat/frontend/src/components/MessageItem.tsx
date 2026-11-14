import type { ChatMessage } from '../types'

type Props = {
  message: ChatMessage
  isOwn: boolean
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function MessageItem({ message, isOwn }: Props) {
  const time = <span className="time">{formatTime(message.timestamp)}</span>

  if (message.type === 'error') {
    return <p className="error">{message.text}</p>
  }

  if (message.type === 'system') {
    return (
      <p className="system">
        {message.text} {time}
      </p>
    )
  }

  return (
    <p>
      <b className={isOwn ? 'own' : undefined}>{message.username}:</b> {message.text} {time}
    </p>
  )
}

export default MessageItem
