import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { login as loginService } from "@/services/auth"
import { logout as logoutService, getProfile } from "@/services/users"
import type { UserResponse, LoginBody } from "@/lib/types"

export interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  login: (credentials: LoginBody) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [isReady, setIsReady] = useState(false)

  // Only run the query if we have a token
  const hasToken = !!localStorage.getItem("accessToken")

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getProfile,
    enabled: hasToken,
    retry: false,
  })

  // We are loading if we have a token and the query is still fetching
  const isLoading = hasToken && isUserLoading

  useEffect(() => {
    // A small effect to prevent hydration mismatch / early rendering issues
    setIsReady(true)
  }, [])

  const login = useCallback(async (credentials: LoginBody) => {
    const authData = await loginService(credentials)
    // tokens are set in localStorage by the service
    // Manually set the query data so we don't have to refetch immediately
    queryClient.setQueryData(["currentUser"], authData.user)
  }, [queryClient])

  const logout = useCallback(async () => {
    try {
      await logoutService()
    } catch (e) {
      // ignore errors on logout, just clear local state
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      queryClient.clear()
      window.location.href = "/login"
    }
  }, [queryClient])

  if (!isReady) return null

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
