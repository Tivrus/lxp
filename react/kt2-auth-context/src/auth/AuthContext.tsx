import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'auth:user'

export interface User {
  id: string
  name: string
}

interface AuthContextValue {
  user: User | null
  login: (name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as User
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    setUser(readStoredUser())
    setIsRestoring(false)
  }, [])

  const login = (name: string) => {
    const nextUser: User = { id: crypto.randomUUID(), name: name.trim() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  if (isRestoring) {
    return <p>Загрузка...</p>
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
