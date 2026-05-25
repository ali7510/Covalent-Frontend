import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import UserAvatar from "./UserAvatar"
import NotificationBell from "./NotificationBell"
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  Trophy, 
  Bell, 
  User, 
  Info, 
  LogOut,
  GraduationCap,
  X,
  Sun,
  Moon
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

  const navItems = [
    { to: "/home", label: "Dashboard", icon: LayoutDashboard },
    { to: "/spaces/search", label: "Explore Spaces", icon: Search },
    { to: "/online-courses", label: "Online Courses", icon: BookOpen },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/notifications", label: "Notifications", icon: Bell, useNotificationBell: true },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/about", label: "About", icon: Info },
  ]

  return (
    <>
      {/* Mobile Sidebar Overlay/Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between px-3 mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-neutral-900 dark:text-white">Covalent</span>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-250"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-1">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-850 text-neutral-950 dark:text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors" />
                  <span>{item.label}</span>
                </div>
                {item.useNotificationBell ? (
                  <NotificationBell />
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="px-1 mt-2 mb-2">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${theme === "dark" ? "bg-neutral-700" : "bg-neutral-200"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white dark:bg-neutral-200 shadow-sm transition-transform duration-200 ${theme === "dark" ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </button>
        </div>

        {/* User Session Footer Card */}
        {user && (
          <div className="mt-auto border-t border-neutral-100 dark:border-neutral-900 pt-4 px-1">
            <div className="flex items-center space-x-3 mb-3 p-2 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100/50 dark:border-neutral-900/50">
              <UserAvatar className="h-9 w-9 ring-1 ring-neutral-200 dark:ring-neutral-800" fallbackClassName="text-xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-850 dark:text-neutral-200 truncate">{user.fullName}</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
