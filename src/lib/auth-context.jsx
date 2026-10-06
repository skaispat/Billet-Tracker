"use client"

import { createContext, useContext } from "react"

const AuthContext = createContext(undefined)

// Login is disabled: everyone is signed in as the default system admin
// with access to every page.
const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123",
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
  const login = async () => true
  const logout = async () => {}
  const hasPermission = () => true
  const getDefaultPage = () => "/dashboard"

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: true,
        user: DEFAULT_ADMIN,
        login,
        logout,
        hasPermission,
        getDefaultPage,
        isLoading: false,
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
