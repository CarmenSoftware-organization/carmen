"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, Plus, Edit, Trash2, AlertTriangle, Clock } from "lucide-react";
import { mockRoutingRules, mockEscalationPolicies } from "@/lib/mock-data/settings";
import type { NotificationRoutingRule, EscalationPolicy } from "@/lib/types/settings";

export function RoutingRulesTab() {
  const { toast } = useToast();
  const [routingRules, setRoutingRules] = useState<NotificationRoutingRule[]>(mockRoutingRules);
  const [escalationPolicies, setEscalationPolicies] = useState<EscalationPolicy[]>(mockEscalationPolicies);
  const [selectedRule, setSelectedRule] = useState<NotificationRoutingRule | null>(routingRules[0] || null);
  const [selectedPolicy, setSelectedPolicy] = useState<EscalationPolicy | null>(escalationPolicies[0] || null);

  const handleDeleteRule = (ruleId: string) => {
    setRoutingRules(prev => prev.filter(r => r.id !== ruleId));
    if (selectedRule?.id === ruleId) {
      setSelectedRule(routingRules[0] || null);
    }
    toast({
      title: "Rule Deleted",
      description: "Routing rule has been deleted successfully.",
    });
  };

  const handleDeletePolicy = (policyId: string) => {
    setEscalationPolicies(prev => prev.filter(p => p.id !== policyId));
    if (selectedPolicy?.id === policyId) {
      setSelectedPolicy(escalationPolicies[0] || null);
    }
    toast({
      title: "Policy Deleted",
      description: "Escalation policy has been deleted successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Routing Rules Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Routing Rules</CardTitle>
              <CardDescription>
                Configure conditional logic for notification routing
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rule List */}
            <div className="lg:col-span-1 space-y-2">
              {routingRules.map(rule => (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedRule?.id === rule.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{rule.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {rule.eventType}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Priority: {rule.priority}
                      </div>
                    </div>
                    {rule.enabled ? (
                      <Badge variant="default" className="shrink-0">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">Disabled</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Rule Details */}
            {selectedRule && (
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRule.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRule.eventType}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRule(selectedRule.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRule.conditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <code className="text-xs font-mono">
                            {condition.field} {condition.operator} {JSON.stringify(condition.value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRule.actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Badge variant="outline">{action.type}</Badge>
                          {action.type === 'route-to-role' && action.roleId && (
                            <span className="text-sm">Role: {action.roleId}</span>
                          )}
                          {action.type === 'route-to-user' && action.userId && (
                            <span className="text-sm">User: {action.userId}</span>
                          )}
                          {action.type === 'set-priority' && action.priority && (
                            <span className="text-sm">Priority: {action.priority}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div>Priority: {selectedRule.priority}</div>
                  <div>Status: {selectedRule.enabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Policies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Escalation Policies</CardTitle>
                <CardDescription>
                  Define multi-stage escalation workflows
                </CardDescription>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Policy List */}
            <div className="lg:col-span-1 space-y-2">
              {escalationPolicies.map(policy => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPolicy?.id === policy.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{policy.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {policy.stages.length} stages
                      </div>
                    </div>
                    {policy.enabled ? (
                      <Badge variant="default" className="shrink-0">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">Disabled</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Policy Details */}
            {selectedPolicy && (
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPolicy.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPolicy.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePolicy(selectedPolicy.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Escalation Stages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPolicy.stages.map((stage, idx) => (
                        <div key={stage.level} className="relative">
                          {idx > 0 && (
                            <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
                          )}
                          <div className="flex gap-4 p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-semibold shrink-0">
                              {stage.level}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  After {stage.delayMinutes} minutes
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Notify:</div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{stage.recipientRole}</Badge>
                                </div>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="text-sm font-medium">Channels:</div>
                                <div className="flex gap-2">
                                  {stage.channels.map(channel => (
                                    <Badge key={channel} variant="default">{channel}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-2">
                                <Badge variant="secondary">{stage.condition}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div>Event Type: {selectedPolicy.eventType}</div>
                  <div>Status: {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
