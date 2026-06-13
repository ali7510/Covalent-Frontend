import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import LoginForm from "@/features/auth/LoginForm"
import RegisterForm from "@/features/auth/RegisterForm"
import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm"
import ResetPasswordForm from "@/features/auth/ResetPasswordForm"
import logoImg from "@/assets/logo.jpeg"
import { Orbit, Compass, ShieldCheck, Sun, Moon } from "lucide-react"

export default function AuthPage() {
  const location = useLocation()
  
  const isRegister = location.pathname === "/register"
  const isForgotPassword = location.pathname === "/forgot-password"
  const isResetPassword = location.pathname === "/reset-password"

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

  // Render appropriate form based on route
  const renderForm = () => {
    if (isRegister) return <RegisterForm />
    if (isForgotPassword) return <ForgotPasswordForm />
    if (isResetPassword) return <ResetPasswordForm />
    return <LoginForm />
  };

  // Determine layout order for split screen
  // If register, form is on left, brand on right. Otherwise form on right, brand on left.
  const formOrderClass = isRegister ? "lg:order-1" : "lg:order-2"
  const brandOrderClass = isRegister ? "lg:order-2" : "lg:order-1"

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground overflow-hidden relative">
      {/* Floating Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Brand Panel */}
      <div 
        className={`hidden lg:flex lg:col-span-6 relative flex-col justify-between p-12 border-r border-border ${brandOrderClass} overflow-hidden`}
        style={{ background: "linear-gradient(135deg, #0E1A3E 0%, #293677 50%, #544BBA 100%)" }}
      >
        {/* Modern decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
        
        {/* Top bar with sleek text logo */}
        <div className="relative z-10 flex items-center space-x-2">
          <img src={logoImg} alt="Covalent Logo" className="h-6 w-6 rounded-md object-cover" />
          <span className="font-[510] text-lg tracking-tight text-white">Covalent</span>
        </div>

        {/* Dynamic center feature showcase */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-[40px] leading-[44px] tracking-[-0.88px] font-normal text-white/90">
              The <span className="font-[510] text-white">unified</span> academic ecosystem.
            </h2>
            <p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal text-white/80">
              Experience a streamlined portal to monitor curriculum progress, manage study schedules, access learning resources, and view intelligent performance diagnostics.
            </p>
          </div>

          {/* Bullet metrics or capabilities */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white/10 border border-white/10 rounded-lg shadow-sm">
                <Compass className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-[15px] leading-[24px] font-[510] text-white">Interactive Curriculum Navigation</h4>
                <p className="text-[13px] leading-[18px] text-white/70 font-normal">Navigate academic pathways dynamically, seeing requisites and current standing in real time.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white/10 border border-white/10 rounded-lg shadow-sm">
                <Orbit className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-[15px] leading-[24px] font-[510] text-white">Unified Dashboard Overview</h4>
                <p className="text-[13px] leading-[18px] text-white/70 font-normal">Everything in one view—gpa tracking, upcoming exams, class reminders, and task backlogs.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white/10 border border-white/10 rounded-lg shadow-sm">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-[15px] leading-[24px] font-[510] text-white">Secured & Access-Controlled</h4>
                <p className="text-[13px] leading-[18px] text-white/70 font-normal">Compliant data isolation ensures student metrics and details remain entirely private.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with a subtle brand message */}
        <div className="relative z-10 text-[12px] leading-[16px] tracking-[0.1px] font-normal text-white/50">
          © {new Date().getFullYear()} Covalent Inc. All rights reserved.
        </div>
      </div>

      {/* Form Panel */}
      <div className={`col-span-1 lg:col-span-6 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-24 bg-card relative ${formOrderClass}`}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full filter blur-3xl opacity-40 pointer-events-none -z-10" />
        
        {/* Small mobile branding header */}
        <div className="lg:hidden flex items-center space-x-2 absolute top-8 left-8">
          <img src={logoImg} alt="Covalent Logo" className="h-6 w-6 rounded-md object-cover" />
          <span className="font-[510] text-lg tracking-tight text-foreground">Covalent</span>
        </div>

        <div className="w-full max-w-md animate-fade-in duration-300">
          {renderForm()}
        </div>
      </div>
    </div>
  )
}