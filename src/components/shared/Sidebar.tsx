// src/components/shared/Sidebar.tsx

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import UserAvatar from "./UserAvatar"
import NotificationBell from "./NotificationBell"
import logoImg from "@/assets/logo.jpeg"
import {
  Home,
  Compass,
  GraduationCap,
  Trophy,
  User,
  Bell,
  Info,
  LogOut,
  X,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"))
  }

  const mainNavItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/discover", label: "Discover", icon: Compass },
    { to: "/online-courses", label: "Online Courses", icon: GraduationCap },
    { to: "/predictor", label: "Department Predictor", icon: Sparkles },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/notifications", label: "Notifications", icon: Bell, useNotificationBell: true },
  ]

  return (
    <>
      {/* Mobile Sidebar Overlay/Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar-bg text-sidebar-fg px-3 py-3 transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Sidebar Brand Header */}
        {/* FIX: mb-8 -> mb-3 */}
        <div className="flex items-center justify-between px-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <img src={logoImg} alt="Covalent Logo" className="h-9 w-9 rounded-md object-cover" />
            <span className="font-[510] text-lg tracking-tight text-white">Covalent</span>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/60 hover:bg-white/8 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main Navigation Links */}
        {/* FIX: space-y-1.5 -> space-y-0.5 */}
        <nav className="flex flex-col flex-1 space-y-0.5 px-1">
          {mainNavItems.map((item) => {
            const IconComponent = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  // FIX: min-h-[44px] -> min-h-[38px], py-2 -> py-1.5
                  `flex items-center justify-between rounded-md px-3 py-1.5 text-[15px] font-[510] min-h-[38px] transition-all duration-200 group relative ${
                    isActive
                      ? "bg-sidebar-active text-primary-foreground shadow-btn-primary"
                      : "text-sidebar-fg/65 hover:bg-sidebar-fg/8 hover:text-sidebar-fg"
                  }`
                }
              >
                <div className="flex items-center">
                  <IconComponent className="h-5 w-5 mr-3 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.useNotificationBell ? (
                  <NotificationBell />
                ) : null}
              </NavLink>
            )
          })}

          {/* Theme Toggle inside nav */}
          <div className="pt-1.5">
            <button
              onClick={toggleTheme}
              // FIX: min-h-[44px] -> min-h-[38px], py-2 -> py-1.5
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[15px] font-[510] min-h-[38px] text-sidebar-fg/65 hover:bg-sidebar-fg/8 hover:text-sidebar-fg transition-all duration-200 group"
            >
              <div className="flex items-center">
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 mr-3 shrink-0" />
                ) : (
                  <Moon className="h-5 w-5 mr-3 shrink-0" />
                )}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${theme === "dark" ? "bg-white/20" : "bg-white/10"}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${theme === "dark" ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </button>
          </div>

          {/* Divider + About Us pinned to bottom */}
          {/* FIX: pt-4 space-y-1.5 pb-6 -> pt-2 space-y-0.5 pb-2 */}
          <div className="mt-auto pt-2 space-y-0.5 pb-2">
            <div className="border-t border-sidebar-border my-1.5" />
            <NavLink
              to="/about"
              onClick={onClose}
              className={({ isActive }) =>
                // FIX: min-h-[44px] -> min-h-[38px], py-2 -> py-1.5
                `flex items-center rounded-md px-3 py-1.5 text-[15px] font-[510] min-h-[38px] transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-active text-primary-foreground shadow-btn-primary"
                    : "text-sidebar-fg/65 hover:bg-sidebar-fg/8 hover:text-sidebar-fg"
                }`
              }
            >
              <Info className="h-5 w-5 mr-3 shrink-0" />
              <span>About Us</span>
            </NavLink>

            {/* User Session Footer Card */}
            {user && (
              <div className="border-t border-sidebar-border pt-2 mt-1.5">
                <div className="flex items-center space-x-3 mb-2 p-2 bg-white/5 rounded-md border border-white/5">
                  <UserAvatar className="h-9 w-9 ring-1 ring-white/10" fallbackClassName="text-xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-[510] text-white truncate">{user.fullName}</p>
                    <p className="text-[10px] text-white/50 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  // FIX: min-h-[44px] -> min-h-[38px], py-2 -> py-1.5
                  className="flex w-full items-center space-x-3 rounded-md px-3 py-1.5 text-[15px] font-[510] min-h-[38px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}