"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Remove initial users as we'll now fetch from Google Sheet
const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Google Sheet details for login
  const SHEET_ID = "1CGfnqtgWTWBNRgX2RvwRrPqR8rTKUae6moVDfWMH88I";
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwC2k1f5A143OSGeZBa4nb5AyfOX38V5boR2v6U2Ezd-VrResg4xVp6Moizd0U0GWJ-/exec";

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

    try {
      // Fetch login data from Google Sheet
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Login`;
      
      const response = await fetch(sheetUrl);
      const textData = await response.text();
      
      // Parse the response
      const jsonText = textData.substring(
        textData.indexOf('{'),
        textData.lastIndexOf('}') + 1
      );
      
      const parsedData = JSON.parse(jsonText);
      
      if (parsedData && parsedData.table) {
        // Get the column headers from the first row
        const headers = parsedData.table.cols.map(col => col.label);
        
        // Convert the table data to rows
        const rows = parsedData.table.rows.map(row => {
          return row.c.map(cell => {
            return cell && cell.v !== null ? cell.v : "";
          });
        });
        
        // Find the matching user
        const foundUser = rows.find(row => 
          row[0] && row[0].toLowerCase() === username.toLowerCase() && 
          row[1] === password
        );
        
        if (foundUser) {
          // Construct user object
          const userObject = {
            username: foundUser[0],
            role: foundUser[2] || "viewer", // Default to viewer if no role specified
            name: foundUser[0], // Use username as name if no specific name column
            permissions: {
              dashboard: true,
              production: foundUser[2] !== "viewer",
              receiving: foundUser[2] !== "viewer",
              labTesting: foundUser[2] === "admin" || foundUser[2] === "supervisor",
              tmtPlanning: foundUser[2] === "admin" || foundUser[2] === "supervisor",
            }
          };

          setUser(userObject)
          setIsAuthenticated(true)
          
          // Store user in localStorage (without any sensitive info)
          const { permissions, ...userToStore } = userObject
          localStorage.setItem("user", JSON.stringify(userToStore))
          
          setIsLoading(false)
          return true
        }
      }

      // If no user found
      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
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

  // Placeholder functions for potential future use
  const addUser = () => {
    console.warn("Adding users directly is not supported. Manage users in the Google Sheet.")
  }

  const updateUser = () => {
    console.warn("Updating users directly is not supported. Manage users in the Google Sheet.")
  }

  const deleteUser = () => {
    console.warn("Deleting users directly is not supported. Manage users in the Google Sheet.")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        hasPermission,
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