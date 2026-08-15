export type Issue = {
  id: string
  category: string
  description: string
  latitude: number
  longitude: number
  severity: number
  priority: number
  department: string
  status: string
  reports_count: number
  created_at: string
  sla_hours_remaining?: number
  lane?: "critical" | "high" | "medium"
}

export type WardHotspot = {
  ward: string
  latitude: number
  longitude: number
  issue_count: number
}

export type Stats = {
  total: number
  critical: number
  pending: number
  resolved: number
  sla_breaches: number
}

export type ThemeMode = "dark" | "light"
