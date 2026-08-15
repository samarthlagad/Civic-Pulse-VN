import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Issue } from "@/types"
import {
  X,
  MapPin,
  Calendar,
  Building2,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Flame,
  ArrowRight,
  ShieldAlert,
  History,
  Activity,
  Compass
} from "lucide-react"
import { StatusBadge, PriorityBar } from "./PriorityQueue"
import { useCivic } from "@/context/CivicContext"

interface IssueDetailDrawerProps {
  issue: Issue | null
  onClose: () => void
}

const DEPARTMENTS = [
  "Roads & Bridges",
  "Sanitation & Waste Management",
  "Water & Sewerage Board",
  "Electrical & Power Grid",
  "Urban Planning & Zoning",
  "Traffic & Transit Authority",
  "Parks & Recreation",
]

const STATUS_FLOW = [
  { key: "PENDING", label: "Pending", color: "#F5A524" },
  { key: "ASSIGNED", label: "Assigned", color: "#4C8DFF" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#A78BFA" },
  { key: "RESOLVED", label: "Resolved", color: "#34D399" },
  { key: "VERIFIED", label: "Verified", color: "#34D399" },
  { key: "CLOSED", label: "Closed", color: "#5B6270" },
]

export function IssueDetailDrawer({ issue, onClose }: IssueDetailDrawerProps) {
  const {
    updateIssueStatus,
    assignIssueDepartment,
    escalateIssue,
    addIssueNote,
    issueNotes,
    issueLogs,
    user
  } = useCivic()

  const [selectedDept, setSelectedDept] = useState(issue?.department || "")
  const [currentStatus, setCurrentStatus] = useState(issue?.status || "")
  const [newNoteText, setNewNoteText] = useState("")
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "notes">("details")

  if (!issue) return null

  const notes = issueNotes[issue.id] || []
  const logs = issueLogs[issue.id] || [
    { id: "log-init", author: "Citizen GIS", action: "Incident created via GPS report", timestamp: "Initial" }
  ]

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    updateIssueStatus(issue.id, newStatus)
  }

  const handleDeptSave = () => {
    if (selectedDept) {
      assignIssueDepartment(issue.id, selectedDept)
    }
  }

  const handleEscalate = () => {
    escalateIssue(issue.id)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    addIssueNote(issue.id, newNoteText.trim())
    setNewNoteText("")
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay (slight dimming per spec) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* Sliding Drawer Container */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative z-10 w-full max-w-xl bg-[#141821] text-[#EDEFF3] border-l border-[rgba(255,255,255,0.08)] h-full flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] bg-[#1B202B]/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded bg-[rgba(232,178,77,0.12)] border border-[rgba(232,178,77,0.3)] text-[#E8B24D] font-mono-data font-bold text-sm tracking-wider">
              {issue.id.replace("CIV-", "#")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#EDEFF3] tracking-tight">
                  {issue.category} Incident
                </h2>
                <StatusBadge status={currentStatus || issue.status} />
              </div>
              <p className="text-xs text-[#8A93A3] font-mono-data">
                Logged {new Date(issue.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleEscalate}
              title="Escalate Priority to Critical"
              className="p-2 rounded-lg bg-[rgba(240,87,107,0.15)] text-[#F0576B] hover:bg-[rgba(240,87,107,0.25)] border border-[rgba(240,87,107,0.3)] transition-colors cursor-pointer"
            >
              <ShieldAlert className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#8A93A3] hover:text-[#EDEFF3] transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Drawer Nav Tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.08)] px-5 bg-[#141821] text-xs font-semibold">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "details"
                ? "border-[#E8B24D] text-[#E8B24D]"
                : "border-transparent text-[#8A93A3] hover:text-[#EDEFF3]"
            }`}
          >
            <Activity className="size-3.5" />
            <span>Triage & Details</span>
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "border-[#E8B24D] text-[#E8B24D]"
                : "border-transparent text-[#8A93A3] hover:text-[#EDEFF3]"
            }`}
          >
            <History className="size-3.5" />
            <span>Audit History ({logs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "border-[#E8B24D] text-[#E8B24D]"
                : "border-transparent text-[#8A93A3] hover:text-[#EDEFF3]"
            }`}
          >
            <Tag className="size-3.5" />
            <span>Field Notes ({notes.length})</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === "details" && (
            <>
              {/* Status Flow Stepper */}
              <div className="bg-[#1B202B] p-4 rounded-xl border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3]">
                    Workflow State Transition
                  </span>
                  <span className="text-[10px] font-mono-data text-[#5B6270]">
                    SLA Target: 48h
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_FLOW.map((s) => {
                    const isActive = (currentStatus || issue.status) === s.key
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleStatusChange(s.key)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-[#4C8DFF] text-[#0B0D12] font-bold shadow-[0_0_12px_rgba(76,141,255,0.35)]"
                            : "bg-[#141821] border border-[rgba(255,255,255,0.08)] text-[#8A93A3] hover:border-[#4C8DFF]/40 hover:text-[#EDEFF3]"
                        }`}
                      >
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span>{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 4 Metric HUD Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-1.5 text-[#8A93A3] text-[11px] font-mono-data mb-1">
                    <Flame className="size-3.5 text-[#F0576B]" />
                    <span>SEVERITY</span>
                  </div>
                  <div className="text-xl font-bold font-numeric text-[#EDEFF3]">
                    {issue.severity}
                    <span className="text-[10px] text-[#5B6270] font-normal ml-1">/100</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-1.5 text-[#8A93A3] text-[11px] font-mono-data mb-1">
                    <AlertTriangle className="size-3.5 text-[#E8B24D]" />
                    <span>PRIORITY</span>
                  </div>
                  <div className="text-xl font-bold font-numeric text-[#E8B24D]">
                    {issue.priority}
                    <span className="text-[10px] text-[#5B6270] font-normal ml-1">/100</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-1.5 text-[#8A93A3] text-[11px] font-mono-data mb-1">
                    <Tag className="size-3.5 text-[#4C8DFF]" />
                    <span>REPORTS</span>
                  </div>
                  <div className="text-xl font-bold font-numeric text-[#EDEFF3]">
                    {issue.reports_count}
                    <span className="text-[10px] text-[#5B6270] font-normal ml-1">verified</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-1.5 text-[#8A93A3] text-[11px] font-mono-data mb-1">
                    <Clock className="size-3.5 text-[#A78BFA]" />
                    <span>SLA REMAIN</span>
                  </div>
                  <div className="text-sm font-bold font-mono-data text-[#34D399] mt-1">
                    {issue.sla_hours_remaining || 24}h Safe
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] block mb-2">
                  Citizen Incident Description
                </span>
                <div className="p-4 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-sm text-[#EDEFF3] leading-relaxed">
                  {issue.description}
                </div>
              </div>

              {/* Spatial Coordinates */}
              <div>
                <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] block mb-2">
                  GIS Spatial Telemetry
                </span>
                <div className="p-3.5 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-[rgba(240,87,107,0.15)] text-[#F0576B] flex items-center justify-center border border-[rgba(240,87,107,0.3)]">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#EDEFF3]">Municipal Sensor Grid</p>
                      <p className="text-xs font-mono-data text-[#8A93A3]">
                        Lat: {issue.latitude.toFixed(4)}° N, Long: {issue.longitude.toFixed(4)}° E
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-data font-bold text-[#34D399] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.3)] px-2.5 py-1 rounded-md">
                    GPS LOCK
                  </span>
                </div>
              </div>

              {/* Quick Department Reassignment */}
              <div className="p-4 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="size-4 text-[#8A93A3]" />
                  <span className="text-xs font-bold text-[#EDEFF3]">
                    Assigned Municipal Department
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedDept || issue.department}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="flex-1 text-xs font-semibold bg-[#141821] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-[#EDEFF3] outline-none focus:border-[#E8B24D] cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-[#141821]">
                        {d}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleDeptSave}
                    className="px-3.5 py-2 bg-[#E8B24D] text-[#0B0D12] hover:bg-[#f3c267] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-3">
              <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] block mb-2">
                Command Audit & State Transitions
              </span>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[rgba(255,255,255,0.08)]">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-6 top-1.5 size-2.5 rounded-full bg-[#E8B24D] border-2 border-[#141821]" />
                    <div className="p-3 rounded-lg bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-xs">
                      <div className="flex items-center justify-between text-[#8A93A3] mb-1 font-mono-data text-[10px]">
                        <span className="text-[#EDEFF3] font-bold">{log.author}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-[#8A93A3]">{log.action}</p>
                      {log.note && (
                        <p className="text-xs text-[#EDEFF3] mt-1.5 p-2 bg-[#141821] rounded border border-[rgba(255,255,255,0.04)]">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] block">
                Field Notes & Dispatch Log
              </span>
              <div className="space-y-2.5">
                {notes.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-center text-xs text-[#5B6270]">
                    No internal field notes recorded for this ticket.
                  </div>
                ) : (
                  notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono-data text-[11px] text-[#8A93A3]">
                        <span className="font-bold text-[#E8B24D]">{note.author}</span>
                        <span>{note.time}</span>
                      </div>
                      <p className="text-[#EDEFF3] leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Enter field dispatch update or dispatch memo..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#EDEFF3] outline-none focus:border-[#E8B24D]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#4C8DFF] hover:bg-[#3b7cee] text-[#0B0D12] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="size-3.5" />
                  <span>Log Note</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#1B202B] flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono-data text-[#8A93A3]">
            Status: <strong className="text-[#EDEFF3]">{(currentStatus || issue.status).replace("_", " ")}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#141821] hover:bg-[#222938] border border-[rgba(255,255,255,0.08)] text-[#EDEFF3] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
