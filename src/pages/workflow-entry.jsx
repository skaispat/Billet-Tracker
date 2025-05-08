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
    className={className}ƒ
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
    metCook: "",
    silicoMn: "",
    authoriseCook: "",
    scrapCmd: "",
    productionCmd: "",
  })

  // Google Apps Script URL
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwC2k1f5A143OSGeZBa4nb5AyfOX38V5boR2v6U2Ezd-VrResg4xVp6Moizd0U0GWJ-/exec";
  
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

  const submitToGoogleSheet = async (data) => {
    try {
      const billetId = generateBilletId();
      // Prepare the data for Google Sheets
      // The order should match your sheet columns
      // const timestamp = new Date().toISOString(); // Timestamp as first column

      const date = new Date();
const day = String(date.getDate()).padStart(2, '0');
const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
const year = date.getFullYear();
const timestamp = `${day}/${month}/${year}`;
      const rowData = [
        timestamp, // First column is timestamp
        data.heatNumber,
        data.drCell,
        data.pilot,
        data.metCook,
        data.silicoMn,
        data.authoriseCook,
        Number.parseFloat(data.scrapCmd),
        Number.parseFloat(data.productionCmd),
        // billetId // Last column is billet ID
      ];

      // Create form data for the POST request
      const formData = new FormData();
      formData.append('sheetName', 'PRODUCTION');
      formData.append('action', 'insert');
      formData.append('rowData', JSON.stringify(rowData));

      // Send the data to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, billetId };
      } else {
        throw new Error(result.error || 'Failed to submit data to Google Sheet');
      }
    } catch (error) {
      console.error('Error submitting to Google Sheet:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit to Google Sheet
      const result = await submitToGoogleSheet(formData);
      
      if (result.success) {
        // Create new record for local state with the generated ID
        const newRecord = {
          ...formData,
          // billetId: result.billetId, // Store the billet ID in local state
          scrapCmd: Number.parseFloat(formData.scrapCmd),
          productionCmd: Number.parseFloat(formData.productionCmd),
          timestamp: new Date().toISOString(), // Also store timestamp
        };

        // Add to local state
        addRecord(newRecord);

        // Show success toast
        toast({
          title: "Success",
          description: `Billet production record created successfully with ID: ${result.billetId}`,
        });

        // Reset form
        setFormData({
          heatNumber: "",
          drCell: "",
          pilot: "",
          metCook: "",
          silicoMn: "",
          authoriseCook: "",
          scrapCmd: "",
          productionCmd: "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to submit data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
  // if (!hasPermission("production")) {
  //   navigate("/dashboard")
  //   return null
  // }

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
            <p className="text-sm text-gray-400">Billet ID will be auto-generated upon submission</p>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="heatNumber" className="block text-sm font-medium mb-1">
                  Heat Number
                </label>
                <input
                  id="heatNumber"
                  name="heatNumber"
                  value={formData.heatNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-900"
                  placeholder="Enter heat number"
                  required
                />
              </div>
              <div>
                <label htmlFor="drCell" className="block text-sm font-medium mb-1">
                Drclo
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
                  Pellet
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
                  Met coke
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
                  Silicon MN
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
                  Anthracite coal
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
                  Scrap ( MT)
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
                  Production ( MT )
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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