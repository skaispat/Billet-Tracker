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

// Skeleton component
const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
}

export default function WorkflowEntryPage() {
  const { addRecord, refreshData, generateBilletId } = useBilletData()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    billetId: "",
    heatNumber: "",
    drCell: "",
    pilot: "",
    metCook: "",
    silicoMn: "",
    authoriseCook: "",
    scrapCmd: "",
    productionCmd: "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.heatNumber ||
      !formData.drCell ||
      !formData.pilot ||
      !formData.metCook ||
      !formData.silicoMn ||
      !formData.authoriseCook ||
      !formData.scrapCmd ||
      !formData.productionCmd
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
      billetId: formData.billetId || generateBilletId(),
      scrapCmd: Number.parseFloat(formData.scrapCmd),
      productionCmd: Number.parseFloat(formData.productionCmd),
    }

    addRecord(newRecord)

    // Show success toast
    toast({
      title: "Success",
      description: "Billet production record created successfully.",
    })

    // Reset form
    setFormData({
      billetId: "",
      heatNumber: "",
      drCell: "",
      pilot: "",
      metCook: "",
      silicoMn: "",
      authoriseCook: "",
      scrapCmd: "",
      productionCmd: "",
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
          </div>
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Check if user has permission to access this page
  if (!hasPermission("production")) {
    navigate("/dashboard")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-700 dark:text-cyan-400 flex items-center">
              <Factory className="mr-2 h-8 w-8" />
              Billet Production
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Create new billet production record</p>
          </div>
        </div>

        {/* Production Form */}
        <div className="bg-gray-950 text-white rounded-lg shadow-md border border-cyan-200 mb-6">
          <div className="p-4 border-b border-cyan-100">
            <h2 className="text-xl font-medium text-cyan-700">New Production Entry</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="billetId" className="block text-sm font-medium mb-1">
                  Billet ID (Auto-generated if empty)
                </label>
                <input
                  id="billetId"
                  name="billetId"
                  value={formData.billetId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label htmlFor="heatNumber" className="block text-sm font-medium mb-1">
                  Heat Number *
                </label>
                <input
                  id="heatNumber"
                  name="heatNumber"
                  value={formData.heatNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                  placeholder="Enter heat number"
                  required
                />
              </div>
              <div>
                <label htmlFor="drCell" className="block text-sm font-medium mb-1">
                  DR Cell *
                </label>
                <input
                  id="drCell"
                  name="drCell"
                  value={formData.drCell}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                  placeholder="Enter DR cell"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pilot" className="block text-sm font-medium mb-1">
                    Pilot *
                  </label>
                  <input
                    id="pilot"
                    name="pilot"
                    value={formData.pilot}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter pilot name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="metCook" className="block text-sm font-medium mb-1">
                    Met Cook *
                  </label>
                  <input
                    id="metCook"
                    name="metCook"
                    value={formData.metCook}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter met cook name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="silicoMn" className="block text-sm font-medium mb-1">
                    Silico Mn *
                  </label>
                  <input
                    id="silicoMn"
                    name="silicoMn"
                    value={formData.silicoMn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter silico mn"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="authoriseCook" className="block text-sm font-medium mb-1">
                    Authorise Cook *
                  </label>
                  <input
                    id="authoriseCook"
                    name="authoriseCook"
                    value={formData.authoriseCook}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter authorise cook name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scrapCmd" className="block text-sm font-medium mb-1">
                    Scrap Cmd (MT) *
                  </label>
                  <input
                    id="scrapCmd"
                    name="scrapCmd"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.scrapCmd}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter scrap cmd"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="productionCmd" className="block text-sm font-medium mb-1">
                    Production Cmd (MT) *
                  </label>
                  <input
                    id="productionCmd"
                    name="productionCmd"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.productionCmd}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter production cmd"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      billetId: "",
                      heatNumber: "",
                      drCell: "",
                      pilot: "",
                      metCook: "",
                      silicoMn: "",
                      authoriseCook: "",
                      scrapCmd: "",
                      productionCmd: "",
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-500 bg-gray-900"
                >
                  Reset
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md">
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
