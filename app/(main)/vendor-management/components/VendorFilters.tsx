'use client'

// VendorFilters Component - Phase 1 Task 2  
// Advanced filtering component with presets and custom filters

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Filter, 
  X, 
  Settings, 
  Star, 
  MapPin, 
  Building, 
  Calendar,
  TrendingUp,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VendorFilters as VendorFiltersType } from '../types'
import { vendorSearchService, FilterPreset, AdvancedFilterOptions } from '../lib/services/vendor-search'

interface VendorFiltersProps {
  onFiltersChange: (filters: VendorFiltersType, advancedFilters?: AdvancedFilterOptions) => void
  initialFilters?: VendorFiltersType
  initialAdvancedFilters?: AdvancedFilterOptions
  className?: string
  showPresets?: boolean
  showAdvanced?: boolean
  showSaveFilter?: boolean
  userId?: string
}

interface FilterSection {
  id: string
  title: string
  icon: React.ReactNode
  isOpen: boolean
  content: React.ReactNode
}

const STATUS_OPTIONS = [
  { value: 'active' as const, label: 'Active', color: 'text-green-600' },
  { value: 'inactive' as const, label: 'Inactive', color: 'text-gray-600' },
  { value: 'suspended' as const, label: 'Suspended', color: 'text-red-600' }
]

const CURRENCY_OPTIONS = [
  { value: 'BHT', label: 'BHT - Thai Baht' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' }
]

const BUSINESS_TYPES = [
  'Technology', 'Manufacturing', 'Agriculture', 'Transportation', 'Energy', 
  'Research', 'Pharmaceuticals', 'Food Distribution', 'Materials Science', 
  'Marine Research', 'Construction', 'Healthcare', 'Education', 'Finance'
]

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
  'Italy', 'Spain', 'Australia', 'Japan', 'South Korea', 'China', 'India'
]

const CERTIFICATIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 27001', 'SOC 2', 'GDPR Compliant', 
  'FDA Approved', 'CE Marking', 'FCC Certified', 'OSHA Compliant'
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
]

export default function VendorFilters({
  onFiltersChange,
  initialFilters = {},
  initialAdvancedFilters = {},
  className,
  showPresets = true,
  showAdvanced = true,
  showSaveFilter = true,
  userId
}: VendorFiltersProps) {
  const [filters, setFilters] = useState<VendorFiltersType>(initialFilters)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>(initialAdvancedFilters)
  const [filterPresets] = useState<FilterPreset[]>(vendorSearchService.getFilterPresets())
  const [sections, setSections] = useState<Record<string, boolean>>({
    basic: true,
    performance: false,
    location: false,
    business: false,
    advanced: false
  })
  const [isApplying, setIsApplying] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const hasBasicChanges = Object.keys(filters).some(key => 
      JSON.stringify(filters[key as keyof VendorFiltersType]) !== JSON.stringify(initialFilters[key as keyof VendorFiltersType])
    )
    const hasAdvancedChanges = Object.keys(advancedFilters).some(key => 
      JSON.stringify(advancedFilters[key as keyof AdvancedFilterOptions]) !== JSON.stringify(initialAdvancedFilters[key as keyof AdvancedFilterOptions])
    )
    setHasChanges(hasBasicChanges || hasAdvancedChanges)
  }, [filters, advancedFilters, initialFilters, initialAdvancedFilters])

  const handleFilterChange = (key: keyof VendorFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleAdvancedFilterChange = (key: keyof AdvancedFilterOptions, value: any) => {
    const newAdvancedFilters = { ...advancedFilters, [key]: value }
    setAdvancedFilters(newAdvancedFilters)
  }

  const handleApplyFilters = async () => {
    setIsApplying(true)
    try {
      await onFiltersChange(filters, advancedFilters)
      setHasChanges(false)
    } finally {
      setIsApplying(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    setAdvancedFilters({})
    onFiltersChange({}, {})
    setHasChanges(false)
  }

  const handlePresetClick = async (preset: FilterPreset) => {
    setIsApplying(true)
    try {
      setFilters(preset.filters)
      setAdvancedFilters(preset.advancedFilters)
      await onFiltersChange(preset.filters, preset.advancedFilters)
      setHasChanges(false)
    } finally {
      setIsApplying(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length + Object.values(advancedFilters).filter(Boolean).length
  }

  const renderStatusFilter = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Status</Label>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(status => (
          <Badge
            key={status.value}
            variant={filters.status?.includes(status.value) ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              filters.status?.includes(status.value) && status.color
            )}
            onClick={() => {
              const currentStatuses = filters.status || []
              const newStatuses = currentStatuses.includes(status.value)
                ? currentStatuses.filter(s => s !== status.value)
                : [...currentStatuses, status.value]
              handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined)
            }}
          >
            {status.label}
          </Badge>
        ))}
      </div>
    </div>
  )

  const renderCurrencyFilter = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Currency</Label>
      <Select
        value={filters.currency?.[0] || ''}
        onValueChange={(value) => handleFilterChange('currency', value ? [value] : undefined)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCY_OPTIONS.map(currency => (
            <SelectItem key={currency.value} value={currency.value}>
              {currency.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const renderPerformanceFilters = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Performance Score</Label>
        <div className="px-3">
          <Slider
            value={[filters.performanceMin || 0, filters.performanceMax || 100]}
            onValueChange={([min, max]) => {
              handleFilterChange('performanceMin', min > 0 ? min : undefined)
              handleFilterChange('performanceMax', max < 100 ? max : undefined)
            }}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{filters.performanceMin || 0}%</span>
            <span>{filters.performanceMax || 100}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Response Rate</Label>
        <div className="px-3">
          <Slider
            value={[filters.responseRateMin || 0]}
            onValueChange={([min]) => handleFilterChange('responseRateMin', min > 0 ? min : undefined)}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Min: {filters.responseRateMin || 0}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Total Campaigns</Label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={advancedFilters.performanceMetrics?.totalCampaigns?.min || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : undefined
              handleAdvancedFilterChange('performanceMetrics', {
                ...advancedFilters.performanceMetrics,
                totalCampaigns: {
                  ...advancedFilters.performanceMetrics?.totalCampaigns,
                  min: value
                }
              })
            }}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Max"
            value={advancedFilters.performanceMetrics?.totalCampaigns?.max || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : undefined
              handleAdvancedFilterChange('performanceMetrics', {
                ...advancedFilters.performanceMetrics,
                totalCampaigns: {
                  ...advancedFilters.performanceMetrics?.totalCampaigns,
                  max: value
                }
              })
            }}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )

  const renderLocationFilters = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Country</Label>
        <Select
          value={advancedFilters.location?.country || ''}
          onValueChange={(value) => handleAdvancedFilterChange('location', {
            ...advancedFilters.location,
            country: value || undefined
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">State/Province</Label>
        <Input
          placeholder="Enter state or province"
          value={advancedFilters.location?.state || ''}
          onChange={(e) => handleAdvancedFilterChange('location', {
            ...advancedFilters.location,
            state: e.target.value || undefined
          })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">City</Label>
        <Input
          placeholder="Enter city"
          value={advancedFilters.location?.city || ''}
          onChange={(e) => handleAdvancedFilterChange('location', {
            ...advancedFilters.location,
            city: e.target.value || undefined
          })}
        />
      </div>
    </div>
  )

  const renderBusinessFilters = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Business Type</Label>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {BUSINESS_TYPES.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`business-${type}`}
                  checked={advancedFilters.businessType?.includes(type)}
                  onCheckedChange={(checked) => {
                    const current = advancedFilters.businessType || []
                    const newTypes = checked
                      ? [...current, type]
                      : current.filter(t => t !== type)
                    handleAdvancedFilterChange('businessType', newTypes.length > 0 ? newTypes : undefined)
                  }}
                />
                <Label htmlFor={`business-${type}`} className="text-sm font-normal">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Certifications</Label>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {CERTIFICATIONS.map(cert => (
              <div key={cert} className="flex items-center space-x-2">
                <Checkbox
                  id={`cert-${cert}`}
                  checked={advancedFilters.certifications?.includes(cert)}
                  onCheckedChange={(checked) => {
                    const current = advancedFilters.certifications || []
                    const newCerts = checked
                      ? [...current, cert]
                      : current.filter(c => c !== cert)
                    handleAdvancedFilterChange('certifications', newCerts.length > 0 ? newCerts : undefined)
                  }}
                />
                <Label htmlFor={`cert-${cert}`} className="text-sm font-normal">
                  {cert}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Languages</Label>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {LANGUAGES.map(lang => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang}`}
                  checked={advancedFilters.languages?.includes(lang)}
                  onCheckedChange={(checked) => {
                    const current = advancedFilters.languages || []
                    const newLangs = checked
                      ? [...current, lang]
                      : current.filter(l => l !== lang)
                    handleAdvancedFilterChange('languages', newLangs.length > 0 ? newLangs : undefined)
                  }}
                />
                <Label htmlFor={`lang-${lang}`} className="text-sm font-normal">
                  {lang}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  const renderAdvancedFilters = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Last Activity</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            placeholder="From date"
            value={advancedFilters.dateRange?.start ? advancedFilters.dateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const startDate = e.target.value ? new Date(e.target.value) : undefined
              handleAdvancedFilterChange('dateRange', startDate ? {
                field: 'updatedAt' as const,
                start: startDate,
                end: advancedFilters.dateRange?.end || new Date()
              } : undefined)
            }}
          />
          <Input
            type="date"
            placeholder="To date"
            value={advancedFilters.dateRange?.end ? advancedFilters.dateRange.end.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const endDate = e.target.value ? new Date(e.target.value) : undefined
              handleAdvancedFilterChange('dateRange', endDate ? {
                field: 'updatedAt' as const,
                start: advancedFilters.dateRange?.start || new Date(),
                end: endDate
              } : undefined)
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags</Label>
        <Input
          placeholder="Enter tags (comma-separated)"
          value={advancedFilters.tags?.join(', ') || ''}
          onChange={(e) => {
            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            handleAdvancedFilterChange('tags', tags.length > 0 ? tags : undefined)
          }}
        />
      </div>
    </div>
  )

  const filterSections: FilterSection[] = [
    {
      id: 'basic',
      title: 'Basic Filters',
      icon: <Filter className="h-4 w-4" />,
      isOpen: sections.basic,
      content: (
        <div className="space-y-4">
          {renderStatusFilter()}
          {renderCurrencyFilter()}
        </div>
      )
    },
    {
      id: 'performance',
      title: 'Performance',
      icon: <TrendingUp className="h-4 w-4" />,
      isOpen: sections.performance,
      content: renderPerformanceFilters()
    },
    {
      id: 'location',
      title: 'Location',
      icon: <MapPin className="h-4 w-4" />,
      isOpen: sections.location,
      content: renderLocationFilters()
    },
    {
      id: 'business',
      title: 'Business',
      icon: <Building className="h-4 w-4" />,
      isOpen: sections.business,
      content: renderBusinessFilters()
    },
    {
      id: 'advanced',
      title: 'Advanced',
      icon: <Settings className="h-4 w-4" />,
      isOpen: sections.advanced,
      content: renderAdvancedFilters()
    }
  ]

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-600">
              Changed
            </Badge>
          )}
        </CardTitle>
        
        {showPresets && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filterPresets.map(preset => (
              <Badge
                key={preset.id}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.icon && <Star className="h-3 w-3 mr-1" />}
                {preset.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filterSections.map(section => (
          <Collapsible
            key={section.id}
            open={section.isOpen}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <div className="flex items-center space-x-2">
                {section.icon}
                <span className="font-medium">{section.title}</span>
              </div>
              {section.isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 pl-6">
              {section.content}
            </CollapsibleContent>
          </Collapsible>
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            {showSaveFilter && userId && (
              <Button
                variant="outline"
                size="sm"
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleApplyFilters}
            disabled={!hasChanges || isApplying}
          >
            {isApplying ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}