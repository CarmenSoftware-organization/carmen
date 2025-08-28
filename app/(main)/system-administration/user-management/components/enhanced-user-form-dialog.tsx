'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  User,
  UserPlus,
  Shield,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Info,
  X,
  Plus
} from 'lucide-react';

import { mockRoles, mockDepartments, mockLocations } from '@/lib/mock-data/permission-roles';
import { useRoleStore } from '@/lib/stores/role-store';
import { Role, Department, Location } from '@/lib/types/permissions';
import { Money } from '@/lib/types/user';

// Enhanced user form schema
const enhancedUserFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  businessUnit: z.string().min(1, 'Business unit is required'),
  department: z.string().min(1, 'Department is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  primaryRole: z.string().min(1, 'Primary role is required'),
  locations: z.array(z.string()).optional(),
  approvalLimit: z.object({
    amount: z.number().min(0),
    currency: z.string(),
  }).optional(),
  delegatedAuthorities: z.array(z.string()).optional(),
  specialPermissions: z.array(z.string()).optional(),
  clearanceLevel: z.enum(['basic', 'confidential', 'secret', 'top-secret']).optional(),
  effectiveFrom: z.date().optional(),
  effectiveTo: z.date().optional(),
  accountStatus: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active'),
  hodStatus: z.boolean().default(false),
  hodDepartments: z.array(z.string()).optional(),
});

type EnhancedUserFormData = z.infer<typeof enhancedUserFormSchema>;

interface EnhancedUser {
  id?: string;
  name: string;
  email: string;
  businessUnit: string;
  department: string;
  roles: string[];
  primaryRole: string;
  locations?: string[];
  approvalLimit?: {
    amount: number;
    currency: string;
  };
  delegatedAuthorities?: string[];
  specialPermissions?: string[];
  clearanceLevel?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  accountStatus: 'active' | 'inactive' | 'suspended' | 'pending';
  hodStatus: boolean;
  hodDepartments?: string[];
  lastLogin?: Date;
}

interface EnhancedUserFormDialogProps {
  user?: EnhancedUser;
  onSubmit: (user: Omit<EnhancedUser, 'id'>) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EnhancedUserFormDialog({
  user,
  onSubmit,
  trigger,
  open,
  onOpenChange,
}: EnhancedUserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { roles: availableRoles } = useRoleStore();
  const [availableDepartments] = useState(mockDepartments);
  const [availableLocations] = useState(mockLocations);

  const form = useForm<EnhancedUserFormData>({
    resolver: zodResolver(enhancedUserFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      businessUnit: user?.businessUnit || '',
      department: user?.department || '',
      roles: user?.roles || [],
      primaryRole: user?.primaryRole || '',
      locations: user?.locations || [],
      approvalLimit: user?.approvalLimit || { amount: 0, currency: 'USD' },
      delegatedAuthorities: user?.delegatedAuthorities || [],
      specialPermissions: user?.specialPermissions || [],
      clearanceLevel: (user?.clearanceLevel as any) || 'basic',
      effectiveFrom: user?.effectiveFrom,
      effectiveTo: user?.effectiveTo,
      accountStatus: user?.accountStatus || 'active',
      hodStatus: user?.hodStatus || false,
      hodDepartments: user?.hodDepartments || [],
    },
  });

  const watchedRoles = form.watch('roles') || [];
  const watchedPrimaryRole = form.watch('primaryRole');
  const watchedHodStatus = form.watch('hodStatus');

  // Use departments and locations from permission system

  const availableAuthorities = [
    'Purchase Request Approval',
    'Inventory Adjustments',
    'User Management',
    'Financial Reporting',
    'Recipe Modifications',
    'Vendor Contract Approval',
    'Quality Control Override',
    'System Configuration'
  ];

  const availableSpecialPermissions = [
    'Emergency Access Override',
    'Cross-Department Access',
    'Financial Data Access',
    'System Administration',
    'Audit Trail Access',
    'Data Export',
    'Recipe Confidential Access',
    'Vendor Sensitive Information'
  ];

  const getRoleName = (roleId: string) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  const handleRoleToggle = (roleId: string) => {
    const currentRoles = form.getValues('roles') || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    
    form.setValue('roles', newRoles);

    // If the primary role is being removed, clear it
    const currentPrimaryRole = form.getValues('primaryRole');
    if (currentPrimaryRole === roleId && !newRoles.includes(roleId)) {
      form.setValue('primaryRole', newRoles[0] || '');
    }
  };

  const handleSubmit = async (data: EnhancedUserFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data as any);
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEffectivePermissions = () => {
    const rolePermissions = watchedRoles.flatMap(roleId => {
      const role = availableRoles.find(r => r.id === roleId);
      return role?.permissions || [];
    });
    return [...new Set(rolePermissions)];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            {user ? 'Edit User' : 'Add New User'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <DialogTitle>
              {user ? 'Edit User - Enhanced Permissions' : 'Add New User - Enhanced Permissions'}
            </DialogTitle>
          </div>
          <DialogDescription>
            Configure user account with role assignments, permissions, and access controls
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="roles">Roles & Access</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="user@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Unit</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="operations">Operations</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="hr">Human Resources</SelectItem>
                                <SelectItem value="management">Management</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableDepartments.map(dept => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name} ({dept.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="locations"
                      render={() => (
                        <FormItem>
                          <FormLabel>Accessible Locations</FormLabel>
                          <FormDescription>
                            Select which locations this user can access
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {availableLocations.map((location) => (
                              <FormField
                                key={location.id}
                                control={form.control}
                                name="locations"
                                render={({ field }) => {
                                  return (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(location.id)}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            const updated = checked
                                              ? [...current, location.id]
                                              : current.filter(val => val !== location.id);
                                            field.onChange(updated);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {location.name} ({location.type})
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Roles & Access Tab */}
              <TabsContent value="roles" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Role Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem>
                          <FormLabel>Assigned Roles</FormLabel>
                          <FormDescription>
                            Select all roles that should be assigned to this user
                          </FormDescription>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {availableRoles.map((role) => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={role.id}
                                  checked={watchedRoles.includes(role.id)}
                                  onCheckedChange={() => handleRoleToggle(role.id)}
                                />
                                <label
                                  htmlFor={role.id}
                                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                                >
                                  <span>{role.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {role.hierarchy || 0}
                                  </Badge>
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Role</FormLabel>
                          <FormDescription>
                            Select the primary role for this user (must be one of the assigned roles)
                          </FormDescription>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={watchedRoles.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select primary role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {watchedRoles.map(roleId => {
                                const role = availableRoles.find(r => r.id === roleId);
                                return role ? (
                                  <SelectItem key={roleId} value={roleId}>
                                    {role.name}
                                  </SelectItem>
                                ) : null;
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedRoles.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Effective Permissions Preview</h4>
                        <div className="flex flex-wrap gap-1">
                          {getEffectivePermissions().slice(0, 10).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission.replace(/[._:]/g, ' ')}
                            </Badge>
                          ))}
                          {getEffectivePermissions().length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{getEffectivePermissions().length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Additional Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="approvalLimit.amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approval Limit ($)</FormLabel>
                          <FormDescription>
                            Maximum amount this user can approve in financial transactions
                          </FormDescription>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clearanceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clearance Level</FormLabel>
                          <FormDescription>
                            Security clearance level for accessing sensitive information
                          </FormDescription>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select clearance level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="confidential">Confidential</SelectItem>
                              <SelectItem value="secret">Secret</SelectItem>
                              <SelectItem value="top-secret">Top Secret</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delegatedAuthorities"
                      render={() => (
                        <FormItem>
                          <FormLabel>Delegated Authorities</FormLabel>
                          <FormDescription>
                            Special authorities delegated to this user
                          </FormDescription>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {availableAuthorities.map((authority) => (
                              <FormField
                                key={authority}
                                control={form.control}
                                name="delegatedAuthorities"
                                render={({ field }) => {
                                  const authorityId = authority.toLowerCase().replace(/\s+/g, '-');
                                  return (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(authorityId)}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            const updated = checked
                                              ? [...current, authorityId]
                                              : current.filter(val => val !== authorityId);
                                            field.onChange(updated);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {authority}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialPermissions"
                      render={() => (
                        <FormItem>
                          <FormLabel>Special Permissions</FormLabel>
                          <FormDescription>
                            Additional special permissions for this user
                          </FormDescription>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {availableSpecialPermissions.map((permission) => (
                              <FormField
                                key={permission}
                                control={form.control}
                                name="specialPermissions"
                                render={({ field }) => {
                                  const permissionId = permission.toLowerCase().replace(/\s+/g, '-');
                                  return (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(permissionId)}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            const updated = checked
                                              ? [...current, permissionId]
                                              : current.filter(val => val !== permissionId);
                                            field.onChange(updated);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {permission}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="accountStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="effectiveFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Effective From</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="effectiveTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Effective To</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="hodStatus"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Head of Department</FormLabel>
                            <FormDescription>
                              Enable if this user is a department head
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchedHodStatus && (
                      <FormField
                        control={form.control}
                        name="hodDepartments"
                        render={() => (
                          <FormItem>
                            <FormLabel>Head of Departments</FormLabel>
                            <FormDescription>
                              Select which departments this user leads
                            </FormDescription>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {availableDepartments.map((dept) => (
                                <FormField
                                  key={dept.id}
                                  control={form.control}
                                  name="hodDepartments"
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(dept.id)}
                                            onCheckedChange={(checked) => {
                                              const current = field.value || [];
                                              const updated = checked
                                                ? [...current, dept.id]
                                                : current.filter(val => val !== dept.id);
                                              field.onChange(updated);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {dept.name} ({dept.code})
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}