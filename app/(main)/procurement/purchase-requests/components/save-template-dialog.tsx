"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BookmarkIcon, Save } from "lucide-react";
import { PurchaseRequest, PRTemplate, PRType, PurchaseRequestItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: Omit<PRTemplate, "id" | "createdAt" | "updatedAt" | "createdBy">) => void;
  prData: PurchaseRequest;
}

export function SaveTemplateDialog({ isOpen, onClose, onSave, prData }: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [category, setCategory] = useState("my");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = () => {
    setIsSaving(true);
    
    const templateData: Omit<PRTemplate, "id" | "createdAt" | "updatedAt" | "createdBy"> = {
      name: templateName,
      description: templateDescription,
      type: prData.type,
      category,
      department: prData.department,
      isDefault,
      isGlobal: category === "global",
      prData: {
        vendor: prData.vendor,
        vendorId: prData.vendorId,
        description: prData.description,
        location: prData.location,
        department: prData.department,
        jobCode: prData.jobCode,
        currency: prData.currency,
        items: prData.items?.map((item: PurchaseRequestItem) => ({
          name: item.name,
          description: item.description,
          unit: item.unit,
          location: item.location,
          vendor: item.vendor,
          price: item.price,
          taxRate: item.taxRate,
          discountRate: item.discountRate,
          // Exclude quantities and specific values
        })) || []
      }
    };
    
    // Simulate a delay to show loading state
    setTimeout(() => {
      onSave(templateData);
      setIsSaving(false);
      onClose();
    }, 500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5 text-primary" />
            <DialogTitle>Save as Template</DialogTitle>
          </div>
          <DialogDescription>
            Create a reusable template from this Purchase Request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Template will include:</div>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>PR type: <span className="font-medium">{prData.type}</span></li>
                <li>Vendor: <span className="font-medium">{prData.vendor || "None"}</span></li>
                <li>Items: <span className="font-medium">{prData.items?.length || 0} items</span></li>
                <li>Department: <span className="font-medium">{prData.department || "None"}</span></li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name <span className="text-red-500">*</span></Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a name for this template"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe the purpose of this template"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my">My Templates</SelectItem>
                <SelectItem value="department">Department Templates</SelectItem>
                <SelectItem value="global">Global Templates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="isDefault">Set as default template for this PR type</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!templateName || isSaving}
          >
            <BookmarkIcon className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 