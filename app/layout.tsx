import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/index.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Replicate Hub - AI App Library',
  description: 'Browse, share, remix, and instantly deploy AI apps with Replicate integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}