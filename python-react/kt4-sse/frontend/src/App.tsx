import { useState } from 'react'
import TaskProgress from './components/TaskProgress'

type Run = {
  id: number
  simulateFailure: boolean
}

function App() {
  const [run, setRun] = useState<Run | null>(null)

  const start = (simulateFailure: boolean) => {
    setRun((prev) => ({ id: (prev?.id ?? 0) + 1, simulateFailure }))
  }

  return (
    <div className="app">
      <h2>Выполнение задачи</h2>
      <div className="actions">
        <button onClick={() => start(false)}>Запустить</button>
        <button onClick={() => start(true)}>Запустить с обрывом</button>
      </div>
      {run && <TaskProgress key={run.id} simulateFailure={run.simulateFailure} />}
    </div>
  )
}

export default App
