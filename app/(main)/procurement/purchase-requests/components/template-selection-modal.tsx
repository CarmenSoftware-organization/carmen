"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, FileText, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PRTemplate } from "@/lib/types/pr-template"
import { PurchaseRequest } from "@/lib/types"

interface TemplateSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: PRTemplate | { type: "recent"; pr: PurchaseRequest } | null) => void
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [templates, setTemplates] = useState<PRTemplate[]>([])

  useEffect(() => {
    // Fetch templates here
    const mockTemplates: PRTemplate[] = [
      {
        id: "1",
        name: "Monthly Office Supplies",
        description: "Standard template for monthly office supply orders",
        type: "template",
        items: [],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        createdBy: "system"
      },
      {
        id: "2",
        name: "Kitchen Equipment",
        description: "Template for kitchen equipment and utensils",
        type: "template",
        items: [],
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
        createdBy: "system"
      },
    ]
    setTemplates(mockTemplates)
  }, [])

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [templates, searchQuery])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-accent"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <h3 className="font-medium">{template.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {template.items.length} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Used 12 times
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 