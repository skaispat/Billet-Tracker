"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"
import { useToast } from "../components/ui/toaster.jsx"

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

const RefreshCw = ({ className }) => (
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
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </svg>
)

// Skeleton component
const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export default function TmtProductionPage() {
  const { refreshData, getHistoryTmtPlanningRecords } = useBilletData()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [tmtPlans, setTmtPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Safely get records after component is mounted
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await refreshData()
        setTmtPlans(getHistoryTmtPlanningRecords().filter((plan) => plan.status === "completed"))
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    if (isMounted && !authLoading) {
      fetchData()
    }
  }, [isMounted, authLoading, getHistoryTmtPlanningRecords, refreshData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setTmtPlans(getHistoryTmtPlanningRecords().filter((plan) => plan.status === "completed"))
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

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
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Check if user has permission to access this page
  if (!hasPermission("tmtPlanning")) {
    navigate("/dashboard")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 flex items-center">
              <Factory className="mr-2 h-8 w-8" />
              TMT Production
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage TMT production based on approved plans</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded-md flex items-center"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* TMT Production Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-purple-200 dark:border-purple-800 mb-6">
          <div className="p-4 border-b border-purple-100 dark:border-purple-800">
            <h2 className="text-xl font-medium text-purple-700 dark:text-purple-400">TMT Production Schedule</h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : tmtPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No TMT production plans found.</p>
                <p className="mt-2">Complete TMT planning first to see production schedule here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 font-medium">Billet ID</th>
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium">Quantity</th>
                      <th className="px-4 py-2 font-medium">Production Date</th>
                      <th className="px-4 py-2 font-medium">Person In Charge</th>
                      <th className="px-4 py-2 font-medium">Supervisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tmtPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="px-4 py-2 font-mono text-xs">{plan.billetId}</td>
                        <td className="px-4 py-2">{plan.productName}</td>
                        <td className="px-4 py-2">{plan.quantity}</td>
                        <td className="px-4 py-2">{plan.dateOfProduction}</td>
                        <td className="px-4 py-2">{plan.personName}</td>
                        <td className="px-4 py-2">{plan.supervisorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Production Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-purple-200 dark:border-purple-800">
          <div className="p-4 border-b border-purple-100 dark:border-purple-800">
            <h2 className="text-xl font-medium text-purple-700 dark:text-purple-400">Production Status</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>TMT Production module is under development.</p>
              <p className="mt-2">This feature will be available in the next release.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
