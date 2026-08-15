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
  FileText,
  Flame,
  ArrowRight
} from "lucide-react"
import { StatusBadge, PriorityBar } from "./PriorityQueue"
import { useCivic } from "@/context/CivicContext"

interface IssueDetailModalProps {
  issue: Issue
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
  { key: "PENDING", label: "Pending" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "VERIFIED", label: "Verified" },
  { key: "CLOSED", label: "Closed" },
]

export function IssueDetailModal({ issue, onClose }: IssueDetailModalProps) {
  const { updateIssueStatus, assignIssueDepartment, addIssueNote, issueNotes, user } = useCivic()

  const [selectedDept, setSelectedDept] = useState(issue.department)
  const [currentStatus, setCurrentStatus] = useState(issue.status)
  const [newNoteText, setNewNoteText] = useState("")

  const notes = issueNotes[issue.id] || []

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    updateIssueStatus(issue.id, newStatus)
  }

  const handleDeptSave = () => {
    assignIssueDepartment(issue.id, selectedDept)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    addIssueNote(issue.id, newNoteText.trim())
    setNewNoteText("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-[#E5E7EB] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E5E7EB] bg-[#F7F8FA]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold font-mono text-sm border border-blue-200">
              {issue.id.replace("CIV-", "#")}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1D23]">
                  {issue.category} Incident
                </h2>
                <StatusBadge status={currentStatus} />
              </div>
              <p className="text-xs text-[#6B7280]">
                Logged on {new Date(issue.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-[#6B7280] hover:text-[#1A1D23] transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {/* Status Workflow Progress Stepper */}
          <div className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-3">
              Workflow Triage State
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STATUS_FLOW.map((s) => {
                const isActive = currentStatus === s.key
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleStatusChange(s.key)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-sm"
                        : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#1A1D23]"
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4 Stat Overview Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-semibold mb-1">
                <Flame className="size-3.5 text-red-500" />
                <span>Severity Score</span>
              </div>
              <div className="text-xl font-bold font-numeric text-[#1A1D23]">
                {issue.severity} <span className="text-xs text-[#9CA3AF] font-normal">/ 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-semibold mb-1">
                <AlertTriangle className="size-3.5 text-amber-500" />
                <span>Dispatch Priority</span>
              </div>
              <div className="text-xl font-bold font-numeric text-[#1A1D23]">
                {issue.priority} <span className="text-xs text-[#9CA3AF] font-normal">/ 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-semibold mb-1">
                <Tag className="size-3.5 text-blue-500" />
                <span>Citizen Reports</span>
              </div>
              <div className="text-xl font-bold font-numeric text-[#1A1D23]">
                {issue.reports_count} <span className="text-xs text-[#9CA3AF] font-normal">verified</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-semibold mb-1">
                <Clock className="size-3.5 text-purple-500" />
                <span>SLA Target</span>
              </div>
              <div className="text-sm font-bold text-emerald-600">
                48 Hours Max
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
              Citizen Description & Impact
            </span>
            <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-sm text-[#1A1D23] leading-relaxed">
              {issue.description}
            </div>
          </div>

          {/* Location & Spatial Data */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
              Incident Geo-Coordinates
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1D23]">Municipal Ward Grid</p>
                  <p className="text-xs font-mono text-[#6B7280]">
                    Lat {issue.latitude.toFixed(4)}°, Long {issue.longitude.toFixed(4)}°
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                GPS Verified
              </span>
            </div>
          </div>

          {/* Internal Municipal Activity Log & Notes */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
              Operations Log & Field Notes ({notes.length})
            </span>
            <div className="space-y-2.5 mb-3">
              {notes.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] italic p-3 bg-slate-50 rounded-lg">
                  No internal notes logged for this incident yet.
                </p>
              ) : (
                notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-[#E5E7EB] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#6B7280]">
                      <span className="font-bold text-[#1A1D23]">{note.author}</span>
                      <span>{note.time}</span>
                    </div>
                    <p className="text-[#4B5563]">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log field update or dispatch note..."
                className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="size-3.5" />
                <span>Log</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer: Department Reassignment & Save */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F7F8FA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="size-4 text-[#6B7280] shrink-0" />
            <span className="text-xs font-semibold text-[#1A1D23] shrink-0">
              Department:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#2563EB] cursor-pointer"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDeptSave}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Save Department & Triage
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#1A1D23] hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
