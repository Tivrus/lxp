import type { Task } from '../types'

type Props = {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <li>
      <span className="category-dot" style={{ background: task.category.color }} />
      <div className="info">
        <div className={task.isCompleted ? 'done' : undefined}>{task.title}</div>
        <div className="muted">
          {task.category.name}
          {task.description && `, ${task.description}`}
        </div>
      </div>
      <button onClick={() => onToggle(task.id)}>{task.isCompleted ? 'Вернуть' : 'Готово'}</button>
      <button onClick={() => onDelete(task.id)} aria-label="Удалить задачу">
        Удалить
      </button>
    </li>
  )
}

export default TaskItem
