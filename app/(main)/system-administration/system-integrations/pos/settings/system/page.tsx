'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X, Mail, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SettingsNav } from "../../components/settings-nav"
import { SettingsHelpSection } from "../../components/settings-help-section"

// Define types for form data structure
interface EmailNotification {
  id: string
  email: string
  role: string
}

interface NotificationTypes {
  newUnmappedItems: boolean
  failedTransactions: boolean
  stockOutApprovals: boolean
  systemErrors: boolean
}

interface Thresholds {
  failureRate: number
  unmappedCount: number
  processingDelay: number
}

interface SeverityLevels {
  failureRate: string
  unmappedCount: string
  processingDelay: string
}

type InputValue = string | number | readonly string[]

interface FormData {
  stockOutCreation: string
  approvalRequired: boolean
  approvalLevels: number
  emailNotifications: EmailNotification[]
  notificationTypes: Record<string, boolean>
  thresholds: Record<string, number>
  severityLevels: Record<string, string>
}

interface UserRole {
  id: string
  name: string
  accessLevel: string
  modules: string[]
}

export default function SystemSettingsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    // Stock-out settings
    stockOutCreation: "automatic",
    approvalRequired: true,
    approvalLevels: 2,
    
    // Notification settings
    emailNotifications: [
      { id: "1", email: "manager@example.com", role: "Manager" },
      { id: "2", email: "finance@example.com", role: "Finance" }
    ],
    notificationTypes: {
      newUnmappedItems: true,
      failedTransactions: true,
      stockOutApprovals: true,
      systemErrors: false,
    },
    
    // Alert thresholds
    thresholds: {
      failureRate: 5,
      unmappedCount: 10,
      processingDelay: 30,
    },
    severityLevels: {
      failureRate: "warning",
      unmappedCount: "critical",
      processingDelay: "warning",
    },
  })
  
  const [userRoles, setUserRoles] = useState<UserRole[]>([
    { id: "1", name: "Store Manager", accessLevel: "admin", modules: ["inventory", "reports", "pos", "users"] },
    { id: "2", name: "Inventory Staff", accessLevel: "editor", modules: ["inventory"] },
    { id: "3", name: "Cashier", accessLevel: "viewer", modules: ["pos"] },
  ])
  
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [roleInput, setRoleInput] = useState("User")
  
  const accessLevelOptions = [
    { value: "admin", label: "Administrator" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
  ]
  
  const moduleOptions = [
    { value: "inventory", label: "Inventory Management" },
    { value: "reports", label: "Reports & Analytics" },
    { value: "pos", label: "POS Integration" },
    { value: "users", label: "User Management" },
    { value: "settings", label: "System Settings" },
  ]
  
  useEffect(() => {
    // In a real app, we'd compare with initial values from the server
    setIsFormChanged(true)
  }, [formData, userRoles])
  
  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S to save settings
      if (e.altKey && e.key === 's' && isFormChanged) {
        e.preventDefault()
        saveSettings()
      }
      
      // Alt+C to switch to POS Configuration
      if (e.altKey && e.key === 'c') {
        e.preventDefault()
        router.push('/system-administration/system-integrations/pos/settings/config')
      }
      
      // Alt+D to add a new email notification
      if (e.altKey && e.key === 'd' && emailInput) {
        e.preventDefault()
        addEmailNotification()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFormChanged, emailInput, router])
  
  const handleInputChange = (category: 'notificationTypes' | 'thresholds' | 'severityLevels', field: string, value: InputValue) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }
  
  const handleCheckboxChange = (field: string, checked: boolean | "indeterminate") => {
    setFormData(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [field]: checked === "indeterminate" ? false : checked
      }
    }))
  }
  
  const handleNumberInput = (category: 'thresholds', field: string, value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: numValue
        }
      }))
    }
  }
  
  const handleSelectChange = (category: 'severityLevels', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }
  
  const handleDirectChange = (field: keyof Pick<FormData, 'stockOutCreation' | 'approvalRequired' | 'approvalLevels'>, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const addEmailNotification = () => {
    if (!emailInput || !roleInput) return
    
    const newEmail: EmailNotification = {
      id: (formData.emailNotifications.length + 1).toString(),
      email: emailInput,
      role: roleInput
    }
    
    setFormData((prev) => ({
      ...prev,
      emailNotifications: [...prev.emailNotifications, newEmail]
    }))
    
    setEmailInput("")
  }
  
  const removeEmailNotification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      emailNotifications: prev.emailNotifications.filter((email) => email.id !== id)
    }))
  }
  
  const updateUserRole = (id: string, field: keyof UserRole, value: string | boolean) => {
    setUserRoles(prev => 
      prev.map(role => 
        role.id === id ? { ...role, [field]: value } : role
      )
    )
  }
  
  const toggleModule = (id: string, module: string, checked: boolean) => {
    setUserRoles((prev) =>
      prev.map((role) => {
        if (role.id === id) {
          const modules = checked
            ? [...role.modules, module]
            : role.modules.filter((m) => m !== module)
          return { ...role, modules }
        }
        return role
      })
    )
  }
  
  const saveSettings = () => {
    // In a real application, this would save to the backend
    console.log("Saving settings:", { formData, userRoles })
    // Show success notification
    alert("Settings saved successfully!")
    setIsFormChanged(false)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SettingsNav activeTab="system" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+S</kbd> Save
          </div>
          <Button 
            disabled={!isFormChanged} 
            onClick={saveSettings} 
            className="ml-auto"
            aria-label="Save system settings"
          >
            Save Settings
          </Button>
        </div>
      </div>
      
      {/* Stock-out Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Stock-out Settings</CardTitle>
          <CardDescription>
            Configure how stock-outs are created and approved in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2" id="stock-out-creation">Stock-out Creation</h3>
              <RadioGroup 
                value={formData.stockOutCreation} 
                onValueChange={(value) => handleDirectChange("stockOutCreation", value)}
                className="space-y-3"
                aria-labelledby="stock-out-creation"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="automatic" id="automatic" className="mt-1" />
                  <div>
                    <Label htmlFor="automatic" className="font-medium">Automatic</Label>
                    <p className="text-sm text-muted-foreground">
                      Create stock-outs automatically when POS transactions are processed
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <div>
                    <Label htmlFor="manual" className="font-medium">Manual</Label>
                    <p className="text-sm text-muted-foreground">
                      Require manual review and creation of stock-outs from POS data
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approval-toggle" className="font-medium">Approval Process</Label>
                  <p className="text-sm text-muted-foreground">
                    Require approval for stock-outs before they're finalized
                  </p>
                </div>
                <Switch 
                  id="approval-toggle" 
                  checked={formData.approvalRequired}
                  onCheckedChange={(checked) => handleDirectChange("approvalRequired", checked)}
                />
              </div>
              
              {formData.approvalRequired && (
                <Accordion type="single" collapsible defaultValue="approval-settings">
                  <AccordionItem value="approval-settings" className="border-0">
                    <AccordionTrigger className="py-2 text-sm">
                      Approval Settings
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="approval-levels">Approval Levels</Label>
                          <Select 
                            value={formData.approvalLevels.toString()}
                            onValueChange={(value) => handleDirectChange("approvalLevels", parseInt(value))}
                          >
                            <SelectTrigger id="approval-levels">
                              <SelectValue placeholder="Select approval levels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Level</SelectItem>
                              <SelectItem value="2">2 Levels</SelectItem>
                              <SelectItem value="3">3 Levels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Approver Roles</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="role-manager" defaultChecked />
                              <Label htmlFor="role-manager">Store Manager</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="role-supervisor" defaultChecked />
                              <Label htmlFor="role-supervisor">Supervisor</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="role-finance" />
                              <Label htmlFor="role-finance">Finance Department</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure when and how to receive system notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium" id="email-notifications">Email Notifications</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label id="recipients-label">Recipients</Label>
                <div className="flex flex-wrap gap-2 mb-2" aria-labelledby="recipients-label" role="group">
                  {formData.emailNotifications.map((item) => (
                    <Badge key={item.id} variant="secondary" className="pl-2 pr-1 py-1">
                      <Mail className="h-3 w-3 mr-1" aria-hidden="true" />
                      <span>{item.email} ({item.role})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmailNotification(item.id)}
                        className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${item.email}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1"
                      aria-label="New recipient email address"
                    />
                    <Select
                      value={roleInput}
                      onValueChange={setRoleInput}
                      aria-label="Recipient role"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="IT Admin">IT Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={addEmailNotification}
                    disabled={!emailInput}
                    className="mt-0"
                    aria-label="Add new email recipient"
                  >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label id="notification-types">Notification Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2" role="group" aria-labelledby="notification-types">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notify-unmapped" 
                      checked={formData.notificationTypes.newUnmappedItems}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("newUnmappedItems", checked)
                      }
                    />
                    <Label htmlFor="notify-unmapped">New unmapped items</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notify-failed" 
                      checked={formData.notificationTypes.failedTransactions}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("failedTransactions", checked)
                      }
                    />
                    <Label htmlFor="notify-failed">Failed transactions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notify-approvals" 
                      checked={formData.notificationTypes.stockOutApprovals}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("stockOutApprovals", checked)
                      }
                    />
                    <Label htmlFor="notify-approvals">Stock-out approvals</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notify-errors" 
                      checked={formData.notificationTypes.systemErrors}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("systemErrors", checked)
                      }
                    />
                    <Label htmlFor="notify-errors">System errors</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-medium">Alert Thresholds</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold-failure">Transaction Failure Rate (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="threshold-failure"
                      type="number"
                      min={1}
                      max={100}
                      value={formData.thresholds.failureRate.toString()}
                      onChange={(e) => 
                        handleNumberInput("thresholds", "failureRate", e.target.value)
                      }
                    />
                    <Select
                      value={formData.severityLevels.failureRate}
                      onValueChange={(value) => 
                        handleSelectChange("severityLevels", "failureRate", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold-unmapped">Unmapped Items Count</Label>
                  <div className="flex gap-2">
                    <Input
                      id="threshold-unmapped"
                      type="number"
                      min={1}
                      value={formData.thresholds.unmappedCount.toString()}
                      onChange={(e) => 
                        handleNumberInput("thresholds", "unmappedCount", e.target.value)
                      }
                    />
                    <Select
                      value={formData.severityLevels.unmappedCount}
                      onValueChange={(value) => 
                        handleSelectChange("severityLevels", "unmappedCount", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold-delay">Processing Delay (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="threshold-delay"
                      type="number"
                      min={1}
                      value={formData.thresholds.processingDelay.toString()}
                      onChange={(e) => 
                        handleNumberInput("thresholds", "processingDelay", e.target.value)
                      }
                    />
                    <Select
                      value={formData.severityLevels.processingDelay}
                      onValueChange={(value) => 
                        handleSelectChange("severityLevels", "processingDelay", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* User Access Control */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>User Access Control</CardTitle>
            <CardDescription className="mt-1">
              Manage access permissions for users and roles
            </CardDescription>
          </div>
          <Button size="sm" aria-label="Add new role">
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            Add Role
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border overflow-auto">
            <Table aria-label="User roles and permissions">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">User/Role</TableHead>
                  <TableHead className="w-[150px]">Access Level</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Select
                        value={role.accessLevel}
                        onValueChange={(value) => updateUserRole(role.id, "accessLevel", value)}
                        aria-label={`Access level for ${role.name}`}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessLevelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Collapsible className="w-full space-y-2">
                        <div className="flex items-center justify-between space-x-4 rounded-lg border px-4 py-2">
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {role.modules.map((module) => (
                                <Badge key={module} variant="outline">
                                  {moduleOptions.find(m => m.value === module)?.label || module}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label={`Toggle module permissions for ${role.name}`}>
                              <ChevronDown className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Toggle</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2">
                          <div className="rounded-lg border px-4 py-3 shadow-sm">
                            <h4 className="text-sm font-medium mb-2" id={`module-permissions-${role.id}`}>Module Permissions</h4>
                            <div 
                              className="grid grid-cols-1 md:grid-cols-2 gap-2" 
                              role="group" 
                              aria-labelledby={`module-permissions-${role.id}`}
                            >
                              {moduleOptions.map((module) => (
                                <div key={module.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${role.id}-${module.value}`}
                                    checked={role.modules.includes(module.value)}
                                    onCheckedChange={(checked) => 
                                      toggleModule(role.id, module.value, !!checked)
                                    }
                                  />
                                  <Label htmlFor={`${role.id}-${module.value}`}>{module.label}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" aria-label={`Edit ${role.name}`}>Edit</Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete ${role.name}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <SettingsHelpSection 
        pageName="System Settings" 
        shortcuts={[
          { key: "Alt+S", description: "Save settings" },
          { key: "Alt+C", description: "Go to POS Configuration" },
          { key: "Alt+D", description: "Add new email notification" }
        ]}
      />
    </div>
  )
} 