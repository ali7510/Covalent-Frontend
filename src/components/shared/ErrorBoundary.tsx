import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = "/home"
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-8 shadow-lg text-center space-y-6 animate-fade-in">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-450 leading-relaxed font-light">
                An unexpected application crash was caught by our frontend shell. You can try refreshing the page or navigating back to dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 p-3 text-left overflow-auto max-h-32">
                <code className="text-[10px] font-mono text-red-650 dark:text-red-400 block whitespace-pre">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-98 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Refresh Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-neutral-955 text-white dark:bg-white dark:text-neutral-955 px-4 py-2 text-xs font-semibold hover:opacity-90 active:scale-98 transition-all"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
