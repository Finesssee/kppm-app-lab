import React from "react";
import { logError } from "@/lib/logger";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground"
          role="alert"
        >
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Something went wrong.</h1>
            <p className="mb-8 text-muted-foreground">
              We've been notified of the issue. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="mb-4 whitespace-pre-wrap rounded bg-destructive/10 p-4 text-left text-sm text-destructive">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
