import axios from 'axios'

export type UploadedImage = {
  id: string
  filename: string
  width: number
  height: number
  original_url: string
  thumbnail_url: string
}

type ApiErrorBody = {
  detail?: string
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

export async function getImages() {
  const { data } = await api.get<UploadedImage[]>('/images')
  return data
}

export async function uploadImage(file: File, onProgress: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<UploadedImage>('/images/upload', formData, {
    onUploadProgress: ({ loaded, total }) => {
      if (total) {
        onProgress(Math.round((loaded / total) * 100))
      }
    },
  })
  return data
}

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return 'Неизвестная ошибка'
  }
  if (!error.response) {
    return 'Сервер недоступен'
  }
  return error.response.data?.detail ?? `Ошибка сервера (${error.response.status})`
}
