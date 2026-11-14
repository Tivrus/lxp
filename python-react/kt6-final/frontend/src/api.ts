import axios from 'axios'
import type { Activity, Comment, Task, TaskStatus } from './types'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const WS_URL = API_URL.replace(/^http/, 'ws')

type ApiErrorBody = {
  detail?: string | { msg: string }[]
}

export type TaskUpdate = {
  status?: TaskStatus
  assignee?: string | null
}

const client = axios.create({ baseURL: API_URL })

export function setCurrentUser(username: string | null) {
  if (username) {
    client.defaults.headers.common['X-Username'] = encodeURIComponent(username)
  } else {
    delete client.defaults.headers.common['X-Username']
  }
}

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return 'Неизвестная ошибка'
  }
  if (!error.response) {
    return 'Сервер недоступен'
  }

  const { detail } = error.response.data ?? {}
  if (typeof detail === 'string') {
    return detail
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg.replace(/^Value error, /, '')).join(', ')
  }
  return `Ошибка сервера (${error.response.status})`
}

export async function getTasks() {
  const { data } = await client.get<Task[]>('/tasks')
  return data
}

export async function createTask(payload: { title: string; description: string; assignee: string | null }) {
  const { data } = await client.post<Task>('/tasks', payload)
  return data
}

export async function updateTask(id: number, payload: TaskUpdate) {
  const { data } = await client.patch<Task>(`/tasks/${id}`, payload)
  return data
}

export async function deleteTask(id: number) {
  await client.delete(`/tasks/${id}`)
}

export async function getComments(taskId: number) {
  const { data } = await client.get<Comment[]>(`/tasks/${taskId}/comments`)
  return data
}

export async function addComment(taskId: number, text: string) {
  const { data } = await client.post<Comment>(`/tasks/${taskId}/comments`, { text })
  return data
}

export async function getActivity() {
  const { data } = await client.get<Activity[]>('/activity')
  return data
}
