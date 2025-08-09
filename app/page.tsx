import { Suspense } from 'react'
import { AppLibrary } from '@/components/app-library/AppLibrary'
import { Header } from '@/components/layout/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <AppLibrary />
        </Suspense>
      </main>
    </div>
  )
}