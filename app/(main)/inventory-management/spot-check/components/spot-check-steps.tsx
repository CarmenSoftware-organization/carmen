"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar,
  Users,
  Wrench,
  Map,
  ClipboardList,
  Users2,
  ScanLine,
  ShieldCheck,
  Package2,
  DollarSign,
  MapPin,
  Tags,
  ClipboardCheck,
  CheckCircle2,
  RefreshCcw,
  FileText,
  GitCompare,
  Search,
  FileEdit,
  CheckSquare,
  FileBarChart,
  ListTodo,
  Settings2,
  BookOpen,
  type LucideIcon
} from "lucide-react"

// Sample inventory data - replace with actual data from your API
const inventoryItems = [
  { id: '1', sku: 'SKU001', name: 'Item 1', location: 'A1-01', quantity: 100, unit: 'pcs', lastCount: '2024-01-15' },
  { id: '2', sku: 'SKU002', name: 'Item 2', location: 'A1-02', quantity: 150, unit: 'kg', lastCount: '2024-01-14' },
  { id: '3', sku: 'SKU003', name: 'Item 3', location: 'B2-01', quantity: 75, unit: 'boxes', lastCount: '2024-01-13' },
  { id: '4', sku: 'SKU004', name: 'Item 4', location: 'B2-02', quantity: 200, unit: 'pcs', lastCount: '2024-01-12' },
  { id: '5', sku: 'SKU005', name: 'Item 5', location: 'C3-01', quantity: 50, unit: 'liters', lastCount: '2024-01-11' },
]

interface InventoryItem {
  id: string
  sku: string
  name: string
  location: string
  quantity: number
  unit: string
  lastCount: string
}

interface StepOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Step {
  title: string;
  options: StepOption[];
  details?: {
    schedule?: {
      date: string;
      startTime: string;
      endTime: string;
      type: string;
    };
    personnel?: { id: string; name: string; role: string }[];
    tools?: string[];
    zones?: string[];
    checklist?: {
      areaClean: boolean;
      obstaclesRemoved: boolean;
      lightingAdequate: boolean;
      safetyEquipment: boolean;
    };
    briefingTopics?: string[];
    equipment?: { type: string; status: "checked" | "pending" | "issue" }[];
  };
}

const steps: Step[] = [
  {
    title: "Planning",
    options: [
      { id: "schedule", label: "Schedule Setup", icon: Calendar },
      { id: "personnel", label: "Personnel Assignment", icon: Users2 },
      { id: "tools", label: "Tools & Equipment", icon: Wrench },
      { id: "areas", label: "Areas & Zones", icon: MapPin },
    ],
  },
  {
    title: "Pre-Count",
    options: [
      { id: "checklist", label: "Area Checklist", icon: ClipboardList },
      { id: "briefing", label: "Team Briefing", icon: Users },
      { id: "equipment", label: "Equipment Check", icon: Settings2 },
      { id: "guidelines", label: "Count Guidelines", icon: BookOpen },
    ],
  },
  {
    title: "Count",
    options: [
      { id: "scan", label: "Scan Items", icon: ScanLine },
      { id: "verify", label: "Verify Counts", icon: ShieldCheck },
      { id: "document", label: "Document Issues", icon: FileText },
      { id: "review", label: "Review Progress", icon: Search },
    ],
  },
  {
    title: "Reconciliation",
    options: [
      { id: "compare", label: "System Comparison", icon: GitCompare },
      { id: "adjust", label: "Adjustments", icon: FileEdit },
      { id: "approve", label: "Approvals", icon: CheckSquare },
      { id: "report", label: "Generate Report", icon: FileBarChart },
    ],
  },
  {
    title: "Follow-up",
    options: [
      { id: "actions", label: "Action Items", icon: ListTodo },
      { id: "improvements", label: "Process Improvements", icon: RefreshCcw },
      { id: "lessons", label: "Lessons Learned", icon: BookOpen },
    ],
  },
]

interface CountDetails {
  id: string;
  initialCount: number;
  verificationCount?: number;
  variance: number;
  status: 'pending' | 'matched' | 'discrepancy' | 'approved';
  countMethod: string;
  notes: string;
  countedBy: string;
  verifiedBy?: string;
  timestamp: string;
}

interface SpotCheckData {
  id: string;
  status: 'draft' | 'in-progress' | 'completed';
  trigger: {
    type: string;
    reason: string;
    initiatedBy: string;
    date: string;
  };
  planning: {
    schedule: {
      date: string;
      startTime: string;
      endTime: string;
      type: 'spot' | 'cycle' | 'period';
    };
    personnel: Array<{
      id: string;
      name: string;
      role: string;
    }>;
    tools: string[];
    zones: string[];
  };
  preCount: {
    checklist: {
      areaClean: boolean;
      obstaclesRemoved: boolean;
      lightingAdequate: boolean;
      safetyEquipment: boolean;
    };
    briefingTopics: string[];
    equipment: Array<{
      type: string;
      status: 'checked' | 'pending' | 'issue';
    }>;
  };
  selectedItems: InventoryItem[];
  counts: Record<string, CountDetails>;
  reconciliation: {
    systemComparison: {
      totalItems: number;
      matchedItems: number;
      discrepancies: number;
      accuracy: number;
    };
    approvals: Array<{
      level: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      timestamp: string;
      notes: string;
    }>;
  };
  followUp: {
    report: {
      summary: string;
      findings: string[];
      recommendations: string[];
    };
    actionItems: Array<{
      id: string;
      description: string;
      assignee: string;
      dueDate: string;
      status: 'open' | 'in-progress' | 'completed';
    }>;
    improvements: string[];
    lessonsLearned: string[];
  };
}

export function SpotCheckSteps() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>(() => ({
    0: [],
    1: [],
    2: [],
    3: [],
    4: []
  }))
  const [spotCheckData, setSpotCheckData] = useState<SpotCheckData>({
    id: crypto.randomUUID(),
    status: 'draft',
    trigger: {
      type: '',
      reason: '',
      initiatedBy: '',
      date: new Date().toISOString(),
    },
    planning: {
      schedule: {
        date: '',
        startTime: '',
        endTime: '',
        type: 'spot',
      },
      personnel: [],
      tools: [],
      zones: [],
    },
    preCount: {
      checklist: {
        areaClean: false,
        obstaclesRemoved: false,
        lightingAdequate: false,
        safetyEquipment: false,
      },
      briefingTopics: [],
      equipment: [],
    },
    selectedItems: [],
    counts: {},
    reconciliation: {
      systemComparison: {
        totalItems: 0,
        matchedItems: 0,
        discrepancies: 0,
        accuracy: 0,
      },
      approvals: [],
    },
    followUp: {
      report: {
        summary: '',
        findings: [],
        recommendations: [],
      },
      actionItems: [],
      improvements: [],
      lessonsLearned: [],
    },
  })

  const [notes, setNotes] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])

  const handleOptionToggle = (id: string) => {
    setSelectedOptions(prev => {
      const current = prev[currentStep] ?? []
      const updated = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
      return { ...prev, [currentStep]: updated }
    })
  }

  const handleItemToggle = (item: InventoryItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id)
      if (isSelected) {
        return prev.filter(i => i.id !== item.id)
      }
      return [...prev, item]
    })
  }

  const filteredItems = inventoryItems.filter(item =>
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Steps sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`p-3 rounded-lg cursor-pointer ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-muted"
                  : "bg-background border"
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="font-medium">{step.title}</div>
              {selectedOptions[index]?.length > 0 && (
                <div className="text-sm mt-1">
                  {selectedOptions[index].length} selected
                </div>
              )}
              {index === 1 && selectedItems.length > 0 && (
                <div className="text-sm mt-1">
                  {selectedItems.length} items selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{steps[currentStep].title}</h2>
          
          <div className="space-y-6">
            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {steps[currentStep].options.map((option) => {
                const Icon = option.icon
                const isSelected = selectedOptions[currentStep]?.includes(option.id)
                return (
                  <div
                    key={option.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted ${
                      isSelected ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <Checkbox
                      id={option.id}
                      checked={isSelected}
                      onCheckedChange={() => handleOptionToggle(option.id)}
                      className="mt-1"
                    />
                    <div className="flex gap-3 items-center">
                      <Icon className="h-5 w-5" />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Count execution step specific UI */}
            {currentStep === 2 && selectedItems.length > 0 && (
              <div className="space-y-4 mt-6">
                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Count Details for Selected Items</h3>
                  <div className="space-y-6">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="space-y-4 pb-4 border-b last:border-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.sku} - {item.name}</h4>
                          <span className="text-sm text-muted-foreground">Unit: {item.unit}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Expected Quantity ({item.quantity} {item.unit})</Label>
                            <div className="flex gap-2">
                              <Input type="number" placeholder="0" />
                              <div className="flex items-center px-3 border rounded-md bg-muted">
                                <span className="text-sm capitalize">{item.unit}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Actual Count</Label>
                            <div className="flex gap-2">
                              <Input type="number" placeholder="0" />
                              <div className="flex items-center px-3 border rounded-md bg-muted">
                                <span className="text-sm capitalize">{item.unit}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Count Notes</Label>
                          <Textarea placeholder="Add notes about this item's count..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Count Method</Label>
                            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="manual">Manual Count</option>
                              <option value="scale">Scale Measurement</option>
                              <option value="automated">Automated System</option>
                              <option value="estimate">Visual Estimate</option>
                            </select>
                          </div>
                          <div>
                            <Label>Count Status</Label>
                            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="matched">Matched</option>
                              <option value="discrepancy">Discrepancy Found</option>
                              <option value="pending">Pending Verification</option>
                              <option value="issue">Counting Issue</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Planning phase UI */}
            {currentStep === 0 && (
              <div className="space-y-6 mt-6">
                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Schedule Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={spotCheckData.planning.schedule.date}
                        onChange={(e) => setSpotCheckData(prev => ({
                          ...prev,
                          planning: {
                            ...prev.planning,
                            schedule: {
                              ...prev.planning.schedule,
                              date: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Count Type</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                        value={spotCheckData.planning.schedule.type}
                        onChange={(e) => setSpotCheckData(prev => ({
                          ...prev,
                          planning: {
                            ...prev.planning,
                            schedule: {
                              ...prev.planning.schedule,
                              type: e.target.value as 'spot' | 'cycle' | 'period'
                            }
                          }
                        }))}
                      >
                        <option value="spot">Spot Check</option>
                        <option value="cycle">Cycle Count</option>
                        <option value="period">Period End</option>
                      </select>
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={spotCheckData.planning.schedule.startTime}
                        onChange={(e) => setSpotCheckData(prev => ({
                          ...prev,
                          planning: {
                            ...prev.planning,
                            schedule: {
                              ...prev.planning.schedule,
                              startTime: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={spotCheckData.planning.schedule.endTime}
                        onChange={(e) => setSpotCheckData(prev => ({
                          ...prev,
                          planning: {
                            ...prev.planning,
                            schedule: {
                              ...prev.planning.schedule,
                              endTime: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Resource Allocation</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Team member name" />
                      <select className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors">
                        <option value="">Select role</option>
                        <option value="counter">Counter</option>
                        <option value="verifier">Verifier</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                      <Button>Add</Button>
                    </div>
                    {spotCheckData.planning.personnel.length > 0 && (
                      <div className="border rounded-lg p-2">
                        {spotCheckData.planning.personnel.map((person) => (
                          <div key={person.id} className="flex items-center justify-between py-2">
                            <div>
                              <span className="font-medium">{person.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">({person.role})</span>
                            </div>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Tools & Equipment</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Equipment name" />
                      <Button>Add</Button>
                    </div>
                    {spotCheckData.planning.tools.length > 0 && (
                      <div className="border rounded-lg p-2">
                        {spotCheckData.planning.tools.map((tool, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span>{tool}</span>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Zone Definition</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Zone identifier" />
                      <Button>Add</Button>
                    </div>
                    {spotCheckData.planning.zones.length > 0 && (
                      <div className="border rounded-lg p-2">
                        {spotCheckData.planning.zones.map((zone, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span>{zone}</span>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Pre-count phase UI */}
            {currentStep === 1 && (
              <div className="space-y-6 mt-6">
                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Area Preparation Checklist</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={spotCheckData.preCount.checklist.areaClean}
                        onCheckedChange={(checked) => setSpotCheckData(prev => ({
                          ...prev,
                          preCount: {
                            ...prev.preCount,
                            checklist: {
                              ...prev.preCount.checklist,
                              areaClean: checked as boolean
                            }
                          }
                        }))}
                      />
                      <Label>Area is clean and organized</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={spotCheckData.preCount.checklist.obstaclesRemoved}
                        onCheckedChange={(checked) => setSpotCheckData(prev => ({
                          ...prev,
                          preCount: {
                            ...prev.preCount,
                            checklist: {
                              ...prev.preCount.checklist,
                              obstaclesRemoved: checked as boolean
                            }
                          }
                        }))}
                      />
                      <Label>All obstacles removed</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={spotCheckData.preCount.checklist.lightingAdequate}
                        onCheckedChange={(checked) => setSpotCheckData(prev => ({
                          ...prev,
                          preCount: {
                            ...prev.preCount,
                            checklist: {
                              ...prev.preCount.checklist,
                              lightingAdequate: checked as boolean
                            }
                          }
                        }))}
                      />
                      <Label>Adequate lighting available</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={spotCheckData.preCount.checklist.safetyEquipment}
                        onCheckedChange={(checked) => setSpotCheckData(prev => ({
                          ...prev,
                          preCount: {
                            ...prev.preCount,
                            checklist: {
                              ...prev.preCount.checklist,
                              safetyEquipment: checked as boolean
                            }
                          }
                        }))}
                      />
                      <Label>Safety equipment in place</Label>
                    </div>
                  </div>
                </Card>

                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Team Briefing Topics</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Add briefing topic" />
                      <Button>Add</Button>
                    </div>
                    {spotCheckData.preCount.briefingTopics.length > 0 && (
                      <div className="border rounded-lg p-2">
                        {spotCheckData.preCount.briefingTopics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span>{topic}</span>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="border p-4">
                  <h3 className="font-medium mb-4">Equipment Check</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Equipment type" />
                      <select className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors">
                        <option value="checked">Checked</option>
                        <option value="pending">Pending</option>
                        <option value="issue">Issue</option>
                      </select>
                      <Button>Add</Button>
                    </div>
                    {spotCheckData.preCount.equipment.length > 0 && (
                      <div className="border rounded-lg p-2">
                        {spotCheckData.preCount.equipment.map((equip, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div>
                              <span className="font-medium">{equip.type}</span>
                              <span className={`ml-2 text-sm ${
                                equip.status === 'checked' ? 'text-green-500' :
                                equip.status === 'issue' ? 'text-red-500' :
                                'text-yellow-500'
                              }`}>
                                {equip.status}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Item selection step specific UI */}
            {currentStep === 2 && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 relative">
                  <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by SKU, name, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Card className="border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Last Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className={selectedItems.some(i => i.id === item.id) ? "bg-primary/5" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.some(i => i.id === item.id)}
                              onCheckedChange={() => handleItemToggle(item)}
                            />
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="capitalize">{item.unit}</TableCell>
                          <TableCell>{item.lastCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                {selectedItems.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Selected Items ({selectedItems.length})</h3>
                    <ScrollArea className="h-24">
                      <div className="space-y-2">
                        {selectedItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span>{item.sku} - {item.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleItemToggle(item)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {/* Notes field */}
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="mt-2"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  !selectedOptions[currentStep]?.length ||
                  (currentStep === 2 && selectedItems.length === 0) ||
                  currentStep === steps.length - 1
                }
              >
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
