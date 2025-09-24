import { Metadata } from 'next'
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import { SimpleUserProvider } from '@/lib/context/simple-user-context'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'],
  variable: '--font-serif'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

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
      <body className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          <SimpleUserProvider>
            {children}
          </SimpleUserProvider>
        </Providers>
      </body>
    </html>
  )
}
