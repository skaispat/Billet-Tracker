"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"
import { cn, formatDate } from "../lib/utils.jsx"
import { useToast } from "../components/ui/toaster.jsx"

// Icons
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

const XCircle = ({ className }) => (
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
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>
)

const X = ({ className }) => (
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
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
)

// Badge component
const Badge = ({ children, variant = "default", className }) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// Skeleton component
const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

// Dialog component
const Dialog = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export default function TmtPlanningPage() {
  const {
    addTmtPlanningRecord,
    getPendingTmtPlanningRecords,
    getHistoryTmtPlanningRecords,
    updateTmtPlanningRecord,
    refreshData,
    getRecordsByBilletId,
  } = useBilletData()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [pendingRecords, setPendingRecords] = useState([])
  const [historyRecords, setHistoryRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBilletId, setSelectedBilletId] = useState("")
  const [formData, setFormData] = useState({
    billetId: "",
    personName: "",
    productName: "",
    quantity: "",
    supervisorName: "",
    dateOfProduction: "",
    remarks: "",
  })

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
        setPendingRecords(getPendingTmtPlanningRecords())
        setHistoryRecords(getHistoryTmtPlanningRecords())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    if (isMounted && !authLoading) {
      fetchData()
    }
  }, [isMounted, authLoading, getPendingTmtPlanningRecords, getHistoryTmtPlanningRecords, refreshData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setPendingRecords(getPendingTmtPlanningRecords())
    setHistoryRecords(getHistoryTmtPlanningRecords())
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openDialog = (billetId) => {
    setSelectedBilletId(billetId)
    setFormData({
      billetId: billetId,
      personName: "",
      productName: "",
      quantity: "",
      supervisorName: "",
      dateOfProduction: "",
      remarks: "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.personName ||
      !formData.productName ||
      !formData.quantity ||
      !formData.supervisorName ||
      !formData.dateOfProduction
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Create new record
    const newRecord = {
      ...formData,
      quantity: Number.parseInt(formData.quantity, 10),
    }

    addTmtPlanningRecord(newRecord)

    // Show success toast
    toast({
      title: "Success",
      description: "TMT planning record created successfully.",
    })

    // Reset form and close dialog
    setFormData({
      billetId: "",
      personName: "",
      productName: "",
      quantity: "",
      supervisorName: "",
      dateOfProduction: "",
      remarks: "",
    })
    setIsDialogOpen(false)

    // Refresh data
    setPendingRecords(getPendingTmtPlanningRecords())
    setHistoryRecords(getHistoryTmtPlanningRecords())
  }

  const handleComplete = (id) => {
    updateTmtPlanningRecord(id, { status: "completed" })
    setPendingRecords(getPendingTmtPlanningRecords())
    setHistoryRecords(getHistoryTmtPlanningRecords())

    toast({
      title: "Success",
      description: "TMT planning record marked as completed.",
    })
  }

  const handleReject = (id) => {
    updateTmtPlanningRecord(id, { status: "rejected" })
    setPendingRecords(getPendingTmtPlanningRecords())
    setHistoryRecords(getHistoryTmtPlanningRecords())

    toast({
      title: "Record Rejected",
      description: "TMT planning record has been rejected.",
      variant: "destructive",
    })
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
            <h1 className="text-3xl font-bold text-amber-700 dark:text-amber-400 flex items-center">
              <ClipboardList className="mr-2 h-8 w-8" />
              TMT Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Plan TMT processes for tested billets</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30 rounded-md flex items-center"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Pending Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-amber-200 dark:border-amber-800 mb-6">
          <div className="p-4 border-b border-amber-100 dark:border-amber-800">
            <h2 className="text-xl font-medium text-amber-700 dark:text-amber-400 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Pending TMT Planning
            </h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : pendingRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No pending TMT planning records found.</p>
                <p className="mt-2">Complete lab testing first to see records here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 font-medium">Billet ID</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="px-4 py-2 font-mono text-xs">{record.billetId}</td>
                        <td className="px-4 py-2">
                          <Badge variant="warning">Pending</Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openDialog(record.billetId)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs"
                            >
                              Plan
                            </button>
                            {record.status === "pending" && !record.id.startsWith("pending-") && (
                              <>
                                <button
                                  onClick={() => handleComplete(record.id)}
                                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400"
                                  title="Mark as Completed"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(record.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* History Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-amber-200 dark:border-amber-800">
          <div className="p-4 border-b border-amber-100 dark:border-amber-800">
            <h2 className="text-xl font-medium text-amber-700 dark:text-amber-400 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              TMT Planning History
            </h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No TMT planning history records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 font-medium">Billet ID</th>
                      <th className="px-4 py-2 font-medium">Person Name</th>
                      <th className="px-4 py-2 font-medium">Product</th>
                      <th className="px-4 py-2 font-medium">Quantity</th>
                      <th className="px-4 py-2 font-medium">Production Date</th>
                      <th className="px-4 py-2 font-medium">Timestamp</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="px-4 py-2 font-mono text-xs">{record.billetId}</td>
                        <td className="px-4 py-2">{record.personName}</td>
                        <td className="px-4 py-2">{record.productName}</td>
                        <td className="px-4 py-2">{record.quantity}</td>
                        <td className="px-4 py-2">{record.dateOfProduction}</td>
                        <td className="px-4 py-2">{formatDate(record.timestamp)}</td>
                        <td className="px-4 py-2">
                          <Badge variant={record.status === "completed" ? "success" : "danger"} className="capitalize">
                            {record.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Create TMT Plan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="billetId" className="block text-sm font-medium mb-1">
              Billet ID
            </label>
            <input
              id="billetId"
              name="billetId"
              value={formData.billetId}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
              readOnly
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="personName" className="block text-sm font-medium mb-1">
                Person Name *
              </label>
              <input
                id="personName"
                name="personName"
                value={formData.personName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                placeholder="Enter person name"
                required
              />
            </div>
            <div>
              <label htmlFor="supervisorName" className="block text-sm font-medium mb-1">
                Supervisor Name *
              </label>
              <input
                id="supervisorName"
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                placeholder="Enter supervisor name"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium mb-1">
              Product Name *
            </label>
            <input
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantity *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                placeholder="Enter quantity"
                required
              />
            </div>
            <div>
              <label htmlFor="dateOfProduction" className="block text-sm font-medium mb-1">
                Production Date *
              </label>
              <input
                id="dateOfProduction"
                name="dateOfProduction"
                type="date"
                value={formData.dateOfProduction}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
              placeholder="Enter remarks (optional)"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md">
              Submit
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
