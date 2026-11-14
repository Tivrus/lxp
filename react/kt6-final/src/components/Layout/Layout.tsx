import { NavLink, Outlet } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import Button from '../Button/Button'
import styles from './Layout.module.css'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link

function Layout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <>
      <header className={styles.header}>
        <NavLink to="/" end className={linkClassName}>
          Курсы
        </NavLink>
        {user && (
          <NavLink to="/my" className={linkClassName}>
            Мои заявки
          </NavLink>
        )}

        <div className={styles.account}>
          {user ? (
            <>
              <span>{user.username}</span>
              <Button onClick={() => logout()}>Выйти</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClassName}>
                Вход
              </NavLink>
              <NavLink to="/register" className={linkClassName}>
                Регистрация
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}

export default Layout
