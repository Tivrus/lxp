import type { CSSProperties } from 'react'
import { useAuth } from './auth/AuthContext'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'
import Header from './components/Header'
import LoginForm from './components/LoginForm'

const mainStyle: CSSProperties = {
  maxWidth: 600,
  margin: '0 auto',
  padding: 20,
}

function App() {
  const { user } = useAuth()

  return (
    <>
      <Header />
      <main style={mainStyle}>{user ? <Dashboard /> : <LoginForm />}</main>
      <Footer />
    </>
  )
}

export default App
