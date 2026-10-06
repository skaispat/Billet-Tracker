"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

// Default login: system admin with access to every page
const DEFAULT_USERNAME = "admin"
const DEFAULT_PASSWORD = "admin123"

const ADMIN_USER = {
  username: DEFAULT_USERNAME,
  role: "admin",
  name: "System Admin",
  allowedPages: "dashboard, billet production, billet receiving, lab testing, tmt planning",
  permissions: {
    dashboard: true,
    production: true,
    receiving: true,
    labTesting: true,
    tmtPlanning: true,
  },
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser?.username === DEFAULT_USERNAME) {
            setUser(ADMIN_USER)
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("user")
          }
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem("user")
        }
      }
      // Short delay to ensure smooth transition
      await new Promise((resolve) => setTimeout(resolve, 100))
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    setIsLoading(true)

    const isValid =
      username.trim().toLowerCase() === DEFAULT_USERNAME && password === DEFAULT_PASSWORD

    if (isValid) {
      setUser(ADMIN_USER)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(ADMIN_USER))
    }

    setIsLoading(false)
    return isValid
  }

  const logout = async () => {
    setIsLoading(true)

    // Add a small delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 300))

    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")

    setIsLoading(false)
  }

  // Admin has access to every page/feature
  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === "admin") return true
    return user.permissions?.[permission] || false
  }

  const getDefaultPage = () => {
    if (!user) return "/"
    return "/dashboard"
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        hasPermission,
        getDefaultPage,
        isLoading,
      }}
    >
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
