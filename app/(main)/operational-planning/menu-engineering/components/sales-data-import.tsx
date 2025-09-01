'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Settings,
  RefreshCw,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  totalRecords?: number;
  processedRecords?: number;
  validRecords?: number;
  errorRecords?: number;
  errors?: ImportError[];
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  isRequired: boolean;
  dataType: string;
}

const POS_SYSTEMS = [
  { value: 'square', label: 'Square', icon: '□' },
  { value: 'toast', label: 'Toast', icon: '🍞' },
  { value: 'clover', label: 'Clover', icon: '🍀' },
  { value: 'resy', label: 'Resy', icon: '🍽️' },
  { value: 'opentable', label: 'OpenTable', icon: '🪑' },
  { value: 'custom', label: 'Custom CSV/Excel', icon: '📊' }
];

const TARGET_FIELDS = [
  { value: 'recipeId', label: 'Recipe ID', required: false },
  { value: 'recipeName', label: 'Recipe Name', required: true },
  { value: 'quantity', label: 'Quantity', required: true },
  { value: 'unitPrice', label: 'Unit Price', required: true },
  { value: 'totalPrice', label: 'Total Price', required: false },
  { value: 'orderDate', label: 'Order Date', required: true },
  { value: 'orderId', label: 'Order ID', required: false },
  { value: 'customerId', label: 'Customer ID', required: false }
];

export default function SalesDataImport() {
  const [importFiles, setImportFiles] = useState<ImportFile[]>([]);
  const [selectedPosSystem, setSelectedPosSystem] = useState('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'processing' | 'results'>('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ImportFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setImportFiles(prev => [...prev, ...newFiles]);

    // Simulate file analysis to extract headers
    if (acceptedFiles.length > 0) {
      // Mock source fields - in real implementation, this would parse the file
      setSourceFields(['item_name', 'qty', 'price', 'total', 'date', 'order_id', 'customer']);
      setCurrentStep('mapping');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const handleFieldMappingChange = (index: number, field: keyof FieldMapping, value: string) => {
    const newMappings = [...fieldMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setFieldMappings(newMappings);
  };

  const addFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      {
        sourceField: '',
        targetField: '',
        isRequired: false,
        dataType: 'string'
      }
    ]);
  };

  const removeFieldMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const processImport = async () => {
    setCurrentStep('processing');
    
    // Simulate processing
    for (const file of importFiles) {
      setImportFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'processing', progress: 0 }
            : f
        )
      );

      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setImportFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress,
                  totalRecords: 1000,
                  processedRecords: Math.floor((progress / 100) * 1000),
                  validRecords: Math.floor((progress / 100) * 950),
                  errorRecords: Math.floor((progress / 100) * 50)
                }
              : f
          )
        );
      }

      // Mark as completed
      setImportFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                status: 'completed',
                errors: [
                  { row: 15, field: 'quantity', message: 'Invalid quantity format', value: 'abc' },
                  { row: 23, field: 'unitPrice', message: 'Price cannot be negative', value: '-5.50' },
                  { row: 67, field: 'orderDate', message: 'Invalid date format', value: '2024-13-45' }
                ]
              }
            : f
        )
      );
    }

    setCurrentStep('results');
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* POS System Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Data Source</CardTitle>
          <CardDescription>
            Choose your POS system or data format for optimized import settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {POS_SYSTEMS.map(system => (
              <Button
                key={system.value}
                variant={selectedPosSystem === system.value ? "default" : "outline"}
                className="h-16 flex-col gap-2"
                onClick={() => setSelectedPosSystem(system.value)}
              >
                <span className="text-2xl">{system.icon}</span>
                <span className="text-sm">{system.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Sales Data</CardTitle>
          <CardDescription>
            Drag and drop your files or click to browse. Supports CSV, Excel, and JSON formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel (.xlsx, .xls), and JSON files up to 10MB each
                </p>
              </>
            )}
          </div>

          {/* File List */}
          {importFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploaded Files</h4>
              {importFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {file.status}
                  </Badge>
                </div>
              ))}
              
              <Button 
                onClick={() => setCurrentStep('mapping')}
                className="w-full"
                disabled={importFiles.length === 0}
              >
                Continue to Mapping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Field Mapping</CardTitle>
          <CardDescription>
            Map your data fields to the required Carmen ERP fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-detected mappings */}
          <div className="space-y-3">
            <h4 className="font-medium">Suggested Mappings</h4>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Source Field</Label>
                  <p className="text-sm font-medium">item_name</p>
                </div>
                <div>
                  <ArrowRight className="h-4 w-4 mx-auto mt-4" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Target Field</Label>
                  <p className="text-sm font-medium">Recipe Name</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mt-3">Required</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Source Field</Label>
                  <p className="text-sm font-medium">qty</p>
                </div>
                <div>
                  <ArrowRight className="h-4 w-4 mx-auto mt-4" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Target Field</Label>
                  <p className="text-sm font-medium">Quantity</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mt-3">Required</Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Source Field</Label>
                  <p className="text-sm font-medium">price</p>
                </div>
                <div>
                  <ArrowRight className="h-4 w-4 mx-auto mt-4" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Target Field</Label>
                  <p className="text-sm font-medium">Unit Price</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mt-3">Required</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Custom mappings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Custom Mappings</h4>
              <Button variant="outline" size="sm" onClick={addFieldMapping}>
                Add Mapping
              </Button>
            </div>
            
            {fieldMappings.map((mapping, index) => (
              <div key={index} className="grid grid-cols-5 gap-3 p-3 border rounded-lg">
                <Select 
                  value={mapping.sourceField} 
                  onValueChange={(value) => handleFieldMappingChange(index, 'sourceField', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source field" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ArrowRight className="h-4 w-4 mx-auto mt-3" />

                <Select 
                  value={mapping.targetField} 
                  onValueChange={(value) => handleFieldMappingChange(index, 'targetField', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Target field" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_FIELDS.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label} {field.required && '*'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={mapping.dataType} 
                  onValueChange={(value) => handleFieldMappingChange(index, 'dataType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="money">Money</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeFieldMapping(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep('upload')}>
              Back
            </Button>
            <Button onClick={processImport} className="flex-1">
              Start Import
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processing Import</CardTitle>
          <CardDescription>
            Your files are being processed and validated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {importFiles.map(file => (
              <div key={file.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-6 w-6" />
                    <div>
                      <p className="font-medium">{file.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.processedRecords?.toLocaleString()} / {file.totalRecords?.toLocaleString()} records processed
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      file.status === 'completed' ? 'default' : 
                      file.status === 'error' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {file.status}
                  </Badge>
                </div>
                
                <Progress value={file.progress} className="h-2" />
                
                {file.status === 'processing' && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-green-600">{file.validRecords?.toLocaleString()}</p>
                      <p className="text-muted-foreground">Valid</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-red-600">{file.errorRecords?.toLocaleString()}</p>
                      <p className="text-muted-foreground">Errors</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{file.totalRecords?.toLocaleString()}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Results</CardTitle>
          <CardDescription>
            Review the import results and handle any errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {importFiles.map(file => (
              <div key={file.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">{file.file.name}</p>
                      <p className="text-sm text-muted-foreground">Import completed</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{file.validRecords}</p>
                    <p className="text-sm text-muted-foreground">Valid Records</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{file.errorRecords}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Duplicates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{file.totalRecords}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>

                {file.errors && file.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Import Errors ({file.errors.length})
                    </h4>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {file.errors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertDescription>
                              Row {error.row}: {error.message} (Value: "{error.value}")
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Import More Files
              </Button>
              <Button>
                View Menu Engineering Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'upload', label: 'Upload', icon: Upload },
              { key: 'mapping', label: 'Field Mapping', icon: Settings },
              { key: 'processing', label: 'Processing', icon: RefreshCw },
              { key: 'results', label: 'Results', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['upload', 'mapping', 'processing', 'results'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                    isActive ? "border-primary bg-primary text-primary-foreground" :
                    isCompleted ? "border-green-500 bg-green-500 text-white" :
                    "border-muted-foreground text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" :
                      isCompleted ? "text-green-600" :
                      "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-6",
                      isCompleted ? "bg-green-500" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'mapping' && renderMappingStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'results' && renderResultsStep()}
    </div>
  );
}