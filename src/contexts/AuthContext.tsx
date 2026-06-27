import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginUser, registerUser, fetchMe, googleAuth } from '../lib/api'
import type { User, Quota } from '../types/api'

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  quota: Quota | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthResult>
  register: (email: string, password: string) => Promise<AuthResult>
  loginWithGoogle: (googleToken: string) => Promise<AuthResult>
  logout: () => void
  refreshQuota: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('city_planner_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('city_planner_token') || null
  )
  const [quota, setQuota] = useState<Quota | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshQuota = async () => {
    if (!token) return
    try {
      const result = await fetchMe()
      setQuota({
        monthlyGenerations: result.monthlyGenerations,
        monthlyGenerationsLimit: result.monthlyGenerationsLimit,
        monthlyRegenerations: result.monthlyRegenerations,
        monthlyRegenerationsLimit: result.monthlyRegenerationsLimit,
        daysUntilReset: result.daysUntilReset,
        planTier: result.planTier,
      })
    } catch (err) {
      console.error('Failed to refresh quota:', err)
    }
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)
    try {
      const response = await loginUser(email, password)
      const { token: newToken, user: newUser } = response
      localStorage.setItem('city_planner_token', newToken)
      localStorage.setItem('city_planner_user', JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser as unknown as User)
      await refreshQuota()
      return { success: true }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)
    try {
      const response = await registerUser(email, password)
      const { token: newToken, user: newUser } = response
      localStorage.setItem('city_planner_token', newToken)
      localStorage.setItem('city_planner_user', JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser as unknown as User)
      await refreshQuota()
      return { success: true }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Registration failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (googleToken: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)
    try {
      const response = await googleAuth(googleToken)
      const { token: newToken, user: newUser } = response
      localStorage.setItem('city_planner_token', newToken)
      localStorage.setItem('city_planner_user', JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser as unknown as User)
      await refreshQuota()
      return { success: true }
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Google sign-in failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('city_planner_token')
    localStorage.removeItem('city_planner_user')
    setToken(null)
    setUser(null)
    setQuota(null)
    setError(null)
  }

  useEffect(() => {
    if (token && !quota) refreshQuota()
  }, [token, quota])

  useEffect(() => {
    const handleLogout = () => logout()
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, quota, loading, error, login, register, loginWithGoogle, logout, refreshQuota }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
