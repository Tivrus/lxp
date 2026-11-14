import { Link } from 'react-router'
import styles from './NotFoundPage.module.css'

function NotFoundPage() {
  return (
    <>
      <h2>404</h2>
      <p className={styles.text}>Страница не найдена</p>
      <Link to="/">На главную</Link>
    </>
  )
}

export default NotFoundPage
