import { useTaskProgress, type ProgressStatus } from '../hooks/useTaskProgress'

type Props = {
  simulateFailure: boolean
}

const STATUS_LABELS: Record<ProgressStatus, string> = {
  running: 'выполняется...',
  done: 'готово',
  error: 'прервано',
}

function TaskProgress({ simulateFailure }: Props) {
  const { percent, status, log } = useTaskProgress(simulateFailure)

  return (
    <div className="box">
      <progress value={percent} max={100} />
      <div>
        {percent}%, {STATUS_LABELS[status]}
      </div>

      {status === 'error' && (
        <div className="error" role="alert">
          Соединение с сервером прервано, задача не завершена
        </div>
      )}

      <ul className="log">
        {log.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

export default TaskProgress
