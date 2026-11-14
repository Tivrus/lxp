import { useState, type CSSProperties, type FormEvent } from 'react'
import type { Task } from './types'
import { colors } from './theme'
import TaskBoard from './components/TaskBoard'

const initialTasks: Task[] = [
  { id: 1, title: 'Сделать дз по React', isCompleted: true },
  { id: 2, title: 'Прочитать про useEffect', isCompleted: false },
  { id: 3, title: 'Купить молоко', isCompleted: false },
]

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: 20,
  },
  form: {
    display: 'flex',
    gap: 6,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    background: colors.surface,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    color: colors.textMuted,
  },
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [title, setTitle] = useState('')

  const completedCount = tasks.filter((task) => task.isCompleted).length

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, isCompleted: !task.isCompleted } : task)),
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setTasks((prev) => [...prev, { id: Date.now(), title: trimmed, isCompleted: false }])
    setTitle('')
  }

  return (
    <div style={styles.container}>
      <h2>Задачи</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая задача"
        />
        <button type="submit">Добавить</button>
      </form>

      <TaskBoard tasks={tasks} onToggle={toggleTask} />

      <div style={styles.footer}>
        <span>
          Выполнено {completedCount} из {tasks.length}
        </span>
        <button onClick={() => setTasks([])} disabled={tasks.length === 0}>
          Очистить
        </button>
      </div>
    </div>
  )
}

export default App
