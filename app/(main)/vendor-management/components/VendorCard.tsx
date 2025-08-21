'use client'

// VendorCard Component - Phase 1 Task 2
// Comprehensive vendor display card with actions and metrics

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Award,
  Languages,
  ExternalLink,
  FileText,
  Shield,
  Heart,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Vendor } from '../types'

interface VendorCardProps {
  vendor: Vendor
  onEdit?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onView?: (vendor: Vendor) => void
  onContact?: (vendor: Vendor) => void
  onFavorite?: (vendor: Vendor) => void
  className?: string
  compact?: boolean
  showActions?: boolean
  showMetrics?: boolean
  showAvatar?: boolean
  isFavorite?: boolean
}

export default function VendorCard({
  vendor,
  onEdit,
  onDelete,
  onView,
  onContact,
  onFavorite,
  className,
  compact = false,
  showActions = true,
  showMetrics = true,
  showAvatar = true,
  isFavorite = false
}: VendorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />
      case 'inactive':
        return <XCircle className="h-3 w-3" />
      case 'suspended':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderMetrics = () => {
    if (!showMetrics || !vendor.performanceMetrics) return null

    const metrics = vendor.performanceMetrics

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance Metrics</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Quality Score</span>
            </div>
            <span className={cn("text-sm font-medium", getPerformanceColor(metrics.qualityScore))}>
              {(metrics.qualityScore/20).toFixed(1)}/5
            </span>
          </div>
          <Progress value={metrics.qualityScore/20} className="h-2" />
        </div>

        {/* Response Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Response Rate</span>
            </div>
            <span className={cn("text-sm font-medium", getPerformanceColor(metrics.responseRate))}>
              {metrics.responseRate}%
            </span>
          </div>
          <Progress value={metrics.responseRate} className="h-2" />
        </div>

        {/* On-Time Delivery */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm">On-Time Delivery</span>
            </div>
            <span className={cn("text-sm font-medium", getPerformanceColor(metrics.onTimeDeliveryRate))}>
              {metrics.onTimeDeliveryRate}%
            </span>
          </div>
          <Progress value={metrics.onTimeDeliveryRate} className="h-2" />
        </div>

        {/* Expanded metrics */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Package className="h-3 w-3 text-purple-500" />
                <span>Total Campaigns:</span>
                <span className="font-medium">{metrics.totalCampaigns}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Completed:</span>
                <span className="font-medium">{metrics.completedSubmissions}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>Avg Response:</span>
                <span className="font-medium">{metrics.averageResponseTime}h</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                <span>Avg Completion:</span>
                <span className="font-medium">{metrics.averageCompletionTime}h</span>
              </div>
            </div>
            {metrics.lastSubmissionDate && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Last submission: {formatDate(metrics.lastSubmissionDate)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderContactInfo = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm">
        <Mail className="h-4 w-4 text-blue-500" />
        <a 
          href={`mailto:${vendor.contactEmail}`}
          className="text-blue-600 hover:underline truncate"
        >
          {vendor.contactEmail}
        </a>
      </div>
      {vendor.contactPhone && (
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="h-4 w-4 text-green-500" />
          <a 
            href={`tel:${vendor.contactPhone}`}
            className="text-green-600 hover:underline"
          >
            {vendor.contactPhone}
          </a>
        </div>
      )}
      {vendor.address && (
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="text-muted-foreground truncate">
            {vendor.address.city}, {vendor.address.state}, {vendor.address.country}
          </span>
        </div>
      )}
      {vendor.website && (
        <div className="flex items-center space-x-2 text-sm">
          <Globe className="h-4 w-4 text-purple-500" />
          <a 
            href={vendor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline truncate flex items-center space-x-1"
          >
            <span>Visit Website</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )

  const renderBusinessInfo = () => (
    <div className="space-y-2">
      {vendor.businessType && (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-500" />
          <Badge variant="outline">{vendor.businessType}</Badge>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <DollarSign className="h-4 w-4 text-green-500" />
        <span className="text-sm">Preferred Currency: {vendor.preferredCurrency}</span>
      </div>

      {vendor.certifications && vendor.certifications.length > 0 && (
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <div className="flex flex-wrap gap-1">
            {vendor.certifications.slice(0, 3).map((cert, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {cert}
              </Badge>
            ))}
            {vendor.certifications.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{vendor.certifications.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {vendor.languages && vendor.languages.length > 0 && (
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4 text-blue-500" />
          <div className="flex flex-wrap gap-1">
            {vendor.languages.slice(0, 3).map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
            {vendor.languages.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{vendor.languages.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderActions = () => {
    if (!showActions) return null

    return (
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView?.(vendor)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onContact?.(vendor)}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Contact Vendor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFavorite?.(vendor)}
                className={cn(
                  "h-8 w-8 p-0",
                  isFavorite && "text-red-500 hover:text-red-600"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(vendor)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(vendor)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Vendor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onContact?.(vendor)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Vendor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(vendor)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Vendor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (compact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showAvatar && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${vendor.id}`} />
                  <AvatarFallback className="text-xs">
                    {getInitials(vendor.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
                <h3 className="font-medium truncate">{vendor.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {vendor.businessType || 'No business type'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(vendor.status)}>
                {getStatusIcon(vendor.status)}
                <span className="ml-1 capitalize">{vendor.status}</span>
              </Badge>
              {showActions && renderActions()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {showAvatar && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://avatar.vercel.sh/${vendor.id}`} />
                <AvatarFallback>
                  {getInitials(vendor.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold truncate">{vendor.name}</h3>
                {isFavorite && (
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {vendor.businessType || 'No business type specified'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(vendor.status)}>
                  {getStatusIcon(vendor.status)}
                  <span className="ml-1 capitalize">{vendor.status}</span>
                </Badge>
                {vendor.performanceMetrics && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{(vendor.performanceMetrics.qualityScore/20).toFixed(1)}/5</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {renderActions()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        {renderContactInfo()}

        {/* Business Information */}
        <Separator />
        {renderBusinessInfo()}

        {/* Performance Metrics */}
        {showMetrics && (
          <>
            <Separator />
            {renderMetrics()}
          </>
        )}

        {/* Additional Information */}
        {vendor.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Notes</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {vendor.notes}
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>Created: {formatDate(vendor.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>Updated: {formatDate(vendor.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}