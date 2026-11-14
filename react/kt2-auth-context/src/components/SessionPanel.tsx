import type { CSSProperties } from 'react'
import { colors } from '../theme'
import SessionInfo from './SessionInfo'

const panelStyle: CSSProperties = {
  padding: 12,
  background: colors.panel,
  border: `1px solid ${colors.border}`,
}

function SessionPanel() {
  return (
    <section style={panelStyle}>
      <h3>Данные пользователя</h3>
      <SessionInfo />
    </section>
  )
}

export default SessionPanel
