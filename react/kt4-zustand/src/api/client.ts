import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10_000,
})

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<{ detail?: string }>(error)) {
    return 'Неизвестная ошибка'
  }

  if (!error.response) {
    return 'Сервер недоступен'
  }

  const { detail } = error.response.data ?? {}
  return typeof detail === 'string' ? detail : `Ошибка сервера (${error.response.status})`
}
