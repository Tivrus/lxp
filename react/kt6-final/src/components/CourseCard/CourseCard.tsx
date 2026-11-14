import { Link } from 'react-router'
import type { CourseStats } from '../../api/types'
import styles from './CourseCard.module.css'

interface Props {
  course: CourseStats
  isJoined: boolean
}

function CourseCard({ course, isJoined }: Props) {
  return (
    <Link to={`/courses/${course.id}`} className={styles.card}>
      <h3 className={styles.title}>{course.title}</h3>
      <p className={styles.description}>{course.description}</p>
      <div className={styles.footer}>
        Заявок: {course.records_count}
        {isJoined && <b> (вы записаны)</b>}
      </div>
    </Link>
  )
}

export default CourseCard
