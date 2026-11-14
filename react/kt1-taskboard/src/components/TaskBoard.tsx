import type { CSSProperties } from 'react'
import type { Task } from '../types'
import { colors } from '../theme'
import TaskItem from './TaskItem'

type Props = {
  tasks: Task[]
  onToggle: (id: number) => void
}

const styles: Record<string, CSSProperties> = {
  empty: {
    color: colors.textMuted,
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    border: `1px solid ${colors.border}`,
  },
}

function TaskBoard({ tasks, onToggle }: Props) {
  if (tasks.length === 0) {
    return <p style={styles.empty}>Задач нет</p>
  }

  return (
    <ul style={styles.list}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} />
      ))}
    </ul>
  )
}

export default TaskBoard
