import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { getErrorMessage } from '../graphql/errors'
import { CREATE_TASK, type CreateTaskVariables } from '../graphql/mutations'
import { ALL_TASKS, CATEGORIES, type CategoriesData } from '../graphql/queries'

function TaskForm() {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const { data } = useQuery<CategoriesData>(CATEGORIES)
  const [createTask, { loading }] = useMutation<unknown, CreateTaskVariables>(CREATE_TASK, {
    refetchQueries: [{ query: ALL_TASKS }],
    awaitRefetchQueries: true,
  })

  const categories = data?.categories ?? []
  const selectedCategoryId = categoryId ?? categories[0]?.id ?? null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (selectedCategoryId === null) return

    setError('')
    try {
      await createTask({ variables: { title, categoryId: selectedCategoryId } })
      setTitle('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <input value={title} placeholder="Название задачи" onChange={(e) => setTitle(e.target.value)} />
        <select value={selectedCategoryId ?? ''} onChange={(e) => setCategoryId(Number(e.target.value))}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading || selectedCategoryId === null || !title.trim()}>
          {loading ? 'Добавление...' : 'Добавить'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </>
  )
}

export default TaskForm
