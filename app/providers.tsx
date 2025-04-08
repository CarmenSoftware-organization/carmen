import { ThemeProvider } from "next-themes"
import { UserProvider } from "@/lib/context/user-context"
import { ReactNode } from "react"

"use client"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  )
}
