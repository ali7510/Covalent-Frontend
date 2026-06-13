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
    window.location.href = "/"
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground font-sans">
          <div className="max-w-md w-full rounded-md border border-border bg-card p-6 shadow-modal text-center space-y-6 animate-fade-in">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-[20px] leading-[26.6px] font-[510] tracking-tight">Something went wrong</h2>
              <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">
                An unexpected application crash was caught by our frontend shell. You can try refreshing the page or navigating back to dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-md bg-muted border border-border p-3 text-left overflow-auto max-h-32">
                <code className="text-[12px] font-mono text-destructive block whitespace-pre">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center rounded-full border border-primary text-primary px-[20px] py-[10px] text-[15px] font-[510] min-h-[40px] hover:bg-primary/6 active:scale-98 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                <span>Refresh Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-btn-primary px-[20px] py-[10px] text-[15px] font-[510] min-h-[40px] hover:bg-accent active:scale-98 transition-all"
              >
                <Home className="h-3.5 w-3.5 mr-1.5" />
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
