import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { getErrorMessage } from '../../api/client'
import { getCourse } from '../../api/endpoints'
import type { CourseStats } from '../../api/types'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import { useAuthStore } from '../../store/authStore'
import { selectRecordByCourse, useRecordsStore } from '../../store/recordsStore'
import { idle, loading, type RequestState } from '../../types/request'
import { formatDate } from '../../utils/format'
import styles from './CoursePage.module.css'

type CourseParams = {
  courseId: string
}

function CoursePage() {
  const { courseId = '' } = useParams<CourseParams>()
  const location = useLocation()

  const user = useAuthStore((state) => state.user)
  const records = useRecordsStore((state) => state.records)
  const ensureRecordsLoaded = useRecordsStore((state) => state.ensureLoaded)
  const joinCourse = useRecordsStore((state) => state.joinCourse)
  const myRecord = useRecordsStore(selectRecordByCourse(courseId))

  const [course, setCourse] = useState<RequestState<CourseStats>>(idle)
  const [joinRequest, setJoinRequest] = useState<RequestState<null>>(idle)

  const loadCourse = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setCourse(loading)
      try {
        const data = await getCourse(courseId)
        setCourse({ status: 'success', data })
      } catch (error) {
        setCourse({ status: 'error', error: getErrorMessage(error) })
      }
    },
    [courseId],
  )

  useEffect(() => {
    loadCourse()
  }, [loadCourse])

  useEffect(() => {
    if (user) ensureRecordsLoaded()
  }, [user, ensureRecordsLoaded])

  const handleJoin = async () => {
    setJoinRequest(loading)
    try {
      await joinCourse(courseId)
      setJoinRequest(idle)
      loadCourse({ silent: true })
    } catch (error) {
      setJoinRequest({ status: 'error', error: getErrorMessage(error) })
    }
  }

  const backLink = (
    <Link to="/" className={styles.back}>
      Все курсы
    </Link>
  )

  if (course.status === 'error') {
    return (
      <>
        {backLink}
        <Alert>
          Не удалось загрузить курс: {course.error}{' '}
          <Button variant="secondary" onClick={() => loadCourse()}>
            Повторить
          </Button>
        </Alert>
      </>
    )
  }

  if (course.status !== 'success') {
    return <Spinner />
  }

  const renderJoinBlock = () => {
    if (!user) {
      return (
        <p>
          <Link to="/login" state={{ from: location.pathname }}>
            Войдите
          </Link>
          , чтобы записаться на курс
        </p>
      )
    }

    if (records.status === 'loading' || records.status === 'idle') {
      return <Spinner />
    }

    if (records.status === 'error') {
      return <Alert>{records.error}</Alert>
    }

    if (myRecord) {
      return (
        <p>
          Вы записаны с {formatDate(myRecord.created_at)}. <Link to="/my">Мои заявки</Link>
        </p>
      )
    }

    return (
      <>
        {joinRequest.status === 'error' && <Alert>{joinRequest.error}</Alert>}
        <Button onClick={handleJoin} disabled={joinRequest.status === 'loading'}>
          {joinRequest.status === 'loading' ? 'Записываем...' : 'Записаться'}
        </Button>
      </>
    )
  }

  return (
    <>
      {backLink}
      <h2>{course.data.title}</h2>
      <p>{course.data.description}</p>
      <p className={styles.muted}>Заявок: {course.data.records_count}</p>

      <div className={styles.joinBlock}>{renderJoinBlock()}</div>
    </>
  )
}

export default CoursePage
