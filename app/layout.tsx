import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/lib/context/user-context'
import { Providers } from './providers'
import { StagewiseDevToolbar } from '@/components/stagewise-dev-toolbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carmen-HSC',
  description: 'Enterprise resource planning system for food service operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <UserProvider>
            {children}
          </UserProvider>
        </Providers>
        <StagewiseDevToolbar />
      </body>
    </html>
  )
}
