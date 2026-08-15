import React, { useState } from "react"
import { motion } from "motion/react"
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  User,
  Key,
  Building2,
  Radio,
  Sun,
  Moon
} from "lucide-react"
import { useCivic } from "@/context/CivicContext"

export function Settings() {
  const { user, showToast, theme, toggleTheme } = useCivic()

  const [slaHours, setSlaHours] = useState("48")
  const [criticalThreshold, setCriticalThreshold] = useState("80")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [autoDispatch, setAutoDispatch] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    showToast("Command console configuration updated successfully.")
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEFF3] flex items-center gap-2.5">
          <SettingsIcon className="size-6 text-[#E8B24D]" />
          <span>Console & Dispatch Parameters</span>
        </h1>
        <p className="text-xs font-mono-data text-[#8A93A3]">
          Configure SLA compliance policies, automated triage thresholds, and notification routing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Account Card */}
        <div className="p-6 rounded-2xl bg-[#141821] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-4">
          <div className="flex items-center gap-3.5 border-b border-[rgba(255,255,255,0.08)] pb-4">
            <div className="size-11 rounded-xl bg-[#E8B24D] text-[#0B0D12] flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(232,178,77,0.3)]">
              {user?.initials || "SL"}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#EDEFF3] flex items-center gap-2">
                <span>{user?.name || "Director"}</span>
                <span className="text-[9px] font-mono-data px-2 py-0.5 rounded bg-[rgba(52,211,153,0.15)] text-[#34D399] border border-[rgba(52,211,153,0.3)]">
                  ACTIVE SESSION
                </span>
              </h3>
              <p className="text-xs font-mono-data text-[#8A93A3]">
                {user?.email || "samarthlagad@gmail.com"} · {user?.role || "Municipal Lead"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-data">
            <div>
              <label className="text-[#8A93A3] block mb-1 uppercase font-bold text-[10px]">
                Operational Department
              </label>
              <input
                type="text"
                disabled
                value={user?.department || "Operations Command"}
                className="w-full px-3 py-2 bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#EDEFF3] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[#8A93A3] block mb-1 uppercase font-bold text-[10px]">
                Security Standard & Clearance
              </label>
              <input
                type="text"
                disabled
                value="GovNet PKI / Level 4 Clearance"
                className="w-full px-3 py-2 bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#EDEFF3] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Display & Aesthetic Theme Controls */}
        <div className="p-6 rounded-2xl bg-[#141821] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-4">
          <h3 className="font-bold text-xs font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-3">
            <Radio className="size-4 text-[#4C8DFF]" />
            <span>Display Environment & Theme</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-xs font-mono-data">
            <div>
              <p className="font-bold text-[#EDEFF3]">Console Color Palette</p>
              <p className="text-[#8A93A3] text-[11px]">Toggle between Command Dark Console (Default) and High-Contrast Light mode</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-[#141821] hover:bg-[#222938] border border-[rgba(255,255,255,0.12)] text-[#EDEFF3] flex items-center gap-2 cursor-pointer transition-colors"
            >
              {theme === "dark" ? <Sun className="size-3.5 text-[#E8B24D]" /> : <Moon className="size-3.5 text-[#4C8DFF]" />}
              <span>{theme === "dark" ? "Switch to Light" : "Switch to Dark"}</span>
            </button>
          </div>
        </div>

        {/* SLA & Triage Rules */}
        <div className="p-6 rounded-2xl bg-[#141821] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-4">
          <h3 className="font-bold text-xs font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-3">
            <Sliders className="size-4 text-[#E8B24D]" />
            <span>SLA Policies & Triage Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-data">
            <div>
              <label className="text-[#8A93A3] block mb-1 uppercase font-bold text-[10px]">
                Default SLA Target Window (Hours)
              </label>
              <input
                type="number"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#EDEFF3] outline-none focus:border-[#E8B24D] focus:ring-1 focus:ring-[#E8B24D]/30"
              />
              <p className="text-[10px] text-[#5B6270] mt-1">Issues exceeding this duration trigger automated SLA breach warnings.</p>
            </div>

            <div>
              <label className="text-[#8A93A3] block mb-1 uppercase font-bold text-[10px]">
                Critical Priority Threshold (0–100)
              </label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#EDEFF3] outline-none focus:border-[#E8B24D] focus:ring-1 focus:ring-[#E8B24D]/30"
              />
              <p className="text-[10px] text-[#5B6270] mt-1">Incident severity scores exceeding this score auto-escalate.</p>
            </div>
          </div>
        </div>

        {/* Notification Routing */}
        <div className="p-6 rounded-2xl bg-[#141821] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-4">
          <h3 className="font-bold text-xs font-mono-data uppercase tracking-wider text-[#EDEFF3] flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-3">
            <Bell className="size-4 text-[#4C8DFF]" />
            <span>Alert & Dispatch Subscriptions</span>
          </h3>

          <div className="space-y-3 font-mono-data">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/30 cursor-pointer text-xs transition-colors">
              <div>
                <p className="font-bold text-[#EDEFF3]">High Severity Emergency Alerts</p>
                <p className="text-[11px] text-[#8A93A3]">Instant notification stream when ward severity exceeds 80</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="accent-[#E8B24D] size-4 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/30 cursor-pointer text-xs transition-colors">
              <div>
                <p className="font-bold text-[#EDEFF3]">Automated Workforce Dispatch</p>
                <p className="text-[11px] text-[#8A93A3]">Auto-assign citizen reports to departments based on GIS location</p>
              </div>
              <input
                type="checkbox"
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="accent-[#E8B24D] size-4 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/30 cursor-pointer text-xs transition-colors">
              <div>
                <p className="font-bold text-[#EDEFF3]">Daily Telemetry Digest</p>
                <p className="text-[11px] text-[#8A93A3]">Morning summary report of resolved vs open ward issues</p>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="accent-[#E8B24D] size-4 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-[#E8B24D] hover:bg-[#f3c267] text-[#0B0D12] text-xs font-bold font-mono-data rounded-xl shadow-[0_0_20px_rgba(232,178,77,0.25)] flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="size-4" />
            <span>Save Parameters</span>
          </motion.button>
        </div>
      </form>
    </div>
  )
}
