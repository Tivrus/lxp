import type { CSSProperties } from 'react'
import { useCoursesStore } from '../store/coursesStore'
import { colors } from '../theme'
import ErrorBox from './ErrorBox'

const styles: Record<string, CSSProperties> = {
  panel: {
    padding: 12,
    background: colors.panel,
    border: `1px solid ${colors.border}`,
  },
  title: {
    marginTop: 0,
  },
  muted: {
    color: colors.textMuted,
  },
}

function CourseDetails() {
  const selectedId = useCoursesStore((state) => state.selectedId)
  const course = useCoursesStore((state) => state.selectedCourse)
  const selectCourse = useCoursesStore((state) => state.selectCourse)

  return (
    <div style={styles.panel}>
      {!selectedId && <p style={styles.muted}>Выберите курс из списка</p>}

      {course.status === 'loading' && <p style={styles.muted}>Загрузка...</p>}

      {course.status === 'error' && (
        <ErrorBox>
          Ошибка: {course.error}{' '}
          {selectedId && <button onClick={() => selectCourse(selectedId)}>Повторить</button>}
        </ErrorBox>
      )}

      {course.status === 'success' && (
        <>
          <h3 style={styles.title}>{course.data.title}</h3>
          <p>{course.data.description}</p>
          <p style={styles.muted}>
            ID: {course.data.id}, заявок: {course.data.records_count}
          </p>
        </>
      )}
    </div>
  )
}

export default CourseDetails
