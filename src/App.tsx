import { Providers } from './providers'

export function App() {
  return (
    <Providers>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Replicate Hub</h1>
          <p className="text-lg text-muted-foreground">Your local AI application library built with React!</p>
        </div>
      </div>
    </Providers>
  )
}