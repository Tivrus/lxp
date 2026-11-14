import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { getErrorMessage } from '../../api/client'
import { register } from '../../api/endpoints'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import Field from '../../components/Field/Field'
import { idle, loading, type RequestState } from '../../types/request'
import { validatePassword, validateUsername } from '../../utils/validation'
import styles from './AuthPage.module.css'

type FormValues = {
  username: string
  password: string
  confirmPassword: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = { username: '', password: '', confirmPassword: '' }

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  const usernameError = validateUsername(values.username)
  if (usernameError) errors.username = usernameError

  const passwordError = validatePassword(values.password)
  if (passwordError) errors.password = passwordError

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают'
  }
  return errors
}

function RegisterPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [request, setRequest] = useState<RequestState<null>>(idle)

  const handleChange = (field: keyof FormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const username = values.username.trim()
    setRequest(loading)
    try {
      await register(username, values.password)
      navigate('/login', { state: { registeredUsername: username } })
    } catch (error) {
      setRequest({ status: 'error', error: getErrorMessage(error) })
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Регистрация</h2>

      {request.status === 'error' && <Alert>{request.error}</Alert>}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field
          label="Логин"
          value={values.username}
          error={errors.username}
          autoComplete="username"
          onChange={handleChange('username')}
        />
        <Field
          label="Пароль"
          type="password"
          value={values.password}
          error={errors.password}
          autoComplete="new-password"
          onChange={handleChange('password')}
        />
        <Field
          label="Повторите пароль"
          type="password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
          onChange={handleChange('confirmPassword')}
        />
        <Button type="submit" disabled={request.status === 'loading'}>
          {request.status === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>

      <p className={styles.footer}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  )
}

export default RegisterPage
