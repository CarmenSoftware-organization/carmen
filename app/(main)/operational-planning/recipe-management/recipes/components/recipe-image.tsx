'use client'

import Image from 'next/image'
import { useState } from 'react'

interface RecipeImageProps {
  src: string
  alt: string
  aspectRatio?: 'video' | '4:3'
  priority?: boolean
  className?: string
}

export function RecipeImage({ src, alt, aspectRatio = 'video', priority = false, className }: RecipeImageProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${aspectRatio === 'video' ? 'aspect-video' : 'aspect-[4/3]'} ${className}`}>
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
          No image available
        </div>
      )}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
} 