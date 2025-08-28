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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  X, Plus, Clock, Calendar, MapPin, Shield, 
  CheckCircle2, AlertTriangle, Info, Settings,
  Users, Building, Layers
} from 'lucide-react';

import { mockRoles, mockDepartments } from '@/lib/mock-data/permission-index';
import { Operator } from '@/lib/types/permissions';

// Form schema for Step 4
const step4Schema = z.object({
  enabled: z.boolean().default(true),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  timeRestrictions: z.array(z.object({
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string()
  })).optional(),
  locationRestrictions: z.array(z.string()).optional(),
  ipRestrictions: z.array(z.string()).optional(),
  deviceRestrictions: z.array(z.string()).optional(),
  obligations: z.array(z.object({
    id: z.string(),
    type: z.string(),
    description: z.string(),
    required: z.boolean()
  })).optional(),
  advice: z.array(z.object({
    id: z.string(),
    type: z.string(),
    message: z.string()
  })).optional()
});

type Step4FormData = z.infer<typeof step4Schema>;

interface PolicyBuilderStep4Props {
  onNext: (data: Step4FormData) => void;
  onBack: () => void;
  onCancel: () => void;
  initialData?: Partial<Step4FormData>;
  policyData: {
    name: string;
    description: string;
    priority: number;
    subjectType: string;
    selectedSubjects: string[];
    selectedResourceType: string;
    selectedActions: string[];
    attributeConditions: any[];
  };
}

interface TimeRestriction {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface Obligation {
  id: string;
  type: string;
  description: string;
  required: boolean;
}

interface Advice {
  id: string;
  type: string;
  message: string;
}

export function PolicyBuilderStep4({ 
  onNext, 
  onBack, 
  onCancel, 
  initialData,
  policyData 
}: PolicyBuilderStep4Props) {
  const [timeRestrictions, setTimeRestrictions] = useState<TimeRestriction[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [advice, setAdvice] = useState<Advice[]>([]);
  
  const [newTimeRestriction, setNewTimeRestriction] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  });

  const [newObligation, setNewObligation] = useState({
    type: '',
    description: '',
    required: false
  });

  const [newAdvice, setNewAdvice] = useState({
    type: '',
    message: ''
  });

  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      enabled: initialData?.enabled ?? true,
      effectiveFrom: initialData?.effectiveFrom || '',
      effectiveTo: initialData?.effectiveTo || '',
      locationRestrictions: initialData?.locationRestrictions || [],
      ipRestrictions: initialData?.ipRestrictions || [],
      deviceRestrictions: initialData?.deviceRestrictions || []
    }
  });

  // Get subject names for display
  const getSubjectNames = () => {
    const allSubjects = [
      ...mockRoles.map(role => ({ id: role.id, name: role.name })),
      ...mockDepartments.map(dept => ({ id: dept.id, name: dept.name })),
      { id: 'all_users', name: 'All Users' },
      { id: 'active_users', name: 'Active Users' },
      { id: 'managers', name: 'All Managers' },
      { id: 'staff', name: 'Staff Members' }
    ];
    
    return policyData.selectedSubjects.map(id => 
      allSubjects.find(s => s.id === id)?.name || id
    );
  };

  // Time restriction management
  const addTimeRestriction = () => {
    if (newTimeRestriction.dayOfWeek && newTimeRestriction.startTime && newTimeRestriction.endTime) {
      const restriction: TimeRestriction = {
        id: `time-${Date.now()}`,
        dayOfWeek: newTimeRestriction.dayOfWeek,
        startTime: newTimeRestriction.startTime,
        endTime: newTimeRestriction.endTime,
        label: `${newTimeRestriction.dayOfWeek} ${newTimeRestriction.startTime} - ${newTimeRestriction.endTime}`
      };
      setTimeRestrictions([...timeRestrictions, restriction]);
      setNewTimeRestriction({ dayOfWeek: '', startTime: '', endTime: '' });
    }
  };

  const removeTimeRestriction = (restrictionId: string) => {
    setTimeRestrictions(timeRestrictions.filter(r => r.id !== restrictionId));
  };

  // Obligation management
  const addObligation = () => {
    if (newObligation.type && newObligation.description) {
      const obligation: Obligation = {
        id: `obl-${Date.now()}`,
        type: newObligation.type,
        description: newObligation.description,
        required: newObligation.required
      };
      setObligations([...obligations, obligation]);
      setNewObligation({ type: '', description: '', required: false });
    }
  };

  const removeObligation = (obligationId: string) => {
    setObligations(obligations.filter(o => o.id !== obligationId));
  };

  // Advice management
  const addAdvice = () => {
    if (newAdvice.type && newAdvice.message) {
      const adviceItem: Advice = {
        id: `adv-${Date.now()}`,
        type: newAdvice.type,
        message: newAdvice.message
      };
      setAdvice([...advice, adviceItem]);
      setNewAdvice({ type: '', message: '' });
    }
  };

  const removeAdvice = (adviceId: string) => {
    setAdvice(advice.filter(a => a.id !== adviceId));
  };

  const handleNext = (data: Step4FormData) => {
    const finalData = {
      ...data,
      timeRestrictions: timeRestrictions.map(tr => ({
        dayOfWeek: tr.dayOfWeek,
        startTime: tr.startTime,
        endTime: tr.endTime
      })),
      obligations: obligations,
      advice: advice
    };
    onNext(finalData);
  };

  // Available options
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  const obligationTypes = [
    'audit_log', 'email_notification', 'approval_required',
    'two_factor_auth', 'data_encryption', 'backup_required'
  ];

  const adviceTypes = [
    'security_warning', 'usage_guideline', 'best_practice',
    'compliance_note', 'performance_tip'
  ];

  const deviceTypes = [
    'desktop', 'mobile', 'tablet', 'kiosk'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Step 4: Review & Conditions</h2>
        <p className="text-muted-foreground">
          Review the policy configuration and add optional conditions and constraints.
        </p>
      </div>

      {/* Policy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Policy Summary
          </CardTitle>
          <CardDescription>
            Review the configured policy before applying additional conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Policy Name</h4>
              <p className="font-medium">{policyData.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Priority</h4>
              <p className="font-medium">{policyData.priority}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-sm">{policyData.description}</p>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Subjects ({policyData.subjectType})
            </h4>
            <div className="flex flex-wrap gap-2">
              {getSubjectNames().map((name) => (
                <Badge key={name} variant="secondary" className="flex items-center gap-1">
                  {policyData.subjectType === 'role' && <Users className="h-3 w-3" />}
                  {policyData.subjectType === 'department' && <Building className="h-3 w-3" />}
                  {policyData.subjectType === 'user_group' && <Layers className="h-3 w-3" />}
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Resource & Actions</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Resource:</span>
                <Badge variant="outline">{policyData.selectedResourceType}</Badge>
              </div>
              <div className="flex flex-wrap gap-1 ml-6">
                {policyData.selectedActions.map((action) => (
                  <Badge key={action} variant="secondary" className="text-xs">
                    {action}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {policyData.attributeConditions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Attribute Conditions</h4>
              <div className="space-y-1">
                {policyData.attributeConditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {condition.attribute} {condition.operator} {condition.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
          {/* Policy Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Policy Status
              </CardTitle>
              <CardDescription>
                Control whether this policy is active and when it takes effect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Policy</FormLabel>
                      <FormDescription>
                        When enabled, this policy will be active and enforced
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        When this policy becomes active
                      </FormDescription>
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
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        When this policy expires (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Restrictions
              </CardTitle>
              <CardDescription>
                Limit when this policy can be used based on time and day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Day of Week</label>
                  <Select value={newTimeRestriction.dayOfWeek} onValueChange={(value) => 
                    setNewTimeRestriction({ ...newTimeRestriction, dayOfWeek: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={newTimeRestriction.startTime}
                    onChange={(e) => setNewTimeRestriction({ 
                      ...newTimeRestriction, 
                      startTime: e.target.value 
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={newTimeRestriction.endTime}
                    onChange={(e) => setNewTimeRestriction({ 
                      ...newTimeRestriction, 
                      endTime: e.target.value 
                    })}
                  />
                </div>

                <Button
                  type="button"
                  onClick={addTimeRestriction}
                  disabled={!newTimeRestriction.dayOfWeek || !newTimeRestriction.startTime || !newTimeRestriction.endTime}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {timeRestrictions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Active Time Restrictions:</h4>
                  <div className="space-y-2">
                    {timeRestrictions.map((restriction) => (
                      <Badge key={restriction.id} variant="outline" className="flex items-center gap-2 justify-between p-2">
                        <span className="text-sm">{restriction.label}</span>
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeTimeRestriction(restriction.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environmental Constraints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Environmental Constraints
              </CardTitle>
              <CardDescription>
                Add location, device, or network-based restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="locationRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Restrictions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., main-office,warehouse-1 (comma-separated)"
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => field.onChange(
                          e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      Limit access to specific locations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ipRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address Restrictions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 192.168.1.0/24,10.0.0.0/8 (comma-separated)"
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => field.onChange(
                          e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      Restrict access to specific IP ranges
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deviceRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Type Restrictions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., desktop,mobile (comma-separated)"
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => field.onChange(
                          e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      Limit access to specific device types: {deviceTypes.join(', ')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Obligations
              </CardTitle>
              <CardDescription>
                Actions that must be performed when this policy grants access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newObligation.type} onValueChange={(value) => 
                    setNewObligation({ ...newObligation, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {obligationTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Describe the required action"
                    value={newObligation.description}
                    onChange={(e) => setNewObligation({ 
                      ...newObligation, 
                      description: e.target.value 
                    })}
                  />
                </div>

                <Button
                  type="button"
                  onClick={addObligation}
                  disabled={!newObligation.type || !newObligation.description}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {obligations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Active Obligations:</h4>
                  <div className="space-y-2">
                    {obligations.map((obligation) => (
                      <div key={obligation.id} className="flex items-center gap-2 justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{obligation.type}</Badge>
                            {obligation.required && <Badge variant="destructive">Required</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{obligation.description}</p>
                        </div>
                        <X
                          className="h-4 w-4 cursor-pointer hover:text-destructive"
                          onClick={() => removeObligation(obligation.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Advice
              </CardTitle>
              <CardDescription>
                Informational messages to display when this policy is evaluated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newAdvice.type} onValueChange={(value) => 
                    setNewAdvice({ ...newAdvice, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {adviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Message</label>
                  <Input
                    placeholder="Enter advice message"
                    value={newAdvice.message}
                    onChange={(e) => setNewAdvice({ 
                      ...newAdvice, 
                      message: e.target.value 
                    })}
                  />
                </div>

                <Button
                  type="button"
                  onClick={addAdvice}
                  disabled={!newAdvice.type || !newAdvice.message}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {advice.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Active Advice:</h4>
                  <div className="space-y-2">
                    {advice.map((adviceItem) => (
                      <div key={adviceItem.id} className="flex items-center gap-2 justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{adviceItem.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{adviceItem.message}</p>
                        </div>
                        <X
                          className="h-4 w-4 cursor-pointer hover:text-destructive"
                          onClick={() => removeAdvice(adviceItem.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              Back: Actions Configuration
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Create Policy
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}