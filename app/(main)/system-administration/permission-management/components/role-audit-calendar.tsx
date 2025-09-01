"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CalendarDays, 
  Clock, 
  User, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Filter
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AuditEvent {
  id: string
  date: Date
  type: 'role_created' | 'role_updated' | 'role_deleted' | 'permission_changed' | 'user_assigned' | 'user_removed'
  title: string
  description: string
  roleName: string
  userName?: string
  severity: 'low' | 'medium' | 'high'
  status: 'completed' | 'pending' | 'failed'
}

// Mock audit data
const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    date: new Date(2024, 11, 15),
    type: 'role_created',
    title: 'New Role Created',
    description: 'Kitchen Manager role created with inventory permissions',
    roleName: 'Kitchen Manager',
    userName: 'John Smith',
    severity: 'low',
    status: 'completed'
  },
  {
    id: '2',
    date: new Date(2024, 11, 14),
    type: 'permission_changed',
    title: 'Permissions Modified',
    description: 'Purchase approval permissions updated for Finance Manager role',
    roleName: 'Finance Manager',
    userName: 'Sarah Johnson',
    severity: 'medium',
    status: 'completed'
  },
  {
    id: '3',
    date: new Date(2024, 11, 13),
    type: 'user_assigned',
    title: 'User Role Assignment',
    description: 'New user assigned to Store Manager role',
    roleName: 'Store Manager',
    userName: 'Mike Wilson',
    severity: 'low',
    status: 'completed'
  },
  {
    id: '4',
    date: new Date(2024, 11, 12),
    type: 'role_deleted',
    title: 'Role Removed',
    description: 'Temporary contractor role was deleted',
    roleName: 'Temporary Contractor',
    userName: 'Admin User',
    severity: 'high',
    status: 'completed'
  },
  {
    id: '5',
    date: new Date(2024, 11, 10),
    type: 'permission_changed',
    title: 'Security Policy Update',
    description: 'Updated password requirements for all admin roles',
    roleName: 'System Admin',
    userName: 'Security Team',
    severity: 'high',
    status: 'pending'
  }
]

export function RoleAuditCalendar() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = React.useState<AuditEvent | null>(null)
  const [filterType, setFilterType] = React.useState<string>('all')
  const [filterSeverity, setFilterSeverity] = React.useState<string>('all')

  // Get events for the selected date
  const getEventsForDate = (date: Date): AuditEvent[] => {
    return mockAuditEvents.filter(event => {
      const eventDate = new Date(event.date)
      const isSameDate = eventDate.toDateString() === date.toDateString()
      
      if (!isSameDate) return false
      
      if (filterType !== 'all' && event.type !== filterType) return false
      if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false
      
      return true
    })
  }

  // Get all dates that have events for calendar highlighting
  const getEventDates = (): Date[] => {
    return Array.from(new Set(
      mockAuditEvents
        .filter(event => {
          if (filterType !== 'all' && event.type !== filterType) return false
          if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false
          return true
        })
        .map(event => event.date.toDateString())
    )).map(dateString => new Date(dateString))
  }

  const getEventTypeIcon = (type: AuditEvent['type']) => {
    switch (type) {
      case 'role_created': return <Shield className="h-4 w-4 text-green-500" />
      case 'role_updated': return <Shield className="h-4 w-4 text-blue-500" />
      case 'role_deleted': return <Shield className="h-4 w-4 text-red-500" />
      case 'permission_changed': return <CheckCircle2 className="h-4 w-4 text-orange-500" />
      case 'user_assigned': return <User className="h-4 w-4 text-green-500" />
      case 'user_removed': return <User className="h-4 w-4 text-red-500" />
      default: return <CalendarDays className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityBadge = (severity: AuditEvent['severity']) => {
    const variants = {
      low: { variant: 'secondary' as const, color: 'text-green-700' },
      medium: { variant: 'outline' as const, color: 'text-orange-700' },
      high: { variant: 'destructive' as const, color: 'text-red-700' }
    }
    
    return (
      <Badge variant={variants[severity].variant} className={variants[severity].color}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status: AuditEvent['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []
  const eventDates = getEventDates()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <Card className="lg:col-span-1">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Role Audit Calendar
            </CardTitle>
            <CardDescription>
              View role and permission changes over time
            </CardDescription>
          </div>
          
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="role_created">Role Created</SelectItem>
                  <SelectItem value="role_updated">Role Updated</SelectItem>
                  <SelectItem value="role_deleted">Role Deleted</SelectItem>
                  <SelectItem value="permission_changed">Permission Changed</SelectItem>
                  <SelectItem value="user_assigned">User Assigned</SelectItem>
                  <SelectItem value="user_removed">User Removed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvents: eventDates
            }}
            modifiersStyles={{
              hasEvents: { 
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              }
            }}
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Days with audit events</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Events for ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`
              : 'Select a date to view events'
            }
          </CardTitle>
          <CardDescription>
            {selectedDateEvents.length} events found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event, index) => (
                  <div key={event.id}>
                    <div 
                      className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getEventTypeIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(event.severity)}
                            {getStatusIcon(event.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Role: {event.roleName}</span>
                            {event.userName && <span>By: {event.userName}</span>}
                          </div>
                          <span>{event.date.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {index < selectedDateEvents.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  No audit events for this date with the current filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterType('all')
                    setFilterSeverity('all')
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Event Detail Popover */}
      {selectedEvent && (
        <Popover open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <PopoverContent className="w-96">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{selectedEvent.title}</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="font-medium">Role:</span>
                    <p className="text-muted-foreground">{selectedEvent.roleName}</p>
                  </div>
                  {selectedEvent.userName && (
                    <div>
                      <span className="font-medium">User:</span>
                      <p className="text-muted-foreground">{selectedEvent.userName}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Severity:</span>
                    <div className="mt-1">{getSeverityBadge(selectedEvent.severity)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {getStatusIcon(selectedEvent.status)}
                      <span className="capitalize">{selectedEvent.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <span className="font-medium">Date & Time:</span>
                  <p className="text-muted-foreground">
                    {selectedEvent.date.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}