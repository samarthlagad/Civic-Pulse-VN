import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { KpiCards } from "@/components/KpiCards"
import { StatusBreakdownChart } from "@/components/StatusBreakdownChart"
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart"
import { PriorityQueue } from "@/components/PriorityQueue"
import { HotspotSummary } from "@/components/HotspotSummary"
import { IssueDetailDrawer } from "@/components/IssueDetailDrawer"
import { Issue } from "@/types"
import { useCivic } from "@/context/CivicContext"
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Filter,
  X,
  Radio,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react"

export function Dashboard() {
  const navigate = useNavigate()
  const {
    stats,
    issues,
    hotspots,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    refreshKey,
    isRefreshing
  } = useCivic()

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const handleMetricClick = (metricId: string) => {
    navigate(`/issues?metric=${metricId}`)
  }

  const handleCategoryChartClick = (category: string) => {
    if (categoryFilter === category) {
      setCategoryFilter(null)
    } else {
      setCategoryFilter(category)
    }
  }

  const handleStatusChartClick = (status: string) => {
    if (statusFilter === status) {
      setStatusFilter(null)
    } else {
      setStatusFilter(status)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* Top Welcome & Telemetry Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3]">
              Municipal Operations Command
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[rgba(232,178,77,0.15)] text-[#E8B24D] border border-[rgba(232,178,77,0.3)] uppercase">
              Live Feed
            </span>
          </div>
          <p className="text-xs font-mono-data text-[#8A93A3] mt-0.5">
            Real-time incident response, ward telemetry, and municipal SLA monitoring.
          </p>
        </div>

        {/* Quick Filter Reset Banner if filters active */}
        {(statusFilter || categoryFilter) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1B202B] border border-[#E8B24D]/40 text-xs text-[#E8B24D] font-mono-data"
          >
            <span>
              Active: {statusFilter && `[${statusFilter}] `}{categoryFilter && `[${categoryFilter}]`}
            </span>
            <button
              onClick={clearAllFilters}
              className="p-1 hover:bg-[#141821] rounded text-[#EDEFF3] cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        )}
      </div>

      {/* KPI Cards Row */}
      <KpiCards stats={stats} onMetricClick={handleMetricClick} />

      {/* Charts Grid: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Breakdown Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-[#141821] p-5 sm:p-6 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 mb-2">
            <div>
              <h3 className="text-sm font-bold font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2">
                <BarChart3 className="size-4 text-[#4C8DFF]" />
                <span>Incident Distribution by Status</span>
              </h3>
              <p className="text-[11px] text-[#8A93A3] font-mono-data">
                Triage funnel breakdown (Click bar to isolate status)
              </p>
            </div>
            <span className="text-[10px] font-mono-data text-[#5B6270]">
              SCALE: 0-24
            </span>
          </div>

          <div className="flex-1 min-h-[250px]">
            <StatusBreakdownChart
              issues={issues}
              onStatusClick={handleStatusChartClick}
              activeStatus={statusFilter}
            />
          </div>
        </div>

        {/* Category Breakdown Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-[#141821] p-5 sm:p-6 rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 mb-2">
            <div>
              <h3 className="text-sm font-bold font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2">
                <PieChart className="size-4 text-[#E8B24D]" />
                <span>Issue Category Mix</span>
              </h3>
              <p className="text-[11px] text-[#8A93A3] font-mono-data">
                Volume share across 7 urban domains
              </p>
            </div>
            <span className="text-[10px] font-mono-data text-[#5B6270]">
              DONUT 360°
            </span>
          </div>

          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            <CategoryBreakdownChart
              issues={issues}
              onCategoryClick={handleCategoryChartClick}
              activeCategory={categoryFilter}
            />
          </div>
        </div>
      </div>

      {/* Municipal Hotspots Summary Panel */}
      <HotspotSummary hotspots={hotspots} />

      {/* Priority Queue Log Table */}
      <div className="flex flex-col gap-3">
        <PriorityQueue
          issues={issues}
          onRowClick={(issue) => setSelectedIssue(issue)}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          pageSize={8}
        />
      </div>

      {/* Right-Side Sliding Issue Detail Drawer */}
      <AnimatePresence>
        {selectedIssue && (
          <IssueDetailDrawer
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
