import { useEffect, useState, type CSSProperties } from 'react'
import { getErrorMessage } from '../api/client'
import { getMe } from '../api/endpoints'
import { tokenStorage, type TokenKey } from '../api/tokenStorage'
import { useAuthStore } from '../store/authStore'
import { colors } from '../theme'

const styles: Record<string, CSSProperties> = {
  muted: {
    color: colors.textMuted,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
}

function getTokenExpiration(token: string | null): number | null {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch {
    return null
  }
}

function formatTimeLeft(token: string | null, now: number) {
  const expiresAt = getTokenExpiration(token)
  if (expiresAt === null) return '-'

  const seconds = Math.round((expiresAt - now) / 1000)
  return seconds > 0 ? `${seconds} сек` : 'истёк'
}

function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const refreshCount = useAuthStore((state) => state.refreshCount)
  const [now, setNow] = useState(Date.now())
  const [result, setResult] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const checkSession = async () => {
    setResult('Проверяем...')
    try {
      const me = await getMe()
      setResult(`OK, /auth/me вернул ${me.username}`)
    } catch (error) {
      setResult(`Ошибка: ${getErrorMessage(error)}`)
    }
  }

  const corruptToken = (key: TokenKey) => {
    localStorage.setItem(key, `${localStorage.getItem(key)}broken`)
    setResult(`${key} испорчен`)
  }

  if (!user) return null

  return (
    <>
      <h2>Профиль</h2>
      <p>
        {user.username} <span style={styles.muted}>({user.role})</span>
      </p>
      <p style={styles.muted}>
        Access истекает через: {formatTimeLeft(tokenStorage.getAccess(), now)}
        <br />
        Refresh истекает через: {formatTimeLeft(tokenStorage.getRefresh(), now)}
        <br />
        Обновлений токена: {refreshCount}
      </p>

      <div style={styles.actions}>
        <button onClick={checkSession}>Запрос /auth/me</button>
        <button onClick={() => corruptToken('access_token')}>Сломать access</button>
        <button onClick={() => corruptToken('refresh_token')}>Сломать refresh</button>
      </div>

      {result && <p>{result}</p>}
    </>
  )
}

export default ProfilePage
