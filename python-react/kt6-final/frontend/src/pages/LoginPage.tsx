import { useState, type FormEvent } from 'react'
import { useRealtime } from '../realtime/RealtimeContext'

const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 30

function LoginPage() {
  const { login } = useRealtime()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < MIN_NAME_LENGTH) {
      setError(`Имя должно быть не короче ${MIN_NAME_LENGTH} символов`)
      return
    }
    login(trimmed)
  }

  return (
    <div className="login">
      <h2>Доска задач</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Ваше имя"
          autoFocus
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
        />
        {error && <span className="error">{error}</span>}
        <button type="submit">Войти</button>
      </form>
      <p className="muted">Откройте несколько вкладок под разными именами, чтобы проверить совместную работу.</p>
    </div>
  )
}

export default LoginPage
