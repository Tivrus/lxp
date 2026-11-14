import { create } from 'zustand'
import { getErrorMessage } from '../api/client'
import { getCourses } from '../api/endpoints'
import type { CourseStats } from '../api/types'
import { idle, loading, type RequestState } from '../types/request'

interface CoursesState {
  courses: RequestState<CourseStats[]>
  loadCourses: () => Promise<void>
}

export const useCoursesStore = create<CoursesState>((set) => ({
  courses: idle,

  loadCourses: async () => {
    set({ courses: loading })
    try {
      const data = await getCourses()
      set({ courses: { status: 'success', data } })
    } catch (error) {
      set({ courses: { status: 'error', error: getErrorMessage(error) } })
    }
  },
}))
