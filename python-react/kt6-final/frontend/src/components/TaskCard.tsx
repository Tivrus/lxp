import { useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage, updateTask } from '../api'
import { useRealtime } from '../realtime/RealtimeContext'
import { STATUSES, STATUS_LABELS, type Task } from '../types'

type Props = {
  task: Task
}

function TaskCard({ task }: Props) {
  const { username, upsertTask } = useRealtime()
  const [error, setError] = useState('')
  const index = STATUSES.indexOf(task.status)
  const prevStatus = STATUSES[index - 1]
  const nextStatus = STATUSES[index + 1]

  const moveTo = async (status: Task['status']) => {
    setError('')
    try {
      upsertTask(await updateTask(task.id, { status }))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="card">
      <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      <div className="card-meta">
        {task.assignee ? (
          <span className={task.assignee === username ? 'mine' : undefined}>Исполнитель: {task.assignee}</span>
        ) : (
          'Без исполнителя'
        )}
      </div>
      <div className="card-actions">
        {prevStatus && (
          <button onClick={() => moveTo(prevStatus)} title={`В "${STATUS_LABELS[prevStatus]}"`}>
            Назад
          </button>
        )}
        {nextStatus && (
          <button onClick={() => moveTo(nextStatus)} title={`В "${STATUS_LABELS[nextStatus]}"`}>
            Вперёд
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default TaskCard
