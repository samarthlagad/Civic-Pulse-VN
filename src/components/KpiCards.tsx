import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2, AlertTriangle, Layers, Activity } from "lucide-react"
import { Stats } from "@/types"
import { useCivic } from "@/context/CivicContext"

interface KpiCardsProps {
  stats: Stats
  onMetricClick?: (metricId: string) => void
}

// Mini Sparkline SVG Generator
function MiniSparkline({ isPositive, isCritical }: { isPositive: boolean; isCritical?: boolean }) {
  const points = isPositive 
    ? "0,14 6,12 12,15 18,9 24,11 30,5 36,7 42,2" 
    : "0,3 6,5 12,2 18,8 24,6 30,12 36,10 42,15"
  
  const strokeColor = isCritical 
    ? "#F0576B" 
    : isPositive 
      ? "#34D399" 
      : "#F5A524"

  return (
    <svg width="44" height="18" viewBox="0 0 44 18" className="overflow-visible opacity-90">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// Number Count-Up Hook
function AnimatedNumber({ value, refreshKey }: { value: number; refreshKey: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const duration = 600
    const startVal = 0

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (value - startVal) * easeProgress)
      setDisplayValue(current)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }

    const animId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animId)
  }, [value, refreshKey])

  return <span className="font-numeric">{displayValue}</span>
}

export function KpiCards({ stats, onMetricClick }: KpiCardsProps) {
  const { refreshKey, statusFilter, isRefreshing } = useCivic()

  const kpis = [
    {
      id: "total",
      title: "TOTAL ISSUES",
      value: stats.total,
      trend: "+12%",
      isPositive: true,
      isBetterWhenLower: false,
      icon: Layers,
      leftBarColor: "#4C8DFF",
      badgeColor: "text-[#4C8DFF] bg-[rgba(76,141,255,0.12)] border-[rgba(76,141,255,0.25)]",
      isCriticalType: false,
    },
    {
      id: "critical",
      title: "CRITICAL INCIDENTS",
      value: stats.critical,
      trend: "-5%",
      isPositive: true, // Decreasing critical is positive
      isBetterWhenLower: true,
      icon: AlertCircle,
      leftBarColor: "#F0576B",
      badgeColor: "text-[#F0576B] bg-[rgba(240,87,107,0.12)] border-[rgba(240,87,107,0.3)]",
      isCriticalType: true,
    },
    {
      id: "pending",
      title: "PENDING TRIAGE",
      value: stats.pending,
      trend: "+2%",
      isPositive: false,
      isBetterWhenLower: true,
      icon: Clock,
      leftBarColor: "#F5A524",
      badgeColor: "text-[#F5A524] bg-[rgba(245,165,36,0.12)] border-[rgba(245,165,36,0.3)]",
      isCriticalType: false,
    },
    {
      id: "resolved",
      title: "RESOLVED & CLOSED",
      value: stats.resolved,
      trend: "+18%",
      isPositive: true,
      isBetterWhenLower: false,
      icon: CheckCircle2,
      leftBarColor: "#34D399",
      badgeColor: "text-[#34D399] bg-[rgba(52,211,153,0.12)] border-[rgba(52,211,153,0.3)]",
      isCriticalType: false,
    },
    {
      id: "sla_breaches",
      title: "SLA AT RISK",
      value: stats.sla_breaches,
      trend: "-2%",
      isPositive: true,
      isBetterWhenLower: true,
      icon: AlertTriangle,
      leftBarColor: "#F0576B",
      badgeColor: "text-[#F0576B] bg-[rgba(240,87,107,0.12)] border-[rgba(240,87,107,0.3)]",
      isCriticalType: true,
    },
  ]

  return (
    <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 shrink-0">
      {kpis.map((kpi, index) => {
        const isSelected = 
          (kpi.id === "pending" && statusFilter === "PENDING") ||
          (kpi.id === "resolved" && statusFilter === "RESOLVED")

        return (
          <motion.div
            key={`${kpi.id}-${refreshKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.35, 
              delay: index * 0.05, 
              ease: [0.4, 0, 0.2, 1] 
            }}
            whileHover={{ 
              y: -2, 
              backgroundColor: "#1B202B",
              boxShadow: kpi.isCriticalType 
                ? "0 0 20px -2px rgba(240,87,107,0.2)" 
                : "0 0 20px -2px rgba(76,141,255,0.15)"
            }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onMetricClick?.(kpi.id)}
            className={`bg-[#141821] p-4 sm:p-4.5 rounded-xl border border-[rgba(255,255,255,0.08)] ${
              isSelected ? "ring-1 ring-[#4C8DFF] glow-blue" : ""
            } cursor-pointer transition-all duration-150 flex flex-col justify-between relative overflow-hidden`}
          >
            {/* 2px colored left-edge indicator bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2.5px]"
              style={{ backgroundColor: kpi.leftBarColor }}
            />

            {/* Top row: Monospace label + icon badge */}
            <div className="flex items-center justify-between mb-3 pl-1">
              <span className="text-[11px] font-mono-data font-bold tracking-wider uppercase text-[#8A93A3]">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${kpi.badgeColor} relative`}>
                <kpi.icon className="size-3.5" />
                {kpi.isCriticalType && isRefreshing && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#F0576B] animate-trend-pulse" />
                )}
              </div>
            </div>

            {/* Middle/Bottom row: Large numeric number + Sparkline & Trend */}
            <div className="flex items-end justify-between mt-auto pl-1">
              <div className="text-3xl font-bold text-[#EDEFF3] leading-none tracking-tight font-numeric">
                <AnimatedNumber value={kpi.value} refreshKey={refreshKey} />
              </div>

              {/* Sparkline & trend info */}
              <div className="flex flex-col items-end gap-1">
                <MiniSparkline isPositive={kpi.isPositive} isCritical={kpi.isCriticalType} />
                <div
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold border ${
                    kpi.isPositive
                      ? "bg-[rgba(52,211,153,0.12)] text-[#34D399] border-[rgba(52,211,153,0.25)]"
                      : "bg-[rgba(240,87,107,0.12)] text-[#F0576B] border-[rgba(240,87,107,0.25)]"
                  }`}
                >
                  {kpi.isPositive ? (
                    <TrendingUp className="size-2.5" />
                  ) : (
                    <TrendingDown className="size-2.5" />
                  )}
                  <span>{kpi.trend}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
