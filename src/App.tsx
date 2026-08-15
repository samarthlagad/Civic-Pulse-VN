import React from "react"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { CivicProvider, useCivic } from "@/context/CivicContext"
import { LoginPage } from "@/pages/LoginPage"
import { AppLayout } from "@/components/AppLayout"
import { Dashboard } from "@/pages/Dashboard"
import { AllIssues } from "@/pages/AllIssues"
import { PriorityQueuePage } from "@/pages/PriorityQueuePage"
import { Hotspots } from "@/pages/Hotspots"
import { Departments } from "@/pages/Departments"
import { Settings } from "@/pages/Settings"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCivic()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCivic()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthRoute>
        <LoginPage />
      </AuthRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "issues", element: <AllIssues /> },
      { path: "priority-queue", element: <PriorityQueuePage /> },
      { path: "queue", element: <PriorityQueuePage /> },
      { path: "hotspots", element: <Hotspots /> },
      { path: "hotspots/:wardId", element: <Hotspots /> },
      { path: "departments", element: <Departments /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

export default function App() {
  return (
    <CivicProvider>
      <RouterProvider router={router} />
    </CivicProvider>
  )
}

