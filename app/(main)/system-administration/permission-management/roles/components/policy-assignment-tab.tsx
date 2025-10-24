'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  FileText, 
  Shield, 
  Building,
  Users,
  Settings,
  CheckSquare,
  Square,
  Eye,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Role } from '@/lib/types';
import { allMockPolicies } from '@/lib/mock-data/permission-policies';

interface PolicyAssignmentTabProps {
  role: Role;
}

// Helper function to determine policy type based on name for demo purposes
const getPolicyType = (policyName: string): string => {
  const name = policyName.toLowerCase();
  if (name.includes('admin') || name.includes('system')) return 'system_admin';
  if (name.includes('manager') || name.includes('department')) return 'department_manager';
  if (name.includes('staff') || name.includes('employee')) return 'staff';
  return 'custom';
};

export function PolicyAssignmentTab({ role }: PolicyAssignmentTabProps) {
  const [assignedSearchTerm, setAssignedSearchTerm] = useState('');
  const [availableSearchTerm, setAvailableSearchTerm] = useState('');
  const [assignedTypeFilter, setAssignedTypeFilter] = useState<string>('all');
  const [availableTypeFilter, setAvailableTypeFilter] = useState<string>('all');
  const [selectedAssignedPolicies, setSelectedAssignedPolicies] = useState<string[]>([]);
  const [selectedAvailablePolicies, setSelectedAvailablePolicies] = useState<string[]>([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewPolicy, setPreviewPolicy] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get assigned and available policies
  const assignedPolicies = useMemo(() => {
    // Mock: assign first 2-4 policies based on role ID
    const count = Math.min(2 + (role.id.length % 3), allMockPolicies.length);
    return allMockPolicies.slice(0, count);
  }, [role.id]);

  const availablePolicies = useMemo(() => {
    // Mock: show remaining policies as available
    const count = Math.min(2 + (role.id.length % 3), allMockPolicies.length);
    return allMockPolicies.slice(count);
  }, [role.id]);

  // Filter assigned policies
  const filteredAssignedPolicies = useMemo(() => {
    let filtered = assignedPolicies;
    
    if (assignedSearchTerm) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(assignedSearchTerm.toLowerCase())
      );
    }
    
    if (assignedTypeFilter !== 'all') {
      filtered = filtered.filter(policy => getPolicyType(policy.name) === assignedTypeFilter);
    }
    
    return filtered;
  }, [assignedPolicies, assignedSearchTerm, assignedTypeFilter]);

  // Filter available policies
  const filteredAvailablePolicies = useMemo(() => {
    let filtered = availablePolicies;
    
    if (availableSearchTerm) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(availableSearchTerm.toLowerCase())
      );
    }
    
    if (availableTypeFilter !== 'all') {
      filtered = filtered.filter(policy => getPolicyType(policy.name) === availableTypeFilter);
    }
    
    return filtered;
  }, [availablePolicies, availableSearchTerm, availableTypeFilter]);

  const handleAssignedPolicySelect = (policyId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssignedPolicies(prev => [...prev, policyId]);
    } else {
      setSelectedAssignedPolicies(prev => prev.filter(id => id !== policyId));
    }
  };

  const handleAvailablePolicySelect = (policyId: string, checked: boolean) => {
    if (checked) {
      setSelectedAvailablePolicies(prev => [...prev, policyId]);
    } else {
      setSelectedAvailablePolicies(prev => prev.filter(id => id !== policyId));
    }
  };

  const handleSelectAllAssigned = () => {
    const allSelected = filteredAssignedPolicies.length === selectedAssignedPolicies.length;
    if (allSelected) {
      setSelectedAssignedPolicies([]);
    } else {
      setSelectedAssignedPolicies(filteredAssignedPolicies.map(policy => policy.id));
    }
  };

  const handleSelectAllAvailable = () => {
    const allSelected = filteredAvailablePolicies.length === selectedAvailablePolicies.length;
    if (allSelected) {
      setSelectedAvailablePolicies([]);
    } else {
      setSelectedAvailablePolicies(filteredAvailablePolicies.map(policy => policy.id));
    }
  };

  const handleRemovePolicies = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would make an API call to remove policies from role
    console.log('Removing policies from role:', selectedAssignedPolicies);
    
    setSelectedAssignedPolicies([]);
    setIsRemoveDialogOpen(false);
    setIsProcessing(false);
  };

  const handleAddPolicies = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would make an API call to add policies to role
    console.log('Adding policies to role:', selectedAvailablePolicies);
    
    setSelectedAvailablePolicies([]);
    setIsAddDialogOpen(false);
    setIsProcessing(false);
  };

  const getPolicyTypeIcon = (policyName: string) => {
    const type = getPolicyType(policyName);
    switch (type) {
      case 'system_admin':
        return <Settings className="h-4 w-4" />;
      case 'department_manager':
        return <Building className="h-4 w-4" />;
      case 'staff':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPolicyTypeBadge = (policyName: string) => {
    const type = getPolicyType(policyName);
    switch (type) {
      case 'system_admin':
        return <Badge className="text-xs bg-red-100 text-red-800">System Admin</Badge>;
      case 'department_manager':
        return <Badge className="text-xs bg-orange-100 text-orange-800">Department Manager</Badge>;
      case 'staff':
        return <Badge className="text-xs bg-blue-100 text-blue-800">Staff</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Custom</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
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

  const PolicyCard = ({ policy, isAssigned, isSelected, onSelect }: any) => (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-2">
              {getPolicyTypeIcon(policy.name)}
              <div>
                <h3 className="font-medium text-sm">{policy.name}</h3>
                <p className="text-xs text-muted-foreground">{policy.id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPolicy(policy);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview permissions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {policy.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPolicyTypeBadge(policy.name)}
            {getPriorityBadge(policy.priority)}
          </div>
          <div className="text-xs text-muted-foreground">
            {policy.permissions?.length || 0} permissions
          </div>
        </div>
        {policy.conditions && policy.conditions.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{policy.conditions.length} condition(s)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Assigned Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{assignedPolicies.length}</div>
            <p className="text-sm text-muted-foreground">Active policies for this role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Available Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availablePolicies.length}</div>
            <p className="text-sm text-muted-foreground">Policies available for assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Policy Management Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Policies Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Assigned Policies ({assignedPolicies.length})
              </CardTitle>
              {selectedAssignedPolicies.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsRemoveDialogOpen(true)}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Remove ({selectedAssignedPolicies.length})
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search policies..."
                    value={assignedSearchTerm}
                    onChange={(e) => setAssignedSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={assignedTypeFilter} onValueChange={setAssignedTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="system_admin">System Admin</SelectItem>
                    <SelectItem value="department_manager">Department Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllAssigned}
                  className="h-auto p-1"
                >
                  {filteredAssignedPolicies.length === selectedAssignedPolicies.length && filteredAssignedPolicies.length > 0 ? (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  ) : (
                    <Square className="h-4 w-4 mr-1" />
                  )}
                  Select All
                </Button>
                <span className="text-muted-foreground">
                  {selectedAssignedPolicies.length} of {filteredAssignedPolicies.length} selected
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredAssignedPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  isAssigned={true}
                  isSelected={selectedAssignedPolicies.includes(policy.id)}
                  onSelect={(checked: boolean) => handleAssignedPolicySelect(policy.id, checked)}
                />
              ))}
              
              {filteredAssignedPolicies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {assignedSearchTerm || assignedTypeFilter !== 'all' 
                    ? 'No policies found matching your filters.' 
                    : 'No policies assigned to this role.'
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Policies Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Policies ({availablePolicies.length})
              </CardTitle>
              {selectedAvailablePolicies.length > 0 && (
                <Button 
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add ({selectedAvailablePolicies.length})
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search policies..."
                    value={availableSearchTerm}
                    onChange={(e) => setAvailableSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={availableTypeFilter} onValueChange={setAvailableTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="system_admin">System Admin</SelectItem>
                    <SelectItem value="department_manager">Department Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllAvailable}
                  className="h-auto p-1"
                >
                  {filteredAvailablePolicies.length === selectedAvailablePolicies.length && filteredAvailablePolicies.length > 0 ? (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  ) : (
                    <Square className="h-4 w-4 mr-1" />
                  )}
                  Select All
                </Button>
                <span className="text-muted-foreground">
                  {selectedAvailablePolicies.length} of {filteredAvailablePolicies.length} selected
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredAvailablePolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  isAssigned={false}
                  isSelected={selectedAvailablePolicies.includes(policy.id)}
                  onSelect={(checked: boolean) => handleAvailablePolicySelect(policy.id, checked)}
                />
              ))}
              
              {filteredAvailablePolicies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {availableSearchTerm || availableTypeFilter !== 'all'
                    ? 'No policies found matching your filters.'
                    : 'All policies are already assigned to this role.'
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove Policies Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Policies from Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedAssignedPolicies.length} polic{selectedAssignedPolicies.length > 1 ? 'ies' : 'y'} from the "{role.name}" role? 
              This action will revoke all permissions granted by these policies for this role.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedAssignedPolicies.map(policyId => {
                const policy = allMockPolicies.find(p => p.id === policyId);
                return policy ? (
                  <div key={policyId} className="flex items-center gap-3 p-2 bg-muted rounded">
                    {getPolicyTypeIcon(policy.name)}
                    <div className="flex-1">
                      <span className="text-sm font-medium">{policy.name}</span>
                      <div className="text-xs text-muted-foreground">{policy.permissions?.length || 0} permissions</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemovePolicies}
              disabled={isProcessing}
            >
              {isProcessing ? 'Removing...' : `Remove ${selectedAssignedPolicies.length} Polic${selectedAssignedPolicies.length > 1 ? 'ies' : 'y'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Policies Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Policies to Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to add {selectedAvailablePolicies.length} polic{selectedAvailablePolicies.length > 1 ? 'ies' : 'y'} to the "{role.name}" role? 
              This action will grant all permissions from these policies to this role.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedAvailablePolicies.map(policyId => {
                const policy = allMockPolicies.find(p => p.id === policyId);
                return policy ? (
                  <div key={policyId} className="flex items-center gap-3 p-2 bg-muted rounded">
                    {getPolicyTypeIcon(policy.name)}
                    <div className="flex-1">
                      <span className="text-sm font-medium">{policy.name}</span>
                      <div className="text-xs text-muted-foreground">{policy.permissions?.length || 0} permissions</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPolicies}
              disabled={isProcessing}
            >
              {isProcessing ? 'Adding...' : `Add ${selectedAvailablePolicies.length} Polic${selectedAvailablePolicies.length > 1 ? 'ies' : 'y'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewPolicy && getPolicyTypeIcon(previewPolicy.type)}
              Policy Preview: {previewPolicy?.name}
            </DialogTitle>
            <DialogDescription>
              {previewPolicy?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewPolicy && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getPolicyTypeBadge(previewPolicy.name)}
                  {getPriorityBadge(previewPolicy.priority)}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions Granted</h4>
                  <div className="text-sm text-muted-foreground">
                    This policy would grant {previewPolicy.permissions?.length || 0} permissions to the role.
                  </div>
                </div>
                
                {previewPolicy.conditions && previewPolicy.conditions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Conditions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {previewPolicy.conditions.map((condition: string, index: number) => (
                        <li key={index}>• {condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}