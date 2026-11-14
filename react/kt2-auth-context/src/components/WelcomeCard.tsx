import { useAuth } from '../auth/AuthContext'

function WelcomeCard() {
  const { user } = useAuth()

  return <h2>Привет, {user?.name}</h2>
}

export default WelcomeCard
