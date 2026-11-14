import Button from '../Button/Button'
import styles from './ConfirmDialog.module.css'

interface Props {
  title: string
  text: string
  confirmText: string
  isPending: boolean
  error?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ title, text, confirmText, isPending, error, onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.text}>{text}</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Отмена
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Удаление...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
