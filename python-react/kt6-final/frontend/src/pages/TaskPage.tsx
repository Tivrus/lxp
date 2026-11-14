import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { addComment, deleteTask, getComments, getErrorMessage, updateTask, type TaskUpdate } from '../api'
import AssigneeInput from '../components/AssigneeInput'
import { useRealtime } from '../realtime/RealtimeContext'
import { STATUSES, STATUS_LABELS, type Comment, type TaskStatus } from '../types'
import { formatDateTime, formatTime } from '../utils/format'
import { upsertById } from '../utils/upsert'

type TaskParams = {
  taskId: string
}

function TaskPage() {
  const { taskId } = useParams<TaskParams>()
  const id = Number(taskId)
  const navigate = useNavigate()
  const { tasks, upsertTask, removeTask, subscribe } = useRealtime()

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoadedFor, setCommentsLoadedFor] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')
  const [assignee, setAssignee] = useState('')
  const [error, setError] = useState('')

  const isLoadingComments = commentsLoadedFor !== id

  useEffect(() => {
    getComments(id)
      .then(setComments)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setCommentsLoadedFor(id))
  }, [id])

  useEffect(
    () =>
      subscribe((event) => {
        if (event.type === 'comment_added' && event.comment.task_id === id) {
          setComments((prev) => upsertById(prev, event.comment))
        }
      }),
    [id, subscribe],
  )

  if (!tasks) {
    return <p className="muted">Загрузка...</p>
  }

  const task = tasks.find((item) => item.id === id)
  if (!task) {
    return (
      <>
        <p>Задача не найдена или была удалена.</p>
        <Link to="/">К доске</Link>
      </>
    )
  }

  const runAction = async (action: () => Promise<void>) => {
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const applyUpdate = (payload: TaskUpdate) =>
    runAction(async () => {
      upsertTask(await updateTask(id, payload))
    })

  const handleAssign = () =>
    runAction(async () => {
      upsertTask(await updateTask(id, { assignee: assignee.trim() || null }))
      setAssignee('')
    })

  const handleDelete = () => {
    if (!window.confirm('Удалить задачу?')) return
    runAction(async () => {
      await deleteTask(id)
      removeTask(id)
      navigate('/')
    })
  }

  const handleComment = (e: FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    runAction(async () => {
      const comment = await addComment(id, commentText)
      setComments((prev) => upsertById(prev, comment))
      setCommentText('')
    })
  }

  return (
    <>
      <Link to="/">Назад к доске</Link>
      <h2>{task.title}</h2>
      {task.description && <p>{task.description}</p>}
      <p className="muted">
        Автор: {task.author}, создана {formatDateTime(task.created_at)}
      </p>

      <div className="row">
        <label htmlFor="task-status">Статус:</label>
        <select
          id="task-status"
          value={task.status}
          onChange={(e) => applyUpdate({ status: e.target.value as TaskStatus })}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <span>Исполнитель: {task.assignee ?? 'не назначен'}</span>
        <AssigneeInput value={assignee} onChange={setAssignee} placeholder="Новый исполнитель" />
        <button onClick={handleAssign}>Назначить</button>
        <button className="danger" onClick={handleDelete}>
          Удалить задачу
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <h3>Комментарии</h3>
      <div className="comments">
        {isLoadingComments && <p className="muted">Загрузка...</p>}
        {!isLoadingComments && comments.length === 0 && <p className="muted">Комментариев пока нет</p>}
        {comments.map((comment) => (
          <p key={comment.id}>
            <b>{comment.author}:</b> {comment.text} <span className="muted">{formatTime(comment.created_at)}</span>
          </p>
        ))}
        <form className="row" onSubmit={handleComment}>
          <input value={commentText} placeholder="Комментарий" onChange={(e) => setCommentText(e.target.value)} />
          <button type="submit" disabled={!commentText.trim()}>
            Отправить
          </button>
        </form>
      </div>
    </>
  )
}

export default TaskPage
