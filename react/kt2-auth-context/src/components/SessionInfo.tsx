import type { CSSProperties } from 'react'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme'

const labelStyle: CSSProperties = {
  color: colors.textMuted,
}

function SessionInfo() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <>
      <p>
        <span style={labelStyle}>ID:</span> {user.id}
      </p>
      <p>
        <span style={labelStyle}>Имя:</span> {user.name}
      </p>
    </>
  )
}

export default SessionInfo
