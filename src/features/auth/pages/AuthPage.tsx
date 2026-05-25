import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import LoginForm from "@/features/auth/LoginForm"
import RegisterForm from "@/features/auth/RegisterForm"
import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm"
import ResetPasswordForm from "@/features/auth/ResetPasswordForm"
import { Orbit, Compass, ShieldCheck, GraduationCap, Sun, Moon } from "lucide-react"

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
          className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
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
      <div className={`hidden lg:flex lg:col-span-6 relative flex-col justify-between p-12 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 ${brandOrderClass} overflow-hidden`}>
        {/* Modern decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
        
        {/* Top bar with sleek text logo */}
        <div className="relative z-10 flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-neutral-950 dark:text-white" />
          <span className="font-semibold text-lg tracking-tight text-neutral-950 dark:text-white">Covalent</span>
        </div>

        {/* Dynamic center feature showcase */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-light tracking-tight text-neutral-900 dark:text-neutral-50 leading-none">
              The <span className="font-semibold text-neutral-950 dark:text-white">unified</span> academic ecosystem.
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              Experience a streamlined portal to monitor curriculum progress, manage study schedules, access learning resources, and view intelligent performance diagnostics.
            </p>
          </div>

          {/* Bullet metrics or capabilities */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
                <Compass className="h-4 w-4 text-neutral-850 dark:text-neutral-200" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-200">Interactive Curriculum Navigation</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Navigate academic pathways dynamically, seeing requisites and current standing in real time.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
                <Orbit className="h-4 w-4 text-neutral-850 dark:text-neutral-200" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-200">Unified Dashboard Overview</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Everything in one view—gpa tracking, upcoming exams, class reminders, and task backlogs.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm">
                <ShieldCheck className="h-4 w-4 text-neutral-850 dark:text-neutral-200" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-200">Secured & Access-Controlled</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Compliant data isolation ensures student metrics and details remain entirely private.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with a subtle brand message */}
        <div className="relative z-10 text-xs text-neutral-400 dark:text-neutral-500 font-light">
          © {new Date().getFullYear()} Covalent Inc. All rights reserved.
        </div>
      </div>

      {/* Form Panel */}
      <div className={`col-span-1 lg:col-span-6 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white dark:bg-neutral-950 relative ${formOrderClass}`}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-neutral-100 dark:bg-neutral-900 rounded-full filter blur-3xl opacity-40 pointer-events-none -z-10" />
        
        {/* Small mobile branding header */}
        <div className="lg:hidden flex items-center space-x-2 absolute top-8 left-8">
          <GraduationCap className="h-6 w-6 text-neutral-950 dark:text-white" />
          <span className="font-semibold text-lg tracking-tight text-neutral-950 dark:text-white">Covalent</span>
        </div>

        <div className="w-full max-w-md animate-fade-in duration-300">
          {renderForm()}
        </div>
      </div>
    </div>
  )
}