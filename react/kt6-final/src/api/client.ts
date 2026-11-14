import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from './tokenStorage'
import type { UserToken } from './types'

const BASE_URL = 'http://127.0.0.1:8000'

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

type ApiErrorBody = {
  detail?: string | { msg: string }[]
}

export const api = axios.create({ baseURL: BASE_URL, timeout: 10_000 })

let onSessionExpired = () => {}

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

async function refreshTokens() {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) {
    throw new Error('Refresh token is missing')
  }

  const { data } = await axios.post<UserToken>(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  })
  tokenStorage.save(data)
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined
    const shouldRefresh =
      error.response?.status === 401 && request && !request._retry && request.url !== '/auth/login'

    if (!shouldRefresh) {
      throw error
    }
    request._retry = true

    try {
      await refreshTokens()
    } catch (refreshError) {
      tokenStorage.clear()
      onSessionExpired()
      throw refreshError
    }

    request.headers.Authorization = `Bearer ${tokenStorage.getAccess()}`
    return api(request)
  },
)

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && !error.response
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return 'Сервер недоступен'
    }

    const { detail } = error.response.data ?? {}
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join('; ')
    }
    return `Ошибка сервера (${error.response.status})`
  }

  return error instanceof Error ? error.message : 'Неизвестная ошибка'
}
