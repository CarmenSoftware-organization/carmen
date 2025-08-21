# Vendor Pricelist Management Module - Requirements Document

## Introduction

The Vendor Pricelist Management Module is a comprehensive system within the Carmen Supply Chain Management System that provides centralized vendor management, pricelist collection, price validity management, and intelligent price assignment capabilities. This feature streamlines all vendor-related pricing processes across the organization, reduces manual work, and improves procurement decision-making by integrating systematic vendor management with intelligent price assignment to Purchase Requests (PRs).

The module operates as a unified system at `app/(main)/vendor-management/` with all vendor and pricing functionality consolidated under a single module. This organizational structure provides a cohesive vendor and pricing hub for all supply chain operations, where all vendor-related capabilities are integrated within a single, intuitive interface.

## Requirements

### Requirement 1: Vendor Pricelist Management
**User Story**: As a Purchasing Staff member, I want to configure pricelist collection templates and manage vendor pricing information systematically.

**Acceptance Criteria**
- WHEN I access a vendor profile THEN the system SHALL display pricelist collection options
- WHEN I view a pricelist template THEN the system SHALL provide quick actions to generate collection links and send to vendors directly from the template view
- WHEN I create a new Pricelist template THEN the system SHALL allow the user to select products via category, subcategory, item group or search
- WHEN I export a Pricelist template THEN the system SHALL download an Excel sheet as a vendor pricelist template
- WHEN I generate a pricelist collection link THEN the system SHALL create unique vendor-specific links that generate individual pricelists for each selected vendor
- WHEN a vendor completes pricing THEN the system SHALL create a vendor-specific pricelist associated with the collection link
- WHEN I view vendor history THEN the system SHALL display complete pricelist collection history
- WHEN I view pricelist page THEN the system SHALL display it as "Price Lists" with comprehensive filtering options

### Requirement 2: Secure Vendor Price Collection Link
**User Story**: As a Vendor, I want to access a secure web portal to submit my pricing information with multiple submission options.

**Acceptance Criteria**
- WHEN I receive an email invitation THEN the system SHALL provide a unique, time-limited access link
- WHEN I access the portal THEN the system SHALL authenticate me using secure token-based access
- WHEN I view the submission interface THEN the system SHALL display three submission options:
  1. Direct online entry
  2. Download Excel template and upload
  3. Download Excel template and email to purchasing staff
- WHEN I choose online entry THEN the system SHALL display all items in a single list view with inline price entry for MOQ 1
- WHEN I need to add bulk pricing THEN the system SHALL provide an [+] button next to each item to add additional MOQ tiers
- WHEN I select my pricing currency THEN the system SHALL apply it to all prices in my submission
- WHEN I save my work THEN the system SHALL maintain draft status allowing me to return and complete later
- WHEN I complete submission THEN the system SHALL send notification confirmation with submission details

### Requirement 3: Excel Template Price Collection System
**User Story**: As a Vendor, I want to download Excel templates for price submission with flexible submission methods.

**Acceptance Criteria**
- WHEN I download templates THEN the system SHALL include clear instructions for multi-MOQ pricing
- WHEN the template structure THEN the system SHALL support multiple rows per item with different MOQ values and unit types
- WHEN I complete the template THEN the system SHALL allow submission via:
  1. Portal upload with drag-and-drop support
  2. Email to purchasing staff with pricelist ID reference
- WHEN templates contain errors THEN the system SHALL provide detailed error reporting with correction guidance
- WHEN processing is complete THEN the system SHALL send confirmation notification with processing results
- WHEN templates are invalid THEN the system SHALL reject submission and provide specific error details

### Requirement 4: Multi-Currency Price Management
**User Story**: As a Purchasing Staff member, I want to manage vendor pricing in multiple currencies so that I can work with international vendors.

**Acceptance Criteria**
- WHEN vendors submit prices THEN they SHALL select their preferred currency for the entire submission
- WHEN prices are displayed THEN the system SHALL show the currency clearly alongside each price
- WHEN I generate reports THEN the system SHALL group and display prices by their original currencies
- WHEN I compare prices THEN the system SHALL clearly indicate different currencies to prevent confusion

### Requirement 10: Data Quality and Validation Management
**User Story**: As a Purchasing Staff member, I want comprehensive data validation and quality control for vendor pricing submissions.

**Acceptance Criteria**
- WHEN vendors submit pricing THEN the system SHALL validate data format, completeness, and business rules
- WHEN validation errors occur THEN the system SHALL provide specific inline error messages with correction guidance
- WHEN data quality issues are detected THEN the system SHALL flag submissions for manual review
- WHEN I review submissions THEN the system SHALL provide quality scoring and validation status
- WHEN corrections are needed THEN the system SHALL allow resubmission with change tracking
- WHEN validation passes THEN the system SHALL automatically approve submissions for use

### Requirement 12: Complete Vendor CRUD Operations
**User Story**: As a Purchasing Staff member, I want complete vendor management capabilities including create, read, update, and delete operations.

**Acceptance Criteria**
- WHEN I create a new vendor THEN the system SHALL provide a comprehensive registration form with validation
- WHEN I view vendor details THEN the system SHALL display complete vendor profile with performance metrics
- WHEN I edit vendor information THEN the system SHALL track changes and maintain audit history
- WHEN I delete a vendor THEN the system SHALL check dependencies and provide confirmation workflow
- WHEN I search vendors THEN the system SHALL support advanced filtering by multiple criteria
- WHEN I manage vendor status THEN the system SHALL provide activation/deactivation workflow with notifications

### Requirement 14: Enhanced Vendor Portal Functionality
**User Story**: As a Vendor, I want advanced portal functionality including file processing, submission management, and multi-currency support.

**Acceptance Criteria**
- WHEN I submit prices THEN the system SHALL provide real-time validation with detailed inline error messages
- WHEN I upload files THEN the system SHALL support multiple formats with progress tracking and error handling
- WHEN I view submission history THEN the system SHALL display detailed status, errors, and processing results
- WHEN I download templates THEN the system SHALL generate vendor-specific templates with my assigned categories
- WHEN I submit prices THEN the system SHALL allow currency selection at the submission level
- WHEN I track submissions THEN the system SHALL provide approval workflow status and notifications

### Requirement 15: Advanced API Implementation
**User Story**: As a System Integrator, I want comprehensive API endpoints for all vendor management and price collection operations.

**Acceptance Criteria**
- WHEN I access vendor APIs THEN the system SHALL provide complete CRUD operations with proper validation
- WHEN I use bulk operation APIs THEN the system SHALL support batch processing with error handling
- WHEN I integrate with portal APIs THEN the system SHALL provide secure authentication and session management
- WHEN I process files via API THEN the system SHALL support streaming uploads with progress tracking
- WHEN I manage assignments via API THEN the system SHALL integrate with business rules engine
- WHEN I handle errors THEN the system SHALL provide comprehensive error codes and recovery guidance

### Requirement 17: Price Collection Campaign Management
**User Story**: As a Purchasing Staff member, I want to create, edit, and delete price collection campaigns systematically.

**Acceptance Criteria**
- WHEN I create a collection campaign THEN the system SHALL provide a campaign creation interface with vendor selection, categories, and scheduling options
- WHEN I create campaigns from template view THEN the system SHALL pre-populate campaign with template details
- WHEN I edit a collection campaign THEN the system SHALL allow modification of campaign parameters while preserving existing submissions
- WHEN I delete a collection campaign THEN the system SHALL check for dependencies and provide confirmation with data retention options
- WHEN I schedule campaigns THEN the system SHALL support one-time, recurring, and event-based collection schedules
- WHEN I manage campaign status THEN the system SHALL provide start, pause, resume, and stop functionality with status tracking
- WHEN I monitor campaigns THEN the system SHALL display real-time progress, vendor participation, and completion rates

### Requirement 19: Individual Price Item Management
**User Story**: As a Purchasing Staff member, I want to add, edit, and delete individual price items within vendor pricelists.

**Acceptance Criteria**
- WHEN I add price items THEN the system SHALL provide item creation with product selection, pricing details, validity periods, and MOQ levels
- WHEN I edit price items THEN the system SHALL allow modification of prices, quantities, units, and validity with version tracking
- WHEN I delete price items THEN the system SHALL check for active assignments and provide confirmation with impact analysis
- WHEN I bulk edit items THEN the system SHALL support mass updates with validation and preview functionality
- WHEN I manage item status THEN the system SHALL provide activation, deactivation, and expiration management
- WHEN I track changes THEN the system SHALL maintain complete audit trail with user attribution and timestamps

### Requirement 21: Vendor Invitation and Communication Management
**User Story**: As a Purchasing Staff member, I want to create, send, and manage vendor invitations for price collection directly from template views.

**Acceptance Criteria**
- WHEN I view a pricelist template THEN the system SHALL provide options to generate links and send invitations
- WHEN I create vendor invitations THEN the system SHALL provide vendor selection with automatic link generation
- WHEN I customize invitations THEN the system SHALL support email template customization with company branding and specific instructions
- WHEN I send invitations THEN the system SHALL generate unique, time-limited portal access tokens and send personalized emails
- WHEN I track invitations THEN the system SHALL monitor invitation delivery, portal access, and submission status in real-time
- WHEN I manage follow-ups THEN the system SHALL provide automated reminder scheduling with escalation workflows
- WHEN I analyze campaigns THEN the system SHALL provide invitation analytics including response rates, completion times, and vendor engagement metrics

### Requirement 24: Vendor Portal User Experience and Interface
**User Story**: As a Vendor, I want an intuitive and responsive portal interface with clear progress tracking and guidance.

**Acceptance Criteria**
- WHEN I access the portal THEN the system SHALL display a welcome dashboard with invitation details, deadline countdown, and progress indicators
- WHEN I navigate the portal THEN the system SHALL provide three clear submission options with visual guidance
- WHEN I submit prices THEN the system SHALL provide real-time validation feedback with specific inline error messages
- WHEN I save progress THEN the system SHALL auto-save my work every 30 seconds and allow me to resume from where I left off
- WHEN I use mobile devices THEN the system SHALL provide responsive design with touch-friendly interfaces and optimized layouts
- WHEN I need help THEN the system SHALL provide contextual help, FAQ sections, and direct contact options for support

### Requirement 25: Multi-Step Invitation Creation Workflow
**User Story**: As a Purchasing Staff member, I want a streamlined workflow for creating invitations from template views.

**Acceptance Criteria**
- WHEN I start invitation creation from template THEN the system SHALL provide quick vendor selection interface
- WHEN I select vendors THEN the system SHALL generate unique links for each vendor creating vendor-specific pricelists
- WHEN I configure settings THEN the system SHALL validate deadline dates and portal access duration with warnings for potential issues
- WHEN I customize communication THEN the system SHALL provide template preview and spam score checking
- WHEN I review before sending THEN the system SHALL display vendor list with generated links and pricelist IDs
- WHEN I send invitations THEN the system SHALL track delivery and provide real-time status updates

### Requirement 26: Real-Time Invitation Tracking and Analytics
**User Story**: As a Purchasing Staff member, I want real-time tracking and comprehensive analytics for invitation campaigns.

**Acceptance Criteria**
- WHEN I view invitation status THEN the system SHALL display real-time metrics including sent, delivered, opened, clicked, and responded counts
- WHEN I track individual vendors THEN the system SHALL show detailed vendor-specific status including portal access time, submission progress, and completion status
- WHEN I monitor campaign progress THEN the system SHALL provide visual dashboards with completion rates, response times, and participation metrics
- WHEN I analyze performance THEN the system SHALL generate reports on response rates, average completion times, and vendor engagement patterns
- WHEN I identify issues THEN the system SHALL highlight non-responsive vendors, failed deliveries, and overdue submissions with recommended actions
- WHEN I export data THEN the system SHALL provide detailed analytics exports in multiple formats for further analysis and reporting

### Requirement 27: Enhanced Email Communication Features
**User Story**: As a Purchasing Staff member, I want to send vendor invitations directly from the template view with professional communication.

**Acceptance Criteria**
- WHEN I view a pricelist template THEN the system SHALL provide options to:
  1. Generate collection links for selected vendors
  2. Send invitations to vendors
  3. Create campaigns from the template
- WHEN I select vendors for invitation THEN the system SHALL generate unique links creating vendor-specific pricelists
- WHEN generating links THEN the system SHALL display each vendor's unique URL and pricelist ID
- WHEN I send invitations THEN the system SHALL include the vendor-specific link and clear submission instructions
- WHEN I handle multiple languages THEN the system SHALL support automatic language detection based on vendor preferences
- WHEN I ensure deliverability THEN the system SHALL include spam score checking and delivery optimization recommendations

### Requirement 28: Advanced Portal Session Management
**User Story**: As a System Administrator, I want comprehensive portal session management with security controls and monitoring.

**Acceptance Criteria**
- WHEN I generate portal tokens THEN the system SHALL create unique, cryptographically secure tokens with configurable expiration times and access restrictions
- WHEN I monitor sessions THEN the system SHALL track all portal access including login times, IP addresses, browser information, and activity logs
- WHEN I manage security THEN the system SHALL provide session timeout controls, concurrent session limits, and suspicious activity detection
- WHEN I handle expired sessions THEN the system SHALL provide graceful expiration handling with extension options and data preservation
- WHEN I audit access THEN the system SHALL maintain comprehensive logs of all portal activities with user attribution and timestamp tracking
- WHEN I revoke access THEN the system SHALL provide immediate token invalidation with notification to affected vendors and audit trail recording

### Requirement 29: Submission Progress and Auto-Save Features
**User Story**: As a Vendor, I want automatic progress saving and clear progress indicators throughout my submission.

**Acceptance Criteria**
- WHEN I enter data THEN the system SHALL auto-save my progress every 30 seconds and display the last saved timestamp
- WHEN I navigate between sections THEN the system SHALL preserve all entered data and show completion status for each section
- WHEN I return to the portal THEN the system SHALL restore my previous session state and allow me to continue from where I left off
- WHEN I view progress THEN the system SHALL display visual progress indicators showing completed items, remaining items, and overall completion percentage
- WHEN I encounter errors THEN the system SHALL preserve valid data while highlighting errors and providing recovery options
- WHEN I submit partially THEN the system SHALL allow draft submissions with the ability to complete and finalize later

### Requirement 30: Comprehensive Validation and Error Handling
**User Story**: As a Vendor, I want comprehensive validation with clear error messages and correction guidance.

**Acceptance Criteria**
- WHEN I submit pricing data THEN the system SHALL provide real-time field-level validation with specific inline error messages
- WHEN I have incomplete data THEN the system SHALL highlight missing fields with completion guidance
- WHEN I have data conflicts THEN the system SHALL detect conflicts (duplicate MOQs, price inversions) and provide resolution options
- WHEN I violate business rules THEN the system SHALL explain violations with compliant alternatives
- WHEN I use incorrect formats THEN the system SHALL provide input format guidance with examples and criteria
- WHEN I make corrections THEN the system SHALL provide immediate feedback confirming the fixes

### Requirement 31: Enhanced Price List Management Interface
**User Story**: As a Purchasing Staff member, I want an enhanced price list management interface with comprehensive filtering, search capabilities, and support for complex pricing structures.

**Acceptance Criteria**
- WHEN I access the price list interface THEN the system SHALL display it as "Price Lists" instead of "Active Price Lists"
- WHEN I filter by status THEN the system SHALL support filtering by active, expired, pending, draft, and suspended statuses
- WHEN I filter by tags THEN the system SHALL provide tag-based filtering with multi-select capabilities
- WHEN I filter by date range THEN the system SHALL support filtering by valid from date, valid to date, and last updated date
- WHEN I combine filters THEN the system SHALL apply multiple filters simultaneously with clear filter indicators
- WHEN I save filter preferences THEN the system SHALL remember my filter settings for future sessions
- WHEN I view vendor pricelists THEN the system SHALL support multiple price entries per item with different MOQ values
- WHEN displaying prices THEN the system SHALL organize multiple MOQ entries by item and show pricing tiers clearly

### Requirement 32: Streamlined Vendor Price Entry Interface
**User Story**: As a Vendor, I want a simple, efficient interface to enter prices for multiple items with minimal clicks and navigation.

**Acceptance Criteria**
- WHEN I access the price entry interface THEN the system SHALL display all items in a single scrollable list
- WHEN each item is displayed THEN the system SHALL show inline fields for MOQ 1 pricing by default (price and lead time)
- WHEN I need to add bulk pricing THEN the system SHALL provide an [+] button that expands inline to add MOQ tiers
- WHEN I enter prices THEN the system SHALL auto-save every 30 seconds with visual confirmation
- WHEN I use keyboard navigation THEN the system SHALL support Tab to move between fields and Enter to move to next item
- WHEN viewing on mobile/tablet THEN the system SHALL provide a responsive interface optimized for touch
- WHEN I have many items THEN the system SHALL provide search/filter capability to quickly find specific items

### Requirement 33: Multi-MOQ Price Structure
**User Story**: As a Vendor, I want to provide different prices for different order quantities with flexible unit options.

**Acceptance Criteria**
- WHEN I add pricing for an item THEN the system SHALL allow multiple price entries with different MOQ values
- WHEN I set MOQ pricing THEN the system SHALL include unit selection (Each, Box, Carton, Pack, etc.) with conversion factors
- WHEN I add a new MOQ tier THEN the system SHALL validate against existing MOQs to prevent duplicates
- WHEN displaying MOQ tiers THEN the system SHALL automatically sort by MOQ value
- WHEN I specify units THEN the system SHALL support conversion factors (e.g., Box = 50 Each)
- WHEN I enter MOQ pricing THEN the system SHALL validate price logic (higher quantities should typically have lower unit prices)

### Requirement 34: Draft Mode and Progress Tracking
**User Story**: As a Vendor, I want to save my price updates as draft and track my completion progress across sessions.

**Acceptance Criteria**
- WHEN I enter prices THEN the system SHALL maintain draft status until explicitly submitted
- WHEN I leave and return THEN the system SHALL restore my previous draft state with all entered data
- WHEN viewing my progress THEN the system SHALL show:
  - Number of items with prices vs total items
  - Percentage completion
  - Visual progress bar
  - Items grouped by completion status
- WHEN I have incomplete pricing THEN the system SHALL allow partial submission of completed items
- WHEN auto-save occurs THEN the system SHALL display last saved timestamp and visual confirmation
- WHEN returning to a draft THEN the system SHALL offer to resume from previous state or start fresh
- WHEN viewing draft submissions THEN the system SHALL show draft age and send reminders for old drafts

### Requirement 35: Purchasing Staff Email Upload Management
**User Story**: As a Purchasing Staff member, I want to efficiently process vendor price submissions received via email.

**Acceptance Criteria**
- WHEN vendors email price submissions THEN the system SHALL provide a dedicated interface for processing emailed files
- WHEN I view pending emails THEN the system SHALL display sender, pricelist ID reference, attachment status, and received timestamp
- WHEN I validate emailed submissions THEN the system SHALL run the same validation as portal uploads
- WHEN validation errors occur THEN the system SHALL provide detailed error reports with options to contact vendor
- WHEN processing is successful THEN the system SHALL upload to the main system and update vendor submission status
- WHEN I process multiple emails THEN the system SHALL support bulk validation and processing

## Technical Requirements

### Interface Design
- Single-page price entry interface with no navigation required
- Inline expansion for MOQ tiers without popups or modals
- Real-time validation with inline error messages
- Progress indicators showing completion status
- Responsive design supporting desktop, tablet, and mobile devices
- Support for 20+ items displayed efficiently on one screen

### Data Structure
- Support multiple price entries per item (different MOQs)
- Each price entry includes: item code, MOQ, unit type, unit price, currency, lead time
- Automatic organization of MOQ tiers by item
- Vendor-specific pricelists linked to collection campaigns
- Unique tokens and URLs for each vendor invitation

### Performance Requirements
- Handle 20+ items efficiently in single view
- Auto-save functionality every 30 seconds without disrupting user input
- Fast keyboard navigation support with minimal latency
- Minimal server round-trips for better responsiveness
- Support for concurrent vendor sessions

### Security Requirements
- Cryptographically secure token generation for vendor access
- Time-limited access links with configurable expiration
- Session management with activity tracking
- Audit trail for all pricing submissions and changes
- Role-based access control for purchasing staff functions

### Integration Requirements
- API support for all major operations
- Email integration for invitation sending and submission receipt
- Excel import/export functionality
- Notification system for reminders and confirmations