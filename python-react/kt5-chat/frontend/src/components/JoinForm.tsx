import { useState, type FormEvent } from 'react'

type Props = {
  onJoin: (username: string) => void
}

const MAX_USERNAME_LENGTH = 30

function JoinForm({ onJoin }: Props) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (trimmed) onJoin(trimmed)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        maxLength={MAX_USERNAME_LENGTH}
        placeholder="Ваше имя"
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" disabled={!trimmed}>
        Войти в чат
      </button>
    </form>
  )
}

export default JoinForm
