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

export default function ReceivingPage() {
  const {
    addReceivingRecord,
    getPendingReceivingRecords,
    getHistoryReceivingRecords,
    updateReceivingRecord,
    refreshData,
  } = useBilletData()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [receivingSheetRecords, setReceivingSheetRecords] = useState([]);

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
    time: "",
    receivingQtyMt: "", // Add this new field
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

  // Add this function to fetch RECEIVING sheet data directly
  const fetchReceivingSheetData = async () => {
    try {
      console.log("Fetching data from RECEIVING sheet...");
      
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=RECEIVING`;
      const response = await fetch(sheetUrl);
      const textData = await response.text();
      
      const jsonText = textData.substring(
        textData.indexOf('{'),
        textData.lastIndexOf('}') + 1
      );
      
      const parsedData = JSON.parse(jsonText);
      
      if (parsedData && parsedData.table) {
        const receivingRecords = parsedData.table.rows.map((row, index) => {
          // Get all cell values, defaulting to empty string if null
          const cells = row.c.map(cell => {
            if (cell && cell.v !== null) {
              if (cell.f && typeof cell.v === 'object' && cell.v.toString() === '[object Object]') {
                return cell.f;
              }
              return cell.v;
            }
            return "";
          });
  
          return {
            id: `receiving-${index}`,
            timestamp: cells[0] || "",     // Column A - Timestamp
            heatNumber: cells[1] || "",    // Column B - Heat Number
            time: cells[2] || "",          // Column C - Time
            receivingQtyMt: cells[3] || "", // Column D - Receiving Qty (MT)
            ledel: cells[4] || "",         // Column E - Ledel
            ccmTotalPieces: cells[5] || 0, // Column F - CCM Total Pieces
            bpMillTo: cells[6] || 0,       // Column G - BP Mill TO
            bpCcmTo: cells[7] || 0,        // Column H - BP CCM TO
            millToPcs: cells[8] || 0,      // Column I - Mill TO Pieces
            remark: cells[9] || "",        // Column J - Remark
            // status: "completed"            // Default status
          };
        });
        
        return receivingRecords;
      } else {
        console.error("Failed to parse data from RECEIVING sheet");
        toast({
          title: "Error",
          description: "Failed to parse data from RECEIVING sheet.",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      console.error("Error fetching RECEIVING sheet data:", error);
      toast({
        title: "Error",
        description: `Failed to fetch RECEIVING data: ${error.message}`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to fetch Google Sheets data directly using gviz/tq endpoint
  const fetchSheetData = async () => {
    try {
      console.log("Fetching data from Google Sheet...");
      
      // Use the direct Google Sheets URL format
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PRODUCTION`;
      
      const response = await fetch(sheetUrl);
      const textData = await response.text();
      
      // The gviz response comes with some prefix we need to remove
      // It typically starts with "google.visualization.Query.setResponse(" and ends with ");"
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
          return row.c.map(cell => cell ? (cell.v !== null ? cell.v : "") : "");
        });
        
        // Process the data to find rows where column J is not null and column K is null
        const pendingRows = rows.filter(row => 
          row.length >= 11 && // Make sure we have enough columns
          row[9] !== null && row[9] !== "" && // Column J (index 9) is not null
          (row[10] === null || row[10] === "") // Column K (index 10) is null
        );
        
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

  // Function to submit data to the RECEIVING sheet
  // This function submits data to the RECEIVING sheet without the billetId
  const submitToReceivingSheet = async (data) => {
    try {
      const rowData = [
        new Date().toISOString(), // Timestamp
        data.heatNumber,          // Heat Number
        data.time,                // Time
        data.receivingQtyMt,      // Receiving Qty (MT) - Make sure this is in the correct position
        data.ledel,               // Ledel
        data.ccmTotalPieces,      // CCM Total Pieces
        data.bpMillTo,            // BP Mill TO
        data.bpCcmTo,             // BP CCM TO
        data.millToPcs,           // Mill TO Pieces
        data.remark,              // Remark
        // "completed"               // Status
      ];
  
      const formData = new FormData();
      formData.append('sheetName', 'RECEIVING');
      formData.append('action', 'insert');
      formData.append('rowData', JSON.stringify(rowData));
  
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
      
      if (result.success) {
        await updateProductionStatus(data.billetId);
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to submit data to RECEIVING sheet');
      }
    } catch (error) {
      console.error('Error submitting to RECEIVING sheet:', error);
      throw error;
    }
  };

  // Function to update the status in the PRODUCTION sheet
  const updateProductionStatus = async (billetId) => {
    try {
      // Use your existing Apps Script to update the status
      const formData = new FormData();
      formData.append('sheetName', 'PRODUCTION');
      formData.append('action', 'update');
      
      // Find the row with this billetId
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=PRODUCTION&tq=SELECT * WHERE J = '${billetId}'`;
      const response = await fetch(sheetUrl);
      const textData = await response.text();
      const jsonText = textData.substring(textData.indexOf('{'), textData.lastIndexOf('}') + 1);
      const parsedData = JSON.parse(jsonText);
      
      if (parsedData && parsedData.table && parsedData.table.rows.length > 0) {
        // Get the row index from the first matching row
        // Note: This might not be accurate as the query doesn't return row indices
        // For a more robust solution, we'd need to use the row number from the sheet
        
        // Alternative: Use the update with billetId approach from your App Script
        const formData = new FormData();
        formData.append('sheetName', 'PRODUCTION');
        formData.append('action', 'markDeleted'); // Using your existing action
        formData.append('rowIndex', 0); // This will be found in the App Script
        formData.append('columnIndex', 11); // Column K (index 11)
        formData.append('value', new Date().toISOString()); // Timestamp
        formData.append('billetId', billetId); // Used to find the row
        
        const markResponse = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          body: formData
        });
        
        const markResult = await markResponse.json();
        if (!markResult.success) {
          throw new Error(markResult.error || 'Failed to mark production record as processed');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating production status:', error);
      return false;
    }
  };

  // Create a function to update a production record in Google Sheets
  const updateProductionRecord = async (billetId, statusData) => {
    try {
      // Prepare the form data for the POST request
      const formData = new FormData();
      formData.append('sheetName', 'PRODUCTION');
      formData.append('action', 'updateBilletStatus');
      formData.append('billetId', billetId);
      formData.append('statusData', JSON.stringify(statusData));

      // Send the update request to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Update was successful
        toast({
          title: "Success",
          description: "Production record updated successfully.",
        });
        
        // Refresh the data
        await fetchSheetData();
        return true;
      } else {
        // Update failed
        throw new Error(result.error || "Failed to update production record");
      }
    } catch (error) {
      console.error("Error updating production record:", error);
      toast({
        title: "Error",
        description: `Failed to update record: ${error.message}`,
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
        // Fetch local records
        await refreshData();
        setPendingRecords(getPendingReceivingRecords());
        
        // Don't use getHistoryReceivingRecords() anymore
        // Instead fetch from sheet directly
        const receivingData = await fetchReceivingSheetData();
        setReceivingSheetRecords(receivingData);
        
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
  }, [isMounted, authLoading, getPendingReceivingRecords, refreshData]);
  
  // Update the handleRefresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      setPendingRecords(getPendingReceivingRecords());
      
      // Fetch from sheet directly
      const receivingData = await fetchReceivingSheetData();
      setReceivingSheetRecords(receivingData);
      
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
      // billetId: billetId,
      heatNumber: record ? record.heatNumber : "",
      time: "",
      ledel: "",
      ccmTotalPieces: "",
      bpMillTo: "",
      bpCcmTo: "",
      millToPcs: "",
      remark: "",
    });
    
    setIsDialogOpen(true);
  };

  // Updated handleSubmit function - removes billetId from data sent to sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (
      !formData.time ||
      !formData.receivingQtyMt ||
      !formData.ledel ||
      !formData.ccmTotalPieces ||
      !formData.bpMillTo ||
      !formData.bpCcmTo ||
      !formData.millToPcs
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
  
    // Create new record with the structure we want
    const newRecord = {
      billetId: selectedBilletId,
      heatNumber: selectedRecord?.heatNumber || "",
      time: formData.time,
      receivingQtyMt: formData.receivingQtyMt, // Add this line
      ledel: formData.ledel,
      ccmTotalPieces: Number.parseFloat(formData.ccmTotalPieces),
      bpMillTo: Number.parseFloat(formData.bpMillTo),
      bpCcmTo: Number.parseFloat(formData.bpCcmTo),
      millToPcs: Number.parseFloat(formData.millToPcs),
      remark: formData.remark,
    };
  
    try {
      // Submit to RECEIVING sheet
      const result = await submitToReceivingSheet(newRecord);
      
      if (result.success) {
        // Add to local state
        addReceivingRecord({
          ...newRecord,
          status: "completed",
          timestamp: new Date().toISOString()
        });
  
        // Show success toast
        toast({
          title: "Success",
          description: "Billet receiving record created successfully.",
        });
  
        // Reset form and close dialog
        setFormData({
          billetId: "",
          heatNumber: "",
          time: "",
          receivingQtyMt: "", // Reset this field too
          ledel: "",
          ccmTotalPieces: "",
          bpMillTo: "",
          bpCcmTo: "",
          millToPcs: "",
          remark: "",
        });
        setIsDialogOpen(false);
  
        // Refresh data
        setPendingRecords(getPendingReceivingRecords());
        setHistoryRecords(getHistoryReceivingRecords());
        await fetchSheetData();
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

// Updated handleComplete function - removes billetId from data sent to sheet
const handleComplete = async (record) => {
  try {
    // Submit minimal data to RECEIVING sheet - no billetId
    const result = await submitToReceivingSheet({
      billetId: record.billetId, // Still needed for production status update
      heatNumber: record.heatNumber,
      time: new Date().toLocaleTimeString(),
      ledel: "Auto-completed",
      ccmTotalPieces: 0,
      bpMillTo: 0,
      bpCcmTo: 0,
      millToPcs: 0,
      remark: "Automatically marked as completed"
    });
    
    if (result.success) {
      updateReceivingRecord(record.id, { status: "completed" });
      setPendingRecords(getPendingReceivingRecords());
      setHistoryRecords(getHistoryReceivingRecords());
      await fetchSheetData();

      toast({
        title: "Success",
        description: "Billet receiving record marked as completed.",
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

// Updated handleReject function - removes billetId from data sent to sheet
const handleReject = async (record) => {
  try {
    // Submit minimal data to RECEIVING sheet with rejected status - no billetId
    const result = await submitToReceivingSheet({
      billetId: record.billetId, // Still needed for production status update
      heatNumber: record.heatNumber,
      time: new Date().toLocaleTimeString(),
      ledel: "Rejected",
      ccmTotalPieces: 0,
      bpMillTo: 0,
      bpCcmTo: 0,
      millToPcs: 0,
      remark: "Rejected by user",
      status: "rejected"
    });
    
    if (result.success) {
      updateReceivingRecord(record.id, { status: "rejected" });
      setPendingRecords(getPendingReceivingRecords());
      setHistoryRecords(getHistoryReceivingRecords());
      await fetchSheetData();

      toast({
        title: "Record Rejected",
        description: "Billet receiving record has been rejected.",
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
    );
  }

  // Check if user has permission to access this page
  // if (!hasPermission("receiving")) {
  //   navigate("/dashboard");
  //   return null;
  // }

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
                <th className="px-4 py-2 font-medium">Timestamp</th>
                <th className="px-4 py-2 font-medium">Heat Number</th>
                <th className="px-4 py-2 font-medium">DR Cell</th>
                <th className="px-4 py-2 font-medium">Pilot</th>
                <th className="px-4 py-2 font-medium">Met Cook</th>
                <th className="px-4 py-2 font-medium">Silico Mn</th>
                <th className="px-4 py-2 font-medium">Authorise Cook</th>
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
                  <td className="px-4 py-2 font-mono text-xs">
                    {formatDateDDMMYYYY(record.billetId)}
                  </td>
                  <td className="px-4 py-2">{record.heatNumber || "N/A"}</td>
                  <td className="px-4 py-2">{record.drCell || "N/A"}</td>
                  <td className="px-4 py-2">{record.pilot || "N/A"}</td>
                  <td className="px-4 py-2">{record.metCook || "N/A"}</td>
                  <td className="px-4 py-2">{record.silicoMn || "N/A"}</td>
                  <td className="px-4 py-2">{record.authoriseCook || "N/A"}</td>
                  <td className="px-4 py-2">
                    <Badge variant="warning">Pending</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDialog(record.billetId)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs"
                      >
                        Process
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
    ) : receivingSheetRecords.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>No receiving history records found.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
  <tr className="text-left border-b border-gray-200">
    <th className="px-4 py-2 font-medium">Timestamp</th>
    <th className="px-4 py-2 font-medium">Heat Number</th>
    <th className="px-4 py-2 font-medium">Time</th>
    <th className="px-4 py-2 font-medium">Receiving Qty (MT)</th> {/* Add this */}
    <th className="px-4 py-2 font-medium">Ledel</th>
              <th className="px-4 py-2 font-medium">CCM Total Pieces</th>
              <th className="px-4 py-2 font-medium">BP Mill TO</th>
              <th className="px-4 py-2 font-medium">BP CCM TO</th>
              <th className="px-4 py-2 font-medium">Mill TO Pcs</th>
              <th className="px-4 py-2 font-medium">Remark</th>
              {/* <th className="px-4 py-2 font-medium">Status</th> */}
            </tr>
          </thead>
          <tbody>
  {receivingSheetRecords.map((record) => (
    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-800">
      <td className="px-4 py-2">{formatDateDDMMYYYY(record.timestamp)}</td>
      <td className="px-4 py-2">{record.heatNumber || "N/A"}</td>
      <td className="px-4 py-2">{formatTimeAMPM(record.time)}</td>
      <td className="px-4 py-2">{record.receivingQtyMt || "N/A"}</td> {/* Add this */}
      <td className="px-4 py-2">{record.ledel}</td>
                <td className="px-4 py-2">{record.ccmTotalPieces}</td>
                <td className="px-4 py-2">{record.bpMillTo}</td>
                <td className="px-4 py-2">{record.bpCcmTo}</td>
                <td className="px-4 py-2">{record.millToPcs}</td>
                <td className="px-4 py-2">{record.remark}</td>
                {/* <td className="px-4 py-2">
                  <Badge variant={record.status === "completed" ? "success" : "danger"} className="capitalize">
                    {record.status}
                  </Badge>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Process Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Process Billet Receiving" className="bg-gray-800 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display billet ID and heat number as header info */}
          <div className="bg-gray-700 p-3 rounded-md mb-4 flex justify-between items-center">
            {/* <div>
              <p className="text-gray-300 text-sm">Billet ID:</p>
              <p className="text-white font-medium font-mono">{selectedBilletId}</p>
            </div> */}
            <div>
              <p className="text-gray-300 text-sm">Heat Number:</p>
              <p className="text-white font-medium">{selectedRecord?.heatNumber || "N/A"}</p>
            </div>
          </div>
          
          <input
            id="billetId"
            name="billetId"
            value={formData.billetId}
            type="hidden"
          />
          <input
            id="heatNumber"
            name="heatNumber"
            value={formData.heatNumber}
            type="hidden"
          />
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1 text-gray-200">
              Time *
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
  <label htmlFor="receivingQtyMt" className="block text-sm font-medium mb-1 text-gray-200">
    Receiving Qty (MT) *
  </label>
  <input
    id="receivingQtyMt"
    name="receivingQtyMt"
    type="number"
    step="0.01"
    min="0"
    value={formData.receivingQtyMt}
    onChange={handleInputChange}
    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
    placeholder="Enter receiving quantity in MT"
    required
  />
</div>
          <div>
            <label htmlFor="ledel" className="block text-sm font-medium mb-1 text-gray-200">
              Ledel *
            </label>
            <input
              id="ledel"
              name="ledel"
              value={formData.ledel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter ledel"
              required
            />
          </div>
          {/* Rest of the form remains unchanged */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ccmTotalPieces" className="block text-sm font-medium mb-1 text-gray-200">
                CCM Total Pieces *
              </label>
              <input
                id="ccmTotalPieces"
                name="ccmTotalPieces"
                type="number"
                min="0"
                value={formData.ccmTotalPieces}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter CCM total pieces"
                required
              />
            </div>
            <div>
              <label htmlFor="bpMillTo" className="block text-sm font-medium mb-1 text-gray-200">
                BP Mill TO *
              </label>
              <input
                id="bpMillTo"
                name="bpMillTo"
                type="number"
                step="0.1"
                min="0"
                value={formData.bpMillTo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter BP Mill TO"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bpCcmTo" className="block text-sm font-medium mb-1 text-gray-200">
                BP CCM TO *
              </label>
              <input
                id="bpCcmTo"
                name="bpCcmTo"
                type="number"
                step="0.1"
                min="0"
                value={formData.bpCcmTo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter BP CCM TO"
                required
              />
            </div>
            <div>
              <label htmlFor="millToPcs" className="block text-sm font-medium mb-1 text-gray-200">
                Mill TO Pcs *
              </label>
              <input
                id="millToPcs"
                name="millToPcs"
                type="number"
                min="0"
                value={formData.millToPcs}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter Mill TO Pcs"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="remark" className="block text-sm font-medium mb-1 text-gray-200">
              Remark
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter remarks (optional)"
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
                'Submit'
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}