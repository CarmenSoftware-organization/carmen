'use client';

import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter,
  Check, 
  X,
  Info,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Role } from '@/lib/types/permissions';
import { ResourceType, StandardAction } from '@/lib/types/permission-resources';
import { allMockPolicies } from '@/lib/mock-data/permission-policies';

interface PermissionEntry {
  resourceType: ResourceType;
  action: StandardAction;
  granted: boolean;
  policyName: string;
  policyId: string;
  conditions?: string[];
  priority?: number;
}

interface PermissionDetailsTabProps {
  role: Role;
}

export function PermissionDetailsTab({ role }: PermissionDetailsTabProps) {
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Generate mock permission data based on role
  const mockPermissions: PermissionEntry[] = useMemo(() => {
    const permissions: PermissionEntry[] = [];
    // Mock policy assignments based on role type
    const rolePolicies = allMockPolicies.slice(0, Math.min(3, allMockPolicies.length));

    rolePolicies.forEach(policy => {
      // Add permissions based on policy name for demo purposes
      if (policy.name.toLowerCase().includes('admin')) {
        Object.values(ResourceType).forEach(resource => {
          Object.values(StandardAction).forEach(action => {
            permissions.push({
              resourceType: resource,
              action: action,
              granted: true,
              policyName: policy.name,
              policyId: policy.id,
              priority: policy.priority || 1000
            });
          });
        });
      } else if (policy.name.toLowerCase().includes('manager')) {
        const managerResources = [
          ResourceType.PURCHASE_REQUEST,
          ResourceType.PURCHASE_ORDER,
          ResourceType.INVENTORY_ITEM,
          ResourceType.USER,
          ResourceType.VENDOR
        ];
        
        managerResources.forEach(resource => {
          [StandardAction.VIEW, StandardAction.CREATE, StandardAction.UPDATE].forEach(action => {
            permissions.push({
              resourceType: resource,
              action: action,
              granted: true,
              policyName: policy.name,
              policyId: policy.id,
              priority: policy.priority || 800,
              conditions: action !== StandardAction.VIEW ? ['Department match'] : undefined
            });
          });
        });
      } else {
        const staffResources = [
          ResourceType.PURCHASE_REQUEST,
          ResourceType.INVENTORY_ITEM
        ];
        
        staffResources.forEach(resource => {
          permissions.push({
            resourceType: resource,
            action: StandardAction.VIEW,
            granted: true,
            policyName: policy.name,
            policyId: policy.id,
            priority: policy.priority || 500,
            conditions: ['Department match']
          });
          
          if (resource === ResourceType.PURCHASE_REQUEST) {
            permissions.push({
              resourceType: resource,
              action: StandardAction.CREATE,
              granted: true,
              policyName: policy.name,
              policyId: policy.id,
              priority: policy.priority || 500,
              conditions: ['Department match', 'Within daily limit']
            });
          }
        });
      }
    });

    return permissions;
  }, [role.id]);

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return mockPermissions;
    
    return mockPermissions.filter(perm =>
      (perm.resourceType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perm.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.policyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mockPermissions, searchTerm]);

  // Group permissions by policy
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionEntry[]> = {};
    
    filteredPermissions.forEach(perm => {
      const groupKey = perm.policyName;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(perm);
    });

    return groups;
  }, [filteredPermissions]);

  const getPermissionIcon = (permission: PermissionEntry) => {
    return permission.granted ? 
      <Check className="h-4 w-4 text-green-600" /> : 
      <X className="h-4 w-4 text-red-500" />;
  };

  const getPriorityBadge = (priority?: number) => {
    if (!priority) return <Badge variant="secondary" className="text-xs">Standard</Badge>;
    
    if (priority >= 900) {
      return <Badge className="text-xs bg-red-100 text-red-800">Critical</Badge>;
    } else if (priority >= 700) {
      return <Badge className="text-xs bg-orange-100 text-orange-800">High</Badge>;
    } else if (priority >= 500) {
      return <Badge className="text-xs bg-blue-100 text-blue-800">Medium</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Low</Badge>;
    }
  };

  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups(current => ({
      ...current,
      [groupName]: !current[groupName]
    }));
  };

  const getPermissionSummary = () => {
    const total = filteredPermissions.length;
    const granted = filteredPermissions.filter(p => p.granted).length;
    const denied = total - granted;
    
    return { total, granted, denied };
  };

  const { total, granted, denied } = getPermissionSummary();

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{granted}</div>
              <div className="text-sm text-muted-foreground">Granted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{denied}</div>
              <div className="text-sm text-muted-foreground">Denied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search permissions, actions, or policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Grouped
              </Button>
              <Button
                variant={viewMode === 'flat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('flat')}
              >
                <List className="mr-2 h-4 w-4" />
                Flat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Content */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            {viewMode === 'grouped' ? (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([policyName, permissions]) => (
                  <div key={policyName} className="border rounded-lg">
                    <Collapsible
                      open={expandedGroups[policyName] !== false}
                      onOpenChange={() => toggleGroupExpansion(policyName)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{policyName}</h3>
                            <Badge variant="outline">{permissions.length}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Badge className="text-xs bg-green-50 text-green-700">
                              {permissions.filter(p => p.granted).length} granted
                            </Badge>
                            <Badge className="text-xs bg-red-50 text-red-700">
                              {permissions.filter(p => !p.granted).length} denied
                            </Badge>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="border-t">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Resource</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Permission</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Conditions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {permissions.map((permission, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {(permission.resourceType || 'unknown_resource').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </TableCell>
                                  <TableCell>
                                    {(permission.action || 'unknown_action').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getPermissionIcon(permission)}
                                      <span className={permission.granted ? 'text-green-700' : 'text-red-700'}>
                                        {permission.granted ? 'Granted' : 'Denied'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getPriorityBadge(permission.priority)}
                                  </TableCell>
                                  <TableCell>
                                    {permission.conditions && permission.conditions.length > 0 ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                                            <Info className="h-3 w-3" />
                                            {permission.conditions.length} condition(s)
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="space-y-1 max-w-xs">
                                            {permission.conditions.map((condition, idx) => (
                                              <div key={idx} className="text-xs">{condition}</div>
                                            ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No conditions</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Conditions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.map((permission, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {(permission.resourceType || 'unknown_resource').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        {(permission.action || 'unknown_action').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPermissionIcon(permission)}
                          <span className={permission.granted ? 'text-green-700' : 'text-red-700'}>
                            {permission.granted ? 'Granted' : 'Denied'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{permission.policyName}</div>
                          <div className="text-xs text-muted-foreground">{permission.policyId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(permission.priority)}
                      </TableCell>
                      <TableCell>
                        {permission.conditions && permission.conditions.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                                <Info className="h-3 w-3" />
                                {permission.conditions.length} condition(s)
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1 max-w-xs">
                                {permission.conditions.map((condition, idx) => (
                                  <div key={idx} className="text-xs">{condition}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">No conditions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredPermissions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No permissions found matching your search criteria.
              </div>
            )}
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}