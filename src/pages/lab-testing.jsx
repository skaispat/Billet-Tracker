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
  let date;
  
  // Handle Date object or ISO string
  if (dateValue instanceof Date) {
    date = dateValue;
  } 
  // Handle string date values
  else if (typeof dateValue === 'string') {
    // Check if it's in Google Sheets Date(year,month,day) format
    if (dateValue.startsWith('Date(')) {
      const dateParts = dateValue.replace('Date(', '').replace(')', '').split(',');
      // Note: months are 0-based in JavaScript Date
      date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]), parseInt(dateParts[2]));
    } else {
      // Try to parse as ISO string or other date format
      date = new Date(dateValue);
    }
  } 
  // If we can't parse it or it's invalid, return the original
  else {
    return dateValue;
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateValue;
  }
  
  // Format as dd/mm/yyyy
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Format time as h:mm AM/PM
const formatTimeAMPM = (timeValue) => {
  // Handle Google Sheets Date format for time (Date(1899,11,30,15,24,0))
  if (typeof timeValue === 'string' && timeValue.startsWith('Date(')) {
    const timeParts = timeValue.replace('Date(', '').replace(')', '').split(',');
    // Extract hours, minutes from the parts (ignore the date part)
    const hours = parseInt(timeParts[3]);
    const minutes = parseInt(timeParts[4]);
    
    // Format as 12-hour time with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // If it's just a normal time string (like "15:24"), convert it to 12-hour format
  if (typeof timeValue === 'string' && timeValue.includes(':')) {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // If we couldn't parse it, return the original
  return timeValue;
};

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
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
  const [labTestingSheetRecords, setLabTestingSheetRecords] = useState([]);

  // Google Sheet ID and Apps Script URL
  const SHEET_ID = "1CGfnqtgWTWBNRgX2RvwRrPqR8rTKUae6moVDfWMH88I";
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwC2k1f5A143OSGeZBa4nb5AyfOX38V5boR2v6U2Ezd-VrResg4xVp6Moizd0U0GWJ-/exec";

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
    heatNumber: "",
    carbon: "",
    sulfur: "",
    magnesium: "",
    phosphorus: "",
    status: "pass",
    needTestingAgain: "no",
    remarks: "",
  })

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Add this function to fetch LAB TESTING sheet data directly
  const fetchLabTestingSheetData = async () => {
    try {
      console.log("Fetching data from LAB TESTING sheet...");
      
      // Use the direct Google Sheets URL format
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=LAB%20TESTING`;
      
      const response = await fetch(sheetUrl);
      const textData = await response.text();
      
      // Parse the response
      const jsonText = textData.substring(
        textData.indexOf('{'),
        textData.lastIndexOf('}') + 1
      );
      
      const parsedData = JSON.parse(jsonText);
      
      if (parsedData && parsedData.table) {
        // Get the column headers from the first row
        const headers = parsedData.table.cols.map(col => col.label);
        
        // Convert the table data to rows
        const rows = parsedData.table.rows.map(row => {
          return row.c.map(cell => {
            // Properly handle Google Sheets date format
            if (cell && cell.v !== null) {
              // If it's a Google Sheets date cell
              if (cell.f && typeof cell.v === 'object' && cell.v.toString() === '[object Object]') {
                return cell.f; // Use the formatted value which is often "Date(...)"
              }
              return cell.v;
            }
            return "";
          });
        });
        
        // Map the rows to our data model
        const labTestingRecords = rows.map((row, index) => ({
          id: `labtest-${index}`,
          timestamp: row[0] || "",     // Column A - Timestamp
          heatNumber: row[1] || "",    // Column B - Heat Number
          carbon: row[2] || "",        // Column C - Carbon %
          sulfur: row[3] || "",        // Column D - Sulfur %
          magnesium: row[4] || "",     // Column E - Magnesium %
          phosphorus: row[5] || "",    // Column F - Phosphorus %
          status: row[6] || "pass",    // Column G - Status
          needTestingAgain: row[7] || "no", // Column H - Need Testing Again?
          remarks: row[8] || "",       // Column I - Remarks
          completed: true              // Set to completed for history records
        }));
        
        return labTestingRecords;
      } else {
        console.error("Failed to parse data from LAB TESTING sheet");
        toast({
          title: "Error",
          description: "Failed to parse data from LAB TESTING sheet.",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      console.error("Error fetching LAB TESTING sheet data:", error);
      toast({
        title: "Error",
        description: `Failed to fetch LAB TESTING data: ${error.message}`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to fetch Google Sheets data directly using gviz/tq endpoint
  // Replace your existing fetchSheetData function with this updated version
const fetchSheetData = async () => {
  try {
    console.log("Fetching data from Google Sheet...");
    
    // Use the direct Google Sheets URL format
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PRODUCTION`;
    
    const response = await fetch(sheetUrl);
    const textData = await response.text();
    
    // The gviz response comes with some prefix we need to remove
    const jsonText = textData.substring(
      textData.indexOf('{'),
      textData.lastIndexOf('}') + 1
    );
    
    const parsedData = JSON.parse(jsonText);
    
    if (parsedData && parsedData.table) {
      // Convert the table data to rows
      const rows = parsedData.table.rows.map(row => {
        return row.c.map(cell => cell ? (cell.v !== null ? cell.v : "") : "");
      });
      
      // Process the data to find rows where:
      // Column S (index 18) is not null AND Column T (index 19) is null
      const pendingRows = rows.filter(row => {
        // Make sure we have enough columns
        if (row.length < 20) return false;
        
        // Check if S is not empty and T is empty
        const columnS = row[20] ? row[20].toString().trim() : "";
        const columnT = row[21] ? row[21].toString().trim() : "";
        
        return columnS !== "" && columnT === "";
      });
      
      console.log("Found pending lab test records:", pendingRows.length);
      
      // Map the filtered rows to our data model
      const mappedRecords = pendingRows.map((row, index) => ({
        id: `prod-${index}`,
        heatNumber: row[1] || "", // Column B
        drCell: row[2] || "", // Column C
        pilot: row[3] || "", // Column D
        metCook: row[4] || "", // Column E
        silicoMn: row[5] || "", // Column F
        authoriseCook: row[6] || "", // Column G
        scrapCmd: row[7] || "", // Column H
        productionCmd: row[8] || "", // Column I
        billetId: row[9] || "", // Column J (this is the Billet ID)
        status: "pending"
      }));
      
      setPendingProductionRecords(mappedRecords);
    } else {
      console.error("Failed to parse data from Google Sheet");
      toast({
        title: "Error",
        description: "Failed to parse production data from Google Sheet.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    toast({
      title: "Error",
      description: `Failed to fetch data: ${error.message}`,
      variant: "destructive",
    });
  }
};

  // Function to submit data to the LAB TESTING sheet
  const submitToLabTestingSheet = async (data) => {
    try {
      // Prepare the data for the LAB TESTING sheet
      // Format the data according to your sheet structure
      const rowData = [
        new Date().toISOString(), // Timestamp - always first column
        data.heatNumber,          // Heat Number
        data.carbon,              // Carbon %
        data.sulfur,              // Sulfur %
        data.magnesium,           // Magnesium %
        data.phosphorus,          // Phosphorus %
        data.status,              // Status
        data.needTestingAgain,    // Need Testing Again?
        data.remarks,             // Remarks
        "completed"               // Completed status
      ];

      // Use your existing Apps Script to insert the data
      const formData = new FormData();
      formData.append('sheetName', 'LAB TESTING');
      formData.append('action', 'insert');
      formData.append('rowData', JSON.stringify(rowData));

      // Send the data to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Also update the PRODUCTION sheet to mark this row as lab-tested
        await updateProductionLabStatus(data.billetId);
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to submit data to LAB TESTING sheet');
      }
    } catch (error) {
      console.error('Error submitting to LAB TESTING sheet:', error);
      throw error;
    }
  };

  // Function to update the lab testing status in the PRODUCTION sheet
  // Function to update the lab testing status in the PRODUCTION sheet
const updateProductionLabStatus = async (billetId) => {
  try {
    // First create a FormData object for the API call
    const formData = new FormData();
    formData.append('sheetName', 'PRODUCTION');
    formData.append('action', 'markLabTested'); // This action should be implemented in your Apps Script
    formData.append('billetId', billetId); // The billet ID to find the row
    formData.append('columnIndex', 19); // Column T (index 19) for lab test status
    formData.append('value', new Date().toISOString()); // Current timestamp
    
    // Send the request to update the status
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to mark production record as lab tested');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating production lab status:', error);
    toast({
      title: "Error",
      description: `Failed to update lab test status: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};

useEffect(() => {
  // Safely get records after component is mounted
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch local records - just use refreshData, don't call getPendingLabTestRecords
      await refreshData();
      
      // Fetch from sheet directly
      const labTestingData = await fetchLabTestingSheetData();
      setLabTestingSheetRecords(labTestingData);
      
      // Fetch Google Sheet production records
      await fetchSheetData();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  if (isMounted && !authLoading) {
    fetchData();
  }
}, [isMounted, authLoading, refreshData]);
  
  // Update the handleRefresh function
  // Update the handleRefresh function
// Update the handleRefresh function
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await refreshData();
    
    // Fetch from sheet directly
    const labTestingData = await fetchLabTestingSheetData();
    setLabTestingSheetRecords(labTestingData);
    
    await fetchSheetData();
  } catch (error) {
    console.error("Error refreshing data:", error);
    toast({
      title: "Error",
      description: `Failed to refresh data: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openDialog = (billetId) => {
    // Find the selected record from pendingProductionRecords
    const record = pendingProductionRecords.find(r => r.billetId === billetId);
    
    setSelectedRecord(record);
    setSelectedBilletId(billetId);
    
    // Initialize form with heat number
    setFormData({
      billetId: billetId,
      heatNumber: record ? record.heatNumber : "",
      carbon: "",
      sulfur: "",
      magnesium: "",
      phosphorus: "",
      status: "pass",
      needTestingAgain: "no",
      remarks: "",
    });
    
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state to true when form is submitted

    // Validate form
    if (
      !formData.carbon ||
      !formData.sulfur ||
      !formData.magnesium ||
      !formData.phosphorus
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    // Create new record with the structure we want
    const newRecord = {
      billetId: selectedBilletId,
      heatNumber: selectedRecord?.heatNumber || "",
      carbon: formData.carbon,
      sulfur: formData.sulfur,
      magnesium: formData.magnesium,
      phosphorus: formData.phosphorus,
      status: formData.status,
      needTestingAgain: formData.needTestingAgain,
      remarks: formData.remarks,
    };

    try {
      // Submit to LAB TESTING sheet
      const result = await submitToLabTestingSheet(newRecord);
      
      if (result.success) {
        // Add to local state
        addLabTestRecord({
          ...newRecord,
          status: formData.status,
          timestamp: new Date().toISOString()
        });

        // Show success toast
        toast({
          title: "Success",
          description: "Lab test record created successfully.",
        });

        // Reset form and close dialog
        setFormData({
          billetId: "",
          heatNumber: "",
          carbon: "",
          sulfur: "",
          magnesium: "",
          phosphorus: "",
          status: "pass",
          needTestingAgain: "no",
          remarks: "",
        });
        setIsDialogOpen(false);

        // Refresh data
        setPendingRecords(getPendingLabTestRecords());
        setHistoryRecords(getHistoryLabTestRecords());
        await fetchSheetData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to submit data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of result
    }
  };

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
        status: "pass",
        needTestingAgain: "no",
        remarks: "Automatically marked as completed"
      });
      
      if (result.success) {
        updateLabTestRecord(record.id, { status: "completed" });
        setPendingRecords(getPendingLabTestRecords());
        setHistoryRecords(getHistoryLabTestRecords());
        await fetchSheetData();

        toast({
          title: "Success",
          description: "Lab test record marked as completed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to complete record: ${error.message}`,
        variant: "destructive",
      });
    }
  };

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
        status: "fail",
        needTestingAgain: "yes",
        remarks: "Rejected by user"
      });
      
      if (result.success) {
        updateLabTestRecord(record.id, { status: "rejected" });
        setPendingRecords(getPendingLabTestRecords());
        setHistoryRecords(getHistoryLabTestRecords());
        await fetchSheetData();

        toast({
          title: "Record Rejected",
          description: "Lab test record has been rejected.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to reject record: ${error.message}`,
        variant: "destructive",
      });
    }
  };

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

  // Check if user has permission to access this page
  // if (!hasPermission("labTesting")) {
  //   navigate("/dashboard")
  //   return null
  // }

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
              pendingProductionRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending lab test records found.</p>
                  <p className="mt-2">Complete billet production first to see records here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="px-4 py-2 font-medium">Billet ID</th>
                        <th className="px-4 py-2 font-medium">Heat Number</th>
                        <th className="px-4 py-2 font-medium">DR Cell</th>
                        <th className="px-4 py-2 font-medium">Pilot</th>
                        <th className="px-4 py-2 font-medium">Met Cook</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProductionRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-gray-600 hover:bg-gray-800"
                        >
                          <td className="px-4 py-2 font-mono text-xs">                    {formatDateDDMMYYYY(record.billetId)}
</td>
                          <td className="px-4 py-2">{record.heatNumber || "N/A"}</td>
                          <td className="px-4 py-2">{record.drCell || "N/A"}</td>
                          <td className="px-4 py-2">{record.pilot || "N/A"}</td>
                          <td className="px-4 py-2">{record.metCook || "N/A"}</td>
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
                              <button
                                onClick={() => handleComplete(record)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Mark as Completed"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(record)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : labTestingSheetRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No lab testing history records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="px-4 py-2 font-medium">Timestamp</th>
                      <th className="px-4 py-2 font-medium">Heat Number</th>
                      <th className="px-4 py-2 font-medium">Carbon %</th>
                      <th className="px-4 py-2 font-medium">Sulfur %</th>
                      <th className="px-4 py-2 font-medium">Magnesium %</th>
                      <th className="px-4 py-2 font-medium">Phosphorus %</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Need Testing Again?</th>
                      <th className="px-4 py-2 font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTestingSheetRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-600 hover:bg-gray-800"
                      >
                        <td className="px-4 py-2">{formatDateDDMMYYYY(record.timestamp)}</td>
                        <td className="px-4 py-2">{record.heatNumber || "N/A"}</td>
                        <td className="px-4 py-2">{record.carbon}</td>
                        <td className="px-4 py-2">{record.sulfur}</td>
                        <td className="px-4 py-2">{record.magnesium}</td>
                        <td className="px-4 py-2">{record.phosphorus}</td>
                        <td className="px-4 py-2">
                          <Badge 
                            variant={record.status === "pass" ? "success" : "danger"} 
                            className="capitalize"
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge 
                            variant={record.needTestingAgain === "yes" ? "warning" : "info"}
                            className="capitalize"
                          >
                            {record.needTestingAgain}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{record.remarks}</td>
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
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Perform Lab Testing" className="bg-gray-800 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Heat Number as header info */}
          <div className="bg-gray-700 p-3 rounded-md mb-4">
            <div>
              <p className="text-gray-300 text-sm">Heat Number:</p>
              <p className="text-white font-medium">{selectedRecord?.heatNumber || "N/A"}</p>
            </div>
          </div>
          
          <input
            type="hidden"
            id="billetId"
            name="billetId"
            value={formData.billetId}
          />
          <input
            type="hidden"
            id="heatNumber"
            name="heatNumber"
            value={formData.heatNumber}
          />
          
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
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter carbon percentage"
                required
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
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter sulfur percentage"
                required
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
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter magnesium percentage"
                required
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
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter phosphorus percentage"
                required
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
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
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
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
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
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter any remarks or observations (optional)"
              rows={3}
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
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Test Results'
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}