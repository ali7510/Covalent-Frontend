import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthContext'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const theme = localStorage.getItem("theme")
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (theme === "dark" || (!theme && systemPrefersDark)) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
                <Toaster richColors position="top-right" />
            </AuthProvider>
        </QueryClientProvider>
    )
}