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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    heatNumber: "",
    drCell: "",
    pilot: "",
    lumps: "",
    scrapCommon: "",
    scrapGrade: "",
    pigIron: "",
    silicoMn: "",
    fenoChrone: "",
    aluminium: "",
    authoriseCook: "",
    metCook: "",
    productionCmd: "",
  })

  // Google Apps Script URL
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyxWc0X9zgyqgtfHfIlTplxFHEq2pe5IV46Ng0iJtzXvPlotLdQCyce92qd7iflmEuZTQ/exec"

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

  // Function to get all Job Card numbers from the sheet
  const getAllJobCardNumbers = async () => {
    try {
      const formData = new FormData()
      formData.append("sheetName", "PRODUCTION")
      formData.append("action", "getAllData")

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        // Extract Job Card numbers from column AJ (index 35)
        const jobCardNumbers = result.data
          .map(row => row[35]) // Column AJ is index 35
          .filter(jobCard => jobCard && jobCard.startsWith('JC-'))
          .map(jobCard => {
            const match = jobCard.match(/JC-(\d+)/)
            return match ? parseInt(match[1]) : 0
          })
          .filter(num => num > 0)
        
        return jobCardNumbers
      } else {
        return []
      }
    } catch (error) {
      console.error("Error getting job card numbers:", error)
      return []
    }
  }

  // Function to get the next Job Card number
  const getNextJobCardNumber = async () => {
    try {
      const existingJobCards = await getAllJobCardNumbers()
      
      if (existingJobCards.length === 0) {
        return "JC-001"
      }

      // Find the highest number
      const maxNumber = Math.max(...existingJobCards)
      const nextNumber = maxNumber + 1
      
      // Format with leading zeros (3 digits)
      return `JC-${String(nextNumber).padStart(3, '0')}`
    } catch (error) {
      console.error("Error getting next job card number:", error)
      // Fallback to JC-001 in case of error
      return "JC-001"
    }
  }

  const submitToGoogleSheet = async (data) => {
    try {
      const billetId = generateBilletId()
      const jobCardNumber = await getNextJobCardNumber()

      const date = new Date()
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0") // January is 0
      const year = date.getFullYear()
      const timestamp = `${day}/${month}/${year}`

      // Create row data array with 36 elements (A to AJ columns)
      const rowData = new Array(36).fill("")
      
      // Fill the main data columns (A to N)
      rowData[0] = timestamp // Column A - Timestamp
      rowData[1] = data.heatNumber // Column B - Heat Number
      rowData[2] = data.drCell // Column C - Drclo
      rowData[3] = data.pilot // Column D - Pellet
      rowData[4] = data.lumps // Column E - Lumps
      rowData[5] = data.scrapCommon // Column F - Scrap Common
      rowData[6] = data.scrapGrade // Column G - Scrap Grade
      rowData[7] = data.pigIron // Column H - Pig Iron
      rowData[8] = data.silicoMn // Column I - Silico MN
      rowData[9] = data.fenoChrone // Column J - Feno Chrone
      rowData[10] = data.aluminium // Column K - Aluminium
      rowData[11] = data.authoriseCook // Column L - Anthracite coal
      rowData[12] = data.metCook // Column M - Met coke
      rowData[13] = data.productionCmd // Column N - Production (MT)
      
      // Add Job Card number to column AJ (index 35, since AJ is the 36th column)
      rowData[35] = jobCardNumber // Column AJ - Job Card

      // Create form data for the POST request
      const formData = new FormData()
      formData.append("sheetName", "PRODUCTION")
      formData.append("action", "insert")
      formData.append("rowData", JSON.stringify(rowData))

      // Send the data to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        return { success: true, billetId, jobCardNumber }
      } else {
        throw new Error(result.error || "Failed to submit data to Google Sheet")
      }
    } catch (error) {
      console.error("Error submitting to Google Sheet:", error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form - check all required fields
    if (
      !formData.heatNumber ||
      !formData.drCell ||
      !formData.pilot ||
      !formData.lumps ||
      !formData.scrapCommon ||
      !formData.scrapGrade ||
      !formData.pigIron ||
      !formData.silicoMn ||
      !formData.fenoChrone ||
      !formData.aluminium ||
      !formData.authoriseCook ||
      !formData.metCook ||
      !formData.productionCmd
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Submit to Google Sheet
      const result = await submitToGoogleSheet(formData)

      if (result.success) {
        // Create new record for local state with the generated ID and Job Card
        const newRecord = {
          ...formData,
          jobCardNumber: result.jobCardNumber,
          timestamp: new Date().toISOString(), // Also store timestamp
        }

        // Add to local state
        addRecord(newRecord)

        // Show success toast with Job Card number
        toast({
          title: "Success",
          description: `Production record created successfully! Billet ID: ${result.billetId}, Job Card: ${result.jobCardNumber}`,
        })

        // Reset form
        setFormData({
          heatNumber: "",
          drCell: "",
          pilot: "",
          lumps: "",
          scrapCommon: "",
          scrapGrade: "",
          pigIron: "",
          silicoMn: "",
          fenoChrone: "",
          aluminium: "",
          authoriseCook: "",
          metCook: "",
          productionCmd: "",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to submit data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <p className="text-sm text-gray-400">Billet ID and Job Card number will be auto-generated upon submission</p>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Heat Number */}
              <div>
                <label htmlFor="heatNumber" className="block text-sm font-medium mb-1">
                  Heat Number
                </label>
                <input
                  id="heatNumber"
                  name="heatNumber"
                  type="text"
                  value={formData.heatNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                  placeholder="Enter heat number"
                  required
                />
              </div>

              {/* Drclo */}
              <div>
                <label htmlFor="drCell" className="block text-sm font-medium mb-1">
                  Drclo
                </label>
                <input
                  id="drCell"
                  name="drCell"
                  type="text"
                  value={formData.drCell}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                  placeholder="Enter Drclo"
                  required
                />
              </div>

              {/* Pellet and Lumps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pilot" className="block text-sm font-medium mb-1">
                    Pellet
                  </label>
                  <input
                    id="pilot"
                    name="pilot"
                    type="text"
                    value={formData.pilot}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter pellet"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lumps" className="block text-sm font-medium mb-1">
                    Lumps
                  </label>
                  <input
                    id="lumps"
                    name="lumps"
                    type="text"
                    value={formData.lumps}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter lumps"
                    required
                  />
                </div>
              </div>

              {/* Pig Iron and Silico MN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pigIron" className="block text-sm font-medium mb-1">
                    Pig Iron
                  </label>
                  <input
                    id="pigIron"
                    name="pigIron"
                    type="text"
                    value={formData.pigIron}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter pig iron"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="silicoMn" className="block text-sm font-medium mb-1">
                    Silico MN
                  </label>
                  <input
                    id="silicoMn"
                    name="silicoMn"
                    type="text"
                    value={formData.silicoMn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter silico mn"
                    required
                  />
                </div>
              </div>

              {/* Feno Chrone and Aluminium */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fenoChrone" className="block text-sm font-medium mb-1">
                    Feno Chrone
                  </label>
                  <input
                    id="fenoChrone"
                    name="fenoChrone"
                    type="text"
                    value={formData.fenoChrone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter feno chrone"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="aluminium" className="block text-sm font-medium mb-1">
                    Aluminium
                  </label>
                  <input
                    id="aluminium"
                    name="aluminium"
                    type="text"
                    value={formData.aluminium}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter aluminium"
                    required
                  />
                </div>
              </div>

              {/* Anthracite coal and Met coke */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="authoriseCook" className="block text-sm font-medium mb-1">
                    Anthracite coal
                  </label>
                  <input
                    id="authoriseCook"
                    name="authoriseCook"
                    type="text"
                    value={formData.authoriseCook}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter anthracite coal"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="metCook" className="block text-sm font-medium mb-1">
                    Met coke
                  </label>
                  <input
                    id="metCook"
                    name="metCook"
                    type="text"
                    value={formData.metCook}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter met coke"
                    required
                  />
                </div>
              </div>

              {/* Scrap Common and Scrap Grade - Moved after Met coke */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scrapCommon" className="block text-sm font-medium mb-1">
                    Scrap Common
                  </label>
                  <input
                    id="scrapCommon"
                    name="scrapCommon"
                    type="text"
                    value={formData.scrapCommon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter scrap common mt"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="scrapGrade" className="block text-sm font-medium mb-1">
                    Scrap Grade
                  </label>
                  <input
                    id="scrapGrade"
                    name="scrapGrade"
                    type="text"
                    value={formData.scrapGrade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                    placeholder="Enter scrap grade mt"
                    required
                  />
                </div>
              </div>

              {/* Production (MT) */}
              <div>
                <label htmlFor="productionCmd" className="block text-sm font-medium mb-1">
                  Production (MT)
                </label>
                <input
                  id="productionCmd"
                  name="productionCmd"
                  type="text"
                  value={formData.productionCmd}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                  placeholder="Enter production mt"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      heatNumber: "",
                      drCell: "",
                      pilot: "",
                      lumps: "",
                      scrapCommon: "",
                      scrapGrade: "",
                      pigIron: "",
                      silicoMn: "",
                      fenoChrone: "",
                      aluminium: "",
                      authoriseCook: "",
                      metCook: "",
                      productionCmd: "",
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-500 bg-gray-900"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Create Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

