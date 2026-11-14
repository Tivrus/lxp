import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import ActivityPage from './pages/ActivityPage'
import BoardPage from './pages/BoardPage'
import LoginPage from './pages/LoginPage'
import TaskPage from './pages/TaskPage'
import { useRealtime } from './realtime/RealtimeContext'
import { RealtimeProvider } from './realtime/RealtimeProvider'

function NotFound() {
  return (
    <>
      <h2>404</h2>
      <Link to="/">К доске</Link>
    </>
  )
}

function AppRoutes() {
  const { username } = useRealtime()

  if (!username) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<BoardPage />} />
        <Route path="/tasks/:taskId" element={<TaskPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <RealtimeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RealtimeProvider>
  )
}

export default App
