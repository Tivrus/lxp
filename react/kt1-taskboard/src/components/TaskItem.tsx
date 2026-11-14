import type { CSSProperties } from 'react'
import type { Task } from '../types'
import { colors } from '../theme'

type Props = {
  task: Task
  onToggle: (id: number) => void
}

const styles: Record<string, CSSProperties> = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    flex: 1,
    cursor: 'pointer',
  },
  titleDone: {
    flex: 1,
    cursor: 'pointer',
    textDecoration: 'line-through',
    color: colors.textDone,
  },
}

function TaskItem({ task, onToggle }: Props) {
  const handleToggle = () => onToggle(task.id)

  return (
    <li style={styles.item}>
      <span style={task.isCompleted ? styles.titleDone : styles.title} onClick={handleToggle}>
        {task.title}
      </span>
      <button onClick={handleToggle}>{task.isCompleted ? 'Вернуть' : 'Готово'}</button>
    </li>
  )
}

export default TaskItem
