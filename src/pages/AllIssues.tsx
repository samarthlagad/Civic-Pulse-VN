import React, { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { PriorityQueue } from "@/components/PriorityQueue"
import { IssueDetailDrawer } from "@/components/IssueDetailDrawer"
import { Issue } from "@/types"
import { useCivic } from "@/context/CivicContext"
import {
  ListTodo,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldAlert,
  X,
  CheckSquare
} from "lucide-react"

const DEPARTMENTS = [
  "Roads & Bridges",
  "Sanitation & Waste Management",
  "Water & Sewerage Board",
  "Electrical & Power Grid",
  "Urban Planning & Zoning",
  "Traffic & Transit Authority",
  "Parks & Recreation",
]

export function AllIssues() {
  const [searchParams] = useSearchParams()
  const metric = searchParams.get("metric")
  const {
    issues,
    showToast,
    bulkUpdateStatus,
    bulkAssignDepartment,
    escalateIssue
  } = useCivic()

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDept, setBulkDept] = useState<string>(DEPARTMENTS[0])

  const preFilteredIssues = useMemo(() => {
    if (metric === "critical") {
      return issues.filter((i) => i.severity >= 80 || i.priority >= 80)
    }
    if (metric === "pending") {
      return issues.filter((i) => i.status === "PENDING")
    }
    if (metric === "resolved") {
      return issues.filter((i) => ["RESOLVED", "CLOSED", "VERIFIED"].includes(i.status))
    }
    if (metric === "sla_breaches") {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime()
      return issues.filter((i) => {
        const isOld = new Date(i.created_at).getTime() < tenDaysAgo
        const isNotDone = !["RESOLVED", "CLOSED", "VERIFIED"].includes(i.status)
        return isOld && isNotDone
      })
    }
    return issues
  }, [issues, metric])

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(ids)
  }

  const handleBulkReassign = () => {
    if (selectedIds.length === 0) return
    bulkAssignDepartment(selectedIds, bulkDept)
    setSelectedIds([])
  }

  const handleBulkResolve = () => {
    if (selectedIds.length === 0) return
    bulkUpdateStatus(selectedIds, "RESOLVED")
    setSelectedIds([])
  }

  const handleBulkEscalate = () => {
    if (selectedIds.length === 0) return
    selectedIds.forEach((id) => escalateIssue(id))
    showToast(`Escalated ${selectedIds.length} tickets to Critical status.`)
    setSelectedIds([])
  }

  const handleExportCSV = () => {
    const itemsToExport = selectedIds.length > 0 
      ? preFilteredIssues.filter(i => selectedIds.includes(i.id))
      : preFilteredIssues

    const headers = ["ID", "Category", "Department", "Severity", "Priority", "Status", "Date"]
    const rows = itemsToExport.map((i) => [
      i.id,
      `"${i.category}"`,
      `"${i.department}"`,
      i.severity,
      i.priority,
      i.status,
      `"${new Date(i.created_at).toLocaleDateString()}"`,
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `civic_incidents_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported ${itemsToExport.length} records to CSV.`)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-24 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3] flex items-center gap-2.5">
            <ListTodo className="size-6 text-[#4C8DFF]" />
            <span>Master Municipal Registry</span>
          </h1>
          <p className="text-xs font-mono-data text-[#8A93A3]">
            Comprehensive incident dataset, multi-select batch dispatcher, and audit inspector.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#141821] hover:bg-[#1B202B] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/40 text-[#EDEFF3] text-xs font-mono-data font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="size-3.5 text-[#E8B24D]" />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Priority Queue / Data Table with Checkbox Multi-Select */}
      <PriorityQueue
        issues={preFilteredIssues}
        onRowClick={(issue) => setSelectedIssue(issue)}
        pageSize={20}
        showCheckbox={true}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Floating Bottom Action Bar (slides up when 1+ rows selected) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1B202B] border border-[#E8B24D] text-[#EDEFF3] px-5 py-3.5 rounded-2xl shadow-2xl flex flex-wrap items-center gap-3.5 glow-gold"
          >
            <div className="flex items-center gap-2 pr-2 border-r border-[rgba(255,255,255,0.12)]">
              <span className="size-2 rounded-full bg-[#E8B24D] animate-pulse-dot" />
              <span className="text-xs font-mono-data font-bold">
                {selectedIds.length} incidents selected
              </span>
            </div>

            {/* Department Reassign Dropdown & Button */}
            <div className="flex items-center gap-2">
              <select
                value={bulkDept}
                onChange={(e) => setBulkDept(e.target.value)}
                className="text-xs font-mono-data bg-[#141821] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 text-[#EDEFF3] outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-[#141821]">
                    {d}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkReassign}
                className="px-3 py-1.5 bg-[#4C8DFF] text-[#0B0D12] text-xs font-mono-data font-bold rounded-lg hover:bg-[#3b7cee] transition-colors cursor-pointer"
              >
                Reassign
              </button>
            </div>

            {/* Mark Resolved */}
            <button
              onClick={handleBulkResolve}
              className="px-3 py-1.5 bg-[#34D399] text-[#0B0D12] text-xs font-mono-data font-bold rounded-lg hover:bg-[#28be86] transition-colors cursor-pointer"
            >
              Mark Resolved
            </button>

            {/* Escalate */}
            <button
              onClick={handleBulkEscalate}
              className="px-3 py-1.5 bg-[rgba(240,87,107,0.2)] border border-[rgba(240,87,107,0.4)] text-[#F0576B] hover:bg-[rgba(240,87,107,0.3)] text-xs font-mono-data font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="size-3.5" />
              <span>Escalate</span>
            </button>

            {/* Export Selected */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-[#141821] hover:bg-[#222938] border border-[rgba(255,255,255,0.08)] text-[#EDEFF3] text-xs font-mono-data font-bold rounded-lg transition-colors cursor-pointer"
            >
              Export ({selectedIds.length})
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-[#8A93A3] hover:text-[#EDEFF3] hover:bg-[#141821] rounded-lg transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-side sliding drawer on row click */}
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
