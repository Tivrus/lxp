import type { ReactNode } from 'react'
import styles from './Alert.module.css'

interface Props {
  variant?: 'error' | 'info'
  children: ReactNode
}

function Alert({ variant = 'error', children }: Props) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role={variant === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export default Alert
