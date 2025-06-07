"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"
import { cn } from "../lib/utils.jsx"
import { useToast } from "../components/ui/toaster.jsx"

// Date formatting utility functions
const formatDateDDMMYYYY = (dateValue) => {
  // Handle various date formats that might come from Google Sheets
  let date

  // Handle Date object or ISO string
  if (dateValue instanceof Date) {
    date = dateValue
  }
  // Handle string date values
  else if (typeof dateValue === "string") {
    // Check if it's in Google Sheets Date(year,month,day) format
    if (dateValue.startsWith("Date(")) {
      const dateParts = dateValue.replace("Date(", "").replace(")", "").split(",")
      // Note: months are 0-based in JavaScript Date
      date = new Date(Number.parseInt(dateParts[0]), Number.parseInt(dateParts[1]), Number.parseInt(dateParts[2]))
    } else {
      // Try to parse as ISO string or other date format
      date = new Date(dateValue)
    }
  }
  // If we can't parse it or it's invalid, return the original
  else {
    return dateValue
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateValue
  }

  // Format as dd/mm/yyyy
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

// Format time as h:mm AM/PM
const formatTimeAMPM = (timeValue) => {
  // Handle Google Sheets Date format for time (Date(1899,11,30,15,24,0))
  if (typeof timeValue === "string" && timeValue.startsWith("Date(")) {
    const timeParts = timeValue.replace("Date(", "").replace(")", "").split(",")
    // Extract hours, minutes from the parts (ignore the date part)
    const hours = Number.parseInt(timeParts[3])
    const minutes = Number.parseInt(timeParts[4])

    // Format as 12-hour time with AM/PM
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12 // Convert 0 to 12 for 12 AM

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // If it's just a normal time string (like "15:24"), convert it to 12-hour format
  if (typeof timeValue === "string" && timeValue.includes(":")) {
    const [hours, minutes] = timeValue.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // If we couldn't parse it, return the original
  return timeValue
}

// Enhanced function to display data exactly as stored in sheet
const displayAsStored = (value) => {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return ""
  }

  // Handle empty strings but preserve whitespace
  if (typeof value === "string" && value.trim() === "") {
    return value // Return original empty string including whitespace
  }

  // For numbers, convert to string but preserve decimals
  if (typeof value === "number") {
    return value.toString()
  }

  // For boolean values, convert to string
  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  // For Date objects, convert to ISO string
  if (value instanceof Date) {
    return value.toISOString()
  }

  // For any other type, return as-is
  return value
}

// Enhanced function to safely extract cell values from Google Sheets
const extractCellValue = (cell) => {
  if (!cell || cell.v === null || cell.v === undefined) {
    return ""
  }

  // If there's a formatted value (f), use it as it represents the display format
  if (cell.f !== null && cell.f !== undefined) {
    return cell.f
  }

  // If there's a raw value (v), use it
  if (cell.v !== null && cell.v !== undefined) {
    return cell.v
  }

  return ""
}

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 transition-opacity" onClick={onClose}></div>
        <div
          className={`relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${className}`}
        >
          <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium leading-6 text-white border-b border-gray-700 pb-3 mb-4">{title}</h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LabTestingPage() {
  const { addLabTestRecord, getPendingLabTestRecords, getHistoryLabTestRecords, updateLabTestRecord, refreshData } =
    useBilletData()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [labTestingSheetRecords, setLabTestingSheetRecords] = useState([])

  // Google Sheet ID and Apps Script URL
  const SHEET_ID = "1Bu9dVCYBMwCBRwwtdxcNjOGVCtF6gIet_W82dwCq1B4"
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyxWc0X9zgyqgtfHfIlTplxFHEq2pe5IV46Ng0iJtzXvPlotLdQCyce92qd7iflmEuZTQ/exec"

  const [pendingRecords, setPendingRecords] = useState([])
  const [historyRecords, setHistoryRecords] = useState([])
  const [pendingProductionRecords, setPendingProductionRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null) // Store the selected record
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false) // New state for tracking submission
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBilletId, setSelectedBilletId] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [formData, setFormData] = useState({
    billetId: "",
    jobCard: "",
    heatNumber: "",
    carbon: "",
    sulfur: "",
    magnesium: "",
    phosphorus: "",
    status: "Pass",
    needTestingAgain: "No",
    remarks: "",
  })

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Enhanced function to fetch LAB TESTING sheet data directly
  const fetchLabTestingSheetData = async () => {
    try {
      console.log("Fetching data from LAB TESTING sheet...")

      // Use the direct Google Sheets URL format with range starting from row 2
      // Specifically targeting columns A through I as requested
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=LAB%20TESTING&range=A2:J1000`

      const response = await fetch(sheetUrl)
      const textData = await response.text()

      // Parse the response
      const jsonText = textData.substring(textData.indexOf("{"), textData.lastIndexOf("}") + 1)

      const parsedData = JSON.parse(jsonText)

      if (parsedData && parsedData.table) {
        // Convert the table data to rows using enhanced cell extraction
        const rows = parsedData.table.rows.map((row) => {
          return row.c.map((cell) => extractCellValue(cell))
        })

        // Map the rows to our data model with preserved formatting
        // Now starting from index 0 since we're already starting from row 2 (skipping header row 1)
        const labTestingRecords = rows.map((row, index) => ({
          id: `labtest-${index}`,
          timestamp: displayAsStored(row[0]), // Column A - Timestamp
          heatNumber: displayAsStored(row[1]), // Column B - Heat Number
          carbon: displayAsStored(row[2]), // Column C - Carbon %
          sulfur: displayAsStored(row[3]), // Column D - Sulfur %
          magnesium: displayAsStored(row[4]), // Column E - Magnesium %
          phosphorus: displayAsStored(row[5]), // Column F - Phosphorus %
          status: displayAsStored(row[6]) || "Pass", // Column G - Status
          needTestingAgain: displayAsStored(row[7]) || "No", // Column H - Need Testing Again?
          remarks: displayAsStored(row[8]), // Column I - Remarks
          jobCard: displayAsStored(row[9]), // Column J - Job Card
        }))

        console.log("Fetched LAB TESTING records:", labTestingRecords.length)
        return labTestingRecords
      } else {
        console.error("Failed to parse data from LAB TESTING sheet")
        toast({
          title: "Error",
          description: "Failed to parse data from LAB TESTING sheet.",
          variant: "destructive",
        })
        return []
      }
    } catch (error) {
      console.error("Error fetching LAB TESTING sheet data:", error)
      toast({
        title: "Error",
        description: `Failed to fetch LAB TESTING data: ${error.message}`,
        variant: "destructive",
      })
      return []
    }
  }

  // Enhanced function to fetch Google Sheets data directly using gviz/tq endpoint
  const fetchSheetData = async () => {
    try {
      console.log("Fetching data from Google Sheet...")

      // Use the direct Google Sheets URL format with range starting from row 7
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PRODUCTION&range=A7:AJ1000`

      const response = await fetch(sheetUrl)
      const textData = await response.text()

      // The gviz response comes with some prefix we need to remove
      const jsonText = textData.substring(textData.indexOf("{"), textData.lastIndexOf("}") + 1)

      const parsedData = JSON.parse(jsonText)

      if (parsedData && parsedData.table) {
        // Convert the table data to rows using enhanced cell extraction
        const rows = parsedData.table.rows.map((row) => {
          return row.c.map((cell) => extractCellValue(cell))
        })

        console.log("Total rows fetched:", rows.length)
        console.log("Sample row data:", rows[0]) // Log first data row for debugging

        // Process the data to find rows where:
        // Column Z (index 25) is not null AND Column AA (index 26) is null - PENDING
        // Now starting from index 0 since we're already starting from row 7
        const pendingRows = rows.filter((row, index) => {
          // Make sure we have enough columns
          if (row.length < 27) return false

          // Check if Z is not empty and AA is empty
          const columnZ = displayAsStored(row[25]) // Column Z (index 25)
          const columnAA = displayAsStored(row[26]) // Column AA (index 26)

          console.log(`Sheet Row ${index + 7} Pending check: Z="${columnZ}", AA="${columnAA}"`)

          return (
            columnZ !== "N/A" &&
            columnZ !== "" &&
            columnZ !== null &&
            columnZ !== undefined &&
            (columnAA === "N/A" || columnAA === "" || columnAA === null || columnAA === undefined)
          )
        })

        // Process the data to find rows where:
        // Column Z (index 25) is not null AND Column AA (index 26) is not null - HISTORY
        const historyRows = rows.filter((row, index) => {
          // Make sure we have enough columns
          if (row.length < 35) return false // Need more columns for history

          // Check if Z is not empty and AA is not empty
          const columnZ = displayAsStored(row[25]) // Column Z (index 25)
          const columnAA = displayAsStored(row[26]) // Column AA (index 26)

          console.log(`Sheet Row ${index + 7} History check: Z="${columnZ}", AA="${columnAA}"`)

          return (
            columnZ !== "N/A" &&
            columnZ !== "" &&
            columnZ !== null &&
            columnZ !== undefined &&
            columnAA !== "N/A" &&
            columnAA !== "" &&
            columnAA !== null &&
            columnAA !== undefined
          )
        })

        console.log("Found pending records:", pendingRows.length)
        console.log("Found history records:", historyRows.length)

        // Map pending rows with preserved formatting (columns B to N for pending tab)
        const pendingProductionRecords = pendingRows.map((row, index) => {
          const record = {
            id: `pending-${index}`,
            type: "pending",
            planned: displayAsStored(row[25]), // Column Z (index 25)
            heatNumber: displayAsStored(row[1]), // Column B (index 1)
            drclo: displayAsStored(row[2]), // Column C (index 2)
            pellet: displayAsStored(row[3]), // Column D (index 3)
            lumps: displayAsStored(row[4]), // Column E (index 4)
            scrapCommon: displayAsStored(row[5]), // Column F (index 5)
            scrapGrade: displayAsStored(row[6]), // Column G (index 6)
            pigIron: displayAsStored(row[7]), // Column H (index 7)
            silicoMN: displayAsStored(row[8]), // Column I (index 8)
            fenoChrone: displayAsStored(row[9]), // Column J (index 9)
            aluminium: displayAsStored(row[10]), // Column K (index 10)
            anthraciteCoal: displayAsStored(row[11]), // Column L (index 11)
            metCoke: displayAsStored(row[12]), // Column M (index 12)
            productionMT: displayAsStored(row[13]), // Column N (index 13)
            status: "pending",
            jobCard: displayAsStored(row[35]), // Column AJ (index 35)
          }

          console.log("Mapped pending record:", record)
          return record
        })

        // Map history rows with preserved formatting (lab test data)
        const historyProductionRecords = historyRows.map((row, index) => {
          const record = {
            id: `history-${index}`,
            type: "history",
            planned: displayAsStored(row[25]), // Column Z (index 25)
            heatNumber: displayAsStored(row[1]), // Column B (index 1)
            carbon: displayAsStored(row[28]), // Column AC (index 28)
            sulfur: displayAsStored(row[29]), // Column AD (index 29)
            magnesium: displayAsStored(row[30]), // Column AE (index 30)
            phosphorus: displayAsStored(row[31]), // Column AF (index 31)
            status: displayAsStored(row[32]), // Column AG (index 32)
            needTestingAgain: displayAsStored(row[33]), // Column AH (index 33)
            remarks: displayAsStored(row[34]), // Column AI (index 34)
            jobCard: displayAsStored(row[35]), // Column AJ (index 35)
          }

          console.log("Mapped history record:", record)
          return record
        })

        // Set both pending and history records
        setPendingProductionRecords(pendingProductionRecords)
        setHistoryRecords(historyProductionRecords)
      } else {
        console.error("Failed to parse data from Google Sheet")
        toast({
          title: "Error",
          description: "Failed to parse production data from Google Sheet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error)
      toast({
        title: "Error",
        description: `Failed to fetch data: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Function to submit data to the LAB TESTING sheet
  const submitToLabTestingSheet = async (data) => {
    try {
      // Prepare the data for the LAB TESTING sheet
      // Format the data according to your sheet structure

      const date = new Date()
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0") // January is 0
      const year = date.getFullYear()
      const timestamp = `${day}/${month}/${year}`
      const rowData = [
        timestamp,
        data.heatNumber, // Heat Number
        data.carbon, // Carbon %
        data.sulfur, // Sulfur %
        data.magnesium, // Magnesium %
        data.phosphorus, // Phosphorus %
        data.status, // Status (Pass/Fail as selected) - ensure this uses data.status directly
        data.needTestingAgain, // Need Testing Again? (Yes/No as selected)
        data.remarks, // Remarks
        data.jobCard, // Job Card - Column J
      ]

      // Use your existing Apps Script to insert the data
      const formData = new FormData()
      formData.append("sheetName", "LAB TESTING")
      formData.append("action", "insert")
      formData.append("rowData", JSON.stringify(rowData))

      // Send the data to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Also update the PRODUCTION sheet to mark this row as lab-tested
        await updateProductionLabStatus(data.billetId)
        return { success: true }
      } else {
        throw new Error(result.error || "Failed to submit data to LAB TESTING sheet")
      }
    } catch (error) {
      console.error("Error submitting to LAB TESTING sheet:", error)
      throw error
    }
  }

  // Function to update the lab testing status in the PRODUCTION sheet
  const updateProductionLabStatus = async (billetId) => {
    try {
      // First create a FormData object for the API call
      const formData = new FormData()
      formData.append("sheetName", "PRODUCTION")
      formData.append("action", "markLabTested") // This action should be implemented in your Apps Script
      formData.append("billetId", billetId) // The billet ID to find the row
      formData.append("columnIndex", 26) // Column AA (index 26) for lab test status
      formData.append("value", new Date().toISOString()) // Current timestamp

      // Send the request to update the status
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to mark production record as lab tested")
      }

      return true
    } catch (error) {
      console.error("Error updating production lab status:", error)
      toast({
        title: "Error",
        description: `Failed to update lab test status: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  }

  useEffect(() => {
    // Safely get records after component is mounted
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch local records - just use refreshData, don't call getPendingLabTestRecords
        await refreshData()

        // Fetch from sheet directly
        const labTestingData = await fetchLabTestingSheetData()
        setLabTestingSheetRecords(labTestingData)

        // Fetch Google Sheet production records
        await fetchSheetData()

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

  // Update the handleRefresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()

      // Fetch from sheet directly
      const labTestingData = await fetchLabTestingSheetData()
      setLabTestingSheetRecords(labTestingData)

      await fetchSheetData()
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: `Failed to refresh data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setRefreshing(false)
      }, 500)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openDialog = (recordId) => {
    // Find the selected record from pendingProductionRecords
    const record = pendingProductionRecords.find((r) => r.id === recordId)

    setSelectedRecord(record)
    setSelectedBilletId(recordId)

    // Initialize form with heat number and existing data if available
    setFormData({
      billetId: recordId,
      jobCard: record ? record.jobCard : "",
      heatNumber: record ? record.heatNumber : "",
      carbon: record ? record.carbon : "",
      sulfur: record ? record.sulfur : "",
      magnesium: record ? record.magnesium : "",
      phosphorus: record ? record.phosphorus : "",
      status: "Pass",
      needTestingAgain: record ? record.needTestingAgain || "No" : "No",
      remarks: record ? record.remarks : "",
    })

    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.carbon || !formData.sulfur || !formData.magnesium || !formData.phosphorus) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Create new record with the structure we want
    const newRecord = {
      billetId: selectedBilletId,
      jobCard: selectedRecord?.jobCard || "",
      heatNumber: selectedRecord?.heatNumber || "",
      carbon: formData.carbon,
      sulfur: formData.sulfur,
      magnesium: formData.magnesium,
      phosphorus: formData.phosphorus,
      status: formData.status, // This should preserve "Pass" or "Fail" as selected
      needTestingAgain: formData.needTestingAgain,
      remarks: formData.remarks,
    }

    try {
      // Submit to LAB TESTING sheet
      const result = await submitToLabTestingSheet(newRecord)

      if (result.success) {
        // Add to local memory (labTestingSheetRecords)
        const newLabRecord = {
          id: `labtest-${Date.now()}`,
          timestamp: new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY format
          jobCard: newRecord.jobCard,
          heatNumber: newRecord.heatNumber,
          carbon: newRecord.carbon,
          sulfur: newRecord.sulfur,
          magnesium: newRecord.magnesium,
          phosphorus: newRecord.phosphorus,
          status: newRecord.status, // This should be "Pass" or "Fail" as selected
          needTestingAgain: newRecord.needTestingAgain,
          remarks: newRecord.remarks,
        }

        // Update lab testing sheet records in memory
        setLabTestingSheetRecords((prev) => [newLabRecord, ...prev])

        // If needTestingAgain is "No", remove the record from pending list
        if (newRecord.needTestingAgain === "No") {
          setPendingProductionRecords((prev) => prev.filter((r) => r.id !== selectedBilletId))
        }

        // Show success toast
        toast({
          title: "Success",
          description: "Lab test record submitted successfully!",
        })

        // Close dialog automatically
        setIsDialogOpen(false)
        setSelectedRecord(null)
        setSelectedBilletId("")

        // Reset form data
        setFormData({
          billetId: "",
          jobCard: "",
          heatNumber: "",
          carbon: "",
          sulfur: "",
          magnesium: "",
          phosphorus: "",
          status: "Pass",
          needTestingAgain: "No",
          remarks: "",
        })

        // Keep user on current tab - don't auto-switch to history

        // Refresh data from sheets
        setTimeout(async () => {
          await fetchSheetData()
          await fetchLabTestingSheetData()
        }, 1000)
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

  const handleComplete = async (record) => {
    try {
      // Submit minimal data to LAB TESTING sheet
      const result = await submitToLabTestingSheet({
        billetId: record.billetId, // Needed for production status update
        heatNumber: record.heatNumber,
        carbon: "Auto-completed",
        sulfur: "Auto-completed",
        magnesium: "Auto-completed",
        phosphorus: "Auto-completed",
        status: "Pass",
        needTestingAgain: "No",
        remarks: "Automatically marked as completed",
        jobCard: record.jobCard,
      })

      if (result.success) {
        updateLabTestRecord(record.id, { status: "completed" })
        setPendingRecords(getPendingLabTestRecords())
        setHistoryRecords(getHistoryLabTestRecords())
        await fetchSheetData()

        toast({
          title: "Success",
          description: "Lab test record marked as completed.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to complete record: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleReject = async (record) => {
    try {
      // Submit minimal data to LAB TESTING sheet with rejected status
      const result = await submitToLabTestingSheet({
        billetId: record.billetId, // Needed for production status update
        heatNumber: record.heatNumber,
        carbon: "Rejected",
        sulfur: "Rejected",
        magnesium: "Rejected",
        phosphorus: "Rejected",
        status: "Fail",
        needTestingAgain: "Yes",
        remarks: "Rejected by user",
        jobCard: record.jobCard,
      })

      if (result.success) {
        updateLabTestRecord(record.id, { status: "rejected" })
        setPendingRecords(getPendingLabTestRecords())
        setHistoryRecords(getHistoryLabTestRecords())
        await fetchSheetData()

        toast({
          title: "Record Rejected",
          description: "Lab test record has been rejected.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to reject record: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // If not mounted yet or auth is loading, show a skeleton
  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
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
                  : "text-gray-500 hover:text-gray-600"
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
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 sticky top-0 z-10">
                      <tr className="text-left border-b border-gray-600">
                        <th className="px-4 py-3 font-medium w-24">Planned</th>
                        <th className="px-4 py-3 font-medium w-32">Job Card</th>
                        <th className="px-4 py-3 font-medium w-32">Heat Number</th>
                        <th className="px-4 py-3 font-medium w-20">Drclo</th>
                        <th className="px-4 py-3 font-medium w-20">Pellet</th>
                        <th className="px-4 py-3 font-medium w-20">Lumps</th>
                        <th className="px-4 py-3 font-medium w-28">Scrap Common</th>
                        <th className="px-4 py-3 font-medium w-28">Scrap Grade</th>
                        <th className="px-4 py-3 font-medium w-24">Pig Iron</th>
                        <th className="px-4 py-3 font-medium w-24">Silico MN</th>
                        <th className="px-4 py-3 font-medium w-28">Feno Chrone</th>
                        <th className="px-4 py-3 font-medium w-24">Aluminium</th>
                        <th className="px-4 py-3 font-medium w-32">Anthracite coal</th>
                        <th className="px-4 py-3 font-medium w-24">Met coke</th>
                        <th className="px-4 py-3 font-medium w-32">Production ( MT )</th>
                        <th className="px-4 py-3 font-medium w-20">Status</th>
                        <th className="px-4 py-3 font-medium sticky right-0 bg-gray-800 z-20 w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProductionRecords
                        .filter((record) => {
                          // Check if there's a corresponding lab test record with needTestingAgain = "No"
                          const correspondingLabTest = labTestingSheetRecords.find(
                            (labRecord) => labRecord.heatNumber === record.heatNumber,
                          )
                          // Hide the row if there's a lab test record with needTestingAgain = "No"
                          return !(correspondingLabTest && correspondingLabTest.needTestingAgain === "No")
                        })
                        .map((record) => (
                          <tr key={record.id} className="border-b border-gray-600 hover:bg-gray-800">
                            <td className="px-4 py-2 font-mono text-sm w-24">{record.planned}</td>
                            <td className="px-4 py-2 font-mono text-sm w-32">{record.jobCard}</td>
                            <td className="px-4 py-2 font-mono text-sm w-32">{record.heatNumber}</td>
                            <td className="px-4 py-2 font-mono text-sm w-20">{record.drclo}</td>
                            <td className="px-4 py-2 font-mono text-sm w-20">{record.pellet}</td>
                            <td className="px-4 py-2 font-mono text-sm w-20">{record.lumps}</td>
                            <td className="px-4 py-2 font-mono text-sm w-28">{record.scrapCommon}</td>
                            <td className="px-4 py-2 font-mono text-sm w-28">{record.scrapGrade}</td>
                            <td className="px-4 py-2 font-mono text-sm w-24">{record.pigIron}</td>
                            <td className="px-4 py-2 font-mono text-sm w-24">{record.silicoMN}</td>
                            <td className="px-4 py-2 font-mono text-sm w-28">{record.fenoChrone}</td>
                            <td className="px-4 py-2 font-mono text-sm w-24">{record.aluminium}</td>
                            <td className="px-4 py-2 font-mono text-sm w-32">{record.anthraciteCoal}</td>
                            <td className="px-4 py-2 font-mono text-sm w-24">{record.metCoke}</td>
                            <td className="px-4 py-2 font-mono text-sm w-32">{record.productionMT}</td>
                            <td className="px-4 py-2 w-20">
                              {(() => {
                                const labTestResult = labTestingSheetRecords.find(
                                  (labRecord) => labRecord.heatNumber === record.heatNumber,
                                )

                                console.log(`Heat Number: ${record.heatNumber}, Lab Result:`, labTestResult)

                                if (labTestResult && labTestResult.status) {
                                  const status = labTestResult.status.toString().trim()
                                  console.log(`Status value: "${status}"`)

                                  if (status.toLowerCase() === "pass") {
                                    return (
                                      <Badge variant="success" className="capitalize">
                                        Pass
                                      </Badge>
                                    )
                                  } else if (status.toLowerCase() === "fail") {
                                    return (
                                      <Badge variant="danger" className="capitalize">
                                        Fail
                                      </Badge>
                                    )
                                  } else {
                                    return (
                                      <Badge variant="info" className="capitalize">
                                        {status}
                                      </Badge>
                                    )
                                  }
                                }
                                // else {
                                //   return <Badge variant="warning">Pending</Badge>;
                                // }
                              })()}
                            </td>
                            <td className="px-4 py-2 sticky right-0 bg-gray-900 z-20 w-24">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDialog(record.id)}
                                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs"
                                >
                                  Process
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 sticky top-0 z-10">
                      <tr className="text-left border-b border-gray-600">
                        <th className="px-4 py-3 font-medium w-28">Timestamp</th>
                        <th className="px-4 py-3 font-medium w-32">Job Card</th>
                        <th className="px-4 py-3 font-medium w-32">Heat Number</th>
                        <th className="px-4 py-3 font-medium w-24">Carbon %</th>
                        <th className="px-4 py-3 font-medium w-24">Sulfur %</th>
                        <th className="px-4 py-3 font-medium w-28">Magnesium %</th>
                        <th className="px-4 py-3 font-medium w-28">Phosphorus %</th>
                        <th className="px-4 py-3 font-medium w-20">Status</th>
                        <th className="px-4 py-3 font-medium w-32">Need Testing Again?</th>
                        <th className="px-4 py-3 font-medium w-40">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labTestingSheetRecords.map((record, index) => (
                        <tr key={`lab-${index}`} className="border-b border-gray-600 hover:bg-gray-800">
                          <td className="px-4 py-2 font-mono text-sm w-28">{record.timestamp}</td>
                          <td className="px-4 py-2 font-mono text-sm w-32">{record.jobCard}</td>
                          <td className="px-4 py-2 font-mono text-sm w-32">{record.heatNumber}</td>
                          <td className="px-4 py-2 font-mono text-sm w-24">{record.carbon}</td>
                          <td className="px-4 py-2 font-mono text-sm w-24">{record.sulfur}</td>
                          <td className="px-4 py-2 font-mono text-sm w-28">{record.magnesium}</td>
                          <td className="px-4 py-2 font-mono text-sm w-28">{record.phosphorus}</td>
                          <td className="px-4 py-2 w-20">
                            <Badge variant={record.status === "Pass" ? "success" : "danger"} className="capitalize">
                              {record.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 w-32">
                            <Badge
                              variant={record.needTestingAgain === "Yes" ? "warning" : "info"}
                              className="capitalize"
                            >
                              {record.needTestingAgain}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 font-mono text-sm w-40">{record.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lab Testing Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => !isSubmitting && setIsDialogOpen(false)}
        title="Perform Lab Testing"
        className="bg-gray-800 rounded-lg shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Heat Number as header info */}
          <div className="bg-gray-700 p-3 rounded-md mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 text-sm">Job Card:</p>
                <p className="text-white font-medium font-mono">{selectedRecord?.jobCard || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Heat Number:</p>
                <p className="text-white font-medium font-mono">{selectedRecord?.heatNumber || "N/A"}</p>
              </div>
            </div>
          </div>

          <input type="hidden" id="billetId" name="billetId" value={formData.billetId} />
          <input type="hidden" id="jobCard" name="jobCard" value={formData.jobCard} />
          <input type="hidden" id="heatNumber" name="heatNumber" value={formData.heatNumber} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="carbon" className="block text-sm font-medium mb-1 text-gray-200">
                Carbon % *
              </label>
              <input
                id="carbon"
                name="carbon"
                type="text"
                value={formData.carbon}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                placeholder="Enter carbon percentage"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="sulfur" className="block text-sm font-medium mb-1 text-gray-200">
                Sulfur % *
              </label>
              <input
                id="sulfur"
                name="sulfur"
                type="text"
                value={formData.sulfur}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                placeholder="Enter sulfur percentage"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="magnesium" className="block text-sm font-medium mb-1 text-gray-200">
                Magnesium % *
              </label>
              <input
                id="magnesium"
                name="magnesium"
                type="text"
                value={formData.magnesium}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                placeholder="Enter magnesium percentage"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="phosphorus" className="block text-sm font-medium mb-1 text-gray-200">
                Phosphorus % *
              </label>
              <input
                id="phosphorus"
                name="phosphorus"
                type="text"
                value={formData.phosphorus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                placeholder="Enter phosphorus percentage"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-200">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={isSubmitting}
              >
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>
            <div>
              <label htmlFor="needTestingAgain" className="block text-sm font-medium mb-1 text-gray-200">
                Need Testing Again? *
              </label>
              <select
                id="needTestingAgain"
                name="needTestingAgain"
                value={formData.needTestingAgain}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={isSubmitting}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium mb-1 text-gray-200">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              placeholder="Enter any remarks or observations (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700 mt-6">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 border border-gray-500 text-gray-200 rounded-md hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Test Results"
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
