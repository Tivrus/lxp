import type { CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuthStore } from '../store/authStore'
import { colors } from '../theme'

const styles: Record<string, CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '10px 20px',
    background: colors.panel,
    borderBottom: `1px solid ${colors.border}`,
  },
  userBlock: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  main: {
    maxWidth: 700,
    margin: '0 auto',
    padding: 20,
  },
}

const navLinkStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
  color: isActive ? colors.linkActive : colors.link,
  textDecoration: isActive ? 'underline' : 'none',
})

function Layout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <>
      <header style={styles.header}>
        {user ? (
          <>
            <NavLink to="/profile" style={navLinkStyle}>
              Профиль
            </NavLink>
            <NavLink to="/records" style={navLinkStyle}>
              Заявки
            </NavLink>
            <div style={styles.userBlock}>
              <span>{user.username}</span>
              <button onClick={() => logout()}>Выйти</button>
            </div>
          </>
        ) : (
          <NavLink to="/login" style={navLinkStyle}>
            Вход
          </NavLink>
        )}
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </>
  )
}

export default Layout
