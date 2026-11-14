import { useId } from 'react'
import { useRealtime } from '../realtime/RealtimeContext'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function AssigneeInput({ value, onChange, placeholder = 'Исполнитель' }: Props) {
  const { online } = useRealtime()
  const listId = useId()

  return (
    <>
      <input value={value} placeholder={placeholder} list={listId} onChange={(e) => onChange(e.target.value)} />
      <datalist id={listId}>
        {online.map((user) => (
          <option key={user} value={user} />
        ))}
      </datalist>
    </>
  )
}

export default AssigneeInput
