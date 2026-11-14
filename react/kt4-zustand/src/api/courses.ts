import { apiClient } from './client'
import type { CourseStats } from './types'

export async function fetchCoursesStats() {
  const { data } = await apiClient.get<CourseStats[]>('/courses/stats')
  return data
}

export async function fetchCourse(id: string) {
  const { data } = await apiClient.get<CourseStats>(`/courses/${id}`)
  return data
}
