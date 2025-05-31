"use client"

import { createContext, useContext, useState } from "react"

// Workflow status types
const WorkflowStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
}

const BilletContext = createContext(undefined)

// Generate a simple ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Generate a billet ID with format BLT-YYYYMMDD-XXXX
const generateBilletId = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `BLT-${year}${month}${day}-${random}`
}

// Sample dummy data
const dummyBilletIds = [
  generateBilletId(),
  generateBilletId(),
  generateBilletId(),
  generateBilletId(),
  generateBilletId(),
]

// Sample dummy data
const dummyData = [
  {
    id: generateId(),
    billetId: dummyBilletIds[0],
    heatNumber: "H-1001",
    drCell: "DC-A",
    pilot: "John Smith",
    metCook: "Michael Brown",
    silicoMn: "SM-45",
    authoriseCook: "David Wilson",
    scrapCmd: 12.5,
    productionCmd: 85.75,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[1],
    heatNumber: "H-1002",
    drCell: "DC-B",
    pilot: "Sarah Johnson",
    metCook: "Robert Davis",
    silicoMn: "SM-32",
    authoriseCook: "Emily Clark",
    scrapCmd: 8.25,
    productionCmd: 92.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[2],
    heatNumber: "H-1003",
    drCell: "DC-C",
    pilot: "James Wilson",
    metCook: "Thomas Lee",
    silicoMn: "SM-28",
    authoriseCook: "Jennifer White",
    scrapCmd: 15.75,
    productionCmd: 78.25,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[3],
    heatNumber: "H-1004",
    drCell: "DC-A",
    pilot: "Patricia Moore",
    metCook: "Charles Taylor",
    silicoMn: "SM-41",
    authoriseCook: "Daniel Martin",
    scrapCmd: 10.0,
    productionCmd: 88.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    status: "in_progress",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[4],
    heatNumber: "H-1005",
    drCell: "DC-B",
    pilot: "Richard Harris",
    metCook: "Elizabeth Young",
    silicoMn: "SM-36",
    authoriseCook: "William Allen",
    scrapCmd: 9.25,
    productionCmd: 90.75,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "pending",
  },
]

// Sample dummy data for billet receiving
const dummyReceivingData = [
  {
    id: generateId(),
    billetId: dummyBilletIds[0],
    time: "08:00",
    ledel: "L-101",
    ccmTotalPieces: 120,
    bpMillTo: 85.5,
    bpCcmTo: 34.5,
    millToPcs: 95,
    remark: "Normal production",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[1],
    time: "14:30",
    ledel: "L-102",
    ccmTotalPieces: 135,
    bpMillTo: 92.3,
    bpCcmTo: 42.7,
    millToPcs: 110,
    remark: "Increased efficiency",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[2],
    time: "20:15",
    ledel: "L-103",
    ccmTotalPieces: 115,
    bpMillTo: 78.2,
    bpCcmTo: 36.8,
    millToPcs: 90,
    remark: "Minor delay due to maintenance",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[3],
    time: "09:45",
    ledel: "L-104",
    ccmTotalPieces: 125,
    bpMillTo: 88.7,
    bpCcmTo: 39.3,
    millToPcs: 100,
    remark: "Standard operation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    status: "pending",
  },
]

// Sample dummy data for lab testing
const dummyLabTestingData = [
  {
    id: generateId(),
    billetId: dummyBilletIds[0],
    carbon: 0.23,
    sulfur: 0.05,
    magnesium: 0.12,
    phosphorus: 0.03,
    testStatus: "pass",
    needRetesting: false,
    remarks: "All parameters within acceptable range",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23 hours ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[1],
    carbon: 0.25,
    sulfur: 0.06,
    magnesium: 0.14,
    phosphorus: 0.04,
    testStatus: "pass",
    needRetesting: false,
    remarks: "Sulfur slightly elevated but acceptable",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(), // 11 hours ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[2],
    carbon: 0.22,
    sulfur: 0.04,
    magnesium: 0.11,
    phosphorus: 0.02,
    testStatus: "pass",
    needRetesting: false,
    remarks: "Excellent quality",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: "completed",
  },
]

// Sample dummy data for TMT Planning
const dummyTmtPlanningData = [
  {
    id: generateId(),
    billetId: dummyBilletIds[0],
    personName: "Alex Johnson",
    productName: "TMT Rebar 12mm",
    quantity: 5000,
    supervisorName: "Michael Chen",
    dateOfProduction: "2023-06-15",
    remarks: "Standard production run",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    status: "completed",
  },
  {
    id: generateId(),
    billetId: dummyBilletIds[1],
    personName: "Sarah Williams",
    productName: "TMT Rebar 16mm",
    quantity: 3500,
    supervisorName: "David Rodriguez",
    dateOfProduction: "2023-06-16",
    remarks: "Priority order for Project X",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), // 10 hours ago
    status: "completed",
  },
]

export function BilletDataProvider({ children }) {
  const [records, setRecords] = useState(dummyData)
  const [receivingRecords, setReceivingRecords] = useState(dummyReceivingData)
  const [labTestingRecords, setLabTestingRecords] = useState(dummyLabTestingData)
  const [tmtPlanningRecords, setTmtPlanningRecords] = useState(dummyTmtPlanningData)
  const [tmtRecords, setTmtRecords] = useState([])

  // Get pending records for each stage
  const getPendingBilletRecords = () => {
    return records.filter((r) => r.status === "pending")
  }

  // Update the getPendingReceivingRecords function to show billets that have been produced but not received
  const getPendingReceivingRecords = () => {
    // Get billets that have been produced but don't have receiving records yet
    const completedBilletIds = records.filter((r) => r.status === "completed").map((r) => r.billetId)
    const existingReceivingBilletIds = receivingRecords.map((r) => r.billetId)

    // Create pending receiving records for billets that need them
    const pendingBilletIds = completedBilletIds.filter((id) => !existingReceivingBilletIds.includes(id))

    // Return actual pending receiving records plus "virtual" pending records for billets that need them
    return [
      ...receivingRecords.filter((r) => r.status === "pending"),
      ...pendingBilletIds.map((billetId) => {
        const billet = records.find((r) => r.billetId === billetId)
        return {
          id: "pending-" + billetId,
          billetId,
          time: "",
          ledel: "",
          ccmTotalPieces: 0,
          bpMillTo: 0,
          bpCcmTo: 0,
          millToPcs: 0,
          remark: "",
          timestamp: new Date().toISOString(),
          status: "pending",
          heatNumber: billet?.heatNumber || "",
        }
      }),
    ]
  }

  const getPendingLabTestingRecords = () => {
    // Get billets that have completed receiving but don't have lab testing yet
    const completedReceivingBilletIds = receivingRecords.filter((r) => r.status === "completed").map((r) => r.billetId)

    const existingLabTestBilletIds = labTestingRecords.map((r) => r.billetId)

    // Create pending lab test records for billets that need them
    const pendingBilletIds = completedReceivingBilletIds.filter((id) => !existingLabTestBilletIds.includes(id))

    // Return actual pending lab tests plus "virtual" pending tests for billets that need them
    return [
      ...labTestingRecords.filter((r) => r.status === "pending"),
      ...pendingBilletIds.map((billetId) => {
        const billet = records.find((r) => r.billetId === billetId)
        return {
          id: "pending-" + billetId,
          billetId,
          carbon: 0,
          sulfur: 0,
          magnesium: 0,
          phosphorus: 0,
          testStatus: "pending",
          needRetesting: false,
          remarks: "",
          timestamp: new Date().toISOString(),
          status: "pending",
          heatNumber: billet?.heatNumber || "",
        }
      }),
    ]
  }

  // New function for pending TMT Planning records
  const getPendingTmtPlanningRecords = () => {
    // Get billets that have completed lab testing but don't have TMT planning yet
    const completedLabTestingBilletIds = labTestingRecords
      .filter((r) => r.status === "completed" && r.testStatus === "pass")
      .map((r) => r.billetId)

    const existingTmtPlanningBilletIds = tmtPlanningRecords.map((r) => r.billetId)

    // Create pending TMT planning records for billets that need them
    const pendingBilletIds = completedLabTestingBilletIds.filter((id) => !existingTmtPlanningBilletIds.includes(id))

    // Return actual pending TMT planning records plus "virtual" pending records for billets that need them
    return [
      ...tmtPlanningRecords.filter((r) => r.status === "pending"),
      ...pendingBilletIds.map((billetId) => {
        const billet = records.find((r) => r.billetId === billetId)
        return {
          id: "pending-" + billetId,
          billetId,
          personName: "",
          productName: "",
          quantity: 0,
          supervisorName: "",
          dateOfProduction: "",
          remarks: "",
          timestamp: new Date().toISOString(),
          status: "pending",
        }
      }),
    ]
  }

  // Update TMT Production to depend on TMT Planning
  const getPendingTmtRecords = () => {
    return []
  }

  // Get history records for each stage
  const getHistoryBilletRecords = () => {
    return records.filter((r) => r.status === "completed" || r.status === "rejected")
  }

  const getHistoryReceivingRecords = () => {
    return receivingRecords.filter((r) => r.status === "completed" || r.status === "rejected")
  }

  const getHistoryLabTestingRecords = () => {
    return labTestingRecords.filter((r) => r.status === "completed" || r.status === "rejected")
  }

  // New function for TMT Planning history
  const getHistoryTmtPlanningRecords = () => {
    return tmtPlanningRecords.filter((r) => r.status === "completed" || r.status === "rejected")
  }

  const getHistoryTmtRecords = () => {
    return []
  }

  // Get record by ID
  const getRecordById = (id) => {
    return records.find((r) => r.id === id)
  }

  const getReceivingRecordById = (id) => {
    return receivingRecords.find((r) => r.id === id)
  }

  const getLabTestingRecordById = (id) => {
    return labTestingRecords.find((r) => r.id === id)
  }

  // New function for TMT Planning
  const getTmtPlanningRecordById = (id) => {
    return tmtPlanningRecords.find((r) => r.id === id)
  }

  const getTmtRecordById = (id) => {
    return undefined
  }

  // Get records by billet ID
  const getRecordsByBilletId = (billetId) => {
    return {
      billet: records.find((r) => r.billetId === billetId),
      receiving: receivingRecords.find((r) => r.billetId === billetId),
      labTesting: labTestingRecords.find((r) => r.billetId === billetId),
      tmtPlanning: tmtPlanningRecords.find((r) => r.billetId === billetId), // New field
    }
  }

  // Add a new record
  const addRecord = (data) => {
    const newRecord = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: "pending",
    }
    setRecords((prev) => [newRecord, ...prev])
    return newRecord
  }

  // Add a new receiving record
  const addReceivingRecord = (data) => {
    const newRecord = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: "pending",
    }
    setReceivingRecords((prev) => [newRecord, ...prev])
    return newRecord
  }

  // Add a new lab testing record
  const addLabTestingRecord = (data) => {
    const newRecord = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: "pending",
    }
    setLabTestingRecords((prev) => [newRecord, ...prev])
    return newRecord
  }

  // Add a new TMT Planning record
  const addTmtPlanningRecord = (data) => {
    const newRecord = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: "pending",
    }
    setTmtPlanningRecords((prev) => [newRecord, ...prev])
    return newRecord
  }

  // Add a new TMT record
  const addTmtRecord = (data) => {
    return {}
  }

  // Update a record
  const updateRecord = (id, data) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === id)
      if (index === -1) {
        throw new Error("Record not found")
      }
      const updatedRecords = [...prev]
      updatedRecords[index] = {
        ...updatedRecords[index],
        ...data,
      }
      return updatedRecords
    })
  }

  // Update a receiving record
  const updateReceivingRecord = (id, data) => {
    setReceivingRecords((prev) => {
      const index = prev.findIndex((r) => r.id === id)
      if (index === -1) {
        throw new Error("Record not found")
      }
      const updatedRecords = [...prev]
      updatedRecords[index] = {
        ...updatedRecords[index],
        ...data,
      }
      return updatedRecords
    })
  }

  // Update a lab testing record
  const updateLabTestingRecord = (id, data) => {
    setLabTestingRecords((prev) => {
      const index = prev.findIndex((r) => r.id === id)
      if (index === -1) {
        throw new Error("Record not found")
      }
      const updatedRecords = [...prev]
      updatedRecords[index] = {
        ...updatedRecords[index],
        ...data,
      }
      return updatedRecords
    })
  }

  // Update a TMT Planning record
  const updateTmtPlanningRecord = (id, data) => {
    setTmtPlanningRecords((prev) => {
      const index = prev.findIndex((r) => r.id === id)
      if (index === -1) {
        throw new Error("Record not found")
      }
      const updatedRecords = [...prev]
      updatedRecords[index] = {
        ...updatedRecords[index],
        ...data,
      }
      return updatedRecords
    })
  }

  // Update a TMT record
  const updateTmtRecord = (id, data) => {}

  // Delete a record
  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // Delete a receiving record
  const deleteReceivingRecord = (id) => {
    setReceivingRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // Delete a lab testing record
  const deleteLabTestingRecord = (id) => {
    setLabTestingRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // Delete a TMT Planning record
  const deleteTmtPlanningRecord = (id) => {
    setTmtPlanningRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // Delete a TMT record
  const deleteTmtRecord = (id) => {}

  // Refresh data (simulated)
  const refreshData = async () => {
    // In a real app, this would fetch from an API
    await new Promise((resolve) => setTimeout(resolve, 500))
    return Promise.resolve()
  }

  return (
    <BilletContext.Provider
      value={{
        records,
        receivingRecords,
        labTestingRecords,
        tmtPlanningRecords,
        tmtRecords,
        getPendingBilletRecords,
        getPendingReceivingRecords,
        getPendingLabTestingRecords,
        getPendingTmtPlanningRecords,
        getPendingTmtRecords,
        getHistoryBilletRecords,
        getHistoryReceivingRecords,
        getHistoryLabTestingRecords,
        getHistoryTmtPlanningRecords,
        getHistoryTmtRecords,
        getRecordById,
        getReceivingRecordById,
        getLabTestingRecordById,
        getTmtPlanningRecordById,
        getTmtRecordById,
        getRecordsByBilletId,
        addRecord,
        addReceivingRecord,
        addLabTestingRecord,
        addTmtPlanningRecord,
        addTmtRecord,
        updateRecord,
        updateReceivingRecord,
        updateLabTestingRecord,
        updateTmtPlanningRecord,
        updateTmtRecord,
        deleteRecord,
        deleteReceivingRecord,
        deleteLabTestingRecord,
        deleteTmtPlanningRecord,
        deleteTmtRecord,
        generateBilletId,
        refreshData,
      }}
    >
      {children}
    </BilletContext.Provider>
  )
}

export function useBilletData() {
  const context = useContext(BilletContext)
  if (context === undefined) {
    throw new Error("useBilletData must be used within a BilletDataProvider")
  }
  return context
}
