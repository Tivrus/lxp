import { create } from 'zustand'
import { getErrorMessage } from '../api/client'
import { createRecord, deleteRecord, getMyRecords } from '../api/endpoints'
import type { RecordItem } from '../api/types'
import { idle, loading, type RequestState } from '../types/request'
import { useAuthStore } from './authStore'

interface RecordsState {
  records: RequestState<RecordItem[]>
  loadRecords: () => Promise<void>
  ensureLoaded: () => void
  joinCourse: (courseId: string) => Promise<void>
  cancelRecord: (id: number) => Promise<void>
}

export const useRecordsStore = create<RecordsState>((set, get) => {
  const updateRecords = (update: (records: RecordItem[]) => RecordItem[]) => {
    const { records } = get()
    if (records.status === 'success') {
      set({ records: { status: 'success', data: update(records.data) } })
    }
  }

  return {
    records: idle,

    loadRecords: async () => {
      set({ records: loading })
      try {
        const data = await getMyRecords()
        set({ records: { status: 'success', data } })
      } catch (error) {
        set({ records: { status: 'error', error: getErrorMessage(error) } })
      }
    },

    ensureLoaded: () => {
      if (get().records.status === 'idle') {
        get().loadRecords()
      }
    },

    joinCourse: async (courseId) => {
      const record = await createRecord(courseId)
      updateRecords((records) => [...records, record])
    },

    cancelRecord: async (id) => {
      await deleteRecord(id)
      updateRecords((records) => records.filter((record) => record.id !== id))
    },
  }
})

export const selectRecordByCourse = (courseId: string) => (state: RecordsState) =>
  state.records.status === 'success'
    ? state.records.data.find((record) => record.course.id === courseId)
    : undefined

useAuthStore.subscribe((state, prev) => {
  if (prev.user && !state.user) {
    useRecordsStore.setState({ records: idle })
  }
})
