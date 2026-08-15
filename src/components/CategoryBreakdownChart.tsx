import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Issue } from "@/types"
import { useCivic } from "@/context/CivicContext"

interface CategoryBreakdownChartProps {
  issues: Issue[]
  onCategoryClick?: (category: string) => void
  activeCategory?: string | null
}

const CATEGORY_PALETTE: Record<string, { label: string; color: string }> = {
  "Drainage": { label: "Drainage", color: "#F0576B" },              // Rose / Red
  "Garbage": { label: "Garbage", color: "#8A93A3" },                // Slate Gray
  "Illegal Construction": { label: "Illegal Construction", color: "#4C8DFF" }, // Operational Blue
  "Pothole": { label: "Pothole", color: "#34D399" },                // Emerald
  "Streetlight": { label: "Streetlight", color: "#E8B24D" },        // Signal Gold
  "Traffic Signal": { label: "Traffic Signal", color: "#F5A524" },  // Amber
  "Water Leak": { label: "Water Leak", color: "#A78BFA" },          // Purple
}

const CATEGORY_LIST = [
  "Drainage",
  "Garbage",
  "Illegal Construction",
  "Pothole",
  "Streetlight",
  "Traffic Signal",
  "Water Leak",
]

export function CategoryBreakdownChart({ issues, onCategoryClick, activeCategory }: CategoryBreakdownChartProps) {
  const { refreshKey } = useCivic()
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Compute values for each category
  const data = CATEGORY_LIST.map((name) => {
    const count = issues.filter((i) => i.category.toLowerCase().includes(name.toLowerCase())).length || 
                  issues.filter((i) => i.category === name).length
    return {
      name,
      value: count,
      color: CATEGORY_PALETTE[name]?.color || "#4C8DFF",
      label: CATEGORY_PALETTE[name]?.label || name,
    }
  })

  const totalValue = data.reduce((sum, item) => sum + item.value, 0) || 1

  // SVG Donut Math
  const size = 190
  const center = size / 2
  const outerRadius = 76
  const innerRadius = 52

  let cumulativeAngle = 0
  const arcs = data.map((item) => {
    const angle = (item.value / totalValue) * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    cumulativeAngle += angle

    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180
    const midRad = ((startAngle + angle / 2 - 90) * Math.PI) / 180

    const rOuter = outerRadius
    const rInner = innerRadius
    const x1 = center + rOuter * Math.cos(startRad)
    const y1 = center + rOuter * Math.sin(startRad)
    const x2 = center + rOuter * Math.cos(endRad)
    const y2 = center + rOuter * Math.sin(endRad)
    const x3 = center + rInner * Math.cos(endRad)
    const y3 = center + rInner * Math.sin(endRad)
    const x4 = center + rInner * Math.cos(startRad)
    const y4 = center + rInner * Math.sin(startRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const d = [
      `M ${x1} ${y1}`,
      `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ")

    const explodeX = Math.cos(midRad) * 4
    const explodeY = Math.sin(midRad) * 4

    return {
      ...item,
      d,
      angle,
      explodeX,
      explodeY,
      percentage: Math.round((item.value / totalValue) * 100),
    }
  })

  const currentHoveredItem = hoveredCategory ? data.find((d) => d.name === hoveredCategory) : null

  return (
    <div className="w-full flex flex-col h-full items-center justify-between select-none">
      {/* Donut Graphic & Center Display */}
      <div className="relative flex items-center justify-center p-2">
        <svg
          key={`donut-svg-${refreshKey}`}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {arcs.map((arc, index) => {
            const isHovered = hoveredCategory === arc.name
            const isActive = activeCategory === arc.name
            const isDimmed = hoveredCategory !== null && !isHovered

            return (
              <motion.path
                key={`${arc.name}-${refreshKey}`}
                d={arc.d}
                fill={arc.color}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: isDimmed ? 0.3 : 1,
                  scale: isHovered || isActive ? 1.05 : 1,
                  x: isHovered ? arc.explodeX : 0,
                  y: isHovered ? arc.explodeY : 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.04,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="cursor-pointer transition-colors"
                style={{ transformOrigin: `${center}px ${center}px` }}
                onMouseEnter={() => setHoveredCategory(arc.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onCategoryClick?.(arc.name)}
              />
            )
          })}
        </svg>

        {/* Dynamic Center Metric Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <AnimatePresence mode="wait">
            {currentHoveredItem ? (
              <motion.div
                key={currentHoveredItem.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl font-bold text-[#EDEFF3] font-numeric leading-none">
                  {currentHoveredItem.value}
                </span>
                <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#E8B24D] truncate max-w-[90px] mt-0.5">
                  {currentHoveredItem.label}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl font-bold text-[#EDEFF3] font-numeric leading-none">
                  {totalValue}
                </span>
                <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] mt-0.5">
                  TOTAL
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 7-Segment Color-Dot Legend Row */}
      <div className="w-full mt-2 pt-3 border-t border-[rgba(255,255,255,0.08)] grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-xs">
        {data.map((item) => {
          const isHovered = hoveredCategory === item.name
          const isActive = activeCategory === item.name

          return (
            <button
              key={item.name}
              type="button"
              onMouseEnter={() => setHoveredCategory(item.name)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onCategoryClick?.(item.name)}
              className={`flex items-center gap-1.5 py-1 px-1.5 rounded text-left transition-all cursor-pointer ${
                isHovered || isActive
                  ? "bg-[#1B202B] text-[#EDEFF3] font-bold"
                  : "text-[#8A93A3] hover:text-[#EDEFF3]"
              }`}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-[10px] font-mono-data font-medium leading-tight">
                {item.label}
              </span>
              <span className="ml-auto text-[10px] font-mono-data text-[#5B6270] font-bold">
                {item.value}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Filter Clear indicator */}
      {activeCategory && (
        <div className="mt-2 w-full flex items-center justify-between text-xs text-[#4C8DFF] pt-1">
          <span className="font-mono-data text-[11px] truncate">
            Category: <strong>{activeCategory}</strong>
          </span>
          <button
            onClick={() => onCategoryClick?.(activeCategory)}
            className="text-[11px] font-mono-data font-bold underline hover:text-[#7bb0ff] shrink-0 ml-2 cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  )
}
