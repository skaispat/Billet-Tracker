"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"

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
    <path d="M10 2v7.31"></path>
    <path d="M14 9.3V2"></path>
    <path d="M8.5 2h7"></path>
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
    <path d="M5.58 16.5h12.85"></path>
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

// Skeleton component
const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export default function WorkflowPage() {
  const { hasPermission, isLoading: authLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If not mounted yet or auth is loading, show a skeleton
  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Define workflow steps with their permission requirements
  const workflowSteps = [
    {
      name: "Billet Production",
      description: "Create new billet production records",
      href: "/workflow/entry",
      permission: "production",
      icon: <Factory className="h-8 w-8" />,
      color: "bg-cyan-600 hover:bg-cyan-700",
    },
    {
      name: "Billet Receiving",
      description: "Manage the receiving process for produced billets",
      href: "/workflow/receiving",
      permission: "receiving",
      icon: <Layers className="h-8 w-8" />,
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      name: "Lab Testing",
      description: "Record lab testing results for received billets",
      href: "/workflow/lab-testing",
      permission: "labTesting",
      icon: <Flask className="h-8 w-8" />,
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      name: "TMT Planning",
      description: "Plan TMT processes for tested billets",
      href: "/workflow/tmt-planning",
      permission: "tmtPlanning",
      icon: <ClipboardList className="h-8 w-8" />,
      color: "bg-amber-600 hover:bg-amber-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">Workflow Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage the complete billet production workflow from start to finish
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflowSteps.map((step) => {
            // Only show workflow steps the user has permission to access
            if (!hasPermission(step.permission)) {
              return null
            }

            return (
              <Link key={step.name} to={step.href}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className={`p-4 text-white ${step.color}`}>
                    <div className="flex items-center">
                      {step.icon}
                      <h3 className="text-xl font-bold ml-3">{step.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                    <div className="mt-4 flex justify-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                        Access Workflow
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Workflow Process Diagram */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 p-6">
          <h2 className="text-xl font-bold text-cyan-700 dark:text-cyan-400 mb-4">Workflow Process</h2>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center z-10">
                  <Factory className="h-6 w-6" />
                </div>
                <span className="text-sm mt-2 text-center">Production</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center z-10">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="text-sm mt-2 text-center">Receiving</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10">
                  <Flask className="h-6 w-6" />
                </div>
                <span className="text-sm mt-2 text-center">Lab Testing</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center z-10">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <span className="text-sm mt-2 text-center">TMT Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
