import React, { useState } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  LayoutDashboard,
  ListTodo,
  ListOrdered,
  MapPin,
  Building2,
  Settings,
  Search,
  RefreshCw,
  LogOut,
  ChevronDown,
  Shield,
  Radio,
  Menu,
  X,
  Bell,
  Sun,
  Moon
} from "lucide-react"
import { useCivic } from "@/context/CivicContext"

export function AppLayout() {
  const {
    user,
    logout,
    searchQuery,
    setSearchQuery,
    refreshKey,
    isRefreshing,
    triggerRefresh,
    toastMessage,
    theme,
    toggleTheme
  } = useCivic()

  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "All Issues", path: "/issues", icon: ListTodo },
    { label: "Priority Queue", path: "/priority-queue", icon: ListOrdered },
    { label: "Hotspots", path: "/hotspots", icon: MapPin },
    { label: "Departments", path: "/departments", icon: Building2 },
    { label: "Settings", path: "/settings", icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0D12] text-[#EDEFF3]">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 left-1/2 z-50 px-4 py-2 rounded-xl bg-[#1B202B] border border-[#E8B24D] text-[#EDEFF3] shadow-2xl flex items-center gap-2.5 text-xs font-mono-data font-semibold glow-gold"
          >
            <span className="size-2 rounded-full bg-[#E8B24D] animate-pulse-dot" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar (Collapses to icon rail under 1024px) */}
      <aside className="hidden md:flex flex-col w-16 lg:w-60 shrink-0 bg-[#141821] border-r border-[rgba(255,255,255,0.08)] z-20 select-none">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 lg:px-5 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-[rgba(232,178,77,0.15)] border border-[rgba(232,178,77,0.3)] flex items-center justify-center text-[#E8B24D]">
              <Shield className="size-4.5" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#EDEFF3]">
                CIVIC CONSOLE
              </span>
              <span className="text-[10px] font-mono-data text-[#8A93A3]">
                OPS COMMAND V2.4
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: active }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                    active
                      ? "bg-[#1B202B] text-[#4C8DFF] glow-blue"
                      : "text-[#8A93A3] hover:text-[#EDEFF3] hover:bg-[#1B202B]/60"
                  }`
                }
              >
                {({ isActive: active }) => (
                  <>
                    {/* Active operational blue left indicator line */}
                    {active && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#4C8DFF]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon className={`size-4.5 shrink-0 transition-colors ${active ? "text-[#4C8DFF]" : "text-[#8A93A3] group-hover:text-[#EDEFF3]"}`} />
                    <span className="hidden lg:inline-block truncate">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Live System Signal Badge & User Profile Footer */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0D12]/50">
          {/* Live Signal */}
          <div className="hidden lg:flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#141821] border border-[rgba(255,255,255,0.06)] mb-3">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#34D399] animate-pulse-dot" />
              <span className="text-[10px] font-mono-data text-[#8A93A3]">
                TELEMETRY LIVE
              </span>
            </div>
            <span className="text-[9px] font-mono-data text-[#5B6270]">
              99.9%
            </span>
          </div>

          {/* User Button */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#1B202B] text-left transition-colors cursor-pointer"
            >
              <div className="size-8 rounded-lg bg-[#E8B24D] text-[#0B0D12] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.initials || "SL"}
              </div>
              <div className="hidden lg:flex flex-col truncate">
                <span className="text-xs font-bold text-[#EDEFF3] truncate">
                  {user?.name || "Officer"}
                </span>
                <span className="text-[10px] font-mono-data text-[#8A93A3] truncate">
                  {user?.role || "Director"}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-12 left-0 right-0 lg:left-0 lg:w-52 bg-[#1B202B] border border-[rgba(255,255,255,0.12)] rounded-xl shadow-2xl p-1 z-30 font-mono-data text-xs"
                >
                  <div className="p-2 border-b border-[rgba(255,255,255,0.08)]">
                    <p className="font-bold text-[#EDEFF3]">{user?.name}</p>
                    <p className="text-[10px] text-[#8A93A3] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleTheme()
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-[#8A93A3] hover:text-[#EDEFF3] hover:bg-[#141821] rounded-lg transition-colors cursor-pointer"
                  >
                    {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                    <span>Theme: {theme === "dark" ? "Light" : "Dark"}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-[#F0576B] hover:bg-[rgba(240,87,107,0.15)] rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#141821] px-4 sm:px-6 flex items-center justify-between gap-4 z-10 shrink-0 select-none">
          {/* Left: Mobile Menu Toggle & Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#1B202B] text-[#8A93A3] hover:text-[#EDEFF3] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Command Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8A93A3]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket #ID, ward, keyword, or department..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#1B202B] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#EDEFF3] placeholder-[#5B6270] outline-none focus:border-[#E8B24D] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A93A3] hover:text-[#EDEFF3]"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Telemetry Indicator + Pulse Refresh Button */}
          <div className="flex items-center gap-3">
            {/* Live Ward Status with Pulse Dot */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1B202B] border border-[rgba(255,255,255,0.08)] text-xs font-mono-data text-[#8A93A3]">
              <span className="size-2 rounded-full bg-[#34D399] animate-pulse-dot" />
              <span>Ward Telemetry: Active</span>
            </div>

            {/* Synchronize Telemetry Button (The Pulse Motif) */}
            <button
              onClick={triggerRefresh}
              disabled={isRefreshing}
              title="Synchronize Live Sensor Grid"
              className="relative px-3 py-1.5 bg-[#1B202B] hover:bg-[#222938] border border-[rgba(255,255,255,0.08)] hover:border-[#E8B24D]/40 text-[#EDEFF3] rounded-xl text-xs font-mono-data font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {/* Concentric Radiating Pulse Ring when refreshing */}
              {isRefreshing && (
                <>
                  <span className="absolute inset-0 rounded-xl bg-[#E8B24D]/20 animate-pulse-ring pointer-events-none" />
                  <span className="absolute inset-0 rounded-xl bg-[#E8B24D]/10 animate-pulse-ring-delayed pointer-events-none" />
                </>
              )}
              <RefreshCw className={`size-3.5 text-[#E8B24D] ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? "Syncing..." : "Sync Grid"}
              </span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#141821] border-b border-[rgba(255,255,255,0.08)] p-3 space-y-1 z-30"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                      isActive ? "bg-[#1B202B] text-[#4C8DFF]" : "text-[#8A93A3] hover:text-[#EDEFF3]"
                    }`
                  }
                >
                  <item.icon className="size-4.5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Page Outlet with Dot Grid Background Texture */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-dot-grid">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
