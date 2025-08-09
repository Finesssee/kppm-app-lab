import { notFound } from 'next/navigation'
import { AppDetail } from '@/components/app-detail/AppDetail'
import { Header } from '@/components/layout/Header'

interface PageProps {
  params: {
    slug: string
  }
}

// This will be replaced with database fetch
async function getApp(slug: string) {
  // TODO: Fetch from Supabase
  // For now, using mock data
  const { mockApps } = await import('@/data/mockApps')
  const app = mockApps.find(a => a.id === slug)
  return app
}

export default async function AppDetailPage({ params }: PageProps) {
  const app = await getApp(params.slug)

  if (!app) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AppDetail app={app} />
      </main>
    </div>
  )
}