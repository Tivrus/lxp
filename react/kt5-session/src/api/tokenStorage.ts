import type { UserToken } from './types'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export type TokenKey = typeof ACCESS_KEY | typeof REFRESH_KEY

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  save(tokens: UserToken) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
