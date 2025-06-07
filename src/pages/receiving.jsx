"use client"

import { useState, useEffect } from "react"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"
import { cn } from "../lib/utils.jsx"
import { useToast } from "../components/ui/toaster.jsx"

// Date formatting utility functions
const formatDateDDMMYYYY = (dateValue) => {
  // Handle various date formats that might come from Google Sheets
  let date

  // Handle Date object
  if (dateValue instanceof Date) {
    date = dateValue
  }
  // Handle string date values
  else if (typeof dateValue === "string") {
    // Check if it's in Google Sheets Date(year,month,day) format
    if (dateValue.startsWith("Date(")) {
      const dateParts = dateValue.replace("Date(", "").replace(")", "").split(",")
      if (dateParts.length >= 3) {
        // Note: In Google Sheets Date format, months are 0-based (0=January, 1=February, etc.)
        // But we need to handle it correctly
        const year = Number.parseInt(dateParts[0])
        const month = Number.parseInt(dateParts[1]) // This is already 0-based from Google Sheets
        const day = Number.parseInt(dateParts[2])

        // Create date with correct month (Google Sheets month is 0-based, so we use it directly)
        date = new Date(year, month, day)
      }
    } else {
      // Try to parse as ISO string or other date format
      date = new Date(dateValue)
    }
  }
  // Handle number values (Excel/Google Sheets serial dates)
  else if (typeof dateValue === "number") {
    // Convert Excel/Google Sheets serial date to JavaScript Date
    date = new Date((dateValue - 25569) * 86400 * 1000)
  }
  // If we can't parse it or it's invalid, return empty string
  else {
    return ""
  }

  // Check if date is valid
  if (!date || isNaN(date.getTime())) {
    return ""
  }

  // Format as dd/mm/yyyy
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0") // JavaScript months are 0-based, so add 1
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

// Format time as h:mm AM/PM
const formatTimeAMPM = (timeValue) => {
  // Handle Google Sheets Date format for time (Date(1899,11,30,15,24,0))
  if (typeof timeValue === "string" && timeValue.startsWith("Date(")) {
    const timeParts = timeValue.replace("Date(", "").replace(")", "").split(",")
    if (timeParts.length >= 4) {
      // Extract hours, minutes from the parts (ignore the date part)
      const hours = Number.parseInt(timeParts[3]) || 0
      const minutes = Number.parseInt(timeParts[4]) || 0

      // Format as 12-hour time with AM/PM
      const period = hours >= 12 ? "PM" : "AM"
      const hour12 = hours % 12 || 12 // Convert 0 to 12 for 12 AM

      return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
    }
  }

  // If it's just a normal time string (like "15:24"), convert it to 12-hour format
  if (typeof timeValue === "string" && timeValue.includes(":")) {
    const [hours, minutes] = timeValue.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      const period = hours >= 12 ? "PM" : "AM"
      const hour12 = hours % 12 || 12

      return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
    }
  }

  // If we couldn't parse it, return empty string or the original value
  return timeValue || ""
}

// Enhanced function to preserve and display rich text formatting for all field types
const formatRichText = (text) => {
  if (!text) return ""

  // Convert text to string and preserve formatting
  const textStr = String(text)

  // Handle various text formats and preserve special characters, numbers, symbols
  return textStr
    .replace(/\r\n/g, "\n") // Normalize line breaks
    .replace(/\r/g, "\n") // Handle different line break formats
    .trim()
}

// Enhanced function to display rich text with proper formatting for all text types
const RichTextDisplay = ({ text, className = "", maxWidth = "max-w-48" }) => {
  const formattedText = formatRichText(text)

  return (
    <div
      className={`${maxWidth} break-words whitespace-pre-wrap text-left ${className}`}
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
        lineHeight: "1.4",
        fontSize: "inherit",
      }}
      title={formattedText} // Show full text on hover
    >
      {formattedText || "-"}
    </div>
  )
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

// Enhanced TextArea component with rich text support
const RichTextArea = ({ id, name, value, onChange, placeholder, required = false, rows = 2, className = "" }) => {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-vertical ${className}`}
      placeholder={placeholder}
      required={required}
      rows={rows}
      style={{
        fontFamily: "inherit",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
      }}
    />
  )
}

// Dialog component
const Dialog = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 transition-opacity" onClick={onClose}></div>
        <div
          className={`relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl ${className}`}
        >
          <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium leading-6 text-white border-b border-gray-700 pb-3 mb-4">{title}</h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReceivingPage() {
  const { addReceivingRecord, refreshData } = useBilletData()
  const { isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Google Sheet ID and Apps Script URL
  const SHEET_ID = "1Bu9dVCYBMwCBRwwtdxcNjOGVCtF6gIet_W82dwCq1B4"
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyxWc0X9zgyqgtfHfIlTplxFHEq2pe5IV46Ng0iJtzXvPlotLdQCyce92qd7iflmEuZTQ/exec"

  const [historyRecords, setHistoryRecords] = useState([])
  const [pendingProductionRecords, setPendingProductionRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBilletId, setSelectedBilletId] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [formData, setFormData] = useState({
    billetId: "",
    heatNumber: "",
    jobCard: "",
    time: "",
    receivingQtyMt: "",
    ledel: "",
    ccmTotalPieces: "",
    bpMillTo: "",
    bpCcmTo: "",
    millToPcs: "",
    remark: "",
  })

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Enhanced function to fetch PRODUCTION sheet data with updated conditions
  const fetchProductionData = async () => {
    try {
      console.log("Fetching data from PRODUCTION sheet starting from row 7...")

      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PRODUCTION`

      const response = await fetch(sheetUrl)
      const textData = await response.text()

      const jsonText = textData.substring(textData.indexOf("{"), textData.lastIndexOf("}") + 1)
      const parsedData = JSON.parse(jsonText)

      if (parsedData && parsedData.table) {
        const rows = parsedData.table.rows.map((row) => {
          return row.c.map((cell) => (cell ? (cell.v !== null ? cell.v : "") : ""))
        })

        // Skip first 6 rows (rows 1-6) and start from row 7 (index 6)
        const dataRows = rows.slice(6)

        // Filter rows based on conditions: Column O (index 14) NOT NULL and Column P (index 15) IS NULL/EMPTY
        const pendingRows = dataRows.filter((row, index) => {
          const actualRowNumber = index + 7 // Calculate actual row number in sheet (starting from row 7)
          const columnO = row[14] // Column O
          const columnP = row[15] // Column P
          
          const isColumnONotNull = columnO !== null && columnO !== "" && columnO !== undefined
          const isColumnPNull = columnP === null || columnP === "" || columnP === undefined
          
          console.log(`Row ${actualRowNumber}: Column O = "${columnO}", Column P = "${columnP}", Show = ${isColumnONotNull && isColumnPNull}`)
          
          return row.length >= 16 && isColumnONotNull && isColumnPNull
        })

        // Process the filtered data with column mapping starting from row 7
        // B7:B = Heat Number, C7:C = Drclo, D7:D = Pellet, E7:E = Lumps, F7:F = Scrap Common
        // G7:G = Scrap Grade, H7:H = Pig Iron, I7:I = Silico MN, J7:J = Feno Chrone
        // K7:K = Aluminium, L7:L = Anthracite coal, M7:M = Met coke, N7:N = Production (MT)
        const mappedPendingRecords = pendingRows.map((row, index) => {
          const actualRowIndex = dataRows.findIndex(r => r === row) // Find original index in dataRows
          const actualRowNumber = actualRowIndex + 7 // Calculate actual sheet row number
          
          return {
            id: `prod-${actualRowNumber}`,
            actualRowNumber: actualRowNumber, // Store actual row number for updates
            timestamp: row[14] || "", // Column O - Timestamp (for internal use only)
            jobCard: formatRichText(row[35] || ""), // Column AJ - Job Card
            heatNumber: formatRichText(row[1] || ""), // Column B7:B - Heat Number
            drclo: formatRichText(row[2] || ""), // Column C7:C - Drclo
            pellet: formatRichText(row[3] || ""), // Column D7:D - Pellet
            lumps: formatRichText(row[4] || ""), // Column E7:E - Lumps
            scrapCommon: formatRichText(row[5] || ""), // Column F7:F - Scrap Common
            scrapGrade: formatRichText(row[6] || ""), // Column G7:G - Scrap Grade
            pigIron: formatRichText(row[7] || ""), // Column H7:H - Pig Iron
            silicoMn: formatRichText(row[8] || ""), // Column I7:I - Silico MN
            fenoChrone: formatRichText(row[9] || ""), // Column J7:J - Feno Chrone
            aluminium: formatRichText(row[10] || ""), // Column K7:K - Aluminium
            anthraciteCoal: formatRichText(row[11] || ""), // Column L7:L - Anthracite coal
            metCoke: formatRichText(row[12] || ""), // Column M7:M - Met coke
            productionMt: formatRichText(row[13] || ""), // Column N7:N - Production (MT)
            billetId: `BILLET-${actualRowNumber}`, // Use actual row number for unique ID
          }
        })

        console.log("Mapped pending production records (Column O = Not Null, Column P = Null):", mappedPendingRecords)
        setPendingProductionRecords(mappedPendingRecords)
      } else {
        console.error("Failed to parse data from PRODUCTION sheet")
        toast({
          title: "Error",
          description: "Failed to parse production data from Google Sheet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching PRODUCTION sheet data:", error)
      toast({
        title: "Error",
        description: `Failed to fetch production data: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Enhanced function to fetch RECEIVING sheet data - get all data starting from row 2
  const fetchReceivingData = async () => {
    try {
      console.log("Fetching data from RECEIVING sheet starting from row 2...")

      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=RECEIVING`

      const response = await fetch(sheetUrl)
      const textData = await response.text()

      const jsonText = textData.substring(textData.indexOf("{"), textData.lastIndexOf("}") + 1)
      const parsedData = JSON.parse(jsonText)

      if (parsedData && parsedData.table) {
        const rows = parsedData.table.rows.map((row) => {
          return row.c.map((cell) => (cell ? (cell.v !== null ? cell.v : "") : ""))
        })

        // Skip row 1 (header, index 0) and get all data starting from row 2 (index 1)
        const dataRows = rows.slice(1)

        // Process all receiving records with column mapping from row 2 onwards:
        // A2:A = Timestamp, B2:B = Heat Number, C2:C = Time, D2:D = Receiving Qty (MT)
        // E2:E = LEDEL, F2:F = CCM TOTAL PIECES, G2:G = B.P. MILL TO, H2:H = B.P. CCM TO
        // I2:I = MILL TO. Pcs., J2:J = Remark
        const mappedReceivingRecords = dataRows.map((row, index) => ({
          id: `receiving-${index}`,
          timestamp: row[0] || "", // Column A2:A - Timestamp
          heatNumber: formatRichText(row[1] || ""), // Column B2:B - Heat Number
          time: row[2] || "", // Column C2:C - Time
          receivingQtyMt: formatRichText(row[3] || ""), // Column D2:D - Receiving Qty (MT)
          ledel: formatRichText(row[4] || ""), // Column E2:E - LEDEL
          ccmTotalPieces: formatRichText(row[5] || ""), // Column F2:F - CCM TOTAL PIECES
          bpMillTo: formatRichText(row[6] || ""), // Column G2:G - B.P. MILL TO
          bpCcmTo: formatRichText(row[7] || ""), // Column H2:H - B.P. CCM TO
          millToPcs: formatRichText(row[8] || ""), // Column I2:I - MILL TO. Pcs.
          remark: formatRichText(row[9] || ""), // Column J2:J - Remark
          jobCard: formatRichText(row[10] || ""), // Column K2:K - Job Card
        }))

        console.log("Mapped receiving records from row 2 onwards:", mappedReceivingRecords)
        setHistoryRecords(mappedReceivingRecords)
      } else {
        console.error("Failed to parse data from RECEIVING sheet")
        toast({
          title: "Error",
          description: "Failed to parse receiving data from Google Sheet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching RECEIVING sheet data:", error)
      toast({
        title: "Error",
        description: `Failed to fetch receiving data: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Enhanced function to submit data to the RECEIVING sheet with rich text support
  const submitToReceivingSheet = async (data) => {
    try {
      const date = new Date()
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      const timestamp = `${day}/${month}/${year}`

      // Enhanced data processing to handle rich text and special characters
      const processRichText = (text) => {
        if (!text) return ""
        // Preserve line breaks, special characters, emojis, and formatting
        return String(text)
          .trim()
          .replace(/\r\n/g, "\n") // Normalize line breaks
          .replace(/\r/g, "\n") // Handle different line break formats
      }

      const rowData = [
        timestamp,
        processRichText(data.heatNumber),
        processRichText(data.time),
        processRichText(data.receivingQtyMt),
        processRichText(data.ledel),
        processRichText(data.ccmTotalPieces),
        processRichText(data.bpMillTo),
        processRichText(data.bpCcmTo),
        processRichText(data.millToPcs),
        processRichText(data.remark),
        processRichText(data.jobCard), // Column K - Job Card
      ]

      console.log("Submitting to RECEIVING sheet:", rowData)

      const formData = new FormData()
      formData.append("sheetName", "RECEIVING")
      formData.append("action", "insert")
      formData.append("rowData", JSON.stringify(rowData))

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        await updateProductionStatus(data.billetId)
        return { success: true }
      } else {
        throw new Error(result.error || "Failed to submit data to RECEIVING sheet")
      }
    } catch (error) {
      console.error("Error submitting to RECEIVING sheet:", error)
      throw error
    }
  }

  // Function to update the status in the PRODUCTION sheet for specific row
  const updateProductionStatus = async (billetId) => {
    try {
      // Extract the actual row number from billetId (format: BILLET-7, BILLET-8, etc.)
      const rowNumber = parseInt(billetId.replace('BILLET-', ''))
      
      console.log(`Updating PRODUCTION sheet row ${rowNumber}, Column P with timestamp`)
      
      const formData = new FormData()
      formData.append("sheetName", "PRODUCTION")
      formData.append("action", "updateCell")
      formData.append("rowIndex", rowNumber) // Use actual row number (7, 8, 9, etc.)
      formData.append("columnIndex", 16) // Column P (index 15, but 1-based for Apps Script = 16)
      formData.append("value", new Date().toISOString())

      const markResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })

      const markResult = await markResponse.json()
      if (!markResult.success) {
        throw new Error(markResult.error || "Failed to mark production record as processed")
      }

      console.log(`Successfully updated row ${rowNumber}, Column P in PRODUCTION sheet`)
      return true
    } catch (error) {
      console.error("Error updating production status:", error)
      return false
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        console.log("Initial data fetch started...")

        await refreshData()

        console.log("Fetching PRODUCTION and RECEIVING sheet data...")
        await Promise.all([fetchProductionData(), fetchReceivingData()])

        console.log("Initial data fetch completed")
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        setIsLoading(false)
      }
    }

    if (isMounted && !authLoading) {
      fetchData()
    }
  }, [isMounted, authLoading, refreshData])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
      await Promise.all([fetchProductionData(), fetchReceivingData()])

      toast({
        title: "Success",
        description: "Data refreshed successfully.",
      })
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

  const openDialog = (billetId) => {
    const record = pendingProductionRecords.find((r) => r.billetId === billetId)

    setSelectedRecord(record)
    setSelectedBilletId(billetId)

    setFormData({
      heatNumber: record ? record.heatNumber : "",
      jobCard: record ? record.jobCard : "",
      time: "",
      receivingQtyMt: "",
      ledel: "",
      ccmTotalPieces: "",
      bpMillTo: "",
      bpCcmTo: "",
      millToPcs: "",
      remark: "",
    })

    setIsDialogOpen(true)
  }

  // Enhanced handleSubmit function with rich text support
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (
      !formData.ccmTotalPieces ||
      !formData.bpMillTo ||
      !formData.bpCcmTo ||
      !formData.millToPcs
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Create new record with rich text support
    const newRecord = {
      billetId: selectedBilletId,
      heatNumber: selectedRecord?.heatNumber || "",
      jobCard: selectedRecord?.jobCard || "",
      time: formData.time,
      receivingQtyMt: formData.receivingQtyMt,
      ledel: formData.ledel,
      ccmTotalPieces: formData.ccmTotalPieces,
      bpMillTo: formData.bpMillTo,
      bpCcmTo: formData.bpCcmTo,
      millToPcs: formData.millToPcs,
      remark: formData.remark,
    }

    console.log("Submitting record:", newRecord)

    try {
      const result = await submitToReceivingSheet(newRecord)

      if (result.success) {
        addReceivingRecord({
          ...newRecord,
          status: "completed",
          timestamp: new Date().toISOString(),
        })

        toast({
          title: "Success",
          description: "Billet receiving record created successfully.",
        })

        setFormData({
          billetId: "",
          heatNumber: "",
          jobCard: "",
          time: "",
          receivingQtyMt: "",
          ledel: "",
          ccmTotalPieces: "",
          bpMillTo: "",
          bpCcmTo: "",
          millToPcs: "",
          remark: "",
        })
        setIsDialogOpen(false)

        console.log("Waiting for Google Sheets to process data...")
        setTimeout(async () => {
          try {
            console.log("Refreshing data after submission...")
            await Promise.all([fetchProductionData(), fetchReceivingData()])
            console.log("Data refresh completed")
          } catch (error) {
            console.error("Error during delayed refresh:", error)
          }
        }, 2000)
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: `Failed to submit data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <Layers className="mr-2 h-8 w-8" />
              Billet Receiving
            </h1>
            <p className="text-gray-400 mt-1">Manage the receiving process for produced billets</p>
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
              Pending
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
              History
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
              pendingProductionRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending receiving records found.</p>
                  <p className="mt-2">Complete billet production first to see records here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="px-2 py-2 font-medium text-xs">Job Card</th>
                        <th className="px-2 py-2 font-medium text-xs">Heat Number</th>
                        <th className="px-2 py-2 font-medium text-xs">Drclo</th>
                        <th className="px-2 py-2 font-medium text-xs">Pellet</th>
                        <th className="px-2 py-2 font-medium text-xs">Lumps</th>
                        <th className="px-2 py-2 font-medium text-xs">Scrap Common</th>
                        <th className="px-2 py-2 font-medium text-xs">Scrap Grade</th>
                        <th className="px-2 py-2 font-medium text-xs">Pig Iron</th>
                        <th className="px-2 py-2 font-medium text-xs">Silico MN</th>
                        <th className="px-2 py-2 font-medium text-xs">Feno Chrone</th>
                        <th className="px-2 py-2 font-medium text-xs">Aluminium</th>
                        <th className="px-2 py-2 font-medium text-xs">Anthracite coal</th>
                        <th className="px-2 py-2 font-medium text-xs">Met coke</th>
                        <th className="px-2 py-2 font-medium text-xs">Production (MT)</th>
                        <th className="px-2 py-2 font-medium text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProductionRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-600 hover:bg-gray-800">
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.jobCard} maxWidth="max-w-24" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.heatNumber} maxWidth="max-w-24" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.drclo} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.pellet} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.lumps} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.scrapCommon} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.scrapGrade} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.pigIron} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.silicoMn} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.fenoChrone} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.aluminium} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.anthraciteCoal} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.metCoke} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2 text-xs">
                            <RichTextDisplay text={record.productionMt} maxWidth="max-w-20" />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openDialog(record.billetId)}
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
              )
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No receiving history records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="px-4 py-2 font-medium">Timestamp</th>
                      <th className="px-4 py-2 font-medium">Job Card</th>
                      <th className="px-4 py-2 font-medium">Heat Number</th>
                      <th className="px-4 py-2 font-medium">Time</th>
                      <th className="px-4 py-2 font-medium">Receiving Qty (MT)</th>
                      <th className="px-4 py-2 font-medium">LEDEL</th>
                      <th className="px-4 py-2 font-medium">CCM TOTAL PIECES</th>
                      <th className="px-4 py-2 font-medium">B.P. MILL TO</th>
                      <th className="px-4 py-2 font-medium">B.P. CCM TO</th>
                      <th className="px-4 py-2 font-medium">MILL TO. Pcs.</th>
                      <th className="px-4 py-2 font-medium">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.map((record, index) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-800">
                        <td className="px-4 py-2">
                          <RichTextDisplay text={formatDateDDMMYYYY(record.timestamp)} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <RichTextDisplay text={record.jobCard} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <RichTextDisplay text={record.heatNumber} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={formatTimeAMPM(record.time)} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.receivingQtyMt} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.ledel} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.ccmTotalPieces} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.bpMillTo} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.bpCcmTo} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.millToPcs} maxWidth="max-w-32" />
                        </td>
                        <td className="px-4 py-2">
                          <RichTextDisplay text={record.remark} maxWidth="max-w-48" />
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

      {/* Enhanced Process Dialog with Rich Text Support */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Process Billet Receiving"
        className="bg-gray-800 rounded-lg shadow-xl sm:max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Display billet ID and heat number as header info */}
          <div className="bg-gray-700 p-2 rounded-md mb-3 flex justify-between items-center">
            <div className="flex gap-4">
              <div>
                <p className="text-gray-300 text-xs">Job Card:</p>
                <div className="text-white font-medium break-words text-sm">
                  <RichTextDisplay text={selectedRecord?.jobCard} maxWidth="max-w-full" />
                </div>
              </div>
              <div>
                <p className="text-gray-300 text-xs">Heat Number:</p>
                <div className="text-white font-medium break-words text-sm">
                  <RichTextDisplay text={selectedRecord?.heatNumber} maxWidth="max-w-full" />
                </div>
              </div>
            </div>
          </div>

          <input id="billetId" name="billetId" value={formData.billetId} type="hidden" />
          <input id="heatNumber" name="heatNumber" value={formData.heatNumber} type="hidden" />
          <input id="jobCard" name="jobCard" value={formData.jobCard} type="hidden" />

          <div>
            <label htmlFor="time" className="block text-xs font-medium mb-1 text-gray-200">
              Time
            </label>
            <RichTextArea
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              placeholder="Enter time"
              required={false}
              rows={1}
              className="text-sm"
            />
          </div>

          <div>
            <label htmlFor="receivingQtyMt" className="block text-xs font-medium mb-1 text-gray-200">
              Receiving Qty (MT)
            </label>
            <RichTextArea
              id="receivingQtyMt"
              name="receivingQtyMt"
              value={formData.receivingQtyMt}
              onChange={handleInputChange}
              placeholder="Enter receiving quantity"
              required={false}
              rows={1}
              className="text-sm"
            />
          </div>

          <div>
            <label htmlFor="ledel" className="block text-xs font-medium mb-1 text-gray-200">
              Ledel
            </label>
            <RichTextArea
              id="ledel"
              name="ledel"
              value={formData.ledel}
              onChange={handleInputChange}
              placeholder="Enter ledel information"
              required={false}
              rows={1}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ccmTotalPieces" className="block text-xs font-medium mb-1 text-gray-200">
                CCM Total Pieces *
              </label>
              <RichTextArea
                id="ccmTotalPieces"
                name="ccmTotalPieces"
                value={formData.ccmTotalPieces}
                onChange={handleInputChange}
                placeholder="Enter CCM total pieces"
                required={true}
                rows={1}
                className="text-sm"
              />
            </div>
            <div>
              <label htmlFor="bpMillTo" className="block text-xs font-medium mb-1 text-gray-200">
                BP Mill TO *
              </label>
              <RichTextArea
                id="bpMillTo"
                name="bpMillTo"
                value={formData.bpMillTo}
                onChange={handleInputChange}
                placeholder="Enter BP Mill TO"
                required={true}
                rows={1}
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="bpCcmTo" className="block text-xs font-medium mb-1 text-gray-200">
                BP CCM TO *
              </label>
              <RichTextArea
                id="bpCcmTo"
                name="bpCcmTo"
                value={formData.bpCcmTo}
                onChange={handleInputChange}
                placeholder="Enter BP CCM TO"
                required={true}
                rows={1}
                className="text-sm"
              />
            </div>
            <div>
              <label htmlFor="millToPcs" className="block text-xs font-medium mb-1 text-gray-200">
                Mill TO Pcs *
              </label>
              <RichTextArea
                id="millToPcs"
                name="millToPcs"
                value={formData.millToPcs}
                onChange={handleInputChange}
                placeholder="Enter Mill TO Pcs"
                required={true}
                rows={1}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="remark" className="block text-xs font-medium mb-1 text-gray-200">
              Remark
            </label>
            <RichTextArea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              placeholder="Enter remarks"
              required={false}
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-700 mt-4">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-3 py-1.5 border border-gray-500 text-gray-200 rounded-md hover:bg-gray-700 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
