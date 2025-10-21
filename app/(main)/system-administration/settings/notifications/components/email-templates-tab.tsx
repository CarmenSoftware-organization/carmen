"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Send, Edit, Plus } from "lucide-react";
import { mockEmailTemplates } from "@/lib/mock-data/settings";
import type { EmailTemplate } from "@/lib/types/settings";

export function EmailTemplatesTab() {
  const { toast } = useToast();
  const [templates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(templates[0] || null);

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: `Test email sent to your address using template: ${selectedTemplate?.name}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage notification email templates for different event types
              </CardDescription>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Available Templates</CardTitle>
            <CardDescription>
              {templates.length} templates configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {template.eventType}
                      </div>
                    </div>
                    {template.isActive && (
                      <Badge variant="default" className="shrink-0">Active</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Details */}
        {selectedTemplate && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleTestEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input value={selectedTemplate.subject} readOnly className="bg-muted" />
              </div>

              {/* HTML Template Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>HTML Template</Label>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
                <Textarea
                  value={selectedTemplate.htmlTemplate}
                  readOnly
                  className="bg-muted font-mono text-xs h-40"
                />
              </div>

              {/* Text Template */}
              <div className="space-y-2">
                <Label>Plain Text Template</Label>
                <Textarea
                  value={selectedTemplate.textTemplate}
                  readOnly
                  className="bg-muted font-mono text-xs h-24"
                />
              </div>

              {/* Variables */}
              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.name} className="text-sm">
                        <code className="bg-background px-2 py-1 rounded text-xs">
                          {`{{${variable.name}}}`}
                        </code>
                        {variable.required && (
                          <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
                        <p className="text-xs text-muted-foreground">Example: {variable.example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <div>Version: {selectedTemplate.version}</div>
                <div>Language: {selectedTemplate.language.toUpperCase()}</div>
                <div>Last updated: {selectedTemplate.updatedAt.toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
