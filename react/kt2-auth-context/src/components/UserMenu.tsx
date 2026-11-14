import type { CSSProperties } from 'react'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme'

const styles: Record<string, CSSProperties> = {
  guest: {
    color: colors.textMuted,
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
}

function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) {
    return <span style={styles.guest}>Гость</span>
  }

  return (
    <div style={styles.menu}>
      <span>{user.name}</span>
      <button onClick={logout}>Выйти</button>
    </div>
  )
}

export default UserMenu
