import type { CSSProperties, ReactNode } from 'react'
import { colors } from '../theme'

const errorStyle: CSSProperties = {
  padding: 10,
  border: `1px solid ${colors.errorBorder}`,
  background: colors.errorBackground,
  color: colors.errorText,
}

function ErrorBox({ children }: { children: ReactNode }) {
  return <div style={errorStyle}>{children}</div>
}

export default ErrorBox
