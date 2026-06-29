// src/features/auth/RegisterForm.tsx

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { registerSchema, type RegisterFormData } from "./auth-schemas"
import { register as registerService } from "@/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// ── Password strength helpers ──────────────────────────────────────────────
function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 5)
}

const strengthConfig = [
  { label: "Very weak",  color: "bg-destructive" },
  { label: "Weak",       color: "bg-orange-500" },
  { label: "Fair",       color: "bg-amber-400" },
  { label: "Good",       color: "bg-emerald-400" },
  { label: "Strong",     color: "bg-emerald-500" },
]

export default function RegisterForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
      academicYear: "",
      currentSemester: "",
    },
  })

  const passwordValue: string = form.watch("password") || ""
  const strengthScore = getPasswordStrength(passwordValue)
  const strengthInfo = strengthConfig[Math.max(0, strengthScore - 1)]

  async function onSubmit(data: RegisterFormData) {
    try {
      const body = {
        ...data,
        studentId: data.studentId || undefined,
        academicYear: typeof data.academicYear === "number" ? data.academicYear : undefined,
        currentSemester: typeof data.currentSemester === "number" ? data.currentSemester : undefined,
      }
      await registerService(body)
      toast.success("Account created successfully. Please sign in.")
      navigate("/login")
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Failed to create account"
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
      <div className="flex flex-col space-y-2 text-center">
        <h2 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground">Create an account</h2>
        <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">
          Enter your details below to create your account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control as any}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-[510] text-foreground">Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-[510] text-foreground">Email *</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password fields in 2-col grid */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-[510] text-foreground">Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-[510] text-foreground">Confirm Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password strength bar — only shows while user is typing */}
          {passwordValue.length > 0 && (
            <div className="space-y-1.5 -mt-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < strengthScore ? strengthInfo.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Strength:{" "}
                <span className="font-[510] text-foreground">{strengthScore > 0 ? strengthInfo.label : "—"}</span>
              </p>
            </div>
          )}

          {/* Optional academic info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-[510] text-foreground">Student ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control as any}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-[510] text-foreground">Year (Opt)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={4} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="currentSemester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-[510] text-foreground">Sem (Opt)</FormLabel>
                    <FormControl>
                      {/* FIX #5: Changed max from 8 to 2 */}
                      <Input type="number" min={1} max={2} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      <p className="px-8 text-center text-[13px] text-muted-foreground font-normal">
        Already have an account?{" "}
        <Link to="/login" className="font-[510] text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}