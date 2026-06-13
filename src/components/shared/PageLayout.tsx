import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Menu } from "lucide-react"
import UserAvatar from "./UserAvatar"
import logoImg from "@/assets/logo.jpeg"

export default function PageLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Top Navigation Header */}
        <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <img src={logoImg} alt="Covalent Logo" className="h-7 w-7 rounded-md object-cover" />
              <span className="font-[510] tracking-tight text-foreground">Covalent</span>
            </div>
          </div>

          <UserAvatar className="h-8 w-8 ring-1 ring-border" fallbackClassName="text-xs" />
        </header>

        <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto px-4 md:px-7 lg:px-[60px] pt-8 pb-12 animate-fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
