"use client"

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./lib/auth-context.jsx"
import { Toaster } from "./components/ui/toaster.jsx"
import { ThemeProvider } from "./components/theme-provider.jsx"

// Pages
import LoginPage from "./pages/login.jsx"
import DashboardPage from "./pages/dashboard.jsx"
import WorkflowPage from "./pages/workflow.jsx"
import WorkflowEntryPage from "./pages/workflow-entry.jsx"
import ReceivingPage from "./pages/receiving.jsx"
import LabTestingPage from "./pages/lab-testing.jsx"
import TmtPlanningPage from "./pages/tmt-planning.jsx"
import TmtProductionPage from "./pages/tmt-production.jsx"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workflow"
          element={
            <ProtectedRoute>
              <WorkflowPage />
            </ProtectedRoute>
          }
        />

<Route
  path="/workflow/entry"
  element={
    <ProtectedRoute requiredPermission="production">
      <WorkflowEntryPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/workflow/receiving"
          element={
            <ProtectedRoute>
              <ReceivingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workflow/lab-testing"
          element={
            <ProtectedRoute>
              <LabTestingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workflow/tmt-planning"
          element={
            <ProtectedRoute>
              <TmtPlanningPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tmt-production"
          element={
            <ProtectedRoute>
              <TmtProductionPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster />
    </ThemeProvider>
  )
}

export default App
