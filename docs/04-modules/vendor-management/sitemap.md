# Vendor Management Module - Sitemap & Navigation

## Navigation Structure

### Module Hierarchy

```mermaid
graph TD
    A[Vendor Management<br>/vendor-management] --> B[Manage Vendors<br>/manage-vendors]
    A --> C[Vendors Alt<br>/vendors]
    A --> D[Templates<br>/templates<br>🚧 Prototype]
    A --> E[Campaigns<br>/campaigns<br>🚧 Prototype]
    A --> F[Pricelists<br>/pricelists<br>🚧 Prototype]
    A --> G[Vendor Portal<br>/vendor-portal/sample<br>🚧 Prototype]

    B --> B1[Vendor List<br>/manage-vendors]
    B --> B2[New Vendor<br>/manage-vendors/new]
    B --> B3["Vendor Detail<br>/manage-vendors/:id"]

    C --> C1[Vendor List<br>/vendors]
    C --> C2[New Vendor<br>/vendors/new]
    C --> C3["Vendor Detail<br>/vendors/:id"]
    C --> C4["Edit Vendor<br>/vendors/:id/edit"]
    C --> C5["Pricelist Settings<br>/vendors/:id/pricelist-settings"]

    D --> D1[Template List<br>/templates]
    D --> D2[New Template<br>/templates/new]
    D --> D3["Template Detail<br>/templates/:id"]
    D --> D4["Edit Template<br>/templates/:id/edit"]

    E --> E1[Campaign List<br>/campaigns]
    E --> E2[New Campaign<br>/campaigns/new]
    E --> E3["Campaign Detail<br>/campaigns/:id"]

    F --> F1[Pricelist List<br>/pricelists]
    F --> F2[New Pricelist<br>/pricelists/new]
    F --> F3[Add Pricelist<br>/pricelists/add]
    F --> F4["Pricelist Detail<br>/pricelists/:id"]
    F --> F5["Edit Pricelist<br>/pricelists/:id/edit"]
    F --> F6["Edit Pricelist New<br>/pricelists/:id/edit-new"]
```

## User Workflows

### 1. Vendor Management Workflow

```mermaid
flowchart TD
    Start([User Opens<br>Vendor Management]) --> Landing[Landing Page<br>Dashboard]
    Landing --> Choice{Choose Action}

    Choice -->|View Vendors| List[Vendor List Page]
    Choice -->|Create Vendor| NewForm[New Vendor Form]
    Choice -->|Templates| Templates[Template Management]
    Choice -->|Campaigns| Campaigns[Campaign Management]
    Choice -->|Pricelists| Pricelists[Pricelist Management]

    List --> ListAction{Action}
    ListAction -->|Search| Search[Search & Filter]
    ListAction -->|View Details| Detail[Vendor Detail Page]
    ListAction -->|Edit| Edit[Edit Mode]
    ListAction -->|Delete| Delete[Delete Dialog]
    ListAction -->|Export| Export[Export Data]

    Search --> List

    Detail --> DetailTab{Select Tab}
    DetailTab -->|Overview| Overview[Basic Info & Summary]
    DetailTab -->|Pricelists| PL[Price Lists]
    DetailTab -->|Contacts| Contacts[Contacts & Addresses]
    DetailTab -->|Certs| Certs[Certifications]

    Edit --> Save{Save Changes?}
    Save -->|Yes| Update[Update Vendor]
    Save -->|No| Cancel[Cancel & Revert]
    Update --> Detail
    Cancel --> Detail

    Delete --> Confirm{Confirm Delete?}
    Confirm -->|Yes| CheckDep[Check Dependencies]
    Confirm -->|No| Detail
    CheckDep --> HasDep{Has Dependencies?}
    HasDep -->|Yes| Warning[Show Warning]
    HasDep -->|No| DoDelete[Delete Vendor]
    Warning --> ForceDelete{Force Delete?}
    ForceDelete -->|Yes| DoDelete
    ForceDelete -->|No| Detail
    DoDelete --> List

    NewForm --> FillForm[Fill Form Fields]
    FillForm --> Validate{Valid?}
    Validate -->|No| ShowErrors[Show Errors]
    Validate -->|Yes| Create[Create Vendor]
    ShowErrors --> FillForm
    Create --> Success{Success?}
    Success -->|Yes| Detail
    Success -->|No| ShowErrors
```

### 2. Price Management Workflow (Prototype)

```mermaid
flowchart TD
    Start([Price Management<br>Workflow]) --> Template[Create Template]

    Template --> SelectProd[Select Products]
    SelectProd --> CustomFields[Configure Custom Fields]
    CustomFields --> MOQ[Setup MOQ Pricing]
    MOQ --> SaveTemplate[Save Template]

    SaveTemplate --> Campaign[Create Campaign]
    Campaign --> SelectVendors[Select Vendors]
    SelectVendors --> Schedule[Set Schedule]
    Schedule --> SendInvite[Send Invitations]

    SendInvite --> VendorAccess[Vendors Access Portal]
    VendorAccess --> VendorSubmit{Vendor Actions}

    VendorSubmit -->|Enter Prices| EnterPrice[Price Entry Form]
    VendorSubmit -->|Save Draft| AutoSave[Auto-save Draft]
    VendorSubmit -->|Submit| Submit[Submit Pricelist]

    EnterPrice --> Validate[Real-time Validation]
    Validate --> Valid{Valid?}
    Valid -->|No| ShowError[Show Errors]
    Valid -->|Yes| AutoSave
    ShowError --> EnterPrice

    AutoSave --> Continue{Continue?}
    Continue -->|Yes| EnterPrice
    Continue -->|No| VendorAccess

    Submit --> FinalValidate[Final Validation]
    FinalValidate --> FinalValid{Valid?}
    FinalValid -->|No| ShowError
    FinalValid -->|Yes| SubmitSuccess[Submit Success]

    SubmitSuccess --> StaffReview[Staff Review]
    StaffReview --> ReviewAction{Review Decision}

    ReviewAction -->|Approve| Approve[Approve Pricelist]
    ReviewAction -->|Reject| Reject[Reject with Reason]
    ReviewAction -->|Request Changes| RequestChange[Request Modifications]

    Approve --> Publish[Publish Pricelist]
    Reject --> Notify[Notify Vendor]
    RequestChange --> VendorAccess

    Publish --> Active[Active in System]
    Notify --> End([End])
    Active --> End
```

### 3. Vendor Search & Filter Workflow

```mermaid
flowchart TD
    Start([Search & Filter]) --> Input{Input Type}

    Input -->|Text Search| GlobalSearch[Global Search]
    Input -->|Quick Filter| QuickFilter[Status Dropdown]
    Input -->|Advanced| AdvFilter[Advanced Filter Dialog]
    Input -->|Saved| LoadSaved[Load Saved Filter]

    GlobalSearch --> SearchFields[Search in:<br>- Company Name<br>- Business Type<br>- Address<br>- Contact Name<br>- Contact Phone]
    SearchFields --> ApplySearch[Apply Search]

    QuickFilter --> StatusOptions[Select Status:<br>- All<br>- Active<br>- Inactive]
    StatusOptions --> ApplyQuick[Apply Quick Filter]

    AdvFilter --> SelectField[Select Field]
    SelectField --> SelectOp[Select Operator:<br>- Equals<br>- Contains<br>- Starts With<br>- Ends With<br>- Greater Than<br>- Less Than]
    SelectOp --> EnterValue[Enter Value]
    EnterValue --> AddMore{Add More Criteria?}
    AddMore -->|Yes| SelectField
    AddMore -->|No| SaveOpt{Save Filter?}

    SaveOpt -->|Yes| SaveFilter[Save Filter Config]
    SaveOpt -->|No| ApplyAdv[Apply Advanced Filter]
    SaveFilter --> ApplyAdv

    LoadSaved --> ChooseSaved[Choose Saved Filter]
    ChooseSaved --> ApplyAdv

    ApplySearch --> Results[Display Filtered Results]
    ApplyQuick --> Results
    ApplyAdv --> Results

    Results --> ResultAction{Result Action}
    ResultAction -->|View| DetailPage[Vendor Detail]
    ResultAction -->|Clear| ClearFilter[Clear Filters]
    ResultAction -->|Export| ExportResults[Export Filtered Data]

    ClearFilter --> Start
    DetailPage --> End([End])
    ExportResults --> End
```

## Data Flow Diagrams

### 1. Vendor CRUD Data Flow

```mermaid
flowchart LR
    subgraph Client
        UI[User Interface]
        Form[Vendor Form]
        List[Vendor List]
    end

    subgraph Server Actions
        CreateAction[createVendor]
        UpdateAction[updateVendor]
        DeleteAction[deleteVendor]
        GetAction[getVendor]
    end

    subgraph Services
        VendorService[Vendor Service]
        ValidationService[Validation Service]
        DependencyChecker[Dependency Checker]
    end

    subgraph Database
        VendorTable[(Vendors)]
        AddressTable[(Addresses)]
        ContactTable[(Contacts)]
        CertTable[(Certifications)]
    end

    UI -->|Create Request| Form
    Form -->|Submit| CreateAction
    CreateAction -->|Validate| ValidationService
    ValidationService -->|Valid| VendorService
    VendorService -->|Insert| VendorTable
    VendorService -->|Insert| AddressTable
    VendorService -->|Insert| ContactTable
    VendorService -->|Insert| CertTable
    VendorTable -->|Success| VendorService
    VendorService -->|Response| CreateAction
    CreateAction -->|Result| UI

    UI -->|View Request| GetAction
    GetAction -->|Fetch| VendorService
    VendorService -->|Query| VendorTable
    VendorTable -->|Join| AddressTable
    AddressTable -->|Join| ContactTable
    ContactTable -->|Join| CertTable
    CertTable -->|Data| VendorService
    VendorService -->|Response| GetAction
    GetAction -->|Display| List

    List -->|Edit Request| UpdateAction
    UpdateAction -->|Validate| ValidationService
    ValidationService -->|Valid| VendorService
    VendorService -->|Update| VendorTable
    VendorTable -->|Success| VendorService
    VendorService -->|Response| UpdateAction
    UpdateAction -->|Result| UI

    List -->|Delete Request| DeleteAction
    DeleteAction -->|Check| DependencyChecker
    DependencyChecker -->|Has Dependencies?| DeleteAction
    DeleteAction -->|Confirmed| VendorService
    VendorService -->|Delete| VendorTable
    VendorService -->|Delete| AddressTable
    VendorService -->|Delete| ContactTable
    VendorService -->|Delete| CertTable
    VendorTable -->|Success| VendorService
    VendorService -->|Response| DeleteAction
    DeleteAction -->|Result| UI
```

### 2. Price Management Data Flow (Prototype)

```mermaid
flowchart TD
    subgraph Staff Interface
        TemplateForm[Template Form]
        CampaignForm[Campaign Form]
        ReviewDash[Review Dashboard]
    end

    subgraph Vendor Portal
        VendorAuth[Token Authentication]
        PriceForm[Price Entry Form]
        VendorSubmit[Submit Pricelist]
    end

    subgraph Services
        TemplateService[Template Service]
        CampaignService[Campaign Service]
        InvitationService[Invitation Service]
        PricelistService[Pricelist Service]
        ValidationService[Price Validation Service]
        EmailService[Email Service]
    end

    subgraph Database
        Templates[(Templates)]
        Campaigns[(Campaigns)]
        Invitations[(Invitations)]
        Pricelists[(Pricelists)]
        PriceItems[(Pricelist Items)]
        Sessions[(Portal Sessions)]
    end

    TemplateForm -->|Create| TemplateService
    TemplateService -->|Save| Templates
    Templates -->|ID| TemplateService

    CampaignForm -->|Create| CampaignService
    CampaignService -->|Link Template| Templates
    CampaignService -->|Save| Campaigns
    Campaigns -->|ID| InvitationService

    InvitationService -->|Generate Tokens| Invitations
    InvitationService -->|Send Emails| EmailService
    EmailService -->|Email Links| VendorPortal[Vendor Email]

    VendorPortal -->|Click Link| VendorAuth
    VendorAuth -->|Validate Token| Invitations
    Invitations -->|Valid| Sessions
    Sessions -->|Create Session| VendorAuth
    VendorAuth -->|Access Granted| PriceForm

    PriceForm -->|Load Template| Templates
    Templates -->|Product List| PriceForm

    PriceForm -->|Enter Prices| ValidationService
    ValidationService -->|Validate Rules| PriceForm
    PriceForm -->|Auto-save| Pricelists

    VendorSubmit -->|Final Validation| ValidationService
    ValidationService -->|Valid| PricelistService
    PricelistService -->|Update Status| Pricelists
    PricelistService -->|Save Items| PriceItems
    PriceItems -->|Success| PricelistService
    PricelistService -->|Notify Staff| EmailService

    EmailService -->|Alert| ReviewDash
    ReviewDash -->|Load Pricelists| Pricelists
    Pricelists -->|Load Items| PriceItems
    PriceItems -->|Display| ReviewDash

    ReviewDash -->|Approve/Reject| PricelistService
    PricelistService -->|Update Status| Pricelists
    PricelistService -->|Notify Vendor| EmailService
```

### 3. Integration Data Flow

```mermaid
flowchart TD
    subgraph Vendor Management
        VendorProfile[Vendor Profile]
        VendorPricelist[Vendor Pricelist]
        VendorMetrics[Vendor Metrics]
    end

    subgraph Procurement
        PR[Purchase Request]
        PO[Purchase Order]
        VendorSelection[Vendor Selection]
    end

    subgraph Finance
        TaxCalc[Tax Calculation]
        PaymentTerms[Payment Terms]
        Invoice[Invoice Processing]
    end

    subgraph Inventory
        GRN[Goods Received Note]
        StockIn[Stock In]
        QualityCheck[Quality Inspection]
    end

    subgraph Reporting
        SpendAnalysis[Spend Analysis]
        PerformanceReport[Performance Report]
        PriceTrend[Price Trends]
    end

    VendorProfile -->|Provide Vendors| VendorSelection
    VendorSelection -->|Selected Vendor| PR
    PR -->|Create from PR| PO

    VendorProfile -->|Tax Profile| TaxCalc
    VendorProfile -->|Payment Terms| PaymentTerms
    TaxCalc -->|Tax Amount| Invoice
    PaymentTerms -->|Terms| Invoice

    VendorPricelist -->|Validate Price| PR
    VendorPricelist -->|Validate Price| PO

    PO -->|Create GRN| GRN
    GRN -->|Link Vendor| VendorProfile
    GRN -->|Stock In| StockIn
    GRN -->|Quality Check| QualityCheck

    QualityCheck -->|Update Metrics| VendorMetrics
    GRN -->|Delivery Performance| VendorMetrics
    Invoice -->|Invoice Accuracy| VendorMetrics

    VendorMetrics -->|Metrics Data| PerformanceReport
    PO -->|Spend Data| SpendAnalysis
    VendorPricelist -->|Price History| PriceTrend

    PerformanceReport -->|Update Rating| VendorProfile
    SpendAnalysis -->|Volume Data| VendorMetrics
```

## Page Navigation Map

### Landing Page Actions

```mermaid
graph LR
    Landing[Landing Page] --> A[Manage Vendors Card]
    Landing --> B[Price Lists Card]
    Landing --> C[Templates Card]
    Landing --> D[Campaigns Card]
    Landing --> E[Try Demo Button]

    A -->|Click| VendorList["Vendor List<br>manage-vendors"]
    B -->|Click| PriceList["Price List<br>pricelists"]
    C -->|Click| Templates["Templates<br>templates"]
    D -->|Click| Campaigns["Campaigns<br>campaigns"]
    E -->|Click| Portal["Vendor Portal<br>vendor-portal"]
```

### Vendor List Page Actions

```mermaid
graph TD
    List[Vendor List Page] --> Search[Search Box]
    List --> Filter[Status Filter]
    List --> AdvFilter[Advanced Filter]
    List --> SavedFilter[Saved Filters]
    List --> Export[Export Button]
    List --> AddNew[Add Vendor Button]
    List --> ViewToggle[View Toggle]
    List --> Row[Vendor Row/Card]

    Search -->|Enter Text| FilterResults[Filter Results]
    Filter -->|Select Status| FilterResults
    AdvFilter -->|Click| FilterDialog[Advanced Filter Dialog]
    SavedFilter -->|Click| SavedDialog[Saved Filters Dialog]
    Export -->|Click| ExportFile[Download File]
    AddNew -->|Click| NewPage["New Vendor Form"]
    ViewToggle -->|Toggle| SwitchView["Table or Card View"]

    Row --> RowActions[Action Menu]
    RowActions -->|View Details| DetailPage["Vendor Detail Page"]
    RowActions -->|Edit| EditMode[Edit Mode]
    RowActions -->|Duplicate| DuplicateDialog[Duplicate Dialog]
    RowActions -->|Export| ExportSingle[Export Single]
    RowActions -->|Delete| DeleteDialog[Delete Dialog]
```

### Vendor Detail Page Navigation

```mermaid
graph TD
    Detail[Vendor Detail Page] --> Back[Back Button]
    Detail --> Print[Print Button]
    Detail --> Edit[Edit Button]
    Detail --> Delete[Delete Button]
    Detail --> Tabs[Tab Navigation]

    Back -->|Click| ListPage["Vendor List Page"]
    Print -->|Click| PrintView[Print Dialog]
    Edit -->|Click| EditMode[Edit Mode]
    Delete -->|Click| DeleteDialog[Delete Confirmation]

    Tabs --> Tab1[Overview Tab]
    Tabs --> Tab2[Pricelists Tab]
    Tabs --> Tab3[Contacts Tab]
    Tabs --> Tab4[Certifications Tab]

    Tab1 --> BasicInfo[Basic Information Card]
    Tab1 --> TaxConfig[Tax Configuration Card]
    Tab1 --> Address[Primary Address Card]
    Tab1 --> Contact[Primary Contact Card]

    Tab2 --> PricelistList[Pricelist List]
    Tab2 --> AddPricelist[Add Pricelist Button]

    Tab3 --> AddressList[Address List]
    Tab3 --> ContactList[Contact List]
    Tab3 --> AddAddress[Add Address Button]
    Tab3 --> AddContact[Add Contact Button]

    Tab4 --> CertList[Certification List]
    Tab4 --> AddCert[Add Certification Button]
```

## URL Structure

### Main Routes

| Route Pattern | Description | Page File |
|--------------|-------------|-----------|
| `/vendor-management` | Landing page | `page.tsx` |
| `/vendor-management/manage-vendors` | Vendor list | `manage-vendors/page.tsx` |
| `/vendor-management/manage-vendors/new` | New vendor form | `manage-vendors/new/page.tsx` |
| `/vendor-management/manage-vendors/:id` | Vendor detail | `manage-vendors/[id]/page.tsx` |
| `/vendor-management/vendors` | Alt vendor list | `vendors/page.tsx` |
| `/vendor-management/vendors/new` | Alt new vendor | `vendors/new/page.tsx` |
| `/vendor-management/vendors/:id` | Alt vendor detail | `vendors/[id]/page.tsx` |
| `/vendor-management/vendors/:id/edit` | Edit vendor | `vendors/[id]/edit/page.tsx` |
| `/vendor-management/vendors/:id/pricelist-settings` | Pricelist settings | `vendors/[id]/pricelist-settings/page.tsx` |

### Price Management Routes (Prototype)

| Route Pattern | Description | Page File |
|--------------|-------------|-----------|
| `/vendor-management/templates` | Template list | `templates/page.tsx` |
| `/vendor-management/templates/new` | New template | `templates/new/page.tsx` |
| `/vendor-management/templates/:id` | Template detail | `templates/[id]/page.tsx` |
| `/vendor-management/templates/:id/edit` | Edit template | `templates/[id]/edit/page.tsx` |
| `/vendor-management/campaigns` | Campaign list | `campaigns/page.tsx` |
| `/vendor-management/campaigns/new` | New campaign | `campaigns/new/page.tsx` |
| `/vendor-management/campaigns/:id` | Campaign detail | `campaigns/[id]/page.tsx` |
| `/vendor-management/pricelists` | Pricelist list | `pricelists/page.tsx` |
| `/vendor-management/pricelists/new` | New pricelist | `pricelists/new/page.tsx` |
| `/vendor-management/pricelists/add` | Add pricelist | `pricelists/add/page.tsx` |
| `/vendor-management/pricelists/:id` | Pricelist detail | `pricelists/[id]/page.tsx` |
| `/vendor-management/pricelists/:id/edit` | Edit pricelist | `pricelists/[id]/edit/page.tsx` |
| `/vendor-management/pricelists/:id/edit-new` | New edit UI | `pricelists/[id]/edit-new/page.tsx` |
| `/vendor-management/vendor-portal/sample` | Vendor portal demo | `vendor-portal/sample/page.tsx` |

## Query Parameters

### List Page Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Global search query | `?search=acme` |
| `status` | string | Filter by status | `?status=active` |
| `view` | string | View mode | `?view=card` |
| `page` | number | Pagination page | `?page=2` |
| `limit` | number | Items per page | `?limit=50` |

### Detail Page Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `edit` | boolean | Enable edit mode | `?edit=1` |
| `tab` | string | Active tab | `?tab=pricelists` |

### Filter Parameters

Advanced filters are encoded as URL parameters:

```
?filter[0][field]=companyName
&filter[0][operator]=contains
&filter[0][value]=tech
&filter[1][field]=status
&filter[1][operator]=equals
&filter[1][value]=active
```

## Breadcrumb Navigation

### Vendor Management Pages

```
Home > Vendor Management
Home > Vendor Management > Manage Vendors
Home > Vendor Management > Manage Vendors > New Vendor
Home > Vendor Management > Manage Vendors > {Vendor Name}
Home > Vendor Management > Manage Vendors > {Vendor Name} > Edit
Home > Vendor Management > Templates
Home > Vendor Management > Templates > New Template
Home > Vendor Management > Templates > {Template Name}
Home > Vendor Management > Campaigns
Home > Vendor Management > Campaigns > New Campaign
Home > Vendor Management > Campaigns > {Campaign Name}
Home > Vendor Management > Pricelists
Home > Vendor Management > Pricelists > {Pricelist Number}
```

---

**Last Updated**: 2025-10-02
**Version**: 1.0.0
