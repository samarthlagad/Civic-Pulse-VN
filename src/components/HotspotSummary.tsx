import React from "react"
import { motion } from "motion/react"
import { Map, MapPin, ArrowRight, TrendingUp, AlertTriangle, Radio } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { WardHotspot } from "@/types"
import { useCivic } from "@/context/CivicContext"

interface HotspotSummaryProps {
  hotspots: WardHotspot[]
}

export function HotspotSummary({ hotspots }: HotspotSummaryProps) {
  const navigate = useNavigate()
  const { refreshKey } = useCivic()

  const sorted = [...hotspots].sort((a, b) => b.issue_count - a.issue_count)
  const topFive = sorted.slice(0, 5)
  const maxIssues = Math.max(...sorted.map((h) => h.issue_count), 1)

  return (
    <motion.div
      key={`hotspot-summary-${refreshKey}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="bg-[#141821] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 shadow-lg flex flex-col gap-5"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-[rgba(232,178,77,0.12)] text-[#E8B24D] flex items-center justify-center border border-[rgba(232,178,77,0.25)]">
            <Radio className="size-4.5 animate-pulse-dot" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2">
              <span>Municipal Hotspot Telemetry</span>
              <span className="size-1.5 rounded-full bg-[#34D399] animate-pulse-dot" />
            </h3>
            <p className="text-xs text-[#8A93A3] font-mono-data">
              Ward density analysis & sensor centroid tracking
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/hotspots")}
          className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#4C8DFF] hover:text-[#7bb0ff] bg-[rgba(76,141,255,0.12)] border border-[rgba(76,141,255,0.25)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Open Geo Command Map</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Grid: Left Top Wards List, Right Mini-Map Centroid Graphic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Wards Progress List (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] pb-1">
            <span>Ranked Ward Cluster</span>
            <span>Active Incidents</span>
          </div>

          {topFive.map((ward, idx) => {
            const pct = Math.round((ward.issue_count / maxIssues) * 100)
            const isTop = idx === 0

            return (
              <div
                key={ward.ward}
                onClick={() => navigate(`/hotspots/${ward.ward}`)}
                className="p-2.5 rounded-lg bg-[#1B202B] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-data font-bold text-[#5B6270] w-4">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#EDEFF3] group-hover:text-[#E8B24D] transition-colors">
                      {ward.ward} Ward
                    </span>
                    {isTop && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-data font-bold bg-[rgba(240,87,107,0.15)] text-[#F0576B] border border-[rgba(240,87,107,0.3)] uppercase">
                        High Density
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-data font-bold text-[#EDEFF3]">
                      {ward.issue_count} reports
                    </span>
                    <ArrowRight className="size-3 text-[#5B6270] group-hover:text-[#E8B24D] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#141821] h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.4, 0, 0.2, 1] }}
                    className={`h-full rounded-full ${
                      isTop ? "bg-[#F0576B]" : idx === 1 ? "bg-[#E8B24D]" : "bg-[#4C8DFF]"
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Mini Map Preview Widget (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full justify-between bg-[#1B202B] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] flex items-center gap-1.5">
              <MapPin className="size-3.5 text-[#E8B24D]" /> Centroid Pulse Grid
            </span>
            <span className="text-[9px] font-mono-data font-bold text-[#34D399] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] px-2 py-0.5 rounded">
              GPS SYNC OK
            </span>
          </div>

          {/* Stylized Geo Command Graphic with Radar Rings & Pulse */}
          <div className="relative h-36 bg-[#0B0D12] rounded-lg overflow-hidden flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(232, 178, 77, 0.25) 1px, transparent 1px), radial-gradient(rgba(76, 141, 255, 0.2) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            />

            {/* Concentric Radar Rings in Signal Gold */}
            <div className="absolute size-32 rounded-full border border-[rgba(232,178,77,0.15)]" />
            <div className="absolute size-20 rounded-full border border-[rgba(232,178,77,0.25)]" />
            <div className="absolute size-8 rounded-full border border-[rgba(232,178,77,0.35)]" />

            {/* Centroid Pulse Marker */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative">
                {/* Concentric expanding pulse rings */}
                <div className="absolute -inset-3 rounded-full bg-[#E8B24D]/30 animate-pulse-ring" />
                <div className="absolute -inset-6 rounded-full bg-[#E8B24D]/15 animate-pulse-ring-delayed" />
                <div className="size-8 rounded-full bg-[#E8B24D] text-[#0B0D12] flex items-center justify-center shadow-[0_0_15px_rgba(232,178,77,0.5)] border border-white text-xs font-bold font-numeric">
                  {topFive[0]?.issue_count || 13}
                </div>
              </div>
            </div>

            {/* Satellite Nodes */}
            <div className="absolute top-4 left-6 size-5 rounded-full bg-[#F0576B] text-white flex items-center justify-center text-[9px] font-bold font-numeric border border-white shadow-xs">
              {topFive[1]?.issue_count || 13}
            </div>
            <div className="absolute bottom-5 right-8 size-5 rounded-full bg-[#4C8DFF] text-[#0B0D12] flex items-center justify-center text-[9px] font-bold font-numeric border border-white shadow-xs">
              {topFive[2]?.issue_count || 11}
            </div>

            {/* Coordinates HUD stamp */}
            <div className="absolute bottom-1.5 left-2 bg-[#141821]/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono-data text-[#8A93A3] border border-[rgba(255,255,255,0.08)]">
              Centroid: 23.3684° N, 85.2907° E
            </div>
          </div>

          <div className="mt-3 text-xs font-mono-data text-[#8A93A3] flex items-center justify-between">
            <span>Primary Focus: <strong className="text-[#EDEFF3]">{topFive[0]?.ward}</strong></span>
            <span className="font-bold text-[#F0576B]">Severity Index: 88/100</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
