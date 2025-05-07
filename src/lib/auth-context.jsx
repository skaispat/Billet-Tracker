"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Define user roles and their permissions
const rolePermissions = {
  admin: ["dashboard", "production", "receiving", "labTesting", "tmtPlanning"],
  supervisor: ["dashboard", "production", "receiving", "labTesting", "tmtPlanning"],
  operator: ["production", "receiving", "labTesting", "tmtPlanning"],
  viewer: ["dashboard"],
}

const AuthContext = createContext(undefined)

// Initial users with default permissions based on role
const initialUsers = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Administrator",
    permissions: {
      dashboard: true,
      production: true,
      receiving: true,
      labTesting: true,
      tmtPlanning: true,
    },
  },
  {
    id: "2",
    username: "operator",
    password: "op123",
    role: "operator",
    name: "Default Operator",
    permissions: {
      dashboard: true,
      production: true,
      receiving: true,
      labTesting: false,
      tmtPlanning: false,
    },
  },
]

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(initialUsers)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
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

    // Add a small delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real app, this would be an API call
    const foundUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password)

    if (foundUser) {
      setUser(foundUser)
      setIsAuthenticated(true)
      // Store user in localStorage (except password)
      const { password: _, ...userWithoutPassword } = foundUser
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
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

  // Fix: Ensure we safely check for permissions
  const hasPermission = (permission) => {
    if (!user) return false
    if (!user.permissions) return false
    return user.permissions[permission] || false
  }

  // Create default permissions based on role
  const getDefaultPermissions = (role) => {
    return {
      dashboard: role !== "viewer" ? true : true, // Everyone gets dashboard
      production: role !== "viewer",
      receiving: role !== "viewer",
      labTesting: role === "admin" || role === "supervisor",
      tmtPlanning: role === "admin" || role === "supervisor",
    }
  }

  const addUser = (newUser) => {
    const id = (users.length + 1).toString()

    // If permissions aren't provided, use default based on role
    const permissions = newUser.permissions || getDefaultPermissions(newUser.role)

    setUsers([...users, { ...newUser, id, permissions }])
  }

  const updateUser = (id, updates) => {
    // If role is updated but permissions aren't, update permissions based on new role
    let updatedPermissions = updates.permissions
    if (updates.role && !updates.permissions) {
      const currentUser = users.find((u) => u.id === id)
      if (currentUser && currentUser.role !== updates.role) {
        updatedPermissions = getDefaultPermissions(updates.role)
      }
    }

    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            ...updates,
            permissions: updatedPermissions || user.permissions,
          }
        : user,
    )

    setUsers(updatedUsers)

    // If the updated user is the current user, update the current user state
    if (user && user.id === id) {
      setUser({
        ...user,
        ...updates,
        permissions: updatedPermissions || user.permissions,
      })

      // Update localStorage
      const { password: _, ...userWithoutPassword } = {
        ...user,
        ...updates,
        permissions: updatedPermissions || user.permissions,
      }
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
    }
  }

  const deleteUser = (id) => {
    // Prevent deleting the last admin
    const remainingAdmins = users.filter((u) => u.role === "admin" && u.id !== id).length
    if (users.find((u) => u.id === id)?.role === "admin" && remainingAdmins === 0) {
      alert("Cannot delete the last admin user")
      return
    }

    setUsers(users.filter((user) => user.id !== id))

    // If the deleted user is the current user, log out
    if (user && user.id === id) {
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        hasPermission,
        users,
        addUser,
        updateUser,
        deleteUser,
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