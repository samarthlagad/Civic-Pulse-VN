import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Shield, Lock, Mail, ArrowRight, Radio, Activity, CheckCircle2, Globe, Cpu } from "lucide-react"
import { useCivic } from "@/context/CivicContext"

export function LoginPage() {
  const { login } = useCivic()
  const navigate = useNavigate()

  const [email, setEmail] = useState("samarthlagad@gmail.com")
  const [password, setPassword] = useState("••••••••••••")
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRadiating, setIsRadiating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsRadiating(true)

    await login(email, password, rememberMe)
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen w-screen bg-[#0B0D12] text-[#EDEFF3] flex flex-col lg:flex-row select-none bg-dot-grid overflow-hidden">
      {/* Left Panel: High-Fidelity Radar Pulse Command Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 lg:p-16 border-r border-[rgba(255,255,255,0.08)] relative overflow-hidden bg-gradient-to-b from-[#141821]/40 via-[#0B0D12] to-[#0B0D12]">
        {/* Top Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="size-10 rounded-xl bg-[rgba(232,178,77,0.15)] border border-[rgba(232,178,77,0.3)] flex items-center justify-center text-[#E8B24D] shadow-[0_0_20px_rgba(232,178,77,0.2)]">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#EDEFF3]">
              CIVIC OPERATIONS COMMAND
            </h1>
            <p className="text-xs font-mono-data text-[#8A93A3]">
              MUNICIPAL TRIAGE & SENSOR CONSOLE
            </p>
          </div>
        </div>

        {/* Center: Large Quiet Animated Radar Visual (Concentric Gold expanding rings on Navy) */}
        <div className="relative my-auto flex items-center justify-center h-80">
          {/* Concentric expanding pulse rings */}
          <div className="absolute size-72 rounded-full border border-[rgba(232,178,77,0.1)]" />
          <div className="absolute size-56 rounded-full border border-[rgba(232,178,77,0.18)]" />
          <div className="absolute size-40 rounded-full border border-[rgba(232,178,77,0.25)]" />
          <div className="absolute size-24 rounded-full border border-[rgba(232,178,77,0.35)]" />

          {/* Continuous Concentric Expanding Waves */}
          <div className="absolute size-20 rounded-full bg-[#E8B24D]/15 animate-pulse-ring" />
          <div className="absolute size-20 rounded-full bg-[#E8B24D]/10 animate-pulse-ring-delayed" />

          {/* Center Signal Core */}
          <div className="relative z-10 size-16 rounded-full bg-[#141821] border-2 border-[#E8B24D] shadow-[0_0_30px_rgba(232,178,77,0.4)] flex items-center justify-center text-[#E8B24D]">
            <Radio className="size-7 animate-pulse-dot" />
          </div>

          {/* Orbiting Sensor Nodes with Live Coordinates */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute size-64 pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-[9px] font-mono-data text-[#34D399] flex items-center gap-1 shadow-lg">
              <span className="size-1 rounded-full bg-[#34D399]" />
              <span>WARD-07 LOCK</span>
            </div>
            <div className="absolute bottom-4 right-6 px-2 py-0.5 rounded bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-[9px] font-mono-data text-[#E8B24D] flex items-center gap-1 shadow-lg">
              <span className="size-1 rounded-full bg-[#E8B24D]" />
              <span>SLA ACTIVE</span>
            </div>
          </motion.div>

          {/* Compass HUD stamp */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono-data text-[#5B6270] tracking-widest">
            GRID: 23°22'06"N 85°17'26"E · SYSTEM NORMAL
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[rgba(255,255,255,0.08)] relative z-10 text-xs">
          <div className="p-3 rounded-xl bg-[#141821]/80 border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-[#E8B24D] font-bold font-mono-data mb-1">
              <Activity className="size-3.5" />
              <span>&lt;10s LATENCY</span>
            </div>
            <p className="text-[11px] text-[#8A93A3]">Real-time municipal field event streaming.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#141821]/80 border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-[#34D399] font-bold font-mono-data mb-1">
              <Globe className="size-3.5" />
              <span>7 WARDS LIVE</span>
            </div>
            <p className="text-[11px] text-[#8A93A3]">Centroid GIS telemetry and density maps.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#141821]/80 border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-[#4C8DFF] font-bold font-mono-data mb-1">
              <Cpu className="size-3.5" />
              <span>AUTO TRIAGE</span>
            </div>
            <p className="text-[11px] text-[#8A93A3]">Severity scoring and departmental dispatch.</p>
          </div>
        </div>
      </div>

      {/* Right Panel: Dark Surface Command Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#141821] p-8 sm:p-10 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl relative"
        >
          {/* Card Top Accent Bar in Signal Gold */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[#E8B24D]/80" />

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[rgba(232,178,77,0.12)] border border-[rgba(232,178,77,0.3)] text-[#E8B24D] text-[10px] font-mono-data font-bold uppercase tracking-wider mb-3">
              <span className="size-1.5 rounded-full bg-[#E8B24D] animate-pulse-dot" />
              <span>Officer Authentication</span>
            </div>
            <h2 className="text-2xl font-bold text-[#EDEFF3] tracking-tight">
              Console Sign In
            </h2>
            <p className="text-xs text-[#8A93A3] font-mono-data mt-1">
              Enter municipal director credentials to access live command.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field with Thin Gold Focus Underline */}
            <div>
              <label className="block text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3] mb-1.5">
                Officer Email / Identity
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8A93A3]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cityops.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs font-mono-data text-[#EDEFF3] placeholder-[#5B6270] outline-none focus:border-[#E8B24D] focus:ring-1 focus:ring-[#E8B24D]/30 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#8A93A3]">
                  Security Token / Key
                </label>
                <a href="#forgot" className="text-[10px] font-mono-data text-[#E8B24D] hover:underline">
                  Reset Token?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8A93A3]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs font-mono-data text-[#EDEFF3] placeholder-[#5B6270] outline-none focus:border-[#E8B24D] focus:ring-1 focus:ring-[#E8B24D]/30 transition-all"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs font-mono-data text-[#8A93A3]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#E8B24D] rounded cursor-pointer"
                />
                <span>Persist console session</span>
              </label>
              <span className="text-[10px] text-[#34D399]">TLS 1.3 Secure</span>
            </div>

            {/* Solid Gold Submit Button with Radiating Pulse Effect */}
            <div className="relative pt-2">
              {isRadiating && (
                <>
                  <span className="absolute inset-0 rounded-xl bg-[#E8B24D]/40 animate-pulse-ring pointer-events-none" />
                  <span className="absolute inset-0 rounded-xl bg-[#E8B24D]/20 animate-pulse-ring-delayed pointer-events-none" />
                </>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#E8B24D] hover:bg-[#f3c267] text-[#0B0D12] rounded-xl text-xs font-bold font-mono-data flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,178,77,0.25)] transition-all cursor-pointer disabled:opacity-75"
              >
                <span>{isSubmitting ? "Authenticating Session..." : "Authorize & Launch Console"}</span>
                <ArrowRight className="size-4 text-[#0B0D12]" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-b border-[rgba(255,255,255,0.08)]" />
            <span className="text-[10px] font-mono-data text-[#5B6270] uppercase">
              Or Connect via SSO
            </span>
            <div className="flex-1 border-b border-[rgba(255,255,255,0.08)]" />
          </div>

          {/* Outlined Ghost SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 px-3 rounded-xl bg-[#1B202B] hover:bg-[#222938] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/40 text-[#EDEFF3] text-xs font-mono-data font-semibold transition-all cursor-pointer text-center"
            >
              GovPass PKI
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 px-3 rounded-xl bg-[#1B202B] hover:bg-[#222938] border border-[rgba(255,255,255,0.08)] hover:border-[#4C8DFF]/40 text-[#EDEFF3] text-xs font-mono-data font-semibold transition-all cursor-pointer text-center"
            >
              ActiveDirectory
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-[10px] font-mono-data text-[#5B6270]">
            Authorized municipal personnel only · Session logged for audit
          </div>
        </motion.div>
      </div>
    </div>
  )
}
