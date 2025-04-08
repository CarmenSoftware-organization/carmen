'use client'

import Image from 'next/image'
import { useState } from 'react'

interface RecipeImageProps {
  src: string
  alt: string
  aspectRatio?: 'square' | 'video' | 'wide' | '4:3'
  priority?: boolean
}

export function RecipeImage({
  src,
  alt,
  aspectRatio = 'square',
  priority = false,
}: RecipeImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    '4:3': 'aspect-[4/3]',
  }

  return (
    <div className={`overflow-hidden rounded-lg bg-muted ${aspectRatioClasses[aspectRatio]}`}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className={`
          h-full w-full object-cover
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
      />
    </div>
  )
} 