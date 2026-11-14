import { useState, type CSSProperties, type FormEvent } from 'react'
import { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import { useAuthStore } from '../store/authStore'
import { colors } from '../theme'

type FieldErrors = {
  username?: string
  password?: string
}

const styles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 300,
  },
  fieldError: {
    color: colors.errorText,
    fontSize: 13,
  },
}

function validate(username: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (username.trim().length < 2) {
    errors.username = 'Минимум 2 символа'
  }
  if (password.length < 6) {
    errors.password = 'Минимум 6 символов'
  }
  return errors
}

function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const message = useAuthStore((state) => state.message)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    const errors = validate(username, password)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch (error) {
      setServerError(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h2>Вход</h2>

      {message && <Alert variant="info">{message}</Alert>}
      {serverError && <Alert>{serverError}</Alert>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          placeholder="Логин"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setFieldErrors((prev) => ({ ...prev, username: undefined }))
          }}
        />
        {fieldErrors.username && <span style={styles.fieldError}>{fieldErrors.username}</span>}

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setFieldErrors((prev) => ({ ...prev, password: undefined }))
          }}
        />
        {fieldErrors.password && <span style={styles.fieldError}>{fieldErrors.password}</span>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </>
  )
}

export default LoginPage
