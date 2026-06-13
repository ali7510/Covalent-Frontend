import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import axios from "axios"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "./auth-schemas"
import { forgotPassword } from "@/services/auth"
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

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      await forgotPassword(data)
      setIsSubmitted(true)
      toast.success("Recovery email sent")
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Failed to send recovery email"
      toast.error(message)
    }
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] text-center">
        <h2 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground">Check your email</h2>
        <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">
          We've sent a password reset link to your email address. Please check your inbox.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full mt-4">
            Return to login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h2 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground">Forgot password?</h2>
        <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-[510] text-foreground">Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
      </Form>

      <p className="px-8 text-center text-[13px] text-muted-foreground font-normal">
        Remember your password?{" "}
        <Link to="/login" className="font-[510] text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
