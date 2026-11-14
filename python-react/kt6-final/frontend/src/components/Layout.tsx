import { NavLink, Outlet } from 'react-router'
import { useRealtime, type ConnectionStatus } from '../realtime/RealtimeContext'
import Notifications from './Notifications'

const CONNECTION_LABELS: Record<ConnectionStatus, string> = {
  connecting: 'подключение...',
  online: 'онлайн',
  reconnecting: 'нет связи, переподключение...',
}

function Layout() {
  const { username, logout, connection, online } = useRealtime()

  return (
    <>
      <header className="header">
        <NavLink to="/" end>
          Доска
        </NavLink>
        <NavLink to="/activity">Лента ({online.length} онлайн)</NavLink>
        <div className="header-right">
          <span className="status">{CONNECTION_LABELS[connection]}</span>
          <span>{username}</span>
          <button onClick={logout}>Выйти</button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Notifications />
    </>
  )
}

export default Layout
