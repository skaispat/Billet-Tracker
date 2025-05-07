"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"
import { cn, formatDate } from "../lib/utils.jsx"
import { useToast } from "../components/ui/toaster.jsx"

// Icons
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
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
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
  return <div className={`animate-pulse bg-gray-800 rounded ${className}`} />
}

// Dialog component
const Dialog = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* <div className="fixed inset-0 bg-gray-700 bg-opacity-100 transition-opacity" onClick={onClose}></div> */}
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 transition-opacity" onClick={onClose}></div>
        <div className={`relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${className}`}>
          <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium leading-6 text-white border-b border-gray-700 pb-3 mb-4">{title}</h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LabTestingPage() {
  const {
    addLabTestRecord,
    getPendingLabTestRecords,
    getHistoryLabTestRecords,
    updateLabTestRecord,
    refreshData,
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
  const [activeTab, setActiveTab] = useState("pending")
  const [formData, setFormData] = useState({
    billetId: "",
    testDate: "",
    testerName: "",
    tensileStrength: "",
    yieldStrength: "",
    elongation: "",
    hardness: "",
    chemicalComposition: "",
    testResult: "pass",
    remark: "",
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
        setPendingRecords(getPendingLabTestRecords())
        setHistoryRecords(getHistoryLabTestRecords())
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    if (isMounted && !authLoading) {
      fetchData()
    }
  }, [isMounted, authLoading, getPendingLabTestRecords, getHistoryLabTestRecords, refreshData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setPendingRecords(getPendingLabTestRecords())
    setHistoryRecords(getHistoryLabTestRecords())
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
      testDate: "",
      testerName: "",
      tensileStrength: "",
      yieldStrength: "",
      elongation: "",
      hardness: "",
      chemicalComposition: "",
      testResult: "pass",
      remark: "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.testDate ||
      !formData.testerName ||
      !formData.tensileStrength ||
      !formData.yieldStrength ||
      !formData.elongation ||
      !formData.hardness
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
      tensileStrength: Number.parseFloat(formData.tensileStrength),
      yieldStrength: Number.parseFloat(formData.yieldStrength),
      elongation: Number.parseFloat(formData.elongation),
      hardness: Number.parseFloat(formData.hardness),
    }

    addLabTestRecord(newRecord)

    // Show success toast
    toast({
      title: "Success",
      description: "Lab test record created successfully.",
    })

    // Reset form and close dialog
    setFormData({
      billetId: "",
      testDate: "",
      testerName: "",
      tensileStrength: "",
      yieldStrength: "",
      elongation: "",
      hardness: "",
      chemicalComposition: "",
      testResult: "pass",
      remark: "",
    })
    setIsDialogOpen(false)

    // Refresh data
    setPendingRecords(getPendingLabTestRecords())
    setHistoryRecords(getHistoryLabTestRecords())
  }

  const handleComplete = (id) => {
    updateLabTestRecord(id, { status: "completed" })
    setPendingRecords(getPendingLabTestRecords())
    setHistoryRecords(getHistoryLabTestRecords())

    toast({
      title: "Success",
      description: "Lab test record marked as completed.",
    })
  }

  const handleReject = (id) => {
    updateLabTestRecord(id, { status: "rejected" })
    setPendingRecords(getPendingLabTestRecords())
    setHistoryRecords(getHistoryLabTestRecords())

    toast({
      title: "Record Rejected",
      description: "Lab test record has been rejected.",
      variant: "destructive",
    })
  }

  // If not mounted yet or auth is loading, show a skeleton
  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100">
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
  if (!hasPermission("labTesting")) {
    navigate("/dashboard")
    return null
  }

  // Flask icon for lab testing
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-500 flex items-center">
              <Flask className="mr-2 h-8 w-8" />
              Lab Testing
            </h1>
            <p className="text-gray-400 mt-1">Manage laboratory testing for billet quality assurance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-teal-200 text-teal-600 hover:bg-gray-800 rounded-md flex items-center"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 text-white rounded-lg shadow-md border border-teal-200 mb-6">
          <div className="flex border-b border-teal-100">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-teal-600"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <Clock className="inline-block mr-2 h-4 w-4" />
              Pending Tests
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "history"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-teal-600"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <CheckCircle2 className="inline-block mr-2 h-4 w-4" />
              Test History
            </button>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : activeTab === "pending" ? (
              pendingRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending lab test records found.</p>
                  <p className="mt-2">Complete billet receiving first to see records here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="px-4 py-2 font-medium">Billet ID</th>
                        <th className="px-4 py-2 font-medium">Heat Number</th>
                        <th className="px-4 py-2 font-medium">Grade</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-gray-100 hover:bg-gray-800"
                        >
                          <td className="px-4 py-2 font-mono text-xs">{record.billetId}</td>
                          <td className="px-4 py-2">{record.heatNumber || "N/A"}</td>
                          <td className="px-4 py-2">{record.grade || "N/A"}</td>
                          <td className="px-4 py-2">
                            <Badge variant="warning">Pending</Badge>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openDialog(record.billetId)}
                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs"
                              >
                                Test
                              </button>
                              {record.status === "pending" && !record.id.startsWith("pending-") && (
                                <>
                                  <button
                                    onClick={() => handleComplete(record.id)}
                                    className="p-1 text-green-600 hover:text-green-800"
                                    title="Mark as Completed"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(record.id)}
                                    className="p-1 text-red-600 hover:text-red-800"
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
              )
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No lab test history records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="px-4 py-2 font-medium">Billet ID</th>
                      <th className="px-4 py-2 font-medium">Test Date</th>
                      <th className="px-4 py-2 font-medium">Tester</th>
                      <th className="px-4 py-2 font-medium">Tensile Str.</th>
                      <th className="px-4 py-2 font-medium">Yield Str.</th>
                      <th className="px-4 py-2 font-medium">Result</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 hover:bg-gray-800"
                      >
                        <td className="px-4 py-2 font-mono text-xs">{record.billetId}</td>
                        <td className="px-4 py-2">{record.testDate}</td>
                        <td className="px-4 py-2">{record.testerName}</td>
                        <td className="px-4 py-2">{record.tensileStrength} MPa</td>
                        <td className="px-4 py-2">{record.yieldStrength} MPa</td>
                        <td className="px-4 py-2">
                          <Badge 
                            variant={record.testResult === "pass" ? "success" : "danger"} 
                            className="capitalize"
                          >
                            {record.testResult}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge 
                            variant={record.status === "completed" ? "success" : "danger"} 
                            className="capitalize"
                          >
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

      {/* Lab Testing Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Perform Lab Testing">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="billetId" className="block text-sm font-medium mb-1">
              Billet ID
            </label>
            <input
              id="billetId"
              name="billetId"
              value={formData.billetId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              readOnly
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="testDate" className="block text-sm font-medium mb-1">
                Test Date *
              </label>
              <input
                id="testDate"
                name="testDate"
                type="date"
                value={formData.testDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label htmlFor="testerName" className="block text-sm font-medium mb-1">
                Tester Name *
              </label>
              <input
                id="testerName"
                name="testerName"
                value={formData.testerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter tester name"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tensileStrength" className="block text-sm font-medium mb-1">
                Tensile Strength (MPa) *
              </label>
              <input
                id="tensileStrength"
                name="tensileStrength"
                type="number"
                step="0.1"
                min="0"
                value={formData.tensileStrength}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter tensile strength"
                required
              />
            </div>
            <div>
              <label htmlFor="yieldStrength" className="block text-sm font-medium mb-1">
                Yield Strength (MPa) *
              </label>
              <input
                id="yieldStrength"
                name="yieldStrength"
                type="number"
                step="0.1"
                min="0"
                value={formData.yieldStrength}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter yield strength"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="elongation" className="block text-sm font-medium mb-1">
                Elongation (%) *
              </label>
              <input
                id="elongation"
                name="elongation"
                type="number"
                step="0.1"
                min="0"
                value={formData.elongation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter elongation percentage"
                required
              />
            </div>
            <div>
              <label htmlFor="hardness" className="block text-sm font-medium mb-1">
                Hardness (HBW) *
              </label>
              <input
                id="hardness"
                name="hardness"
                type="number"
                min="0"
                value={formData.hardness}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter hardness value"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="chemicalComposition" className="block text-sm font-medium mb-1">
              Chemical Composition
            </label>
            <textarea
              id="chemicalComposition"
              name="chemicalComposition"
              value={formData.chemicalComposition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter chemical composition details (e.g., C: 0.42%, Mn: 0.7%, Si: 0.3%)"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor="testResult" className="block text-sm font-medium mb-1">
              Test Result *
            </label>
            <select
              id="testResult"
              name="testResult"
              value={formData.testResult}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>
          <div>
            <label htmlFor="remark" className="block text-sm font-medium mb-1">
              Remarks
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter additional remarks or observations (optional)"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
            >
              Submit Test Results
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}