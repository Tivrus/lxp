import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RecordsPage from './pages/RecordsPage'
import { useAuthStore } from './store/authStore'

function PrivateRoute() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

function GuestRoute() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (user) {
    return <Navigate to={location.state?.from ?? '/profile'} replace />
  }
  return <Outlet />
}

function NotFound() {
  return (
    <>
      <h2>404</h2>
      <Link to="/">На главную</Link>
    </>
  )
}

function App() {
  const isRestoring = useAuthStore((state) => state.isRestoring)
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  if (isRestoring) {
    return <p style={{ padding: 20 }}>Загрузка...</p>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/records" element={<RecordsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
