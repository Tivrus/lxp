import { create } from 'zustand'
import { isNetworkError, setSessionExpiredHandler } from '../api/client'
import { getMe, login as loginRequest } from '../api/endpoints'
import { tokenStorage } from '../api/tokenStorage'
import type { User } from '../api/types'
import { idle, loading, type RequestState } from '../types/request'

const SESSION_EXPIRED = 'Сессия истекла, войдите снова'
const restored = { status: 'success', data: null } as const

interface AuthState {
  user: User | null
  session: RequestState<null>
  notice: string
  login: (username: string, password: string) => Promise<void>
  logout: (notice?: string) => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: idle,
  notice: '',

  login: async (username, password) => {
    const tokens = await loginRequest(username, password)
    tokenStorage.save(tokens)
    const user = await getMe()
    set({ user, notice: '' })
  },

  logout: (notice = '') => {
    tokenStorage.clear()
    set({ user: null, notice })
  },

  restoreSession: async () => {
    if (!tokenStorage.getRefresh()) {
      set({ session: restored })
      return
    }

    set({ session: loading })
    try {
      const user = await getMe()
      set({ user, session: restored })
    } catch (error) {
      if (isNetworkError(error)) {
        set({ session: { status: 'error', error: 'Сервер недоступен, не удалось проверить сессию' } })
        return
      }
      get().logout(SESSION_EXPIRED)
      set({ session: restored })
    }
  },
}))

setSessionExpiredHandler(() => useAuthStore.getState().logout(SESSION_EXPIRED))
