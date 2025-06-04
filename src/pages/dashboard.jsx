"use client"

import { useState, useEffect } from "react"
import { useBilletData } from "../lib/billet-context.jsx"
import { useAuth } from "../lib/auth-context.jsx"
import Header from "../components/header.jsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { RefreshCw, BarChart3, Recycle, Package, Calculator, Clock } from "lucide-react"

// Google Sheet ID and Apps Script URL
const SHEET_ID = "1Bu9dVCYBMwCBRwwtdxcNjOGVCtF6gIet_W82dwCq1B4"
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyxWc0X9zgyqgtfHfIlTplxFHEq2pe5IV46Ng0iJtzXvPlotLdQCyce92qd7iflmEuZTQ/exec"

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
  const [timeRange, setTimeRange] = useState("all")
  const [sheetData, setSheetData] = useState({
    totalProduction: 0,
    totalScrapGrade: 0,
    totalScrapCommon: 0,
    totalReceiving: 0,
    avgProduction: 0,
    pendingProduction: 0,
    pendingReceiving: 0,
    pendingLabTesting: 0,
    productionData: [],
  })

  // Fetch data from Google Sheets
  const fetchSheetData = async () => {
    try {
      // Fetch PRODUCTION sheet data
      const productionUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PRODUCTION`
      const productionResponse = await fetch(productionUrl)
      const productionText = await productionResponse.text()
      const productionJson = JSON.parse(
        productionText.substring(productionText.indexOf("{"), productionText.lastIndexOf("}") + 1),
      )

      // Fetch RECEIVING sheet data
      const receivingUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=RECEIVING`
      const receivingResponse = await fetch(receivingUrl)
      const receivingText = await receivingResponse.text()
      const receivingJson = JSON.parse(
        receivingText.substring(receivingText.indexOf("{"), receivingText.lastIndexOf("}") + 1),
      )

      // Fetch LAB TESTING sheet data
      const labTestingUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=LAB%20TESTING`
      const labTestingResponse = await fetch(labTestingUrl)
      const labTestingText = await labTestingResponse.text()
      const labTestingJson = JSON.parse(
        labTestingText.substring(labTestingText.indexOf("{"), labTestingText.lastIndexOf("}") + 1),
      )

      // Process PRODUCTION data with safe defaults
      const productionRows =
        productionJson?.table?.rows?.map((row) => {
          return row.c.map((cell) => (cell ? (cell.v !== null ? cell.v : "") : ""))
        }) || []

      // Calculate totals from PRODUCTION sheet starting from row 7 (index 6)
      const totalProduction = productionRows.slice(6).reduce((sum, row) => sum + (Number.parseFloat(row[13]) || 0), 0) // Column N (index 13)
      const totalScrapGrade = productionRows.slice(6).reduce((sum, row) => sum + (Number.parseFloat(row[6]) || 0), 0) // Column G (index 6) for Grade
      const totalScrapCommon = productionRows.slice(6).reduce((sum, row) => sum + (Number.parseFloat(row[5]) || 0), 0) // Column F (index 5) for Common
      const avgProduction = totalScrapGrade + totalScrapCommon // Addition of Total Scrap Grade + Total Scrap Common

      // Process RECEIVING data with safe defaults
      const receivingRows =
        receivingJson?.table?.rows?.map((row) => {
          return row.c.map((cell) => (cell ? (cell.v !== null ? cell.v : "") : ""))
        }) || []

      // Calculate total receiving from Column D (index 3) as per requirement
      const totalReceiving = receivingRows.slice(1).reduce((sum, row) => sum + (Number.parseFloat(row[3]) || 0), 0)

      // Process LAB TESTING data with safe defaults
      const labTestingRows =
        labTestingJson?.table?.rows?.map((row) => {
          return row.c.map((cell) => (cell ? (cell.v !== null ? cell.v : "") : ""))
        }) || []

      // Pending receiving - using PRODUCTION sheet Column O (index 14) NOT NULL and Column P (index 15) NULL
      const pendingReceiving = productionRows
        .slice(6)
        .filter(
          (row) => row[14] && row[14].toString().trim() !== "" && (!row[15] || row[15].toString().trim() === ""),
        ).length

      // Pending lab testing - using PRODUCTION sheet Column Z (index 25) NOT NULL and Column AA (index 26) NULL
      const pendingLabTesting = productionRows
        .slice(6)
        .filter(
          (row) => row[25] && row[25].toString().trim() !== "" && (!row[26] || row[26].toString().trim() === ""),
        ).length

      // Prepare production data for chart (starting from row 7, last 30 days)
      const productionData = productionRows.slice(6).map((row) => {
        // Get the date string from the sheet (assuming it's in column 0)
        const dateStr = row[0] || ""
        let parsedDate

        // Parse date based on format
        if (dateStr.includes("T")) {
          // It's an ISO format date (2025-05-07T07:08:32.494Z)
          parsedDate = new Date(dateStr)
        } else if (dateStr.includes("/")) {
          // It's a dd/mm/yyyy format
          const [day, month, year] = dateStr.split("/").map(Number)
          // Note: months are 0-indexed in JavaScript Date
          parsedDate = new Date(year, month - 1, day)
        } else {
          // Handle any other format or return a placeholder
          parsedDate = new Date()
        }

        // Format all dates consistently for the chart
        const day = parsedDate.getDate().toString().padStart(2, "0")
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0")
        const year = parsedDate.getFullYear()
        const standardizedDate = `${day}/${month}/${year}`

        // Get values for calculation
        const production = Number.parseFloat(row[13]) || 0 // Column N
        const scrapGrade = Number.parseFloat(row[6]) || 0 // Column G for Grade
        const scrapCommon = Number.parseFloat(row[5]) || 0 // Column F for Common
        const totalScrap = scrapGrade + scrapCommon

        // Conversion rate calculation: (Production / Total Scrap) * 100
        const conversionRate = totalScrap > 0 ? (production / totalScrap) * 100 : 0

        return {
          date: standardizedDate,
          production: production,
          scrapGrade: scrapGrade,
          scrapCommon: scrapCommon,
          conversionRate: conversionRate,
        }
      })

      const pendingProduction = 0 // Declare pendingProduction variable

      setSheetData({
        totalProduction,
        totalScrapGrade,
        totalScrapCommon,
        totalReceiving,
        avgProduction,
        pendingProduction,
        pendingReceiving,
        pendingLabTesting,
        productionData: productionData.slice(-30),
      })
    } catch (error) {
      console.error("Error fetching sheet data:", error)
      // Set default values in case of error
      setSheetData({
        totalProduction: 0,
        totalScrapGrade: 0,
        totalScrapCommon: 0,
        totalReceiving: 0,
        avgProduction: 0,
        pendingProduction: 0,
        pendingReceiving: 0,
        pendingLabTesting: 0,
        productionData: [],
      })
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await refreshData()
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    await fetchSheetData()
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

  // Prepare data for scrap to production conversion graph
  const graphData = sheetData.productionData.map((record) => {
    // The date should already be in dd/mm/yyyy format from our fetching logic
    // If we need to process it further for display in the graph, we can do it here

    // For a shorter display format on the graph x-axis, we can convert to "DD MMM" format
    // but ONLY if a valid date (to avoid "Invalid Date" in the chart)
    let displayDate = record.date

    if (record.date && record.date.includes("/")) {
      try {
        // Parse the dd/mm/yyyy format
        const [day, month, year] = record.date.split("/").map(Number)
        const date = new Date(year, month - 1, day)

        // Format as "DD MMM" (e.g., "07 May")
        if (!isNaN(date.getTime())) {
          // Check if date is valid
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          displayDate = `${day} ${months[month - 1]}`
        }
      } catch (e) {
        // If parsing fails, keep the original format
        console.error("Date parsing error:", e)
      }
    }

    return {
      name: displayDate,
      scrapGrade: record.scrapGrade,
      scrapCommon: record.scrapCommon,
      production: record.production,
      conversionRate: record.conversionRate,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-500">Production Dashboard</h1>
            <p className="text-gray-400 mt-1">Monitor and analyze your production records</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-cyan-200 text-cyan-600 hover:bg-cyan-50 rounded-md flex items-center"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          {/* Total Production Card */}
          <div className="bg-gray-800 rounded-lg shadow-md border border-cyan-600 overflow-hidden">
            <div className="p-4 border-b border-cyan-100">
              <h3 className="text-lg text-cyan-400 flex items-center font-medium">
                <BarChart3 className="mr-2 h-5 w-5" />
                Total Production
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-800 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{sheetData.totalProduction.toFixed(2)} MT</div>
                  <p className="text-gray-400 text-sm">{sheetData.productionData.length} records</p>
                </>
              )}
            </div>
          </div>

          {/* Total Scrap Grade Card */}
          <div className="bg-gray-800 rounded-lg shadow-md border border-red-200 overflow-hidden">
            <div className="p-4 border-b border-red-400">
              <h3 className="text-lg text-red-400 flex items-center font-medium">
                <Recycle className="mr-2 h-5 w-5" />
                Total Scrap Grade
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-800 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{sheetData.totalScrapGrade.toFixed(2)} MT</div>
                  <p className="text-gray-400 text-sm">
                    {sheetData.totalProduction > 0
                      ? ((sheetData.totalScrapGrade / sheetData.totalProduction) * 100).toFixed(1)
                      : 0}
                    % of production
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Total Scrap Common Card */}
          <div className="bg-gray-800 rounded-lg shadow-md border border-orange-200 overflow-hidden">
            <div className="p-4 border-b border-orange-400">
              <h3 className="text-lg text-orange-400 flex items-center font-medium">
                <Recycle className="mr-2 h-5 w-5" />
                Total Scrap Common
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-800 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{sheetData.totalScrapCommon.toFixed(2)} MT</div>
                  <p className="text-gray-400 text-sm">
                    {sheetData.totalProduction > 0
                      ? ((sheetData.totalScrapCommon / sheetData.totalProduction) * 100).toFixed(1)
                      : 0}
                    % of production
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Total Receiving Qty Card - Updated to use Column D */}
          <div className="bg-gray-800 rounded-lg shadow-md border border-teal-800 overflow-hidden">
            <div className="p-4 border-b border-teal-100">
              <h3 className="text-lg text-teal-500 flex items-center font-medium">
                <Package className="mr-2 h-5 w-5" />
                Total Receiving Qty
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{sheetData.totalReceiving.toFixed(2)} MT</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{sheetData.productionData.length} records</p>
                </>
              )}
            </div>
          </div>

          {/* Avg Production Card */}
          <div className="bg-gray-800 rounded-lg shadow-md border border-amber-800 overflow-hidden">
            <div className="p-4 border-b border-amber-800">
              <h3 className="text-lg text-amber-400 flex items-center font-medium">
                <Calculator className="mr-2 h-5 w-5" />
                Avg Production
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{sheetData.avgProduction.toFixed(2)} MT</div>
                  <p className="text-gray-400 text-sm">Grade + Common scrap total</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pending Tasks - updated with correct column references */}
        <div className="bg-gray-800 rounded-lg shadow-md border border-teal-800 overflow-hidden mb-6">
          <div className="p-4 border-b border-teal-800">
            <h3 className="text-lg text-teal-400 flex items-center font-medium">
              <Clock className="mr-2 h-5 w-5" />
              Pending Tasks
            </h3>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <>
                <div className="text-3xl font-bold">{sheetData.pendingReceiving + sheetData.pendingLabTesting}</div>
                <p className="text-gray-400 text-sm">Total pending tasks</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Receiving:</span>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {sheetData.pendingReceiving}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lab Testing:</span>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {sheetData.pendingLabTesting}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrap to Production Conversion Graph - updated with new scrap categories */}
        <div className="bg-gray-800 rounded-lg shadow-md border border-cyan-800 overflow-hidden">
          <div className="p-4 border-b border-cyan-800">
            <h3 className="text-lg text-cyan-400 flex items-center font-medium">
              <BarChart3 className="mr-2 h-5 w-5" />
              Scrap to Production Conversion
            </h3>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="h-80 w-full bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={graphData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      label={{ value: "MT", angle: -90, position: "insideLeft" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{ value: "%", angle: 90, position: "insideRight" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "conversionRate") return [`${value.toFixed(2)}%`, "Conversion Rate"]
                        return [`${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="scrapGrade" name="Scrap Grade (MT)" fill="#ef4444" />
                    <Bar yAxisId="left" dataKey="scrapCommon" name="Scrap Common (MT)" fill="#f97316" />
                    <Bar yAxisId="left" dataKey="production" name="Production (MT)" fill="#0ea5e9" />
                    <Bar yAxisId="right" dataKey="conversionRate" name="Conversion Rate (%)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}