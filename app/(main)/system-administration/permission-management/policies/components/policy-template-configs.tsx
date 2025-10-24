"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, DollarSign, Clock, MapPin, Building, Package } from "lucide-react"

interface TemplateConfigProps {
  templateId: string
  onChange: (config: any) => void
}

// Department Access Configuration
export function DepartmentAccessConfig({ onChange }: TemplateConfigProps) {
  const [config, setConfig] = useState({
    departments: [] as string[],
    permissions: [] as string[],
    crossDepartmentAccess: false,
    managerOverride: true,
    restrictToBusinessHours: false
  })

  const departments = [
    { id: 'kitchen', name: 'Kitchen', description: 'Food preparation and cooking' },
    { id: 'finance', name: 'Finance', description: 'Financial management and accounting' },
    { id: 'procurement', name: 'Procurement', description: 'Purchasing and vendor management' },
    { id: 'inventory', name: 'Inventory', description: 'Stock and inventory management' },
    { id: 'hr', name: 'Human Resources', description: 'Staff and employee management' },
    { id: 'management', name: 'Management', description: 'Executive and management oversight' }
  ]

  const permissions = [
    { id: 'view_data', name: 'View Department Data', description: 'Access to department information' },
    { id: 'create_records', name: 'Create Records', description: 'Create new department records' },
    { id: 'edit_records', name: 'Edit Records', description: 'Modify existing records' },
    { id: 'delete_records', name: 'Delete Records', description: 'Remove records (with approval)' },
    { id: 'generate_reports', name: 'Generate Reports', description: 'Create department reports' },
    { id: 'approve_actions', name: 'Approve Actions', description: 'Approve department-specific actions' }
  ]

  const handleConfigChange = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Select Departments
          </CardTitle>
          <CardDescription>
            Choose which departments this policy applies to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={dept.id}
                  checked={config.departments.includes(dept.id)}
                  onCheckedChange={(checked) => {
                    const newDepts = checked
                      ? [...config.departments, dept.id]
                      : config.departments.filter(d => d !== dept.id)
                    handleConfigChange({ departments: newDepts })
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={dept.id} className="text-sm font-medium cursor-pointer">
                    {dept.name}
                  </label>
                  <p className="text-xs text-muted-foreground">{dept.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Permissions</CardTitle>
          <CardDescription>
            Select what actions users can perform within their departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {permissions.map((perm) => (
              <div key={perm.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={perm.id}
                  checked={config.permissions.includes(perm.id)}
                  onCheckedChange={(checked) => {
                    const newPerms = checked
                      ? [...config.permissions, perm.id]
                      : config.permissions.filter(p => p !== perm.id)
                    handleConfigChange({ permissions: newPerms })
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={perm.id} className="text-sm font-medium cursor-pointer">
                    {perm.name}
                  </label>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Cross-Department Access</Label>
              <div className="text-sm text-muted-foreground">
                Allow users to access data from other departments
              </div>
            </div>
            <Switch
              checked={config.crossDepartmentAccess}
              onCheckedChange={(checked) => handleConfigChange({ crossDepartmentAccess: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Manager Override</Label>
              <div className="text-sm text-muted-foreground">
                Allow department managers to override restrictions
              </div>
            </div>
            <Switch
              checked={config.managerOverride}
              onCheckedChange={(checked) => handleConfigChange({ managerOverride: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Business Hours Only</Label>
              <div className="text-sm text-muted-foreground">
                Restrict access to business hours (9 AM - 6 PM)
              </div>
            </div>
            <Switch
              checked={config.restrictToBusinessHours}
              onCheckedChange={(checked) => handleConfigChange({ restrictToBusinessHours: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Financial Approval Configuration
export function FinancialApprovalConfig({ onChange }: TemplateConfigProps) {
  const [config, setConfig] = useState({
    approvalLimits: [
      { role: 'staff', limit: 500, requiresApproval: true },
      { role: 'supervisor', limit: 2000, requiresApproval: true },
      { role: 'manager', limit: 10000, requiresApproval: false },
      { role: 'director', limit: -1, requiresApproval: false }
    ],
    emergencyOverride: true,
    autoApprovalUnder: 100,
    requiresSecondApproval: 5000,
    notificationThreshold: 1000
  })

  const roles = [
    { id: 'staff', name: 'Staff', description: 'General staff members' },
    { id: 'supervisor', name: 'Supervisor', description: 'Department supervisors' },
    { id: 'manager', name: 'Manager', description: 'Department managers' },
    { id: 'director', name: 'Director', description: 'Executive level' }
  ]

  const handleConfigChange = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const updateApprovalLimit = (role: string, limit: number) => {
    const newLimits = config.approvalLimits.map(al => 
      al.role === role ? { ...al, limit } : al
    )
    handleConfigChange({ approvalLimits: newLimits })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Approval Limits by Role
          </CardTitle>
          <CardDescription>
            Set spending limits for each role level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.approvalLimits.map((limit, index) => {
              const role = roles.find(r => r.id === limit.role)
              return (
                <div key={limit.role} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{role?.name}</div>
                    <div className="text-sm text-muted-foreground">{role?.description}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Label className="text-xs">Limit ($)</Label>
                      <Input
                        type="number"
                        value={limit.limit === -1 ? '' : limit.limit}
                        onChange={(e) => updateApprovalLimit(
                          limit.role, 
                          e.target.value === '' ? -1 : parseInt(e.target.value)
                        )}
                        placeholder="Unlimited"
                        className="h-8"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {limit.limit === -1 ? 'Unlimited' : `$${limit.limit.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Auto-Approval Threshold: ${config.autoApprovalUnder}</Label>
            <Slider
              value={[config.autoApprovalUnder]}
              onValueChange={([value]) => handleConfigChange({ autoApprovalUnder: value })}
              max={500}
              step={25}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Purchases under this amount are automatically approved
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Second Approval Required Above: ${config.requiresSecondApproval}</Label>
            <Slider
              value={[config.requiresSecondApproval]}
              onValueChange={([value]) => handleConfigChange({ requiresSecondApproval: value })}
              max={10000}
              step={500}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Large purchases require two approvals
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Emergency Override</Label>
              <div className="text-sm text-muted-foreground">
                Allow managers to override limits in emergencies
              </div>
            </div>
            <Switch
              checked={config.emergencyOverride}
              onCheckedChange={(checked) => handleConfigChange({ emergencyOverride: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Store Location Configuration
export function StoreLocationConfig({ onChange }: TemplateConfigProps) {
  const [config, setConfig] = useState({
    locations: [] as string[],
    accessType: 'assigned', // 'assigned', 'region', 'all'
    managerAccess: true,
    crossStoreReporting: false,
    emergencyAccess: true
  })

  const locations = [
    { id: 'store-001', name: 'Downtown Location', region: 'Central', manager: 'John Smith' },
    { id: 'store-002', name: 'Mall Location', region: 'North', manager: 'Sarah Johnson' },
    { id: 'store-003', name: 'Airport Terminal', region: 'Central', manager: 'Mike Wilson' },
    { id: 'store-004', name: 'University Campus', region: 'South', manager: 'Lisa Chen' },
    { id: 'store-005', name: 'Business District', region: 'Central', manager: 'David Brown' }
  ]

  const handleConfigChange = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Access Type
          </CardTitle>
          <CardDescription>
            Choose how location access is determined
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={config.accessType}
            onValueChange={(value) => handleConfigChange({ accessType: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="assigned" id="assigned" />
              <Label htmlFor="assigned">Assigned Locations Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="region" id="region" />
              <Label htmlFor="region">Regional Access</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All Locations</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {config.accessType === 'assigned' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Locations</CardTitle>
            <CardDescription>
              Choose which locations users can access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={location.id}
                    checked={config.locations.includes(location.id)}
                    onCheckedChange={(checked) => {
                      const newLocations = checked
                        ? [...config.locations, location.id]
                        : config.locations.filter(l => l !== location.id)
                      handleConfigChange({ locations: newLocations })
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={location.id} className="font-medium cursor-pointer">
                        {location.name}
                      </Label>
                      <Badge variant="outline">{location.region}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Manager: {location.manager}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Manager Override</Label>
              <div className="text-sm text-muted-foreground">
                Store managers can access all their location's data
              </div>
            </div>
            <Switch
              checked={config.managerAccess}
              onCheckedChange={(checked) => handleConfigChange({ managerAccess: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Cross-Store Reporting</Label>
              <div className="text-sm text-muted-foreground">
                Allow viewing reports across multiple stores
              </div>
            </div>
            <Switch
              checked={config.crossStoreReporting}
              onCheckedChange={(checked) => handleConfigChange({ crossStoreReporting: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Emergency Access</Label>
              <div className="text-sm text-muted-foreground">
                Allow emergency access to any location when needed
              </div>
            </div>
            <Switch
              checked={config.emergencyAccess}
              onCheckedChange={(checked) => handleConfigChange({ emergencyAccess: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Time-Based Access Configuration
export function TimeBasedAccessConfig({ onChange }: TemplateConfigProps) {
  const [config, setConfig] = useState({
    accessType: 'business_hours', // 'business_hours', 'shifts', 'custom'
    businessHours: { start: '09:00', end: '18:00' },
    shifts: [
      { id: 'morning', name: 'Morning Shift', start: '06:00', end: '14:00', days: [1,2,3,4,5] },
      { id: 'evening', name: 'Evening Shift', start: '14:00', end: '22:00', days: [1,2,3,4,5] },
      { id: 'weekend', name: 'Weekend Shift', start: '10:00', end: '18:00', days: [6,0] }
    ],
    allowOverrides: true,
    emergencyAccess: true,
    holidayRestrictions: false
  })

  const handleConfigChange = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const daysOfWeek = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Access Schedule Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={config.accessType}
            onValueChange={(value) => handleConfigChange({ accessType: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="business_hours" id="business_hours" />
              <Label htmlFor="business_hours">Standard Business Hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="shifts" id="shifts" />
              <Label htmlFor="shifts">Shift-Based Access</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Schedule</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {config.accessType === 'business_hours' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={config.businessHours.start}
                  onChange={(e) => handleConfigChange({
                    businessHours: { ...config.businessHours, start: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={config.businessHours.end}
                  onChange={(e) => handleConfigChange({
                    businessHours: { ...config.businessHours, end: e.target.value }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config.accessType === 'shifts' && (
        <Card>
          <CardHeader>
            <CardTitle>Shift Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.shifts.map((shift, index) => (
                <div key={shift.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{shift.name}</h4>
                    <Badge variant="outline">
                      {shift.start} - {shift.end}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Start Time</Label>
                      <Input
                        type="time"
                        value={shift.start}
                        onChange={(e) => {
                          const newShifts = [...config.shifts]
                          newShifts[index] = { ...shift, start: e.target.value }
                          handleConfigChange({ shifts: newShifts })
                        }}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">End Time</Label>
                      <Input
                        type="time"
                        value={shift.end}
                        onChange={(e) => {
                          const newShifts = [...config.shifts]
                          newShifts[index] = { ...shift, end: e.target.value }
                          handleConfigChange({ shifts: newShifts })
                        }}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Active Days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${shift.id}-${day.id}`}
                            checked={shift.days.includes(day.id)}
                            onCheckedChange={(checked) => {
                              const newShifts = [...config.shifts]
                              if (checked) {
                                newShifts[index].days = [...shift.days, day.id]
                              } else {
                                newShifts[index].days = shift.days.filter(d => d !== day.id)
                              }
                              handleConfigChange({ shifts: newShifts })
                            }}
                          />
                          <Label htmlFor={`${shift.id}-${day.id}`} className="text-xs">
                            {day.name.slice(0, 3)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Override Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Manager Overrides</Label>
              <div className="text-sm text-muted-foreground">
                Managers can grant temporary access outside scheduled hours
              </div>
            </div>
            <Switch
              checked={config.allowOverrides}
              onCheckedChange={(checked) => handleConfigChange({ allowOverrides: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Emergency Access</Label>
              <div className="text-sm text-muted-foreground">
                Allow emergency access 24/7 for critical situations
              </div>
            </div>
            <Switch
              checked={config.emergencyAccess}
              onCheckedChange={(checked) => handleConfigChange({ emergencyAccess: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}