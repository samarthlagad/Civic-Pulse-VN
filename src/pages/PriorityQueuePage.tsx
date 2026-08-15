import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { IssueDetailDrawer } from "@/components/IssueDetailDrawer"
import { StatusBadge, PriorityBar } from "@/components/PriorityQueue"
import { Issue } from "@/types"
import { useCivic } from "@/context/CivicContext"
import {
  ListOrdered,
  ShieldAlert,
  Clock,
  Flame,
  AlertTriangle,
  GripVertical,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Tag,
  Building2,
  Filter
} from "lucide-react"

export function PriorityQueuePage() {
  const { issues, moveIssueLane, refreshKey } = useCivic()
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [activeLaneFilter, setActiveLaneFilter] = useState<"all" | "critical" | "high" | "medium">("all")

  // Group issues into the 3 swimlanes
  const criticalLane = issues.filter((i) => (i.lane === "critical" || i.severity >= 90))
  const highLane = issues.filter((i) => (i.lane === "high" || (i.severity >= 70 && i.severity < 90)))
  const mediumLane = issues.filter((i) => (i.lane === "medium" || i.severity < 70))

  const lanes = [
    {
      id: "critical" as const,
      title: "CRITICAL SEVERITY (90+)",
      count: criticalLane.length,
      items: criticalLane,
      slaAvg: "4.2h avg remain",
      borderColor: "border-[#F0576B]/40",
      accentBg: "bg-[rgba(240,87,107,0.12)]",
      badgeColor: "text-[#F0576B] bg-[rgba(240,87,107,0.15)] border-[rgba(240,87,107,0.3)]",
      indicatorColor: "#F0576B",
      glowClass: "glow-critical"
    },
    {
      id: "high" as const,
      title: "HIGH SEVERITY (70–89)",
      count: highLane.length,
      items: highLane,
      slaAvg: "18.5h avg remain",
      borderColor: "border-[#F5A524]/40",
      accentBg: "bg-[rgba(245,165,36,0.12)]",
      badgeColor: "text-[#F5A524] bg-[rgba(245,165,36,0.15)] border-[rgba(245,165,36,0.3)]",
      indicatorColor: "#F5A524",
      glowClass: "glow-gold"
    },
    {
      id: "medium" as const,
      title: "STANDARD / MEDIUM (<70)",
      count: mediumLane.length,
      items: mediumLane,
      slaAvg: "38.0h avg remain",
      borderColor: "border-[#4C8DFF]/40",
      accentBg: "bg-[rgba(76,141,255,0.12)]",
      badgeColor: "text-[#4C8DFF] bg-[rgba(76,141,255,0.15)] border-[rgba(76,141,255,0.3)]",
      indicatorColor: "#4C8DFF",
      glowClass: "glow-blue"
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3] flex items-center gap-2.5">
              <ListOrdered className="size-6 text-[#E8B24D]" />
              <span>Dedicated Severity Swimlanes</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[rgba(232,178,77,0.15)] text-[#E8B24D] border border-[rgba(232,178,77,0.3)] uppercase">
              Triage Matrix
            </span>
          </div>
          <p className="text-xs font-mono-data text-[#8A93A3] mt-0.5">
            Dynamic triage queue organized by severity tiers with SLA countdown meters and quick re-prioritization.
          </p>
        </div>

        {/* Lane Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141821] border border-[rgba(255,255,255,0.08)] self-start sm:self-auto text-xs font-mono-data">
          {(["all", "critical", "high", "medium"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveLaneFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                activeLaneFilter === tab
                  ? "bg-[#1B202B] text-[#E8B24D] border border-[rgba(255,255,255,0.08)] glow-gold"
                  : "text-[#8A93A3] hover:text-[#EDEFF3]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Horizontal Swimlanes Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {lanes
          .filter((lane) => activeLaneFilter === "all" || activeLaneFilter === lane.id)
          .map((lane) => (
            <div
              key={`${lane.id}-${refreshKey}`}
              className={`bg-[#141821] rounded-2xl border ${lane.borderColor} flex flex-col overflow-hidden shadow-xl min-h-[520px]`}
            >
              {/* Swimlane Header */}
              <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[#1B202B]/90 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: lane.indicatorColor }}
                  />
                  <h3 className="text-xs font-bold font-mono-data uppercase tracking-wider text-[#EDEFF3]">
                    {lane.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${lane.badgeColor}`}>
                    {lane.count} items
                  </span>
                </div>
              </div>

              {/* SLA Target Sub-bar */}
              <div className="px-4 py-2 bg-[#0B0D12]/40 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[10px] font-mono-data text-[#8A93A3]">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-[#E8B24D]" />
                  <span>SLA Countdown</span>
                </span>
                <span className="text-[#34D399] font-bold">{lane.slaAvg}</span>
              </div>

              {/* Card List in Swimlane */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[720px]">
                {lane.items.length === 0 ? (
                  <div className="p-8 text-center text-[#5B6270] font-mono-data text-xs">
                    No incidents in this severity band.
                  </div>
                ) : (
                  lane.items.map((issue, idx) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      whileHover={{ 
                        y: -2,
                        backgroundColor: "#1B202B",
                        boxShadow: "0 0 16px -2px rgba(232,178,77,0.15)"
                      }}
                      onClick={() => setSelectedIssue(issue)}
                      className="p-3.5 rounded-xl bg-[#141821] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/50 transition-all cursor-pointer flex flex-col gap-2.5 group relative"
                    >
                      {/* Top row: ID, Department & Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono-data font-bold text-[#E8B24D]">
                          {issue.id.replace("CIV-", "#")}
                        </span>
                        <StatusBadge status={issue.status} />
                      </div>

                      {/* Summary description */}
                      <p className="text-xs font-semibold text-[#EDEFF3] group-hover:text-[#4C8DFF] transition-colors line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>

                      {/* Severity & Category Meta */}
                      <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.04)] text-[11px] font-mono-data text-[#8A93A3]">
                        <span className="truncate max-w-[130px]">{issue.category}</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-[#5B6270]">Sev:</span>
                          <span className={lane.id === "critical" ? "text-[#F0576B]" : lane.id === "high" ? "text-[#F5A524]" : "text-[#4C8DFF]"}>
                            {issue.severity}/100
                          </span>
                        </div>
                      </div>

                      {/* Quick Move Lane Buttons (Hover reveal) */}
                      <div
                        className="pt-2 flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] text-[10px] font-mono-data"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[#5B6270]">Move Tier:</span>
                        <div className="flex items-center gap-1">
                          {lane.id !== "critical" && (
                            <button
                              onClick={() => moveIssueLane(issue.id, "critical")}
                              className="px-1.5 py-0.5 rounded bg-[rgba(240,87,107,0.15)] text-[#F0576B] hover:bg-[rgba(240,87,107,0.25)] cursor-pointer"
                              title="Promote to Critical"
                            >
                              Crit
                            </button>
                          )}
                          {lane.id !== "high" && (
                            <button
                              onClick={() => moveIssueLane(issue.id, "high")}
                              className="px-1.5 py-0.5 rounded bg-[rgba(245,165,36,0.15)] text-[#F5A524] hover:bg-[rgba(245,165,36,0.25)] cursor-pointer"
                              title="Move to High"
                            >
                              High
                            </button>
                          )}
                          {lane.id !== "medium" && (
                            <button
                              onClick={() => moveIssueLane(issue.id, "medium")}
                              className="px-1.5 py-0.5 rounded bg-[rgba(76,141,255,0.15)] text-[#4C8DFF] hover:bg-[rgba(76,141,255,0.25)] cursor-pointer"
                              title="Demote to Medium"
                            >
                              Med
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Right-Side Sliding Drawer */}
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
