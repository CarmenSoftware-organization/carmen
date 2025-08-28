'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Building, User } from 'lucide-react';

import { mockRoles, mockDepartments } from '@/lib/mock-data/permission-index';
import { Operator } from '@/lib/types/permissions';

// Form schema for Step 1
const step1Schema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.number().min(1).max(1000).default(100),
  subjectType: z.enum(['role', 'department', 'user_group']),
  selectedSubjects: z.array(z.string()).min(1, 'At least one subject must be selected'),
  attributeConditions: z.array(z.object({
    attribute: z.string(),
    operator: z.nativeEnum(Operator),
    value: z.any()
  }))
});

type Step1FormData = z.infer<typeof step1Schema>;

interface PolicyBuilderStep1Props {
  onNext: (data: Step1FormData) => void;
  onCancel: () => void;
  initialData?: Partial<Step1FormData>;
}

interface AttributeCondition {
  id: string;
  attribute: string;
  operator: Operator;
  value: any;
  label: string;
}

export function PolicyBuilderStep1({ onNext, onCancel, initialData }: PolicyBuilderStep1Props) {
  const [attributeConditions, setAttributeConditions] = useState<AttributeCondition[]>([]);
  const [newCondition, setNewCondition] = useState({
    attribute: '',
    operator: Operator.EQUALS,
    value: ''
  });

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 100,
      subjectType: initialData?.subjectType || 'role',
      selectedSubjects: initialData?.selectedSubjects || [],
      attributeConditions: initialData?.attributeConditions || []
    }
  });

  const watchedSubjectType = form.watch('subjectType');
  const watchedSelectedSubjects = form.watch('selectedSubjects');

  // Get available subjects based on selected type
  const getAvailableSubjects = () => {
    switch (watchedSubjectType) {
      case 'role':
        return mockRoles.map(role => ({ id: role.id, name: role.name, icon: Users }));
      case 'department':
        return mockDepartments.map(dept => ({ id: dept.id, name: dept.name, icon: Building }));
      case 'user_group':
        return [
          { id: 'all_users', name: 'All Users', icon: User },
          { id: 'active_users', name: 'Active Users', icon: User },
          { id: 'managers', name: 'All Managers', icon: User },
          { id: 'staff', name: 'Staff Members', icon: User }
        ];
      default:
        return [];
    }
  };

  const availableSubjects = getAvailableSubjects();

  // Handle subject selection
  const handleSubjectSelect = (subjectId: string) => {
    const currentSelected = form.getValues('selectedSubjects');
    if (!currentSelected.includes(subjectId)) {
      form.setValue('selectedSubjects', [...currentSelected, subjectId]);
    }
  };

  const handleSubjectRemove = (subjectId: string) => {
    const currentSelected = form.getValues('selectedSubjects');
    form.setValue('selectedSubjects', currentSelected.filter(id => id !== subjectId));
  };

  // Handle attribute conditions
  const addAttributeCondition = () => {
    if (newCondition.attribute && newCondition.value) {
      const condition: AttributeCondition = {
        id: `cond-${Date.now()}`,
        attribute: newCondition.attribute,
        operator: newCondition.operator,
        value: newCondition.value,
        label: `${newCondition.attribute} ${newCondition.operator} ${newCondition.value}`
      };
      setAttributeConditions([...attributeConditions, condition]);
      setNewCondition({ attribute: '', operator: Operator.EQUALS, value: '' });
    }
  };

  const removeAttributeCondition = (conditionId: string) => {
    setAttributeConditions(attributeConditions.filter(c => c.id !== conditionId));
  };

  const handleNext = (data: Step1FormData) => {
    // Include attribute conditions in form data
    const finalData = {
      ...data,
      attributeConditions: attributeConditions.map(c => ({
        attribute: c.attribute,
        operator: c.operator,
        value: c.value
      }))
    };
    onNext(finalData);
  };

  // Available attribute options
  const availableAttributes = [
    'subject.department.id',
    'subject.department.name',
    'subject.location.id',
    'subject.role.hierarchy',
    'subject.seniority',
    'subject.employeeType',
    'subject.clearanceLevel',
    'subject.approvalLimit.amount'
  ];

  const getSubjectName = (subjectId: string) => {
    return availableSubjects.find(s => s.id === subjectId)?.name || subjectId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Step 1: Subject Selection</h2>
        <p className="text-muted-foreground">
          Define the policy name, description, and specify who this policy applies to.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
          {/* Policy Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
              <CardDescription>
                Basic information about the policy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Department Manager PR Approval" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for the policy
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
                        placeholder="e.g., Allows department managers to approve purchase requests from their department up to $10,000"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of what this policy controls
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                      />
                    </FormControl>
                    <FormDescription>
                      Higher numbers indicate higher priority (1-1000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Subject Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Type</CardTitle>
              <CardDescription>
                Choose what type of subjects this policy applies to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="subjectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="role">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Roles</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="department">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>Departments</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="user_group">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>User Groups</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines what entities the policy will apply to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Subjects</CardTitle>
              <CardDescription>
                Choose specific {watchedSubjectType}s that this policy applies to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available subjects */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSubjects.map((subject) => {
                  const Icon = subject.icon;
                  const isSelected = watchedSelectedSubjects.includes(subject.id);
                  
                  return (
                    <Button
                      key={subject.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="justify-start h-auto p-3"
                      onClick={() => handleSubjectSelect(subject.id)}
                      disabled={isSelected}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{subject.name}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Selected subjects */}
              {watchedSelectedSubjects.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected {watchedSubjectType}s:</h4>
                  <div className="flex flex-wrap gap-2">
                    {watchedSelectedSubjects.map((subjectId) => (
                      <Badge key={subjectId} variant="secondary" className="flex items-center gap-1">
                        {getSubjectName(subjectId)}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleSubjectRemove(subjectId)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attribute Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Conditions (Optional)</CardTitle>
              <CardDescription>
                Add specific attribute-based conditions to further refine when this policy applies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new condition */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Attribute</label>
                  <Select value={newCondition.attribute} onValueChange={(value) => 
                    setNewCondition({ ...newCondition, attribute: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAttributes.map((attr) => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Operator</label>
                  <Select value={newCondition.operator} onValueChange={(value) => 
                    setNewCondition({ ...newCondition, operator: value as Operator })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Operator.EQUALS}>Equals</SelectItem>
                      <SelectItem value={Operator.NOT_EQUALS}>Not Equals</SelectItem>
                      <SelectItem value={Operator.GREATER_THAN}>Greater Than</SelectItem>
                      <SelectItem value={Operator.LESS_THAN}>Less Than</SelectItem>
                      <SelectItem value={Operator.IN}>In</SelectItem>
                      <SelectItem value={Operator.CONTAINS}>Contains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    placeholder="Enter value"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                  />
                </div>

                <Button
                  type="button"
                  onClick={addAttributeCondition}
                  disabled={!newCondition.attribute || !newCondition.value}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {/* Existing conditions */}
              {attributeConditions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Active Conditions:</h4>
                  <div className="space-y-2">
                    {attributeConditions.map((condition) => (
                      <Badge key={condition.id} variant="outline" className="flex items-center gap-2 justify-between p-2">
                        <span className="text-sm">{condition.label}</span>
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeAttributeCondition(condition.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Next: Resource Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}