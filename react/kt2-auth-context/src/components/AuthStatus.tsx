import { useAuth } from '../auth/AuthContext'

function AuthStatus() {
  const { user } = useAuth()

  return <span>{user ? `Вы вошли как ${user.name}` : 'Вы не авторизованы'}</span>
}

export default AuthStatus
