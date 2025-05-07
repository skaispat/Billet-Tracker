"use client"

import React from "react"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils.jsx"

// Toast context
const ToastContext = React.createContext({
  toast: () => {},
})

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Toast component
const Toast = ({ title, description, variant = "default", onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow time for exit animation
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-md rounded-lg shadow-lg transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        variant === "destructive"
          ? "bg-red-600 text-white"
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
      )}
    >
      <div className="flex p-4">
        <div className="flex-1">
          {title && <h4 className="font-medium">{title}</h4>}
          {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Toaster component
export const Toaster = () => {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, variant }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Provide the toast function to the app
  useEffect(() => {
    window.toast = toast
  }, [])

  return (
    <>
      <ToastContext.Provider value={{ toast }}>
        {/* This is just a placeholder to provide the context */}
      </ToastContext.Provider>

      {createPortal(
        <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
