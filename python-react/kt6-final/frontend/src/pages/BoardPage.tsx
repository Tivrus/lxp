import { useMemo } from 'react'
import NewTaskForm from '../components/NewTaskForm'
import TaskCard from '../components/TaskCard'
import { useRealtime } from '../realtime/RealtimeContext'
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../types'

function groupByStatus(tasks: Task[]) {
  const groups = Object.fromEntries(STATUSES.map((status) => [status, [] as Task[]])) as Record<TaskStatus, Task[]>
  tasks.forEach((task) => groups[task.status].push(task))
  return groups
}

function BoardPage() {
  const { tasks, tasksError } = useRealtime()
  const columns = useMemo(() => (tasks ? groupByStatus(tasks) : null), [tasks])

  return (
    <>
      <h2>Доска задач</h2>
      <NewTaskForm />

      {tasksError && <p className="error">Не удалось загрузить задачи: {tasksError}</p>}
      {!columns && !tasksError && <p className="muted">Загрузка...</p>}

      {columns && (
        <div className="columns">
          {STATUSES.map((status) => (
            <section key={status} className="column">
              <h3>
                {STATUS_LABELS[status]} ({columns[status].length})
              </h3>
              {columns[status].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </section>
          ))}
        </div>
      )}
    </>
  )
}

export default BoardPage
