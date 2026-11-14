import { useState, type FormEvent } from 'react'
import { createTask, getErrorMessage } from '../api'
import { useRealtime } from '../realtime/RealtimeContext'
import AssigneeInput from './AssigneeInput'

const emptyForm = { title: '', description: '', assignee: '' }

function NewTaskForm() {
  const { upsertTask } = useRealtime()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof typeof emptyForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const task = await createTask({
        title: form.title,
        description: form.description,
        assignee: form.assignee.trim() || null,
      })
      upsertTask(task)
      setForm(emptyForm)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form className="new-task" onSubmit={handleSubmit}>
        <input
          className="title"
          value={form.title}
          placeholder="Новая задача"
          onChange={(e) => updateField('title')(e.target.value)}
        />
        <input
          value={form.description}
          placeholder="Описание"
          onChange={(e) => updateField('description')(e.target.value)}
        />
        <AssigneeInput value={form.assignee} onChange={updateField('assignee')} />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Добавление...' : 'Добавить'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </>
  )
}

export default NewTaskForm
