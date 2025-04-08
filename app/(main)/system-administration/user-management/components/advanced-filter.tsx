'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, X, Filter, SlidersHorizontal, Save, RotateCcw, BookmarkPlus, CheckCircle2, XCircle, AlertCircle, User, Building, Mail, Calendar, Clock, Shield } from "lucide-react"

export interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string
}

export interface FilterPreset {
  id: string
  name: string
  conditions: FilterCondition[]
}

interface AdvancedFilterProps {
  filterConditions: FilterCondition[]
  onFilterChange: (conditions: FilterCondition[]) => void
  onSavePreset?: (preset: FilterPreset) => void
  presets?: FilterPreset[]
  onApplyPreset?: (presetId: string) => void
}

const FILTER_FIELDS = [
  { label: "Name", value: "name", icon: <User className="h-4 w-4 mr-2" /> },
  { label: "Email", value: "email", icon: <Mail className="h-4 w-4 mr-2" /> },
  { label: "Business Unit", value: "businessUnit", icon: <Building className="h-4 w-4 mr-2" /> },
  { label: "Department", value: "department", icon: <Building className="h-4 w-4 mr-2" /> },
  { label: "Role", value: "roles", icon: <Shield className="h-4 w-4 mr-2" /> },
  { label: "HOD Status", value: "hodStatus", icon: <CheckCircle2 className="h-4 w-4 mr-2" /> },
  { label: "Invite Status", value: "inviteStatus", icon: <Mail className="h-4 w-4 mr-2" /> },
  { label: "Account Status", value: "accountStatus", icon: <Shield className="h-4 w-4 mr-2" /> },
  { label: "Last Login", value: "lastLogin", icon: <Clock className="h-4 w-4 mr-2" /> }
]

const FILTER_OPERATORS = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "notEquals" },
  { label: "Is empty", value: "isEmpty" },
  { label: "Is not empty", value: "isNotEmpty" },
  { label: "Greater than", value: "greaterThan" },
  { label: "Less than", value: "lessThan" }
]

export function AdvancedFilter({
  filterConditions,
  onFilterChange,
  onSavePreset,
  presets = [],
  onApplyPreset
}: AdvancedFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [activeTab, setActiveTab] = useState("filters")

  const addFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: FILTER_FIELDS[0].value,
      operator: FILTER_OPERATORS[0].value,
      value: ""
    }
    onFilterChange([...filterConditions, newCondition])
  }

  const removeFilterCondition = (id: string) => {
    onFilterChange(filterConditions.filter((condition) => condition.id !== id))
  }

  const updateFilterCondition = (
    id: string,
    field: keyof FilterCondition,
    value: string
  ) => {
    onFilterChange(
      filterConditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    )
  }

  const clearAllFilters = () => {
    onFilterChange([])
  }

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset({
        id: Math.random().toString(36).substr(2, 9),
        name: presetName,
        conditions: [...filterConditions]
      })
      setPresetName("")
      setIsPresetDialogOpen(false)
    }
  }

  const getFieldIcon = (fieldValue: string) => {
    const field = FILTER_FIELDS.find(f => f.value === fieldValue)
    return field?.icon || <Filter className="h-4 w-4 mr-2" />
  }

  return (
    <div>
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={filterConditions.length > 0 ? "default" : "outline"} 
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
            {filterConditions.length > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-primary/20 hover:bg-primary/30"
              >
                {filterConditions.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[650px] p-0" align="end">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                {filterConditions.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPresetDialogOpen(true)}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save as Preset
                </Button>
              </div>
            </div>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  )
} 