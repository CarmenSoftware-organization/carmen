'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScanIcon, DownloadIcon, Edit, PrinterIcon, MoreHorizontal, Eye, Trash2, Plus, Copy } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

interface APMapping {
  id: string
  businessUnit: string
  store: string
  category: string
  subCategory: string
  itemGroup: string
  department: string
  accountCode: string
}

interface GLMapping {
  id: string
  businessUnit: string
  store: string
  category: string
  itemGroup: string
  movementType: string
  drDepartment: string
  crDepartment: string
  drAccount: string
  crAccount: string
}

export function AccountCodeMapping() {
  const [selectedView, setSelectedView] = useState("posting-to-ap")
  const [searchTerm, setSearchTerm] = useState("")

  // State for CRUD operations
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedMapping, setSelectedMapping] = useState<APMapping | GLMapping | null>(null)

  // Mock data for Posting to AP view
  const [apMappingData, setApMappingData] = useState<APMapping[]>([
    { id: "1", businessUnit: "Operations", store: "Mini Bar", category: "Beverage", subCategory: "Beers", itemGroup: "Beer", department: "35", accountCode: "5000020" },
    { id: "2", businessUnit: "Operations", store: "MIN1", category: "Beverage", subCategory: "Spirits", itemGroup: "Vodka", department: "35", accountCode: "5000020" },
    { id: "3", businessUnit: "Rooms", store: "Rooms - Housekeeping", category: "Food", subCategory: "Dry Goods", itemGroup: "Coffee/Tea/Hot Bev.", department: "21", accountCode: "1116007" },
    { id: "4", businessUnit: "Rooms", store: "RH", category: "Food", subCategory: "Dry Goods", itemGroup: "Sugar", department: "21", accountCode: "1116007" },
    { id: "5", businessUnit: "Administration", store: "A&G - Security", category: "Beverage", subCategory: "Soft Drink", itemGroup: "Waters", department: "10", accountCode: "1111005" },
    { id: "6", businessUnit: "Administration", store: "AGS", category: "Beverage", subCategory: "Soft Drink", itemGroup: "Juices", department: "10", accountCode: "1111005" },
  ])

  // Mock data for Posting to GL view
  const [glMappingData, setGlMappingData] = useState<GLMapping[]>([
    { id: "1", businessUnit: "Operations", store: "Kitchen", category: "Food", itemGroup: "Vegetables", movementType: "Purchase", drDepartment: "Kitchen", crDepartment: "Inventory", drAccount: "5001001", crAccount: "1200001" },
    { id: "2", businessUnit: "Operations", store: "Kitchen", category: "Food", itemGroup: "Meat", movementType: "Transfer", drDepartment: "Kitchen", crDepartment: "Warehouse", drAccount: "5001002", crAccount: "1200002" },
    { id: "3", businessUnit: "Operations", store: "Bar", category: "Beverage", itemGroup: "Beer", movementType: "Sale", drDepartment: "Bar", crDepartment: "Revenue", drAccount: "1100001", crAccount: "4000001" },
    { id: "4", businessUnit: "Rooms", store: "Housekeeping", category: "Supplies", itemGroup: "Cleaning", movementType: "Usage", drDepartment: "Housekeeping", crDepartment: "Supplies", drAccount: "6001001", crAccount: "1200003" },
    { id: "5", businessUnit: "Administration", store: "Office", category: "Office Supplies", itemGroup: "Stationery", movementType: "Purchase", drDepartment: "Admin", crDepartment: "Inventory", drAccount: "6002001", crAccount: "1200004" },
  ])

  // Form state
  const [formData, setFormData] = useState<Partial<APMapping | GLMapping>>({})

  // Handlers
  const handleCreate = () => {
    setFormData({})
    setIsCreateDialogOpen(true)
  }

  const handleView = (mapping: APMapping | GLMapping) => {
    setSelectedMapping(mapping)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (mapping: APMapping | GLMapping) => {
    setSelectedMapping(mapping)
    setFormData(mapping)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      if (selectedView === "posting-to-ap") {
        setApMappingData(apMappingData.filter(m => m.id !== id))
      } else {
        setGlMappingData(glMappingData.filter(m => m.id !== id))
      }
    }
  }

  const handleDuplicate = (mapping: APMapping | GLMapping) => {
    const newId = String(Date.now())
    if (selectedView === "posting-to-ap") {
      setApMappingData([...apMappingData, { ...(mapping as APMapping), id: newId }])
    } else {
      setGlMappingData([...glMappingData, { ...(mapping as GLMapping), id: newId }])
    }
  }

  const handleSaveCreate = () => {
    const newId = String(Date.now())
    if (selectedView === "posting-to-ap") {
      setApMappingData([...apMappingData, { ...(formData as APMapping), id: newId }])
    } else {
      setGlMappingData([...glMappingData, { ...(formData as GLMapping), id: newId }])
    }
    setIsCreateDialogOpen(false)
    setFormData({})
  }

  const handleSaveEdit = () => {
    if (selectedView === "posting-to-ap") {
      setApMappingData(apMappingData.map(m => m.id === selectedMapping?.id ? formData as APMapping : m))
    } else {
      setGlMappingData(glMappingData.map(m => m.id === selectedMapping?.id ? formData as GLMapping : m))
    }
    setIsEditDialogOpen(false)
    setFormData({})
    setSelectedMapping(null)
  }

  const handleCloseView = (open: boolean) => {
    setIsViewDialogOpen(open)
    if (!open) {
      setSelectedMapping(null)
    }
  }

  const handleCloseCreate = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setFormData({})
    }
  }

  const handleCloseEdit = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setFormData({})
      setSelectedMapping(null)
    }
  }

  const handleScan = () => {
    alert('Scan for new codes - To be implemented\n\nThis will scan for:\n- New Location codes\n- New Item Groups\n- New transaction combinations')
  }

  const handleImportExport = () => {
    alert('Import/Export - To be implemented\n\nOptions:\n- Import mappings from CSV\n- Export current mappings')
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter data based on search term
  const filteredAPData = apMappingData.filter(row =>
    Object.values(row).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const filteredGLData = glMappingData.filter(row =>
    Object.values(row).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Account Code Mapping</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleScan}>
            <ScanIcon className="w-4 h-4 mr-2" />
            Scan
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportExport}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          className="max-w-xs"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">View Name:</span>
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posting-to-ap">Posting to AP</SelectItem>
              <SelectItem value="posting-to-gl">Posting to GL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedView === "posting-to-ap" ? (
        // Posting to AP View
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Unit</TableHead>
                <TableHead>Store/Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>Item Group</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAPData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No mappings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAPData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.businessUnit}</TableCell>
                    <TableCell>{row.store}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.subCategory}</TableCell>
                    <TableCell>{row.itemGroup}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="font-mono">{row.accountCode}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(row)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(row)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(row)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        // Posting to GL View
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Unit</TableHead>
                <TableHead>Store/Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Item Group</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead>Dr. Department</TableHead>
                <TableHead>Cr. Department</TableHead>
                <TableHead>Dr. Account</TableHead>
                <TableHead>Cr. Account</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGLData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No mappings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGLData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.businessUnit}</TableCell>
                    <TableCell>{row.store}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.itemGroup}</TableCell>
                    <TableCell>{row.movementType}</TableCell>
                    <TableCell>{row.drDepartment}</TableCell>
                    <TableCell>{row.crDepartment}</TableCell>
                    <TableCell className="font-mono">{row.drAccount}</TableCell>
                    <TableCell className="font-mono">{row.crAccount}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(row)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(row)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(row)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        {selectedView === "posting-to-ap" ? (
          <p>
            <strong>Posting to AP:</strong> Manages account code mappings for Accounts Payable transactions.
            Links inventory procurement transactions with payable invoices. Only Debit Accounts are allowed;
            Tax Accounts default from Vendor Profile.
          </p>
        ) : (
          <p>
            <strong>Posting to GL:</strong> Manages general ledger posting mappings for inventory transactions.
            Ensures all inventory movements (purchases, adjustments, disposals) are accurately reflected
            in the company's main accounting records using the "To" Location accounts.
          </p>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleCloseView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Mapping Details</DialogTitle>
            <DialogDescription>
              {selectedView === "posting-to-ap" ? "Posting to AP Mapping" : "Posting to GL Mapping"}
            </DialogDescription>
          </DialogHeader>
          {selectedMapping && (
            <div className="grid gap-4 py-4">
              {selectedView === "posting-to-ap" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Business Unit</Label>
                      <p className="text-sm">{(selectedMapping as APMapping).businessUnit}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Store/Location</Label>
                      <p className="text-sm">{(selectedMapping as APMapping).store}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm">{(selectedMapping as APMapping).category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sub-Category</Label>
                      <p className="text-sm">{(selectedMapping as APMapping).subCategory}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Item Group</Label>
                      <p className="text-sm">{(selectedMapping as APMapping).itemGroup}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-sm">{(selectedMapping as APMapping).department}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Code</Label>
                    <p className="text-sm font-mono">{(selectedMapping as APMapping).accountCode}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Business Unit</Label>
                      <p className="text-sm">{(selectedMapping as GLMapping).businessUnit}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Store/Location</Label>
                      <p className="text-sm">{(selectedMapping as GLMapping).store}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm">{(selectedMapping as GLMapping).category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Item Group</Label>
                      <p className="text-sm">{(selectedMapping as GLMapping).itemGroup}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Movement Type</Label>
                    <p className="text-sm">{(selectedMapping as GLMapping).movementType}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Dr. Department</Label>
                      <p className="text-sm">{(selectedMapping as GLMapping).drDepartment}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cr. Department</Label>
                      <p className="text-sm">{(selectedMapping as GLMapping).crDepartment}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Dr. Account</Label>
                      <p className="text-sm font-mono">{(selectedMapping as GLMapping).drAccount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cr. Account</Label>
                      <p className="text-sm font-mono">{(selectedMapping as GLMapping).crAccount}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Mapping</DialogTitle>
            <DialogDescription>
              {selectedView === "posting-to-ap" ? "Create a new Posting to AP mapping" : "Create a new Posting to GL mapping"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedView === "posting-to-ap" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="businessUnit">Business Unit</Label>
                    <Input
                      id="businessUnit"
                      value={(formData as APMapping)?.businessUnit || ''}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store">Store/Location</Label>
                    <Input
                      id="store"
                      value={(formData as APMapping)?.store || ''}
                      onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={(formData as APMapping)?.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subCategory">Sub-Category</Label>
                    <Input
                      id="subCategory"
                      value={(formData as APMapping)?.subCategory || ''}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="itemGroup">Item Group</Label>
                    <Input
                      id="itemGroup"
                      value={(formData as APMapping)?.itemGroup || ''}
                      onChange={(e) => setFormData({ ...formData, itemGroup: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={(formData as APMapping)?.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountCode">Account Code</Label>
                  <Input
                    id="accountCode"
                    value={(formData as APMapping)?.accountCode || ''}
                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="businessUnit">Business Unit</Label>
                    <Input
                      id="businessUnit"
                      value={(formData as GLMapping)?.businessUnit || ''}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store">Store/Location</Label>
                    <Input
                      id="store"
                      value={(formData as GLMapping)?.store || ''}
                      onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={(formData as GLMapping)?.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="itemGroup">Item Group</Label>
                    <Input
                      id="itemGroup"
                      value={(formData as GLMapping)?.itemGroup || ''}
                      onChange={(e) => setFormData({ ...formData, itemGroup: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="movementType">Movement Type</Label>
                  <Input
                    id="movementType"
                    value={(formData as GLMapping)?.movementType || ''}
                    onChange={(e) => setFormData({ ...formData, movementType: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="drDepartment">Dr. Department</Label>
                    <Input
                      id="drDepartment"
                      value={(formData as GLMapping)?.drDepartment || ''}
                      onChange={(e) => setFormData({ ...formData, drDepartment: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="crDepartment">Cr. Department</Label>
                    <Input
                      id="crDepartment"
                      value={(formData as GLMapping)?.crDepartment || ''}
                      onChange={(e) => setFormData({ ...formData, crDepartment: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="drAccount">Dr. Account</Label>
                    <Input
                      id="drAccount"
                      value={(formData as GLMapping)?.drAccount || ''}
                      onChange={(e) => setFormData({ ...formData, drAccount: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="crAccount">Cr. Account</Label>
                    <Input
                      id="crAccount"
                      value={(formData as GLMapping)?.crAccount || ''}
                      onChange={(e) => setFormData({ ...formData, crAccount: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Mapping</DialogTitle>
            <DialogDescription>
              {selectedView === "posting-to-ap" ? "Edit Posting to AP mapping" : "Edit Posting to GL mapping"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedView === "posting-to-ap" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-businessUnit">Business Unit</Label>
                    <Input
                      id="edit-businessUnit"
                      value={(formData as APMapping)?.businessUnit || ''}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-store">Store/Location</Label>
                    <Input
                      id="edit-store"
                      value={(formData as APMapping)?.store || ''}
                      onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={(formData as APMapping)?.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subCategory">Sub-Category</Label>
                    <Input
                      id="edit-subCategory"
                      value={(formData as APMapping)?.subCategory || ''}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-itemGroup">Item Group</Label>
                    <Input
                      id="edit-itemGroup"
                      value={(formData as APMapping)?.itemGroup || ''}
                      onChange={(e) => setFormData({ ...formData, itemGroup: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Input
                      id="edit-department"
                      value={(formData as APMapping)?.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-accountCode">Account Code</Label>
                  <Input
                    id="edit-accountCode"
                    value={(formData as APMapping)?.accountCode || ''}
                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-businessUnit">Business Unit</Label>
                    <Input
                      id="edit-businessUnit"
                      value={(formData as GLMapping)?.businessUnit || ''}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-store">Store/Location</Label>
                    <Input
                      id="edit-store"
                      value={(formData as GLMapping)?.store || ''}
                      onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={(formData as GLMapping)?.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-itemGroup">Item Group</Label>
                    <Input
                      id="edit-itemGroup"
                      value={(formData as GLMapping)?.itemGroup || ''}
                      onChange={(e) => setFormData({ ...formData, itemGroup: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-movementType">Movement Type</Label>
                  <Input
                    id="edit-movementType"
                    value={(formData as GLMapping)?.movementType || ''}
                    onChange={(e) => setFormData({ ...formData, movementType: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-drDepartment">Dr. Department</Label>
                    <Input
                      id="edit-drDepartment"
                      value={(formData as GLMapping)?.drDepartment || ''}
                      onChange={(e) => setFormData({ ...formData, drDepartment: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-crDepartment">Cr. Department</Label>
                    <Input
                      id="edit-crDepartment"
                      value={(formData as GLMapping)?.crDepartment || ''}
                      onChange={(e) => setFormData({ ...formData, crDepartment: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-drAccount">Dr. Account</Label>
                    <Input
                      id="edit-drAccount"
                      value={(formData as GLMapping)?.drAccount || ''}
                      onChange={(e) => setFormData({ ...formData, drAccount: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-crAccount">Cr. Account</Label>
                    <Input
                      id="edit-crAccount"
                      value={(formData as GLMapping)?.crAccount || ''}
                      onChange={(e) => setFormData({ ...formData, crAccount: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
