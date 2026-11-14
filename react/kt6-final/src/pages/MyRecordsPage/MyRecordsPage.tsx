import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '../../api/client'
import type { RecordItem } from '../../api/types'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import Spinner from '../../components/Spinner/Spinner'
import { useRecordsStore } from '../../store/recordsStore'
import { idle, loading, type RequestState } from '../../types/request'
import { formatDate } from '../../utils/format'
import styles from './MyRecordsPage.module.css'

function MyRecordsPage() {
  const records = useRecordsStore((state) => state.records)
  const loadRecords = useRecordsStore((state) => state.loadRecords)
  const ensureLoaded = useRecordsStore((state) => state.ensureLoaded)
  const cancelRecord = useRecordsStore((state) => state.cancelRecord)

  const [recordToCancel, setRecordToCancel] = useState<RecordItem | null>(null)
  const [cancelRequest, setCancelRequest] = useState<RequestState<null>>(idle)

  useEffect(() => {
    ensureLoaded()
  }, [ensureLoaded])

  const closeDialog = () => {
    setRecordToCancel(null)
    setCancelRequest(idle)
  }

  const handleCancel = async () => {
    if (!recordToCancel) return

    setCancelRequest(loading)
    try {
      await cancelRecord(recordToCancel.id)
      closeDialog()
    } catch (error) {
      setCancelRequest({ status: 'error', error: getErrorMessage(error) })
    }
  }

  return (
    <>
      <div className={styles.heading}>
        <h2>Мои заявки</h2>
        <Button variant="secondary" onClick={loadRecords} disabled={records.status === 'loading'}>
          Обновить
        </Button>
      </div>

      {records.status === 'loading' && <Spinner />}

      {records.status === 'error' && <Alert>Не удалось загрузить заявки: {records.error}</Alert>}

      {records.status === 'success' && records.data.length === 0 && (
        <div className={styles.empty}>
          <p>У вас пока нет заявок</p>
          <Link to="/">Перейти к курсам</Link>
        </div>
      )}

      {records.status === 'success' && records.data.length > 0 && (
        <ul className={styles.list}>
          {records.data.map((record) => (
            <li key={record.id} className={styles.item}>
              <div className={styles.info}>
                <Link to={`/courses/${record.course.id}`} className={styles.course}>
                  {record.course.title}
                </Link>
                <span className={styles.meta}>от {formatDate(record.created_at)}</span>
              </div>
              <Button variant="danger" onClick={() => setRecordToCancel(record)}>
                Отменить
              </Button>
            </li>
          ))}
        </ul>
      )}

      {recordToCancel && (
        <ConfirmDialog
          title="Отменить заявку?"
          text={`Заявка на курс "${recordToCancel.course.title}" будет удалена.`}
          confirmText="Отменить заявку"
          isPending={cancelRequest.status === 'loading'}
          error={cancelRequest.status === 'error' ? cancelRequest.error : undefined}
          onConfirm={handleCancel}
          onCancel={closeDialog}
        />
      )}
    </>
  )
}

export default MyRecordsPage
