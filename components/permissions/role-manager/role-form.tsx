'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Save, 
  X, 
  Users, 
  Shield, 
  Crown, 
  User, 
  Building,
  Briefcase,
  Plus,
  Minus,
  Info
} from 'lucide-react';

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
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useRoleStore } from '@/lib/stores/role-store';
import { mockDepartments, mockLocations } from '@/lib/mock-data/permission-roles';
import { Role } from '@/lib/types/permissions';

// Form schema for role creation/editing
const roleFormSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  hierarchy: z.number().min(0).max(1000).default(100),
  parentRoles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  maxUsers: z.number().min(0).optional(),
  requiresApproval: z.boolean().default(false),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Role;
  onSave: (data: RoleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleForm({ role, onSave, onCancel, isLoading = false }: RoleFormProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions || []
  );

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      hierarchy: role?.hierarchy || 100,
      parentRoles: role?.parentRoles || [],
      permissions: role?.permissions || [],
      departments: [],
      locations: [],
      isActive: true,
      maxUsers: undefined,
      requiresApproval: false,
    }
  });

  const watchedHierarchy = form.watch('hierarchy');
  const watchedParentRoles = form.watch('parentRoles') || [];

  // Available parent roles (exclude the current role and its children)
  const { roles } = useRoleStore();
  const availableParentRoles = roles.filter(r => 
    r.id !== role?.id && 
    (r.hierarchy || 0) >= (watchedHierarchy || 0)
  );

  // Available permissions (mock data)
  const availablePermissions = [
    'user.create', 'user.read', 'user.update', 'user.delete',
    'role.create', 'role.read', 'role.update', 'role.delete',
    'policy.create', 'policy.read', 'policy.update', 'policy.delete',
    'purchase_request.create', 'purchase_request.read', 'purchase_request.approve',
    'inventory.read', 'inventory.update', 'inventory.count',
    'vendor.create', 'vendor.read', 'vendor.update',
    'product.create', 'product.read', 'product.update',
    'report.generate', 'report.read', 'report.export'
  ];

  const getRoleIcon = (hierarchy?: number) => {
    const level = hierarchy || 0;
    if (level >= 900) return <Crown className="h-4 w-4 text-amber-500" />;
    if (level >= 700) return <Shield className="h-4 w-4 text-blue-500" />;
    if (level >= 400) return <Briefcase className="h-4 w-4 text-green-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getHierarchyLabel = (hierarchy?: number) => {
    const level = hierarchy || 0;
    if (level >= 900) return 'Executive Level';
    if (level >= 700) return 'Management Level';
    if (level >= 400) return 'Supervisor Level';
    return 'Staff Level';
  };

  const getHierarchyBadge = (hierarchy?: number) => {
    const level = hierarchy || 0;
    if (level >= 900) return <Badge variant="destructive" className="text-xs">Executive</Badge>;
    if (level >= 700) return <Badge variant="default" className="text-xs">Management</Badge>;
    if (level >= 400) return <Badge className="text-xs bg-orange-100 text-orange-800">Supervisor</Badge>;
    return <Badge variant="secondary" className="text-xs">Staff</Badge>;
  };

  const handlePermissionToggle = (permission: string) => {
    const currentPermissions = form.getValues('permissions') || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    form.setValue('permissions', newPermissions);
    setSelectedPermissions(newPermissions);
  };

  const handleParentRoleToggle = (roleId: string) => {
    const currentParents = form.getValues('parentRoles') || [];
    const newParents = currentParents.includes(roleId)
      ? currentParents.filter(id => id !== roleId)
      : [...currentParents, roleId];
    
    form.setValue('parentRoles', newParents);
  };

  const onSubmit = (data: RoleFormData) => {
    onSave({
      ...data,
      permissions: selectedPermissions
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <p className="text-muted-foreground">
            {role ? 'Modify role settings and permissions' : 'Define a new role with its permissions and hierarchy'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {watchedHierarchy !== undefined && (
            <div className="flex items-center gap-2">
              {getRoleIcon(watchedHierarchy)}
              {getHierarchyBadge(watchedHierarchy)}
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Department Manager" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for the role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Manages department operations, approves purchases up to $25,000, supervises staff"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the role's responsibilities
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Role</FormLabel>
                        <FormDescription>
                          Whether this role is active and can be assigned to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requires Approval</FormLabel>
                        <FormDescription>
                          Whether assignment to this role requires admin approval
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy and Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>Hierarchy and Relationships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hierarchy"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Hierarchy Level</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              <div>900+: Executive Level (CEO, Directors)</div>
                              <div>700-899: Management Level (Managers, Department Heads)</div>
                              <div>400-699: Supervisor Level (Team Leads, Supervisors)</div>
                              <div>0-399: Staff Level (Regular employees)</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="space-y-3">
                      <FormControl>
                        <Slider
                          min={0}
                          max={1000}
                          step={10}
                          value={[field.value || 100]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(field.value)}
                          <span className="font-medium">{field.value || 100}</span>
                          <span className="text-muted-foreground">({getHierarchyLabel(field.value)})</span>
                        </div>
                        {getHierarchyBadge(field.value)}
                      </div>
                    </div>
                    <FormDescription>
                      Higher values indicate higher authority and broader permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentRoles"
                render={() => (
                  <FormItem>
                    <FormLabel>Parent Roles (Inherits From)</FormLabel>
                    <FormDescription>
                      Select roles that this role should inherit permissions from
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableParentRoles.map((parentRole) => (
                        <div key={parentRole.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={parentRole.id}
                            checked={watchedParentRoles.includes(parentRole.id)}
                            onCheckedChange={() => handleParentRoleToggle(parentRole.id)}
                          />
                          <label
                            htmlFor={parentRole.id}
                            className="text-sm font-normal cursor-pointer flex items-center gap-2"
                          >
                            {getRoleIcon(parentRole.hierarchy)}
                            <span>{parentRole.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {parentRole.hierarchy || 0}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                    {watchedParentRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {watchedParentRoles.map((roleId) => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? (
                            <Badge key={roleId} variant="secondary" className="text-xs">
                              {role.name}
                              <X 
                                className="h-3 w-3 ml-1 cursor-pointer" 
                                onClick={() => handleParentRoleToggle(roleId)}
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Direct Permissions</FormLabel>
                    <FormDescription>
                      Select specific permissions for this role (in addition to inherited permissions)
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={() => handlePermissionToggle(permission)}
                          />
                          <label
                            htmlFor={permission}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedPermissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedPermissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.replace(/[._]/g, ' ')}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => handlePermissionToggle(permission)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="maxUsers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Users</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="No limit"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of users that can be assigned to this role (leave empty for no limit)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}