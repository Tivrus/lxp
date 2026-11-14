import { api } from './client'
import type { CourseStats, RecordItem, RecordsListResponse, User, UserToken } from './types'

export async function login(username: string, password: string) {
  const body = new URLSearchParams({ username, password })
  const { data } = await api.post<UserToken>('/auth/login', body)
  return data
}

export async function register(username: string, password: string) {
  await api.post('/auth/', { username, password })
}

export async function getMe() {
  const { data } = await api.get<User>('/auth/me')
  return data
}

export async function getCourses() {
  const { data } = await api.get<CourseStats[]>('/courses/stats')
  return data
}

export async function getCourse(id: string) {
  const { data } = await api.get<CourseStats>(`/courses/${id}`)
  return data
}

export async function getMyRecords(): Promise<RecordItem[]> {
  const { data } = await api.get<RecordsListResponse>('/records/')
  return data.records
}

export async function createRecord(courseId: string) {
  const { data } = await api.post<RecordItem>('/records/', { course_id: courseId })
  return data
}

export async function deleteRecord(id: number) {
  await api.delete(`/records/${id}`)
}
