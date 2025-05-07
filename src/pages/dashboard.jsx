"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"

// Icons
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

const BarChart3 = ({ className }) => (
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
    <path d="M3 3v18h18"></path>
    <path d="M18 17V9"></path>
    <path d="M13 17V5"></path>
    <path d="M8 17v-3"></path>
  </svg>
)

const Clock = ({ className }) => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const CheckCircle2 = ({ className }) => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
)

const AlertTriangle = ({ className }) => (
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
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
)

// Badge component
const Badge = ({ children, className }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

// Skeleton component
const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

// Progress component
const Progress = ({ value, className }) => {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-teal-600 dark:bg-teal-500 h-full transition-all duration-300 ease-in-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const {
    records,
    receivingRecords,
    labTestingRecords,
    refreshData,
    getPendingBilletRecords,
    getPendingReceivingRecords,
    getPendingLabTestingRecords,
  } = useBilletData()

  const { isAuthenticated, hasPermission, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [timeRange, setTimeRange] = useState("all") // "today", "week", "month", "all"

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
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    if (isMounted && !authLoading) {
      fetchData()
    }
  }, [isMounted, authLoading, refreshData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  // Filter records based on time range
  const filterRecordsByTime = (records) => {
    if (timeRange === "all") return records

    const now = new Date()
    const cutoff = new Date()

    if (timeRange === "today") {
      cutoff.setHours(0, 0, 0, 0)
    } else if (timeRange === "week") {
      cutoff.setDate(now.getDate() - 7)
    } else if (timeRange === "month") {
      cutoff.setMonth(now.getMonth() - 1)
    }

    return records.filter((record) => new Date(record.timestamp) >= cutoff)
  }

  // Get filtered records
  const filteredProduction = filterRecordsByTime(records)
  const filteredReceiving = filterRecordsByTime(receivingRecords)
  const filteredLabTesting = filterRecordsByTime(labTestingRecords)

  // If not mounted yet or auth is loading, show a skeleton
  if (!isMounted || authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // Get pending counts
  const pendingBillets = getPendingBilletRecords().length
  const pendingReceiving = getPendingReceivingRecords().length
  const pendingLabTesting = getPendingLabTestingRecords().length

  // Calculate totals
  const totalProduction = filteredProduction.length
  const totalReceiving = filteredReceiving.length
  const totalLabTests = filteredLabTesting.length

  // Calculate completion percentages
  const totalRecords = totalProduction + totalReceiving + totalLabTests
  const completedRecords = totalLabTests
  const completionPercentage = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0

  // Calculate total production volume
  const totalProductionVolume = filteredProduction.reduce((sum, record) => sum + (Number(record.productionCmd) || 0), 0)
  const totalScrapVolume = filteredProduction.reduce((sum, record) => sum + (Number(record.scrapCmd) || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">Production Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor and analyze your production records</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center space-x-2 mr-2">
              <label htmlFor="timeRange" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Time Range:
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-2 py-1"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-cyan-200 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-900/30 rounded-md flex items-center"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 overflow-hidden">
            <div className="p-4 border-b border-cyan-100 dark:border-cyan-800">
              <h3 className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center font-medium">
                <BarChart3 className="mr-2 h-5 w-5" />
                Production Summary
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{totalProduction}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total records</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Production Volume:</span>
                      <span className="font-medium">{totalProductionVolume.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Scrap Volume:</span>
                      <span className="font-medium">{totalScrapVolume.toFixed(2)} MT</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-teal-200 dark:border-teal-800 overflow-hidden">
            <div className="p-4 border-b border-teal-100 dark:border-teal-800">
              <h3 className="text-lg text-teal-700 dark:text-teal-400 flex items-center font-medium">
                <Clock className="mr-2 h-5 w-5" />
                Pending Tasks
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{pendingBillets + pendingReceiving + pendingLabTesting}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total pending tasks</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production:</span>
                      <Badge className="bg-yellow-500 text-white">{pendingBillets}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Receiving:</span>
                      <Badge className="bg-yellow-500 text-white">{pendingReceiving}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lab Testing:</span>
                      <Badge className="bg-yellow-500 text-white">{pendingLabTesting}</Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-emerald-200 dark:border-emerald-800 overflow-hidden">
            <div className="p-4 border-b border-emerald-100 dark:border-emerald-800">
              <h3 className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center font-medium">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Workflow Progress
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{completionPercentage}%</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Workflow completion</p>
                  <div className="mt-4">
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {completedRecords} of {totalRecords} records completed
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-amber-200 dark:border-amber-800 overflow-hidden">
            <div className="p-4 border-b border-amber-100 dark:border-amber-800">
              <h3 className="text-lg text-amber-700 dark:text-amber-400 flex items-center font-medium">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Action Required
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="space-y-2">
                    {pendingBillets > 0 && (
                      <Link to="/workflow/entry">
                        <button className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex justify-between items-center">
                          <span>Production Entry</span>
                          <Badge className="bg-white text-amber-700 ml-2">{pendingBillets}</Badge>
                        </button>
                      </Link>
                    )}
                    {pendingReceiving > 0 && (
                      <Link to="/workflow/receiving">
                        <button className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex justify-between items-center">
                          <span>Receiving</span>
                          <Badge className="bg-white text-amber-700 ml-2">{pendingReceiving}</Badge>
                        </button>
                      </Link>
                    )}
                    {pendingLabTesting > 0 && (
                      <Link to="/workflow/lab-testing">
                        <button className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex justify-between items-center">
                          <span>Lab Testing</span>
                          <Badge className="bg-white text-amber-700 ml-2">{pendingLabTesting}</Badge>
                        </button>
                      </Link>
                    )}
                    {pendingBillets === 0 && pendingReceiving === 0 && pendingLabTesting === 0 && (
                      <div className="text-center p-2 text-gray-500 dark:text-gray-400">
                        No pending tasks. All workflows are up to date!
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 mt-6">
          <div className="p-4 border-b border-cyan-100 dark:border-cyan-800">
            <h3 className="text-lg text-cyan-700 dark:text-cyan-400 font-medium">Production Workflow Status</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track billets through the production pipeline</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center z-10">
                        1
                      </div>
                      <span className="text-sm mt-2">Production</span>
                      <span className="text-xs text-cyan-600 font-bold">{pendingBillets} pending</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center z-10">
                        2
                      </div>
                      <span className="text-sm mt-2">Receiving</span>
                      <span className="text-xs text-teal-600 font-bold">{pendingReceiving} pending</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10">
                        3
                      </div>
                      <span className="text-sm mt-2">Lab Testing</span>
                      <span className="text-xs text-emerald-600 font-bold">{pendingLabTesting} pending</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Production Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800">
            <div className="p-4 border-b border-cyan-100 dark:border-cyan-800">
              <h3 className="text-lg text-cyan-700 dark:text-cyan-400 font-medium">Production Statistics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Key metrics for production performance</p>
            </div>
            <div className="p-6">
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Total Production</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalProductionVolume.toFixed(2)} MT
                      </div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Total Scrap</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalScrapVolume.toFixed(2)} MT
                      </div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Efficiency Rate</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalProductionVolume + totalScrapVolume > 0
                          ? ((totalProductionVolume / (totalProductionVolume + totalScrapVolume)) * 100).toFixed(1)
                          : "0"}
                        %
                      </div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Production</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalProduction > 0 ? (totalProductionVolume / totalProduction).toFixed(2) : "0"} MT
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800">
            <div className="p-4 border-b border-cyan-100 dark:border-cyan-800">
              <h3 className="text-lg text-cyan-700 dark:text-cyan-400 font-medium">Quick Actions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Access common tasks and workflows</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {hasPermission("production") && (
                  <Link to="/workflow/entry">
                    <button className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md flex items-center">
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
                        <path d="M17 18h1"></path>
                        <path d="M12 18h1"></path>
                        <path d="M7 18h1"></path>
                      </svg>
                      New Production Entry
                    </button>
                  </Link>
                )}
                {hasPermission("receiving") && (
                  <Link to="/workflow/receiving">
                    <button className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center">
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
                        <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"></path>
                        <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"></path>
                      </svg>
                      Billet Receiving
                    </button>
                  </Link>
                )}
                {hasPermission("labTesting") && (
                  <Link to="/workflow/lab-testing">
                    <button className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center">
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 2v7.31"></path>
                        <path d="M14 9.3V2"></path>
                        <path d="M8.5 2h7"></path>
                        <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                        <path d="M5.58 16.5h12.85"></path>
                      </svg>
                      Lab Testing
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
