import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Menu, GraduationCap } from "lucide-react"
import UserAvatar from "./UserAvatar"

export default function PageLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-900/10 text-foreground">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 focus:outline-hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-neutral-900 dark:text-white" />
            <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Covalent</span>
          </div>
        </div>

        <UserAvatar className="h-8 w-8 ring-1 ring-neutral-200 dark:ring-neutral-800" fallbackClassName="text-xs" />
      </header>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
