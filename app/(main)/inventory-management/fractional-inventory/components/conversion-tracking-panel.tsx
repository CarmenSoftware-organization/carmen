'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Scissors,
  Combine,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Eye,
  FileText,
  Hash
} from 'lucide-react'
import {
  ConversionRecord,
  ConversionType,
  FractionalItemState,
  FractionalStock,
  FractionalItem
} from '@/lib/types/fractional-inventory'

interface ConversionTrackingPanelProps {
  stockId?: string
  itemId?: string
  locationId?: string
  onConversionSelect?: (conversion: ConversionRecord) => void
}

export function ConversionTrackingPanel({
  stockId,
  itemId,
  locationId,
  onConversionSelect
}: ConversionTrackingPanelProps) {
  const [conversions, setConversions] = useState<ConversionRecord[]>([])
  const [filteredConversions, setFilteredConversions] = useState<ConversionRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ConversionType | 'ALL'>('ALL')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'analytics'>('timeline')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadConversions = async () => {
      setLoading(true)
      
      // Mock conversion data
      const mockConversions: ConversionRecord[] = [
        {
          id: 'conv-1',
          conversionType: 'SPLIT',
          fromState: 'PREPARED',
          toState: 'PORTIONED',
          beforeWholeUnits: 5,
          beforePartialQuantity: 0,
          beforeTotalPortions: 0,
          afterWholeUnits: 3,
          afterPartialQuantity: 0,
          afterTotalPortions: 16,
          wasteGenerated: 0.2,
          conversionEfficiency: 0.95,
          conversionCost: 20,
          performedBy: 'chef@restaurant.com',
          performedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          reason: 'Lunch rush preparation',
          sourceStockIds: ['stock-1'],
          targetStockIds: ['stock-1'],
          qualityBefore: 'GOOD',
          qualityAfter: 'GOOD',
          notes: 'Cut into 8 slices each. Good quality maintained.'
        },
        {
          id: 'conv-2',
          conversionType: 'PREPARE',
          fromState: 'RAW',
          toState: 'PREPARED',
          beforeWholeUnits: 8,
          beforePartialQuantity: 0,
          beforeTotalPortions: 0,
          afterWholeUnits: 7,
          afterPartialQuantity: 0,
          afterTotalPortions: 0,
          wasteGenerated: 0.8,
          conversionEfficiency: 0.90,
          conversionCost: 40,
          performedBy: 'prep-cook@restaurant.com',
          performedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
          reason: 'Morning preparation batch',
          sourceStockIds: ['stock-2'],
          targetStockIds: ['stock-2'],
          qualityBefore: 'EXCELLENT',
          qualityAfter: 'GOOD',
          notes: 'Slight quality reduction expected from preparation process.'
        },
        {
          id: 'conv-3',
          conversionType: 'COMBINE',
          fromState: 'PORTIONED',
          toState: 'RAW',
          beforeWholeUnits: 1,
          beforePartialQuantity: 0,
          beforeTotalPortions: 24,
          afterWholeUnits: 3,
          afterPartialQuantity: 0,
          afterTotalPortions: 12,
          wasteGenerated: 0.3,
          conversionEfficiency: 0.88,
          conversionCost: 15,
          performedBy: 'manager@restaurant.com',
          performedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          reason: 'End of day consolidation',
          sourceStockIds: ['stock-3', 'stock-4'],
          targetStockIds: ['stock-5'],
          qualityBefore: 'FAIR',
          qualityAfter: 'FAIR',
          notes: 'Combined leftover portions. Quality maintained at fair level.'
        },
        {
          id: 'conv-4',
          conversionType: 'WASTE',
          fromState: 'PORTIONED',
          toState: 'WASTE',
          beforeWholeUnits: 0,
          beforePartialQuantity: 0,
          beforeTotalPortions: 6,
          afterWholeUnits: 0,
          afterPartialQuantity: 0,
          afterTotalPortions: 0,
          wasteGenerated: 6,
          conversionEfficiency: 0,
          conversionCost: 0,
          performedBy: 'shift-supervisor@restaurant.com',
          performedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          reason: 'Quality degradation - expired',
          sourceStockIds: ['stock-6'],
          targetStockIds: [],
          qualityBefore: 'EXPIRED',
          qualityAfter: 'EXPIRED',
          notes: 'Items past expiration time. Disposed according to food safety protocol.'
        }
      ]

      setConversions(mockConversions)
      setLoading(false)
    }

    loadConversions()
  }, [stockId, itemId, locationId])

  // Filter conversions based on search and filters
  useEffect(() => {
    let filtered = conversions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by conversion type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(conv => conv.conversionType === selectedType)
    }

    // Filter by date range
    const now = Date.now()
    if (dateRange !== 'all') {
      const cutoff = dateRange === 'today' ? 24 * 60 * 60 * 1000 :
                    dateRange === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                    dateRange === 'month' ? 30 * 24 * 60 * 60 * 1000 : 0
      
      filtered = filtered.filter(conv => 
        now - new Date(conv.performedAt).getTime() < cutoff
      )
    }

    setFilteredConversions(filtered.sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    ))
  }, [conversions, searchTerm, selectedType, dateRange])

  const getConversionTypeIcon = (type: ConversionType) => {
    const icons = {
      'SPLIT': <Scissors className="h-4 w-4" />,
      'COMBINE': <Combine className="h-4 w-4" />,
      'PREPARE': <RefreshCw className="h-4 w-4" />,
      'PORTION': <Hash className="h-4 w-4" />,
      'CONSUME': <TrendingDown className="h-4 w-4" />,
      'WASTE': <AlertTriangle className="h-4 w-4" />
    }
    return icons[type] || <Activity className="h-4 w-4" />
  }

  const getConversionTypeColor = (type: ConversionType) => {
    const colors = {
      'SPLIT': 'bg-blue-100 text-blue-700',
      'COMBINE': 'bg-green-100 text-green-700',
      'PREPARE': 'bg-purple-100 text-purple-700',
      'PORTION': 'bg-indigo-100 text-indigo-700',
      'CONSUME': 'bg-gray-100 text-gray-700',
      'WASTE': 'bg-red-100 text-red-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getStateTransitionIcon = (fromState: FractionalItemState, toState: FractionalItemState) => {
    if (fromState === 'RAW' && toState === 'PREPARED') return <ArrowRight className="h-4 w-4 text-blue-500" />
    if (fromState === 'PREPARED' && toState === 'PORTIONED') return <ArrowDown className="h-4 w-4 text-green-500" />
    if (fromState === 'PORTIONED' && toState === 'RAW') return <ArrowUp className="h-4 w-4 text-purple-500" />
    return <ArrowRight className="h-4 w-4 text-gray-400" />
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m ago`
    return `${minutes}m ago`
  }

  const calculateConversionMetrics = () => {
    if (filteredConversions.length === 0) return null

    const totalConversions = filteredConversions.length
    const totalWaste = filteredConversions.reduce((sum, conv) => sum + conv.wasteGenerated, 0)
    const totalCost = filteredConversions.reduce((sum, conv) => sum + conv.conversionCost, 0)
    const averageEfficiency = filteredConversions.reduce((sum, conv) => sum + conv.conversionEfficiency, 0) / totalConversions
    
    const conversionTypes = filteredConversions.reduce((acc, conv) => {
      acc[conv.conversionType] = (acc[conv.conversionType] || 0) + 1
      return acc
    }, {} as Record<ConversionType, number>)

    return {
      totalConversions,
      totalWaste,
      totalCost,
      averageEfficiency,
      conversionTypes
    }
  }

  const metrics = calculateConversionMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Conversion Tracking</h2>
          <p className="text-muted-foreground">
            Monitor and analyze inventory conversion operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('timeline')}>
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('table')}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('analytics')}>
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversions</p>
                  <p className="text-2xl font-bold">{metrics.totalConversions}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Efficiency</p>
                  <p className="text-2xl font-bold">{(metrics.averageEfficiency * 100).toFixed(1)}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Above target
                  </p>
                </div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Waste</p>
                  <p className="text-2xl font-bold">{metrics.totalWaste.toFixed(1)}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Monitor closely
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">฿{metrics.totalCost}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Within budget
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2 bg-white"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ConversionType | 'ALL')}
          >
            <option value="ALL">All Types</option>
            <option value="SPLIT">Split</option>
            <option value="COMBINE">Combine</option>
            <option value="PREPARE">Prepare</option>
            <option value="WASTE">Waste</option>
          </select>
          <select 
            className="border rounded-md px-3 py-2 bg-white"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Conversion Timeline/List */}
      {viewMode === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Conversion Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredConversions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedType !== 'ALL' || dateRange !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Conversion activities will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConversions.map((conversion, index) => (
                  <div key={conversion.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${getConversionTypeColor(conversion.conversionType).replace('text-', 'border-').replace('bg-', 'bg-white border-2 ')}`}>
                        {getConversionTypeIcon(conversion.conversionType)}
                      </div>
                      {index < filteredConversions.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2" />
                      )}
                    </div>

                    {/* Conversion Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getConversionTypeColor(conversion.conversionType)}>
                              {conversion.conversionType}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">{conversion.fromState}</span>
                              {getStateTransitionIcon(conversion.fromState, conversion.toState)}
                              <span className="text-sm font-medium">{conversion.toState}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {conversion.reason || 'No reason provided'}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{formatTimeAgo(conversion.performedAt)}</div>
                          <div>{conversion.performedBy.split('@')[0]}</div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Efficiency:</span>
                          <span className={`ml-1 font-medium ${
                            conversion.conversionEfficiency > 0.9 ? 'text-green-600' : 
                            conversion.conversionEfficiency > 0.8 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(conversion.conversionEfficiency * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Waste:</span>
                          <span className="ml-1 font-medium">{conversion.wasteGenerated.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="ml-1 font-medium">฿{conversion.conversionCost}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="ml-1 font-medium">
                            {conversion.qualityBefore} → {conversion.qualityAfter}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {conversion.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="text-muted-foreground">Notes:</span> {conversion.notes}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onConversionSelect?.(conversion)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Conversion Types Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.conversionTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getConversionTypeIcon(type as ConversionType)}
                      <span className="font-medium">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / metrics.totalConversions) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Efficiency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Efficiency</span>
                    <span className="font-medium">{(metrics.averageEfficiency * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.averageEfficiency > 0.9 ? 'bg-green-500' :
                        metrics.averageEfficiency > 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.averageEfficiency * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-700">Best Performance</div>
                    <div className="text-lg font-bold text-green-800">
                      {Math.max(...filteredConversions.map(c => c.conversionEfficiency * 100)).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="font-medium text-red-700">Needs Improvement</div>
                    <div className="text-lg font-bold text-red-800">
                      {Math.min(...filteredConversions.map(c => c.conversionEfficiency * 100)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}