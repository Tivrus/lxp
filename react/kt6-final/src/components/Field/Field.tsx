import styles from './Field.module.css'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'password'
  error?: string
  autoComplete?: string
}

function Field({ label, value, onChange, type = 'text', error, autoComplete }: Props) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={error ? styles.invalid : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  )
}

export default Field
