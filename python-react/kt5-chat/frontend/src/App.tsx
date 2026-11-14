import { useState } from 'react'
import Chat from './components/Chat'
import JoinForm from './components/JoinForm'

function App() {
  const [username, setUsername] = useState('')

  return (
    <div className="app">
      <h2>Чат</h2>
      {username ? <Chat username={username} onLeave={() => setUsername('')} /> : <JoinForm onJoin={setUsername} />}
    </div>
  )
}

export default App
