import { useEffect, type CSSProperties } from 'react'
import CourseDetails from './components/CourseDetails'
import CoursesList from './components/CoursesList'
import { useCoursesStore } from './store/coursesStore'

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: 20,
  },
  toolbar: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  columns: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'flex-start',
  },
  column: {
    flex: '1 1 300px',
  },
}
 
 // бубубу бебебе
function App() {
  const loadCourses = useCoursesStore((state) => state.loadCourses)
  const selectCourse = useCoursesStore((state) => state.selectCourse)
  const isLoading = useCoursesStore((state) => state.courses.status === 'loading')

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  return (
    <div style={styles.container}>
      <h2>Курсы</h2>
      <div style={styles.toolbar}>
        <button onClick={loadCourses} disabled={isLoading}>
          Обновить
        </button>
        <button onClick={() => selectCourse('unknown-course')}>Тест 404</button>
      </div>

      <div style={styles.columns}>
        <div style={styles.column}>
          <CoursesList />
        </div>
        <div style={styles.column}>
          <CourseDetails />
        </div>
      </div>
    </div>
  )
}

export default App
