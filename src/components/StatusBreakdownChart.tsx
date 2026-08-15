import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Issue } from "@/types"
import { useCivic } from "@/context/CivicContext"

interface StatusBreakdownChartProps {
  issues: Issue[]
  onStatusClick?: (status: string) => void
  activeStatus?: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  RESOLVED: { label: "Resolved", color: "#34D399" },
  PENDING: { label: "Pending", color: "#F5A524" },
  VERIFIED: { label: "Verified", color: "#34D399" },
  IN_PROGRESS: { label: "In Progress", color: "#A78BFA" },
  ASSIGNED: { label: "Assigned", color: "#4C8DFF" },
  CLOSED: { label: "Closed", color: "#5B6270" },
}

const ORDERED_STATUSES = ["RESOLVED", "PENDING", "VERIFIED", "IN_PROGRESS", "ASSIGNED", "CLOSED"]

export function StatusBreakdownChart({ issues, onStatusClick, activeStatus }: StatusBreakdownChartProps) {
  const { refreshKey } = useCivic()
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
  const [pulsingStatus, setPulsingStatus] = useState<string | null>(null)

  // Compute counts
  const counts = ORDERED_STATUSES.reduce((acc, statusKey) => {
    acc[statusKey] = issues.filter((i) => i.status === statusKey).length
    return acc
  }, {} as Record<string, number>)

  const total = issues.length || 1
  const maxAxisValue = 24
  const gridLines = [24, 18, 12, 6, 0]

  const handleBarClick = (statusKey: string) => {
    setPulsingStatus(statusKey)
    setTimeout(() => setPulsingStatus(null), 400)
    onStatusClick?.(statusKey)
  }

  return (
    <div className="w-full flex flex-col h-full select-none">
      {/* Chart Canvas Area */}
      <div className="relative flex-1 w-full pt-4 pb-2 px-2 flex flex-col justify-end min-h-[220px]">
        {/* Y-Axis Gridlines 0 - 24 (4% white opacity) */}
        <div className="absolute inset-x-0 inset-y-4 flex flex-col justify-between pointer-events-none pr-2">
          {gridLines.map((val) => (
            <div key={val} className="w-full flex items-center gap-2">
              <span className="text-[10px] font-mono-data text-[#5B6270] w-5 text-right shrink-0">
                {val}
              </span>
              <div className="flex-1 border-b border-[rgba(255,255,255,0.04)] border-dashed" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative z-10 grid grid-cols-6 gap-2 sm:gap-4 h-[180px] items-end pl-7 pr-2">
          {ORDERED_STATUSES.map((statusKey, idx) => {
            const count = counts[statusKey] || 0
            const percentage = Math.min((count / maxAxisValue) * 100, 100)
            const config = STATUS_CONFIG[statusKey]
            const isHovered = hoveredStatus === statusKey
            const isDimmed = hoveredStatus !== null && !isHovered
            const isActive = activeStatus === statusKey
            const isPulsing = pulsingStatus === statusKey

            return (
              <div
                key={`${statusKey}-${refreshKey}`}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredStatus(statusKey)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => handleBarClick(statusKey)}
              >
                {/* Floating Tooltip in Command Console style */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: -4, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-10 z-30 px-2.5 py-1 bg-[#1B202B] text-[#EDEFF3] border border-[rgba(255,255,255,0.12)] text-[11px] font-mono-data font-semibold rounded-md shadow-xl pointer-events-none whitespace-nowrap flex items-center gap-1.5"
                    >
                      <span
                        className="size-2 rounded-full inline-block"
                        style={{ backgroundColor: config.color }}
                      />
                      <span>
                        {config.label}: <strong>{count}</strong> ({Math.round((count / total) * 100)}%)
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Animated Bar with Command Console glow on hover */}
                <div className="w-full flex justify-center items-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${Math.max(percentage, 4)}%`,
                      scale: isPulsing ? 1.08 : isHovered ? 1.04 : 1,
                      opacity: isDimmed ? 0.35 : 1
                    }}
                    transition={{
                      height: { duration: 0.5, delay: idx * 0.06, ease: [0.4, 0, 0.2, 1] },
                      scale: { duration: 0.2 },
                      opacity: { duration: 0.2 }
                    }}
                    style={{ backgroundColor: config.color }}
                    className={`w-full max-w-[34px] rounded-t-sm transition-all relative ${
                      isActive ? "ring-2 ring-offset-2 ring-offset-[#141821] ring-[#4C8DFF]" : ""
                    }`}
                  >
                    {/* Top value badge on bar */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono-data text-[#EDEFF3]">
                      {count}
                    </div>
                  </motion.div>
                </div>

                {/* X-Axis Label */}
                <div className="mt-2 text-center w-full truncate">
                  <span
                    className={`text-[10px] font-mono-data tracking-tight truncate block ${
                      isActive || isHovered ? "text-[#EDEFF3] font-bold" : "text-[#8A93A3]"
                    }`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer / Active filter reminder */}
      {activeStatus && (
        <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs text-[#4C8DFF]">
          <span className="font-mono-data text-[11px]">
            Filtered by status: <strong>{activeStatus.replace("_", " ")}</strong>
          </span>
          <button
            onClick={() => onStatusClick?.(activeStatus)}
            className="text-[11px] font-mono-data font-bold underline hover:text-[#7bb0ff] cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  )
}
