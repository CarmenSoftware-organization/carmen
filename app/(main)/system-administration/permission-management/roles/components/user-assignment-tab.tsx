'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Users, 
  UserCheck, 
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  MoreVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Role, User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data/users';

interface UserAssignmentTabProps {
  role: Role;
}

export function UserAssignmentTab({ role }: UserAssignmentTabProps) {
  const [assignedSearchTerm, setAssignedSearchTerm] = useState('');
  const [availableSearchTerm, setAvailableSearchTerm] = useState('');
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState<string[]>([]);
  const [selectedAvailableUsers, setSelectedAvailableUsers] = useState<string[]>([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get assigned and available users
  const assignedUsers = useMemo(() => {
    return mockUsers.filter(user => 
      user.roles?.some(r => r.id === role.id) || user.primaryRole?.id === role.id
    );
  }, [role.id]);

  const availableUsers = useMemo(() => {
    return mockUsers.filter(user => 
      !user.roles?.some(r => r.id === role.id) && user.primaryRole?.id !== role.id
    );
  }, [role.id]);

  // Filter users based on search
  const filteredAssignedUsers = useMemo(() => {
    if (!assignedSearchTerm) return assignedUsers;
    
    return assignedUsers.filter(user =>
      user.name.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      user.departments?.[0]?.name.toLowerCase().includes(assignedSearchTerm.toLowerCase())
    );
  }, [assignedUsers, assignedSearchTerm]);

  const filteredAvailableUsers = useMemo(() => {
    if (!availableSearchTerm) return availableUsers;
    
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
      user.departments?.[0]?.name.toLowerCase().includes(availableSearchTerm.toLowerCase())
    );
  }, [availableUsers, availableSearchTerm]);

  const handleAssignedUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssignedUsers(prev => [...prev, userId]);
    } else {
      setSelectedAssignedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleAvailableUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedAvailableUsers(prev => [...prev, userId]);
    } else {
      setSelectedAvailableUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAllAssigned = () => {
    const allSelected = filteredAssignedUsers.length === selectedAssignedUsers.length;
    if (allSelected) {
      setSelectedAssignedUsers([]);
    } else {
      setSelectedAssignedUsers(filteredAssignedUsers.map(user => user.id));
    }
  };

  const handleSelectAllAvailable = () => {
    const allSelected = filteredAvailableUsers.length === selectedAvailableUsers.length;
    if (allSelected) {
      setSelectedAvailableUsers([]);
    } else {
      setSelectedAvailableUsers(filteredAvailableUsers.map(user => user.id));
    }
  };

  const handleRemoveUsers = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would make an API call to remove users from role
    console.log('Removing users from role:', selectedAssignedUsers);
    
    setSelectedAssignedUsers([]);
    setIsRemoveDialogOpen(false);
    setIsProcessing(false);
  };

  const handleAddUsers = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would make an API call to add users to role
    console.log('Adding users to role:', selectedAvailableUsers);
    
    setSelectedAvailableUsers([]);
    setIsAddDialogOpen(false);
    setIsProcessing(false);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleTypeBadge = (user: User) => {
    const isMainRole = user.primaryRole?.id === role.id;
    return (
      <Badge variant={isMainRole ? "default" : "secondary"}>
        {isMainRole ? 'Primary' : 'Additional'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5" />
              Assigned Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{assignedUsers.length}</div>
            <p className="text-sm text-muted-foreground">Users with this role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Available Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableUsers.length}</div>
            <p className="text-sm text-muted-foreground">Users available for assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Users Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Assigned Users ({assignedUsers.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedAssignedUsers.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsRemoveDialogOpen(true)}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Remove ({selectedAssignedUsers.length})
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search assigned users..."
                  value={assignedSearchTerm}
                  onChange={(e) => setAssignedSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllAssigned}
                  className="h-auto p-1"
                >
                  {filteredAssignedUsers.length === selectedAssignedUsers.length && filteredAssignedUsers.length > 0 ? (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  ) : (
                    <Square className="h-4 w-4 mr-1" />
                  )}
                  Select All
                </Button>
                <span className="text-muted-foreground">
                  {selectedAssignedUsers.length} of {filteredAssignedUsers.length} selected
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role Type</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAssignedUsers.includes(user.id)}
                          onCheckedChange={(checked) => 
                            handleAssignedUserSelect(user.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.departments?.[0]?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleTypeBadge(user)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('View user:', user.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedAssignedUsers([user.id]);
                                setIsRemoveDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              Remove Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredAssignedUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {assignedSearchTerm ? 'No users found matching your search.' : 'No users assigned to this role.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Users Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Users ({availableUsers.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedAvailableUsers.length > 0 && (
                  <Button 
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add ({selectedAvailableUsers.length})
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search available users..."
                  value={availableSearchTerm}
                  onChange={(e) => setAvailableSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllAvailable}
                  className="h-auto p-1"
                >
                  {filteredAvailableUsers.length === selectedAvailableUsers.length && filteredAvailableUsers.length > 0 ? (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  ) : (
                    <Square className="h-4 w-4 mr-1" />
                  )}
                  Select All
                </Button>
                <span className="text-muted-foreground">
                  {selectedAvailableUsers.length} of {filteredAvailableUsers.length} selected
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailableUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAvailableUsers.includes(user.id)}
                          onCheckedChange={(checked) => 
                            handleAvailableUserSelect(user.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.departments?.[0]?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.primaryRole?.name || 'No Role'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('View user:', user.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedAvailableUsers([user.id]);
                                setIsAddDialogOpen(true);
                              }}
                            >
                              Assign Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredAvailableUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {availableSearchTerm ? 'No users found matching your search.' : 'All users are already assigned to this role.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove Users Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Users from Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedAssignedUsers.length} user(s) from the "{role.name}" role? 
              This action will revoke all permissions associated with this role for the selected users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {selectedAssignedUsers.map(userId => {
                const user = mockUsers.find(u => u.id === userId);
                return user ? (
                  <div key={userId} className="flex items-center gap-3 p-2 bg-muted rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
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
              onClick={handleRemoveUsers}
              disabled={isProcessing}
            >
              {isProcessing ? 'Removing...' : `Remove ${selectedAssignedUsers.length} User(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Users Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Users to Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to add {selectedAvailableUsers.length} user(s) to the "{role.name}" role? 
              This action will grant all permissions associated with this role to the selected users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {selectedAvailableUsers.map(userId => {
                const user = mockUsers.find(u => u.id === userId);
                return user ? (
                  <div key={userId} className="flex items-center gap-3 p-2 bg-muted rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
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
              onClick={handleAddUsers}
              disabled={isProcessing}
            >
              {isProcessing ? 'Adding...' : `Add ${selectedAvailableUsers.length} User(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}