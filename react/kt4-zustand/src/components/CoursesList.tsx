import type { CSSProperties } from 'react'
import { useCoursesStore } from '../store/coursesStore'
import { colors } from '../theme'
import CourseCard from './CourseCard'
import ErrorBox from './ErrorBox'

const styles: Record<string, CSSProperties> = {
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    border: `1px solid ${colors.border}`,
  },
  muted: {
    color: colors.textMuted,
  },
}

function CoursesList() {
  const courses = useCoursesStore((state) => state.courses)
  const selectedId = useCoursesStore((state) => state.selectedId)
  const loadCourses = useCoursesStore((state) => state.loadCourses)
  const selectCourse = useCoursesStore((state) => state.selectCourse)

  if (courses.status === 'idle' || courses.status === 'loading') {
    return <p style={styles.muted}>Загрузка...</p>
  }

  if (courses.status === 'error') {
    return (
      <ErrorBox>
        Ошибка: {courses.error} <button onClick={loadCourses}>Повторить</button>
      </ErrorBox>
    )
  }

  if (courses.data.length === 0) {
    return <p style={styles.muted}>Курсов пока нет</p>
  }

  return (
    <ul style={styles.list}>
      {courses.data.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isSelected={course.id === selectedId}
          onSelect={selectCourse}
        />
      ))}
    </ul>
  )
}

export default CoursesList
