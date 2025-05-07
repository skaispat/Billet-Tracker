"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../lib/auth-context.jsx"
import { cn } from "../lib/utils.jsx"
import { useTheme } from "./theme-provider.jsx"

// Icons
const Factory = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
    <path d="M17 18h1"></path>
    <path d="M12 18h1"></path>
    <path d="M7 18h1"></path>
  </svg>
)

const Layers = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
    <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"></path>
    <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"></path>
  </svg>
)

const Flask = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 3h6v2H9z"></path>
    <path d="M5 8h14"></path>
    <path d="M19 8v13H5V8l7-3 7 3Z"></path>
    <path d="M8 14h8"></path>
  </svg>
)

const LayoutDashboard = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="7" height="9" x="3" y="3" rx="1"></rect>
    <rect width="7" height="5" x="14" y="3" rx="1"></rect>
    <rect width="7" height="9" x="14" y="12" rx="1"></rect>
    <rect width="7" height="5" x="3" y="16" rx="1"></rect>
  </svg>
)

const ClipboardList = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <path d="M12 11h4"></path>
    <path d="M12 16h4"></path>
    <path d="M8 11h.01"></path>
    <path d="M8 16h.01"></path>
  </svg>
)

const User = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const LogOut = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" x2="9" y1="12" y2="12"></line>
  </svg>
)

const Moon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
)

const Sun = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
)

// Hamburger Menu Icon
const Menu = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>
)

// ModeToggle component
const ModeToggle = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  )
}

// Dropdown menu component
const DropdownMenu = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".dropdown-menu")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative dropdown-menu">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  )
}

// Skeleton component
const Skeleton = ({ className }) => {
  return <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700 rounded", className)} />
}

export default function Header() {
  const location = useLocation()
  const { isAuthenticated, user, logout, hasPermission, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  // Define navigation links with their permission requirements
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      permission: "dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "Billet Production",
      href: "/workflow/entry",
      permission: "production",
      icon: <Factory className="h-4 w-4" />,
    },
    {
      name: "Billet Receiving",
      href: "/workflow/receiving",
      permission: "receiving",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      name: "Lab Testing",
      href: "/workflow/lab-testing",
      permission: "labTesting",
      icon: <Flask className="h-4 w-4" />,
    },
  ]

  // If not mounted yet, render a skeleton to prevent layout shift
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <div className="mr-6 flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  // If loading auth state, show a loading skeleton
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <div className="mr-6 flex items-center space-x-2">
              <Factory className="h-6 w-6 text-cyan-600/50" />
              <span className="hidden font-bold sm:inline-block text-white">
                Billet Production System
              </span>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item, i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  // If not authenticated, don't render the header
  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo and Brand Name */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Factory className="h-6 w-6 text-cyan-600" />
            <span className="hidden font-bold sm:inline-block text-white">Billet Production System</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center justify-center space-x-6 text-sm font-medium">
            {navigation.map((item) => {
              // Only show navigation items the user has permission to access
              if (!hasPermission(item.permission)) {
                return null
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "transition-colors hover:text-gray-600 dark:hover:text-gray-300",
                    isActive(item.href)
                      ? "text-gray-900 dark:text-white font-semibold"
                      : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  <div className="flex items-center gap-1">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Right Side User Controls */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Mobile Menu Button */}
          <button 
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <DropdownMenu
            trigger={
              <button className="relative h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </button>
            }
          >
            <div className="px-4 py-3 text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.username}</p>
            </div>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => logout()}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => {
              // Only show navigation items the user has permission to access
              if (!hasPermission(item.permission)) {
                return null
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md transition-colors",
                    isActive(item.href)
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}