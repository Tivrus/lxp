import styles from './Spinner.module.css'

function Spinner({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <p className={styles.loading} role="status">
      {text}
    </p>
  )
}

export default Spinner
