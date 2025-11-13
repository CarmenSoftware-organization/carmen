# Vendor Entry Portal - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Vendor Management > Vendor Entry Portal
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document provides visual representations of all workflows and processes in the Vendor Entry Portal module using Mermaid diagrams. These diagrams complement the use cases and technical specifications by illustrating the flow of operations, decision points, and system interactions.

The Vendor Entry Portal enables vendors to self-register, manage their profiles, respond to pricing requests and RFQs, track purchase orders, submit invoices, and monitor their performance through a secure, self-service web application.

---

## 2. System Architecture Diagram

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Vendor Portal Frontend"
        VendorUI[Next.js UI - Vendor Portal]
        AuthForms[Authentication Forms]
        Dashboard[Vendor Dashboard]
        ProfileMgmt[Profile Management]
        DocUpload[Document Upload]
        TemplateResponse[Template Response]
        RFQBidding[RFQ Bidding]
        POTracking[PO Tracking]
        InvoiceSubmit[Invoice Submission]
        Performance[Performance Dashboard]
        Messages[Message Center]
    end

    subgraph "Portal Backend"
        PortalAuth[NextAuth + 2FA]
        PortalAPI[Server Actions/API Routes]
        PortalValidation[Zod Validation]
        RateLimit[Rate Limiting]
        SessionMgmt[Session Management]
    end

    subgraph "Business Services"
        VendorService[Vendor Service]
        DocumentService[Document Service]
        NotificationService[Notification Service]
        AuditService[Audit Logging]
        FileStorage[S3 File Storage]
        VirusScan[Virus Scanning]
        EmailService[Email Service]
        SMSService[SMS Service]
    end

    subgraph "Shared Database"
        VendorTables[Vendor Tables]
        PortalTables[Portal-Specific Tables]
        ProductTables[Product Tables]
        POTables[Purchase Order Tables]
        InvoiceTables[Invoice Tables]
        DB[(PostgreSQL)]
    end

    subgraph "Main ERP System"
        ERPBackend[ERP Backend]
        Procurement[Procurement Module]
        Finance[Finance Module]
        Inventory[Inventory Module]
    end

    VendorUI --> AuthForms
    VendorUI --> Dashboard
    VendorUI --> ProfileMgmt
    VendorUI --> DocUpload
    VendorUI --> TemplateResponse
    VendorUI --> RFQBidding
    VendorUI --> POTracking
    VendorUI --> InvoiceSubmit
    VendorUI --> Performance
    VendorUI --> Messages

    AuthForms --> PortalAuth
    Dashboard --> PortalAPI
    ProfileMgmt --> PortalAPI
    DocUpload --> PortalAPI
    TemplateResponse --> PortalAPI
    RFQBidding --> PortalAPI
    POTracking --> PortalAPI
    InvoiceSubmit --> PortalAPI
    Performance --> PortalAPI
    Messages --> PortalAPI

    PortalAuth --> SessionMgmt
    PortalAPI --> PortalValidation
    PortalAPI --> RateLimit
    PortalAPI --> VendorService
    PortalAPI --> DocumentService
    PortalAPI --> NotificationService
    PortalAPI --> AuditService

    DocumentService --> FileStorage
    DocumentService --> VirusScan
    NotificationService --> EmailService
    NotificationService --> SMSService

    VendorService --> DB
    DocumentService --> DB
    AuditService --> DB

    DB --> VendorTables
    DB --> PortalTables
    DB --> ProductTables
    DB --> POTables
    DB --> InvoiceTables

    PortalAPI -.->|Read/Write| ERPBackend
    ERPBackend --> Procurement
    ERPBackend --> Finance
    ERPBackend --> Inventory
```

### 2.2 Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        Internet[Internet]
        WAF[Web Application Firewall]
        CDN[CDN - DDoS Protection]
        LoadBalancer[Load Balancer]
        PortalApp[Vendor Portal App]
    end

    subgraph "Authentication & Authorization"
        Login[Login Endpoint]
        PasswordVerify[Password Verification]
        TwoFactor[2FA Verification]
        SessionCreate[Session Creation]
        JWT[JWT Token Generation]
        RoleCheck[Role-Based Access Control]
    end

    subgraph "Rate Limiting & Protection"
        RateLimiter[Rate Limiter - 100/min]
        IPBlocking[IP Blocking]
        AccountLockout[Account Lockout - 5 attempts]
    end

    subgraph "Data Protection"
        Encryption[TLS 1.3 Encryption]
        DataMasking[Sensitive Data Masking]
        AuditLog[Audit Logging]
        VirusScanning[Virus Scanning]
    end

    subgraph "Monitoring & Alerts"
        Sentry[Sentry Error Tracking]
        SecurityMonitor[Security Monitoring]
        AnomalyDetect[Anomaly Detection]
        Alerts[Security Alerts]
    end

    Internet --> WAF
    WAF --> CDN
    CDN --> LoadBalancer
    LoadBalancer --> PortalApp

    PortalApp --> Login
    Login --> RateLimiter
    RateLimiter -->|Allowed| PasswordVerify
    RateLimiter -->|Exceeded| IPBlocking

    PasswordVerify -->|Invalid| AccountLockout
    PasswordVerify -->|Valid| TwoFactor
    TwoFactor -->|Verified| SessionCreate
    SessionCreate --> JWT
    JWT --> RoleCheck

    PortalApp --> Encryption
    PortalApp --> DataMasking
    PortalApp --> AuditLog
    PortalApp --> VirusScanning

    PortalApp --> Sentry
    PortalApp --> SecurityMonitor
    SecurityMonitor --> AnomalyDetect
    AnomalyDetect --> Alerts
```

---

## 3. Data Flow Diagrams

### 3.1 Vendor Registration Data Flow

```mermaid
graph LR
    User[Prospective Vendor] -->|Access| PublicPage[Public Registration Page]
    PublicPage -->|Load| RegistrationWizard[4-Step Registration Wizard]

    RegistrationWizard -->|Step 1| CompanyInfo[Company Information Form]
    CompanyInfo -->|Input| ZodValidation1[Zod Schema Validation]
    ZodValidation1 -->|Valid| SaveDraft1[Auto-save to Local Storage]
    SaveDraft1 --> Step2Continue

    RegistrationWizard -->|Step 2| ContactInfo[Contact Information Form]
    Step2Continue -->|Navigate| ContactInfo
    ContactInfo -->|Input| ZodValidation2[Zod Schema Validation]
    ZodValidation2 -->|Valid| SaveDraft2[Auto-save to Local Storage]
    SaveDraft2 --> Step3Continue

    RegistrationWizard -->|Step 3| BusinessDetails[Business Details Form]
    Step3Continue -->|Navigate| BusinessDetails
    BusinessDetails -->|Input| ZodValidation3[Zod Schema Validation]
    ZodValidation3 -->|Valid| EncryptSensitive[Encrypt Bank Account Data]
    EncryptSensitive -->|AES-256| SaveDraft3[Auto-save to Local Storage]
    SaveDraft3 --> Step4Continue

    RegistrationWizard -->|Step 4| Documents[Documents & Terms]
    Step4Continue -->|Navigate| Documents
    Documents -->|Upload| FileValidation[File Type/Size Validation]
    FileValidation -->|Valid| VirusScan[Virus Scanning - ClamAV]
    VirusScan -->|Clean| S3Upload[Upload to S3]
    S3Upload -->|Store| DocumentRefs[Store Document References]

    DocumentRefs -->|Accept Terms| TermsValidation[Validate Terms Acceptance]
    TermsValidation -->|Accepted| FinalValidation[Final Validation All Steps]

    FinalValidation -->|Valid| DuplicateCheck{Duplicate Check}
    DuplicateCheck -->|Exists| DuplicateWarning[Show Duplicate Warning]
    DuplicateWarning -->|User Confirms| CreateRegistration
    DuplicateCheck -->|Unique| CreateRegistration[Create Registration Record]

    CreateRegistration -->|Generate ID| RegistrationID[REG-YYYY-XXXX]
    RegistrationID -->|Insert| DB[(Database - tb_vendor_registration)]
    DB -->|Success| SendConfirmation[Send Confirmation Email]
    SendConfirmation -->|Vendor| VendorEmail[Email with Registration ID]
    SendConfirmation -->|Procurement| ProcurementNotif[Notify Procurement Staff]

    VendorEmail -->|Display| SuccessPage[Registration Success Page]
    ProcurementNotif -->|Queue| ReviewQueue[Procurement Review Queue]

    FinalValidation -->|Invalid| ValidationErrors[Show Validation Errors]
    ValidationErrors --> RegistrationWizard
```

### 3.2 Authentication & Login Data Flow

```mermaid
graph TB
    User[Vendor User] -->|Navigate| LoginPage[Login Page]
    LoginPage -->|Enter Credentials| LoginForm[Email + Password Form]
    LoginForm -->|Submit| RateLimitCheck{Rate Limit OK?}

    RateLimitCheck -->|Exceeded| RateLimitError[429 Too Many Requests]
    RateLimitError --> LoginPage

    RateLimitCheck -->|OK| CredentialsValidation[NextAuth Credentials Provider]
    CredentialsValidation -->|Query| UserLookup[Find User by Email]
    UserLookup -->|Query DB| DB[(Database - tb_vendor_portal_user)]

    DB -->|User Not Found| LoginFailed1[Log Failed Attempt]
    LoginFailed1 --> InvalidCredentials[Show: Invalid Credentials]
    InvalidCredentials --> LoginPage

    DB -->|User Found| AccountStatusCheck{Account Status?}
    AccountStatusCheck -->|Inactive/Suspended| AccountError[Show: Account Inactive]
    AccountError --> ContactSupport[Contact Support Link]
    ContactSupport --> End([End])

    AccountStatusCheck -->|Locked| LockCheck{Lock Expired?}
    LockCheck -->|No| StillLocked[Show: Account Locked]
    StillLocked --> ContactSupport
    LockCheck -->|Yes| UnlockAccount[Auto-unlock Account]
    UnlockAccount --> PasswordVerification

    AccountStatusCheck -->|Active| PasswordVerification[Verify Password Hash]
    PasswordVerification -->|Invalid| IncrementFailed[Increment Failed Attempts]
    IncrementFailed -->|Update| FailedCount{Failed Count >= 5?}

    FailedCount -->|Yes| LockAccount[Lock Account for 15 min]
    LockAccount -->|Update DB| DB
    LockAccount -->|Send Email| LockoutEmail[Send Lockout Notification]
    LockoutEmail --> InvalidCredentials

    FailedCount -->|No| LogFailure[Log Failed Attempt]
    LogFailure -->|Audit| AuditLog[(tb_vendor_audit_log)]
    LogFailure --> InvalidCredentials

    PasswordVerification -->|Valid| PasswordAgeCheck{Password Expired?}
    PasswordAgeCheck -->|> 90 days| MustChangePassword[Set mustChangePassword Flag]
    MustChangePassword --> CreateSession

    PasswordAgeCheck -->|OK| TwoFactorCheck{2FA Enabled?}
    TwoFactorCheck -->|No| ResetFailedAttempts
    TwoFactorCheck -->|Yes| Generate2FACode[Generate 6-Digit Code]

    Generate2FACode -->|Send Email| EmailCode[Email Code to User]
    Generate2FACode -->|Send SMS| SMSCode[SMS Code to User - Twilio]
    EmailCode -->|Display| TwoFactorPage[2FA Verification Page]
    SMSCode -->|Display| TwoFactorPage

    TwoFactorPage -->|Enter Code| VerifyCode{Code Valid?}
    VerifyCode -->|Invalid| CodeAttempts{Attempts < 3?}
    CodeAttempts -->|Yes| TryAgain[Show: Invalid Code]
    TryAgain --> TwoFactorPage
    CodeAttempts -->|No| MaxAttempts[Show: Too Many Attempts]
    MaxAttempts --> ResendCode[Resend Code Option]
    ResendCode --> Generate2FACode

    VerifyCode -->|Valid & Not Expired| TwoFactorVerified[2FA Verified]
    VerifyCode -->|Expired| CodeExpired[Show: Code Expired]
    CodeExpired --> ResendCode

    TwoFactorVerified --> ResetFailedAttempts[Reset Failed Login Attempts]
    ResetFailedAttempts -->|Update| LastLogin[Update Last Login Time & IP]
    LastLogin -->|Update DB| DB

    LastLogin --> CreateSession[Create Session]
    CreateSession -->|Generate| SessionToken[Session Token + JWT]
    SessionToken -->|Store| SessionDB[(tb_vendor_portal_session)]
    SessionDB -->|Set Expiry| 30MinTimeout[30-Minute Timeout]

    30MinTimeout -->|Log Success| AuditLog
    30MinTimeout --> OnboardingCheck{Onboarding Complete?}

    OnboardingCheck -->|No| OnboardingPage[Redirect to Onboarding]
    OnboardingCheck -->|Yes| PasswordCheck{Must Change Password?}

    PasswordCheck -->|Yes| PasswordChangePage[Force Password Change]
    PasswordCheck -->|No| Dashboard[Redirect to Dashboard]

    OnboardingPage --> End
    PasswordChangePage --> End
    Dashboard --> End
```

### 3.3 Document Upload Data Flow

```mermaid
graph TB
    User[Vendor User] -->|Navigate| DocumentsPage[Documents Page]
    DocumentsPage -->|Display| DocumentLibrary[Document Library - Current Documents]
    DocumentLibrary -->|Show Warnings| ExpiryAlerts[Expiring/Expired Documents]

    DocumentsPage -->|Click Upload| UploadModal[Upload Document Modal]
    UploadModal -->|Select| DocumentType[Select Document Type]
    DocumentType -->|Business License| RequiredDoc
    DocumentType -->|Tax Certificate| RequiredDoc
    DocumentType -->|Insurance| RequiredDoc[Mark as Required]
    DocumentType -->|Certification| OptionalDoc[Mark as Optional]
    DocumentType -->|Other| OptionalDoc

    RequiredDoc --> FileSelection
    OptionalDoc --> FileSelection[File Selection]

    FileSelection -->|Drag & Drop| FileValidation
    FileSelection -->|Browse & Select| FileValidation[File Validation]

    FileValidation -->|Check Type| TypeCheck{Valid Type?}
    TypeCheck -->|No| TypeError[Show: Invalid File Type]
    TypeError --> FileSelection

    TypeCheck -->|Yes| SizeCheck{Size <= 50MB?}
    SizeCheck -->|No| SizeError[Show: File Too Large]
    SizeError --> FileSelection

    SizeCheck -->|Yes| StartUpload[Start Upload to Temp Storage]
    StartUpload -->|Display| ProgressBar[Upload Progress Bar]
    ProgressBar -->|Complete| TempStorage[Temporary File Buffer]

    TempStorage -->|Scan| VirusScan[Virus Scanning - ClamAV]
    VirusScan -->|Scanning| ScanProgress[Show: Scanning for Viruses]

    ScanProgress -->|Clean| ScanPassed[Virus Scan Passed]
    ScanProgress -->|Infected| VirusDetected[Virus Detected!]

    VirusDetected -->|Block| DeleteFile[Delete File]
    DeleteFile -->|Log Incident| SecurityLog[Security Incident Log]
    SecurityLog -->|Notify| SecurityTeam[Alert Security Team]
    SecurityTeam -->|Display| VirusError[Show: File Failed Security Scan]
    VirusError --> FileSelection

    ScanPassed -->|Display| MetadataForm[Document Metadata Form]
    MetadataForm -->|Enter| DocumentName[Document Name]
    MetadataForm -->|Enter| IssueDate[Issue Date]
    MetadataForm -->|Enter| ExpiryDate[Expiry Date - if applicable]
    MetadataForm -->|Enter| CertNumber[Certificate Number - optional]
    MetadataForm -->|Enter| Notes[Notes - optional]

    DocumentName -->|Validate| MetadataValidation{All Required Fields?}
    IssueDate -->|Validate| MetadataValidation
    ExpiryDate -->|Validate| MetadataValidation
    CertNumber -->|Validate| MetadataValidation
    Notes -->|Validate| MetadataValidation

    MetadataValidation -->|Invalid| MetadataError[Show Field Errors]
    MetadataError --> MetadataForm

    MetadataValidation -->|Valid| ExpiryValidation{Has Expiry Date?}
    ExpiryValidation -->|Yes| DateRangeCheck{Issue < Expiry?}
    DateRangeCheck -->|No| DateError[Show: Invalid Date Range]
    DateError --> MetadataForm

    DateRangeCheck -->|Yes| PastExpiryCheck{Already Expired?}
    PastExpiryCheck -->|Yes| ExpiredWarning[Show Warning: Document Expired]
    ExpiredWarning -->|User Confirms| ProceedUpload
    PastExpiryCheck -->|No| ProceedUpload

    ExpiryValidation -->|No| ProceedUpload[Proceed with Upload]

    ProceedUpload -->|Generate Key| StorageKey[Generate Unique S3 Key]
    StorageKey -->|Upload to S3| S3Upload[AWS S3 Upload]
    S3Upload -->|Success| CreateRecord[Create Document Record]

    CreateRecord -->|Insert| DB[(tb_vendor_document)]
    DB -->|Set Status| UnderReview[Status: UNDER_REVIEW]
    DB -->|Set Scan Status| ScanClean[VirusScanStatus: CLEAN]
    DB -->|Store Metadata| AllMetadata[All Document Metadata]

    AllMetadata -->|If Required Doc| NotifyProcurement[Notify Procurement Staff]
    NotifyProcurement -->|Send Email| ProcurementEmail[Email: New Document Uploaded]
    ProcurementEmail --> CreateAuditLog

    AllMetadata -->|If Has Expiry| ScheduleReminders[Schedule Expiry Reminders]
    ScheduleReminders -->|60 days before| Reminder60
    ScheduleReminders -->|30 days before| Reminder30
    ScheduleReminders -->|7 days before| Reminder7[Store Reminder Schedule]
    Reminder60 --> CreateAuditLog
    Reminder30 --> CreateAuditLog
    Reminder7 --> CreateAuditLog

    AllMetadata --> CreateAuditLog[Create Audit Log Entry]
    CreateAuditLog -->|Log| AuditDB[(tb_vendor_audit_log)]
    AuditDB -->|Success| UpdateUI[Update Document Library UI]
    UpdateUI -->|Display| SuccessMessage[Show: Document Uploaded Successfully]

    SuccessMessage -->|Refresh| DocumentLibrary
    SuccessMessage --> End([End])

    S3Upload -->|Error| UploadError[Upload Failed]
    UploadError -->|Retry| RetryUpload{Retry Count < 3?}
    RetryUpload -->|Yes| S3Upload
    RetryUpload -->|No| UploadFailure[Show: Upload Failed - Contact Support]
    UploadFailure --> End
```

### 3.4 Performance Metrics Data Flow

```mermaid
graph LR
    User[Vendor User] -->|Navigate| PerformancePage[Performance Dashboard]
    PerformancePage -->|Load| DataAggregation[Aggregate Performance Data]

    DataAggregation -->|Query| POData[Purchase Order Data]
    DataAggregation -->|Query| InvoiceData[Invoice Data]
    DataAggregation -->|Query| RFQData[RFQ Participation Data]
    DataAggregation -->|Query| DeliveryData[Delivery Tracking Data]
    DataAggregation -->|Query| QualityData[Quality/Returns Data]

    POData -->|Calculate| OnTimeDelivery[On-Time Delivery Rate]
    POData -->|Calculate| OrderFillRate[Order Fill Rate]
    POData -->|Calculate| POAckTime[PO Acknowledgment Time]

    InvoiceData -->|Calculate| InvoiceAccuracy[Invoice Accuracy Rate]
    InvoiceData -->|Calculate| InvoiceAging[Invoice Aging]

    RFQData -->|Calculate| ResponseRate[RFQ Response Rate]
    RFQData -->|Calculate| WinRate[RFQ Win Rate]
    RFQData -->|Calculate| ResponseTime[Average Response Time]

    DeliveryData -->|Calculate| DeliveryMetrics[Delivery Compliance]
    QualityData -->|Calculate| QualityScore[Quality Score]

    OnTimeDelivery -->|Aggregate| OverallRating
    OrderFillRate -->|Aggregate| OverallRating
    POAckTime -->|Aggregate| OverallRating
    InvoiceAccuracy -->|Aggregate| OverallRating
    InvoiceAging -->|Aggregate| OverallRating
    ResponseRate -->|Aggregate| OverallRating
    WinRate -->|Aggregate| OverallRating
    ResponseTime -->|Aggregate| OverallRating
    DeliveryMetrics -->|Aggregate| OverallRating
    QualityScore -->|Aggregate| OverallRating[Calculate Overall Rating 1-5 Stars]

    OverallRating -->|Compare| BenchmarkData[Industry Benchmarks]
    BenchmarkData -->|Anonymized| PeerComparison[Peer Comparison Data]

    OverallRating -->|Format| MetricsObject[Metrics Data Object]
    PeerComparison -->|Add| MetricsObject

    MetricsObject -->|Render| SummaryCards[Summary Metric Cards]
    MetricsObject -->|Render| TrendCharts[Trend Charts - Recharts]
    MetricsObject -->|Render| ComparisonChart[Benchmark Comparison Chart]

    SummaryCards -->|Display| Dashboard[Performance Dashboard]
    TrendCharts -->|Display| Dashboard
    ComparisonChart -->|Display| Dashboard

    Dashboard -->|User Selects| TimeRange[Time Range Filter]
    TimeRange -->|30/60/90 Days| RefreshData[Re-query Data]
    RefreshData --> DataAggregation

    Dashboard -->|Export| ExportReport[Export Performance Report]
    ExportReport -->|Generate PDF| PDFReport[PDF Report with Charts]
    PDFReport -->|Download| User
```

---

## 4. Core Workflows

### 4.1 Vendor Registration Workflow (UC-VP-001)

```mermaid
flowchart TD
    Start([Vendor Navigates to Portal]) --> LandingPage[Landing Page]
    LandingPage -->|Click Register| RegistrationStart[Start Registration]

    RegistrationStart --> Step1[Step 1: Company Information]
    Step1 -->|Enter| CompanyName[Legal Company Name]
    CompanyName -->|Enter| TaxID[Tax ID - EIN]
    TaxID -->|Validate Format| TaxIDValid{Valid EIN Format?}

    TaxIDValid -->|No| TaxIDError[Show: Invalid EIN Format XX-XXXXXXX]
    TaxIDError --> TaxID

    TaxIDValid -->|Yes| BusinessType[Select Business Type]
    BusinessType -->|Enter| Addresses[Enter Addresses]
    Addresses -->|Physical| PhysicalAddr
    Addresses -->|Mailing| MailingAddr[Mailing Address]
    Addresses -->|Billing| BillingAddr[Billing Address]
    PhysicalAddr -->|Same As?| SameAsPhysical{Use Same Address?}
    SameAsPhysical -->|Yes| CopyAddress[Copy Physical to Mailing/Billing]
    SameAsPhysical -->|No| EnterSeparate[Enter Separate Addresses]

    CopyAddress --> ValidateStep1
    EnterSeparate --> ValidateStep1[Validate Step 1]
    MailingAddr --> ValidateStep1
    BillingAddr --> ValidateStep1

    ValidateStep1 -->|Valid| SaveProgress1[Auto-save Progress]
    ValidateStep1 -->|Invalid| ShowErrors1[Show Validation Errors]
    ShowErrors1 --> Step1

    SaveProgress1 -->|Navigate| Step2[Step 2: Contact Information]

    Step2 -->|Enter| PrimaryContact[Primary Contact Details]
    PrimaryContact -->|Name, Email, Phone, Title| ValidateContact1{Valid?}
    ValidateContact1 -->|No| ContactError1[Show Contact Errors]
    ContactError1 --> PrimaryContact

    ValidateContact1 -->|Yes| SecondaryContact[Secondary Contact - Optional]
    SecondaryContact -->|Enter or Skip| APContact[Accounts Payable Contact]
    APContact -->|Required| ValidateContact2{Valid?}
    ValidateContact2 -->|No| ContactError2[Show Contact Errors]
    ContactError2 --> APContact

    ValidateContact2 -->|Yes| ValidateStep2[Validate Step 2]
    ValidateStep2 -->|Valid| SaveProgress2[Auto-save Progress]
    ValidateStep2 -->|Invalid| ShowErrors2[Show Validation Errors]
    ShowErrors2 --> Step2

    SaveProgress2 -->|Navigate| Step3[Step 3: Business Details]

    Step3 -->|Select| BusinessCategories[Business Categories]
    BusinessCategories -->|Multi-select| DescribeServices[Describe Products/Services]
    DescribeServices -->|Min 100 chars| ValidateDesc{Valid?}
    ValidateDesc -->|No| DescError[Show: Minimum 100 characters required]
    DescError --> DescribeServices

    ValidateDesc -->|Yes| RevenueRange[Select Annual Revenue Range]
    RevenueRange -->|Select| EmployeeCount[Select Employee Count]
    EmployeeCount -->|Select| Certifications[Select Certifications - Optional]

    Certifications --> BankInfo[Bank Account Information]
    BankInfo -->|Enter| BankName[Bank Name]
    BankName -->|Enter| AccountNumber[Account Number]
    AccountNumber -->|Enter| RoutingNumber[Routing Number - 9 digits]
    RoutingNumber -->|Validate| BankValid{Valid Format?}

    BankValid -->|No| BankError[Show: Invalid Bank Information]
    BankError --> BankInfo

    BankValid -->|Yes| Website[Website URL - Optional]
    Website --> ValidateStep3[Validate Step 3]
    ValidateStep3 -->|Valid| EncryptBankData[Encrypt Bank Account Data]
    ValidateStep3 -->|Invalid| ShowErrors3[Show Validation Errors]
    ShowErrors3 --> Step3

    EncryptBankData -->|AES-256| SaveProgress3[Auto-save Progress]
    SaveProgress3 -->|Navigate| Step4[Step 4: Documents & Terms]

    Step4 -->|Display| RequiredDocsList[Required Documents List]
    RequiredDocsList -->|Business License| UploadDoc1
    RequiredDocsList -->|Tax Certificate| UploadDoc2
    RequiredDocsList -->|Insurance - General| UploadDoc3
    RequiredDocsList -->|Insurance - Workers Comp| UploadDoc4[Upload Documents]

    UploadDoc1 -->|File Select| FileUpload
    UploadDoc2 -->|File Select| FileUpload
    UploadDoc3 -->|File Select| FileUpload
    UploadDoc4 -->|File Select| FileUpload[File Upload Process]

    FileUpload -->|Validate| FileValid{Valid File?}
    FileValid -->|Type Invalid| FileTypeError[Show: Invalid File Type]
    FileTypeError --> FileUpload
    FileValid -->|Too Large| FileSizeError[Show: File > 50MB]
    FileSizeError --> FileUpload

    FileValid -->|OK| VirusScan[Virus Scanning]
    VirusScan -->|Infected| VirusError[Show: File Failed Security Scan]
    VirusError --> FileUpload

    VirusScan -->|Clean| UploadToS3[Upload to S3]
    UploadToS3 -->|Success| FileUploaded[Mark Document Uploaded]
    FileUploaded -->|Check| AllRequiredUploaded{All Required Uploaded?}

    AllRequiredUploaded -->|No| RequiredDocsList
    AllRequiredUploaded -->|Yes| DisplayTerms[Display Terms & Conditions]

    DisplayTerms -->|Scrollable Text| TermsText[Terms, Privacy Policy, Code of Conduct]
    TermsText -->|User Scrolls| EnableAgree[Enable "I Agree" Checkbox]
    EnableAgree -->|User Checks| AgreeChecked{Agreed?}

    AgreeChecked -->|No| CannotSubmit[Cannot Submit]
    CannotSubmit --> DisplayTerms

    AgreeChecked -->|Yes| ConfirmationCheck[Confirm Information Accurate]
    ConfirmationCheck -->|Check| ElectronicSig[Electronic Signature]
    ElectronicSig -->|Enter Name & Title| ValidateSig{Valid Signature?}

    ValidateSig -->|No| SigError[Show: Signature Required]
    SigError --> ElectronicSig

    ValidateSig -->|Yes| FinalValidation[Final Validation All Steps]
    FinalValidation -->|Valid| DuplicateCheck{Duplicate Check}

    DuplicateCheck -->|Duplicate Found| DuplicateWarning[Show Duplicate Warning]
    DuplicateWarning -->|User Action| DuplicateDecision{User Decision?}
    DuplicateDecision -->|Cancel| End([End])
    DuplicateDecision -->|Contact Support| SupportPage[Contact Support]
    SupportPage --> End
    DuplicateDecision -->|Continue Anyway| FlagDuplicate[Flag for Manual Review]
    FlagDuplicate --> SubmitRegistration

    DuplicateCheck -->|Unique| SubmitRegistration[Submit Registration]
    SubmitRegistration -->|Generate ID| RegNumber[Generate REG-YYYY-XXXX]
    RegNumber -->|Create Record| DatabaseInsert[Insert into tb_vendor_registration]

    DatabaseInsert -->|Status| PendingReview[Status: PENDING_REVIEW]
    PendingReview -->|Send Email| VendorConfirmation[Vendor Confirmation Email]
    VendorConfirmation -->|With Reg ID| EmailSent1

    PendingReview -->|Send Email| ProcurementNotification[Procurement Notification]
    ProcurementNotification -->|New Registration Alert| EmailSent2[Emails Sent]

    EmailSent1 -->|Display| SuccessPage[Registration Success Page]
    EmailSent2 -->|Display| SuccessPage
    SuccessPage -->|Show| RegID[Display Registration ID]
    RegID -->|Show| NextSteps[Show Next Steps]
    NextSteps -->|Provide| TrackingLink[Application Status Tracking Link]
    TrackingLink --> End

    FinalValidation -->|Invalid| ValidationFailed[Show All Validation Errors]
    ValidationFailed -->|Navigate to| ErrorStep[Navigate to Step with Errors]
    ErrorStep --> Step1
    ErrorStep --> Step2
    ErrorStep --> Step3
    ErrorStep --> Step4
```

### 4.2 Login and Authentication Workflow (UC-VP-002)

```mermaid
flowchart TD
    Start([Vendor Navigates to Login]) --> LoginPage[Display Login Page]
    LoginPage -->|Enter| EmailField[Email Address]
    EmailField -->|Enter| PasswordField[Password]
    PasswordField -->|Optional| RememberMe[Remember Me Checkbox]

    RememberMe -->|Click Submit| RateLimitCheck{Rate Limit OK?}
    RateLimitCheck -->|Exceeded 100/min| RateLimitError[429 Too Many Requests]
    RateLimitError -->|Display| ErrorMessage[Show: Too many attempts, try later]
    ErrorMessage --> End([End])

    RateLimitCheck -->|OK| ValidateFormat{Email Format Valid?}
    ValidateFormat -->|No| FormatError[Show: Invalid email format]
    FormatError --> EmailField

    ValidateFormat -->|Yes| LookupUser[Query Database for User]
    LookupUser -->|tb_vendor_portal_user| UserFound{User Exists?}

    UserFound -->|No| LogFailedAttempt1[Log Failed Login Attempt]
    LogFailedAttempt1 -->|Audit| AuditLog
    LogFailedAttempt1 -->|Display| InvalidCreds[Show: Invalid email or password]
    InvalidCreds --> LoginPage

    UserFound -->|Yes| CheckAccountStatus{Account Status?}
    CheckAccountStatus -->|Inactive| InactiveError[Show: Account is inactive]
    InactiveError -->|Link| ContactSupport[Contact Support]
    ContactSupport --> End

    CheckAccountStatus -->|Suspended| SuspendedError[Show: Account suspended]
    SuspendedError --> ContactSupport

    CheckAccountStatus -->|Locked| CheckLockExpiry{Lock Expired?}
    CheckLockExpiry -->|No| LockedError[Show: Account locked, try in X minutes]
    LockedError --> ForgotPassword[Forgot Password? Link]
    ForgotPassword --> End

    CheckLockExpiry -->|Yes| UnlockAccount[Unlock Account]
    UnlockAccount -->|Update locked_until = NULL| ResetFailedAttempts[Reset Failed Attempts = 0]
    ResetFailedAttempts --> VerifyPassword

    CheckAccountStatus -->|Active| VerifyPassword[Verify Password Hash]
    VerifyPassword -->|bcrypt.compare| PasswordMatch{Password Matches?}

    PasswordMatch -->|No| IncrementFailed[Increment failed_login_attempts]
    IncrementFailed -->|Update DB| CheckAttempts{Attempts >= 5?}

    CheckAttempts -->|Yes| LockAccount[Lock Account for 15 minutes]
    LockAccount -->|Set locked_until| SendLockoutEmail[Send Lockout Email]
    SendLockoutEmail -->|Notify User| LogFailedAttempt2[Log Failed Attempt]
    LogFailedAttempt2 -->|Audit| AuditLog
    LogFailedAttempt2 --> InvalidCreds

    CheckAttempts -->|No| LogFailedAttempt2

    PasswordMatch -->|Yes| CheckPasswordAge{Password Expired?}
    CheckPasswordAge -->|> 90 days| SetMustChange[Set mustChangePassword = true]
    SetMustChange --> Check2FA

    CheckPasswordAge -->|OK| Check2FA{2FA Enabled?}
    Check2FA -->|No| ResetFailedCounter[Reset failed_login_attempts = 0]
    ResetFailedCounter --> UpdateLastLogin

    Check2FA -->|Yes| CheckTrustedDevice{Trusted Device?}
    CheckTrustedDevice -->|Yes| Skip2FA[Skip 2FA Verification]
    Skip2FA --> ResetFailedCounter

    CheckTrustedDevice -->|No| Generate2FACode[Generate 6-Digit Code]
    Generate2FACode -->|otplib| StoreCode[Store Code with 10-min Expiry]
    StoreCode -->|Send Email| EmailCode[Email Code to User]
    StoreCode -->|Send SMS?| SMSEnabled{SMS Enabled?}

    SMSEnabled -->|Yes| SendSMS[Send SMS via Twilio]
    SMSEnabled -->|No| SkipSMS
    SendSMS -->|Sent| Display2FAPage
    EmailCode -->|Sent| Display2FAPage[Display 2FA Verification Page]
    SkipSMS --> Display2FAPage

    Display2FAPage -->|User Enters Code| VerifyCode[Verify 6-Digit Code]
    VerifyCode -->|Check| CodeValid{Code Valid?}

    CodeValid -->|Expired| CodeExpired[Show: Code expired]
    CodeExpired -->|Option| ResendCode[Resend Code]
    ResendCode --> Generate2FACode

    CodeValid -->|Invalid| CodeAttempts[Increment Code Attempts]
    CodeAttempts -->|Check| AttemptsExceeded{Attempts >= 3?}
    AttemptsExceeded -->|Yes| MaxCodeAttempts[Show: Too many attempts]
    MaxCodeAttempts --> ResendCode
    AttemptsExceeded -->|No| InvalidCode[Show: Invalid code]
    InvalidCode --> Display2FAPage

    CodeValid -->|Valid| MarkVerified[Mark 2FA Verified]
    MarkVerified -->|Option| TrustDevice{Trust This Device?}
    TrustDevice -->|Yes| SaveTrustedDevice[Save Device Fingerprint]
    SaveTrustedDevice --> ResetFailedCounter
    TrustDevice -->|No| ResetFailedCounter

    UpdateLastLogin -->|Update| LastLoginTime[last_login_at = NOW]
    LastLoginTime -->|Update| LastLoginIP[last_login_ip = Request IP]
    LastLoginIP -->|Log Success| LogSuccessAttempt[Log Successful Login]
    LogSuccessAttempt -->|Audit| AuditLog

    LogSuccessAttempt -->|Create| CreateSession[Create Session Record]
    CreateSession -->|tb_vendor_portal_session| GenerateToken[Generate Session Token]
    GenerateToken -->|JWT| SetExpiry[Set 30-Minute Expiry]
    SetExpiry -->|Store| SessionDB[(Session Database)]

    SessionDB -->|Check| OnboardingStatus{Onboarding Complete?}
    OnboardingStatus -->|No| RedirectOnboarding[Redirect to Onboarding Checklist]
    RedirectOnboarding --> End

    OnboardingStatus -->|Yes| CheckMustChange{Must Change Password?}
    CheckMustChange -->|Yes| ForcePasswordChange[Force Password Change Page]
    ForcePasswordChange --> End

    CheckMustChange -->|No| LoadDashboard[Load Vendor Dashboard]
    LoadDashboard -->|Fetch| DashboardData[Query Dashboard Data]
    DashboardData -->|Display| DashboardView[Show Dashboard]
    DashboardView --> End
```

### 4.3 Update Vendor Profile Workflow (UC-VP-003)

```mermaid
flowchart TD
    Start([User Clicks Profile]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| RedirectLogin[Redirect to Login]
    RedirectLogin --> End([End])

    CheckAuth -->|Yes| CheckPermission{Has Edit Permission?}
    CheckPermission -->|No| ReadOnlyView[Display Profile Read-Only]
    ReadOnlyView -->|Show Message| NoEditMsg[Show: Contact Admin for Edit Access]
    NoEditMsg --> End

    CheckPermission -->|Yes| LoadProfile[Load Current Profile Data]
    LoadProfile -->|Query| VendorDB[(tb_vendor)]
    VendorDB -->|Return| DisplayProfile[Display Profile View]
    DisplayProfile -->|Show| ExpiryWarnings{Documents Expiring?}

    ExpiryWarnings -->|Yes| ShowWarnings[Display Expiry Warnings Banner]
    ExpiryWarnings -->|No| ProfileView
    ShowWarnings --> ProfileView[Profile View Page]

    ProfileView -->|Click| EditButton[Edit Profile Button]
    EditButton -->|Switch Mode| EditMode[Enable Edit Mode]
    EditMode -->|Display| EditableFields[Editable Form Fields]

    EditableFields -->|Section| CompanyInfoSection[Company Information Section]
    CompanyInfoSection -->|Editable| TradeName[Trade Name/DBA]
    CompanyInfoSection -->|Read-Only| LegalName[Legal Company Name]
    CompanyInfoSection -->|Editable| Addresses[Addresses]
    CompanyInfoSection -->|Editable| Phone[Business Phone]
    CompanyInfoSection -->|Editable| Website[Website URL]

    EditableFields -->|Section| ContactSection[Contact Information Section]
    ContactSection -->|Editable| PrimaryContact[Primary Contact]
    ContactSection -->|Editable| SecondaryContact[Secondary Contact]
    ContactSection -->|Editable| APContact[AP Contact]
    ContactSection -->|Action| AddContact[Add Additional Contact]

    EditableFields -->|Section| BusinessSection[Business Details Section]
    BusinessSection -->|Editable| Categories[Business Categories]
    BusinessSection -->|Editable| Services[Products/Services Description]
    BusinessSection -->|Editable| Revenue[Annual Revenue Range]
    BusinessSection -->|Editable| Employees[Employee Count]
    BusinessSection -->|Editable| Certs[Certifications]

    EditableFields -->|Section| BankSection[Bank Account Information]
    BankSection -->|Click| UpdateBankBtn[Update Bank Account Button]

    TradeName -->|Change| MarkChanged
    Addresses -->|Change| MarkChanged
    Phone -->|Change| MarkChanged
    Website -->|Change| MarkChanged
    PrimaryContact -->|Change| MarkChanged
    SecondaryContact -->|Change| MarkChanged
    APContact -->|Change| MarkChanged
    AddContact -->|Add| MarkChanged
    Categories -->|Change| MarkChanged
    Services -->|Change| MarkChanged
    Revenue -->|Change| MarkChanged
    Employees -->|Change| MarkChanged
    Certs -->|Change| MarkChanged[Track Changes]

    UpdateBankBtn -->|Display| PasswordModal[Password Verification Modal]
    PasswordModal -->|Enter| CurrentPassword[Enter Current Password]
    CurrentPassword -->|Submit| VerifyPassword{Password Correct?}

    VerifyPassword -->|No| PasswordError[Show: Incorrect password]
    PasswordError -->|Retry| CurrentPassword
    VerifyPassword -->|Attempts >= 3| MaxAttempts[Show: Too many attempts]
    MaxAttempts --> CancelBankUpdate

    VerifyPassword -->|Yes| DisplayBankForm[Display Bank Account Form]
    DisplayBankForm -->|Show Masked| CurrentAccount[Current Account: ****5678]
    CurrentAccount -->|Enter| NewBankName[New Bank Name]
    NewBankName -->|Enter| NewAccountNumber[New Account Number]
    NewAccountNumber -->|Enter| NewRoutingNumber[New Routing Number]
    NewRoutingNumber -->|Select| AccountType[Account Type]

    AccountType -->|Validate| BankFormValid{Valid Format?}
    BankFormValid -->|No| BankFormErrors[Show Bank Form Errors]
    BankFormErrors --> DisplayBankForm

    BankFormValid -->|Yes| MarkCriticalChange[Flag as Critical Change]
    MarkCriticalChange --> MarkChanged

    MarkChanged -->|User Action| SaveDecision{User Decision?}
    SaveDecision -->|Cancel| ConfirmCancel[Confirm Discard Changes?]
    ConfirmCancel -->|Yes| RevertChanges[Discard All Changes]
    RevertChanges --> DisplayProfile
    ConfirmCancel -->|No| EditMode

    SaveDecision -->|Save| ValidateAllFields[Validate All Changed Fields]
    ValidateAllFields -->|Zod Schema| ValidationResult{All Valid?}

    ValidationResult -->|No| ShowValidationErrors[Display Validation Errors]
    ShowValidationErrors -->|Highlight| ErrorFields[Highlight Fields with Errors]
    ErrorFields --> EditMode

    ValidationResult -->|Yes| DetectCriticalChanges{Critical Changes?}
    DetectCriticalChanges -->|Legal Name| CriticalFlag
    DetectCriticalChanges -->|Tax ID| CriticalFlag
    DetectCriticalChanges -->|Bank Account| CriticalFlag[Flag Critical Changes]

    CriticalFlag -->|Display| ApprovalWarning[Show Approval Required Warning]
    ApprovalWarning -->|List| ChangesList[List Critical Changes]
    ChangesList -->|Confirm| UserConfirms{User Confirms?}

    UserConfirms -->|No| CancelSave[Cancel Save]
    CancelSave --> EditMode
    UserConfirms -->|Yes| EncryptSensitive[Encrypt Sensitive Data]

    DetectCriticalChanges -->|No Critical| EncryptSensitive
    EncryptSensitive -->|Bank Account| AES256Encrypt[AES-256 Encryption]
    AES256Encrypt --> SaveChanges
    EncryptSensitive -->|Other Data| SaveChanges[Save Changes to Database]

    SaveChanges -->|Update| VendorTable[tb_vendor]
    VendorTable -->|Critical Changes| PendingApprovalFlag[Set Pending Approval Flag]
    VendorTable -->|Non-Critical| ImmediateEffect[Changes Effective Immediately]

    PendingApprovalFlag -->|Create| ChangeHistory[Create Change History Record]
    ImmediateEffect -->|Create| ChangeHistory

    ChangeHistory -->|Log| HistoryTable[Profile Change History]
    HistoryTable -->|Old Values| OldData
    HistoryTable -->|New Values| NewData
    HistoryTable -->|Changed Fields| FieldsList[Changed Fields List]

    FieldsList -->|Create| AuditLog[Create Audit Log Entry]
    AuditLog -->|Action| PROFILE_UPDATE
    AuditLog -->|Category| PROFILE_MANAGEMENT
    AuditLog -->|Status| SUCCESS
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|If Critical| NotifyProcurement[Send Email to Procurement]
    NotifyProcurement -->|Template| ApprovalEmail[Profile Change Approval Email]
    ApprovalEmail -->|Include| ChangesSummary[Summary of Changes]
    ChangesSummary -->|Link| ReviewURL[Review Link to ERP]

    AuditDB -->|Send| VendorConfirmation[Send Confirmation to Vendor]
    VendorConfirmation -->|Template| ConfirmationEmail[Profile Updated Email]
    ConfirmationEmail -->|If Critical| PendingNote[Note: Changes Pending Approval]

    VendorConfirmation -->|Revalidate| RevalidatePath[Revalidate /profile Path]
    RevalidatePath -->|Display| SuccessMessage[Show Success Message]
    SuccessMessage -->|Switch| ViewMode[Switch to View Mode]
    ViewMode -->|Display| UpdatedProfile[Display Updated Profile]
    UpdatedProfile --> End

    CancelBankUpdate --> EditMode
```

### 4.4 Upload Document Workflow (UC-VP-004)

*(Refer to Data Flow Diagram 3.3 for detailed document upload flow)*

### 4.5 View and Submit Pricing Template Workflow (UC-VP-005, UC-VP-006)

```mermaid
flowchart TD
    Start([User Navigates to Templates]) --> LoadTemplates[Load Assigned Templates]
    LoadTemplates -->|Query| TemplateDB[(tb_pricelist_template)]
    TemplateDB -->|Filter| AssignedToVendor[Filter: Assigned to Vendor]
    AssignedToVendor -->|Status| FilterActive[Filter: Active Templates]

    FilterActive -->|Display| TemplateList[Template List View]
    TemplateList -->|Show| Pending[Pending Templates]
    TemplateList -->|Show| InProgress[In Progress Submissions]
    TemplateList -->|Show| Submitted[Submitted Templates]
    TemplateList -->|Show| Expired[Expired Templates]

    TemplateList -->|Highlight| DeadlineWarning{Deadline < 7 Days?}
    DeadlineWarning -->|Yes| UrgentBadge[Show Urgent Badge]
    DeadlineWarning -->|No| NormalDisplay

    UrgentBadge --> TemplateDisplay
    NormalDisplay --> TemplateDisplay[Display Template Cards]

    TemplateDisplay -->|User Clicks| SelectTemplate[Select Template]
    SelectTemplate -->|Load| TemplateDetails[Load Template Details]
    TemplateDetails -->|Display| TemplateInfo[Template Information]

    TemplateInfo -->|Show| TemplateName[Template Name]
    TemplateInfo -->|Show| Category[Category]
    TemplateInfo -->|Show| Deadline[Submission Deadline]
    TemplateInfo -->|Show| ProductCount[Number of Products]
    TemplateInfo -->|Show| Instructions[Special Instructions]
    TemplateInfo -->|Show| BuyerContact[Buyer Contact Information]

    TemplateInfo -->|Action| StartPricing[Start Pricing Button]
    StartPricing -->|Check Deadline| DeadlineCheck{Before Deadline?}

    DeadlineCheck -->|No| ExpiredTemplate[Show: Template Expired]
    ExpiredTemplate --> End([End])

    DeadlineCheck -->|Yes| LoadProducts[Load Template Products]
    LoadProducts -->|Display| PricingTable[Pricing Entry Table]

    PricingTable -->|Columns| ProductColumn[Product Details]
    PricingTable -->|Columns| BasePriceColumn[Base Price *]
    PricingTable -->|Columns| UnitPriceColumn[Unit Price *]
    PricingTable -->|Columns| CasePriceColumn[Case Price]
    PricingTable -->|Columns| TiersColumn[Pricing Tiers]
    PricingTable -->|Columns| MOQColumn[MOQ]
    PricingTable -->|Columns| LeadTimeColumn[Lead Time *]
    PricingTable -->|Columns| NotesColumn[Notes]

    ProductColumn -->|For Each Product| EnterPricing[Enter Pricing Information]
    BasePriceColumn -->|Required| EnterPricing
    UnitPriceColumn -->|Required| EnterPricing
    CasePriceColumn -->|Optional| EnterPricing
    TiersColumn -->|Optional| AddTiers[Add Pricing Tiers]
    MOQColumn -->|Optional| EnterPricing
    LeadTimeColumn -->|Required| EnterPricing
    NotesColumn -->|Optional| EnterPricing

    AddTiers -->|Click| TierModal[Tier Modal Dialog]
    TierModal -->|Enter| MinQty[Min Quantity]
    MinQty -->|Enter| MaxQty[Max Quantity - Optional]
    MaxQty -->|Enter| TierPrice[Price for Tier]
    TierPrice -->|Calculate| Discount[Auto-calc Discount %]
    Discount -->|Save| AddTierToList[Add Tier to List]
    AddTierToList -->|Option| AddMore{Add More Tiers?}
    AddMore -->|Yes| TierModal
    AddMore -->|No| ValidateTiers{Tiers Valid?}

    ValidateTiers -->|Overlapping| TierError[Show: Overlapping quantity ranges]
    TierError --> TierModal
    ValidateTiers -->|Not Decreasing| TierError2[Show: Prices must decrease with quantity]
    TierError2 --> TierModal
    ValidateTiers -->|Valid| CloseTierModal[Save Tiers]
    CloseTierModal --> PricingTable

    EnterPricing -->|Inline Validation| ValidateField{Field Valid?}
    ValidateField -->|Invalid| InlineError[Show Inline Error]
    InlineError --> EnterPricing
    ValidateField -->|Valid| GreenCheck[Show Green Checkmark]
    GreenCheck --> AutoSave[Auto-save Draft Every 2 Minutes]

    AutoSave -->|Save| DraftDB[(Draft Storage)]
    DraftDB -->|Update| ProgressIndicator[Update Progress: X of Y Products]

    PricingTable -->|Bulk Actions| BulkOptions[Bulk Actions Toolbar]
    BulkOptions -->|Option| BulkLeadTime[Apply Same Lead Time to All]
    BulkOptions -->|Option| BulkMOQ[Apply Same MOQ to All]
    BulkOptions -->|Option| BulkMarkup[Apply % Markup to All Prices]
    BulkOptions -->|Option| ImportExcel[Import from Excel]

    BulkLeadTime -->|Apply| UpdateAllLeadTimes[Update All Products]
    UpdateAllLeadTimes --> AutoSave

    BulkMOQ -->|Apply| UpdateAllMOQ[Update All Products]
    UpdateAllMOQ --> AutoSave

    BulkMarkup -->|Enter %| MarkupPercent[Markup Percentage]
    MarkupPercent -->|Calculate| RecalcPrices[Recalculate All Prices]
    RecalcPrices --> AutoSave

    ImportExcel -->|Upload| ExcelFile[Excel File with Pricing]
    ExcelFile -->|Parse| ParseExcel[Parse Excel Data]
    ParseExcel -->|Validate| ExcelValidation{All Rows Valid?}
    ExcelValidation -->|No| ShowExcelErrors[Show Validation Errors]
    ShowExcelErrors -->|Download| ErrorReport[Download Error Report]
    ErrorReport --> ImportExcel

    ExcelValidation -->|Yes| PreviewImport[Preview Imported Data]
    PreviewImport -->|User Confirms| ApplyImport[Apply to Pricing Table]
    ApplyImport --> AutoSave

    PricingTable -->|Mark Products| NotAvailable[Mark as Not Available]
    NotAvailable -->|Checkbox| ExcludeFromSubmission[Exclude from Submission]
    ExcludeFromSubmission --> AutoSave

    PricingTable -->|User Action| UserDecision{User Decision?}
    UserDecision -->|Save Draft| SaveDraftAction[Save Draft]
    SaveDraftAction -->|Update| DraftDB
    SaveDraftAction -->|Display| DraftSaved[Show: Draft Saved]
    DraftSaved --> End

    UserDecision -->|Submit| ValidateSubmission[Validate All Required Fields]
    ValidateSubmission -->|Check| AllRequiredFilled{All Required Filled?}

    AllRequiredFilled -->|No| HighlightMissing[Highlight Missing Fields]
    HighlightMissing -->|Scroll| FirstError[Scroll to First Error]
    FirstError --> PricingTable

    AllRequiredFilled -->|Yes| PreviewSubmission[Preview Submission]
    PreviewSubmission -->|Display| SubmissionSummary[Submission Summary]

    SubmissionSummary -->|Show| TotalProducts[Total Products Priced]
    SubmissionSummary -->|Show| PriceRange[Price Range Summary]
    SubmissionSummary -->|Show| AvgLeadTime[Average Lead Time]
    SubmissionSummary -->|Show| SubmissionDeadline[Deadline Status]

    SubmissionSummary -->|Action| FinalDecision{Final Decision?}
    FinalDecision -->|Edit| BackToTable[Back to Pricing Table]
    BackToTable --> PricingTable

    FinalDecision -->|Cancel| CancelSubmission[Cancel Submission]
    CancelSubmission --> TemplateList

    FinalDecision -->|Confirm Submit| CreatePriceList[Create Price List from Submission]
    CreatePriceList -->|Generate| PriceListNumber[Generate Price List Number]
    PriceListNumber -->|Insert| PriceListDB[(tb_price_list)]

    PriceListDB -->|Status| InitialStatus[Status: PENDING_REVIEW]
    PriceListDB -->|Source| SourceTemplate[sourceType: template]
    PriceListDB -->|Reference| TemplateLink[sourceId: template_id]

    TemplateLink -->|Insert Items| PriceListItems[(tb_price_list_item)]
    PriceListItems -->|All Products| ItemRecords[Create Item Records]

    ItemRecords -->|Check Changes| PriceChangeDetection{Price Changes Detected?}
    PriceChangeDetection -->|>10% Increase| FlagApproval[Flag for Approval]
    FlagApproval -->|Status| PendingApproval[Status: PENDING_APPROVAL]
    PendingApproval --> NotifyBuyer

    PriceChangeDetection -->|Normal| ActiveStatus[Status: ACTIVE]
    ActiveStatus --> NotifyBuyer[Notify Buyer of Submission]

    NotifyBuyer -->|Send Email| BuyerEmail[Email to Procurement Staff]
    BuyerEmail -->|Template| SubmissionNotif[Template Submission Notification]
    SubmissionNotif -->|Include| SubmissionLink[Link to Review Submission]

    SubmissionLink -->|Send Email| VendorConfirmation[Vendor Confirmation Email]
    VendorConfirmation -->|Template| ThankYou[Thank You for Submission]
    ThankYou -->|Include| PriceListLink[Link to View Submitted Pricing]

    VendorConfirmation -->|Update Template Status| MarkSubmitted[Mark Template as Submitted]
    MarkSubmitted -->|tb_pricelist_template| UpdateTemplateStatus[Update Submission Status]

    UpdateTemplateStatus -->|Create Audit| AuditLog[Audit Log Entry]
    AuditLog -->|Action| TEMPLATE_SUBMISSION
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|Display| SuccessPage[Submission Success Page]
    SuccessPage -->|Show| SuccessMessage[Show Success Message]
    SuccessMessage -->|Show| SubmissionID[Submission ID]
    SubmissionID -->|Show| NextSteps[Next Steps Information]
    NextSteps -->|Link| ViewSubmission[View Submitted Pricing]
    ViewSubmission --> End
```

### 4.6 Respond to RFQ Workflow (UC-VP-007)

```mermaid
flowchart TD
    Start([User Navigates to RFQs]) --> LoadRFQs[Load Assigned RFQs]
    LoadRFQs -->|Query| RFQDB[(tb_rfq)]
    RFQDB -->|Filter| InvitedRFQs[Filter: Vendor Invited]
    InvitedRFQs -->|Status| FilterOpen[Filter: Status = OPEN]

    FilterOpen -->|Display| RFQList[RFQ List View]
    RFQList -->|Show| OpenRFQs[Open RFQs]
    RFQList -->|Show| SubmittedBids[Submitted Bids]
    RFQList -->|Show| AwardedRFQs[Awarded RFQs]
    RFQList -->|Show| ClosedRFQs[Closed RFQs]

    RFQList -->|Highlight| DeadlineWarning{Bid Close < 7 Days?}
    DeadlineWarning -->|Yes| UrgentBadge[Show Urgent Badge]
    DeadlineWarning -->|No| NormalDisplay

    UrgentBadge --> RFQDisplay
    NormalDisplay --> RFQDisplay[Display RFQ Cards]

    RFQDisplay -->|User Clicks| SelectRFQ[Select RFQ]
    SelectRFQ -->|Load| RFQDetails[Load RFQ Details]
    RFQDetails -->|Display| RFQInfo[RFQ Information]

    RFQInfo -->|Show| RFQNumber[RFQ Number]
    RFQInfo -->|Show| Title[Title & Description]
    RFQInfo -->|Show| Category[Category]
    RFQInfo -->|Show| Timeline[Timeline & Deadlines]
    RFQInfo -->|Show| Requirements[Requirements]
    RFQInfo -->|Show| Items[Line Items with Specifications]
    RFQInfo -->|Show| Terms[Terms & Conditions]
    RFQInfo -->|Show| EvalCriteria[Evaluation Criteria]
    RFQInfo -->|Show| BuyerContact[Buyer Contact]

    RFQInfo -->|Tabs| ClarificationsTab[Clarifications Tab]
    ClarificationsTab -->|Display| QandA[Q&A Thread]
    QandA -->|View| PreviousQuestions[Previous Questions & Answers]
    PreviousQuestions -->|Action| AskQuestion[Ask Question Button]

    AskQuestion -->|Display| QuestionForm[Question Submission Form]
    QuestionForm -->|Enter| QuestionText[Question Text]
    QuestionText -->|Optional| AttachFile[Attach File]
    AttachFile -->|Select| QuestionCategory[Question Category]
    QuestionCategory -->|Submit| PostQuestion[Post Question]

    PostQuestion -->|Insert| ClarificationDB[(tb_rfq_clarification)]
    ClarificationDB -->|Anonymize| HideVendorName[Vendor Identity Hidden]
    HideVendorName -->|Notify| BuyerNotification[Notify Buyer]
    BuyerNotification -->|Email| BuyerEmail
    BuyerEmail -->|Display| QuestionPosted[Show: Question Posted]
    QuestionPosted --> RFQInfo

    RFQInfo -->|Action| SubmitBid[Submit Bid Button]
    SubmitBid -->|Check| BidWindow{Within Bid Window?}

    BidWindow -->|No| BidClosed[Show: Bidding Closed]
    BidClosed --> End([End])

    BidWindow -->|Yes| CheckClarificationDeadline{Clarification Cutoff Passed?}
    CheckClarificationDeadline -->|No| CanAskQuestions[Can Still Ask Questions]
    CheckClarificationDeadline -->|Yes| NoMoreQuestions[No More Questions Allowed]

    CanAskQuestions --> LoadBidForm
    NoMoreQuestions --> LoadBidForm[Load Bid Submission Form]

    LoadBidForm -->|Display| BidForm[Bid Form]
    BidForm -->|Section| ItemPricing[Line Item Pricing]
    ItemPricing -->|For Each Item| EnterBid[Enter Bid Information]

    EnterBid -->|Enter| ItemPrice[Item Price]
    EnterBid -->|Enter| ItemQty[Quantity Offered]
    EnterBid -->|Enter| ItemUOM[Unit of Measure]
    EnterBid -->|Enter| ItemLeadTime[Lead Time]
    EnterBid -->|Enter| ItemNotes[Item Notes]
    EnterBid -->|Option| MarkNoBid[Mark as "No Bid"]

    ItemPrice -->|Validate| PriceValid{Price Valid?}
    PriceValid -->|No| PriceError[Show Price Error]
    PriceError --> ItemPrice
    PriceValid -->|Yes| AutoCalc[Auto-calculate Line Total]
    AutoCalc --> AutoSaveBid[Auto-save Draft]

    BidForm -->|Section| BidDetails[Bid Details]
    BidDetails -->|Enter| BidValidityPeriod[Bid Validity Period - Days]
    BidDetails -->|Enter| PaymentTerms[Payment Terms Offered]
    BidDetails -->|Enter| DeliveryTimeline[Delivery Timeline]
    BidDetails -->|Enter| WarrantyTerms[Warranty Terms]
    BidDetails -->|Enter| SpecialConditions[Special Conditions/Assumptions]

    BidForm -->|Section| Attachments[Supporting Documents]
    Attachments -->|Upload| TechnicalSpecs[Technical Specifications]
    Attachments -->|Upload| ProductBrochures[Product Brochures]
    Attachments -->|Upload| Certifications[Certifications]
    Attachments -->|Upload| Samples[Sample Information]

    TechnicalSpecs -->|Validate| FileCheck{Valid File?}
    FileCheck -->|No| FileError[Show File Error]
    FileError --> Attachments
    FileCheck -->|Yes| UploadToS3[Upload to S3]
    UploadToS3 --> AutoSaveBid

    AutoSaveBid -->|Every 2 Min| DraftDB[(Draft Storage)]
    DraftDB -->|Update| BidProgress[Update Progress Indicator]

    BidForm -->|Calculate| TotalBidValue[Calculate Total Bid Value]
    TotalBidValue -->|Sum| AllLineItems[Sum All Line Item Totals]
    AllLineItems -->|Display| BidSummary[Bid Summary Panel]

    BidSummary -->|Show| LineItemCount[Number of Line Items]
    BidSummary -->|Show| TotalValue[Total Bid Value]
    BidSummary -->|Show| Currency[Currency]
    BidSummary -->|Show| AvgLeadTime[Average Lead Time]

    BidForm -->|User Action| BidDecision{User Decision?}
    BidDecision -->|Save Draft| SaveDraft[Save Draft Bid]
    SaveDraft -->|Update| DraftDB
    SaveDraft -->|Display| DraftSaved[Show: Draft Saved]
    DraftSaved --> End

    BidDecision -->|Submit| ValidateBid[Validate Bid Completeness]
    ValidateBid -->|Check| AllRequired{All Required Fields?}

    AllRequired -->|No| HighlightMissing[Highlight Missing Fields]
    HighlightMissing --> BidForm

    AllRequired -->|Yes| PreviewBid[Preview Bid Submission]
    PreviewBid -->|Display| BidReview[Bid Review Page]

    BidReview -->|Show| CompleteItemList[Complete Line Item List]
    BidReview -->|Show| CompleteBidDetails[Complete Bid Details]
    BidReview -->|Show| AttachmentList[List of Attachments]
    BidReview -->|Show| SubmissionTime[Submission Timestamp]

    BidReview -->|Action| FinalBidDecision{Final Decision?}
    FinalBidDecision -->|Edit| BackToBidForm[Back to Bid Form]
    BackToBidForm --> BidForm

    FinalBidDecision -->|Cancel| CancelBid[Cancel Bid]
    CancelBid --> RFQList

    FinalBidDecision -->|Confirm| SubmitBidDB[Submit Bid to Database]
    SubmitBidDB -->|Generate| BidID[Generate Bid ID]
    BidID -->|Insert| BidDB[(tb_rfq_bid)]

    BidDB -->|Status| BidSubmitted[Status: SUBMITTED]
    BidDB -->|Timestamp| SubmissionTimestamp[Record Submission Time]
    BidDB -->|Vendor| VendorID[Record Vendor ID]

    SubmissionTimestamp -->|Update RFQ| UpdateRFQStatus[Update Vendor Bid Status]
    UpdateRFQStatus -->|tb_rfq.invitedVendors| MarkBidSubmitted[bidSubmittedAt: NOW]

    MarkBidSubmitted -->|Notify| BuyerNotification2[Notify Buyer]
    BuyerNotification2 -->|Email| BuyerBidEmail[Email: Bid Submitted]
    BuyerBidEmail -->|Include| BidLink[Link to View Bid]

    BuyerNotification2 -->|Send| VendorConfirmation[Vendor Confirmation Email]
    VendorConfirmation -->|Template| BidConfirmation[Bid Submission Confirmation]
    BidConfirmation -->|Include| BidNumber[Bid Number]
    BidNumber -->|Include| NextSteps[Next Steps Information]

    VendorConfirmation -->|Create| AuditLog[Audit Log Entry]
    AuditLog -->|Action| RFQ_BID_SUBMISSION
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|Display| SuccessPage[Submission Success Page]
    SuccessPage -->|Show| SuccessMessage[Show Success Message]
    SuccessMessage -->|Show| BidIDDisplay[Bid ID]
    BidIDDisplay -->|Show| EvaluationInfo[Evaluation Timeline Info]
    EvaluationInfo -->|Link| TrackBid[Track Bid Status]
    TrackBid --> End
```

### 4.7 View Purchase Orders Workflow (UC-VP-008)

```mermaid
flowchart TD
    Start([User Navigates to POs]) --> LoadPOs[Load Purchase Orders]
    LoadPOs -->|Query| PODB[(tb_purchase_order)]
    PODB -->|Filter| VendorPOs[Filter: vendorId = Current Vendor]

    VendorPOs -->|Display| POList[PO List View]
    POList -->|Group by Status| OpenPOs[Open POs]
    POList -->|Group by Status| InProgressPOs[In Progress POs]
    POList -->|Group by Status| CompletedPOs[Completed POs]

    POList -->|Highlight| AckRequired{Acknowledgment Required?}
    AckRequired -->|Yes| UrgentBadge[Show Urgent Badge]
    AckRequired -->|No| NormalDisplay

    UrgentBadge --> PODisplay
    NormalDisplay --> PODisplay[Display PO Cards]

    PODisplay -->|Show Per PO| PONumber[PO Number]
    PODisplay -->|Show Per PO| PODate[PO Date]
    PODisplay -->|Show Per PO| POValue[Total Value]
    PODisplay -->|Show Per PO| POStatus[Status]
    PODisplay -->|Show Per PO| DeliveryDate[Expected Delivery]

    PODisplay -->|User Clicks| SelectPO[Select PO]
    SelectPO -->|Load| PODetails[Load PO Details]
    PODetails -->|Display| POInfo[PO Information Page]

    POInfo -->|Header| POHeader[PO Header Information]
    POHeader -->|Show| PONum[PO Number]
    POHeader -->|Show| IssueDate[Issue Date]
    POHeader -->|Show| BuyerInfo[Buyer Information]
    POHeader -->|Show| Addresses[Ship-To & Bill-To Addresses]

    POInfo -->|Section| LineItems[Line Items Table]
    LineItems -->|Columns| ProductCol[Product]
    LineItems -->|Columns| QtyCol[Quantity]
    LineItems -->|Columns| UnitPriceCol[Unit Price]
    LineItems -->|Columns| LineTotalCol[Line Total]
    LineItems -->|Columns| DeliveryCol[Delivery Date]

    POInfo -->|Section| TermsSection[Terms & Conditions]
    TermsSection -->|Show| PaymentTerms[Payment Terms]
    TermsSection -->|Show| DeliveryTerms[Delivery Terms]
    TermsSection -->|Show| SpecialInstructions[Special Instructions]

    POInfo -->|Section| Documents[Attached Documents]
    Documents -->|List| Attachments[View Attachments]

    POInfo -->|Status Check| StatusCheck{PO Status?}
    StatusCheck -->|ISSUED| ShowAckButton[Show Acknowledge Button]
    StatusCheck -->|ACKNOWLEDGED| ShowDeliveryUpdate[Show Update Delivery Button]
    StatusCheck -->|IN_PROGRESS| ShowDeliveryUpdate
    StatusCheck -->|COMPLETED| ReadOnly[Read-Only View]

    ShowAckButton -->|Click| AcknowledgePO[Acknowledge PO]
    AcknowledgePO -->|Display| AckForm[Acknowledgment Form]

    AckForm -->|Option| AckType{Acknowledgment Type?}
    AckType -->|Accept As-Is| AcceptAsis[Accept All Terms]
    AckType -->|Accept with Exceptions| AcceptExceptions[Accept with Exceptions]
    AckType -->|Reject| RejectPO[Reject PO]

    AcceptAsis -->|Confirm| ConfirmAccept[Confirm Acceptance]
    ConfirmAccept -->|Display| AckSummary[Acknowledgment Summary]
    AckSummary -->|Show| CommitmentMsg[Commitment Message]
    CommitmentMsg -->|Action| FinalAckDecision{Confirm?}

    AcceptExceptions -->|Select Items| SelectExceptionItems[Select Line Items with Exceptions]
    SelectExceptionItems -->|For Each| EnterException[Enter Exception Details]
    EnterException -->|Type| ExceptionType[Exception Type: Qty/Price/Delivery]
    ExceptionType -->|Enter| ExceptionReason[Exception Reason]
    ExceptionReason -->|Propose| Alternative[Propose Alternative]
    Alternative --> ExceptionSummary[Exception Summary]
    ExceptionSummary --> FinalAckDecision

    RejectPO -->|Enter| RejectionReason[Rejection Reason - Required]
    RejectionReason -->|Validate| ReasonValid{Valid Reason?}
    ReasonValid -->|No| ReasonError[Show: Reason required]
    ReasonError --> RejectionReason
    ReasonValid -->|Yes| ConfirmReject[Confirm Rejection]
    ConfirmReject --> FinalAckDecision

    FinalAckDecision -->|Cancel| POInfo
    FinalAckDecision -->|Confirm| SubmitAck[Submit Acknowledgment]

    SubmitAck -->|Update| UpdatePOStatus[Update PO Status]
    UpdatePOStatus -->|If Accepted| StatusAcknowledged[Status: ACKNOWLEDGED]
    UpdatePOStatus -->|If Exceptions| StatusPendingReview[Status: PENDING_REVIEW]
    UpdatePOStatus -->|If Rejected| StatusRejected[Status: REJECTED]

    StatusAcknowledged -->|Record| AckTimestamp[Record Acknowledgment Time]
    StatusPendingReview -->|Record| AckTimestamp
    StatusRejected -->|Record| AckTimestamp

    AckTimestamp -->|Insert| AckDB[(tb_po_acknowledgment)]
    AckDB -->|Details| AckDetails[Store Acknowledgment Details]
    AckDetails -->|If Exceptions| ExceptionDetails[Store Exception Details]

    AckDB -->|Notify| BuyerNotification[Notify Buyer]
    BuyerNotification -->|Email| BuyerAckEmail[PO Acknowledgment Email]
    BuyerAckEmail -->|If Exceptions| ExceptionsAlert[Alert: Review Exceptions Required]
    BuyerAckEmail -->|Link| ReviewLink[Link to Review in ERP]

    BuyerNotification -->|Create| AuditLog[Audit Log Entry]
    AuditLog -->|Action| PO_ACKNOWLEDGMENT
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|Display| AckSuccess[Acknowledgment Success Message]
    AckSuccess -->|Show| AckConfirmation[Show Confirmation]
    AckConfirmation -->|Show| NextStepsInfo[Next Steps Information]
    NextStepsInfo -->|If Accepted| PrepareDelivery[Prepare for Delivery]
    NextStepsInfo -->|If Exceptions| AwaitBuyerResponse[Await Buyer Response]
    NextStepsInfo -->|If Rejected| ContactBuyer[Contact Buyer]

    ShowDeliveryUpdate -->|Click| UpdateDelivery[Update Delivery Status]
    UpdateDelivery -->|Display| DeliveryForm[Delivery Update Form]

    DeliveryForm -->|Select| DeliveryStatus{Delivery Status?}
    DeliveryStatus -->|Preparing Shipment| PreparingStatus
    DeliveryStatus -->|Shipped| ShippedStatus
    DeliveryStatus -->|In Transit| TransitStatus
    DeliveryStatus -->|Delivered| DeliveredStatus
    DeliveryStatus -->|Delayed| DelayedStatus

    PreparingStatus -->|Optional| EstimatedShipDate[Estimated Ship Date]
    EstimatedShipDate --> SaveDeliveryUpdate

    ShippedStatus -->|Required| ShipmentDate[Shipment Date]
    ShipmentDate -->|Required| Carrier[Carrier Name]
    Carrier -->|Required| TrackingNumber[Tracking Number]
    TrackingNumber -->|Optional| UploadPOD[Upload Packing Slip]
    UploadPOD --> SaveDeliveryUpdate

    TransitStatus -->|Required| CurrentLocation[Current Location]
    CurrentLocation -->|Required| EstimatedArrival[Estimated Arrival]
    EstimatedArrival --> SaveDeliveryUpdate

    DeliveredStatus -->|Required| DeliveryDate[Delivery Date]
    DeliveryDate -->|Required| DeliveredQty[Delivered Quantities]
    DeliveredQty -->|Optional| UploadProof[Upload Proof of Delivery]
    UploadProof --> SaveDeliveryUpdate

    DelayedStatus -->|Required| DelayReason[Delay Reason]
    DelayReason -->|Required| NewExpectedDate[New Expected Date]
    NewExpectedDate --> SaveDeliveryUpdate

    SaveDeliveryUpdate -->|Insert| DeliveryUpdateDB[(tb_delivery_tracking)]
    DeliveryUpdateDB -->|Update| PODeliveryStatus[Update PO Delivery Status]

    PODeliveryStatus -->|Notify| BuyerDeliveryNotif[Notify Buyer of Update]
    BuyerDeliveryNotif -->|Email| DeliveryEmail[Delivery Update Email]
    DeliveryEmail -->|Include| TrackingInfo[Tracking Information]

    BuyerDeliveryNotif -->|Create| DeliveryAuditLog[Audit Log Entry]
    DeliveryAuditLog -->|Action| PO_DELIVERY_UPDATE
    DeliveryAuditLog -->|tb_vendor_audit_log| AuditDB2

    AuditDB2 -->|Display| UpdateSuccess[Update Success Message]
    UpdateSuccess -->|Refresh| POInfo
    UpdateSuccess --> End([End])

    ReadOnly --> End
    PrepareDelivery --> End
    AwaitBuyerResponse --> End
    ContactBuyer --> End
```

### 4.8 Submit Invoice Workflow (UC-VP-009)

```mermaid
flowchart TD
    Start([User Navigates to Invoices]) --> LoadInvoices[Load Invoices]
    LoadInvoices -->|Query| InvoiceDB[(tb_invoice)]
    InvoiceDB -->|Filter| VendorInvoices[Filter: vendorId = Current Vendor]

    VendorInvoices -->|Display| InvoiceList[Invoice List View]
    InvoiceList -->|Group by Status| PendingInvoices[Pending Review]
    InvoiceList -->|Group by Status| ApprovedInvoices[Approved for Payment]
    InvoiceList -->|Group by Status| PaidInvoices[Paid Invoices]
    InvoiceList -->|Group by Status| RejectedInvoices[Rejected Invoices]

    InvoiceList -->|Action| CreateInvoice[Create Invoice Button]
    CreateInvoice -->|Click| SelectPO[Select Purchase Order]

    SelectPO -->|Query| EligiblePOs[Query Eligible POs]
    EligiblePOs -->|Filter| DeliveredPOs[Filter: Status = DELIVERED or COMPLETED]
    DeliveredPOs -->|Filter| NotFullyInvoiced[Filter: Not Fully Invoiced]

    NotFullyInvoiced -->|Display| POSelectionList[PO Selection List]
    POSelectionList -->|Show| POWithBalance[PO Number, Date, Balance Due]
    POWithBalance -->|User Selects| SelectedPO{PO Selected?}

    SelectedPO -->|No| SelectPO
    SelectedPO -->|Yes| LoadPOData[Load PO Data]

    LoadPOData -->|Fetch| POLineItems[Fetch PO Line Items]
    POLineItems -->|Fetch| DeliveryInfo[Fetch Delivery Information]
    DeliveryInfo -->|Display| InvoiceForm[Invoice Form]

    InvoiceForm -->|Header| InvoiceHeader[Invoice Header Section]
    InvoiceHeader -->|Enter| InvoiceNumber[Vendor Invoice Number - Required]
    InvoiceHeader -->|Enter| InvoiceDate[Invoice Date - Required]
    InvoiceHeader -->|Display| LinkedPO[Linked PO Number - Read-Only]
    InvoiceHeader -->|Select| Currency[Currency - From PO]

    InvoiceForm -->|Section| LineItemsSection[Line Items Section]
    LineItemsSection -->|Display Table| ItemsTable[Items from PO]

    ItemsTable -->|Columns| ProductColumn[Product]
    ItemsTable -->|Columns| POQtyColumn[PO Quantity]
    ItemsTable -->|Columns| DeliveredQtyColumn[Delivered Quantity]
    ItemsTable -->|Columns| PreviouslyInvoiced[Previously Invoiced]
    ItemsTable -->|Columns| InvoiceQtyColumn[Invoice Quantity]
    ItemsTable -->|Columns| UnitPriceColumn[Unit Price]
    ItemsTable -->|Columns| LineTotalColumn[Line Total]

    InvoiceQtyColumn -->|For Each Item| EnterInvoiceQty[Enter Invoice Quantity]
    EnterInvoiceQty -->|Validate| QtyValid{Quantity Valid?}

    QtyValid -->|> Delivered| QtyError[Show: Cannot exceed delivered quantity]
    QtyError --> EnterInvoiceQty

    QtyValid -->|> Remaining| QtyError2[Show: Already fully invoiced]
    QtyError2 --> EnterInvoiceQty

    QtyValid -->|Valid| AutoCalcLineTotal[Auto-calculate Line Total]
    AutoCalcLineTotal --> AutoSave[Auto-save Draft]

    UnitPriceColumn -->|Editable?| PriceCheck{Match PO Price?}
    PriceCheck -->|Different| RequireApproval[Flag for Approval]
    PriceCheck -->|Same| NoFlag
    RequireApproval --> AutoSave
    NoFlag --> AutoSave

    InvoiceForm -->|Section| AdditionalCharges[Additional Charges Section]
    AdditionalCharges -->|Add| ShippingCharges[Shipping/Handling Charges]
    AdditionalCharges -->|Add| OtherCharges[Other Charges]
    ShippingCharges --> AutoSave
    OtherCharges --> AutoSave

    InvoiceForm -->|Section| TaxSection[Tax Calculation Section]
    TaxSection -->|Enter| TaxRate[Tax Rate %]
    TaxRate -->|Calculate| TaxAmount[Tax Amount]
    TaxAmount --> AutoSave

    InvoiceForm -->|Section| Adjustments[Adjustments/Discounts Section]
    Adjustments -->|Enter| DiscountAmount[Discount Amount]
    Adjustments -->|Enter| DiscountReason[Discount Reason]
    DiscountAmount --> AutoSave

    InvoiceForm -->|Section| TotalsSection[Invoice Totals]
    TotalsSection -->|Calculate| Subtotal[Subtotal]
    Subtotal -->|Add| AddCharges[+ Additional Charges]
    AddCharges -->|Add| AddTax[+ Tax]
    AddTax -->|Subtract| SubtractDiscount[- Discounts]
    SubtractDiscount -->|Result| InvoiceTotal[Total Invoice Amount]

    InvoiceForm -->|Section| PaymentInfo[Payment Information]
    PaymentInfo -->|Display| BankAccount[Bank Account for Payment]
    BankAccount -->|Masked| AccountNumber[Account: ****5678]
    AccountNumber -->|Enter| PaymentTerms[Payment Terms]
    PaymentTerms -->|Display| DueDate[Calculate Due Date]

    InvoiceForm -->|Section| DocumentUpload[Invoice Document Upload]
    DocumentUpload -->|Required| InvoicePDF[Upload Invoice PDF]
    InvoicePDF -->|Validate| PDFValid{Valid PDF?}
    PDFValid -->|No| PDFError[Show: PDF required]
    PDFError --> InvoicePDF
    PDFValid -->|Yes| UploadToS3[Upload to S3]

    DocumentUpload -->|Optional| SupportingDocs[Upload Supporting Documents]
    SupportingDocs -->|Examples| PackingSlip[Packing Slip]
    SupportingDocs -->|Examples| DeliveryReceipt[Delivery Receipt]
    SupportingDocs -->|Examples| Other[Other Documents]
    PackingSlip --> UploadToS3
    DeliveryReceipt --> UploadToS3
    Other --> UploadToS3

    UploadToS3 -->|Scan| VirusScan[Virus Scanning]
    VirusScan -->|Clean| FileSafe
    VirusScan -->|Infected| VirusError[Show: File failed security scan]
    VirusError --> DocumentUpload

    FileSafe --> AutoSave
    AutoSave -->|Every 2 Min| DraftDB[(Draft Storage)]

    InvoiceForm -->|User Action| InvoiceDecision{User Decision?}
    InvoiceDecision -->|Save Draft| SaveDraft[Save Draft Invoice]
    SaveDraft -->|Update| DraftDB
    SaveDraft -->|Display| DraftSaved[Show: Draft Saved]
    DraftSaved --> End([End])

    InvoiceDecision -->|Submit| ValidateInvoice[Validate Invoice Completeness]
    ValidateInvoice -->|Check| DuplicateInvoiceNum{Duplicate Invoice Number?}

    DuplicateInvoiceNum -->|Yes| DuplicateError[Show: Invoice number already exists]
    DuplicateError --> InvoiceNumber

    DuplicateInvoiceNum -->|No| ValidateAllFields{All Required Fields?}
    ValidateAllFields -->|No| HighlightMissing[Highlight Missing Fields]
    HighlightMissing --> InvoiceForm

    ValidateAllFields -->|Yes| ValidatePOMatch{Quantities Match Delivery?}
    ValidatePOMatch -->|Exceed Delivered| QuantityError[Show: Quantities exceed delivery]
    QuantityError --> InvoiceForm

    ValidatePOMatch -->|Valid| PreviewInvoice[Preview Invoice Submission]
    PreviewInvoice -->|Display| InvoiceSummary[Invoice Summary]

    InvoiceSummary -->|Show| AllLineItems[Complete Line Item List]
    InvoiceSummary -->|Show| AllCharges[All Charges and Adjustments]
    InvoiceSummary -->|Show| FinalTotal[Final Total Amount]
    InvoiceSummary -->|Show| LinkedDocs[Linked Documents]

    InvoiceSummary -->|Action| FinalInvoiceDecision{Final Decision?}
    FinalInvoiceDecision -->|Edit| BackToForm[Back to Invoice Form]
    BackToForm --> InvoiceForm

    FinalInvoiceDecision -->|Cancel| CancelInvoice[Cancel Invoice]
    CancelInvoice --> InvoiceList

    FinalInvoiceDecision -->|Confirm| SubmitInvoiceDB[Submit Invoice to Database]
    SubmitInvoiceDB -->|Generate| SystemInvoiceID[Generate System Invoice ID]
    SystemInvoiceID -->|Insert| InvoiceTable[(tb_invoice)]

    InvoiceTable -->|Set Status| InvoiceStatus[Status: SUBMITTED]
    InvoiceTable -->|Link| POReference[Link to PO]
    InvoiceTable -->|Store| VendorInvoiceNum[Store Vendor Invoice Number]
    InvoiceTable -->|Store| InvoiceAmount[Store Total Amount]

    InvoiceAmount -->|Link Documents| DocumentRefs[Store Document References]
    DocumentRefs -->|S3 Keys| InvoicePDFRef
    DocumentRefs -->|S3 Keys| SupportingDocRefs

    DocumentRefs -->|Check Discrepancy| CheckDiscrepancy{Amount Discrepancy?}
    CheckDiscrepancy -->|PO Amount ≠ Invoice| FlagDiscrepancy[Flag for Review]
    CheckDiscrepancy -->|Price Different| FlagDiscrepancy
    FlagDiscrepancy --> NotifyAP

    CheckDiscrepancy -->|Match| AutoApprove[Eligible for Auto-Approval]
    AutoApprove --> NotifyAP[Notify Accounts Payable]

    NotifyAP -->|Send Email| APEmail[Email to AP Team]
    APEmail -->|Template| InvoiceSubmittedNotif[Invoice Submitted Notification]
    InvoiceSubmittedNotif -->|Include| InvoiceLink[Link to Review Invoice]
    InvoiceLink -->|Include| POLink[Link to Related PO]

    NotifyAP -->|Send Email| VendorConfirmation[Vendor Confirmation Email]
    VendorConfirmation -->|Template| InvoiceReceivedConfirm[Invoice Received Confirmation]
    InvoiceReceivedConfirm -->|Include| InvoiceID[System Invoice ID]
    InvoiceID -->|Include| ProcessingTimeline[Processing Timeline]

    VendorConfirmation -->|Create| AuditLog[Audit Log Entry]
    AuditLog -->|Action| INVOICE_SUBMISSION
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|Display| SubmissionSuccess[Submission Success Page]
    SubmissionSuccess -->|Show| SuccessMessage[Show Success Message]
    SuccessMessage -->|Show| InvoiceIDDisplay[Invoice ID]
    InvoiceIDDisplay -->|Show| TrackingInfo[Invoice Tracking Information]
    TrackingInfo -->|Link| ViewInvoice[View Submitted Invoice]
    ViewInvoice --> End
```

### 4.9 View Performance Metrics Workflow (UC-VP-010)

*(Refer to Data Flow Diagram 3.4 for detailed performance metrics flow)*

### 4.10 Message Center Workflow (UC-VP-011)

```mermaid
flowchart TD
    Start([User Navigates to Messages]) --> LoadMessages[Load Messages]
    LoadMessages -->|Query| MessageDB[(tb_vendor_message)]
    MessageDB -->|Filter| VendorMessages[Filter: vendorId = Current Vendor]

    VendorMessages -->|Display| MessageCenter[Message Center View]
    MessageCenter -->|Sections| Inbox[Inbox]
    MessageCenter -->|Sections| Sent[Sent Messages]
    MessageCenter -->|Sections| Archived[Archived Messages]

    MessageCenter -->|Badge| UnreadCount[Unread Count Badge]
    UnreadCount -->|Highlight| UnreadMessages[Highlight Unread Messages]

    Inbox -->|Display List| MessageList[Message List]
    MessageList -->|Show Per Message| SenderName[Sender Name]
    MessageList -->|Show Per Message| Subject[Subject]
    MessageList -->|Show Per Message| Preview[Message Preview]
    MessageList -->|Show Per Message| Timestamp[Timestamp]
    MessageList -->|Show Per Message| ReadStatus[Read/Unread Status]
    MessageList -->|Show Per Message| Priority[Priority Indicator]

    MessageList -->|User Action| MessageAction{User Action?}
    MessageAction -->|Compose New| ComposeNew[Compose New Message]
    MessageAction -->|Select Message| SelectMessage[Select Message to Read]
    MessageAction -->|Archive| ArchiveMessage[Archive Message]
    MessageAction -->|Delete| DeleteMessage[Delete Message]

    ComposeNew -->|Display| ComposeForm[Message Composition Form]
    ComposeForm -->|Select| RecipientType[Recipient Type: Buyer]
    RecipientType -->|Select| BuyerDept[Select Department/Contact]
    BuyerDept -->|Enter| MessageSubject[Message Subject - Required]
    MessageSubject -->|Select| MessageCategory[Message Category]

    MessageCategory -->|Options| CategoryOptions[General/Inquiry/Issue/Clarification/Urgent]
    CategoryOptions -->|Enter| MessageBody[Message Body - Text Editor]

    MessageBody -->|Rich Text| FormattingOptions[Bold, Italic, Lists, Links]
    FormattingOptions -->|Optional| AttachFiles[Attach Files]

    AttachFiles -->|Upload| FileValidation[Validate Files]
    FileValidation -->|Size Check| SizeOK{Size <= 10MB?}
    SizeOK -->|No| SizeError[Show: File too large]
    SizeError --> AttachFiles
    SizeOK -->|Yes| UploadTemp[Upload to Temp Storage]
    UploadTemp --> ComposeForm

    MessageBody -->|Optional| LinkResource[Link to Related Resource]
    LinkResource -->|Options| ResourceType[PO/Invoice/RFQ/Template]
    ResourceType -->|Select| ResourceID[Select Specific Resource]
    ResourceID --> ComposeForm

    ComposeForm -->|User Action| ComposeDecision{User Decision?}
    ComposeDecision -->|Save Draft| SaveMessageDraft[Save as Draft]
    SaveMessageDraft -->|Update| DraftDB[(Draft Storage)]
    SaveMessageDraft -->|Display| DraftSaved[Show: Draft Saved]
    DraftSaved --> End([End])

    ComposeDecision -->|Send| ValidateMessage{Message Valid?}
    ValidateMessage -->|No Subject| SubjectError[Show: Subject required]
    SubjectError --> MessageSubject
    ValidateMessage -->|No Body| BodyError[Show: Message body required]
    BodyError --> MessageBody

    ValidateMessage -->|Valid| SendMessage[Send Message]
    SendMessage -->|Generate| ThreadID[Generate/Use Thread ID]
    ThreadID -->|Insert| MessageTable[(tb_vendor_message)]

    MessageTable -->|Set| MessageStatus[Status: SENT]
    MessageTable -->|Store| MessageData[Store Message Data]
    MessageData -->|Sender| VendorUser
    MessageData -->|Recipient| BuyerUser
    MessageData -->|Attachments| FileRefs[Store File References]

    FileRefs -->|Notify| BuyerNotification[Notify Recipient]
    BuyerNotification -->|Email| BuyerEmail[Email Notification]
    BuyerEmail -->|Template| NewMessageNotif[New Message from Vendor]
    NewMessageNotif -->|Link| MessageLink[Link to View Message in ERP]

    BuyerNotification -->|Create| AuditLog[Audit Log Entry]
    AuditLog -->|Action| MESSAGE_SENT
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|Display| MessageSent[Message Sent Confirmation]
    MessageSent -->|Move to| SentFolder[Sent Messages Folder]
    SentFolder --> MessageCenter

    SelectMessage -->|Load| MessageDetails[Load Message Details]
    MessageDetails -->|Display| MessageView[Message View]

    MessageView -->|Header| MessageHeader[Message Header]
    MessageHeader -->|Show| From[From: Sender Name]
    MessageHeader -->|Show| To[To: Recipient Name]
    MessageHeader -->|Show| SubjectLine[Subject Line]
    MessageHeader -->|Show| Date[Date & Time]
    MessageHeader -->|Show| CategoryBadge[Category Badge]

    MessageView -->|Body| MessageContent[Message Content]
    MessageContent -->|Show| BodyText[Message Body Text]
    BodyText -->|If Exists| ResourceLinks[Linked Resources]
    ResourceLinks -->|Display| ResourceCards[Resource Cards with Quick View]

    MessageContent -->|If Exists| AttachmentsSection[Attachments Section]
    AttachmentsSection -->|List| FileList[File List with Download Links]
    FileList -->|Click| DownloadFile[Download File]

    MessageView -->|If Part of Thread| ThreadView[Show Thread History]
    ThreadView -->|Display| PreviousMessages[Previous Messages in Thread]
    PreviousMessages -->|Chronological| OldestFirst[Oldest to Newest]

    MessageView -->|Action| MessageViewAction{User Action?}
    MessageViewAction -->|Reply| ReplyMessage[Reply to Message]
    MessageViewAction -->|Archive| ArchiveMsg[Archive Message]
    MessageViewAction -->|Delete| DeleteMsg[Delete Message]
    MessageViewAction -->|Back| MessageCenter

    ReplyMessage -->|Pre-fill| ReplyForm[Reply Composition Form]
    ReplyForm -->|Subject| Re_Subject[Re: Original Subject]
    ReplyForm -->|Thread| SameThread[Same Thread ID]
    ReplyForm -->|Quote| OriginalMessage[Quote Original Message]
    OriginalMessage -->|Enter| ReplyBody[Enter Reply Text]
    ReplyBody -->|Optional| ReplyAttach[Attach Files]
    ReplyAttach -->|Send| SendReply[Send Reply]

    SendReply -->|Insert| MessageTable
    SendReply -->|Update Thread| UpdateThread[Update Thread]
    UpdateThread -->|Notify| NotifyOriginalSender[Notify Original Sender]
    NotifyOriginalSender -->|Email| ReplyNotification[Reply Notification Email]
    ReplyNotification -->|Display| ReplySent[Reply Sent Confirmation]
    ReplySent --> MessageView

    ArchiveMsg -->|Update| ArchiveStatus[Set Archived Flag]
    ArchiveStatus -->|Move| ArchivedFolder[Archived Messages]
    ArchivedFolder --> MessageCenter

    DeleteMsg -->|Soft Delete| SetDeletedAt[Set deleted_at Timestamp]
    SetDeletedAt -->|Remove from View| MessageDeleted[Message Deleted]
    MessageDeleted --> MessageCenter

    DownloadFile -->|Generate| PreSignedURL[Generate Pre-signed S3 URL]
    PreSignedURL -->|15 min expiry| FileURL[File Download URL]
    FileURL -->|Download| FileDownloaded[File Downloaded]
    FileDownloaded --> MessageView
```

---

## 5. Integration Workflows

### 5.1 Registration to Vendor Creation Workflow

```mermaid
graph TB
    Registration[Vendor Registration Submitted] -->|Status| PendingReview[Status: PENDING_REVIEW]
    PendingReview -->|Notify| ProcurementTeam[Procurement Team Notified]

    ProcurementTeam -->|Access| ERPReviewPage[ERP Review Page]
    ERPReviewPage -->|Display| RegistrationDetails[Full Registration Details]
    RegistrationDetails -->|Display| CompanyInfo[Company Information]
    RegistrationDetails -->|Display| Contacts[Contact Information]
    RegistrationDetails -->|Display| BusinessDetails[Business Details]
    RegistrationDetails -->|Display| Documents[Uploaded Documents]

    Documents -->|Reviewer Opens| ViewDocs[View Each Document]
    ViewDocs -->|Validate| DocValidation{Documents Valid?}
    DocValidation -->|Missing/Invalid| RequestMoreDocs[Request Additional Documents]
    RequestMoreDocs -->|Email Vendor| DocRequest[Document Request Email]
    DocRequest --> VendorUploads[Vendor Uploads More Docs]
    VendorUploads --> Documents

    DocValidation -->|Valid| BackgroundCheck[Conduct Background Checks]
    BackgroundCheck -->|Verify| CreditCheck[Credit Check]
    BackgroundCheck -->|Verify| ReferenceCheck[Reference Verification]
    BackgroundCheck -->|Verify| LicenseVerification[License Verification]

    CreditCheck -->|Results| CheckResults
    ReferenceCheck -->|Results| CheckResults
    LicenseVerification -->|Results| CheckResults[Compile Check Results]

    CheckResults -->|Procurement Decision| ApprovalDecision{Approve?}
    ApprovalDecision -->|Reject| RejectRegistration[Reject Registration]
    RejectRegistration -->|Update Status| StatusRejected[Status: REJECTED]
    StatusRejected -->|Enter Reason| RejectionReason[Enter Rejection Reason]
    RejectionReason -->|Email Vendor| RejectionEmail[Rejection Notification Email]
    RejectionEmail -->|Allow Reapply| ReapplyAfter30Days[Can Reapply After 30 Days]
    ReapplyAfter30Days --> End1([End])

    ApprovalDecision -->|Approve| CreateVendorRecord[Create Vendor Record in tb_vendor]
    CreateVendorRecord -->|Generate| VendorCode[Generate Vendor Code]
    VendorCode -->|Insert| VendorDB[(tb_vendor)]

    VendorDB -->|Decrypt| BankAccountData[Decrypt Bank Account Data]
    BankAccountData -->|Store| EncryptedInVendor[Store Encrypted in Vendor Record]

    EncryptedInVendor -->|Copy Documents| LinkDocuments[Link Registration Documents to Vendor]
    LinkDocuments -->|tb_vendor_document| DocumentsLinked[Documents Linked]

    DocumentsLinked -->|Create| PortalUser[Create Vendor Portal User]
    PortalUser -->|Generate| Credentials[Generate Login Credentials]
    Credentials -->|Temp Password| TempPassword[Generate Temporary Password]
    TempPassword -->|Insert| UserDB[(tb_vendor_portal_user)]

    UserDB -->|Set Flags| PortalUserFlags[Set User Flags]
    PortalUserFlags -->|Flag| MustChangePassword[mustChangePassword = true]
    PortalUserFlags -->|Flag| EmailVerificationRequired[emailVerified = false]

    EmailVerificationRequired -->|Update Registration| RegistrationApproved[Status: APPROVED]
    RegistrationApproved -->|Link Vendor| LinkVendorID[Link vendorId to Registration]

    LinkVendorID -->|Send Emails| ApprovalNotifications[Send Approval Notifications]
    ApprovalNotifications -->|Vendor Email| WelcomeEmail[Welcome Email with Credentials]
    WelcomeEmail -->|Include| PortalURL[Portal Login URL]
    WelcomeEmail -->|Include| TempPasswordEmail[Temporary Password]
    WelcomeEmail -->|Include| OnboardingInstructions[Onboarding Instructions]

    ApprovalNotifications -->|Internal Email| ProcurementNotif[Procurement Notification]
    ProcurementNotif -->|Confirm| VendorCodeEmail[Vendor Code Assigned]

    OnboardingInstructions -->|Create| AuditLog[Audit Log Entry]
    AuditLog -->|Action| VENDOR_REGISTRATION_APPROVED
    AuditLog -->|tb_vendor_audit_log| AuditDB

    AuditDB -->|Vendor First Login| OnboardingFlow[Vendor Starts Onboarding Flow]
    OnboardingFlow -->|Complete Checklist| OnboardingTasks[Complete Onboarding Tasks]
    OnboardingTasks -->|Full Portal Access| PortalActive[Portal Fully Active]
    PortalActive --> End2([End])
```

### 5.2 Price Template Submission to Price List Creation Workflow

```mermaid
graph LR
    VendorSubmits[Vendor Submits Price Template] -->|Portal| CreateSubmission[Create Price List from Template]
    CreateSubmission -->|Insert| PriceListDB[(tb_price_list)]

    PriceListDB -->|Set Fields| SourceTemplate[sourceType: template]
    SourceTemplate -->|Set Fields| SourceID[sourceId: template_id]
    SourceID -->|Set Fields| SourceRef[sourceReference: submission_id]

    SourceRef -->|Status| InitialStatus{Price Increases Detected?}
    InitialStatus -->|>10%| PendingApproval[Status: PENDING_APPROVAL]
    InitialStatus -->|Normal| Active[Status: ACTIVE]

    PendingApproval -->|Notify| ProcurementApproval[Notify Procurement for Approval]
    ProcurementApproval -->|ERP| ApprovalWorkflow[Approval Workflow in Main System]
    ApprovalWorkflow -->|Approved| ActivatePriceList[Activate Price List]
    ApprovalWorkflow -->|Rejected| RejectPriceList[Reject Price List]

    RejectPriceList -->|Update| StatusDraft[Status: DRAFT]
    StatusDraft -->|Notify Portal| VendorNotified[Vendor Notified of Rejection]
    VendorNotified -->|Portal Notification| ShowRejectionReason[Show Rejection Reason]
    ShowRejectionReason -->|Allow| Resubmit[Allow Resubmission]
    Resubmit --> End1([End])

    ActivatePriceList -->|Update| StatusActive[Status: ACTIVE]
    Active --> StatusActive

    StatusActive -->|Supersede| CheckExisting{Existing Price List?}
    CheckExisting -->|Yes| MarkSuperseded[Mark Old as SUPERSEDED]
    MarkSuperseded --> AvailableForUse
    CheckExisting -->|No| AvailableForUse[Available for Procurement Use]

    AvailableForUse -->|Update Template| MarkTemplateComplete[Mark Template as Submitted]
    MarkTemplateComplete -->|Notify Portal| PortalUpdate[Update Portal - Template Status]
    PortalUpdate -->|Display| SubmissionSuccess[Show Submission Success]
    SubmissionSuccess --> End2([End])
```

### 5.3 RFQ Award to Contract Price List Workflow

```mermaid
graph TB
    RFQAwarded[RFQ Awarded in ERP] -->|Trigger| AutoCreatePriceList[Auto-Create Price List from Award]
    AutoCreatePriceList -->|Insert| PriceListDB[(tb_price_list)]

    PriceListDB -->|Set Fields| SourceRFQ[sourceType: rfq]
    SourceRFQ -->|Set Fields| SourceID[sourceId: rfq_id]
    SourceID -->|Set Fields| SourceRef[sourceReference: award_id]

    SourceRef -->|Set Flags| ContractPricing[isContractPricing: true]
    ContractPricing -->|Set Flags| TakesPrecedence[takesPrecedence: true]
    TakesPrecedence -->|Set Flags| ContractRef[contractReference: rfq_number]

    ContractRef -->|Status| ActiveStatus[Status: ACTIVE]
    ActiveStatus -->|Copy Bid Items| BidItems[Copy Awarded Bid Items to Price List Items]

    BidItems -->|Map Fields| ProductID[productId: from RFQ item]
    ProductID -->|Map Fields| BidPrices[basePrice, unitPrice: from bid]
    BidPrices -->|Map Fields| BidTerms[Lead time, MOQ: from bid]

    BidTerms -->|Check Existing| ExistingCheck{Existing Price Lists?}
    ExistingCheck -->|Yes| SupersedeExisting[Mark Existing as SUPERSEDED]
    SupersedeExisting --> NotifyVendor
    ExistingCheck -->|No| NotifyVendor[Notify Vendor via Portal]

    NotifyVendor -->|Create Notification| PortalNotif[In-Portal Notification]
    PortalNotif -->|Type| ContractPriceCreated[Type: Contract Price List Created]
    ContractPriceCreated -->|Send Email| VendorEmail[Email: RFQ Award & Contract Pricing]

    VendorEmail -->|Include| AwardDetails[Award Details]
    AwardDetails -->|Include| PriceListLink[Link to View Price List in Portal]
    PriceListLink -->|Include| POExpectation[Expected Purchase Orders Information]

    POExpectation -->|Update Portal| UpdatePortalUI[Update Vendor Portal UI]
    UpdatePortalUI -->|Dashboard| ShowContract[Show Contract Pricing Badge]
    ShowContract -->|RFQ List| MarkAwarded[Mark RFQ as Awarded]
    MarkAwarded -->|Price Lists| ShowNewPriceList[Display New Contract Price List]

    ShowNewPriceList --> End([End])
```

---

## 6. Scheduled Jobs & Automation

### 6.1 Document Expiry Reminder Job

```mermaid
graph TB
    CronJob[Daily Cron Job - 9:00 AM] -->|Execute| QueryDocs[Query Documents with Expiry Dates]
    QueryDocs -->|tb_vendor_document| FilterDocs[Filter: currentVersion = true, status = APPROVED]

    FilterDocs -->|Calculate| CheckExpiry{Days Until Expiry?}
    CheckExpiry -->|60 Days| Reminder60[Send 60-Day Reminder]
    CheckExpiry -->|30 Days| Reminder30[Send 30-Day Reminder]
    CheckExpiry -->|7 Days| Reminder7[Send 7-Day Reminder]
    CheckExpiry -->|Expired| MarkExpired[Mark as EXPIRED]

    Reminder60 -->|Check Sent| AlreadySent60{60-Day Sent?}
    AlreadySent60 -->|Yes| Skip60[Skip]
    AlreadySent60 -->|No| SendEmail60[Send Email Reminder]
    SendEmail60 -->|Update| LogReminder60[Log Reminder Sent]
    LogReminder60 -->|tb_vendor_notification| CreateNotif60[Create In-Portal Notification]
    CreateNotif60 --> End1([Continue Loop])

    Reminder30 -->|Check Sent| AlreadySent30{30-Day Sent?}
    AlreadySent30 -->|Yes| Skip30[Skip]
    AlreadySent30 -->|No| SendEmail30[Send Email Reminder]
    SendEmail30 -->|Update Status| UpdateStatus30[Status: EXPIRING_SOON]
    UpdateStatus30 -->|Update| LogReminder30[Log Reminder Sent]
    LogReminder30 -->|tb_vendor_notification| CreateNotif30[Create In-Portal Notification - HIGH Priority]
    CreateNotif30 --> End1

    Reminder7 -->|Check Sent| AlreadySent7{7-Day Sent?}
    AlreadySent7 -->|Yes| Skip7[Skip]
    AlreadySent7 -->|No| SendEmail7[Send URGENT Email Reminder]
    SendEmail7 -->|Update| LogReminder7[Log Reminder Sent]
    LogReminder7 -->|tb_vendor_notification| CreateNotif7[Create In-Portal Notification - URGENT Priority]
    CreateNotif7 -->|Banner| DashboardBanner[Show Expiry Banner on Dashboard]
    DashboardBanner --> End1

    MarkExpired -->|Update| StatusExpired[status: EXPIRED]
    StatusExpired -->|Send Email| ExpiredEmail[Send Expiry Notification]
    ExpiredEmail -->|Portal Notification| ExpiredNotif[Urgent Notification: Document Expired]
    ExpiredNotif -->|Check Critical| CriticalDoc{Critical Document?}

    CriticalDoc -->|Yes| BlockActions[Block: New Pricing, RFQ Bids]
    BlockActions -->|Banner| CriticalBanner[Show Critical Alert Banner]
    CriticalBanner --> End1

    CriticalDoc -->|No| WarningOnly[Show Warning Only]
    WarningOnly --> End1

    Skip60 --> End1
    Skip30 --> End1
    Skip7 --> End1
```

### 6.2 Session Cleanup Job

```mermaid
graph TB
    CronJob[Hourly Cron Job] -->|Execute| QuerySessions[Query Expired Sessions]
    QuerySessions -->|tb_vendor_portal_session| FilterExpired[Filter: expiresAt < NOW()]

    FilterExpired -->|For Each| CheckActivity{Last Activity > 30 min?}
    CheckActivity -->|Yes| DeleteSession[Delete Session Record]
    CheckActivity -->|No| ExtendSession[Extend Session if Active]

    DeleteSession -->|Remove| SessionDB[(Session Database)]
    SessionDB -->|Log| AuditLog[Audit Log: SESSION_EXPIRED]
    AuditLog --> End1([Continue Loop])

    ExtendSession -->|Update| NewExpiry[expiresAt: NOW() + 30 minutes]
    NewExpiry --> End1
```

---

## Document History

| Version | Date       | Author | Changes                          |
|---------|------------|--------|----------------------------------|
| 1.0     | 2024-01-15 | System | Initial flow diagrams document   |

---

## Related Documents

- Vendor Entry Portal - Business Requirements (BR-vendor-portal.md)
- Vendor Entry Portal - Use Cases (UC-vendor-portal.md)
- Vendor Entry Portal - Technical Specification (TS-vendor-portal.md)
- Vendor Entry Portal - Validations (VAL-vendor-portal.md)
- Vendor Management - Module Overview (VENDOR-MANAGEMENT-OVERVIEW.md)

---

**End of Flow Diagrams Document**
