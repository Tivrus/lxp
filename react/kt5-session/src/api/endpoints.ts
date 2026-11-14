import { apiClient } from './client'
import type { RecordItem, RecordsListResponse, User, UserToken } from './types'

export async function login(username: string, password: string) {
  const body = new URLSearchParams({ username, password })
  const { data } = await apiClient.post<UserToken>('/auth/login', body)
  return data
}

export async function getMe() {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}

export async function getMyRecords(): Promise<RecordItem[]> {
  const { data } = await apiClient.get<RecordsListResponse>('/records/')
  return data.records
}
