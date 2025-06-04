"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
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
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.dropdown-menu')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative dropdown-menu">
      <div onClick={handleClick}>{trigger}</div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 animate-fadeIn">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  )
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

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, hasPermission } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  // Filter navigation items based on user permissions
  const allowedNavigation = navigation.filter(item => {
    // If user is admin, show all navigation items
    if (user?.role && user.role.toLowerCase() === "admin") {
      return true
    }
    // For regular users, check permissions
    return hasPermission(item.permission)
  })

  // Function to handle logo click - navigate to first available page
  const handleLogoClick = () => {
    if (user?.role && user.role.toLowerCase() === "admin") {
      navigate("/dashboard")
    } else if (allowedNavigation.length > 0) {
      navigate(allowedNavigation[0].href)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-900 bg-opacity-95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and Brand Name */}
        <div className="flex items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleLogoClick}
          >
            <Factory className="h-6 w-6 text-cyan-600" />
            <span className="font-bold text-white truncate max-w-[180px] sm:max-w-none">
              Billet Production System
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-1 px-4">
          {allowedNavigation.length > 0 ? (
            <div className="flex items-center justify-center space-x-1 lg:space-x-6 text-sm font-medium">
              {allowedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "transition-colors hover:text-gray-300 px-3 py-2 rounded-md",
                    isActive(item.href) 
                      ? "text-white font-semibold bg-gray-800 bg-opacity-50" 
                      : "text-gray-400 hover:bg-gray-800 hover:bg-opacity-30",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="whitespace-nowrap">{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-500">
              <span>No pages available - contact administrator</span>
            </div>
          )}
        </nav>

        {/* Right Side User Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <ModeToggle />

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800 md:hidden transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <DropdownMenu
            trigger={
              <button className="relative h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </button>
            }
          >
            <div className="px-4 py-3 text-sm">
              <p className="font-medium text-white">{user?.name || "User"}</p>
              <p className="text-gray-400 text-xs">{user?.username || "username"}</p>
              <p className="text-gray-500 text-xs mt-1">Role: {user?.role || "user"}</p>
            </div>
            <hr className="my-1 border-gray-700" />
            <button
              onClick={() => logout()}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu - Animated slide down */}
      <div
        className={cn(
          "md:hidden bg-gray-900 border-b border-gray-700 overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen 
            ? "max-h-[500px] opacity-100" 
            : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-2 space-y-1">
          {allowedNavigation.length > 0 ? (
            allowedNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center py-3 px-4 rounded-md transition-colors",
                  isActive(item.href) 
                    ? "bg-gray-800 text-white font-medium" 
                    : "text-gray-300 hover:bg-gray-800 hover:bg-opacity-70",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-3 px-4 text-gray-500 text-sm text-center">
              No pages available - contact administrator
            </div>
          )}
        </div>
      </div>
    </header>
  )
}