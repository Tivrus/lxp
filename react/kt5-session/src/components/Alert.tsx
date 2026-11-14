import type { CSSProperties, ReactNode } from 'react'
import { colors } from '../theme'

type Props = {
  children: ReactNode
  variant?: 'error' | 'info'
}

function Alert({ children, variant = 'error' }: Props) {
  const isInfo = variant === 'info'

  const style: CSSProperties = {
    margin: '0 0 12px',
    padding: 8,
    border: `1px solid ${isInfo ? colors.border : colors.errorBorder}`,
    background: colors.alertBackground,
    color: isInfo ? colors.infoText : colors.errorText,
  }

  return <p style={style}>{children}</p>
}

export default Alert
