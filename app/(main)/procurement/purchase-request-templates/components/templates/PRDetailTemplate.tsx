"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PRTemplate } from "@/lib/types/pr-template"

interface PRDetailTemplateProps {
  template: PRTemplate
  mode: "view" | "edit"
  onSave?: (template: PRTemplate) => void
}

export function PRDetailTemplate({
  template,
  mode,
  onSave,
}: PRDetailTemplateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              value={template.name}
              readOnly={mode === "view"}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={template.description}
              readOnly={mode === "view"}
              placeholder="Enter template description"
            />
          </div>
          {mode === "edit" && (
            <Button onClick={() => onSave?.(template)}>Save Changes</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 