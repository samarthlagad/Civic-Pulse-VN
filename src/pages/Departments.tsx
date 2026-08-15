import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Users,
  Shield,
  Filter,
  X
} from "lucide-react"
import { useCivic } from "@/context/CivicContext"
import { PriorityQueue } from "@/components/PriorityQueue"
import { IssueDetailDrawer } from "@/components/IssueDetailDrawer"
import { Issue } from "@/types"

export function Departments() {
  const { issues, setDepartmentFilter } = useCivic()
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const departmentsStats = useMemo(() => {
    const stats: Record<string, { total: number; resolved: number; pending: number; slaBreach: number }> = {}
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime()

    issues.forEach((issue) => {
      if (!stats[issue.department]) {
        stats[issue.department] = { total: 0, resolved: 0, pending: 0, slaBreach: 0 }
      }
      stats[issue.department].total += 1

      const isResolved = ["RESOLVED", "CLOSED", "VERIFIED"].includes(issue.status)
      if (isResolved) {
        stats[issue.department].resolved += 1
      } else if (issue.status === "PENDING") {
        stats[issue.department].pending += 1
      }

      const isOld = new Date(issue.created_at).getTime() < tenDaysAgo
      if (isOld && !isResolved) {
        stats[issue.department].slaBreach += 1
      }
    })

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        ...data,
        resolutionRate: Math.round((data.resolved / data.total) * 100) || 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [issues])

  const deptFilteredIssues = useMemo(() => {
    if (!selectedDept) return []
    return issues.filter((i) => i.department === selectedDept)
  }, [issues, selectedDept])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3] flex items-center gap-2.5">
            <Building2 className="size-6 text-[#4C8DFF]" />
            <span>Municipal Departments & Workforce Units</span>
          </h1>
          <p className="text-xs font-mono-data text-[#8A93A3]">
            Performance indices, SLA compliance rates, and active workforce triage loads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141821] border border-[rgba(76,141,255,0.3)] text-[#4C8DFF] text-xs font-mono-data font-bold rounded-xl">
            <Users className="size-3.5" /> 7 Active Units
          </span>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departmentsStats.map((dept, idx) => {
          const isSelected = selectedDept === dept.name

          return (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -2, backgroundColor: "#1B202B" }}
              onClick={() => setSelectedDept(isSelected ? null : dept.name)}
              className={`p-5 rounded-xl bg-[#141821] border transition-all cursor-pointer shadow-lg flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? "border-[#4C8DFF] ring-1 ring-[#4C8DFF] glow-blue"
                  : "border-[rgba(255,255,255,0.08)] hover:border-[#4C8DFF]/40"
              }`}
            >
              {/* 2px colored top bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#4C8DFF]/60" />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-[#1B202B] text-[#4C8DFF] flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#EDEFF3] leading-tight">
                        {dept.name}
                      </h3>
                      <span className="text-[10px] font-mono-data uppercase font-bold text-[#8A93A3]">
                        Operational Unit
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Metric Mini Grid */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="p-2.5 rounded-lg bg-[#1B202B] border border-[rgba(255,255,255,0.06)]">
                    <span className="text-[10px] font-mono-data font-bold uppercase text-[#8A93A3] block">
                      Total Load
                    </span>
                    <span className="text-lg font-bold font-numeric text-[#EDEFF3]">
                      {dept.total}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)]">
                    <span className="text-[10px] font-mono-data font-bold uppercase text-[#34D399] block">
                      Resolution
                    </span>
                    <span className="text-lg font-bold font-numeric text-[#34D399]">
                      {dept.resolutionRate}%
                    </span>
                  </div>

                  <div className="col-span-2 p-2.5 rounded-lg bg-[rgba(240,87,107,0.1)] border border-[rgba(240,87,107,0.2)] flex items-center justify-between">
                    <span className="text-[10px] font-mono-data font-bold uppercase text-[#F0576B] flex items-center gap-1">
                      <AlertTriangle className="size-3 text-[#F0576B]" /> SLA Overdue
                    </span>
                    <span className="text-sm font-bold font-numeric text-[#F0576B]">
                      {dept.slaBreach} {dept.slaBreach === 1 ? "issue" : "issues"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-mono-data">
                <span className="text-[#8A93A3]">
                  {isSelected ? "Isolating queue below" : "Click to view queue"}
                </span>
                <ArrowRight
                  className={`size-3.5 transition-transform ${
                    isSelected ? "text-[#4C8DFF] rotate-90" : "text-[#5B6270]"
                  }`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Department Queue Table */}
      <AnimatePresence>
        {selectedDept && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#141821] border border-[rgba(255,255,255,0.08)]">
              <h3 className="text-sm font-bold font-mono-data text-[#EDEFF3] flex items-center gap-2">
                <span>Active Queue for <strong>{selectedDept}</strong></span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#1B202B] text-[#4C8DFF] border border-[rgba(76,141,255,0.25)]">
                  {deptFilteredIssues.length} tickets
                </span>
              </h3>
              <button
                onClick={() => setSelectedDept(null)}
                className="text-xs font-mono-data text-[#8A93A3] hover:text-[#EDEFF3] flex items-center gap-1 cursor-pointer"
              >
                <X className="size-3.5" />
                <span>Close Dept Queue</span>
              </button>
            </div>

            <PriorityQueue
              issues={deptFilteredIssues}
              onRowClick={(issue) => setSelectedIssue(issue)}
              pageSize={10}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-side sliding drawer */}
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
