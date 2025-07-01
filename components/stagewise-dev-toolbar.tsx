'use client'

import { Component, ErrorInfo, ReactNode, useEffect } from 'react'

// Error boundary for the stagewise toolbar
class StagewiseErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Stagewise toolbar failed to load:', error.message)
    // Don't log the full error in production to avoid noise
    if (process.env.NODE_ENV === 'development') {
      console.error('Stagewise error details:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return null // Silently fail - don't show anything if toolbar can't load
    }

    return this.props.children
  }
}

const stagewiseConfig = {
  plugins: []
}

function StagewiseToolbarInit() {
  useEffect(() => {
    // Only initialize in browser and development mode
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    let cleanup: (() => void) | undefined

    const initToolbar = async () => {
      try {
        const { initToolbar } = await import('@stagewise/toolbar')
        const result = initToolbar(stagewiseConfig)
        // Only assign if the result is a function (cleanup function)
        if (typeof result === 'function') {
          cleanup = result
        }
      } catch (error) {
        console.warn('Failed to initialize stagewise toolbar:', error)
      }
    }

    initToolbar()

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  return null // This component doesn't render anything
}

export function StagewiseDevToolbar() {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <StagewiseErrorBoundary>
      <StagewiseToolbarInit />
    </StagewiseErrorBoundary>
  )
} 