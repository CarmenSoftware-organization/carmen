'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  ChevronRight,
  ChevronDown,
  Crown,
  Shield,
  User,
  Building,
  Briefcase,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Filter,
  UserPlus,
  UserMinus,
  RefreshCw,
  FileText,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

import { useRoleStore } from '@/lib/stores/role-store';
import { Role } from '@/lib/types/permissions';

interface RoleListProps {
  onCreateRole?: () => void;
  onEditRole?: (roleId: string) => void;
  onViewRole?: (roleId: string) => void;
  onAssignUsers?: (roleId: string) => void;
  onExportRoles?: (roleIds?: string[]) => void;
  onBulkDelete?: (roleIds: string[]) => void;
}

interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];
  userCount: number;
}

export function RoleList({ 
  onCreateRole, 
  onEditRole, 
  onViewRole, 
  onAssignUsers, 
  onExportRoles, 
  onBulkDelete 
}: RoleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [filterBy, setFilterBy] = useState<'all' | 'system' | 'custom' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'hierarchy' | 'users' | 'permissions'>('name');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'table'>('hierarchy');

  // Use the role store for synchronized data
  const { roles, deleteRole } = useRoleStore();

  // Mock user counts per role (mapped to actual role IDs from permission-roles.ts)
  const mockUserCounts: Record<string, number> = {
    'role-001': 2,  // System Administrator
    'role-002': 3,  // General Manager
    'role-003': 2,  // Finance Director
    'role-004': 4,  // Procurement Manager
    'role-005': 12, // Department Manager
    'role-006': 6,  // Warehouse Manager
    'role-007': 8,  // Executive Chef
    'role-008': 5,  // Financial Manager
    'role-009': 15, // Purchasing Agent
    'role-010': 8,  // Inventory Supervisor
    'role-011': 18, // Kitchen Staff
    'role-012': 12, // Warehouse Staff
    'role-013': 25, // Store Staff
    'role-014': 3,  // Quality Controller
    'role-015': 3,  // Auditor
    'role-016': 5,  // Analyst
    'role-017': 4,  // IT Support
    'role-018': 7,  // Accountant
    'role-019': 6,  // Intern
    'role-020': 8   // Contractor
  };

  // Enhanced role hierarchy with filtering
  const filteredAndSortedRoles = useMemo(() => {
    let filteredRoles = roles.filter(role => {
      // Search filter
      const matchesSearch = !searchTerm || 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'system' && role.isSystem) ||
        (filterBy === 'custom' && !role.isSystem) ||
        (filterBy === 'active' && (role.permissions && role.permissions.length > 0)) ||
        (filterBy === 'inactive' && (!role.permissions || role.permissions.length === 0));
      
      return matchesSearch && matchesFilter;
    });

    // Sort roles
    filteredRoles.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'hierarchy':
          return (b.hierarchy || 0) - (a.hierarchy || 0);
        case 'users':
          return (mockUserCounts[b.id] || 0) - (mockUserCounts[a.id] || 0);
        case 'permissions':
          return (b.permissions?.length || 0) - (a.permissions?.length || 0);
        default:
          return 0;
      }
    });

    return filteredRoles;
  }, [searchTerm, filterBy, sortBy]);

  // Build role hierarchy
  const roleHierarchy = useMemo(() => {
    const buildHierarchy = (parentId?: string): RoleHierarchy[] => {
      return filteredAndSortedRoles
        .filter(role => 
          parentId 
            ? role.parentRoles?.includes(parentId)
            : !role.parentRoles || role.parentRoles.length === 0
        )
        .map(role => ({
          role,
          children: buildHierarchy(role.id),
          userCount: mockUserCounts[role.id] || 0
        }));
    };

    return buildHierarchy();
  }, [filteredAndSortedRoles]);

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('Director') || roleName.includes('GM')) {
      return <Crown className="h-4 w-4 text-amber-500" />;
    } else if (roleName.includes('Manager')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    } else if (roleName.includes('Chef') || roleName.includes('Head')) {
      return <Briefcase className="h-4 w-4 text-green-500" />;
    } else if (roleName.includes('Admin')) {
      return <Users className="h-4 w-4 text-purple-500" />;
    } else {
      return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRolePriorityBadge = (hierarchy?: number) => {
    const priority = hierarchy || 0;
    
    if (priority >= 900) {
      return <Badge variant="destructive" className="text-xs">Executive</Badge>;
    } else if (priority >= 700) {
      return <Badge variant="default" className="text-xs">Management</Badge>;
    } else if (priority >= 400) {
      return <Badge className="text-xs bg-orange-100 text-orange-800">Supervisor</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Staff</Badge>;
    }
  };

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(current => ({
      ...current,
      [roleId]: !current[roleId]
    }));
  };

  const handleDeleteRole = (roleId: string) => {
    setRoleToDelete(roleId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete);
      console.log('Role deleted:', roleToDelete);
    }
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleDuplicateRole = (roleId: string) => {
    // In a real app, this would create a copy of the role
    console.log('Duplicating role:', roleId);
  };

  const handleSelectRole = (roleId: string, selected: boolean) => {
    setSelectedRoles(current => {
      const newSet = new Set(current);
      if (selected) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRoles(new Set(filteredAndSortedRoles.map(role => role.id)));
    } else {
      setSelectedRoles(new Set());
    }
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'assign') => {
    const roleIds = Array.from(selectedRoles);
    switch (action) {
      case 'delete':
        onBulkDelete?.(roleIds);
        break;
      case 'export':
        onExportRoles?.(roleIds);
        break;
      case 'assign':
        // Handle bulk user assignment
        console.log('Bulk assign users to roles:', roleIds);
        break;
    }
  };

  const handleAssignUsers = (roleId: string) => {
    onAssignUsers?.(roleId);
  };

  const handleExportRoles = () => {
    const roleIds = selectedRoles.size > 0 ? Array.from(selectedRoles) : undefined;
    onExportRoles?.(roleIds);
  };

  const handleRefreshRoles = () => {
    // In a real app, this would refresh the roles data from the API
    console.log('Refreshing roles data...');
    // Reset selections on refresh
    setSelectedRoles(new Set());
  };

  const renderRoleHierarchy = (hierarchyItems: RoleHierarchy[], level = 0) => {
    return hierarchyItems.map(({ role, children, userCount }) => (
      <div key={role.id} className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
            level > 0 ? 'ml-6 border-l-2 border-l-muted' : ''
          } ${selectedRoles.has(role.id) ? 'bg-primary/5 border-primary/20' : ''}`}
        >
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={selectedRoles.has(role.id)}
              onCheckedChange={(checked) => handleSelectRole(role.id, checked as boolean)}
            />
            
            {children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleRoleExpansion(role.id)}
              >
                {expandedRoles[role.id] ? 
                  <ChevronDown className="h-3 w-3" /> : 
                  <ChevronRight className="h-3 w-3" />
                }
              </Button>
            )}
            
            {getRoleIcon(role.name)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{role.name}</h4>
                {getRolePriorityBadge(role.hierarchy)}
                {role.isSystem && (
                  <Badge variant="outline" className="text-xs">
                    System
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {role.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{userCount} users</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Active users assigned to this role</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">
                      {role.permissions?.length || 0} permissions
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Direct permissions assigned to this role</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {children.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs">
                        {children.length} child roles
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Roles that inherit from this role</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewRole?.(role.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditRole?.(role.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAssignUsers(role.id)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicateRole(role.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteRole(role.id)}
                  className="text-destructive"
                  disabled={userCount > 0 || role.isSystem}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {children.length > 0 && expandedRoles[role.id] && (
          <div className="space-y-2">
            {renderRoleHierarchy(children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshRoles}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportRoles}>
            <Download className="mr-2 h-4 w-4" />
            Export Roles
          </Button>
          <Button onClick={onCreateRole}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Controls */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="system">System Roles</SelectItem>
                    <SelectItem value="custom">Custom Roles</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="hierarchy">Sort by Level</SelectItem>
                    <SelectItem value="users">Sort by Users</SelectItem>
                    <SelectItem value="permissions">Sort by Permissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'hierarchy' ? 'table' : 'hierarchy')}
                >
                  {viewMode === 'hierarchy' ? <BarChart3 className="h-4 w-4 mr-2" /> : <Building className="h-4 w-4 mr-2" />}
                  {viewMode === 'hierarchy' ? 'Table View' : 'Hierarchy View'}
                </Button>
                
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Bulk Actions Row */}
            {selectedRoles.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedRoles.size} role{selectedRoles.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('assign')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Users
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleBulkAction('delete')}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedRoles(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}
            
            {/* Stats Row */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>{roles.filter(r => (r.hierarchy || 0) >= 900).length} Executive</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>{roles.filter(r => (r.hierarchy || 0) >= 700 && (r.hierarchy || 0) < 900).length} Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-500" />
                <span>{roles.filter(r => (r.hierarchy || 0) >= 400 && (r.hierarchy || 0) < 700).length} Supervisor</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{roles.filter(r => (r.hierarchy || 0) < 400).length} Staff</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>{Object.values(mockUserCounts).reduce((a, b) => a + b, 0)} Total Users</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role Hierarchy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {viewMode === 'hierarchy' ? 'Role Hierarchy' : 'Role List'}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={selectedRoles.size > 0 && selectedRoles.size === filteredAndSortedRoles.length}
                  indeterminate={selectedRoles.size > 0 && selectedRoles.size < filteredAndSortedRoles.length}
                  onCheckedChange={handleSelectAll}
                />
                <span>Select All</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {roleHierarchy.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No roles found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? 'No roles match your current search or filter criteria.' 
                  : 'No roles have been created yet.'}
              </p>
              {!searchTerm && filterBy === 'all' && (
                <Button onClick={onCreateRole}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Role
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {renderRoleHierarchy(roleHierarchy)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{roles.length}</div>
                <div className="text-sm text-muted-foreground">Total Roles</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roles.filter(r => r.isSystem).length} system, {roles.filter(r => !r.isSystem).length} custom
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(mockUserCounts).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Assigned Users</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Active assignments
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {roles.reduce((total, role) => total + (role.permissions?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Permissions</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Across all roles
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {roles.filter(r => !mockUserCounts[r.id] || mockUserCounts[r.id] === 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Unassigned Roles</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roles.filter(r => !mockUserCounts[r.id] || mockUserCounts[r.id] === 0).length === 0 
                    ? <CheckCircle2 className="h-3 w-3 inline mr-1 text-green-600" />
                    : <AlertTriangle className="h-3 w-3 inline mr-1 text-yellow-600" />}
                  {roles.filter(r => !mockUserCounts[r.id] || mockUserCounts[r.id] === 0).length === 0 
                    ? 'All assigned' 
                    : 'Need attention'}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                roles.filter(r => !mockUserCounts[r.id] || mockUserCounts[r.id] === 0).length === 0 
                  ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {roles.filter(r => !mockUserCounts[r.id] || mockUserCounts[r.id] === 0).length === 0 
                  ? <CheckCircle2 className="h-6 w-6 text-green-600" />
                  : <AlertTriangle className="h-6 w-6 text-yellow-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">By Hierarchy Level</h4>
              {[
                { label: 'Executive', count: roles.filter(r => (r.hierarchy || 0) >= 900).length, color: 'bg-amber-500', users: Object.entries(mockUserCounts).filter(([id]) => roles.find(r => r.id === id && (r.hierarchy || 0) >= 900)).reduce((sum, [_, count]) => sum + count, 0) },
                { label: 'Management', count: roles.filter(r => (r.hierarchy || 0) >= 700 && (r.hierarchy || 0) < 900).length, color: 'bg-blue-500', users: Object.entries(mockUserCounts).filter(([id]) => roles.find(r => r.id === id && (r.hierarchy || 0) >= 700 && (r.hierarchy || 0) < 900)).reduce((sum, [_, count]) => sum + count, 0) },
                { label: 'Supervisor', count: roles.filter(r => (r.hierarchy || 0) >= 400 && (r.hierarchy || 0) < 700).length, color: 'bg-green-500', users: Object.entries(mockUserCounts).filter(([id]) => roles.find(r => r.id === id && (r.hierarchy || 0) >= 400 && (r.hierarchy || 0) < 700)).reduce((sum, [_, count]) => sum + count, 0) },
                { label: 'Staff', count: roles.filter(r => (r.hierarchy || 0) < 400).length, color: 'bg-gray-500', users: Object.entries(mockUserCounts).filter(([id]) => roles.find(r => r.id === id && (r.hierarchy || 0) < 400)).reduce((sum, [_, count]) => sum + count, 0) }
              ].map((level) => (
                <div key={level.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded ${level.color}`} />
                    <span className="text-sm">{level.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{level.count} roles</span>
                    <span className="text-sm font-medium">{level.users} users</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Top Roles by User Count</h4>
              {Object.entries(mockUserCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([roleId, userCount]) => {
                  const role = roles.find(r => r.id === roleId);
                  if (!role) return null;
                  return (
                    <div key={roleId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getRoleIcon(role.name)}
                        <span className="text-sm truncate">{role.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(userCount / Math.max(...Object.values(mockUserCounts))) * 100} 
                          className="w-16"
                        />
                        <span className="text-sm font-medium w-8 text-right">{userCount}</span>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role and 
              remove it from the system. Users assigned to this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole} className="bg-destructive text-destructive-foreground">
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}