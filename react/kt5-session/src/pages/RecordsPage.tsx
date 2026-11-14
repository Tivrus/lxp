import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { getErrorMessage } from '../api/client'
import { getMyRecords } from '../api/endpoints'
import type { RecordItem } from '../api/types'
import Alert from '../components/Alert'
import { colors } from '../theme'

const mutedStyle: CSSProperties = {
  color: colors.textMuted,
}

function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRecords = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      setRecords(await getMyRecords())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const isEmpty = !isLoading && !error && records.length === 0

  return (
    <>
      <h2>Мои заявки</h2>
      <button onClick={loadRecords} disabled={isLoading}>
        Обновить
      </button>

      {isLoading && <p style={mutedStyle}>Загрузка...</p>}
      {error && <Alert>{error}</Alert>}
      {isEmpty && <p style={mutedStyle}>Заявок нет</p>}

      <ul>
        {records.map((record) => (
          <li key={record.id}>
            {record.course.title}{' '}
            <span style={mutedStyle}>{new Date(record.created_at).toLocaleDateString('ru-RU')}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export default RecordsPage
