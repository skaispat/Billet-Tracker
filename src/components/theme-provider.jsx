"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({ theme: "system", setTheme: () => null })

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
  const [theme, setTheme] = useState(() => {
    // Try to read from localStorage first
    const storedTheme = localStorage.getItem(storageKey)
    return storedTheme || defaultTheme
  })

  useEffect(() => {
    // Apply theme to document element
    const root = window.document.documentElement
    
    // First remove both themes to start fresh
    root.classList.remove("light", "dark")

    // Handle system preference
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      return
    }

    // Otherwise add selected theme
    root.classList.add(theme)
  }, [theme])

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}