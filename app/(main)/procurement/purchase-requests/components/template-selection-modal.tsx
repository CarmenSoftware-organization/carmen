"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/custom-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Clock, Star } from "lucide-react";
import { PRTemplate, PurchaseRequest } from "@/lib/types";
import { mockTemplates } from "../data/mock-templates";
import { mockRecentPRs } from "../data/mock-recent-prs";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PRTemplate | { type: "recent"; pr: Partial<PurchaseRequest> } | null) => void;
}

export function TemplateSelectionModal({ isOpen, onClose, onSelectTemplate }: TemplateSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [templates, setTemplates] = useState<PRTemplate[]>([]);
  const [recentPRs, setRecentPRs] = useState<Partial<PurchaseRequest>[]>([]);
  
  // Fetch templates and recent PRs
  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we're using our mock data
    setTemplates(mockTemplates);
    setRecentPRs(mockRecentPRs);
  }, []);
  
  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
                             (selectedCategory === "my" && template.category === "my") ||
                             (selectedCategory === "department" && template.category === "department") ||
                             (selectedCategory === "global" && template.category === "global");
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, selectedCategory]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Template for New Purchase Request</DialogTitle>
          <DialogDescription>
            Choose a template or start with a blank PR
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Left sidebar - Categories */}
          <div className="col-span-12 md:col-span-3 border-r pr-4">
            <div className="font-medium mb-2">Categories</div>
            <div className="space-y-1">
              <button 
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                onClick={() => setSelectedCategory("all")}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                All Templates
              </button>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === "my" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                onClick={() => setSelectedCategory("my")}
              >
                <Star className="h-4 w-4 inline mr-2" />
                My Templates
              </button>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === "department" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                onClick={() => setSelectedCategory("department")}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Department Templates
              </button>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === "global" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                onClick={() => setSelectedCategory("global")}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Global Templates
              </button>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${selectedCategory === "recent" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                onClick={() => setSelectedCategory("recent")}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Recent PRs
              </button>
            </div>
          </div>
          
          {/* Main content - Template list */}
          <div className="col-span-12 md:col-span-9">
            <div className="mb-4">
              <Input 
                placeholder="Search templates..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Blank PR option */}
              <Card className="cursor-pointer hover:bg-secondary" onClick={() => onSelectTemplate(null)}>
                <CardContent className="p-4 flex flex-col items-center justify-center h-40">
                  <PlusCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Blank PR</h3>
                  <p className="text-sm text-muted-foreground">Start with an empty form</p>
                </CardContent>
              </Card>
              
              {/* Template cards */}
              {selectedCategory !== "recent" && filteredTemplates.map(template => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardContent className="p-4 h-40">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{template.name}</h3>
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="text-xs text-muted-foreground mt-auto">
                      <p>Type: {template.type}</p>
                      <p>Items: {template.prData.items.length}</p>
                      <p>Created by: {template.createdBy}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Recent PRs (when selected) */}
              {selectedCategory === "recent" && recentPRs.map(pr => (
                <Card 
                  key={pr.id} 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => onSelectTemplate({ type: "recent", pr })}
                >
                  <CardContent className="p-4 h-40">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{pr.refNumber}</h3>
                      <Badge>{pr.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pr.description}</p>
                    <div className="text-xs text-muted-foreground mt-auto">
                      <p>Date: {pr.date?.toLocaleDateString()}</p>
                      <p>Type: {pr.type}</p>
                      <p>Total: ${pr.totalAmount?.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 