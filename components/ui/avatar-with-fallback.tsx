"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface AvatarWithFallbackProps {
  src?: string
  alt?: string
  fallbackText?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarWithFallback({
  src,
  alt = "User avatar",
  fallbackText,
  className = "",
  size = 'md',
}: AvatarWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  // Determine size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const avatarSize = sizeClasses[size] || sizeClasses.md

  // Generate initials for fallback
  const getInitials = () => {
    if (!fallbackText) return ""
    return fallbackText
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  // Conditionally render the fallback
  const renderFallback = () => {
    if (fallbackText) {
      return <span className="text-xs font-medium">{getInitials()}</span>
    }
    return <User className="h-5 w-5" />
  }

  return (
    <Avatar className={`${avatarSize} ${className}`}>
      {!hasError && src && (
        <AvatarImage 
          src={src} 
          alt={alt} 
          onError={() => setHasError(true)}
        />
      )}
      <AvatarFallback className="bg-muted">
        {renderFallback()}
      </AvatarFallback>
    </Avatar>
  )
} 