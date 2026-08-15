import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react"
import { Issue, WardHotspot, Stats, ThemeMode } from "@/types"
import mockIssuesData from "@/mock/mockIssues.json"
import mockStatsData from "@/mock/mockStats.json"
import mockHotspotsData from "@/mock/mockHotspots.json"
import { fetchStats, fetchHotspots } from "@/lib/api"

export type User = {
  name: string
  role: string
  initials: string
  email: string
  department: string
}

export type DateRange = "today" | "7d" | "30d" | "90d" | "ytd" | "all"

export type IssueLogEntry = {
  id: string
  author: string
  action: string
  timestamp: string
  note?: string
}

interface CivicContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>
  logout: () => void
  
  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void

  // Issues & Data
  issues: Issue[]
  hotspots: WardHotspot[]
  stats: Stats
  
  // Filtering & Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
  statusFilter: string | null
  setStatusFilter: (status: string | null) => void
  departmentFilter: string | null
  setDepartmentFilter: (dept: string | null) => void
  clearAllFilters: () => void
  
  // Refresh & Animation Sync
  refreshKey: number
  isRefreshing: boolean
  triggerRefresh: () => void
  
  // Issue Actions
  updateIssueStatus: (id: string, status: string) => void
  assignIssueDepartment: (id: string, dept: string) => void
  escalateIssue: (id: string) => void
  bulkUpdateStatus: (ids: string[], status: string) => void
  bulkAssignDepartment: (ids: string[], dept: string) => void
  reorderIssues: (newIssuesList: Issue[]) => void
  moveIssueLane: (id: string, targetLane: "critical" | "high" | "medium") => void
  addIssueNote: (id: string, note: string) => void
  issueNotes: Record<string, { author: string; text: string; time: string }[]>
  issueLogs: Record<string, IssueLogEntry[]>
  
  // Toast notifications
  toastMessage: string | null
  showToast: (msg: string) => void
}

const CivicContext = createContext<CivicContextType | undefined>(undefined)

const DEFAULT_USER: User = {
  name: "Samarth Lagad",
  role: "Director of Municipal Operations",
  initials: "SL",
  email: "samarthlagad@gmail.com",
  department: "Command Operations"
}

export function CivicProvider({ children }: { children: React.ReactNode }) {
  // Theme state: dark by default per command-console spec
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("civic_theme") as ThemeMode
    return saved || "dark"
  })

  useEffect(() => {
    localStorage.setItem("civic_theme", theme)
    if (theme === "light") {
      document.documentElement.classList.add("theme-light")
    } else {
      document.documentElement.classList.remove("theme-light")
    }
  }, [theme])

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  // Authentication state - starts unauthenticated so Login page is seen first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem("civic_auth")
    return saved === "true"
  })

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("civic_auth")
    return saved === "true" ? DEFAULT_USER : null
  })

  // Global issues data with SLA & calculated lane
  const [issues, setIssues] = useState<Issue[]>(() => {
    return (mockIssuesData as Issue[]).map((issue, idx) => {
      let lane: "critical" | "high" | "medium" = "medium"
      if (issue.severity >= 90) lane = "critical"
      else if (issue.severity >= 70) lane = "high"

      // Mock remaining SLA hours (based on severity and age)
      const baseSla = issue.severity >= 90 ? 12 : issue.severity >= 70 ? 24 : 48
      const hoursRemaining = Math.max(1, baseSla - (idx % 11) * 3)

      return {
        ...issue,
        lane,
        sla_hours_remaining: hoursRemaining,
      }
    })
  })

  const [hotspots, setHotspots] = useState<WardHotspot[]>(mockHotspotsData as WardHotspot[])
  const [remoteStats, setRemoteStats] = useState<Stats | null>(null)
  const [dataSource, setDataSource] = useState<"live" | "mock">("mock")

  // Attempt to load real backend data; silently fall back to mock/local
  // calculation if the API isn't reachable (e.g. still on Day 1-2 of build).
  const loadRemoteData = useCallback(async () => {
    try {
      const [statsRes, hotspotsRes] = await Promise.all([
        fetchStats(),
        fetchHotspots(),
      ])
      setRemoteStats(statsRes)
      setHotspots(hotspotsRes)
      setDataSource("live")
    } catch (err) {
      console.warn("Backend not reachable, using mock data:", err)
      setDataSource("mock")
    }
  }, [])

  useEffect(() => {
    loadRemoteData()
  }, [loadRemoteData])

  const [issueNotes, setIssueNotes] = useState<Record<string, { author: string; text: string; time: string }[]>>({
    "CIV-1001": [
      { author: "Dispatch Lead", text: "Signal verified via sensor grid. High road-blockage hazard on Arterial 4.", time: "2 hours ago" },
      { author: "Roads & Bridges", text: "Crew dispatched with asphalt thermal patcher.", time: "45 mins ago" }
    ],
    "CIV-1002": [
      { author: "Sanitation Lead", text: "Compactor vehicle assigned to morning Lalpur collection run.", time: "Yesterday" }
    ],
    "CIV-1003": [
      { author: "Electrical Dept", text: "High voltage transformer tripped on Line 7. Grid safety isolation active.", time: "3 hours ago" }
    ]
  })

  const [issueLogs, setIssueLogs] = useState<Record<string, IssueLogEntry[]>>({
    "CIV-1001": [
      { id: "log-1", author: "System Sensor", action: "Incident Logged via Citizen GPS", timestamp: "2026-08-14 18:20" },
      { id: "log-2", author: "Director of Ops", action: "Priority Escalated to 94/100", timestamp: "2026-08-14 19:05" },
      { id: "log-3", author: "Command Dispatch", action: "Assigned to Roads & Bridges", timestamp: "2026-08-14 20:15" },
    ]
  })

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange>("30d")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)

  // Refresh Trigger
  const [refreshKey, setRefreshKey] = useState<number>(1)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3500)
  }, [])

  const login = useCallback(async (email: string, _pass: string, remember: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsAuthenticated(true)
        setUser({
          ...DEFAULT_USER,
          email: email || DEFAULT_USER.email,
        })
        if (remember) {
          localStorage.setItem("civic_auth", "true")
        }
        showToast("Access Granted: Welcome to Civic Command Console.")
        resolve(true)
      }, 450)
    })
  }, [showToast])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("civic_auth")
    showToast("Session terminated.")
  }, [showToast])

  const clearAllFilters = useCallback(() => {
    setCategoryFilter(null)
    setStatusFilter(null)
    setDepartmentFilter(null)
    setSearchQuery("")
  }, [])

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await loadRemoteData()
    setRefreshKey((k) => k + 1)
    setIsRefreshing(false)
    showToast(
      dataSource === "live"
        ? "Live Telemetry Synchronized."
        : "Backend unreachable — showing cached/mock data."
    )
  }, [isRefreshing, showToast, loadRemoteData, dataSource])

  const updateIssueStatus = useCallback((id: string, newStatus: string) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    )
    const logEntry: IssueLogEntry = {
      id: `log-${Date.now()}`,
      author: user?.name || "Command Lead",
      action: `Status updated to ${newStatus.replace("_", " ")}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setIssueLogs((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), logEntry]
    }))
    showToast(`Issue #${id.replace("CIV-", "")} marked as ${newStatus.replace("_", " ")}`)
  }, [user, showToast])

  const assignIssueDepartment = useCallback((id: string, dept: string) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, department: dept } : item))
    )
    const logEntry: IssueLogEntry = {
      id: `log-${Date.now()}`,
      author: user?.name || "Command Lead",
      action: `Reassigned to ${dept}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setIssueLogs((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), logEntry]
    }))
    showToast(`Issue #${id.replace("CIV-", "")} assigned to ${dept}`)
  }, [user, showToast])

  const escalateIssue = useCallback((id: string) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              severity: Math.min(100, item.severity + 15),
              priority: Math.min(100, item.priority + 15),
              lane: "critical"
            }
          : item
      )
    )
    const logEntry: IssueLogEntry = {
      id: `log-${Date.now()}`,
      author: user?.name || "Command Lead",
      action: "Issue priority escalated to Critical (Signal Alarm Triggered)",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setIssueLogs((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), logEntry]
    }))
    showToast(`Priority escalated for #${id.replace("CIV-", "")}`)
  }, [user, showToast])

  const bulkUpdateStatus = useCallback((ids: string[], status: string) => {
    setIssues((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, status } : item))
    )
    showToast(`Batch updated ${ids.length} issues to ${status.replace("_", " ")}`)
  }, [showToast])

  const bulkAssignDepartment = useCallback((ids: string[], dept: string) => {
    setIssues((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, department: dept } : item))
    )
    showToast(`Batch assigned ${ids.length} issues to ${dept}`)
  }, [showToast])

  const reorderIssues = useCallback((newIssuesList: Issue[]) => {
    setIssues(newIssuesList)
  }, [])

  const moveIssueLane = useCallback((id: string, targetLane: "critical" | "high" | "medium") => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        let newSeverity = item.severity
        if (targetLane === "critical") newSeverity = Math.max(90, item.severity)
        else if (targetLane === "high") newSeverity = Math.min(89, Math.max(70, item.severity))
        else if (targetLane === "medium") newSeverity = Math.min(69, item.severity)
        return {
          ...item,
          lane: targetLane,
          severity: newSeverity,
        }
      })
    )
    showToast(`Issue #${id.replace("CIV-", "")} moved to ${targetLane.toUpperCase()} swimlane`)
  }, [showToast])

  const addIssueNote = useCallback((id: string, text: string) => {
    const newNote = {
      author: user?.name || "Admin User",
      text,
      time: "Just now"
    }
    setIssueNotes((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), newNote]
    }))
    const logEntry: IssueLogEntry = {
      id: `log-${Date.now()}`,
      author: user?.name || "Admin User",
      action: "Field Log Note Added",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: text
    }
    setIssueLogs((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), logEntry]
    }))
    showToast("Command note recorded.")
  }, [user, showToast])

  // Dynamic stats calculation — prefers live backend stats when available,
  // otherwise derives from the local issues array (mock or optimistic-updated).
  const localStats = useMemo<Stats>(() => {
    const total = issues.length
    const critical = issues.filter((i) => i.severity >= 80 || i.priority >= 80).length
    const pending = issues.filter((i) => i.status === "PENDING").length
    const resolved = issues.filter((i) => ["RESOLVED", "CLOSED", "VERIFIED"].includes(i.status)).length
    
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime()
    const sla_breaches = issues.filter((i) => {
      const isOld = new Date(i.created_at).getTime() < tenDaysAgo
      const isNotDone = !["RESOLVED", "CLOSED", "VERIFIED"].includes(i.status)
      return isOld && isNotDone
    }).length

    return {
      total: total || mockStatsData.total,
      critical: critical || mockStatsData.critical,
      pending: pending || mockStatsData.pending,
      resolved: resolved || mockStatsData.resolved,
      sla_breaches: sla_breaches || mockStatsData.sla_breaches
    }
  }, [issues])

  const stats = remoteStats ?? localStats

  return (
    <CivicContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        theme,
        setTheme,
        toggleTheme,
        issues,
        hotspots,
        stats,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        departmentFilter,
        setDepartmentFilter,
        clearAllFilters,
        refreshKey,
        isRefreshing,
        triggerRefresh,
        updateIssueStatus,
        assignIssueDepartment,
        escalateIssue,
        bulkUpdateStatus,
        bulkAssignDepartment,
        reorderIssues,
        moveIssueLane,
        addIssueNote,
        issueNotes,
        issueLogs,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CivicContext.Provider>
  )
}

export function useCivic() {
  const context = useContext(CivicContext)
  if (!context) {
    throw new Error("useCivic must be used within a CivicProvider")
  }
  return context
}
