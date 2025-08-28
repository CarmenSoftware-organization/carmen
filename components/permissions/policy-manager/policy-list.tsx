'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { allMockPolicies } from '@/lib/mock-data/permission-policies';
import { Policy, EffectType } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';

interface PolicyListProps {
  onCreatePolicy?: () => void;
  onEditPolicy?: (policyId: string) => void;
  onViewPolicy?: (policyId: string) => void;
  onTestPolicy?: (policyId: string) => void;
  onClonePolicy?: (policyId: string) => void;
  onToggleStatus?: (policyId: string, enabled: boolean) => void;
}

interface SortConfig {
  field: keyof Policy | 'status' | 'resourceType';
  direction: 'asc' | 'desc';
}

export function PolicyList({ 
  onCreatePolicy, 
  onEditPolicy, 
  onViewPolicy, 
  onTestPolicy,
  onClonePolicy,
  onToggleStatus 
}: PolicyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

  // Extract resource type from policy target
  const getResourceType = (policy: Policy): string => {
    const resourceConstraint = policy.target.resources?.find(r => 
      r.attribute === 'resourceType'
    );
    if (resourceConstraint?.value && typeof resourceConstraint.value === 'string') {
      return resourceConstraint.value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'General';
  };

  // Get policy status
  const getPolicyStatus = (policy: Policy): string => {
    return policy.enabled ? 'Active' : 'Disabled';
  };

  // Filter and sort policies
  const filteredAndSortedPolicies = useMemo(() => {
    let filtered = allMockPolicies.filter(policy =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort policies
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'status':
          aValue = getPolicyStatus(a);
          bValue = getPolicyStatus(b);
          break;
        case 'resourceType':
          aValue = getResourceType(a);
          bValue = getResourceType(b);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a[sortConfig.field as keyof Policy];
          bValue = b[sortConfig.field as keyof Policy];
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle boolean enabled field
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortConfig.direction === 'asc'
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      return 0;
    });

    return filtered;
  }, [searchTerm, sortConfig]);

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    setSelectedPolicies(
      selectedPolicies.length === filteredAndSortedPolicies.length
        ? []
        : filteredAndSortedPolicies.map(p => p.id)
    );
  };

  const handleSelectPolicy = (policyId: string) => {
    setSelectedPolicies(current =>
      current.includes(policyId)
        ? current.filter(id => id !== policyId)
        : [...current, policyId]
    );
  };

  const handleDuplicatePolicy = (policyId: string) => {
    onClonePolicy?.(policyId);
  };

  const handleTestPolicy = (policyId: string) => {
    onTestPolicy?.(policyId);
  };

  const handleTogglePolicyStatus = (policyId: string) => {
    const policy = allMockPolicies.find(p => p.id === policyId);
    if (policy) {
      onToggleStatus?.(policyId, !policy.enabled);
    }
  };

  // Mock health indicators - in real app would come from API
  const getPolicyHealth = (policy: Policy) => {
    // Mock performance data based on policy characteristics
    const baseScore = policy.enabled ? 85 : 50;
    const priorityBonus = Math.min(policy.priority / 10, 15);
    const complexityPenalty = policy.rules.length > 3 ? -10 : 0;
    const score = Math.max(0, Math.min(100, baseScore + priorityBonus + complexityPenalty));
    
    return {
      score,
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      evaluations: Math.floor(Math.random() * 1000) + 100,
      avgResponseTime: Math.floor(Math.random() * 50) + 5,
      successRate: Math.floor(Math.random() * 10) + 90
    };
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getPerformanceTrend = () => {
    const trends = ['up', 'down', 'stable'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const handleDeletePolicy = (policyId: string) => {
    setPolicyToDelete(policyId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePolicy = () => {
    if (policyToDelete) {
      // In a real app, this would call an API to delete the policy
      console.log('Deleting policy:', policyToDelete);
      setSelectedPolicies(current => current.filter(id => id !== policyToDelete));
    }
    setDeleteDialogOpen(false);
    setPolicyToDelete(null);
  };

  const handleBulkAction = (action: 'enable' | 'disable' | 'delete' | 'export') => {
    console.log(`Bulk ${action} for policies:`, selectedPolicies);
    
    if (action === 'export') {
      // Export selected policies as JSON
      const selectedPolicyData = allMockPolicies.filter(p => selectedPolicies.includes(p.id));
      const dataStr = JSON.stringify(selectedPolicyData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'policies.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }

    // Clear selection after action
    setSelectedPolicies([]);
  };

  const getEffectBadge = (effect: EffectType) => {
    return (
      <Badge 
        variant={effect === 'permit' ? 'default' : 'destructive'}
        className="text-xs"
      >
        {effect.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (enabled: boolean) => {
    return (
      <Badge 
        variant={enabled ? 'default' : 'secondary'}
        className="text-xs"
      >
        <div className="flex items-center gap-1">
          {enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {enabled ? 'Enabled' : 'Disabled'}
        </div>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">

      {/* Search and Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {selectedPolicies.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedPolicies.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('enable')}
                >
                  Enable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('disable')}
                >
                  Disable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Policy Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPolicies.length === filteredAndSortedPolicies.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Policy Name
                    {sortConfig.field === 'name' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('resourceType')}
                  >
                    Resource Type
                    {sortConfig.field === 'resourceType' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('effect')}
                  >
                    Effect
                    {sortConfig.field === 'effect' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('priority')}
                  >
                    Priority
                    {sortConfig.field === 'priority' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('enabled')}
                  >
                    Status
                    {sortConfig.field === 'enabled' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('enabled')}
                  >
                    Status
                    {sortConfig.field === 'enabled' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      {searchTerm ? 'No policies found matching your search.' : 'No policies created yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPolicies.includes(policy.id)}
                          onCheckedChange={() => handleSelectPolicy(policy.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <button
                            onClick={() => onViewPolicy?.(policy.id)}
                            className="font-medium text-left hover:underline"
                          >
                            {policy.name}
                          </button>
                          <p className="text-sm text-muted-foreground line-clamp-2" title={policy.description}>
                            {policy.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {policy.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getResourceType(policy)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getEffectBadge(policy.effect)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {policy.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const health = getPolicyHealth(policy);
                          return (
                            <div className="flex items-center space-x-2">
                              {getHealthIcon(health.status)}
                              <span className="text-xs text-muted-foreground">
                                {health.score}/100
                              </span>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const health = getPolicyHealth(policy);
                          return (
                            <div className="flex items-center space-x-2">
                              {getPerformanceTrend()}
                              <div className="text-xs">
                                <div>{health.evaluations} evals</div>
                                <div className="text-muted-foreground">{health.avgResponseTime}ms</div>
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleTogglePolicyStatus(policy.id)}
                          className="inline-flex"
                        >
                          {getStatusBadge(policy.enabled)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewPolicy?.(policy.id)}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestPolicy(policy.id)}
                            className="h-8 w-8 p-0"
                            title="Test Policy"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEditPolicy?.(policy.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicatePolicy(policy.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Clone
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePolicyStatus(policy.id)}>
                                {policy.enabled ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Enable
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredAndSortedPolicies.length} of {allMockPolicies.length} policies
            </div>
            <div className="flex items-center gap-4">
              <span>{allMockPolicies.filter(p => p.enabled).length} enabled</span>
              <span>{allMockPolicies.filter(p => !p.enabled).length} disabled</span>
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
              This action cannot be undone. This will permanently delete the policy and 
              remove it from the system. Any users or roles relying on this policy may 
              lose access to resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePolicy} className="bg-destructive text-destructive-foreground">
              Delete Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}