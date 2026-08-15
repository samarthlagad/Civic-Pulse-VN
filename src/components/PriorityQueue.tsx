import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Issue } from "@/types"
import { ArrowUpDown, Filter, ChevronDown, RefreshCw, X, AlertCircle, Sparkles } from "lucide-react"
import { useCivic } from "@/context/CivicContext"

interface PriorityQueueProps {
  issues: Issue[]
  onRowClick?: (issue: Issue) => void
  statusFilter?: string | null
  categoryFilter?: string | null
  departmentFilter?: string | null
  pageSize?: number
  showCheckbox?: boolean
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
  onSelectAll?: (ids: string[]) => void
}

// Status badge styling per design system
export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()
  
  let bgClass = "bg-[rgba(91,98,112,0.15)] text-[#8A93A3] border-[rgba(91,98,112,0.3)]"
  let dotColor = "#5B6270"

  if (normalized === "PENDING") {
    bgClass = "bg-[rgba(245,165,36,0.12)] text-[#F5A524] border-[rgba(245,165,36,0.3)]"
    dotColor = "#F5A524"
  } else if (normalized === "ASSIGNED") {
    bgClass = "bg-[rgba(76,141,255,0.12)] text-[#4C8DFF] border-[rgba(76,141,255,0.3)]"
    dotColor = "#4C8DFF"
  } else if (normalized === "IN_PROGRESS") {
    bgClass = "bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border-[rgba(167,139,250,0.3)]"
    dotColor = "#A78BFA"
  } else if (normalized === "RESOLVED" || normalized === "VERIFIED") {
    bgClass = "bg-[rgba(52,211,153,0.12)] text-[#34D399] border-[rgba(52,211,153,0.3)]"
    dotColor = "#34D399"
  } else if (normalized === "CLOSED") {
    bgClass = "bg-[rgba(91,98,112,0.15)] text-[#8A93A3] border-[rgba(91,98,112,0.3)]"
    dotColor = "#5B6270"
  } else if (normalized === "CRITICAL") {
    bgClass = "bg-[rgba(240,87,107,0.15)] text-[#F0576B] border-[rgba(240,87,107,0.3)]"
    dotColor = "#F0576B"
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold uppercase tracking-wider border shrink-0 ${bgClass}`}
    >
      <span className="size-1.5 rounded-full shrink-0 animate-pulse-dot" style={{ backgroundColor: dotColor }} />
      {status.replace("_", " ")}
    </span>
  )
}

// Slim horizontal severity bar indicator with monospace numeric value
export function PriorityBar({ value }: { value: number }) {
  let barColor = "bg-[#34D399]"
  let textColor = "text-[#34D399]"

  if (value >= 85) {
    barColor = "bg-[#F0576B]"
    textColor = "text-[#F0576B]"
  } else if (value >= 65) {
    barColor = "bg-[#F5A524]"
    textColor = "text-[#F5A524]"
  } else {
    barColor = "bg-[#4C8DFF]"
    textColor = "text-[#4C8DFF]"
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-[120px]">
      <div className="flex-1 bg-[rgba(255,255,255,0.06)] h-1.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <span className={`text-[11px] font-mono-data font-bold ${textColor} w-6 text-right`}>
        {value}
      </span>
    </div>
  )
}

export function PriorityQueue({
  issues,
  onRowClick,
  statusFilter,
  categoryFilter,
  departmentFilter,
  pageSize = 10,
  showCheckbox = false,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
}: PriorityQueueProps) {
  const { refreshKey, searchQuery } = useCivic()

  // Local filter states
  const [localCategory, setLocalCategory] = useState<string>(categoryFilter || "All")
  const [localStatus, setLocalStatus] = useState<string>(statusFilter || "All")
  const [localDept, setLocalDept] = useState<string>(departmentFilter || "All")
  const [sortKey, setSortKey] = useState<"priority" | "created_at" | "id" | "severity">("priority")
  const [sortDesc, setSortDesc] = useState<boolean>(true)
  const [visibleCount, setVisibleCount] = useState<number>(pageSize)

  // Sync with props if they change externally
  useMemo(() => {
    if (categoryFilter !== undefined) setLocalCategory(categoryFilter || "All")
  }, [categoryFilter])

  useMemo(() => {
    if (statusFilter !== undefined) setLocalStatus(statusFilter || "All")
  }, [statusFilter])

  useMemo(() => {
    if (departmentFilter !== undefined) setLocalDept(departmentFilter || "All")
  }, [departmentFilter])

  // Extract unique filter dropdown values
  const uniqueCategories = useMemo(() => {
    const set = new Set(issues.map((i) => i.category))
    return ["All", ...Array.from(set).sort()]
  }, [issues])

  const uniqueStatuses = useMemo(() => {
    const set = new Set(issues.map((i) => i.status))
    return ["All", ...Array.from(set).sort()]
  }, [issues])

  const uniqueDepts = useMemo(() => {
    const set = new Set(issues.map((i) => i.department))
    return ["All", ...Array.from(set).sort()]
  }, [issues])

  // Filter & Sort
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Global Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = issue.id.toLowerCase().includes(q)
        const matchCat = issue.category.toLowerCase().includes(q)
        const matchDesc = issue.description.toLowerCase().includes(q)
        const matchDept = issue.department.toLowerCase().includes(q)
        if (!matchId && !matchCat && !matchDesc && !matchDept) return false
      }

      // Dropdowns
      if (localCategory !== "All" && issue.category !== localCategory) return false
      if (localStatus !== "All" && issue.status !== localStatus) return false
      if (localDept !== "All" && issue.department !== localDept) return false

      return true
    }).sort((a, b) => {
      let valA = a[sortKey]
      let valB = b[sortKey]

      if (sortKey === "created_at") {
        return sortDesc
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDesc ? valB - valA : valA - valB
      }

      return sortDesc
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB))
    })
  }, [issues, searchQuery, localCategory, localStatus, localDept, sortKey, sortDesc])

  const displayedIssues = filteredIssues.slice(0, visibleCount)

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + pageSize)
  }

  const hasActiveFilters =
    localCategory !== "All" || localStatus !== "All" || localDept !== "All" || !!searchQuery

  const resetFilters = () => {
    setLocalCategory("All")
    setLocalStatus("All")
    setLocalDept("All")
  }

  const allSelected = displayedIssues.length > 0 && displayedIssues.every((i) => selectedIds.includes(i.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectAll?.([])
    } else {
      onSelectAll?.(displayedIssues.map((i) => i.id))
    }
  }

  return (
    <div className="bg-[#141821] rounded-xl border border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden shadow-lg">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141821]">
        <div>
          <h3 className="text-sm font-bold font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2">
            <span>Priority Queue Log</span>
            <span className="size-1.5 rounded-full bg-[#E8B24D] animate-pulse-dot" />
          </h3>
          <p className="text-xs text-[#8A93A3] font-mono-data">
            Displaying <strong className="text-[#EDEFF3]">{displayedIssues.length}</strong> of <strong className="text-[#EDEFF3]">{filteredIssues.length}</strong> prioritized incidents
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={localCategory}
              onChange={(e) => {
                setLocalCategory(e.target.value)
                setVisibleCount(pageSize)
              }}
              className="text-xs font-mono-data font-semibold bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 text-[#EDEFF3] outline-none focus:border-[#E8B24D] cursor-pointer"
            >
              <option value="All" className="bg-[#141821]">Category: All</option>
              {uniqueCategories.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c} className="bg-[#141821]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={localStatus}
              onChange={(e) => {
                setLocalStatus(e.target.value)
                setVisibleCount(pageSize)
              }}
              className="text-xs font-mono-data font-semibold bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 text-[#EDEFF3] outline-none focus:border-[#E8B24D] cursor-pointer"
            >
              <option value="All" className="bg-[#141821]">Status: All</option>
              {uniqueStatuses.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s} className="bg-[#141821]">
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="relative">
            <select
              value={localDept}
              onChange={(e) => {
                setLocalDept(e.target.value)
                setVisibleCount(pageSize)
              }}
              className="text-xs font-mono-data font-semibold bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 text-[#EDEFF3] outline-none focus:border-[#E8B24D] cursor-pointer"
            >
              <option value="All" className="bg-[#141821]">Department: All</option>
              {uniqueDepts.filter((d) => d !== "All").map((d) => (
                <option key={d} value={d} className="bg-[#141821]">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-mono-data font-bold text-[#E8B24D] hover:text-amber-300 px-2 py-1 rounded bg-[rgba(232,178,77,0.12)] border border-[rgba(232,178,77,0.3)] transition-colors cursor-pointer"
            >
              <X className="size-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto min-h-[280px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#1B202B]/80 text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] sticky top-0 z-10 border-b border-[rgba(255,255,255,0.08)]">
            <tr>
              {showCheckbox && (
                <th className="px-4 py-3 w-10 text-center select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="accent-[#E8B24D] rounded cursor-pointer"
                  />
                </th>
              )}
              <th
                className="px-4 py-3 cursor-pointer hover:text-[#EDEFF3] transition-colors w-24 select-none"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  {sortKey === "id" && <span>{sortDesc ? "↓" : "↑"}</span>}
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-[#EDEFF3] transition-colors select-none"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center gap-1">
                  <span>Incident Summary</span>
                  {sortKey === "priority" && <span>{sortDesc ? "↓" : "↑"}</span>}
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-[#EDEFF3] transition-colors w-36 select-none"
                onClick={() => handleSort("severity")}
              >
                <div className="flex items-center gap-1">
                  <span>Severity</span>
                  {sortKey === "severity" && <span>{sortDesc ? "↓" : "↑"}</span>}
                </div>
              </th>
              <th className="px-4 py-3 w-32 select-none">
                <span>Status</span>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-[#EDEFF3] transition-colors w-28 select-none"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center gap-1">
                  <span>Created</span>
                  {sortKey === "created_at" && <span>{sortDesc ? "↓" : "↑"}</span>}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            <AnimatePresence>
              {displayedIssues.length === 0 ? (
                <tr>
                  <td colSpan={showCheckbox ? 6 : 5} className="px-4 py-12 text-center text-[#8A93A3]">
                    <AlertCircle className="size-8 mx-auto text-[#5B6270] mb-2" />
                    <p className="font-semibold text-sm text-[#EDEFF3]">No issues match current filters</p>
                    <p className="text-xs text-[#5B6270] font-mono-data mt-1">Adjust status or category filters above.</p>
                  </td>
                </tr>
              ) : (
                displayedIssues.map((issue, idx) => {
                  const isSelected = selectedIds.includes(issue.id)
                  return (
                    <motion.tr
                      key={`${issue.id}-${refreshKey}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: Math.min(idx * 0.02, 0.25),
                        ease: [0.4, 0, 0.2, 1] 
                      }}
                      onClick={() => onRowClick?.(issue)}
                      className={`cursor-pointer transition-colors group relative border-l-2 ${
                        isSelected 
                          ? "bg-[#1B202B] border-l-[#E8B24D]" 
                          : "border-l-transparent hover:bg-[#1B202B] hover:border-l-[#E8B24D]"
                      }`}
                    >
                      {/* Checkbox */}
                      {showCheckbox && (
                        <td
                          className="px-4 py-3.5 text-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleSelect?.(issue.id)
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect?.(issue.id)}
                            className="accent-[#E8B24D] rounded cursor-pointer"
                          />
                        </td>
                      )}

                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono-data text-[#8A93A3] font-bold text-xs whitespace-nowrap group-hover:text-[#E8B24D] transition-colors">
                        {issue.id.replace("CIV-", "#")}
                      </td>

                      {/* Issue Description & Subtitle */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-[#EDEFF3] group-hover:text-[#4C8DFF] transition-colors line-clamp-1">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 font-mono-data">
                          <span className="text-[11px] text-[#8A93A3]">
                            {issue.category}
                          </span>
                          <span className="text-[10px] text-[#5B6270]">•</span>
                          <span className="text-[11px] text-[#8A93A3]">
                            {issue.department}
                          </span>
                        </div>
                      </td>

                      {/* Severity Horizontal Bar */}
                      <td className="px-4 py-3.5">
                        <PriorityBar value={issue.severity} />
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={issue.status} />
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-[#8A93A3] font-mono-data text-[11px] whitespace-nowrap">
                        {new Date(issue.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {visibleCount < filteredIssues.length && (
        <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#1B202B]/60 text-center">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLoadMore}
            className="text-xs font-mono-data font-bold px-4 py-1.5 bg-[#141821] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D] hover:text-[#E8B24D] text-[#EDEFF3] rounded-lg transition-all shadow-xs cursor-pointer"
          >
            Load Next (+{Math.min(pageSize, filteredIssues.length - visibleCount)} incidents)
          </motion.button>
        </div>
      )}
    </div>
  )
}
