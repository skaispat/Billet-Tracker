"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Google Sheet details for login
  const SHEET_ID = "1Bu9dVCYBMwCBRwwtdxcNjOGVCtF6gIet_W82dwCq1B4";
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxWc0X9zgyqgtfHfIlTplxFHEq2pe5IV46Ng0iJtzXvPlotLdQCyce92qd7iflmEuZTQ/exec";

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

  // Function to parse allowed pages from Column D
  const parseAllowedPages = (allowedPagesString, userRole) => {
    // If user role is "admin", give access to all pages
    if (userRole && userRole.toLowerCase() === "admin") {
      return {
        dashboard: true,
        production: true,
        receiving: true,
        labTesting: true,
        tmtPlanning: true,
      }
    }

    // For non-admin users, parse Column D strictly - no defaults
    if (!allowedPagesString || allowedPagesString.trim() === "") {
      // No pages allowed if Column D is empty
      return {
        dashboard: false,
        production: false,
        receiving: false,
        labTesting: false,
        tmtPlanning: false,
      }
    }

    // Convert the comma-separated string to lowercase for comparison
    const allowedPages = allowedPagesString.toLowerCase().split(',').map(page => page.trim())
    
    // Only grant permissions for pages explicitly listed in Column D
    return {
      dashboard: allowedPages.includes('dashboard'),
      production: allowedPages.includes('billet production'),
      receiving: allowedPages.includes('billet receiving'),
      labTesting: allowedPages.includes('lab testing'),
      tmtPlanning: allowedPages.includes('tmt planning'),
    }
  }

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
          // Parse allowed pages from Column D, considering admin role
          const allowedPagesString = foundUser[3] || ""; // Column D (index 3)
          const userRole = foundUser[2] || "user";       // Column C (index 2)
          const permissions = parseAllowedPages(allowedPagesString, userRole);
          
          // Construct user object
          const userObject = {
            username: foundUser[0],        // Column A
            role: userRole,                // Column C
            name: foundUser[0],            // Use username as display name
            allowedPages: allowedPagesString, // Store the original string for reference
            permissions: permissions
          };

          setUser(userObject)
          setIsAuthenticated(true)
          
          // Store user in localStorage
          localStorage.setItem("user", JSON.stringify(userObject))
          
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

  // Check if user has permission for a specific page/feature
  const hasPermission = (permission) => {
    if (!user) return false
    if (!user.permissions) return false
    return user.permissions[permission] || false
  }

  // Get the first allowed page for redirection after login
  const getDefaultPage = () => {
    if (!user || !user.permissions) return "/login"
    
    // For admin users, always go to dashboard first
    if (user.role && user.role.toLowerCase() === "admin") {
      return "/dashboard"
    }
    
    // For regular users, get the first page from their allowedPages string in Column D
    if (user.allowedPages && user.allowedPages.trim() !== "") {
      const allowedPages = user.allowedPages.toLowerCase().split(',').map(page => page.trim())
      
      // Check each page in the order they appear in Column D
      for (const page of allowedPages) {
        if (page === 'dashboard') return "/dashboard"
        if (page === 'billet production') return "/workflow/entry"
        if (page === 'billet receiving') return "/workflow/receiving"
        if (page === 'lab testing') return "/workflow/lab-testing"
        if (page === 'tmt planning') return "/tmt-planning"
      }
    }
    
    // If user has no permissions, redirect back to login
    return "/login"
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
        getDefaultPage,
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