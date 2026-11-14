import { create } from 'zustand'
import { getErrorMessage } from '../api/client'
import { fetchCourse, fetchCoursesStats } from '../api/courses'
import type { CourseStats } from '../api/types'
import type { RequestState } from '../types/request'

interface CoursesState {
  courses: RequestState<CourseStats[]>
  selectedId: string | null
  selectedCourse: RequestState<CourseStats>
  loadCourses: () => Promise<void>
  selectCourse: (id: string) => Promise<void>
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: { status: 'idle' },
  selectedId: null,
  selectedCourse: { status: 'idle' },

  loadCourses: async () => {
    set({ courses: { status: 'loading' } })
    try {
      const data = await fetchCoursesStats()
      set({ courses: { status: 'success', data } })
    } catch (error) {
      set({ courses: { status: 'error', error: getErrorMessage(error) } })
    }
  },

  selectCourse: async (id) => {
    set({ selectedId: id, selectedCourse: { status: 'loading' } })

    const isStillSelected = () => get().selectedId === id

    try {
      const data = await fetchCourse(id)
      if (isStillSelected()) {
        set({ selectedCourse: { status: 'success', data } })
      }
    } catch (error) {
      if (isStillSelected()) {
        set({ selectedCourse: { status: 'error', error: getErrorMessage(error) } })
      }
    }
  },
}))
