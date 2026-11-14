import type { CSSProperties } from 'react'
import { colors } from '../theme'
import AuthStatus from './AuthStatus'

const footerStyle: CSSProperties = {
  padding: '10px 20px',
  borderTop: `1px solid ${colors.border}`,
  color: colors.textMuted,
  fontSize: 14,
}

function Footer() {
  return (
    <footer style={footerStyle}>
      <AuthStatus />
    </footer>
  )
}

export default Footer
