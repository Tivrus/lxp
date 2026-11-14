import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import Alert from './components/Alert/Alert'
import Button from './components/Button/Button'
import Layout from './components/Layout/Layout'
import Spinner from './components/Spinner/Spinner'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CoursePage from './pages/CoursePage/CoursePage'
import HomePage from './pages/HomePage/HomePage'
import MyRecordsPage from './pages/MyRecordsPage/MyRecordsPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
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
    return <Navigate to={location.state?.from ?? '/my'} replace />
  }
  return <Outlet />
}

function App() {
  const session = useAuthStore((state) => state.session)
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  if (session.status === 'idle' || session.status === 'loading') {
    return <Spinner text="Проверка сессии..." />
  }

  if (session.status === 'error') {
    return (
      <Alert>
        {session.error} <Button onClick={restoreSession}>Повторить</Button>
      </Alert>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/my" element={<MyRecordsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
