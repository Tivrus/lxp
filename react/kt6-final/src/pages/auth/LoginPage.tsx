import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { getErrorMessage } from '../../api/client'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import Field from '../../components/Field/Field'
import { useAuthStore } from '../../store/authStore'
import { idle, loading, type RequestState } from '../../types/request'
import { MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '../../utils/validation'
import styles from './AuthPage.module.css'

type FormErrors = {
  username?: string
  password?: string
}

function validate(username: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (username.trim().length < MIN_USERNAME_LENGTH) {
    errors.username = `Минимум ${MIN_USERNAME_LENGTH} символа`
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Минимум ${MIN_PASSWORD_LENGTH} символов`
  }
  return errors
}

function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const notice = useAuthStore((state) => state.notice)
  const location = useLocation()
  const registeredUsername: string | undefined = location.state?.registeredUsername

  const [username, setUsername] = useState(registeredUsername ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [request, setRequest] = useState<RequestState<null>>(idle)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const nextErrors = validate(username, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setRequest(loading)
    try {
      await login(username.trim(), password)
    } catch (error) {
      setRequest({ status: 'error', error: getErrorMessage(error) })
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Вход</h2>

      {registeredUsername && <Alert variant="info">Регистрация прошла успешно, войдите в аккаунт</Alert>}
      {notice && <Alert variant="info">{notice}</Alert>}
      {request.status === 'error' && <Alert>{request.error}</Alert>}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field
          label="Логин"
          value={username}
          error={errors.username}
          autoComplete="username"
          onChange={(value) => {
            setUsername(value)
            setErrors((prev) => ({ ...prev, username: undefined }))
          }}
        />
        <Field
          label="Пароль"
          type="password"
          value={password}
          error={errors.password}
          autoComplete="current-password"
          onChange={(value) => {
            setPassword(value)
            setErrors((prev) => ({ ...prev, password: undefined }))
          }}
        />
        <Button type="submit" disabled={request.status === 'loading'}>
          {request.status === 'loading' ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <p className={styles.footer}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}

export default LoginPage
