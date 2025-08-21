# Physical Count Sub-Module - Technical PRD

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

The Physical Count Sub-Module provides comprehensive physical inventory counting capabilities including full physical counts, cycle counting programs, count scheduling, mobile counting interfaces, and variance analysis. This module ensures inventory accuracy through systematic counting procedures while minimizing business disruption and maintaining operational efficiency.

### Key Objectives

1. **Inventory Accuracy**: Achieve >99% inventory accuracy through systematic counting procedures
2. **Operational Efficiency**: Minimize business disruption during counting activities
3. **Process Automation**: Automate count scheduling, task assignment, and variance processing
4. **Mobile Capability**: Provide offline-capable mobile counting interface with barcode scanning
5. **Audit Compliance**: Maintain complete audit trails for all counting activities
6. **Exception Management**: Efficient handling of count variances and discrepancies

---

## Business Requirements

### Functional Requirements

#### PC-001: Physical Count Management
**Priority**: Critical  
**Complexity**: High

**User Story**: As an inventory manager, I want to schedule and manage comprehensive physical counts, so that I can maintain accurate inventory records and comply with financial reporting requirements.

**Acceptance Criteria**:
- ✅ Flexible count scheduling (monthly, quarterly, annual) with advance planning
- ✅ Inventory freeze controls to prevent movements during counting
- ✅ Count team management with user assignments and permissions
- ✅ Count sheet generation with optimized counting sequences
- ✅ Progress tracking and completion monitoring
- ✅ Automated variance analysis with tolerance thresholds

**Technical Implementation**:
```typescript
interface PhysicalCount {
  id: string;
  countNumber: string;
  type: CountType;
  status: CountStatus;
  plannedDate: Date;
  startedDate?: Date;
  completedDate?: Date;
  locations: Location[];
  itemCategories: ItemCategory[];
  scope: CountScope;
  instructions: string;
  teams: CountTeam[];
  freezeInventory: boolean;
  cutoffDate?: Date;
  varianceThreshold: Percentage;
  approvalRequired: boolean;
  createdBy: User;
  approvedBy?: User;
}

interface CountScope {
  includeAllItems: boolean;
  specificItems?: string[];
  categories?: string[];
  abcClassification?: ABCClass[];
  valueThreshold?: Money;
  movementThreshold?: number;
  excludeItems?: string[];
}

interface CountTeam {
  teamId: string;
  teamName: string;
  supervisor: User;
  counters: CounterAssignment[];
  locations: Location[];
  sections: CountSection[];
  status: TeamStatus;
}

interface CounterAssignment {
  user: User;
  role: CounterRole;
  sections: CountSection[];
  status: AssignmentStatus;
  completedSections: number;
  varianceCount: number;
}

type CountType = 
  | 'FULL_PHYSICAL'
  | 'CYCLE_COUNT'
  | 'ABC_COUNT'
  | 'LOCATION_COUNT'
  | 'CATEGORY_COUNT';

type CountStatus = 
  | 'PLANNED'
  | 'SCHEDULED' 
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'VARIANCE_REVIEW'
  | 'APPROVED';

type CounterRole = 'COUNTER' | 'RECORDER' | 'SUPERVISOR' | 'AUDITOR';
```

---

#### PC-002: Cycle Counting Program
**Priority**: High  
**Complexity**: Medium

**User Story**: As an inventory manager, I want to implement systematic cycle counting programs, so that I can maintain continuous inventory accuracy without major business disruptions.

**Acceptance Criteria**:
- ✅ ABC-based cycle counting with configurable frequencies
- ✅ Automated item selection based on velocity, value, and risk factors
- ✅ Daily count quota management with workload balancing
- ✅ Exception-based counting for items with movements or discrepancies
- ✅ Performance tracking by counter and location
- ✅ Integration with reorder point calculations

**Cycle Count Framework**:
```typescript
interface CycleCountProgram {
  id: string;
  programName: string;
  isActive: boolean;
  countingStrategy: CountingStrategy;
  scheduleType: ScheduleType;
  frequencies: CycleFrequency[];
  selectionCriteria: SelectionCriteria;
  dailyQuota: number;
  workloadBalancing: boolean;
  autoScheduling: boolean;
  toleranceThresholds: ToleranceSettings;
}

interface CycleFrequency {
  abcClassification: ABCClass;
  frequencyDays: number;
  priority: Priority;
  lastCountRequired?: number; // days since last count
}

interface SelectionCriteria {
  highValueThreshold: Money;
  fastMovingThreshold: number;
  negativeStockCheck: boolean;
  recentMovements: boolean;
  varianceHistory: boolean;
  exceptionItems: boolean;
  newItemsIncluded: boolean;
}

interface CycleCountItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  location: Location;
  expectedQuantity: number;
  countedQuantity?: number;
  variance?: number;
  variancePercentage?: Percentage;
  lastCountDate?: Date;
  countFrequency: number;
  abcClass: ABCClass;
  riskScore: number;
  priority: Priority;
  assignedTo: User;
  countDate: Date;
  status: CountItemStatus;
}

type CountingStrategy = 
  | 'ABC_VELOCITY'
  | 'VALUE_BASED'
  | 'EXCEPTION_BASED'
  | 'LOCATION_ROTATION'
  | 'HYBRID';

type ScheduleType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CONTINUOUS';

class CycleCountService {
  async generateDailyCounts(
    programId: string, 
    targetDate: Date
  ): Promise<CycleCountItem[]> {
    const program = await this.getCycleProgram(programId);
    
    // Select items based on criteria
    const candidates = await this.selectCountCandidates(program);
    
    // Apply workload balancing
    const dailyItems = await this.balanceWorkload(
      candidates, 
      program.dailyQuota
    );
    
    // Assign to counters
    return this.assignCountsToCounters(dailyItems, targetDate);
  }
  
  async processExceptionItems(
    exceptions: ExceptionTrigger[]
  ): Promise<CycleCountItem[]> {
    // Add exception items to cycle count queue
    const exceptionItems: CycleCountItem[] = [];
    
    for (const exception of exceptions) {
      const item = await this.createExceptionCount(exception);
      exceptionItems.push(item);
    }
    
    return exceptionItems;
  }
}
```

---

#### PC-003: Mobile Counting Interface
**Priority**: High  
**Complexity**: Medium

**User Story**: As a counter, I want a mobile counting interface with barcode scanning and offline capability, so that I can efficiently count inventory without network dependencies.

**Acceptance Criteria**:
- ✅ Native mobile app with barcode/QR code scanning
- ✅ Offline counting capability with local data storage
- ✅ Optimized counting workflows with guided navigation
- ✅ Photo capture for variance documentation
- ✅ Real-time sync when online with conflict resolution
- ✅ Voice input capabilities for hands-free operation

**Mobile Interface Architecture**:
```typescript
interface MobileCountApp {
  // Offline data management
  offlineStorage: OfflineStorage;
  
  // Barcode scanning
  barcodeScanner: BarcodeScanner;
  
  // Count execution
  countExecution: CountExecution;
  
  // Data synchronization
  syncManager: SyncManager;
  
  // User interface
  countingInterface: CountingInterface;
}

interface OfflineStorage {
  countSheets: CountSheet[];
  itemMaster: InventoryItem[];
  locations: Location[];
  lastSync: Date;
  pendingUploads: CountEntry[];
  
  // Store count data locally
  storeCountEntry(entry: CountEntry): Promise<void>;
  
  // Queue for upload when online
  queueForUpload(entry: CountEntry): Promise<void>;
  
  // Retrieve offline data
  getOfflineData(): Promise<OfflineData>;
}

interface CountSheet {
  countId: string;
  sheetId: string;
  counterAssignment: CounterAssignment;
  items: CountSheetItem[];
  startTime?: Date;
  endTime?: Date;
  progress: CountProgress;
  notes?: string;
}

interface CountSheetItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  location: Location;
  binLocation?: string;
  expectedQuantity: number;
  countedQuantity?: number;
  isCompleted: boolean;
  hasVariance: boolean;
  photos: CountPhoto[];
  notes?: string;
  timestamp: Date;
}

interface CountEntry {
  sheetId: string;
  itemId: string;
  locationId: string;
  countedQuantity: number;
  countMethod: CountMethod;
  timestamp: Date;
  counterId: string;
  photos?: CountPhoto[];
  notes?: string;
  gpsCoordinates?: GPSLocation;
  confidence: ConfidenceLevel;
}

type CountMethod = 
  | 'MANUAL_ENTRY'
  | 'BARCODE_SCAN'
  | 'VOICE_INPUT'
  | 'ESTIMATED';

type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';

class MobileCountService {
  async scanBarcode(): Promise<ScanResult> {
    // Integrate with device camera for barcode scanning
  }
  
  async recordCount(
    itemId: string, 
    quantity: number, 
    method: CountMethod
  ): Promise<CountEntry> {
    const entry: CountEntry = {
      sheetId: this.currentSheetId,
      itemId,
      locationId: this.currentLocationId,
      countedQuantity: quantity,
      countMethod: method,
      timestamp: new Date(),
      counterId: this.currentCounterId,
      confidence: this.assessConfidence(method, quantity)
    };
    
    // Store locally and queue for upload
    await this.offlineStorage.storeCountEntry(entry);
    await this.offlineStorage.queueForUpload(entry);
    
    return entry;
  }
  
  async capturePhoto(itemId: string, reason: string): Promise<CountPhoto> {
    // Capture and compress photo
    // Associate with count entry
  }
  
  async syncToServer(): Promise<SyncResult> {
    // Upload pending counts
    // Download updates
    // Resolve conflicts
  }
}
```

---

#### PC-004: Variance Analysis and Resolution
**Priority**: High  
**Complexity**: Medium

**User Story**: As an inventory supervisor, I want automated variance analysis with resolution workflows, so that I can efficiently investigate and resolve inventory discrepancies.

**Acceptance Criteria**:
- ✅ Automated variance calculation with tolerance thresholds
- ✅ Variance categorization by significance and root cause analysis
- ✅ Investigation workflows with task assignments
- ✅ Recount procedures for significant variances
- ✅ Approval workflows for variance adjustments
- ✅ Root cause tracking and trend analysis

**Variance Analysis Engine**:
```typescript
interface VarianceAnalysis {
  countId: string;
  analysisDate: Date;
  totalItemsCount: number;
  varianceItems: VarianceItem[];
  summary: VarianceSummary;
  toleranceSettings: ToleranceSettings;
  recommendations: VarianceRecommendation[];
  status: VarianceStatus;
}

interface VarianceItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  location: Location;
  expectedQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  variancePercentage: Percentage;
  varianceValue: Money;
  significance: VarianceSignificance;
  category: VarianceCategory;
  possibleCauses: PossibleCause[];
  investigation: VarianceInvestigation;
  resolution: VarianceResolution;
  status: VarianceItemStatus;
}

interface VarianceSummary {
  totalVariances: number;
  positiveVariances: number;
  negativeVariances: number;
  totalVarianceValue: Money;
  withinTolerance: number;
  requiresInvestigation: number;
  requiresRecount: number;
  significantVariances: number;
  averageVariancePercentage: Percentage;
}

interface ToleranceSettings {
  quantityTolerance: Percentage;
  valueTolerance: Money;
  percentageTolerance: Percentage;
  categoryTolerances: CategoryTolerance[];
  abcTolerances: ABCTolerance[];
  zeroVarianceTolerance: number;
}

interface VarianceInvestigation {
  investigationId: string;
  assignedTo: User;
  priority: Priority;
  dueDate: Date;
  status: InvestigationStatus;
  findings: InvestigationFinding[];
  recommendations: string[];
  startedDate?: Date;
  completedDate?: Date;
}

interface VarianceResolution {
  resolutionId: string;
  resolutionType: ResolutionType;
  approvedBy?: User;
  adjustmentRequired: boolean;
  adjustmentAmount?: number;
  rootCause: RootCause;
  preventiveActions: PreventiveAction[];
  completedDate?: Date;
  notes?: string;
}

type VarianceSignificance = 
  | 'CRITICAL' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'NEGLIGIBLE';

type VarianceCategory = 
  | 'COUNT_ERROR'
  | 'TIMING_DIFFERENCE'
  | 'SYSTEM_ERROR'
  | 'PROCESS_ISSUE'
  | 'THEFT_SHRINKAGE'
  | 'DAMAGE_OBSOLESCENCE';

type ResolutionType = 
  | 'ACCEPT_VARIANCE'
  | 'RECOUNT_REQUIRED'
  | 'SYSTEM_ADJUSTMENT'
  | 'PROCESS_IMPROVEMENT'
  | 'FURTHER_INVESTIGATION';

class VarianceAnalysisService {
  async analyzeVariances(countId: string): Promise<VarianceAnalysis> {
    const countResults = await this.getCountResults(countId);
    const tolerances = await this.getToleranceSettings(countId);
    
    const varianceItems = await Promise.all(
      countResults.map(async (result) => {
        const variance = await this.calculateVariance(result);
        const significance = this.assessSignificance(variance, tolerances);
        const category = await this.categorizeVariance(variance);
        const causes = await this.identifyPossibleCauses(variance);
        
        return {
          ...variance,
          significance,
          category,
          possibleCauses: causes,
          status: this.determineItemStatus(significance)
        };
      })
    );
    
    const summary = this.calculateSummary(varianceItems);
    const recommendations = await this.generateRecommendations(varianceItems);
    
    return {
      countId,
      analysisDate: new Date(),
      totalItemsCount: countResults.length,
      varianceItems,
      summary,
      toleranceSettings: tolerances,
      recommendations,
      status: this.determineAnalysisStatus(varianceItems)
    };
  }
  
  async createInvestigation(
    varianceItem: VarianceItem,
    assignedTo: User
  ): Promise<VarianceInvestigation> {
    return {
      investigationId: generateId(),
      assignedTo,
      priority: this.determinePriority(varianceItem.significance),
      dueDate: this.calculateDueDate(varianceItem.significance),
      status: 'ASSIGNED',
      findings: [],
      recommendations: [],
      startedDate: new Date()
    };
  }
}
```

---

#### PC-005: Count Sheet Management
**Priority**: Medium  
**Complexity**: Low

**User Story**: As a count coordinator, I want to generate optimized count sheets with logical counting sequences, so that counters can work efficiently and minimize counting errors.

**Acceptance Criteria**:
- ✅ Automated count sheet generation with optimized routes
- ✅ Bin location and warehouse layout optimization
- ✅ Count sheet customization by location and item type
- ✅ Barcode/QR code generation for sheets and items
- ✅ Print-friendly formats with clear instructions
- ✅ Digital count sheet distribution to mobile devices

**Count Sheet Generator**:
```typescript
interface CountSheetGenerator {
  generateSheets(
    count: PhysicalCount,
    optimizationCriteria: OptimizationCriteria
  ): Promise<CountSheet[]>;
  
  optimizeCountingRoute(
    items: CountSheetItem[],
    layout: WarehouseLayout
  ): Promise<OptimizedRoute>;
  
  generateBarcodes(
    sheets: CountSheet[]
  ): Promise<BarcodeSet>;
}

interface OptimizationCriteria {
  routeOptimization: boolean;
  groupByCategory: boolean;
  groupByLocation: boolean;
  minimizeBacktracking: boolean;
  balanceWorkload: boolean;
  considerItemSize: boolean;
  considerAccess: boolean;
}

interface WarehouseLayout {
  zones: Zone[];
  aisles: Aisle[];
  binLocations: BinLocation[];
  accessPoints: AccessPoint[];
  restrictions: LayoutRestriction[];
}

interface OptimizedRoute {
  routeId: string;
  totalDistance: number;
  estimatedTime: number;
  waypoints: Waypoint[];
  instructions: RouteInstruction[];
  complexity: RouteComplexity;
}

interface Waypoint {
  sequence: number;
  location: BinLocation;
  items: CountSheetItem[];
  estimatedTime: number;
  instructions: string[];
  landmarks: string[];
}

class CountSheetService {
  async generateOptimizedSheets(
    count: PhysicalCount,
    teams: CountTeam[]
  ): Promise<CountSheet[]> {
    const sheets: CountSheet[] = [];
    
    for (const team of teams) {
      // Get items for this team's locations
      const teamItems = await this.getItemsForTeam(count, team);
      
      // Optimize counting route
      const optimizedRoute = await this.optimizeRoute(
        teamItems,
        team.locations
      );
      
      // Create sheets for team members
      const teamSheets = await this.distributeItemsToCounters(
        team,
        optimizedRoute
      );
      
      sheets.push(...teamSheets);
    }
    
    return sheets;
  }
  
  async printCountSheets(
    sheets: CountSheet[],
    format: PrintFormat
  ): Promise<PrintJob[]> {
    // Generate print-ready count sheets
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Count Sheet Generation**: <5 seconds for 10,000+ items
- **Mobile Sync**: <30 seconds for 1,000 count entries
- **Variance Analysis**: <10 seconds for complete count analysis
- **Barcode Scanning**: <2 seconds per scan with 99%+ accuracy
- **Offline Operation**: 7+ days without server connectivity

#### Scalability Requirements
- **Concurrent Counters**: Support 100+ simultaneous mobile users
- **Count Volume**: Handle 100,000+ items per physical count
- **History Retention**: Maintain 5+ years of count history
- **Location Support**: Scale to 1,000+ counting locations

#### Reliability Requirements
- **Data Integrity**: Zero data loss during count processes
- **Mobile App Stability**: <0.1% crash rate during counting
- **Sync Reliability**: 99.9% successful data synchronization
- **Offline Resilience**: Graceful handling of connectivity issues

---

## Technical Architecture

### Database Schema

```sql
-- Physical counts table
CREATE TABLE physical_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_number VARCHAR(20) UNIQUE NOT NULL,
    type count_type NOT NULL,
    status count_status DEFAULT 'PLANNED',
    planned_date DATE NOT NULL,
    started_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    cutoff_date TIMESTAMP WITH TIME ZONE,
    instructions TEXT,
    freeze_inventory BOOLEAN DEFAULT TRUE,
    variance_threshold DECIMAL(5,2) DEFAULT 5.00,
    approval_required BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_count_number (count_number),
    INDEX idx_status_date (status, planned_date),
    INDEX idx_type (type)
);

-- Count teams table
CREATE TABLE count_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_id UUID REFERENCES physical_counts(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    supervisor_id UUID REFERENCES users(id) NOT NULL,
    status team_status DEFAULT 'ASSIGNED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_count_team (count_id, team_name)
);

-- Counter assignments table
CREATE TABLE counter_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES count_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL,
    role counter_role DEFAULT 'COUNTER',
    status assignment_status DEFAULT 'ASSIGNED',
    sections_assigned INTEGER DEFAULT 0,
    sections_completed INTEGER DEFAULT 0,
    variance_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id),
    INDEX idx_user_assignments (user_id, status)
);

-- Count sheets table
CREATE TABLE count_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_id UUID REFERENCES physical_counts(id) ON DELETE CASCADE,
    sheet_number VARCHAR(20) NOT NULL,
    counter_assignment_id UUID REFERENCES counter_assignments(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    item_count INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    variance_items INTEGER DEFAULT 0,
    status sheet_status DEFAULT 'ASSIGNED',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(count_id, sheet_number),
    INDEX idx_assignment_status (counter_assignment_id, status)
);

-- Count sheet items table
CREATE TABLE count_sheet_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id UUID REFERENCES count_sheets(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    sequence_number INTEGER NOT NULL,
    bin_location VARCHAR(50),
    expected_quantity DECIMAL(12,4) NOT NULL,
    counted_quantity DECIMAL(12,4),
    variance_quantity DECIMAL(12,4),
    variance_percentage DECIMAL(5,2),
    count_method count_method,
    confidence confidence_level,
    status count_item_status DEFAULT 'PENDING',
    photos TEXT[],
    notes TEXT,
    counted_at TIMESTAMP WITH TIME ZONE,
    counted_by UUID REFERENCES users(id),
    
    UNIQUE(sheet_id, sequence_number),
    INDEX idx_item_status (item_id, status),
    INDEX idx_variance (variance_percentage)
);

-- Variance investigations table
CREATE TABLE variance_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_id UUID REFERENCES physical_counts(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    variance_value DECIMAL(15,4) NOT NULL,
    significance variance_significance NOT NULL,
    category variance_category,
    assigned_to UUID REFERENCES users(id) NOT NULL,
    priority priority_level DEFAULT 'MEDIUM',
    due_date DATE NOT NULL,
    status investigation_status DEFAULT 'ASSIGNED',
    findings JSONB,
    recommendations TEXT[],
    resolution_type resolution_type,
    root_cause TEXT,
    preventive_actions TEXT[],
    started_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_assigned_status (assigned_to, status),
    INDEX idx_significance (significance),
    INDEX idx_due_date (due_date)
);

-- Custom types
CREATE TYPE count_type AS ENUM (
    'FULL_PHYSICAL', 'CYCLE_COUNT', 'ABC_COUNT', 
    'LOCATION_COUNT', 'CATEGORY_COUNT'
);

CREATE TYPE count_status AS ENUM (
    'PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 
    'CANCELLED', 'VARIANCE_REVIEW', 'APPROVED'
);

CREATE TYPE team_status AS ENUM (
    'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE counter_role AS ENUM (
    'COUNTER', 'RECORDER', 'SUPERVISOR', 'AUDITOR'
);

CREATE TYPE assignment_status AS ENUM (
    'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE sheet_status AS ENUM (
    'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVIEW_REQUIRED'
);

CREATE TYPE count_item_status AS ENUM (
    'PENDING', 'COUNTED', 'VARIANCE', 'RECOUNTED', 'RESOLVED'
);

CREATE TYPE count_method AS ENUM (
    'MANUAL_ENTRY', 'BARCODE_SCAN', 'VOICE_INPUT', 'ESTIMATED'
);

CREATE TYPE confidence_level AS ENUM (
    'HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN'
);

CREATE TYPE variance_significance AS ENUM (
    'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NEGLIGIBLE'
);

CREATE TYPE variance_category AS ENUM (
    'COUNT_ERROR', 'TIMING_DIFFERENCE', 'SYSTEM_ERROR',
    'PROCESS_ISSUE', 'THEFT_SHRINKAGE', 'DAMAGE_OBSOLESCENCE'
);

CREATE TYPE investigation_status AS ENUM (
    'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE resolution_type AS ENUM (
    'ACCEPT_VARIANCE', 'RECOUNT_REQUIRED', 'SYSTEM_ADJUSTMENT',
    'PROCESS_IMPROVEMENT', 'FURTHER_INVESTIGATION'
);

CREATE TYPE priority_level AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);
```

---

### API Endpoints

#### Count Management
```typescript
// Create new physical count
POST /api/inventory/counts
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "type": "FULL_PHYSICAL",
  "plannedDate": "2025-01-30",
  "locations": ["loc-001", "loc-002"],
  "itemCategories": ["cat-001", "cat-002"],
  "instructions": "Full physical count for month-end inventory",
  "freezeInventory": true,
  "varianceThreshold": 5.0,
  "teams": [
    {
      "teamName": "Team A",
      "supervisorId": "user-001",
      "counters": [
        {
          "userId": "user-002",
          "role": "COUNTER"
        }
      ]
    }
  ]
}

Response: 201 Created
{
  "id": "count-001",
  "countNumber": "PC-2025-001",
  "status": "PLANNED",
  "totalItems": 2450,
  "sheetsGenerated": 25,
  "estimatedHours": 48
}
```

#### Mobile Count Recording
```typescript
// Record count entry
POST /api/inventory/counts/{countId}/entries
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "sheetId": "sheet-001",
  "itemId": "item-001",
  "countedQuantity": 125,
  "countMethod": "BARCODE_SCAN",
  "confidence": "HIGH",
  "photos": [
    {
      "fileName": "item_001_count.jpg",
      "base64Data": "data:image/jpeg;base64,..."
    }
  ],
  "notes": "Item located in bin A-15-3",
  "gpsCoordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response: 201 Created
{
  "entryId": "entry-001",
  "variance": -5,
  "variancePercentage": -3.85,
  "requiresInvestigation": false,
  "nextItem": {
    "itemId": "item-002",
    "itemCode": "ITM-002",
    "expectedQuantity": 200
  }
}
```

#### Variance Analysis
```typescript
// Get variance analysis
GET /api/inventory/counts/{countId}/variances
Authorization: Bearer {jwt_token}
Query Parameters:
  - significance: 'HIGH,CRITICAL'
  - category: 'COUNT_ERROR,SYSTEM_ERROR'
  - status: 'REQUIRES_INVESTIGATION'

Response: 200 OK
{
  "countId": "count-001",
  "analysisDate": "2025-01-30T18:00:00Z",
  "summary": {
    "totalVariances": 45,
    "positiveVariances": 20,
    "negativeVariances": 25,
    "totalVarianceValue": -2350.00,
    "withinTolerance": 30,
    "requiresInvestigation": 15
  },
  "varianceItems": [
    {
      "itemId": "item-001",
      "itemCode": "ITM-001",
      "varianceQuantity": -10,
      "varianceValue": -125.00,
      "significance": "HIGH",
      "category": "COUNT_ERROR",
      "status": "REQUIRES_INVESTIGATION"
    }
  ],
  "recommendations": [
    {
      "type": "RECOUNT_REQUIRED",
      "itemCount": 15,
      "estimatedTime": "4 hours",
      "priority": "HIGH"
    }
  ]
}
```

---

### User Interface Specifications

#### Count Planning Interface
```typescript
const CountPlanningForm: React.FC = () => {
  const [countData, setCountData] = useState<PhysicalCount>();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [teams, setTeams] = useState<CountTeam[]>([]);
  
  return (
    <Card className="count-planning-form">
      <CardHeader>
        <CardTitle>Plan Physical Count</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Count Type" required>
            <Select
              value={countData?.type}
              onValueChange={(type) => setCountData({...countData, type})}
            >
              <SelectItem value="FULL_PHYSICAL">Full Physical Count</SelectItem>
              <SelectItem value="CYCLE_COUNT">Cycle Count</SelectItem>
              <SelectItem value="ABC_COUNT">ABC Classification Count</SelectItem>
              <SelectItem value="LOCATION_COUNT">Location Count</SelectItem>
            </Select>
          </FormField>
          
          <FormField label="Planned Date" required>
            <DatePicker
              value={countData?.plannedDate}
              onChange={(date) => setCountData({...countData, plannedDate: date})}
            />
          </FormField>
        </div>
        
        <Separator className="my-4" />
        
        <LocationSelector
          selectedLocations={selectedLocations}
          onSelectionChange={setSelectedLocations}
          multiSelect={true}
        />
        
        <Separator className="my-4" />
        
        <CountTeamManager
          teams={teams}
          onTeamsChange={setTeams}
        />
        
        <Separator className="my-4" />
        
        <CountScopeSelector
          scope={countData?.scope}
          onScopeChange={(scope) => setCountData({...countData, scope})}
        />
      </CardContent>
      
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit}>
          Generate Count Sheets
        </Button>
      </CardFooter>
    </Card>
  );
};
```

#### Mobile Count Interface
```typescript
const MobileCountInterface: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<CountSheetItem>();
  const [countedQuantity, setCountedQuantity] = useState<number>();
  const [isScanning, setIsScanning] = useState(false);
  
  return (
    <div className="mobile-count-interface">
      <div className="count-header">
        <div className="progress-indicator">
          Item {currentItem?.sequence} of {totalItems}
        </div>
        <div className="progress-bar">
          <ProgressBar value={progress} />
        </div>
      </div>
      
      <div className="item-details">
        <ItemCard
          item={currentItem}
          showLocation={true}
          showExpected={true}
        />
      </div>
      
      <div className="count-input">
        <div className="quantity-input">
          <NumberInput
            value={countedQuantity}
            onChange={setCountedQuantity}
            placeholder="Enter quantity"
            size="large"
          />
        </div>
        
        <div className="input-methods">
          <Button
            variant="outline"
            onClick={() => setIsScanning(true)}
            className="scan-button"
          >
            <BarcodeIcon />
            Scan
          </Button>
          
          <VoiceInputButton
            onVoiceInput={handleVoiceInput}
          />
        </div>
      </div>
      
      <div className="action-buttons">
        <Button
          variant="outline"
          onClick={handleSkipItem}
        >
          Skip
        </Button>
        
        <Button
          onClick={handleRecordCount}
          disabled={!countedQuantity}
        >
          Record Count
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </div>
      
      {isScanning && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onCancel={() => setIsScanning(false)}
        />
      )}
    </div>
  );
};
```

---

### Integration Points

#### Inventory Management Integration
```typescript
interface InventoryIntegration {
  // Freeze inventory during counts
  freezeInventory(
    locations: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<FreezeResult>;
  
  // Update stock levels from count results
  updateStockFromCount(
    countResults: CountResult[]
  ): Promise<StockMovement[]>;
  
  // Generate adjustments for variances
  generateVarianceAdjustments(
    variances: VarianceItem[]
  ): Promise<InventoryAdjustment[]>;
}
```

#### Financial Integration
```typescript
interface FinancialIntegration {
  // Post count adjustments to GL
  postCountAdjustments(
    adjustments: InventoryAdjustment[]
  ): Promise<JournalEntry[]>;
  
  // Calculate financial impact of variances
  calculateVarianceImpact(
    variances: VarianceItem[]
  ): Promise<FinancialImpact>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **Count Results Report**
   - Complete count results with variance analysis
   - Count accuracy by team and counter
   - Time and efficiency metrics

2. **Variance Analysis Report**
   - Detailed variance breakdown by category
   - Root cause analysis summary
   - Corrective action tracking

3. **Counter Performance Report**
   - Individual counter accuracy and productivity
   - Count quality metrics
   - Training and improvement recommendations

#### Advanced Analytics
```typescript
class CountAnalyticsService {
  async analyzeCycleCountEffectiveness(
    period: DateRange
  ): Promise<CycleCountAnalysis> {
    // Effectiveness of cycle counting program
  }
  
  async identifyCountingPatterns(
    countHistory: PhysicalCount[]
  ): Promise<CountingPattern[]> {
    // Patterns in counting accuracy and issues
  }
  
  async optimizeCountFrequency(
    items: InventoryItem[]
  ): Promise<FrequencyRecommendation[]> {
    // Recommendations for optimal count frequencies
  }
}
```

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered item recognition for automated counting
- Drone-based counting for high locations
- RFID integration for instant counting
- Advanced analytics for count optimization
- Integration with IoT sensors for continuous monitoring

#### Phase 3 Features (Q3 2025)
- Fully automated counting with robotics
- Computer vision for damage assessment during counts
- Predictive analytics for count planning
- Blockchain integration for immutable count records
- Advanced machine learning for variance prediction

---

## Conclusion

The Physical Count Sub-Module provides comprehensive physical inventory counting capabilities that ensure inventory accuracy while minimizing operational disruption. The combination of flexible counting programs, mobile interfaces, and automated variance analysis delivers efficient and reliable inventory counting processes.

The production-ready implementation supports immediate deployment while the extensible architecture enables future enhancements and integration with emerging technologies for continuous improvement in inventory accuracy and operational efficiency.

---

*This document serves as the definitive technical specification for the Physical Count Sub-Module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025