import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "./components/ui/toaster"
import { TooltipProvider } from "./components/ui/tooltip"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}