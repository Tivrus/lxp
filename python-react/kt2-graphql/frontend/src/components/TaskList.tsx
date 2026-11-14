import { useMutation, useQuery } from '@apollo/client/react'
import { getErrorMessage } from '../graphql/errors'
import { COMPLETE_TASK, DELETE_TASK, type TaskIdVariables } from '../graphql/mutations'
import { ALL_TASKS, type AllTasksData } from '../graphql/queries'
import TaskItem from './TaskItem'

function TaskList() {
  const { data, loading, error, refetch } = useQuery<AllTasksData>(ALL_TASKS)
  const [completeTask] = useMutation<unknown, TaskIdVariables>(COMPLETE_TASK)
  const [deleteTask] = useMutation<unknown, TaskIdVariables>(DELETE_TASK, {
    refetchQueries: [{ query: ALL_TASKS }],
  })

  if (loading) {
    return <p className="muted">Загрузка задач...</p>
  }

  if (error) {
    return (
      <p className="error">
        Не удалось загрузить задачи: {getErrorMessage(error)} <button onClick={() => refetch()}>Повторить</button>
      </p>
    )
  }

  const tasks = data?.allTasks ?? []

  if (tasks.length === 0) {
    return <p className="muted">Задач пока нет</p>
  }

  return (
    <ul className="list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={(id) => completeTask({ variables: { id } })}
          onDelete={(id) => deleteTask({ variables: { id } })}
        />
      ))}
    </ul>
  )
}

export default TaskList
