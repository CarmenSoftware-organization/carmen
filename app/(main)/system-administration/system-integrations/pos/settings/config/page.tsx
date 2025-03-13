"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SettingsNav } from "../../components/settings-nav"
import { SettingsHelpSection } from "../../components/settings-help-section"

export default function POSConfigPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    posSystem: "",
    interfaceType: "api", // Default to API
    apiEndpoint: "",
    securityToken: "",
    filePath: "",
    filePattern: "",
  })
  
  const [showToken, setShowToken] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [isConnectionTesting, setIsConnectionTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"none" | "success" | "error">("none")
  const [connectionMessage, setConnectionMessage] = useState("")
  
  const [fieldMappings, setFieldMappings] = useState([
    { id: "1", posField: "item_code", systemField: "posItemCode", dataType: "string", required: true },
    { id: "2", posField: "description", systemField: "posDescription", dataType: "string", required: true },
    { id: "3", posField: "price", systemField: "price", dataType: "decimal", required: true },
    { id: "4", posField: "quantity", systemField: "quantity", dataType: "decimal", required: true },
  ])

  // Available options for mappings
  const posFieldOptions = [
    { value: "item_code", label: "Item Code" },
    { value: "description", label: "Description" },
    { value: "price", label: "Price" },
    { value: "quantity", label: "Quantity" },
    { value: "date", label: "Transaction Date" },
    { value: "time", label: "Transaction Time" },
    { value: "outlet", label: "Outlet" },
    { value: "cashier", label: "Cashier" },
    { value: "unit", label: "Unit" },
    { value: "category", label: "Category" },
  ]
  
  const systemFieldOptions = [
    { value: "posItemCode", label: "POS Item Code" },
    { value: "posDescription", label: "POS Description" },
    { value: "price", label: "Price" },
    { value: "quantity", label: "Quantity" },
    { value: "transactionDate", label: "Transaction Date" },
    { value: "transactionTime", label: "Transaction Time" },
    { value: "outlet", label: "Outlet" },
    { value: "cashier", label: "Cashier" },
    { value: "unit", label: "Unit" },
    { value: "category", label: "Category" },
  ]
  
  const dataTypeOptions = [
    { value: "string", label: "Text" },
    { value: "integer", label: "Integer" },
    { value: "decimal", label: "Decimal" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "Date & Time" },
    { value: "boolean", label: "Yes/No" },
  ]

  // Sample data for preview
  const sampleData = [
    { item_code: "POS001", description: "Chicken Curry", price: 12.75, quantity: 2 },
    { item_code: "POS002", description: "Vegetable Pasta", price: 10.50, quantity: 1 },
    { item_code: "POS003", description: "Caesar Salad", price: 8.25, quantity: 1 },
  ]

  useEffect(() => {
    // Check if form data has changed from initial state
    setIsFormChanged(
      formData.posSystem !== "" ||
      formData.apiEndpoint !== "" ||
      formData.securityToken !== "" ||
      formData.filePath !== "" ||
      formData.filePattern !== ""
    )
  }, [formData])

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S to save configuration
      if (e.altKey && e.key === 's' && isFormChanged) {
        e.preventDefault()
        saveConfiguration()
      }
      
      // Alt+T to test connection
      if (e.altKey && e.key === 't' && formData.interfaceType === 'api' && formData.apiEndpoint && formData.securityToken) {
        e.preventDefault()
        testConnection()
      }
      
      // Alt+Y to switch to System Settings
      if (e.altKey && e.key === 'y') {
        e.preventDefault()
        router.push('/system-administration/system-integrations/pos/settings/system')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFormChanged, formData, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInterfaceTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      interfaceType: value,
      // Reset fields for the other interface type
      ...(value === "api" 
        ? { filePath: "", filePattern: "" } 
        : { apiEndpoint: "", securityToken: "" })
    }))
  }

  const handleFieldMappingChange = (id: string, field: string, value: string | boolean) => {
    setFieldMappings((prevMappings) =>
      prevMappings.map((mapping) =>
        mapping.id === id ? { ...mapping, [field]: value } : mapping
      )
    )
  }

  const addFieldMapping = () => {
    const newId = (fieldMappings.length + 1).toString()
    setFieldMappings((prev) => [
      ...prev,
      { id: newId, posField: "", systemField: "", dataType: "string", required: false }
    ])
  }

  const removeFieldMapping = (id: string) => {
    setFieldMappings((prev) => prev.filter((mapping) => mapping.id !== id))
  }

  const testConnection = async () => {
    setIsConnectionTesting(true)
    setConnectionStatus("none")
    setConnectionMessage("")
    
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Simulate successful connection
      if (formData.apiEndpoint && formData.securityToken) {
        setConnectionStatus("success")
        setConnectionMessage("Connection successful! API endpoint is reachable and credentials are valid.")
      } else {
        setConnectionStatus("error")
        setConnectionMessage("Connection failed. Please check your API endpoint and security token.")
      }
    } catch (error) {
      setConnectionStatus("error")
      setConnectionMessage("An error occurred while testing the connection.")
    } finally {
      setIsConnectionTesting(false)
    }
  }

  const saveConfiguration = () => {
    // In a real application, this would save to the backend
    console.log("Saving configuration:", { formData, fieldMappings })
    // Show success notification
    alert("Configuration saved successfully!")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SettingsNav activeTab="config" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">POS Configuration</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+S</kbd> Save
            {formData.interfaceType === 'api' && (
              <span className="ml-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+T</kbd> Test
              </span>
            )}
          </div>
          <Button 
            disabled={!isFormChanged} 
            onClick={saveConfiguration} 
            className="ml-auto"
            aria-label="Save configuration settings"
          >
            Save Configuration
          </Button>
        </div>
      </div>
      
      {/* POS Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle>POS System Selection</CardTitle>
          <CardDescription>Select your Point of Sale system type and interface method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pos-system" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Select POS System
            </Label>
            <Select 
              value={formData.posSystem} 
              onValueChange={(value) => handleInputChange("posSystem", value)}
            >
              <SelectTrigger id="pos-system" aria-label="Select POS System">
                <SelectValue placeholder="Select POS System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comanche">Comanche</SelectItem>
                <SelectItem value="soraso">Soraso</SelectItem>
                <SelectItem value="easypos">Easy POS</SelectItem>
                <SelectItem value="hoteltime">HotelTime</SelectItem>
                <SelectItem value="infrasys">Infrasys</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Interface Type
            </Label>
            <RadioGroup 
              value={formData.interfaceType} 
              onValueChange={handleInterfaceTypeChange}
              className="flex space-x-4"
              aria-label="Interface Type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="api" id="api" />
                <Label htmlFor="api">API</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Text File</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>
            Configure how to connect to your POS system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.interfaceType === "api" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="api-endpoint" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  API Endpoint URL
                </Label>
                <Input
                  id="api-endpoint"
                  placeholder="https://api.example.com"
                  value={formData.apiEndpoint}
                  onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The base URL for the POS API
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="security-token" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Security Token
                </Label>
                <div className="relative">
                  <Input
                    id="security-token"
                    type={showToken ? "text" : "password"}
                    placeholder="Enter security token"
                    value={formData.securityToken}
                    onChange={(e) => handleInputChange("securityToken", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API security token or key
                </p>
              </div>
              
              <Button 
                onClick={testConnection} 
                disabled={!formData.apiEndpoint || !formData.securityToken || isConnectionTesting}
                variant="outline"
                className="mt-4"
              >
                {isConnectionTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Test Connection
                  </>
                )}
              </Button>
              
              {connectionStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    {connectionMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              {connectionStatus === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-600">
                    {connectionMessage}
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="file-path" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  File Drop Location
                </Label>
                <Input
                  id="file-path"
                  placeholder="/path/to/files"
                  value={formData.filePath}
                  onChange={(e) => handleInputChange("filePath", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Directory path where POS files will be dropped
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file-pattern" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  File Name Pattern
                </Label>
                <Input
                  id="file-pattern"
                  placeholder="pos_data_*.txt"
                  value={formData.filePattern}
                  onChange={(e) => handleInputChange("filePattern", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Pattern to match POS data files (use * as wildcard)
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Data Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Data Format Settings</CardTitle>
          <CardDescription>
            Configure how data is mapped between your POS system and this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mapping">
            <TabsList className="mb-4">
              <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
              <TabsTrigger value="preview">Sample Data Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mapping" className="space-y-4">
              <div role="region" aria-label="Field mapping configuration">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>POS Field</TableHead>
                      <TableHead>System Field</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead className="w-[100px]">Required</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <Select
                            value={mapping.posField}
                            onValueChange={(value) => handleFieldMappingChange(mapping.id, "posField", value)}
                            aria-label={`POS field for mapping ${mapping.id}`}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select POS field" />
                            </SelectTrigger>
                            <SelectContent>
                              {posFieldOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping.systemField}
                            onValueChange={(value) => handleFieldMappingChange(mapping.id, "systemField", value)}
                            aria-label={`System field for mapping ${mapping.id}`}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select system field" />
                            </SelectTrigger>
                            <SelectContent>
                              {systemFieldOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping.dataType}
                            onValueChange={(value) => handleFieldMappingChange(mapping.id, "dataType", value)}
                            aria-label={`Data type for mapping ${mapping.id}`}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select data type" />
                            </SelectTrigger>
                            <SelectContent>
                              {dataTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={mapping.required}
                            onCheckedChange={(checked) => handleFieldMappingChange(mapping.id, "required", !!checked)}
                            aria-label={`Required field for mapping ${mapping.id}`}
                            id={`required-${mapping.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFieldMapping(mapping.id)}
                            disabled={fieldMappings.length <= 1}
                            aria-label={`Remove mapping ${mapping.id}`}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Button 
                  variant="outline" 
                  onClick={addFieldMapping} 
                  className="mt-2"
                  aria-label="Add a new field mapping"
                >
                  Add Field Mapping
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div aria-label="Sample data preview" className="rounded-md border overflow-auto max-h-[400px]">
                <Table>
                  <caption className="sr-only">Sample data preview from POS system</caption>
                  <TableHeader>
                    <TableRow>
                      {posFieldOptions.map((field) => (
                        <TableHead key={field.value}>{field.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.item_code}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.price}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>2023-12-01</TableCell>
                        <TableCell>14:30:00</TableCell>
                        <TableCell>Main Restaurant</TableCell>
                        <TableCell>John Doe</TableCell>
                        <TableCell>Plate</TableCell>
                        <TableCell>Main Course</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" aria-label="Refresh sample data">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Sample Data
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SettingsHelpSection 
        pageName="POS Configuration" 
        shortcuts={[
          { key: "Alt+S", description: "Save configuration" },
          { key: "Alt+T", description: "Test connection" },
          { key: "Alt+Y", description: "Go to System Settings" }
        ]}
      />
    </div>
  )
} 