"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Building, 
  Users, 
  DollarSign, 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info
} from "lucide-react"

interface SimplifiedPolicyCreatorProps {
  onPolicyCreate: (policy: any) => void
  onCancel: () => void
}

export function SimplifiedPolicyCreator({ onPolicyCreate, onCancel }: SimplifiedPolicyCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [step, setStep] = useState<'template' | 'configure' | 'review'>('template')
  const [policyConfig, setPolicyConfig] = useState<any>({})

  // Updated role-based templates
  const templates = [
    {
      id: 'department-role',
      title: 'Department Role Access',
      description: 'Grant a role access to specific department operations (Kitchen Manager, Store Manager, etc.)',
      icon: Building,
      category: 'Role-Based Access',
      complexity: 'Simple',
      estimatedTime: '2-3 minutes',
      benefits: ['Direct role-to-permission mapping', 'No complex conditions', 'Easy to understand'],
      useCase: 'Perfect for: Kitchen Manager accessing inventory, Store Manager handling operations'
    },
    {
      id: 'financial-approver',
      title: 'Financial Approval Role',
      description: 'Set approval limits for roles (Finance Manager approves up to $25K, Department Manager up to $5K)',
      icon: DollarSign,
      category: 'Financial Control',
      complexity: 'Simple',
      estimatedTime: '3-4 minutes',
      benefits: ['Clear approval limits', 'Role-based thresholds', 'Automatic escalation'],
      useCase: 'Perfect for: Finance Manager approving large purchases, Department Manager for smaller amounts'
    },
    {
      id: 'store-operations',
      title: 'Store Operations Role',
      description: 'Configure store-specific role permissions (Store Manager for their location, Regional Manager for multiple)',
      icon: MapPin,
      category: 'Location Access',
      complexity: 'Simple',
      estimatedTime: '2-3 minutes',
      benefits: ['Location-specific access', 'Role-based store management', 'Clear boundaries'],
      useCase: 'Perfect for: Store Manager accessing their store, Regional Manager overseeing multiple locations'
    },
    {
      id: 'inventory-management',
      title: 'Inventory Role Access',
      description: 'Set inventory permissions by role (Inventory Coordinator, Warehouse Staff, Stock Auditor)',
      icon: Package,
      category: 'Inventory Control',
      complexity: 'Simple',
      estimatedTime: '2-3 minutes',
      benefits: ['Role-specific inventory access', 'Clear responsibility areas', 'Stock category control'],
      useCase: 'Perfect for: Inventory Coordinator managing all stock, Kitchen Staff accessing food items only'
    },
    {
      id: 'vendor-management',
      title: 'Vendor Relations Role',
      description: 'Configure vendor management by role (Procurement Manager, Vendor Coordinator, Purchase Agent)',
      icon: Users,
      category: 'Vendor Relations',
      complexity: 'Simple',
      estimatedTime: '2-4 minutes',
      benefits: ['Role-based vendor access', 'Clear vendor type management', 'Streamlined communications'],
      useCase: 'Perfect for: Procurement Manager handling all vendors, Purchase Agent for specific categories'
    },
    {
      id: 'shift-operations',
      title: 'Shift Manager Role',
      description: 'Set shift-specific role permissions (Night Manager, Weekend Supervisor, Duty Manager)',
      icon: Clock,
      category: 'Time-Based Access',
      complexity: 'Simple',
      estimatedTime: '3-5 minutes',
      benefits: ['Shift-specific permissions', 'Time-based role activation', 'Clear operational hours'],
      useCase: 'Perfect for: Night Manager accessing after-hours operations, Weekend Supervisor for weekend staff'
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // Initialize with role-based defaults
      setPolicyConfig({
        templateId: templateId,
        roleName: '',
        roleId: '',
        permissions: [],
        restrictions: {},
        ...getTemplateDefaults(templateId)
      })
    }
    setStep('configure')
  }

  const getTemplateDefaults = (templateId: string) => {
    switch (templateId) {
      case 'department-role':
        return {
          departments: [],
          permissions: ['view_data', 'create_items'],
          approvalLimit: 1000
        }
      case 'financial-approver':
        return {
          maxApprovalAmount: 5000,
          requiresSecondApproval: false,
          transactionTypes: ['purchase-orders', 'vendor-payments']
        }
      case 'store-operations':
        return {
          storeLocations: [],
          operations: ['manage_inventory', 'process_sales', 'generate_reports'],
          restrictToAssignedLocation: true
        }
      case 'inventory-management':
        return {
          inventoryOperations: ['view_stock', 'adjust_levels', 'receive_goods'],
          stockCategories: ['all'],
          adjustmentLimit: 500
        }
      case 'vendor-management':
        return {
          vendorOperations: ['view_profiles', 'manage_communications'],
          vendorTypes: ['all'],
          canApproveVendors: false
        }
      case 'shift-operations':
        return {
          activeShifts: ['morning', 'afternoon'],
          shiftPermissions: ['manage_operations', 'handle_emergencies'],
          allowOverrides: true
        }
      default:
        return {}
    }
  }

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose a Role-Based Policy Template</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our simplified approach uses direct role-to-permission mapping. No complex conditions or attributes needed - 
          just select a role and define what they can do.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon
          return (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime}
                  </span>
                  <Badge variant={template.complexity === 'Simple' ? 'default' : 'secondary'}>
                    {template.complexity}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Role-Based Benefits
                  </div>
                  <div className="space-y-1">
                    {template.benefits.slice(0, 2).map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Use case:</span> {template.useCase}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Why Role-Based Access Control?</h4>
            <p className="text-sm text-blue-700 mt-1">
              RBAC simplifies permission management by directly assigning permissions to roles instead of using complex attribute conditions. 
              This makes policies easier to understand, maintain, and audit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderConfiguration = () => {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStep('template')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Configure {template.title}</h2>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Role Information</CardTitle>
            <CardDescription>Define the role that will receive these permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  placeholder="e.g., Kitchen Manager, Finance Manager"
                  value={policyConfig.roleName || ''}
                  onChange={(e) => setPolicyConfig({...policyConfig, roleName: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  The display name for this role
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role ID</Label>
                <Input
                  placeholder="e.g., kitchen-manager, finance-manager"
                  value={policyConfig.roleId || ''}
                  onChange={(e) => setPolicyConfig({...policyConfig, roleId: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  System identifier (lowercase, hyphen-separated)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {renderTemplateSpecificConfig(template.id)}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => setStep('review')}
            disabled={!policyConfig.roleName || !policyConfig.roleId}
          >
            Review Policy
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  const renderTemplateSpecificConfig = (templateId: string) => {
    switch (templateId) {
      case 'department-role':
        return renderDepartmentRoleConfig()
      case 'financial-approver':
        return renderFinancialApproverConfig()
      case 'store-operations':
        return renderStoreOperationsConfig()
      case 'inventory-management':
        return renderInventoryManagementConfig()
      case 'vendor-management':
        return renderVendorManagementConfig()
      case 'shift-operations':
        return renderShiftOperationsConfig()
      default:
        return null
    }
  }

  const renderDepartmentRoleConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle>Department Access</CardTitle>
        <CardDescription>Select departments and permissions for this role</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Departments</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Kitchen', 'Finance', 'Procurement', 'Inventory', 'Store Operations', 'Management'].map(dept => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={dept}
                  checked={policyConfig.departments?.includes(dept) || false}
                  onCheckedChange={(checked) => {
                    const departments = policyConfig.departments || []
                    setPolicyConfig({
                      ...policyConfig,
                      departments: checked 
                        ? [...departments, dept]
                        : departments.filter((d: string) => d !== dept)
                    })
                  }}
                />
                <Label htmlFor={dept} className="text-sm">{dept}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-2">
            {['View Data', 'Create Items', 'Edit Items', 'Delete Items', 'Generate Reports', 'Approve Actions'].map(perm => (
              <div key={perm} className="flex items-center space-x-2">
                <Checkbox
                  id={perm}
                  checked={policyConfig.permissions?.includes(perm) || false}
                  onCheckedChange={(checked) => {
                    const permissions = policyConfig.permissions || []
                    setPolicyConfig({
                      ...policyConfig,
                      permissions: checked 
                        ? [...permissions, perm]
                        : permissions.filter((p: string) => p !== perm)
                    })
                  }}
                />
                <Label htmlFor={perm} className="text-sm">{perm}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Approval Limit</Label>
          <Input
            type="number"
            placeholder="1000"
            value={policyConfig.approvalLimit || ''}
            onChange={(e) => setPolicyConfig({...policyConfig, approvalLimit: parseInt(e.target.value)})}
          />
          <p className="text-xs text-muted-foreground">
            Maximum amount this role can approve without escalation
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderFinancialApproverConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle>Financial Approval Settings</CardTitle>
        <CardDescription>Configure approval limits and transaction types</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Maximum Approval Amount</Label>
            <Input
              type="number"
              placeholder="5000"
              value={policyConfig.maxApprovalAmount || ''}
              onChange={(e) => setPolicyConfig({...policyConfig, maxApprovalAmount: parseInt(e.target.value)})}
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox
              id="secondApproval"
              checked={policyConfig.requiresSecondApproval || false}
              onCheckedChange={(checked) => setPolicyConfig({...policyConfig, requiresSecondApproval: checked})}
            />
            <Label htmlFor="secondApproval" className="text-sm">Requires second approval above 50%</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Transaction Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Purchase Orders', 'Vendor Payments', 'Expense Reports', 'Budget Transfers', 'Asset Purchases', 'Refunds'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={policyConfig.transactionTypes?.includes(type) || false}
                  onCheckedChange={(checked) => {
                    const types = policyConfig.transactionTypes || []
                    setPolicyConfig({
                      ...policyConfig,
                      transactionTypes: checked 
                        ? [...types, type]
                        : types.filter((t: string) => t !== type)
                    })
                  }}
                />
                <Label htmlFor={type} className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStoreOperationsConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle>Store Operations Access</CardTitle>
        <CardDescription>Configure store locations and operations for this role</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Store Locations</Label>
          <div className="grid grid-cols-1 gap-2">
            {['Downtown Branch', 'Mall Location', 'Airport Store', 'Suburb Branch', 'All Locations'].map(location => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={location}
                  checked={policyConfig.storeLocations?.includes(location) || false}
                  onCheckedChange={(checked) => {
                    const locations = policyConfig.storeLocations || []
                    setPolicyConfig({
                      ...policyConfig,
                      storeLocations: checked 
                        ? [...locations, location]
                        : locations.filter((l: string) => l !== location)
                    })
                  }}
                />
                <Label htmlFor={location} className="text-sm">{location}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Store Operations</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Manage Inventory', 'Process Sales', 'Handle Returns', 'Generate Reports', 'Modify Prices', 'Access POS'].map(op => (
              <div key={op} className="flex items-center space-x-2">
                <Checkbox
                  id={op}
                  checked={policyConfig.operations?.includes(op) || false}
                  onCheckedChange={(checked) => {
                    const operations = policyConfig.operations || []
                    setPolicyConfig({
                      ...policyConfig,
                      operations: checked 
                        ? [...operations, op]
                        : operations.filter((o: string) => o !== op)
                    })
                  }}
                />
                <Label htmlFor={op} className="text-sm">{op}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="restrictLocation"
            checked={policyConfig.restrictToAssignedLocation || false}
            onCheckedChange={(checked) => setPolicyConfig({...policyConfig, restrictToAssignedLocation: checked})}
          />
          <Label htmlFor="restrictLocation" className="text-sm">Restrict to assigned location only</Label>
        </div>
      </CardContent>
    </Card>
  )

  const renderInventoryManagementConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management Access</CardTitle>
        <CardDescription>Configure inventory operations and stock categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Inventory Operations</Label>
          <div className="grid grid-cols-2 gap-2">
            {['View Stock', 'Adjust Levels', 'Receive Goods', 'Issue Stock', 'Conduct Audits', 'Set Reorder Points'].map(op => (
              <div key={op} className="flex items-center space-x-2">
                <Checkbox
                  id={op}
                  checked={policyConfig.inventoryOperations?.includes(op) || false}
                  onCheckedChange={(checked) => {
                    const operations = policyConfig.inventoryOperations || []
                    setPolicyConfig({
                      ...policyConfig,
                      inventoryOperations: checked 
                        ? [...operations, op]
                        : operations.filter((o: string) => o !== op)
                    })
                  }}
                />
                <Label htmlFor={op} className="text-sm">{op}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Stock Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Food & Beverages', 'Cleaning Supplies', 'Office Supplies', 'Equipment', 'All Categories'].map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={policyConfig.stockCategories?.includes(category) || false}
                  onCheckedChange={(checked) => {
                    const categories = policyConfig.stockCategories || []
                    setPolicyConfig({
                      ...policyConfig,
                      stockCategories: checked 
                        ? [...categories, category]
                        : categories.filter((c: string) => c !== category)
                    })
                  }}
                />
                <Label htmlFor={category} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Adjustment Limit</Label>
          <Input
            type="number"
            placeholder="500"
            value={policyConfig.adjustmentLimit || ''}
            onChange={(e) => setPolicyConfig({...policyConfig, adjustmentLimit: parseInt(e.target.value)})}
          />
          <p className="text-xs text-muted-foreground">
            Maximum value of inventory adjustments without approval
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderVendorManagementConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Management Access</CardTitle>
        <CardDescription>Configure vendor operations and vendor types</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Vendor Operations</Label>
          <div className="grid grid-cols-2 gap-2">
            {['View Profiles', 'Create Vendors', 'Edit Details', 'Manage Communications', 'Process Payments', 'Generate Reports'].map(op => (
              <div key={op} className="flex items-center space-x-2">
                <Checkbox
                  id={op}
                  checked={policyConfig.vendorOperations?.includes(op) || false}
                  onCheckedChange={(checked) => {
                    const operations = policyConfig.vendorOperations || []
                    setPolicyConfig({
                      ...policyConfig,
                      vendorOperations: checked 
                        ? [...operations, op]
                        : operations.filter((o: string) => o !== op)
                    })
                  }}
                />
                <Label htmlFor={op} className="text-sm">{op}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Vendor Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Food Suppliers', 'Equipment Vendors', 'Service Providers', 'Maintenance Contractors', 'All Types'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={policyConfig.vendorTypes?.includes(type) || false}
                  onCheckedChange={(checked) => {
                    const types = policyConfig.vendorTypes || []
                    setPolicyConfig({
                      ...policyConfig,
                      vendorTypes: checked 
                        ? [...types, type]
                        : types.filter((t: string) => t !== type)
                    })
                  }}
                />
                <Label htmlFor={type} className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="approveVendors"
            checked={policyConfig.canApproveVendors || false}
            onCheckedChange={(checked) => setPolicyConfig({...policyConfig, canApproveVendors: checked})}
          />
          <Label htmlFor="approveVendors" className="text-sm">Can approve new vendors</Label>
        </div>
      </CardContent>
    </Card>
  )

  const renderShiftOperationsConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle>Shift Operations Access</CardTitle>
        <CardDescription>Configure shift schedules and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Active Shifts</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Morning Shift', 'Afternoon Shift', 'Night Shift', 'Weekend Shifts', 'Holiday Shifts', 'All Shifts'].map(shift => (
              <div key={shift} className="flex items-center space-x-2">
                <Checkbox
                  id={shift}
                  checked={policyConfig.activeShifts?.includes(shift) || false}
                  onCheckedChange={(checked) => {
                    const shifts = policyConfig.activeShifts || []
                    setPolicyConfig({
                      ...policyConfig,
                      activeShifts: checked 
                        ? [...shifts, shift]
                        : shifts.filter((s: string) => s !== shift)
                    })
                  }}
                />
                <Label htmlFor={shift} className="text-sm">{shift}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Shift Permissions</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Manage Operations', 'Handle Emergencies', 'Access Safe', 'Override Transactions', 'Generate Reports', 'Manage Staff'].map(perm => (
              <div key={perm} className="flex items-center space-x-2">
                <Checkbox
                  id={perm}
                  checked={policyConfig.shiftPermissions?.includes(perm) || false}
                  onCheckedChange={(checked) => {
                    const permissions = policyConfig.shiftPermissions || []
                    setPolicyConfig({
                      ...policyConfig,
                      shiftPermissions: checked 
                        ? [...permissions, perm]
                        : permissions.filter((p: string) => p !== perm)
                    })
                  }}
                />
                <Label htmlFor={perm} className="text-sm">{perm}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowOverrides"
            checked={policyConfig.allowOverrides || false}
            onCheckedChange={(checked) => setPolicyConfig({...policyConfig, allowOverrides: checked})}
          />
          <Label htmlFor="allowOverrides" className="text-sm">Allow manager overrides outside shift hours</Label>
        </div>
      </CardContent>
    </Card>
  )

  const renderReview = () => {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStep('configure')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Configure
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Review Role-Based Policy</h2>
            <p className="text-muted-foreground">Review your role configuration before creating</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role Name:</span>
                    <span className="font-medium">{policyConfig.roleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role ID:</span>
                    <span className="font-mono text-sm">{policyConfig.roleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <span className="font-medium">{template.title}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTemplate === 'department-role' && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Departments</h4>
                        <div className="flex flex-wrap gap-2">
                          {(policyConfig.departments || []).map((dept: string) => (
                            <Badge key={dept} variant="outline">{dept}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Permissions</h4>
                        <div className="flex flex-wrap gap-2">
                          {(policyConfig.permissions || []).map((perm: string) => (
                            <Badge key={perm} variant="secondary">{perm}</Badge>
                          ))}
                        </div>
                      </div>
                      {policyConfig.approvalLimit && (
                        <div>
                          <h4 className="font-medium mb-2">Approval Limit</h4>
                          <p className="text-muted-foreground">${policyConfig.approvalLimit?.toLocaleString()}</p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedTemplate === 'financial-approver' && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Maximum Approval Amount</h4>
                        <p className="text-muted-foreground">${policyConfig.maxApprovalAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Transaction Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {(policyConfig.transactionTypes || []).map((type: string) => (
                            <Badge key={type} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>
                      {policyConfig.requiresSecondApproval && (
                        <div>
                          <h4 className="font-medium mb-2">Second Approval</h4>
                          <p className="text-muted-foreground">Required for amounts above 50% of limit</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Role-based access control</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>No complex conditions</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Easy to understand</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Simple to maintain</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Policy will be created and enabled</p>
                <p>• Users with this role will get these permissions</p>
                <p>• Changes take effect immediately</p>
                <p>• You can edit or disable anytime</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onPolicyCreate(policyConfig)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Role-Based Policy
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {step === 'template' && renderTemplateSelection()}
      {step === 'configure' && renderConfiguration()}
      {step === 'review' && renderReview()}
    </div>
  )
}