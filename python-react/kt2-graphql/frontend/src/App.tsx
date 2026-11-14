import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'

function App() {
  return (
    <div className="app">
      <h2>Менеджер задач</h2>
      <TaskForm />
      <TaskList />
    </div>
  )
}

export default App
