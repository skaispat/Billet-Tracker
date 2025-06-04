"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context.jsx"

// Factory icon
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

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  // Combine component's submitting state with auth context loading state
  const isButtonDisabled = isSubmitting || isLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Attempt login with username and password
      const success = await login(username, password)

      if (success) {
        // Show toast
        if (window.toast) {
          window.toast({
            title: "Login successful",
            description: `Welcome back, ${username}!`,
          })
        }
        navigate("/dashboard")
      } else {
        // Show error toast
        if (window.toast) {
          window.toast({
            title: "Login failed",
            description: "Invalid username or password. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      // Show error toast
      if (window.toast) {
        window.toast({
          title: "Login error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md shadow-lg border border-teal-200 rounded-lg overflow-hidden bg-gray-900">
      <div className="space-y-1 bg-gradient-to-r from-teal-800 to-cyan-600 text-white p-6 rounded-t-lg">
        <div className="flex justify-center mb-2">
          <Factory className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-center">Billet Tracking System</h2>
        <p className="text-center text-teal-100">Enter your credentials to access the system</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-6 text-white">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              className="w-full px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isButtonDisabled}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isButtonDisabled}
            />
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            disabled={isButtonDisabled}
          >
            {isButtonDisabled ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  )
}
