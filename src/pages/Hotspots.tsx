import React, { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { PriorityQueue } from "@/components/PriorityQueue"
import { IssueDetailDrawer } from "@/components/IssueDetailDrawer"
import {
  Map,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Layers,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Radio,
  Activity
} from "lucide-react"
import { Issue, WardHotspot } from "@/types"
import { useCivic } from "@/context/CivicContext"

export function Hotspots() {
  const { wardId } = useParams()
  const navigate = useNavigate()
  const { issues, hotspots, refreshKey } = useCivic()
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [activeWardHover, setActiveWardHover] = useState<string | null>(null)

  const selectedWard = useMemo(() => {
    return hotspots.find((h) => h.ward.toLowerCase() === wardId?.toLowerCase())
  }, [wardId, hotspots])

  const wardIssues = useMemo(() => {
    if (!selectedWard) return []
    return issues.filter((issue) => {
      const dist = Math.sqrt(
        Math.pow(issue.latitude - selectedWard.latitude, 2) +
        Math.pow(issue.longitude - selectedWard.longitude, 2)
      )
      return dist < 0.05
    })
  }, [selectedWard, issues])

  // SUBPAGE: Individual Ward View
  if (wardId) {
    if (!selectedWard) {
      return (
        <div className="p-8 text-center bg-[#141821] rounded-2xl border border-[rgba(255,255,255,0.08)] max-w-xl mx-auto mt-10">
          <p className="text-base font-bold font-mono-data text-[#EDEFF3]">Ward Sector Not Found</p>
          <button
            onClick={() => navigate("/hotspots")}
            className="mt-4 px-4 py-2 bg-[#E8B24D] text-[#0B0D12] text-xs font-mono-data font-bold rounded-xl"
          >
            Return to Hotspot Command Grid
          </button>
        </div>
      )
    }

    const pendingCount = wardIssues.filter((i) => i.status === "PENDING").length
    const criticalCount = wardIssues.filter((i) => i.severity >= 80).length

    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
        {/* Ward Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/hotspots")}
            className="p-2.5 rounded-xl bg-[#141821] border border-[rgba(255,255,255,0.08)] hover:bg-[#1B202B] text-[#EDEFF3] transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4 text-[#E8B24D]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3] flex items-center gap-2.5">
              <span>{selectedWard.ward} Ward</span>
              <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-[rgba(240,87,107,0.15)] text-[#F0576B] border border-[rgba(240,87,107,0.3)] uppercase">
                Active Zone
              </span>
            </h1>
            <p className="text-xs font-mono-data text-[#8A93A3]">
              Spatial Centroid: Lat {selectedWard.latitude.toFixed(4)}° N, Long {selectedWard.longitude.toFixed(4)}° E
            </p>
          </div>
        </div>

        {/* 3 Ward KPI stats in Command Console Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4.5 rounded-xl bg-[#141821] border border-[rgba(240,87,107,0.3)] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#F0576B]" />
            <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#F0576B] block mb-2">
              Incident Density Load
            </span>
            <div className="text-3xl font-bold font-numeric text-[#EDEFF3]">
              {selectedWard.issue_count} <span className="text-xs font-mono-data text-[#8A93A3] font-normal">reports</span>
            </div>
          </div>

          <div className="p-4.5 rounded-xl bg-[#141821] border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#F5A524]" />
            <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#F5A524] block mb-2">
              Pending Resolution
            </span>
            <div className="text-3xl font-bold font-numeric text-[#EDEFF3]">
              {pendingCount}
            </div>
          </div>

          <div className="p-4.5 rounded-xl bg-[#141821] border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#4C8DFF]" />
            <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#4C8DFF] block mb-2">
              High Severity Index
            </span>
            <div className="text-3xl font-bold font-numeric text-[#EDEFF3]">
              {criticalCount}
            </div>
          </div>
        </div>

        {/* Issues in this ward */}
        <PriorityQueue
          issues={wardIssues.length > 0 ? wardIssues : issues.slice(0, 8)}
          onRowClick={(issue) => setSelectedIssue(issue)}
          pageSize={12}
        />

        {/* Right-Side Sliding Detail Drawer */}
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

  // ALL HOTSPOTS LIST & INTERACTIVE MAP VIEW
  const maxIssues = Math.max(...hotspots.map((h) => h.issue_count), 1)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3] flex items-center gap-2.5">
            <Map className="size-6 text-[#E8B24D]" />
            <span>Geospatial Hotspots & Centroid Map</span>
          </h1>
          <p className="text-xs font-mono-data text-[#8A93A3]">
            Spatial heatmaps and concentrated infrastructure bottlenecks across city zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141821] border border-[rgba(52,211,153,0.3)] text-[#34D399] text-xs font-mono-data font-bold rounded-xl">
            <ShieldCheck className="size-3.5 text-[#34D399]" /> 7 Wards Live Telemetry
          </span>
        </div>
      </div>

      {/* Grid: Left Wards Cards, Right Visual Ward Radar Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Ward Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {hotspots.map((ward, idx) => {
            const isHovered = activeWardHover === ward.ward
            const pct = Math.round((ward.issue_count / maxIssues) * 100)
            const isCritical = ward.issue_count >= 13

            return (
              <motion.div
                key={ward.ward}
                whileHover={{ y: -2 }}
                onMouseEnter={() => setActiveWardHover(ward.ward)}
                onMouseLeave={() => setActiveWardHover(null)}
                onClick={() => navigate(`/hotspots/${ward.ward}`)}
                className={`p-4.5 rounded-xl bg-[#141821] border transition-all cursor-pointer shadow-lg flex flex-col justify-between gap-3 ${
                  isHovered
                    ? "border-[#E8B24D] bg-[#1B202B] glow-gold"
                    : "border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#E8B24D] font-bold text-xs font-mono-data">
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#EDEFF3] flex items-center gap-2">
                        <span>{ward.ward} Ward</span>
                        {isCritical && (
                          <span className="text-[9px] font-mono-data font-bold uppercase px-1.5 py-0.5 rounded bg-[rgba(240,87,107,0.15)] text-[#F0576B] border border-[rgba(240,87,107,0.3)]">
                            Critical Zone
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#8A93A3] font-mono-data">
                        GPS: {ward.latitude.toFixed(4)}° N, {ward.longitude.toFixed(4)}° E
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-numeric text-[#EDEFF3]">
                      {ward.issue_count} <span className="text-xs font-normal text-[#8A93A3]">issues</span>
                    </div>
                    <span className="text-[11px] font-mono-data font-semibold text-[#4C8DFF] flex items-center gap-0.5 justify-end">
                      Inspect <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#0B0D12] h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.06 }}
                    className={`h-full rounded-full ${
                      isCritical
                        ? "bg-[#F0576B]"
                        : ward.issue_count >= 10
                        ? "bg-[#E8B24D]"
                        : "bg-[#4C8DFF]"
                    }`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Right: Interactive Spatial Ward Radar (5 cols) */}
        <div className="lg:col-span-5 bg-[#141821] rounded-2xl border border-[rgba(255,255,255,0.08)] p-5 shadow-xl flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2">
                <Navigation className="size-4 text-[#E8B24D]" />
                <span>Geospatial Radar Mesh</span>
              </h3>
              <span className="text-[9px] font-mono-data font-bold text-[#34D399] bg-[rgba(52,211,153,0.12)] px-2 py-0.5 rounded border border-[rgba(52,211,153,0.25)]">
                CENTROID SYNC OK
              </span>
            </div>
            <p className="text-xs text-[#8A93A3] font-mono-data">
              Relative distribution of incident clusters across municipal coordinates.
            </p>
          </div>

          {/* Interactive Visual Map Plane */}
          <div className="relative flex-1 my-3 bg-[#0B0D12] rounded-xl overflow-hidden flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(rgba(232, 178, 77, 0.25) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Radar Circular Concentrics in Signal Gold */}
            <div className="absolute size-72 rounded-full border border-[rgba(232,178,77,0.12)]" />
            <div className="absolute size-52 rounded-full border border-[rgba(232,178,77,0.18)]" />
            <div className="absolute size-32 rounded-full border border-[rgba(232,178,77,0.25)]" />

            {/* Center Radiating Pulse Rings */}
            <div className="absolute size-16 rounded-full bg-[#E8B24D]/15 animate-pulse-ring pointer-events-none" />
            <div className="absolute size-16 rounded-full bg-[#E8B24D]/10 animate-pulse-ring-delayed pointer-events-none" />

            {/* Ward markers positioned spatially */}
            {hotspots.map((ward, i) => {
              const isSelected = activeWardHover === ward.ward
              const angles = [0, 45, 120, 180, 240, 290, 330]
              const rad = (angles[i % angles.length] * Math.PI) / 180
              const dist = 38 + (i * 12) % 65
              const x = Math.cos(rad) * dist
              const y = Math.sin(rad) * dist

              return (
                <div
                  key={ward.ward}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  onMouseEnter={() => setActiveWardHover(ward.ward)}
                  onMouseLeave={() => setActiveWardHover(null)}
                  onClick={() => navigate(`/hotspots/${ward.ward}`)}
                  className={`absolute z-10 cursor-pointer group transition-all duration-200`}
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold font-numeric text-[#0B0D12] shadow-xl border border-white transition-transform ${
                      isSelected ? "scale-125 ring-4 ring-[#E8B24D]/60" : ""
                    } ${
                      ward.issue_count >= 13
                        ? "bg-[#F0576B] text-white"
                        : ward.issue_count >= 10
                        ? "bg-[#E8B24D]"
                        : "bg-[#4C8DFF]"
                    }`}
                  >
                    {ward.issue_count}
                  </div>
                  {/* Floating Tooltip */}
                  <div
                    className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#1B202B] border border-[rgba(255,255,255,0.12)] text-[#EDEFF3] font-mono-data text-[10px] whitespace-nowrap pointer-events-none shadow-xl transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {ward.ward} ({ward.issue_count})
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-xs font-mono-data text-[#8A93A3] flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-3">
            <span>Focus: <strong className="text-[#EDEFF3]">{activeWardHover ? `${activeWardHover} Ward` : "Hover node"}</strong></span>
            <span className="font-semibold text-[#4C8DFF]">Click node for details</span>
          </div>
        </div>
      </div>
    </div>
  )
}
