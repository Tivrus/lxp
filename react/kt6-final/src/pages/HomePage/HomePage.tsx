import { useEffect, useMemo, useState } from 'react'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import CourseCard from '../../components/CourseCard/CourseCard'
import Spinner from '../../components/Spinner/Spinner'
import { useAuthStore } from '../../store/authStore'
import { useCoursesStore } from '../../store/coursesStore'
import { useRecordsStore } from '../../store/recordsStore'
import styles from './HomePage.module.css'

function HomePage() {
  const courses = useCoursesStore((state) => state.courses)
  const loadCourses = useCoursesStore((state) => state.loadCourses)
  const user = useAuthStore((state) => state.user)
  const records = useRecordsStore((state) => state.records)
  const ensureRecordsLoaded = useRecordsStore((state) => state.ensureLoaded)
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (user) ensureRecordsLoaded()
  }, [user, ensureRecordsLoaded])

  const filteredCourses = useMemo(() => {
    if (courses.status !== 'success') return []

    const search = query.trim().toLowerCase()
    return courses.data.filter(
      (course) =>
        course.title.toLowerCase().includes(search) ||
        course.description.toLowerCase().includes(search),
    )
  }, [courses, query])

  const joinedCourseIds = useMemo(
    () =>
      new Set(records.status === 'success' ? records.data.map((record) => record.course.id) : []),
    [records],
  )

  return (
    <>
      <h2>Курсы</h2>
      <input
        type="search"
        className={styles.search}
        placeholder="Поиск по названию или описанию"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {(courses.status === 'idle' || courses.status === 'loading') && <Spinner />}

      {courses.status === 'error' && (
        <Alert>
          Не удалось загрузить курсы: {courses.error}{' '}
          <Button variant="secondary" onClick={loadCourses}>
            Повторить
          </Button>
        </Alert>
      )}

      {courses.status === 'success' &&
        (filteredCourses.length === 0 ? (
          <p className={styles.empty}>Ничего не найдено</p>
        ) : (
          <div className={styles.grid}>
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} isJoined={joinedCourseIds.has(course.id)} />
            ))}
          </div>
        ))}
    </>
  )
}

export default HomePage
