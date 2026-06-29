import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must not exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  studentId: z.string().regex(/^\d{8}$/, "Student ID must be exactly 8 digits").optional().or(z.literal("")),
  academicYear: z.coerce.number().min(1).max(4).optional().or(z.literal(0)).or(z.literal("")),
  // FIX #5: Changed max from 8 to 2
  currentSemester: z.coerce.number().min(1).max(2).optional().or(z.literal(0)).or(z.literal("")),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>