"use client"

import { useState } from "react"
import { Loader2, TestTube, AlertCircle, CheckCircle, XCircle, TrendingUp, Package } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RecipeMapping {
  id: string
  posItemCode: string
  posDescription: string
  recipeCode: string
  recipeName: string
  portionSize: number
  unit: string
  conversionRate: number
  isActive: boolean
}

interface TestResult {
  status: "success" | "warning" | "error"
  message: string
  details?: {
    inventoryImpact?: {
      ingredient: string
      required: number
      available: number
      unit: string
      status: "ok" | "low" | "out"
    }[]
    costAnalysis?: {
      recipeCost: number
      posPrice: number
      margin: number
      marginPercentage: number
    }
    validationErrors?: string[]
  }
}

interface TestMappingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: RecipeMapping | null
}

export function TestMappingModal({
  open,
  onOpenChange,
  mapping,
}: TestMappingModalProps) {
  const [testQuantity, setTestQuantity] = useState("1")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testProgress, setTestProgress] = useState(0)

  // Simulate mapping test
  const handleTest = async () => {
    if (!mapping) return

    setIsTesting(true)
    setTestProgress(0)
    setTestResult(null)

    try {
      // Simulate progressive test steps
      const steps = [
        { name: "Validating mapping configuration", duration: 300 },
        { name: "Fetching recipe details", duration: 400 },
        { name: "Calculating inventory requirements", duration: 500 },
        { name: "Checking stock availability", duration: 400 },
        { name: "Analyzing cost and margin", duration: 300 },
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, steps[i].duration))
        setTestProgress(((i + 1) / steps.length) * 100)
      }

      // Mock test result
      const quantity = parseFloat(testQuantity) || 1
      const result: TestResult = {
        status: "success",
        message: `Successfully tested mapping for ${quantity} ${quantity === 1 ? 'portion' : 'portions'}`,
        details: {
          inventoryImpact: [
            {
              ingredient: "Mozzarella Cheese",
              required: 200 * quantity,
              available: 5000,
              unit: "g",
              status: "ok",
            },
            {
              ingredient: "Pizza Dough",
              required: 300 * quantity,
              available: 2000,
              unit: "g",
              status: "ok",
            },
            {
              ingredient: "Tomato Sauce",
              required: 150 * quantity,
              available: 800,
              unit: "ml",
              status: "ok",
            },
            {
              ingredient: "Fresh Basil",
              required: 10 * quantity,
              available: 25,
              unit: "g",
              status: quantity > 2 ? "low" : "ok",
            },
            {
              ingredient: "Olive Oil",
              required: 20 * quantity,
              available: 15,
              unit: "ml",
              status: quantity > 1 ? "out" : "ok",
            },
          ],
          costAnalysis: {
            recipeCost: 8.50 * quantity,
            posPrice: 15.00 * quantity,
            margin: 6.50 * quantity,
            marginPercentage: 43.33,
          },
          validationErrors: [],
        },
      }

      // Check for issues
      const hasLowStock = result.details?.inventoryImpact?.some(item => item.status === "low")
      const hasOutOfStock = result.details?.inventoryImpact?.some(item => item.status === "out")

      if (hasOutOfStock) {
        result.status = "error"
        result.message = "Test failed: Insufficient stock for some ingredients"
      } else if (hasLowStock) {
        result.status = "warning"
        result.message = "Test successful with warnings: Some ingredients are running low"
      }

      setTestResult(result)
    } catch (error) {
      setTestResult({
        status: "error",
        message: "Test failed: An unexpected error occurred",
        details: {
          validationErrors: ["Unable to complete test. Please try again."],
        },
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleClose = () => {
    setTestResult(null)
    setTestProgress(0)
    setTestQuantity("1")
    onOpenChange(false)
  }

  // Get status icon and color
  const getStatusDisplay = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/10",
          borderColor: "border-green-200 dark:border-green-900/20",
        }
      case "warning":
        return {
          icon: AlertCircle,
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/10",
          borderColor: "border-amber-200 dark:border-amber-900/20",
        }
      case "error":
        return {
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/20",
        }
    }
  }

  // Get inventory status badge
  const getInventoryStatusBadge = (status: "ok" | "low" | "out") => {
    switch (status) {
      case "ok":
        return <Badge variant="outline" className="text-green-600 border-green-600">In Stock</Badge>
      case "low":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Low Stock</Badge>
      case "out":
        return <Badge variant="destructive">Out of Stock</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Recipe Mapping
          </DialogTitle>
          <DialogDescription>
            Test the mapping for {mapping?.posDescription} to verify inventory availability and cost analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Mapping Info */}
          <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">POS Item:</span>
              <span className="font-medium">{mapping?.posDescription} ({mapping?.posItemCode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipe:</span>
              <span className="font-medium">{mapping?.recipeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Portion Size:</span>
              <span className="font-medium">{mapping?.portionSize} {mapping?.unit}</span>
            </div>
          </div>

          <Separator />

          {/* Test Configuration */}
          <div className="space-y-2">
            <Label htmlFor="test-quantity">Test Quantity (Portions)</Label>
            <Input
              id="test-quantity"
              type="number"
              min="1"
              max="100"
              step="1"
              value={testQuantity}
              onChange={(e) => setTestQuantity(e.target.value)}
              placeholder="Enter number of portions to test"
              disabled={isTesting}
            />
            <p className="text-xs text-muted-foreground">
              Simulate selling this many portions to check inventory impact
            </p>
          </div>

          {/* Test Progress */}
          {isTesting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Running test...</span>
                <span className="font-medium">{Math.round(testProgress)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="space-y-4">
              <Separator />

              {/* Status Alert */}
              <Alert className={`${getStatusDisplay(testResult.status).bgColor} ${getStatusDisplay(testResult.status).borderColor}`}>
                {(() => {
                  const StatusIcon = getStatusDisplay(testResult.status).icon
                  return <StatusIcon className={`h-4 w-4 ${getStatusDisplay(testResult.status).color}`} />
                })()}
                <AlertDescription className="ml-2">
                  {testResult.message}
                </AlertDescription>
              </Alert>

              {/* Inventory Impact */}
              {testResult.details?.inventoryImpact && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Inventory Impact</h4>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead className="text-right">Required</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testResult.details.inventoryImpact.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.ingredient}</TableCell>
                            <TableCell className="text-right">
                              {item.required} {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.available} {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {getInventoryStatusBadge(item.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Cost Analysis */}
              {testResult.details?.costAnalysis && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Cost Analysis</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Recipe Cost</p>
                      <p className="text-lg font-semibold">
                        ${testResult.details.costAnalysis.recipeCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">POS Price</p>
                      <p className="text-lg font-semibold">
                        ${testResult.details.costAnalysis.posPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300 mb-1">Gross Margin</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        ${testResult.details.costAnalysis.margin.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300 mb-1">Margin %</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {testResult.details.costAnalysis.marginPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isTesting}>
            Close
          </Button>
          <Button onClick={handleTest} disabled={isTesting || !testQuantity || parseFloat(testQuantity) <= 0}>
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
