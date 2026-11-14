import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme'

const MIN_NAME_LENGTH = 2

const styles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 300,
  },
  error: {
    color: colors.error,
    fontSize: 14,
  },
}

function LoginForm() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setError('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < MIN_NAME_LENGTH) {
      setError(`Имя должно быть не короче ${MIN_NAME_LENGTH} символов`)
      return
    }
    login(name)
  }

  return (
    <>
      <h2>Вход</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input value={name} placeholder="Имя" autoFocus onChange={handleChange} />
        {error && <span style={styles.error}>{error}</span>}
        <button type="submit">Войти</button>
      </form>
    </>
  )
}

export default LoginForm
