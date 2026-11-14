import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({ variant = 'primary', type = 'button', className, ...props }: Props) {
  const classes = [styles.button, variant !== 'primary' && styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classes} {...props} />
}

export default Button
