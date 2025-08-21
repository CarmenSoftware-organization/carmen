# Inventory Adjustments Sub-Module - Technical PRD

## Document Information

| **Attribute**     | **Value**                         |
|-------------------|-----------------------------------|
| **Document Type** | Sub-Module Product Requirements   |
| **Version**       | 1.0.0                            |
| **Date**          | January 2025                     |
| **Status**        | Production Ready                 |
| **Owner**         | Inventory Management Team        |
| **Parent Module** | [Inventory Management](../module-prd.md) |

---

## Executive Summary

The Inventory Adjustments Sub-Module manages all types of inventory adjustments including write-offs, corrections, transfers, and physical count adjustments. It provides comprehensive audit trails, automated financial posting, and approval workflows to ensure accurate inventory records and proper financial controls while maintaining regulatory compliance.

### Key Objectives

1. **Accurate Record Keeping**: Maintain precise inventory records through systematic adjustments
2. **Financial Integration**: Automatically generate journal entries for all inventory adjustments
3. **Compliance & Control**: Ensure proper authorization and audit trails for all adjustments
4. **Multi-Location Support**: Handle complex adjustments across multiple locations and lots
5. **Exception Management**: Efficiently process various adjustment scenarios with appropriate controls
6. **Cost Accuracy**: Maintain accurate inventory valuations through proper costing adjustments

---

## Business Requirements

### Functional Requirements

#### IA-001: Manual Inventory Adjustments
**Priority**: Critical  
**Complexity**: High

**User Story**: As an inventory manager, I want to create manual adjustments for various inventory discrepancies, so that the system reflects accurate inventory levels and proper financial impact.

**Acceptance Criteria**:
- ✅ Support multiple adjustment types (damage, theft, obsolescence, correction, write-off)
- ✅ Multi-location adjustment processing with transfer capabilities
- ✅ Lot-level adjustments with expiry date tracking
- ✅ Reason code requirement with detailed explanations
- ✅ Photo and document attachment support for evidence
- ✅ Real-time cost calculation using current costing method

**Technical Implementation**:
```typescript
interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  type: AdjustmentType;
  status: AdjustmentStatus;
  date: Date;
  location: Location;
  reason: AdjustmentReason;
  description?: string;
  department: Department;
  totalCostImpact: Money;
  items: AdjustmentItem[];
  attachments: Attachment[];
  approvals: AdjustmentApproval[];
  journalEntries: JournalEntry[];
  createdBy: User;
  createdAt: Date;
  approvedAt?: Date;
  postedAt?: Date;
}

interface AdjustmentItem {
  id: string;
  item: InventoryItem;
  adjustmentQuantity: number; // positive for increases, negative for decreases
  unitCost: Money;
  totalCostImpact: Money;
  lotDetails?: LotAdjustmentDetail[];
  serialNumbers?: string[];
  binLocation?: string;
  notes?: string;
}

interface LotAdjustmentDetail {
  lotNumber: string;
  batchNumber?: string;
  expiryDate?: Date;
  quantity: number;
  unitCost: Money;
  condition: LotCondition;
}

type AdjustmentType = 
  | 'POSITIVE_ADJUSTMENT'
  | 'NEGATIVE_ADJUSTMENT' 
  | 'DAMAGE_WRITE_OFF'
  | 'THEFT_WRITE_OFF'
  | 'OBSOLESCENCE_WRITE_OFF'
  | 'EXPIRY_WRITE_OFF'
  | 'SYSTEM_CORRECTION'
  | 'PHYSICAL_COUNT_ADJUSTMENT';

type AdjustmentReason = 
  | 'PHYSICAL_DAMAGE'
  | 'THEFT'
  | 'SPOILAGE'
  | 'EXPIRY'
  | 'SYSTEM_ERROR'
  | 'COUNT_CORRECTION'
  | 'TRANSFER_ERROR'
  | 'PRICING_ERROR'
  | 'OTHER';
```

---

#### IA-002: Approval Workflow Management
**Priority**: High  
**Complexity**: Medium

**User Story**: As a finance manager, I want adjustments above certain thresholds to require approval, so that significant inventory changes are properly authorized and controlled.

**Acceptance Criteria**:
- ✅ Configurable approval thresholds by adjustment type and amount
- ✅ Multi-level approval workflows with delegation capabilities
- ✅ Automatic approval for adjustments below defined thresholds
- ✅ Email notifications and in-app alerts for pending approvals
- ✅ Approval history and audit trail
- ✅ Bulk approval capabilities for routine adjustments

**Approval Workflow Engine**:
```typescript
interface AdjustmentApprovalRule {
  id: string;
  name: string;
  adjustmentTypes: AdjustmentType[];
  conditions: ApprovalCondition[];
  approvers: ApprovalLevel[];
  autoApproveThreshold?: Money;
  escalationHours: number;
}

interface ApprovalCondition {
  field: 'totalCostImpact' | 'quantity' | 'adjustmentType' | 'location';
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'IN';
  value: any;
}

interface ApprovalLevel {
  level: number;
  approvers: User[];
  requiresAll: boolean;
  canDelegate: boolean;
  timeoutAction: 'ESCALATE' | 'AUTO_APPROVE' | 'HOLD';
}

class AdjustmentApprovalService {
  async determineApprovalPath(
    adjustment: InventoryAdjustment
  ): Promise<ApprovalPath> {
    const rules = await this.getApplicableRules(adjustment);
    
    // Check for auto-approval
    if (this.qualifiesForAutoApproval(adjustment, rules)) {
      return this.createAutoApprovalPath();
    }
    
    // Create approval workflow
    const highestRule = this.selectHighestPriorityRule(rules);
    return this.createApprovalPath(highestRule);
  }
  
  async processApproval(
    adjustmentId: string,
    approverId: string,
    decision: ApprovalDecision
  ): Promise<ApprovalResult> {
    const adjustment = await this.getAdjustment(adjustmentId);
    const currentStep = await this.getCurrentApprovalStep(adjustment);
    
    await this.recordApprovalDecision(currentStep, approverId, decision);
    
    if (decision.action === 'APPROVED') {
      return this.processApprovalStep(adjustment);
    } else {
      return this.processRejection(adjustment, decision);
    }
  }
}
```

---

#### IA-003: Automated Journal Entry Generation
**Priority**: Critical  
**Complexity**: High

**User Story**: As an accountant, I want inventory adjustments to automatically generate proper journal entries, so that financial records accurately reflect inventory changes without manual intervention.

**Acceptance Criteria**:
- ✅ Automatic GL account determination based on adjustment type
- ✅ Multi-dimensional accounting with department, location, and cost center coding
- ✅ Support for different costing methods (FIFO, LIFO, Weighted Average)
- ✅ Variance account posting for cost adjustments
- ✅ Integration with general ledger system
- ✅ Reversing entries for adjustment corrections

**Journal Entry Generation Engine**:
```typescript
interface JournalEntry {
  id: string;
  journalNumber: string;
  postingDate: Date;
  postingPeriod: string;
  description: string;
  reference: string;
  sourceDocument: SourceDocument;
  status: JournalStatus;
  lines: JournalLine[];
  totalDebit: Money;
  totalCredit: Money;
  createdBy: User;
  postedBy?: User;
  postedAt?: Date;
}

interface JournalLine {
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debitAmount: Money;
  creditAmount: Money;
  department: string;
  location: string;
  costCenter?: string;
  description: string;
  reference: string;
}

interface GLAccountMapping {
  adjustmentType: AdjustmentType;
  location: Location;
  itemCategory: ItemCategory;
  inventoryAccount: string;
  adjustmentAccount: string;
  varianceAccount?: string;
}

class JournalEntryService {
  async generateAdjustmentJournal(
    adjustment: InventoryAdjustment
  ): Promise<JournalEntry> {
    const mapping = await this.getAccountMapping(adjustment);
    const lines: JournalLine[] = [];
    
    for (const item of adjustment.items) {
      if (item.adjustmentQuantity > 0) {
        // Positive adjustment - increase inventory
        lines.push({
          lineNumber: lines.length + 1,
          accountCode: mapping.inventoryAccount,
          accountName: 'Inventory Asset',
          debitAmount: item.totalCostImpact,
          creditAmount: Money.zero(),
          department: adjustment.department.code,
          location: adjustment.location.code,
          description: `Inventory increase - ${item.item.name}`,
          reference: adjustment.adjustmentNumber
        });
        
        lines.push({
          lineNumber: lines.length + 1,
          accountCode: mapping.adjustmentAccount,
          accountName: 'Inventory Adjustment',
          debitAmount: Money.zero(),
          creditAmount: item.totalCostImpact,
          department: adjustment.department.code,
          location: adjustment.location.code,
          description: `Inventory adjustment - ${item.item.name}`,
          reference: adjustment.adjustmentNumber
        });
      } else {
        // Negative adjustment - decrease inventory
        lines.push({
          lineNumber: lines.length + 1,
          accountCode: mapping.adjustmentAccount,
          accountName: 'Inventory Adjustment',
          debitAmount: item.totalCostImpact.abs(),
          creditAmount: Money.zero(),
          department: adjustment.department.code,
          location: adjustment.location.code,
          description: `Inventory write-off - ${item.item.name}`,
          reference: adjustment.adjustmentNumber
        });
        
        lines.push({
          lineNumber: lines.length + 1,
          accountCode: mapping.inventoryAccount,
          accountName: 'Inventory Asset',
          debitAmount: Money.zero(),
          creditAmount: item.totalCostImpact.abs(),
          department: adjustment.department.code,
          location: adjustment.location.code,
          description: `Inventory reduction - ${item.item.name}`,
          reference: adjustment.adjustmentNumber
        });
      }
    }
    
    return this.createJournalEntry(adjustment, lines);
  }
}
```

---

#### IA-004: Lot and Serial Number Adjustments
**Priority**: Medium  
**Complexity**: High

**User Story**: As a quality manager, I want to adjust specific lots and serial numbers, so that I can handle product recalls, expiry management, and traceability requirements.

**Acceptance Criteria**:
- ✅ Lot-specific adjustments with batch tracking
- ✅ Serial number adjustments for trackable items
- ✅ Expiry date management and aging analysis
- ✅ Recall and quarantine management
- ✅ Traceability reporting for audit purposes
- ✅ FIFO/FEFO lot consumption logic

**Lot Management System**:
```typescript
interface LotAdjustment {
  adjustmentId: string;
  itemId: string;
  lotNumber: string;
  batchNumber?: string;
  originalQuantity: number;
  adjustedQuantity: number;
  netAdjustment: number;
  unitCost: Money;
  totalCostImpact: Money;
  expiryDate?: Date;
  condition: LotCondition;
  reason: AdjustmentReason;
  traceabilityData: TraceabilityRecord;
}

interface TraceabilityRecord {
  supplier: Vendor;
  receivedDate: Date;
  grnReference: string;
  manufactureDate?: Date;
  countryOfOrigin?: string;
  certifications: Certification[];
  upstreamTraceability: string[];
  downstreamTraceability: string[];
}

type LotCondition = 
  | 'GOOD' 
  | 'DAMAGED' 
  | 'EXPIRED' 
  | 'RECALLED' 
  | 'QUARANTINE' 
  | 'DISPOSED';

class LotAdjustmentService {
  async adjustLot(
    lotAdjustment: LotAdjustment,
    reason: AdjustmentReason
  ): Promise<LotAdjustmentResult> {
    // Validate lot exists and has sufficient quantity
    await this.validateLotAdjustment(lotAdjustment);
    
    // Update lot quantities
    const updatedLot = await this.updateLotQuantity(lotAdjustment);
    
    // Create stock movements
    const movement = await this.createLotMovement(lotAdjustment, reason);
    
    // Update stock status
    await this.updateStockStatus(lotAdjustment.itemId, lotAdjustment.adjustedQuantity);
    
    // Generate traceability records
    await this.updateTraceability(lotAdjustment);
    
    return {
      lot: updatedLot,
      movement,
      traceabilityUpdated: true
    };
  }
  
  async processRecall(
    recallNotice: RecallNotice
  ): Promise<RecallAdjustment[]> {
    const affectedLots = await this.findAffectedLots(recallNotice);
    const adjustments: RecallAdjustment[] = [];
    
    for (const lot of affectedLots) {
      const adjustment = await this.createRecallAdjustment(lot, recallNotice);
      await this.quarantineLot(lot.lotNumber, recallNotice.reason);
      adjustments.push(adjustment);
    }
    
    return adjustments;
  }
}
```

---

#### IA-005: Bulk Adjustment Processing
**Priority**: Medium  
**Complexity**: Medium

**User Story**: As an inventory coordinator, I want to process multiple adjustments efficiently through bulk operations, so that I can handle large-scale inventory corrections without repetitive manual entry.

**Acceptance Criteria**:
- ✅ Excel/CSV import for bulk adjustment data
- ✅ Data validation and error reporting before processing
- ✅ Preview and confirmation before final submission
- ✅ Batch processing with progress tracking
- ✅ Error handling and partial success reporting
- ✅ Rollback capabilities for failed batches

**Bulk Processing Engine**:
```typescript
interface BulkAdjustmentRequest {
  id: string;
  fileName: string;
  uploadedBy: User;
  uploadedAt: Date;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  status: BulkProcessingStatus;
  adjustmentType: AdjustmentType;
  defaultReason: AdjustmentReason;
  data: BulkAdjustmentRecord[];
  validationErrors: ValidationError[];
  processingResults?: BulkProcessingResult;
}

interface BulkAdjustmentRecord {
  lineNumber: number;
  itemCode: string;
  locationCode: string;
  adjustmentQuantity: number;
  reason?: AdjustmentReason;
  notes?: string;
  lotNumber?: string;
  isValid: boolean;
  validationErrors: string[];
}

interface BulkProcessingResult {
  totalProcessed: number;
  successfulAdjustments: number;
  failedAdjustments: number;
  totalCostImpact: Money;
  adjustmentIds: string[];
  errors: ProcessingError[];
  processingTime: number;
}

class BulkAdjustmentService {
  async processBulkUpload(
    file: File,
    adjustmentType: AdjustmentType,
    defaultReason: AdjustmentReason,
    uploadedBy: User
  ): Promise<BulkAdjustmentRequest> {
    // Parse CSV/Excel file
    const rawData = await this.parseFile(file);
    
    // Convert to adjustment records
    const records = await this.convertToAdjustmentRecords(rawData);
    
    // Validate each record
    const validatedRecords = await this.validateRecords(records);
    
    // Create bulk request
    const request: BulkAdjustmentRequest = {
      id: generateId(),
      fileName: file.name,
      uploadedBy,
      uploadedAt: new Date(),
      totalRecords: records.length,
      validRecords: validatedRecords.filter(r => r.isValid).length,
      invalidRecords: validatedRecords.filter(r => !r.isValid).length,
      status: 'VALIDATED',
      adjustmentType,
      defaultReason,
      data: validatedRecords,
      validationErrors: this.extractValidationErrors(validatedRecords)
    };
    
    return this.saveBulkRequest(request);
  }
  
  async executeBulkAdjustments(
    requestId: string,
    confirmedBy: User
  ): Promise<BulkProcessingResult> {
    const request = await this.getBulkRequest(requestId);
    
    if (request.status !== 'VALIDATED') {
      throw new Error('Request must be validated before execution');
    }
    
    await this.updateRequestStatus(requestId, 'PROCESSING');
    
    const results = await this.processAdjustmentRecords(
      request.data.filter(r => r.isValid),
      request.adjustmentType,
      confirmedBy
    );
    
    await this.updateRequestStatus(requestId, 'COMPLETED');
    await this.saveBulkResults(requestId, results);
    
    return results;
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Adjustment Creation**: <3 seconds for standard adjustments
- **Approval Processing**: <1 second per approval action
- **Journal Entry Generation**: <2 seconds per adjustment
- **Bulk Processing**: <30 seconds per 1000 records
- **Report Generation**: <10 seconds for standard reports

#### Scalability Requirements
- **Adjustment Volume**: Handle 50K+ adjustments per year
- **Concurrent Users**: Support 100+ simultaneous users
- **Bulk Processing**: Process 10K+ records in single batch
- **Audit Trail**: Maintain 10+ years of adjustment history

#### Security Requirements
- **Approval Authority**: Role-based approval limits with delegation
- **Audit Trail**: Immutable record of all adjustment activities
- **Data Integrity**: Transaction-level consistency for all updates
- **Document Security**: Encrypted storage of adjustment attachments

---

## Technical Architecture

### Database Schema

```sql
-- Inventory Adjustments Table
CREATE TABLE inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number VARCHAR(20) UNIQUE NOT NULL,
    type adjustment_type NOT NULL,
    status adjustment_status DEFAULT 'DRAFT',
    adjustment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_id UUID REFERENCES locations(id) NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    reason adjustment_reason NOT NULL,
    description TEXT,
    total_cost_impact DECIMAL(15,4) DEFAULT 0,
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    journal_posted BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_adjustment_number (adjustment_number),
    INDEX idx_status_date (status, adjustment_date),
    INDEX idx_location (location_id),
    INDEX idx_created_by (created_by)
);

-- Adjustment Items Table
CREATE TABLE adjustment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    adjustment_quantity DECIMAL(12,4) NOT NULL CHECK (adjustment_quantity <> 0),
    unit_cost DECIMAL(15,4) NOT NULL,
    total_cost_impact DECIMAL(15,4) NOT NULL,
    bin_location VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(adjustment_id, line_number),
    INDEX idx_item (item_id),
    INDEX idx_adjustment (adjustment_id)
);

-- Lot Adjustments Table
CREATE TABLE lot_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_item_id UUID REFERENCES adjustment_items(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES inventory_lots(id) NOT NULL,
    lot_number VARCHAR(100) NOT NULL,
    batch_number VARCHAR(100),
    adjustment_quantity DECIMAL(12,4) NOT NULL,
    unit_cost DECIMAL(15,4) NOT NULL,
    expiry_date DATE,
    condition lot_condition DEFAULT 'GOOD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_lot (lot_id),
    INDEX idx_lot_number (lot_number)
);

-- Adjustment Approvals Table
CREATE TABLE adjustment_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id) NOT NULL,
    status approval_status DEFAULT 'PENDING',
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    delegated_from UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(adjustment_id, step_number),
    INDEX idx_approver_status (approver_id, status)
);

-- Journal Entries Table
CREATE TABLE adjustment_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID REFERENCES inventory_adjustments(id) NOT NULL,
    journal_number VARCHAR(20) UNIQUE NOT NULL,
    posting_date DATE NOT NULL,
    posting_period VARCHAR(7) NOT NULL, -- YYYY-MM
    description TEXT NOT NULL,
    reference VARCHAR(100),
    total_debit DECIMAL(15,4) NOT NULL,
    total_credit DECIMAL(15,4) NOT NULL,
    status journal_status DEFAULT 'DRAFT',
    posted_by UUID REFERENCES users(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT balanced_journal CHECK (total_debit = total_credit),
    INDEX idx_journal_number (journal_number),
    INDEX idx_posting_date (posting_date),
    INDEX idx_status (status)
);

-- Journal Lines Table
CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID REFERENCES adjustment_journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    debit_amount DECIMAL(15,4) DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount DECIMAL(15,4) DEFAULT 0 CHECK (credit_amount >= 0),
    department_code VARCHAR(20),
    location_code VARCHAR(20),
    cost_center VARCHAR(20),
    description TEXT,
    reference VARCHAR(100),
    
    UNIQUE(journal_id, line_number),
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0)),
    INDEX idx_account (account_code),
    INDEX idx_department (department_code)
);

-- Custom Types
CREATE TYPE adjustment_type AS ENUM (
    'POSITIVE_ADJUSTMENT', 'NEGATIVE_ADJUSTMENT', 'DAMAGE_WRITE_OFF',
    'THEFT_WRITE_OFF', 'OBSOLESCENCE_WRITE_OFF', 'EXPIRY_WRITE_OFF',
    'SYSTEM_CORRECTION', 'PHYSICAL_COUNT_ADJUSTMENT'
);

CREATE TYPE adjustment_status AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'CANCELLED'
);

CREATE TYPE adjustment_reason AS ENUM (
    'PHYSICAL_DAMAGE', 'THEFT', 'SPOILAGE', 'EXPIRY', 'SYSTEM_ERROR',
    'COUNT_CORRECTION', 'TRANSFER_ERROR', 'PRICING_ERROR', 'OTHER'
);

CREATE TYPE lot_condition AS ENUM (
    'GOOD', 'DAMAGED', 'EXPIRED', 'RECALLED', 'QUARANTINE', 'DISPOSED'
);

CREATE TYPE approval_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'DELEGATED'
);

CREATE TYPE journal_status AS ENUM (
    'DRAFT', 'POSTED', 'REVERSED'
);
```

---

### API Endpoints

#### Adjustment Management
```typescript
// Create new adjustment
POST /api/inventory/adjustments
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "type": "DAMAGE_WRITE_OFF",
  "locationId": "loc-001",
  "departmentId": "dept-001",
  "reason": "PHYSICAL_DAMAGE",
  "description": "Damaged during handling - write off required",
  "items": [
    {
      "itemId": "item-001",
      "adjustmentQuantity": -10,
      "notes": "Packaging torn, product contaminated",
      "lotDetails": [
        {
          "lotNumber": "LOT-2025-001",
          "quantity": -10,
          "condition": "DAMAGED"
        }
      ]
    }
  ],
  "attachments": [
    {
      "fileName": "damage_photo.jpg",
      "fileType": "image/jpeg",
      "base64Data": "data:image/jpeg;base64,..."
    }
  ]
}

Response: 201 Created
{
  "id": "adj-001",
  "adjustmentNumber": "ADJ-2025-001234",
  "status": "PENDING_APPROVAL",
  "totalCostImpact": -125.00,
  "requiresApproval": true,
  "nextApprover": {
    "userId": "user-001",
    "role": "INVENTORY_MANAGER"
  }
}
```

#### Approval Processing
```typescript
// Process adjustment approval
POST /api/inventory/adjustments/{id}/approve
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "decision": "APPROVED",
  "comments": "Damage confirmed - write-off authorized",
  "delegateToUserId": null
}

Response: 200 OK
{
  "status": "APPROVED",
  "approvedAt": "2025-01-15T14:30:00Z",
  "nextAction": "JOURNAL_POSTING",
  "journalEntryGenerated": true
}

// Bulk approve adjustments
POST /api/inventory/adjustments/bulk-approve
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "adjustmentIds": ["adj-001", "adj-002", "adj-003"],
  "decision": "APPROVED",
  "comments": "Routine write-offs approved"
}
```

#### Bulk Processing
```typescript
// Upload bulk adjustment file
POST /api/inventory/adjustments/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

Form Data:
- file: adjustments.csv
- adjustmentType: SYSTEM_CORRECTION
- defaultReason: SYSTEM_ERROR

Response: 201 Created
{
  "bulkRequestId": "bulk-001",
  "fileName": "adjustments.csv",
  "totalRecords": 500,
  "validRecords": 485,
  "invalidRecords": 15,
  "validationErrors": [
    {
      "lineNumber": 5,
      "field": "itemCode",
      "error": "Item not found: ITM-INVALID"
    }
  ]
}

// Execute bulk adjustments
POST /api/inventory/adjustments/bulk/{bulkRequestId}/execute
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "confirmedBy": "user-001",
  "processInvalid": false
}

Response: 202 Accepted
{
  "processingId": "proc-001",
  "estimatedCompletion": "2025-01-15T15:00:00Z",
  "totalToProcess": 485
}
```

---

### User Interface Specifications

#### Adjustment Creation Form
```typescript
interface AdjustmentFormProps {
  initialData?: Partial<InventoryAdjustment>;
  onSubmit: (adjustment: InventoryAdjustment) => void;
  onCancel: () => void;
}

const AdjustmentForm: React.FC<AdjustmentFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [adjustmentData, setAdjustmentData] = useState<InventoryAdjustment>();
  const [selectedItems, setSelectedItems] = useState<AdjustmentItem[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  return (
    <Card className="adjustment-form">
      <CardHeader>
        <CardTitle>Create Inventory Adjustment</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Adjustment Type"
            required
            value={adjustmentData?.type}
            onChange={(type) => setAdjustmentData({...adjustmentData, type})}
          >
            <Select>
              <SelectItem value="POSITIVE_ADJUSTMENT">Positive Adjustment</SelectItem>
              <SelectItem value="NEGATIVE_ADJUSTMENT">Negative Adjustment</SelectItem>
              <SelectItem value="DAMAGE_WRITE_OFF">Damage Write-off</SelectItem>
              <SelectItem value="THEFT_WRITE_OFF">Theft Write-off</SelectItem>
            </Select>
          </FormField>
          
          <FormField
            label="Location"
            required
            value={adjustmentData?.location.id}
          >
            <LocationSelector />
          </FormField>
        </div>
        
        <Separator className="my-4" />
        
        <AdjustmentItemsTable
          items={selectedItems}
          onItemsChange={setSelectedItems}
        />
        
        <Separator className="my-4" />
        
        <AttachmentUpload
          files={attachments}
          onFilesChange={setAttachments}
          accept="image/*,.pdf,.doc,.docx"
        />
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(adjustmentData)}>
          Submit for Approval
        </Button>
      </CardFooter>
    </Card>
  );
};
```

#### Adjustment List and Management
```typescript
const AdjustmentList: React.FC = () => {
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [filters, setFilters] = useState<AdjustmentFilters>({});
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);
  
  return (
    <div className="adjustment-list">
      <div className="list-header">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Inventory Adjustments</h2>
          <Button onClick={() => setShowCreateForm(true)}>
            New Adjustment
          </Button>
        </div>
        
        <AdjustmentFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
      
      <DataTable
        data={adjustments}
        columns={[
          {
            header: "Adjustment #",
            accessor: "adjustmentNumber",
            sortable: true
          },
          {
            header: "Type",
            accessor: "type",
            render: (value) => <AdjustmentTypeBadge type={value} />
          },
          {
            header: "Status",
            accessor: "status",
            render: (value) => <StatusBadge status={value} />
          },
          {
            header: "Cost Impact",
            accessor: "totalCostImpact",
            render: (value) => <MoneyDisplay amount={value} />
          },
          {
            header: "Actions",
            render: (adjustment) => (
              <AdjustmentActions adjustment={adjustment} />
            )
          }
        ]}
        selection={{
          selectedRows: selectedAdjustments,
          onSelectionChange: setSelectedAdjustments
        }}
      />
      
      {selectedAdjustments.length > 0 && (
        <BulkActionBar
          selectedCount={selectedAdjustments.length}
          actions={[
            { label: "Bulk Approve", action: handleBulkApprove },
            { label: "Export", action: handleExport }
          ]}
        />
      )}
    </div>
  );
};
```

---

### Integration Points

#### Financial System Integration
```typescript
interface FinancialIntegration {
  // Post journal entries to GL
  postJournalEntry(
    journalEntry: JournalEntry
  ): Promise<GLPostingResult>;
  
  // Get GL account mappings
  getAccountMappings(
    criteria: AccountMappingCriteria
  ): Promise<GLAccountMapping[]>;
  
  // Validate account codes
  validateAccountCodes(
    accountCodes: string[]
  ): Promise<AccountValidationResult[]>;
}
```

#### Inventory Management Integration
```typescript
interface InventoryIntegration {
  // Update stock levels
  updateStockLevels(
    stockUpdates: StockLevelUpdate[]
  ): Promise<void>;
  
  // Create stock movements
  recordStockMovements(
    movements: StockMovement[]
  ): Promise<void>;
  
  // Update lot information
  updateLotStatus(
    lotUpdates: LotStatusUpdate[]
  ): Promise<void>;
}
```

#### Procurement Integration
```typescript
interface ProcurementIntegration {
  // Update expected receipts
  adjustExpectedReceipts(
    adjustments: ReceiptAdjustment[]
  ): Promise<void>;
  
  // Trigger reorder calculations
  recalculateReorderPoints(
    itemIds: string[]
  ): Promise<void>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **Adjustment Summary Report**
   - Adjustments by type, reason, and period
   - Financial impact analysis
   - Approval workflow performance

2. **Write-off Analysis Report**
   - Write-offs by category and cause
   - Trend analysis and cost impact
   - Prevention opportunities

3. **Adjustment Audit Report**
   - Complete audit trail with approvals
   - User activity and patterns
   - Compliance verification

#### Advanced Analytics
```typescript
class AdjustmentAnalyticsService {
  async analyzeAdjustmentTrends(
    period: DateRange
  ): Promise<AdjustmentTrendAnalysis> {
    // Identify patterns in adjustment frequency and amounts
  }
  
  async identifyHighRiskItems(
    threshold: Money
  ): Promise<HighRiskItem[]> {
    // Items with frequent or high-value adjustments
  }
  
  async calculateAdjustmentCosts(
    period: DateRange
  ): Promise<AdjustmentCostAnalysis> {
    // Total cost impact by category and cause
  }
}
```

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered adjustment reason prediction
- Computer vision for damage assessment
- Automated approval routing based on patterns
- Integration with insurance claims processing
- Real-time cost impact notifications

#### Phase 3 Features (Q3 2025)
- Predictive analytics for adjustment prevention
- Machine learning fraud detection
- Automated adjustment suggestions
- Blockchain audit trails
- Advanced workflow automation

---

## Conclusion

The Inventory Adjustments Sub-Module provides comprehensive inventory adjustment capabilities with robust financial controls and audit trails. The integration of approval workflows, automated journal generation, and lot-level tracking ensures accurate inventory records while maintaining proper authorization and compliance requirements.

The production-ready implementation delivers immediate value through streamlined adjustment processes and accurate financial reporting, while the extensible architecture supports future enhancements and integrations across the Carmen Hospitality System.

---

*This document serves as the definitive technical specification for the Inventory Adjustments Sub-Module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025