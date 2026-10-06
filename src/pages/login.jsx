"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context.jsx"
import LoginForm from "../components/login-form.jsx"

export default function LoginPage() {
  const { isAuthenticated, getDefaultPage } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      // Navigate to the user's first allowed page from Column D
      const defaultPage = getDefaultPage()
      navigate(defaultPage)
    }
  }, [isAuthenticated, navigate, getDefaultPage])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Billet Tracking System v1.0</p>
          <p>© 2023 All rights reserved</p>
        </div>
      </div>
    </div>
  )
}