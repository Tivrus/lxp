import { create } from 'zustand'
import { setSessionCallbacks } from '../api/client'
import { getMe, login as loginRequest } from '../api/endpoints'
import { tokenStorage } from '../api/tokenStorage'
import type { User } from '../api/types'

const SESSION_EXPIRED = 'Сессия истекла, войдите снова'

type AuthState = {
  user: User | null
  isRestoring: boolean
  refreshCount: number
  message: string
  login: (username: string, password: string) => Promise<void>
  logout: (message?: string) => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isRestoring: tokenStorage.getRefresh() !== null,
  refreshCount: 0,
  message: '',

  login: async (username, password) => {
    const tokens = await loginRequest(username, password)
    tokenStorage.save(tokens)
    const user = await getMe()
    set({ user, message: '', refreshCount: 0 })
  },

  logout: (message = '') => {
    tokenStorage.clear()
    set({ user: null, message, refreshCount: 0 })
  },

  restoreSession: async () => {
    if (!tokenStorage.getRefresh()) {
      set({ isRestoring: false })
      return
    }

    try {
      const user = await getMe()
      set({ user })
    } catch {
      get().logout(SESSION_EXPIRED)
    } finally {
      set({ isRestoring: false })
    }
  },
}))

setSessionCallbacks(
  () => useAuthStore.setState((state) => ({ refreshCount: state.refreshCount + 1 })),
  () => useAuthStore.getState().logout(SESSION_EXPIRED),
)
