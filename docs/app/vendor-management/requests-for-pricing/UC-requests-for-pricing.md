# Requests for Pricing (RFQ) - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Requests for Pricing (RFQ)
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

### 1.1 Purpose
This document details the use cases for the Requests for Pricing (RFQ) module, describing how different actors interact with the system to create, manage, distribute, evaluate, and award competitive bidding campaigns. Each use case includes preconditions, main flows, alternate flows, exception handling, and postconditions.

### 1.2 Scope
This document covers all user interactions with the RFQ module as defined in BR-requests-for-pricing.md, including RFQ creation, vendor invitation, bid submission, bid evaluation and comparison, negotiation, award management, contract generation, and multi-round bidding workflows.

### 1.3 Document Conventions
- **Actor**: User or system component interacting with the module
- **Precondition**: State that must exist before use case executes
- **Postcondition**: State after successful use case completion
- **Main Flow**: Primary path through the use case
- **Alternate Flow**: Variations from the main flow
- **Exception Flow**: Error conditions and recovery

---

## 2. Actors

### 2.1 Primary Actors

**Procurement Manager**
- **Role**: Primary administrator of RFQ campaigns
- **Responsibilities**: Create RFQs, select vendors, configure evaluation criteria, approve awards, manage negotiations
- **Permissions**: Full access to RFQ management, approval authority for awards
- **Skills**: Advanced procurement knowledge, vendor management, contract negotiation

**Procurement Staff**
- **Role**: RFQ creators and campaign coordinators
- **Responsibilities**: Create draft RFQs, invite vendors, track submissions, coordinate evaluations, generate reports
- **Permissions**: Create/edit RFQs (subject to approval), monitor campaigns, communicate with vendors
- **Skills**: Procurement operations, vendor coordination, bid analysis

**Finance Manager**
- **Role**: Financial oversight and approval authority
- **Responsibilities**: Review high-value RFQs, approve awards exceeding thresholds, analyze cost implications
- **Permissions**: View all RFQs, approve awards >$50K, access financial analytics
- **Skills**: Financial analysis, budget management, cost optimization

**Evaluator**
- **Role**: Technical and commercial bid evaluator
- **Responsibilities**: Score bids against evaluation criteria, provide technical assessments, recommend awards
- **Permissions**: View assigned RFQs, score bids, submit evaluations
- **Skills**: Technical expertise, quality assessment, objective analysis

**Executive**
- **Role**: High-value approval authority
- **Responsibilities**: Approve awards >$500K, strategic procurement decisions
- **Permissions**: View strategic RFQs, final approval authority
- **Skills**: Strategic thinking, risk assessment, business judgment

**Department Manager**
- **Role**: Department-specific RFQ requestor
- **Responsibilities**: Request RFQs for department needs, provide specifications, participate in evaluations
- **Permissions**: Request RFQs, view department RFQs, provide input
- **Skills**: Department operations knowledge, requirement definition

### 2.2 Secondary Actors

**Vendor User** (via Vendor Portal)
- View RFQ invitations, acknowledge receipt, submit bids, track bid status, participate in negotiations

**System Administrator**
- Configure RFQ workflows, manage permissions, system maintenance, data integrity

**External Systems**
- Vendor Directory, Product Management, Contract Management, Email Service, Procurement Module

---

## 3. Use Cases Overview

### 3.1 Use Case List

| ID | Use Case Name | Primary Actor | Priority |
|----|---------------|---------------|----------|
| UC-RFQ-001 | Create RFQ Campaign | Procurement Manager, Procurement Staff | Critical |
| UC-RFQ-002 | Invite Vendors to RFQ | Procurement Manager, Procurement Staff | Critical |
| UC-RFQ-003 | Submit Bid (Vendor) | Vendor User | Critical |
| UC-RFQ-004 | Evaluate and Compare Bids | Evaluator, Procurement Manager | Critical |
| UC-RFQ-005 | Award RFQ to Vendor | Procurement Manager, Finance Manager, Executive | Critical |
| UC-RFQ-006 | Negotiate Bid Terms | Procurement Manager, Vendor User | High |
| UC-RFQ-007 | Close RFQ Campaign | Procurement Manager | High |
| UC-RFQ-008 | Generate Contract from RFQ | Procurement Manager | High |
| UC-RFQ-009 | Start Multi-Round Bidding | Procurement Manager | Medium |
| UC-RFQ-010 | Extend Bid Deadline | Procurement Manager | Medium |
| UC-RFQ-011 | Withdraw RFQ | Procurement Manager | Medium |
| UC-RFQ-012 | Clarify RFQ Requirements | All Actors | High |
| UC-RFQ-013 | View RFQ Analytics | Procurement Manager, Finance Manager | High |
| UC-RFQ-014 | Export RFQ Report | All Users | Medium |
| UC-RFQ-015 | Clone Existing RFQ | Procurement Manager, Procurement Staff | Medium |

---

## 4. Detailed Use Cases

### UC-RFQ-001: Create RFQ Campaign

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Critical
**Frequency**: Weekly (3-10 RFQs/week)
**Related FR**: FR-RFQ-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to create RFQs
- System is operational
- Product catalog is accessible
- Vendor directory is available

#### Main Flow
1. User navigates to Requests for Pricing (RFQ) module
2. User clicks "Create New RFQ" button
3. System displays RFQ creation wizard with steps:
   - Basic Information
   - Requirements & Specifications
   - Vendor Selection
   - Bidding Timeline
   - Evaluation Criteria
   - Terms & Conditions
   - Review & Publish
4. **Step 1: Basic Information**
5. System displays basic information form
6. User enters:
   - RFQ Title (required)
   - RFQ Number (auto-generated or manual)
   - RFQ Type (dropdown: Goods, Services, Works)
   - Category (dropdown)
   - Description (rich text editor)
   - Budget Range (optional)
   - Department/Location (dropdown)
   - Priority Level (High, Medium, Low)
7. System validates RFQ number uniqueness
8. User clicks "Next"
9. System saves draft and proceeds to Requirements

10. **Step 2: Requirements & Specifications**
11. System displays requirements builder interface
12. User clicks "Add Item" to add line items
13. For each line item, user enters:
    - Item description (required)
    - Product/Service code (optional)
    - Quantity (required)
    - Unit of Measure (dropdown)
    - Specifications (key-value pairs or free text)
    - Delivery location (required)
    - Required delivery date (date picker)
    - Quality standards (optional)
    - Samples required (Yes/No toggle)
14. User can add multiple line items (minimum 1)
15. User defines general requirements:
    - Warranty requirements
    - Quality standards/certifications
    - Compliance requirements
    - Special instructions
16. User attaches supporting documents (specs, drawings, samples)
17. User clicks "Next"
18. System validates all required fields
19. System saves requirements and proceeds to Vendor Selection

20. **Step 3: Vendor Selection**
21. System displays vendor selection interface
22. System shows qualified vendors based on:
    - RFQ category match
    - Vendor status (active, approved)
    - Vendor capabilities
    - Previous performance
23. User selects vendors using:
    - Individual vendor checkbox selection
    - "Select All Qualified"
    - Category-based selection
    - Saved vendor lists
24. System displays selected vendor count and details
25. User can set vendor-specific notes
26. System enforces minimum vendor count (BR-RFQ-001: minimum 3)
27. User clicks "Next"
28. System validates vendor selection and proceeds to Timeline

29. **Step 4: Bidding Timeline**
30. System displays timeline configuration
31. System calculates minimum bid period (BR-RFQ-002: 7 business days)
32. User configures:
    - Publish Date (default: today)
    - Bid Opening Date (default: publish date)
    - Bid Closing Date (required, minimum 7 business days)
    - Award Target Date (optional)
    - Pre-bid Conference Date/Time (optional)
    - Site Visit Date/Time (optional)
33. System displays timeline visualization
34. System validates timeline (closing > opening >= publish)
35. User configures automatic reminders:
    - Reminder 1: 7 days before closing
    - Reminder 2: 3 days before closing
    - Final reminder: 1 day before closing
36. User clicks "Next"
37. System saves timeline and proceeds to Evaluation

38. **Step 5: Evaluation Criteria**
39. System displays evaluation criteria builder
40. User adds evaluation criteria:
    - Criterion name (required)
    - Criterion type (Price, Quality, Delivery, Service, Technical, Custom)
    - Weight percentage (required)
    - Scoring method (Points 1-10, Pass/Fail, Percentage)
    - Description/Guidelines
41. User adds multiple criteria (minimum 1)
42. System validates total weight = 100% (BR-RFQ-004)
43. User selects scoring method:
    - Lowest Price (price-based only)
    - Weighted Average (multiple criteria)
    - Technical-Commercial Split (technical + commercial evaluation)
44. User assigns evaluators:
    - Select evaluators from user list
    - Assign criteria to specific evaluators
    - Set evaluation deadlines
45. User clicks "Next"
46. System saves evaluation setup and proceeds to Terms

47. **Step 6: Terms & Conditions**
48. System displays terms and conditions form
49. User configures:
    - Payment Terms (dropdown or custom)
    - Delivery Terms (Incoterms or custom)
    - Bid Validity Period (days, default: 60)
    - Performance Bond Requirements (Yes/No, percentage)
    - Liquidated Damages Clause (Yes/No, terms)
    - Insurance Requirements
    - Special Conditions (free text)
50. User can load terms from template
51. User reviews and modifies terms
52. User clicks "Next"
53. System saves terms and proceeds to Review

54. **Step 7: Review & Publish**
55. System displays comprehensive RFQ review:
    - All sections in read-only format
    - Completeness checklist
    - Validation status
    - Warning messages (if any)
56. User reviews all sections
57. User can click "Edit" on any section to make changes
58. User has options:
    - "Save as Draft": Saves without publishing
    - "Submit for Approval": Routes for approval (if required)
    - "Publish Now": Immediately publishes RFQ
59. User clicks chosen action button
60. System validates all requirements met
61. If "Publish Now" selected and user has authority:
    - System changes status to "Published"
    - System sends invitations to all selected vendors
    - System creates calendar entries for timeline events
    - System starts monitoring timeline
62. System displays success message with RFQ number
63. System logs RFQ creation in audit trail

#### Postconditions
- **Success**: RFQ created with status "Draft", "Pending Approval", or "Published"
- **Success**: RFQ number assigned and displayed
- **Success**: All sections saved with entered data
- **Success**: If published, vendors invited and notified
- **Success**: Timeline monitoring activated
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Create from Template**
- At step 3, user clicks "Use Template":
  - System displays RFQ template library
  - User searches and selects template
  - System pre-fills all sections from template
  - System generates new RFQ number
  - User reviews and modifies as needed
  - Continue to step 8

**AF-002: Create from Previous RFQ**
- At step 3, user clicks "Clone Existing RFQ":
  - System displays RFQ search dialog
  - User searches and selects source RFQ
  - System copies all settings except:
    - RFQ number (generates new)
    - Timeline dates (sets to future dates)
    - Vendor invitations (resets)
  - System pre-fills form with copied data
  - User modifies as needed
  - Continue to step 8

**AF-003: Import Requirements from Excel**
- At step 12, user clicks "Import from Excel":
  - System displays file upload dialog
  - User selects Excel file with line items
  - System validates file format (columns: Item, Qty, UOM, Specs, Delivery)
  - System parses and imports line items
  - System displays import summary (success/errors)
  - User reviews imported items
  - Continue to step 17

**AF-004: Quick Create (Simplified)**
- At step 3, user clicks "Quick Create":
  - System displays simplified single-page form
  - User enters essential fields only:
    - Title, Type, Items, Vendors, Closing Date
  - System uses default values for other fields
  - User clicks "Create and Publish"
  - System creates with defaults
  - Continue to step 62

**AF-005: Save Draft at Any Step**
- At any step before step 59:
  - User clicks "Save Draft"
  - System saves current progress
  - System displays "Draft saved successfully"
  - User can exit and resume later
  - System maintains wizard position

**AF-006: Request Approval Before Publishing**
- At step 59, if user lacks publish authority:
  - System automatically selects "Submit for Approval"
  - User clicks "Submit for Approval"
  - System routes to Procurement Manager
  - System sends approval notification
  - System displays "RFQ submitted for approval"
  - Approver reviews and approves/rejects
  - End use case

**AF-007: Multi-location RFQ**
- At step 6, if multiple delivery locations:
  - User clicks "Multiple Locations"
  - System displays location matrix
  - User specifies quantities per location
  - User sets location-specific delivery dates
  - System creates separate line items per location
  - Continue to step 14

#### Exception Flows

**EF-001: Duplicate RFQ Number**
- At step 7, if RFQ number already exists:
  - System highlights RFQ number field in red
  - System displays error: "RFQ number already exists. Please use a unique number."
  - System suggests alternative numbers:
    - Original number + "-A"
    - Original number + "-[current year]"
  - User corrects RFQ number
  - Continue to step 7

**EF-002: Insufficient Vendors Selected**
- At step 26, if fewer than 3 vendors selected (BR-RFQ-001):
  - System displays error: "Minimum 3 vendors required for competitive RFQ"
  - System highlights vendor selection section
  - System suggests additional qualified vendors
  - User options:
    - Add more vendors
    - Change to "Direct RFQ" (single vendor, requires approval)
    - Cancel RFQ creation
  - Continue to step 23 if adding vendors

**EF-003: Invalid Timeline**
- At step 34, if bid period < 7 business days (BR-RFQ-002):
  - System displays error: "Bid period must be at least 7 business days"
  - System highlights closing date field
  - System calculates and suggests minimum closing date
  - User adjusts closing date
  - Continue to step 34

**EF-004: Evaluation Criteria Weights Don't Sum to 100%**
- At step 42, if total weight ≠ 100% (BR-RFQ-004):
  - System displays error: "Total evaluation weight must equal 100%"
  - System shows current total (e.g., "Current total: 85%")
  - System highlights weight fields in red
  - System suggests automatic proportional adjustment
  - User corrects weights manually or accepts adjustment
  - Continue to step 42

**EF-005: No Line Items Added**
- At step 18, if no line items added:
  - System displays error: "RFQ must have at least one line item"
  - System navigates back to Requirements section
  - User must add line items
  - Continue to step 12

**EF-006: Missing Required Specifications**
- At step 18, if required specifications missing:
  - System displays validation summary:
    - List of line items missing specs
    - Required specification fields
  - System highlights incomplete items
  - User completes missing specifications
  - Continue to step 18

**EF-007: Past Dates in Timeline**
- At step 34, if any timeline date is in the past:
  - System displays error: "All timeline dates must be in the future"
  - System highlights invalid date fields
  - System suggests dates based on today + minimum periods
  - User corrects dates
  - Continue to step 34

**EF-008: No Evaluators Assigned**
- At step 44, if no evaluators assigned:
  - System displays warning: "No evaluators assigned. Assign evaluators to enable bid scoring."
  - User options:
    - "Assign Now": Opens evaluator selection
    - "Assign Later": Proceeds with warning flag
    - "Self-Evaluate": Assigns creator as evaluator
  - System proceeds based on selection

**EF-009: System Error During Publish**
- At step 61, if system error occurs:
  - System displays error: "Unable to publish RFQ. Please try again."
  - System logs error details
  - System maintains RFQ as draft
  - System preserves all entered data
  - User options:
    - Retry publish
    - Save as draft and contact administrator
    - If persistent, system creates support ticket

#### Business Rules Applied
- BR-RFQ-001: Minimum 3 vendors must be invited for competitive RFQ
- BR-RFQ-002: Bid submission period must be at least 7 business days
- BR-RFQ-004: Evaluation criteria weights must sum to 100%
- BR-RFQ-008: RFQ requires approval if total value exceeds threshold

#### UI Requirements
- Multi-step wizard with clear progress indicator (7 steps)
- Auto-save draft every 3 minutes
- Step validation with real-time feedback
- Timeline visualization with Gantt chart
- Vendor selection with search and filters
- Criteria weight slider with live percentage display
- Mobile-responsive layout
- Keyboard shortcuts (Ctrl+S to save, Ctrl+Enter to proceed)
- Unsaved changes warning on exit
- Preview mode to see vendor's view
- Section jump navigation

---

### UC-RFQ-002: Invite Vendors to RFQ

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Critical
**Frequency**: Per RFQ (3-15 vendors/RFQ)
**Related FR**: FR-RFQ-003

#### Preconditions
- User is authenticated with appropriate role
- User has permission to manage RFQs
- RFQ exists with status "Published" or "Open"
- Vendor directory is accessible
- Email service is operational

#### Main Flow
1. User navigates to RFQ detail page
2. System displays RFQ information and current status
3. User clicks "Manage Vendors" tab
4. System displays vendor management interface:
   - Currently invited vendors table
   - Vendor invitation status
   - Response statistics
   - Actions (Add Vendors, Send Reminder, Remove)
5. User clicks "Add Vendors" button
6. System displays vendor selection dialog:
   - Search bar with filters
   - Qualified vendor list
   - Vendor details preview
   - Selection checkboxes
7. User searches/filters vendors by:
   - Vendor name
   - Category match
   - Performance rating
   - Location
   - Certification status
8. System displays qualified vendors with indicators:
   - Qualification status (green check)
   - Category match score
   - Past performance rating
   - Current workload
   - Response rate to previous RFQs
9. User selects vendors to invite:
   - Individual checkbox selection
   - "Select All Qualified"
   - Import from saved vendor list
10. System displays selected vendor summary:
    - Vendor count
    - Vendor names
    - Contact information
    - Warning if vendor has conflicts
11. User reviews selected vendors
12. User clicks "Send Invitations"
13. System displays invitation customization dialog:
    - Standard invitation template (pre-filled)
    - Custom message field (optional)
    - Attachment selection (RFQ documents)
    - Delivery method (Email, Portal Notification, Both)
    - Priority flag (Normal, High)
14. User customizes invitation message (optional)
15. User selects documents to attach
16. User clicks "Send Invitations Now"
17. System validates:
    - All selected vendors are active
    - No duplicate invitations
    - Email addresses are valid
    - RFQ is in published/open status
18. System creates invitation records for each vendor
19. System sends email invitations:
    - To vendor primary contact
    - CC to vendor secondary contacts (if specified)
    - Includes RFQ details
    - Includes link to vendor portal
    - Includes attached documents
20. System sends portal notifications
21. System updates vendor invitation status to "Invited"
22. System logs invitation timestamp
23. System displays success message: "Invitations sent to X vendors"
24. System updates RFQ analytics:
    - Total invited vendors count
    - Invitation sent timestamp
25. System schedules automatic reminders
26. System logs invitation activity in audit trail

#### Postconditions
- **Success**: Vendors invited and invitation records created
- **Success**: Email and portal notifications sent
- **Success**: Vendor invitation status updated to "Invited"
- **Success**: RFQ analytics updated
- **Success**: Automatic reminders scheduled
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Invite Additional Vendors After Initial Publication**
- At step 3, RFQ already has invited vendors:
  - System displays existing vendor list
  - User clicks "Add More Vendors"
  - System shows only vendors not yet invited
  - User selects additional vendors
  - System warns if bid period is short
  - User confirms addition
  - System extends deadline if needed (with approval)
  - Continue to step 12

**AF-002: Import Vendor List from File**
- At step 5, user clicks "Import Vendor List":
  - System displays file upload dialog
  - User uploads Excel/CSV with vendor IDs or names
  - System validates and matches vendors
  - System displays matching results:
    - Matched vendors (green)
    - Unmatched vendors (red)
    - Already invited vendors (yellow)
  - User reviews and confirms
  - System invites matched vendors
  - Continue to step 17

**AF-003: Use Saved Vendor Group**
- At step 9, user clicks "Use Saved Group":
  - System displays saved vendor group list
  - User selects group (e.g., "Preferred Food Suppliers")
  - System loads all vendors in group
  - System validates each vendor's eligibility
  - System pre-selects eligible vendors
  - User reviews and modifies selection
  - Continue to step 11

**AF-004: Schedule Invitation for Later**
- At step 16, user clicks "Schedule Send":
  - System displays date/time picker
  - User selects future send date/time
  - System validates send time is before bid closing
  - User clicks "Schedule"
  - System creates scheduled job
  - System displays: "Invitations scheduled for [date/time]"
  - User can view/cancel scheduled invitations
  - End use case

**AF-005: Send Invitation to Single Vendor (Spot Invitation)**
- At step 4, user clicks "Invite" next to specific vendor:
  - System displays single vendor invitation form
  - User customizes message for that vendor
  - User clicks "Send Invitation"
  - System sends invitation to that vendor only
  - System updates vendor status
  - Continue to step 23

**AF-006: Resend Invitation to Non-Responsive Vendor**
- At step 4, user clicks "Resend" for vendor with no response:
  - System displays resend confirmation
  - System pre-fills previous invitation message
  - User can modify message
  - User clicks "Resend Invitation"
  - System sends new invitation
  - System logs resend in vendor record
  - Continue to step 23

#### Exception Flows

**EF-001: Vendor Email Bounce/Invalid**
- At step 19, if vendor email bounces:
  - System logs bounce notification
  - System marks vendor invitation as "Delivery Failed"
  - System notifies user via alert
  - System displays failed vendor list
  - User options:
    - Update vendor email and resend
    - Remove vendor from RFQ
    - Contact vendor via phone
  - System proceeds with other successful invitations

**EF-002: Vendor Below Qualification Threshold**
- At step 8, if vendor doesn't meet qualification criteria:
  - System displays vendor with warning badge
  - System shows disqualification reasons:
    - Performance rating too low
    - Missing required certifications
    - Blacklisted status
    - Not approved for category
  - User options:
    - "Invite Anyway" (requires approval for blacklisted)
    - "Skip Vendor"
    - "Update Vendor Qualification"
  - System proceeds based on selection

**EF-003: Duplicate Vendor Selection**
- At step 17, if vendor already invited:
  - System displays warning: "[Vendor Name] already invited to this RFQ"
  - System shows previous invitation date and status
  - User options:
    - "Skip Duplicate": Removes from current selection
    - "Resend Invitation": Sends new invitation
    - "View Vendor Status": Opens vendor detail
  - System removes duplicate and continues

**EF-004: Vendor Has Conflict of Interest**
- At step 17, if vendor has conflict:
  - System detects conflict (e.g., vendor owns competitor, related party)
  - System displays warning: "Conflict of Interest Detected"
  - System shows conflict details
  - User options:
    - "Exclude Vendor": Removes from invitation
    - "Override" (requires approval): Invites with conflict flag
    - "Review Conflict": Opens conflict review
  - System proceeds based on selection

**EF-005: Insufficient Active Vendors (< 3)**
- At step 17, if invited vendor count < 3 (BR-RFQ-001):
  - System displays error: "Minimum 3 vendors required"
  - System suggests additional qualified vendors
  - User options:
    - Add more vendors
    - Convert to Direct RFQ (requires approval)
    - Cancel invitation
  - Continue to step 6 if adding vendors

**EF-006: RFQ Closed or Cancelled**
- At step 17, if RFQ status is closed/cancelled:
  - System displays error: "Cannot invite vendors to closed/cancelled RFQ"
  - System blocks invitation action
  - User must reopen RFQ first
  - End use case

**EF-007: Email Service Unavailable**
- At step 19, if email service fails:
  - System displays error: "Email service temporarily unavailable"
  - System saves invitation records anyway
  - System queues emails for retry
  - System sends portal notifications (fallback)
  - System notifies user of issue
  - System displays: "Invitations saved. Emails queued for retry."
  - System retries email sending automatically

**EF-008: Bid Period Too Short for New Vendors**
- At AF-001, if adding vendors with < 7 days remaining:
  - System displays warning: "Less than 7 business days remaining"
  - System calculates fair bid period
  - System suggests deadline extension
  - User options:
    - "Extend Deadline": Extends for all vendors
    - "Invite Anyway": Invites with short period (risky)
    - "Cancel": Doesn't invite additional vendors
  - System proceeds based on selection

#### Business Rules Applied
- BR-RFQ-001: Minimum 3 vendors must be invited for competitive RFQ
- BR-RFQ-002: Vendors must have at least 7 business days to bid
- BR-RFQ-009: Vendors must acknowledge RFQ receipt within 2 business days
- BR-RFQ-010: Only active and approved vendors can be invited

#### UI Requirements
- Vendor search with auto-complete
- Filter panel with multiple criteria
- Vendor qualification indicator badges
- Bulk selection with "Select All" option
- Invitation preview before sending
- Real-time invitation status tracking
- Visual timeline showing bid period remaining
- Vendor response rate visualization
- Mobile-friendly vendor list
- Export vendor list to Excel
- Conflict of interest warnings
- Email preview functionality

---

### UC-RFQ-003: Submit Bid (Vendor)

**Primary Actor**: Vendor User
**Priority**: Critical
**Frequency**: Per RFQ invitation
**Related FR**: FR-RFQ-005

#### Preconditions
- Vendor user is authenticated in vendor portal
- Vendor has received RFQ invitation
- RFQ status is "Open"
- Current date/time is before bid closing date
- Vendor has acknowledged RFQ receipt

#### Main Flow
1. Vendor user logs into vendor portal
2. System displays vendor dashboard with notifications
3. System highlights new RFQ invitations with badge count
4. User clicks "RFQ Invitations" menu
5. System displays list of RFQ invitations:
   - RFQ number and title
   - Closing date with countdown timer
   - Status (New, Viewed, Bid Submitted, Expired)
   - Priority badge
   - Quick actions (View, Submit Bid)
6. User clicks "View RFQ" on specific invitation
7. System displays RFQ detail page:
   - RFQ information (title, number, description)
   - Line items table
   - Specifications and requirements
   - Terms and conditions
   - Timeline information
   - Attached documents
   - Submit Bid button
8. User reviews RFQ requirements thoroughly
9. User downloads attached documents (specs, drawings)
10. User clicks "Submit Bid" button
11. System checks bid submission status:
    - If first time: Creates new bid draft
    - If editing: Opens existing bid draft
12. System displays bid submission form with tabs:
    - Line Items & Pricing
    - Commercial Terms
    - Technical Compliance
    - Documents & Attachments
    - Declaration & Submit
13. **Tab 1: Line Items & Pricing**
14. System displays line items table from RFQ:
    - Item description
    - Quantity
    - UOM
    - Unit price field (required)
    - Total price (auto-calculated)
    - Delivery date field
    - Notes field (optional)
15. For each line item, vendor user enters:
    - Unit price (required)
    - Currency (dropdown, default from RFQ)
    - Delivery date (must meet RFQ requirement)
    - Brand/Manufacturer (if applicable)
    - Model/Part number (if applicable)
    - Item notes (optional)
16. System auto-calculates:
    - Line item total (quantity × unit price)
    - Subtotal (sum of all line items)
    - Tax amount (if applicable)
    - Shipping/delivery charges (if applicable)
    - Grand total
17. User can mark line items as:
    - "Full Compliance": Meets exact specification
    - "Partial Compliance": With explanation
    - "Alternative Offered": With details
    - "Cannot Supply": With reason
18. User clicks "Next" or "Save Draft"

19. **Tab 2: Commercial Terms**
20. System displays commercial terms form
21. User enters/confirms:
    - Payment Terms (dropdown or match RFQ)
    - Delivery Terms (Incoterms)
    - Bid Validity Period (days, minimum from RFQ)
    - Warranty Period (months/years)
    - After-sales Service
    - Penalties/Liquidated Damages acceptance
    - Performance Bond (if required)
    - Insurance coverage
22. User can propose alternative terms with justification
23. User clicks "Next" or "Save Draft"

24. **Tab 3: Technical Compliance**
25. System displays technical requirements from RFQ
26. For each requirement, user indicates:
    - Compliance status (Compliant, Partial, Non-compliant)
    - Supporting evidence/documentation
    - Explanation for partial/non-compliance
    - Alternative solution (if applicable)
27. User uploads technical documents:
    - Product specifications
    - Certifications
    - Test reports
    - Quality documentation
    - Manufacturing process docs
28. User provides technical narrative (optional)
29. User clicks "Next" or "Save Draft"

30. **Tab 4: Documents & Attachments**
31. System displays required document checklist:
    - Company registration
    - Tax clearance certificate
    - Financial statements (if required)
    - References
    - Product samples (if required)
32. User uploads required documents
33. System validates file types and sizes
34. User adds optional supporting documents
35. User clicks "Next" or "Save Draft"

36. **Tab 5: Declaration & Submit**
37. System displays bid summary:
    - Total bid value
    - All line items with prices
    - Commercial terms summary
    - Technical compliance summary
    - Uploaded documents list
38. System displays mandatory declarations:
    - Information accuracy declaration
    - Conflict of interest declaration
    - Anti-corruption declaration
    - Terms and conditions acceptance
39. User reviews bid summary
40. User checks all mandatory declaration checkboxes
41. User optionally adds final comments/notes
42. User clicks "Submit Bid"
43. System displays final confirmation dialog:
    - "Are you sure you want to submit this bid?"
    - "You cannot modify bid after submission"
    - "Bid will be opened only after closing date"
44. User confirms submission
45. System validates bid:
    - All required fields completed
    - All required documents uploaded
    - All declarations checked
    - Pricing for all line items
    - Bid submitted before deadline
46. System creates bid submission record
47. System changes bid status to "Submitted"
48. System generates bid reference number
49. System sends email confirmation to vendor:
    - Bid reference number
    - Submission timestamp
    - RFQ details
    - Next steps information
50. System sends portal notification to vendor
51. System notifies procurement team of new bid
52. System displays success page:
    - "Bid Submitted Successfully"
    - Bid reference number
    - Submission timestamp
    - Download bid receipt
53. System logs bid submission in audit trail

#### Postconditions
- **Success**: Bid submitted and recorded in system
- **Success**: Bid status changed to "Submitted"
- **Success**: Bid reference number generated
- **Success**: Email confirmation sent to vendor
- **Success**: Procurement team notified
- **Success**: Bid locked for modifications (until deadline if withdrawal allowed)
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Save Bid as Draft**
- At step 18, 23, 29, or 35:
  - User clicks "Save Draft"
  - System saves all entered data
  - System displays "Draft saved successfully"
  - System shows last saved timestamp
  - User can exit and resume later
  - Bid status remains "Draft"
  - Continue at user's next session

**AF-002: Upload Alternative/Substitute Products**
- At step 17, user offers alternatives:
  - User clicks "Offer Alternative"
  - System displays alternative item form
  - User enters alternative product details:
    - Alternative product name
    - Justification for alternative
    - Price comparison
    - Specification comparison
  - User uploads alternative product documents
  - System marks line item with "Alternative Offered"
  - Continue to step 18

**AF-003: Request Clarification During Bidding**
- At step 8, user needs clarification:
  - User clicks "Request Clarification"
  - System displays clarification request form
  - User enters question
  - User clicks "Submit Question"
  - System sends to procurement team
  - System tracks question and response
  - System notifies all invited vendors of Q&A (anonymous)
  - User continues reviewing while waiting
  - Continue to step 10 when ready

**AF-004: Partial Bid Submission**
- At step 15, vendor cannot supply all items:
  - User marks specific items as "Cannot Supply"
  - User provides reason for each
  - User prices only items they can supply
  - System calculates partial bid total
  - System flags as "Partial Bid"
  - User continues with submission
  - Continue to step 18

**AF-005: Withdraw Bid Before Deadline**
- After step 53, before bid closing:
  - User navigates to "My Bids"
  - User clicks "Withdraw Bid"
  - System displays withdrawal confirmation
  - System warns: "Withdrawal may affect future invitations"
  - User confirms withdrawal
  - System changes bid status to "Withdrawn"
  - System notifies procurement team
  - User can resubmit before deadline
  - End use case

**AF-006: Modify Bid Before Deadline**
- After step 53, if modification allowed (BR-RFQ-011):
  - User clicks "Modify Bid"
  - System displays modification warning
  - System creates new bid version
  - User makes changes to any section
  - User resubmits following steps 36-53
  - System archives previous version
  - System uses latest submitted version
  - Continue to step 53

#### Exception Flows

**EF-001: Bid Submission After Deadline**
- At step 45, if current time > closing time (BR-RFQ-006):
  - System displays error: "Bid deadline has passed"
  - System blocks submission button
  - System shows exact deadline that was missed
  - System suggests: "Contact procurement for extension"
  - User cannot submit bid
  - End use case

**EF-002: Missing Required Pricing**
- At step 45, if required line items lack pricing:
  - System displays error: "Please provide pricing for all required items"
  - System highlights line items missing prices
  - System scrolls to first missing price
  - User must enter prices
  - Continue to step 45

**EF-003: Missing Required Documents**
- At step 45, if required documents not uploaded:
  - System displays error: "Please upload all required documents"
  - System shows checklist with missing items highlighted
  - System navigates to Documents tab
  - User uploads missing documents
  - Continue to step 45

**EF-004: Declaration Checkboxes Not Checked**
- At step 45, if declarations not checked:
  - System displays error: "Please accept all mandatory declarations"
  - System highlights unchecked declarations
  - System scrolls to declarations section
  - User must check all declarations
  - Continue to step 45

**EF-005: File Upload Failure**
- At step 33, if file upload fails:
  - System displays error: "File upload failed. Please try again."
  - System shows upload error reason:
    - File too large (max size: 10MB)
    - Invalid file type
    - Network interruption
  - User options:
    - Retry upload
    - Compress file and retry
    - Upload different file
  - Continue to step 33

**EF-006: Invalid Currency or Pricing**
- At step 15, if invalid pricing entered:
  - System displays error next to field:
    - "Price must be greater than zero"
    - "Invalid currency format"
    - "Price exceeds reasonable limits"
  - System highlights invalid field in red
  - User corrects pricing
  - Continue to step 15

**EF-007: Vendor Not Acknowledged RFQ**
- At step 11, if vendor hasn't acknowledged RFQ (BR-RFQ-009):
  - System displays acknowledgment dialog:
    - "Please acknowledge receipt of this RFQ"
    - Checkbox: "I acknowledge receipt"
    - "Acknowledge" button
  - Vendor must acknowledge first
  - System records acknowledgment timestamp
  - System proceeds to bid form
  - Continue to step 12

**EF-008: System Timeout/Session Expired**
- At any step, if session expires:
  - System displays warning: "Your session has expired"
  - System auto-saves draft data (if possible)
  - System redirects to login
  - User logs in again
  - System restores draft data
  - User continues from last saved point

**EF-009: RFQ Cancelled During Bidding**
- At step 45, if RFQ cancelled:
  - System displays message: "This RFQ has been cancelled"
  - System shows cancellation reason (if provided)
  - System blocks submission
  - System saves draft for reference
  - Vendor notified via email
  - End use case

#### Business Rules Applied
- BR-RFQ-006: Bid modifications not allowed after deadline
- BR-RFQ-009: Vendors must acknowledge RFQ receipt within 2 business days
- BR-RFQ-011: Bid modifications allowed only if RFQ permits and before deadline
- BR-RFQ-012: Submitted bids are confidential until evaluation
- BR-RFQ-024: Bid validity period must be at least 60 days from bid closing

#### UI Requirements
- Multi-tab bid submission form with progress indicator
- Auto-save draft every 3 minutes
- Countdown timer showing time remaining
- Line item pricing calculator
- File drag-and-drop upload
- Document checklist with status indicators
- Bid summary preview before submission
- Mobile-responsive design for vendor access
- Offline draft capability (save locally)
- Bid receipt PDF generation
- Validation highlighting with helpful messages
- Currency converter widget
- Specification viewer for RFQ documents

---

### UC-RFQ-004: Evaluate and Compare Bids

**Primary Actor**: Evaluator, Procurement Manager
**Priority**: Critical
**Frequency**: Per RFQ after bid closing
**Related FR**: FR-RFQ-006

#### Preconditions
- User is authenticated with evaluator or procurement manager role
- User has permission to evaluate bids
- RFQ status is "Closed" (bid closing date passed)
- At least one bid has been submitted
- User is assigned as evaluator for this RFQ
- Evaluation criteria are defined

#### Main Flow
1. User navigates to RFQ module
2. System displays RFQ list filtered by "Closed" status
3. User clicks on RFQ requiring evaluation
4. System displays RFQ detail page with "Evaluation" tab
5. User clicks "Start Evaluation" button
6. System checks bid opening status:
   - If not yet opened: Prompts for bid opening ceremony
   - If already opened: Proceeds to evaluation
7. System displays bid evaluation dashboard:
   - List of all submitted bids
   - Bid statistics (count, average price, range)
   - Evaluation criteria panel
   - Comparison tools
   - Scoring section
8. System shows submitted bids table:
   - Vendor name
   - Bid reference number
   - Total bid value
   - Submission date/time
   - Completeness status
   - Initial qualification status
   - Actions (View Details, Score, Compare)
9. User selects "Preliminary Review" mode
10. For each bid, system checks compliance:
    - All required documents submitted
    - All line items priced
    - Declarations accepted
    - Bid validity period adequate
    - Technical requirements met
11. System flags non-compliant bids:
    - Missing documents (red flag)
    - Incomplete pricing (orange flag)
    - Late submission (yellow flag)
    - Technical non-compliance (purple flag)
12. User reviews flagged bids and decides:
    - Disqualify: Removes from further evaluation
    - Request clarification: Sends query to vendor
    - Accept with conditions: Notes conditions
13. User clicks "Begin Detailed Evaluation"
14. System displays evaluation workspace with three modes:
    - Individual Scoring
    - Side-by-Side Comparison
    - Matrix View
15. **Individual Scoring Mode**
16. User selects first bid to evaluate
17. System displays bid details with scoring form:
    - Line items and pricing
    - Commercial terms
    - Technical compliance
    - Documents
18. System displays evaluation criteria with assigned weights:
    - Price (e.g., 40%)
    - Quality (e.g., 25%)
    - Delivery (e.g., 20%)
    - Service (e.g., 15%)
19. For each criterion, user:
    - Reviews bid performance against criterion
    - Enters score (scale defined in RFQ, e.g., 1-10)
    - Adds justification notes (required for scores < 5 or > 8)
    - Uploads supporting evidence (optional)
20. System auto-calculates weighted scores:
    - Criterion score = Raw score × Weight
    - Total score = Sum of weighted scores
21. For price evaluation, system can auto-score using method:
    - Lowest Price: (Lowest Bid / This Bid) × Price Weight × 10
    - Price Range: Normalized based on min-max range
22. User adds overall evaluation comments
23. User clicks "Save Evaluation"
24. System saves evaluation scores and notes
25. User repeats steps 16-24 for all bids
26. **Side-by-Side Comparison Mode**
27. User clicks "Compare Bids"
28. System displays comparison matrix:
    - Columns: Each bid
    - Rows: Line items, terms, criteria scores
    - Highlighting: Best values highlighted in green
29. System provides comparison features:
    - Sort by any column
    - Filter by criteria
    - Calculate price differences (% and absolute)
    - Show compliance status
30. User analyzes bids side-by-side:
    - Compares line item pricing
    - Compares total bid values
    - Compares delivery terms
    - Compares technical specifications
31. User can add comparison notes
32. User identifies:
    - Lowest price bid
    - Best technical bid
    - Best overall value bid
33. System ranks bids automatically by:
    - Total score (if weighted average method)
    - Total price (if lowest price method)
    - Technical + Commercial split (if applicable)
34. **Matrix View Mode**
35. User clicks "Matrix View"
36. System displays evaluation matrix:
    - Rows: All bids
    - Columns: All criteria + total
    - Cells: Scores with color coding
    - Final column: Total weighted score
    - Final row: Averages
37. System highlights:
    - Highest scores (green)
    - Lowest scores (red)
    - Recommended bid (gold star)
38. User reviews matrix for patterns:
    - Consistently high performers
    - Outliers (very high or low)
    - Score distributions
39. User can export matrix to Excel
40. **Finalize Evaluation**
41. User clicks "Finalize Evaluation"
42. System displays evaluation summary:
    - Ranked bid list (1st, 2nd, 3rd)
    - Score breakdown by criterion
    - Price comparison chart
    - Recommendation section
43. System calculates and displays:
    - Potential savings (vs. budget or highest bid)
    - Average score across all bids
    - Standard deviation (scoring consistency)
44. User enters recommendation:
    - Recommended vendor (typically highest score)
    - Justification for recommendation
    - Alternative recommendations (2nd, 3rd choice)
    - Negotiation points (if any)
    - Special conditions or concerns
45. User reviews evaluation completeness checklist:
    - All bids evaluated
    - All scores justified
    - Recommendation provided
    - Supporting evidence attached
46. User clicks "Submit Evaluation"
47. System validates evaluation:
    - All assigned bids evaluated
    - All criteria scored for each bid
    - Recommendation provided
    - Required approvals identified
48. System routes evaluation for approval based on value (BR-RFQ-005):
    - <$50K: Procurement Manager
    - $50K-$500K: Finance Manager
    - >$500K: Executive approval
49. System notifies approver(s)
50. System updates RFQ status to "Under Review"
51. System displays success message: "Evaluation submitted for approval"
52. System logs evaluation completion in audit trail

#### Postconditions
- **Success**: All bids evaluated with scores
- **Success**: Bids ranked according to evaluation method
- **Success**: Recommendation submitted
- **Success**: Evaluation routed for approval
- **Success**: RFQ status updated to "Under Review"
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Multiple Evaluators (Split Evaluation)**
- At step 16, if multiple evaluators assigned:
  - Each evaluator sees only assigned criteria
  - Evaluator scores only assigned criteria (e.g., Technical Evaluator scores technical criteria only)
  - System tracks completion by evaluator
  - System aggregates scores from all evaluators
  - System displays completion status per evaluator
  - System waits for all evaluators to complete
  - Procurement Manager reviews aggregated scores
  - Continue to step 41

**AF-002: Request Vendor Clarification**
- At any evaluation step:
  - User clicks "Request Clarification"
  - System displays clarification request form
  - User enters specific questions
  - User sends to specific vendor
  - System notifies vendor
  - System pauses evaluation for that bid
  - Vendor responds via portal
  - System notifies evaluator
  - Evaluator reviews response
  - Evaluator resumes evaluation
  - Continue evaluation

**AF-003: Disqualify Bid During Evaluation**
- At step 12 or during evaluation:
  - User clicks "Disqualify Bid"
  - System displays disqualification form:
    - Reason (dropdown + free text)
    - Supporting evidence
    - Approval requirement (if needed)
  - User enters disqualification details
  - User clicks "Disqualify"
  - System updates bid status to "Disqualified"
  - System removes from evaluation
  - System logs disqualification
  - System notifies procurement manager
  - Continue with remaining bids

**AF-004: Shortlist Top Bids**
- After step 33, if many bids:
  - User clicks "Shortlist"
  - System suggests top 3-5 bids by score
  - User reviews and confirms shortlist
  - System marks bids as "Shortlisted"
  - System proceeds with detailed evaluation of shortlisted bids only
  - Non-shortlisted bids marked "Not Shortlisted"
  - Continue to step 41 with shortlisted bids

**AF-005: Technical vs Commercial Evaluation Split**
- At step 14, if technical-commercial split method:
  - System displays two evaluation phases
  - Phase 1: Technical Evaluation
    - Evaluators score technical criteria
    - System calculates technical scores
    - System applies technical threshold (e.g., min 70%)
    - Bids below threshold eliminated
  - Phase 2: Commercial Evaluation
    - Only technically qualified bids evaluated
    - Evaluators score commercial criteria
    - System combines technical + commercial scores
  - Continue to step 41

**AF-006: Re-evaluate Bid After Clarification**
- After AF-002, when vendor provides clarification:
  - User reviews clarification response
  - User clicks "Re-evaluate"
  - System reopens bid evaluation
  - User adjusts scores based on clarification
  - User saves updated evaluation
  - System logs score changes with reason
  - Continue to step 41

#### Exception Flows

**EF-001: No Bids Submitted**
- At step 4, if zero bids submitted:
  - System displays message: "No bids received for this RFQ"
  - System shows RFQ details and invited vendors
  - User options:
    - Re-issue RFQ with extended deadline
    - Cancel RFQ
    - Contact vendors to understand non-participation
  - End use case

**EF-002: Only One Bid Submitted**
- At step 8, if only one bid (non-competitive):
  - System displays warning: "Only one bid received. Not competitive."
  - System suggests:
    - Extend deadline to attract more bids
    - Negotiate directly with vendor
    - Cancel and re-issue RFQ
    - Proceed with single bid (requires approval)
  - User decides on action
  - If proceeding, evaluation continues
  - System flags as "Single Bid Award" requiring higher approval

**EF-003: All Bids Exceed Budget**
- At step 32, if all bids over budget:
  - System displays alert: "All bids exceed budget by [%]"
  - System shows budget vs. bid comparison
  - User options:
    - Negotiate with lowest bidder
    - Request budget increase
    - Modify requirements and re-issue RFQ
    - Cancel RFQ
  - User decides on action
  - System logs decision

**EF-004: Evaluator Conflict of Interest**
- At step 5, if evaluator has conflict:
  - System detects conflict (e.g., related to bidding vendor)
  - System displays conflict warning
  - System blocks evaluator from evaluating that bid
  - System notifies procurement manager
  - Procurement manager assigns alternate evaluator
  - Continue with alternate evaluator

**EF-005: Incomplete Evaluation Submission**
- At step 47, if evaluation incomplete:
  - System displays validation errors:
    - "Bid [X] not evaluated"
    - "Criterion [Y] not scored for Bid [Z]"
    - "Recommendation not provided"
  - System highlights incomplete sections
  - User must complete missing evaluations
  - Continue to step 47

**EF-006: Score Inconsistency Detected**
- At step 47, if score inconsistency:
  - System detects outlier scores (e.g., score 2 when all others 8-9)
  - System displays warning: "Unusual score detected for [Criterion] in Bid [X]"
  - System requests additional justification
  - User reviews and either:
    - Confirms score with detailed justification
    - Corrects score
  - Continue to step 47

**EF-007: Tied Bids (Same Total Score)**
- At step 33, if two or more bids have same score:
  - System displays tie-breaker options:
    - Lowest price wins
    - Shortest delivery time wins
    - Best past performance wins
    - Request additional evaluation round
  - User applies tie-breaker per RFQ rules
  - System ranks bids after tie-breaker
  - Continue to step 41

**EF-008: Recommended Bid Not Lowest Price**
- At step 44, if recommendation is not lowest price:
  - System displays alert: "Recommended bid is not lowest price"
  - System calculates price difference
  - System requires detailed justification:
    - Why higher-priced bid is better value
    - Technical superiority
    - Delivery advantages
    - Risk mitigation
  - User provides comprehensive justification
  - System flags for higher-level approval
  - Continue to step 46

#### Business Rules Applied
- BR-RFQ-003: Vendors cannot see other bids until evaluation complete
- BR-RFQ-004: Evaluation criteria weights must sum to 100%
- BR-RFQ-005: Award requires approval based on value thresholds
- BR-RFQ-013: All evaluation scores must be justified
- BR-RFQ-014: Technical evaluation must precede commercial for split method
- BR-RFQ-015: Disqualifications require documented reasons

#### UI Requirements
- Three evaluation modes: Individual, Comparison, Matrix
- Real-time auto-calculation of weighted scores
- Color-coded scoring (green=high, red=low)
- Side-by-side bid comparison with highlighting
- Export to Excel functionality
- Evaluation progress tracker
- Document viewer for bid attachments
- Score justification text areas
- Visual ranking display (medal icons for top 3)
- Budget vs. bid comparison charts
- Price histogram visualization
- Evaluator workload distribution display
- Mobile-responsive for evaluator access
- Audit trail of score changes
- Collaborative evaluation notes

---

### UC-RFQ-005: Award RFQ to Vendor

**Primary Actor**: Procurement Manager, Finance Manager, Executive
**Priority**: Critical
**Frequency**: Per RFQ after evaluation
**Related FR**: FR-RFQ-008

#### Preconditions
- User is authenticated with appropriate role and approval authority
- RFQ evaluation is complete and approved
- RFQ status is "Under Review" or "Evaluated"
- Recommendation has been submitted by evaluator
- Approval thresholds are defined
- Award notification templates are configured

#### Main Flow
1. User navigates to RFQ module
2. System displays RFQ list filtered by "Under Review"
3. User clicks on RFQ pending award decision
4. System displays RFQ detail page with "Award" tab
5. User clicks "Review for Award"
6. System displays award decision dashboard:
   - RFQ summary (title, number, total value)
   - Evaluation results summary
   - Recommended vendor (highlighted)
   - Bid comparison table (top 3 bids)
   - Evaluation scores and ranking
   - Approval workflow status
7. System shows bid comparison:
   - Rank | Vendor | Total Score | Total Price | Delivery | Status
   - #1 | Vendor A | 85.5 | $50,000 | 14 days | Recommended
   - #2 | Vendor B | 82.0 | $48,000 | 21 days | Alternative
   - #3 | Vendor C | 78.5 | $52,000 | 18 days | Alternative
8. User reviews recommendation:
   - Evaluator's recommendation and justification
   - Score breakdown by criteria
   - Price analysis
   - Technical assessment
   - Commercial terms evaluation
9. User clicks "View Winning Bid Details"
10. System displays complete bid details:
    - All line items with pricing
    - Commercial terms offered
    - Technical specifications
    - Delivery schedule
    - Submitted documents
    - Evaluation comments
11. User reviews and validates:
    - Bid meets all requirements
    - Pricing is reasonable
    - Vendor is qualified and reliable
    - Commercial terms are acceptable
    - Budget is available
12. User clicks "Award Decision"
13. System displays award decision form:
    - Award Status (dropdown):
      - Approve Award (to recommended vendor)
      - Award to Alternative Vendor (requires justification)
      - Reject All Bids and Reissue
      - Cancel RFQ
    - Award Value (auto-filled from bid)
    - Award Justification (required text area)
    - Special Conditions (optional)
    - Contract Duration
    - Award Effective Date
14. User selects "Approve Award"
15. User enters award justification
16. User adds any special conditions:
    - Price adjustment clauses
    - Performance milestones
    - Quality inspection requirements
    - Penalty clauses
17. User sets contract duration (if not specified in RFQ)
18. User clicks "Submit Award Decision"
19. System validates award:
    - User has approval authority for this value (BR-RFQ-005):
      - <$50K: Procurement Manager
      - $50K-$500K: Finance Manager
      - >$500K: Executive approval
    - Budget is available
    - Award justification provided
    - All required fields completed
20. If user lacks authority:
    - System routes to higher authority approver
    - System notifies approver
    - System displays "Award submitted for approval"
    - Approver reviews and approves/rejects
    - If approved, continue to step 21
21. System creates award record:
    - Award number (auto-generated)
    - Awarded vendor
    - Award value
    - Award date
    - Approver details
    - Award terms
22. System updates RFQ status to "Awarded"
23. System updates winning bid status to "Awarded"
24. System updates other bids status to "Not Awarded"
25. System generates award letter for winning vendor:
    - RFQ details
    - Award confirmation
    - Awarded line items and prices
    - Terms and conditions
    - Next steps (contract signing)
    - Contract preparation timeline
26. System sends award notification email to winning vendor:
    - Award congratulations
    - Award letter PDF attachment
    - Contract preparation instructions
    - Required next steps
    - Contact information
27. System generates regret letters for unsuccessful vendors:
    - Participation appreciation
    - Regret message
    - Reason for non-award (optional, generic)
    - Encouragement for future participation
    - Debriefing offer (if policy allows)
28. System sends regret emails to unsuccessful vendors
29. System notifies internal stakeholders:
    - Procurement team
    - Requesting department
    - Finance team
    - Executive management (if high value)
30. System updates vendor performance records:
    - Winning vendor: Bid win recorded
    - Other vendors: Participation recorded
31. System creates contract preparation task:
    - Assigns to contract administrator
    - Due date: Award date + 7 days
    - Includes all RFQ and bid details
32. System logs award decision in audit trail
33. System displays success message:
    - "Award successfully granted to [Vendor Name]"
    - Award number
    - Next steps
34. System automatically triggers:
    - Contract generation workflow (see UC-RFQ-008)
    - Price list creation (if configured)
    - Purchase order creation (if configured)

#### Postconditions
- **Success**: RFQ awarded to selected vendor
- **Success**: Award record created with award number
- **Success**: RFQ status updated to "Awarded"
- **Success**: Winning vendor notified with award letter
- **Success**: Unsuccessful vendors notified with regret letters
- **Success**: Contract preparation task created
- **Success**: Vendor performance records updated
- **Success**: Internal stakeholders notified
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Award to Alternative Vendor (Not Recommended)**
- At step 14, user selects "Award to Alternative Vendor":
  - System displays alternative vendor selection
  - User selects vendor (2nd or 3rd ranked)
  - System displays warning: "Award to non-recommended vendor requires justification"
  - System requires detailed justification:
    - Why not awarding to recommended vendor
    - Why alternative vendor is better choice
    - Impact analysis
  - User provides comprehensive justification
  - System flags for higher-level approval (one level up)
  - System routes for additional approval
  - If approved, continue to step 21

**AF-002: Partial Award (Multiple Vendors)**
- At step 14, user selects "Partial Award":
  - System displays line item allocation interface
  - User assigns line items to different vendors:
    - Vendor A: Items 1-5
    - Vendor B: Items 6-10
  - System validates:
    - All items allocated
    - No duplicate allocations
    - Allocation rationale provided
  - System creates multiple award records
  - System generates separate award letters
  - Continue to step 21 for each vendor

**AF-003: Conditional Award (Subject to Negotiation)**
- At step 14, user selects "Conditional Award":
  - System displays conditional award form
  - User specifies conditions:
    - Price reduction required (specify amount/%)
    - Terms modification required
    - Document submission required
  - User sets negotiation deadline
  - System sends conditional award notification to vendor
  - System creates negotiation task (see UC-RFQ-006)
  - System changes status to "Award Pending Negotiation"
  - Negotiation completed → Final award
  - End use case pending negotiation

**AF-004: Split Award (Value/Volume Split)**
- At step 14, user selects "Split Award":
  - System displays split configuration
  - User configures split:
    - Primary vendor: 70% of volume
    - Secondary vendor: 30% of volume
  - User specifies split rationale (risk mitigation, capacity)
  - System creates two award records with allocations
  - System generates award letters with split details
  - Continue to step 21

**AF-005: Award with Price Negotiation Result**
- After UC-RFQ-006 (negotiation) completes:
  - System updates award value with negotiated price
  - System attaches negotiation outcome summary
  - User reviews negotiated terms
  - User confirms final award
  - Continue to step 21 with negotiated values

**AF-006: Escalate Award for Higher Approval**
- At step 20, if value requires higher approval:
  - System routes to Executive/Board
  - System sends approval request with complete package:
    - RFQ summary
    - Evaluation results
    - Recommendation
    - Business case
  - Approver reviews in approval queue
  - Approver approves/rejects/requests changes
  - If approved, continue to step 21
  - If rejected, return to step 13 for alternative action

#### Exception Flows

**EF-001: Award Value Exceeds Budget**
- At step 19, if award value > available budget:
  - System displays error: "Award value exceeds available budget"
  - System shows:
    - Budget: $50,000
    - Award Value: $55,000
    - Shortfall: $5,000
  - User options:
    - Request budget increase
    - Negotiate price reduction
    - Cancel award and re-issue RFQ
    - Award partially (reduce scope)
  - User selects option and proceeds accordingly
  - End use case or continue based on selection

**EF-002: Vendor Disqualified Before Award**
- At step 10, if recommended vendor becomes disqualified:
  - System displays alert: "Recommended vendor has been disqualified"
  - System shows disqualification reason
  - System suggests next-ranked qualified vendor
  - User reviews alternative vendor
  - User decides:
    - Award to next-ranked vendor
    - Re-evaluate remaining bids
    - Cancel RFQ
  - Continue based on selection

**EF-003: Vendor Declines Award**
- After step 26, if vendor declines award:
  - Vendor responds declining award
  - System notifies procurement team
  - System displays alert: "Vendor [Name] declined award"
  - User options:
    - Award to next-ranked vendor (auto-suggests 2nd place)
    - Re-issue RFQ
    - Negotiate with declining vendor
  - User selects next vendor
  - System repeats award process with new vendor
  - Continue to step 21

**EF-004: Missing Award Approval**
- At step 19, if approver not available:
  - System identifies approver absence
  - System suggests alternate approver (per policy)
  - User selects alternate or waits for primary
  - If alternate selected, routes to alternate
  - Continue to step 20

**EF-005: All Bids Rejected**
- At step 14, user selects "Reject All Bids":
  - System displays rejection form
  - User enters rejection reasons:
    - All bids non-responsive
    - All bids exceed budget
    - Quality concerns
    - Other (specify)
  - User decides next action:
    - Re-issue RFQ with modified requirements
    - Cancel procurement
    - Direct negotiation
  - System sends regret letters to all vendors
  - System updates RFQ status to "Cancelled" or "Reissued"
  - End use case

**EF-006: Award Dispute/Challenge**
- After step 28, if vendor disputes award:
  - Unsuccessful vendor files dispute
  - System logs dispute
  - System notifies procurement manager
  - System pauses contract execution
  - Procurement manager reviews dispute
  - User accesses dispute resolution workflow
  - Dispute resolved → Continue with award
  - Dispute upheld → Re-evaluate or re-issue
  - End use case pending dispute resolution

**EF-007: System Error During Award Processing**
- At step 21-31, if system error:
  - System displays error: "Award processing failed"
  - System logs error details
  - System preserves award decision
  - System does NOT send vendor notifications
  - User options:
    - Retry award processing
    - Contact system administrator
    - Complete award manually
  - System retries or administrator resolves
  - Continue from failure point

**EF-008: Incomplete Bid Information Found**
- At step 11, if critical bid information missing:
  - System displays warning: "Critical bid information missing"
  - System lists missing information
  - User options:
    - Request information from vendor (short deadline)
    - Disqualify bid
    - Award to alternative vendor
  - User decides and proceeds accordingly

#### Business Rules Applied
- BR-RFQ-005: Award requires approval based on value thresholds (<$50K: Procurement Manager, $50K-$500K: Finance Manager, >$500K: Executive)
- BR-RFQ-007: All invited vendors notified of award decision
- BR-RFQ-016: Award must be within 30 days of bid closing
- BR-RFQ-017: Award notification sent within 24 hours of decision
- BR-RFQ-018: Unsuccessful vendors offered debriefing (if policy)
- BR-RFQ-019: Vendor performance record updated upon award

#### UI Requirements
- Award decision dashboard with summary metrics
- Side-by-side bid comparison table
- Visual score breakdown (bar charts)
- Approval workflow visualization
- Award letter preview before sending
- Regret letter template customization
- Budget availability indicator
- Approval authority checker
- Vendor debriefing scheduler
- Award notification tracking (sent, opened, acknowledged)
- Contract generation trigger button
- Export award report to PDF
- Mobile-responsive for approver access
- Award history timeline
- Vendor performance impact display

---

### UC-RFQ-006: Negotiate Bid Terms

**Primary Actor**: Procurement Manager, Vendor User
**Priority**: High
**Frequency**: 30-40% of awarded RFQs
**Related FR**: FR-RFQ-007

#### Preconditions
- User is authenticated with negotiation authority
- RFQ has received bids and evaluation is complete
- Negotiation is initiated (either before or after conditional award)
- Vendor is responsive and willing to negotiate
- Negotiation parameters are defined

#### Main Flow
1. User navigates to RFQ detail page
2. System displays RFQ with evaluation results
3. User clicks "Initiate Negotiation" button
4. System displays negotiation initiation form:
   - Select vendor for negotiation (typically highest-ranked)
   - Negotiation scope (Price, Terms, Delivery, Quality, All)
   - Negotiation objectives (target price, desired terms)
   - Negotiation deadline
   - Negotiation mode (Email, Meeting, Portal Chat)
5. User selects vendor and defines objectives:
   - Current bid price: $55,000
   - Target price: $50,000 (9% reduction)
   - Alternative: Extended payment terms
6. User sets negotiation deadline (e.g., 7 business days)
7. User clicks "Start Negotiation"
8. System creates negotiation record:
   - Negotiation ID (auto-generated)
   - RFQ reference
   - Vendor
   - Initiation date
   - Status: "In Progress"
   - Negotiation objectives
9. System sends negotiation invitation to vendor:
   - Negotiation request notification
   - Current bid details
   - Areas for negotiation
   - Negotiation deadline
   - Portal link for negotiation workspace
10. Vendor receives notification and accesses negotiation workspace
11. System displays negotiation workspace (for both parties):
    - Current bid terms (baseline)
    - Negotiation items table
    - Offer/counteroffer section
    - Message thread
    - Document exchange
    - Negotiation history log
12. **Procurement Manager's Actions**
13. User views current bid terms:
    - Line items with original prices
    - Commercial terms
    - Delivery schedule
    - Payment terms
14. User creates first negotiation offer:
    - Item 1: Price reduction to $45/unit (from $50)
    - Item 3: Delivery in 10 days (from 14 days)
    - Payment Terms: Net 60 (from Net 30)
15. User enters offer justification:
    - Competitive pricing from other vendors
    - Volume commitment
    - Long-term partnership potential
16. User clicks "Send Offer"
17. System logs offer in negotiation history
18. System sends offer notification to vendor
19. **Vendor's Actions (in Vendor Portal)**
20. Vendor logs into portal and views offer
21. Vendor reviews offer details
22. Vendor creates counteroffer:
    - Item 1: Accepts price reduction to $47/unit (compromise)
    - Item 3: Delivery in 12 days (compromise)
    - Payment Terms: Net 45 (compromise)
23. Vendor enters counteroffer justification:
    - Material cost constraints
    - Production schedule limitations
    - Cash flow considerations
24. Vendor clicks "Send Counteroffer"
25. System logs counteroffer in negotiation history
26. System sends counteroffer notification to procurement manager
27. **Negotiation Iterations**
28. User reviews counteroffer
29. User analyzes counteroffer:
    - Price: $47/unit (still 6% higher than target)
    - Delivery: 12 days (acceptable)
    - Payment: Net 45 (acceptable)
30. User has options:
    - Accept Counteroffer
    - Send New Counteroffer
    - Request Meeting
    - Close Negotiation
31. User sends second counteroffer:
    - Item 1: $46/unit (final offer)
    - Items 3: Accepts 12 days
    - Payment Terms: Accepts Net 45
32. User marks as "Final Offer"
33. System sends to vendor with "Final Offer" flag
34. Vendor reviews final offer
35. Vendor accepts final offer
36. Vendor clicks "Accept Offer"
37. System updates negotiation status to "Agreement Reached"
38. **Finalize Negotiation**
39. System displays negotiation summary:
    - Original bid: $55,000
    - Negotiated price: $46,000 (16% reduction)
    - Agreed terms summary
    - Negotiation history
    - Savings achieved
40. System generates negotiation outcome document:
    - Final agreed terms
    - All line items with negotiated prices
    - Commercial terms
    - Delivery terms
    - Both parties' agreement acknowledgment
41. User reviews negotiation outcome
42. User clicks "Finalize Negotiation"
43. System prompts both parties for digital signature:
    - Procurement Manager signs
    - Vendor signs via portal
44. System updates bid record with negotiated terms:
    - Creates new bid version
    - Links to original bid
    - Flags as "Negotiated"
45. System updates RFQ with negotiated outcome:
    - If conditional award: Converts to final award
    - If pre-award: Updates evaluation with negotiated terms
46. System sends confirmation to both parties:
    - Negotiation outcome document
    - Updated bid confirmation
    - Next steps (contract preparation)
47. System logs negotiation completion in audit trail
48. System displays success message:
    - "Negotiation completed successfully"
    - Savings achieved: $9,000 (16%)
    - Updated award ready for processing

#### Postconditions
- **Success**: Negotiation completed with agreed terms
- **Success**: Bid updated with negotiated terms
- **Success**: Negotiation outcome document generated and signed
- **Success**: Savings recorded and documented
- **Success**: RFQ ready for final award (if conditional) or contract (if awarded)
- **Success**: Audit log entry created with full negotiation history

#### Alternate Flows

**AF-001: Vendor Initiates Price Adjustment Request**
- Before step 1, vendor requests negotiation:
  - Vendor submits price adjustment request via portal
  - Vendor provides justification (material cost increase, etc.)
  - System notifies procurement manager
  - User reviews request
  - User decides to accept negotiation or decline
  - If accepted, continue to step 4

**AF-002: Schedule In-Person Negotiation Meeting**
- At step 30, user selects "Request Meeting":
  - System displays meeting scheduler
  - User proposes meeting date/time/location
  - User adds meeting agenda
  - User invites participants (vendor, internal team)
  - System sends meeting invitation
  - Meeting conducted offline
  - After meeting, user enters negotiation outcome manually
  - Continue to step 39

**AF-003: Negotiation via Phone/Email (Outside Portal)**
- At step 4, user selects "Email Mode":
  - System generates negotiation email template
  - User sends email to vendor
  - Negotiation happens via email
  - User manually logs offers/counteroffers in system
  - User uploads email thread as evidence
  - User enters final outcome
  - Continue to step 39

**AF-004: Multi-Party Negotiation (Multiple Vendors)**
- At step 4, user selects multiple vendors:
  - System creates separate negotiation workspaces
  - User negotiates with each vendor separately
  - User can leverage competing offers
  - User can share "best offer so far" (if policy allows)
  - User selects best negotiated offer at the end
  - Continue to step 39 with winning vendor

**AF-005: Negotiation Breakdown - No Agreement**
- At step 35, vendor rejects final offer:
  - Vendor clicks "Reject Offer"
  - Vendor provides rejection reason
  - System notifies user
  - User options:
    - Make one more concession
    - Close negotiation without agreement
    - Award to alternative vendor
  - If closing without agreement:
    - System updates negotiation status to "No Agreement"
    - System logs breakdown reason
    - User proceeds with alternative vendor
  - End use case

**AF-006: Suspend Negotiation (Vendor Needs Time)**
- At step 24, vendor requests extension:
  - Vendor clicks "Request Extension"
  - Vendor provides reason (need approval from management)
  - Vendor suggests new deadline
  - System notifies user
  - User approves/denies extension
  - If approved, system updates deadline
  - Negotiation resumes when vendor ready
  - Continue from step 20

**AF-007: Quick Agreement (First Offer Accepted)**
- At step 18, vendor immediately accepts:
  - Vendor reviews offer
  - Vendor clicks "Accept Offer"
  - System skips counteroffer steps
  - System proceeds directly to finalization
  - Continue to step 38

#### Exception Flows

**EF-001: Negotiation Deadline Expired**
- At any step, if deadline passes:
  - System sends deadline warning 24 hours before
  - At deadline, system displays alert: "Negotiation deadline expired"
  - System updates negotiation status to "Expired"
  - User options:
    - Extend deadline (requires vendor agreement)
    - Close negotiation and proceed with original bid
    - Cancel negotiation
  - User selects option and proceeds accordingly

**EF-002: Vendor Unresponsive During Negotiation**
- After step 18, if vendor doesn't respond in 3 days:
  - System sends automatic reminder to vendor
  - System notifies user of non-response
  - User options:
    - Wait longer
    - Send escalation to vendor management
    - Close negotiation
    - Award to alternative vendor
  - User decides and proceeds accordingly

**EF-003: Negotiated Terms Exceed Original Budget**
- At step 39, if negotiated price still over budget:
  - System displays alert: "Negotiated terms still exceed budget"
  - System shows budget variance
  - User options:
    - Request budget increase
    - Continue negotiation for further reduction
    - Award to lower-priced alternative vendor
    - Cancel procurement
  - User selects option

**EF-004: Internal Approval Required for Concession**
- At step 14 or 31, if significant concession:
  - System detects major concession (>10% increase from target)
  - System requires internal approval
  - User submits concession for approval
  - System routes to Finance Manager
  - If approved, continue negotiation
  - If denied, user adjusts offer
  - Continue from step 14

**EF-005: Vendor Withdraws from Negotiation**
- At any vendor step, if vendor withdraws:
  - Vendor clicks "Withdraw from Negotiation"
  - Vendor provides withdrawal reason
  - System notifies user immediately
  - System updates negotiation status to "Withdrawn"
  - User options:
    - Contact vendor to understand reason
    - Attempt to re-engage vendor
    - Proceed with original bid (if acceptable)
    - Award to alternative vendor
  - User decides next action

**EF-006: Legal/Compliance Issue Identified**
- At step 41, if compliance issue found:
  - Legal team identifies problematic term
  - System flags negotiation for review
  - System pauses finalization
  - Legal team provides guidance
  - User renegotiates problematic terms
  - Continue from step 28

**EF-007: Vendor Cannot Sign Digitally**
- At step 43, if vendor cannot sign electronically:
  - Vendor requests physical signature
  - System generates PDF for printing
  - User sends physical document
  - Vendor signs and returns (scan/photo)
  - User uploads signed document
  - System attaches to negotiation record
  - Continue to step 45

**EF-008: Negotiation Exceeds Authority Limit**
- At step 39, if final terms exceed user's authority:
  - System checks approval limits
  - System requires higher approval
  - User submits negotiation outcome for approval
  - System routes to appropriate approver
  - Approver reviews and approves/rejects
  - If approved, continue to step 42
  - If rejected, user renegotiates or awards to alternative

#### Business Rules Applied
- BR-RFQ-020: Negotiation must be completed within RFQ validity period
- BR-RFQ-021: All negotiation communications logged and auditable
- BR-RFQ-022: Significant concessions require internal approval
- BR-RFQ-023: Final negotiated terms must be accepted by both parties
- BR-RFQ-025: Bid validity period minimum 60 days from closing

#### UI Requirements
- Real-time negotiation workspace
- Offer/counteroffer tracking table
- Threaded message system (like email)
- Side-by-side comparison (original vs. negotiated)
- Savings calculator with live updates
- Document exchange (secure file upload)
- Digital signature integration
- Negotiation history timeline
- Deadline countdown timer
- Mobile-responsive for vendor access
- Notification system (email + portal)
- Export negotiation transcript
- Track changes visualization
- Approval workflow integration
- Meeting scheduler integration

---

### UC-RFQ-007: Close RFQ Campaign

**Primary Actor**: Procurement Manager
**Priority**: High
**Frequency**: Per RFQ completion
**Related FR**: FR-RFQ-001

#### Preconditions
- User is authenticated as Procurement Manager
- RFQ exists with status "Awarded" or "Cancelled"
- All administrative tasks completed (awards, notifications, contracts)
- No pending vendor disputes or clarifications

#### Main Flow
1. User navigates to RFQ module
2. System displays RFQ list filtered by "Awarded" or "Completed"
3. User clicks on RFQ to be closed
4. System displays RFQ detail page
5. User clicks "Close RFQ" button
6. System displays RFQ closure checklist:
   - [✓] Award decision finalized
   - [✓] Winning vendor notified
   - [✓] Unsuccessful vendors notified
   - [✓] Contract generated (or in progress)
   - [ ] Vendor performance recorded
   - [ ] Lessons learned documented
   - [ ] Final report generated
7. System highlights incomplete items (if any)
8. User reviews RFQ closure requirements:
   - All vendors notified of outcome
   - Award processed and recorded
   - Contracts initiated
   - No outstanding disputes
   - Performance records updated
9. User clicks "Complete Closure Checklist"
10. **Vendor Performance Recording**
11. System displays vendor performance form for awarded vendor:
    - Vendor name
    - Performance score (based on submission quality)
    - Responsiveness rating
    - Bid quality rating
    - Communication rating
12. User enters performance ratings and notes
13. User clicks "Save Performance Record"
14. System updates vendor performance history
15. **Lessons Learned Documentation**
16. System displays lessons learned form:
    - What went well?
    - What could be improved?
    - Timeline adherence
    - Bid quality assessment
    - Process improvements
    - Recommendations for future RFQs
17. User documents lessons learned
18. User clicks "Save Lessons Learned"
19. **Generate Final Report**
20. User clicks "Generate Final Report"
21. System compiles comprehensive RFQ report:
    - **Executive Summary**
      - RFQ title and number
      - Total bids received
      - Awarded vendor and value
      - Savings achieved
      - Timeline adherence
    - **RFQ Details**
      - Requirements summary
      - Invited vs. submitted bids
      - Evaluation methodology
    - **Bid Analysis**
      - Price comparison table
      - Evaluation scores
      - Award justification
    - **Process Metrics**
      - Days from creation to award
      - Vendor response rate
      - Evaluation duration
    - **Financial Summary**
      - Budget vs. award value
      - Savings/cost overrun
      - Multi-year projections (if applicable)
    - **Lessons Learned**
      - Key insights
      - Recommendations
22. System generates PDF report
23. User reviews generated report
24. User approves report
25. System saves final report to document library
26. **Finalize Closure**
27. User clicks "Close RFQ Campaign"
28. System displays final confirmation:
    - "Are you sure you want to close this RFQ?"
    - "RFQ will be archived and marked as closed"
    - "This action cannot be undone"
29. User confirms closure
30. System performs closure actions:
    - Updates RFQ status to "Closed"
    - Sets closure date to current date
    - Archives all bid documents
    - Locks RFQ from further edits
    - Generates closure audit log
31. System sends closure notifications:
    - To procurement team (RFQ closed)
    - To requesting department (procurement complete)
    - To finance team (award value finalized)
32. System updates analytics dashboards:
    - RFQ completion metrics
    - Average time to award
    - Cost savings achieved
    - Vendor participation rates
33. System displays success message:
    - "RFQ [Number] successfully closed"
    - Closure date and time
    - Final report link
34. System moves RFQ to "Closed RFQs" archive

#### Postconditions
- **Success**: RFQ status updated to "Closed"
- **Success**: Vendor performance recorded
- **Success**: Lessons learned documented
- **Success**: Final report generated and saved
- **Success**: All stakeholders notified
- **Success**: RFQ archived
- **Success**: Analytics updated
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Close RFQ Without Award (Cancelled)**
- At step 5, if RFQ was cancelled:
  - System displays cancellation closure checklist:
    - [✓] Cancellation reason documented
    - [✓] All invited vendors notified
    - [ ] Lessons learned documented
    - [ ] Cancellation report generated
  - User documents cancellation reason
  - User documents lessons learned
  - System generates cancellation report
  - Continue to step 27

**AF-002: Partial Closure (Pending Contract)**
- At step 6, if contract not yet finalized:
  - System displays warning: "Contract preparation in progress"
  - User selects "Partial Closure"
  - System marks RFQ as "Closing Pending Contract"
  - System auto-completes full closure when contract signed
  - End use case pending contract

**AF-003: Close with Outstanding Dispute**
- At step 6, if vendor dispute pending:
  - System displays warning: "Outstanding vendor dispute"
  - System shows dispute details
  - User options:
    - Wait for dispute resolution
    - Close with dispute noted (requires approval)
    - Escalate dispute
  - If closing with dispute, requires higher approval
  - Continue to step 27 after approval

**AF-004: Schedule Auto-Closure**
- At step 27, user sets auto-closure:
  - User clicks "Schedule Closure"
  - User sets closure date (e.g., after contract signed)
  - System creates scheduled closure task
  - System auto-closes on specified date if all conditions met
  - End use case

**AF-005: Export Data Before Closure**
- At step 24, user exports data:
  - User clicks "Export All Data"
  - System packages:
    - All bids
    - All evaluations
    - All communications
    - All documents
  - System creates ZIP file
  - User downloads for archival
  - Continue to step 27

#### Exception Flows

**EF-001: Incomplete Checklist Items**
- At step 9, if critical items incomplete:
  - System displays error: "Cannot close RFQ with incomplete critical items"
  - System highlights incomplete items:
    - "Unsuccessful vendors not notified"
    - "Performance records missing"
  - System blocks closure
  - User must complete items first
  - User completes items
  - Continue to step 9

**EF-002: Missing Lessons Learned**
- At step 18, if lessons learned not entered:
  - System displays prompt: "Lessons learned documentation required"
  - User options:
    - Enter lessons learned now
    - Skip for now (requires approval)
    - Delegate to team member
  - If skipping, requires manager approval
  - Continue to step 19

**EF-003: Contract Not Initiated**
- At step 6, if contract not started:
  - System displays alert: "Contract not yet initiated"
  - User options:
    - Initiate contract now (see UC-RFQ-008)
    - Close without contract (high-value requires approval)
    - Postpone closure
  - User selects option
  - If closing without contract, requires approval
  - Continue based on selection

**EF-004: Vendor Dispute Filed During Closure**
- At step 29, if vendor files dispute:
  - System detects new dispute
  - System blocks closure
  - System displays alert: "New vendor dispute filed"
  - System redirects to dispute management
  - Closure suspended until dispute resolved
  - End use case

**EF-005: Report Generation Failure**
- At step 22, if report generation fails:
  - System displays error: "Report generation failed"
  - System logs error details
  - User options:
    - Retry report generation
    - Generate partial report
    - Close without report (not recommended)
    - Contact system administrator
  - User retries or contacts admin
  - Continue when resolved

**EF-006: User Lacks Closure Authority**
- At step 29, if user lacks authority:
  - System displays error: "Insufficient authority to close RFQ"
  - System shows required authority level
  - User options:
    - Request approval from manager
    - Delegate to authorized user
    - Escalate to procurement manager
  - System routes closure for approval
  - End use case pending approval

#### Business Rules Applied
- BR-RFQ-026: RFQ must be closed within 30 days of award
- BR-RFQ-027: Vendor performance must be recorded before closure
- BR-RFQ-028: Final report required for all closed RFQs
- BR-RFQ-029: Closed RFQs cannot be reopened without executive approval

#### UI Requirements
- Closure checklist with auto-detection of completion
- Vendor performance rating interface (star ratings)
- Lessons learned rich text editor
- Final report preview before saving
- Closure confirmation modal
- Progress indicator for closure process
- Document download links
- Archive access permissions
- Mobile-responsive for manager approval
- Audit trail viewer
- Export functionality (Excel, PDF)
- Notification settings for closure
- Auto-closure scheduler

---

### UC-RFQ-008: Generate Contract from RFQ

**Primary Actor**: Procurement Manager
**Priority**: High
**Frequency**: Per awarded RFQ
**Related FR**: FR-RFQ-008

#### Preconditions
- User is authenticated as Procurement Manager or Contract Administrator
- RFQ has been awarded to vendor
- Award has been accepted by vendor
- Contract templates are configured in system
- Legal terms repository is accessible

#### Main Flow
1. User navigates to awarded RFQ detail page
2. System displays RFQ information with "Awarded" status
3. User clicks "Generate Contract" button
4. System displays contract generation wizard:
   - Contract Type Selection
   - Contract Details
   - Terms & Conditions
   - Review & Generate
5. **Step 1: Contract Type Selection**
6. System displays contract template library:
   - Goods Purchase Agreement
   - Services Agreement
   - Works Contract
   - Framework Agreement
   - Custom Template
7. System recommends template based on RFQ type
8. User selects appropriate contract template
9. User clicks "Next"
10. **Step 2: Contract Details**
11. System auto-populates contract form from RFQ and bid data:
   - **Parties**
     - Buyer: [Company Name] (from system)
     - Seller: [Winning Vendor] (from awarded bid)
     - Buyer representative
     - Seller representative
   - **Contract Number**: [Auto-generated]
   - **Contract Title**: [From RFQ title]
   - **Contract Date**: [Award date or current date]
   - **Contract Value**: [From awarded/negotiated bid]
   - **Currency**: [From bid]
   - **Contract Duration**: [As specified in RFQ or bid]
   - **Effective Date**: [User enters]
   - **Expiry Date**: [Auto-calculated or user enters]
12. System displays line items from awarded bid:
   - Item description
   - Quantity
   - Unit price
   - Total price
   - Delivery date
   - Specifications
13. User reviews and can modify:
   - Contract dates
   - Delivery schedule
   - Payment milestones
   - Special conditions
14. User clicks "Next"
15. **Step 3: Terms & Conditions**
16. System displays terms sections:
   - **Payment Terms**
     - From bid: Net 45 days
     - Payment method
     - Payment schedule (if milestones)
     - Late payment penalties
   - **Delivery Terms**
     - Delivery location(s)
     - Delivery schedule
     - Delivery inspection requirements
     - Partial delivery allowance
   - **Quality & Specifications**
     - Quality standards (from RFQ)
     - Inspection and testing
     - Acceptance criteria
     - Rejection procedures
   - **Warranties**
     - Warranty period (from bid)
     - Warranty coverage
     - Warranty claims process
   - **Penalties & Liquidated Damages**
     - Late delivery penalties
     - Quality failure penalties
     - Calculation method
     - Maximum cap
   - **Insurance & Bonds**
     - Performance bond (if required)
     - Insurance requirements
     - Coverage amounts
   - **Termination**
     - Termination conditions
     - Notice period
     - Termination penalties
     - Obligations upon termination
   - **Dispute Resolution**
     - Escalation process
     - Arbitration clause
     - Governing law
     - Jurisdiction
   - **Force Majeure**
     - Force majeure events
     - Notice requirements
     - Relief provisions
   - **Confidentiality**
     - Confidential information definition
     - Obligations
     - Exclusions
     - Duration
   - **Intellectual Property**
     - IP ownership
     - License grants
     - IP warranties
17. User reviews all terms
18. User can modify terms:
   - Select alternative clause from library
   - Edit text directly
   - Add custom clauses
19. User adds contract-specific clauses (if any):
   - Special conditions
   - Additional requirements
   - Custom provisions
20. User clicks "Next"
21. **Step 4: Review & Generate**
22. System displays complete contract preview:
   - All sections formatted
   - All data populated
   - All terms included
23. System runs validation checks:
   - All mandatory sections present
   - No conflicting terms
   - Legal compliance verified
   - All placeholders filled
24. System displays validation results:
   - ✓ All mandatory sections present
   - ✓ No conflicting terms detected
   - ✓ Legal compliance verified
   - ⚠ Warning: Payment terms differ from policy (Net 45 vs. standard Net 30)
25. User reviews warnings and confirms acceptable
26. User adds contract notes/instructions (optional)
27. User clicks "Generate Contract"
28. System generates contract document:
   - Applies contract template formatting
   - Populates all data fields
   - Includes all terms and conditions
   - Adds signature blocks
   - Adds annexes:
     - Annex A: Line Items and Pricing
     - Annex B: Technical Specifications
     - Annex C: Delivery Schedule
     - Annex D: Special Conditions
29. System generates PDF document
30. System displays generated contract
31. User reviews generated contract
32. User options:
   - "Edit and Regenerate": Makes changes and regenerates
   - "Approve and Send for Signature": Proceeds to signature
   - "Save as Draft": Saves for later finalization
33. User clicks "Approve and Send for Signature"
34. System creates contract record:
   - Contract number
   - Contract status: "Pending Signature"
   - Linked RFQ
   - Linked vendor
   - Contract value
   - Contract dates
35. System initiates signature workflow:
   - Sends contract to internal approvers (if required):
     - Procurement Manager
     - Legal team (for high-value contracts)
     - Finance team
     - Executive (for contracts >$500K)
   - After internal approvals, sends to vendor
36. System sends contract to vendor:
   - Email with contract PDF attachment
   - Portal notification
   - E-signature link (if configured)
   - Instructions for signing
37. Vendor receives contract via portal
38. Vendor reviews contract
39. Vendor signs contract electronically or returns signed copy
40. System receives signed contract from vendor
41. System updates contract status to "Signed by Vendor"
42. System routes to buyer for final signature
43. Buyer signs contract
44. System updates contract status to "Fully Executed"
45. System distributes fully executed contract:
   - To vendor (email + portal)
   - To internal stakeholders (procurement, finance, legal, requesting department)
   - To document repository
46. System links contract to:
   - RFQ record
   - Vendor profile
   - Award record
   - Financial system (if integrated)
47. System creates contract monitoring tasks:
   - Delivery tracking
   - Payment milestones
   - Performance monitoring
   - Renewal reminders (if applicable)
48. System logs contract generation and execution in audit trail
49. System displays success message:
   - "Contract [Number] successfully generated and executed"
   - Contract details
   - Next steps (delivery tracking, payment processing)

#### Postconditions
- **Success**: Contract generated from RFQ and bid data
- **Success**: Contract status updated to "Fully Executed"
- **Success**: Contract distributed to all parties
- **Success**: Contract linked to RFQ and vendor records
- **Success**: Contract monitoring tasks created
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Use Custom Contract Template**
- At step 8, user selects "Custom Template":
  - System displays custom template builder
  - User uploads custom template (Word/PDF)
  - System parses template for data fields
  - System maps RFQ/bid data to template fields
  - User confirms mappings
  - Continue to step 10 with custom template

**AF-002: Multi-Phase Contract (Framework Agreement)**
- At step 11, if framework agreement:
  - User configures framework terms:
    - Total framework value (e.g., $500K over 2 years)
    - Call-off procedure
    - Pricing structure (fixed or variable)
    - Minimum/maximum order quantities
  - System generates master agreement + call-off template
  - Continue to step 14

**AF-003: Contract Requires Legal Review**
- At step 33, if legal review required:
  - User clicks "Send for Legal Review"
  - System routes contract to legal team
  - Legal team reviews contract
  - Legal team approves or requests changes:
    - If changes requested, user edits and resubmits
    - If approved, continue to step 34
  - Continue to step 34 after legal approval

**AF-004: Vendor Requests Contract Modifications**
- At step 39, vendor requests changes:
  - Vendor clicks "Request Modification"
  - Vendor specifies requested changes
  - System notifies procurement manager
  - User reviews vendor requests
  - User options:
    - Accept changes and regenerate contract
    - Negotiate changes
    - Reject changes
  - If accepted, user edits contract and regenerates
  - Continue to step 28 with modified contract

**AF-005: Physical Signature Required (No E-signature)**
- At step 36, if e-signature not available:
  - System generates PDF for printing
  - System sends print instructions
  - User prints contract (2 copies)
  - User signs both copies
  - User couriers one copy to vendor
  - Vendor signs both copies
  - Vendor returns one copy to buyer
  - User scans and uploads signed contract
  - System updates status to "Fully Executed"
  - Continue to step 45

**AF-006: Multi-Vendor Contract (Split Award)**
- At step 11, if multiple awarded vendors:
  - System prompts for contract generation per vendor
  - User generates separate contract for each vendor
  - System assigns unique contract numbers
  - System links all contracts to single RFQ
  - User repeats process for each vendor
  - Continue to step 28 for each contract

#### Exception Flows

**EF-001: Required Contract Data Missing**
- At step 23, if mandatory data missing:
  - System displays validation error:
    - "Missing effective date"
    - "Missing delivery location"
    - "Missing payment terms"
  - System highlights missing fields
  - User must provide missing data
  - Continue to step 23

**EF-002: Conflicting Terms Detected**
- At step 23, if conflicting terms:
  - System displays conflict warning:
    - "Conflict: Payment terms specify Net 30, but delivery terms reference Net 45"
    - "Conflict: Contract duration is 1 year, but warranty period is 2 years"
  - System highlights conflicting sections
  - User must resolve conflicts:
    - Edit one or both terms to align
    - Add clarification note
  - Continue to step 23

**EF-003: Contract Template Not Available**
- At step 6, if no suitable template:
  - System displays error: "No contract template available for this RFQ type"
  - User options:
    - Request template from administrator
    - Use generic template
    - Upload custom template (see AF-001)
  - User selects option
  - Continue based on selection

**EF-004: Legal Compliance Issue**
- At step 23, if compliance violation detected:
  - System displays compliance error:
    - "Terms violate procurement policy"
    - "Payment terms exceed 60-day limit"
  - System blocks contract generation
  - User must modify terms to comply
  - User adjusts terms
  - Continue to step 23

**EF-005: Vendor Declines to Sign Contract**
- At step 39, if vendor declines:
  - Vendor clicks "Decline to Sign"
  - Vendor provides decline reason
  - System notifies procurement manager
  - User reviews decline reason
  - User options:
    - Negotiate with vendor
    - Modify contract and resend
    - Cancel award and award to alternative vendor
  - User selects option and proceeds accordingly
  - End use case or restart with modifications

**EF-006: Contract Value Exceeds Award Amount**
- At step 23, if contract value > award:
  - System displays error: "Contract value ($55K) exceeds awarded amount ($50K)"
  - System requires justification
  - User options:
    - Correct contract value
    - Adjust award amount (requires approval)
    - Add justification for variance
  - User corrects or justifies
  - Continue to step 23

**EF-007: E-Signature Service Unavailable**
- At step 36, if e-signature service fails:
  - System displays error: "E-signature service unavailable"
  - System suggests fallback:
    - Physical signature (see AF-005)
    - Retry later
    - Use alternative e-signature service
  - User selects fallback method
  - Continue with selected method

**EF-008: Contract Generation Timeout**
- At step 28, if generation takes too long:
  - System displays progress indicator
  - System continues processing in background
  - System sends notification when complete
  - User can continue with other work
  - User returns when notified
  - Continue to step 30

#### Business Rules Applied
- BR-RFQ-030: Contract must be generated within 7 days of award acceptance
- BR-RFQ-031: All contracts must use approved templates
- BR-RFQ-032: Contracts >$100K require legal review
- BR-RFQ-033: Contracts >$500K require executive signature
- BR-RFQ-034: Contract terms must align with RFQ and bid terms
- BR-RFQ-035: Contract must be fully executed before delivery/work begins

#### UI Requirements
- Contract generation wizard with progress indicator
- Contract template library with preview
- Auto-population of fields from RFQ/bid
- Side-by-side comparison (RFQ terms vs. contract terms)
- Rich text editor for custom clauses
- Legal clause library with search
- Contract preview with formatting
- Validation checker with highlighting
- E-signature integration (DocuSign, Adobe Sign, etc.)
- Version comparison for contract revisions
- Contract tracking dashboard
- Document repository integration
- Mobile-responsive for vendor contract review
- Export to Word/PDF
- Print-friendly format
- Audit trail of contract changes
- Signature status tracking

---

## 5. Use Case Dependencies

### 5.1 Dependency Matrix

| Use Case | Depends On | Triggers |
|----------|-----------|----------|
| UC-RFQ-001: Create RFQ | Product Catalog, Vendor Directory | UC-RFQ-002 (Invite Vendors) |
| UC-RFQ-002: Invite Vendors | UC-RFQ-001 (RFQ Created) | UC-RFQ-003 (Vendor Submits Bid) |
| UC-RFQ-003: Submit Bid | UC-RFQ-002 (Invitation Sent) | UC-RFQ-004 (Evaluation) |
| UC-RFQ-004: Evaluate Bids | UC-RFQ-003 (Bids Submitted), Bid Closing | UC-RFQ-005 (Award), UC-RFQ-006 (Negotiation) |
| UC-RFQ-005: Award RFQ | UC-RFQ-004 (Evaluation Complete) | UC-RFQ-008 (Contract Generation) |
| UC-RFQ-006: Negotiate Terms | UC-RFQ-004 (Evaluation) | UC-RFQ-005 (Award with Negotiated Terms) |
| UC-RFQ-007: Close RFQ | UC-RFQ-005 (Award Complete), UC-RFQ-008 (Contract Initiated) | Archive, Analytics Update |
| UC-RFQ-008: Generate Contract | UC-RFQ-005 (Award), UC-RFQ-006 (Negotiation Complete) | Contract Signature Workflow |

### 5.2 Workflow Sequence

**Standard RFQ Workflow**:
1. UC-RFQ-001: Create RFQ Campaign
2. UC-RFQ-002: Invite Vendors to RFQ
3. UC-RFQ-003: Submit Bid (Vendor) - Multiple vendors in parallel
4. (System) Bid Closing Date Reached
5. UC-RFQ-004: Evaluate and Compare Bids
6. UC-RFQ-006: Negotiate Bid Terms (Optional, 30-40% of RFQs)
7. UC-RFQ-005: Award RFQ to Vendor
8. UC-RFQ-008: Generate Contract from RFQ
9. (External) Contract Signing
10. UC-RFQ-007: Close RFQ Campaign

**Alternative Workflows**:
- **No Bids Received**: UC-RFQ-001 → UC-RFQ-002 → UC-RFQ-007 (Close as Cancelled)
- **All Bids Rejected**: UC-RFQ-001 → UC-RFQ-002 → UC-RFQ-003 → UC-RFQ-004 → UC-RFQ-007 (Close and Re-issue)
- **Multi-Round Bidding**: UC-RFQ-001 → UC-RFQ-002 → UC-RFQ-003 → UC-RFQ-004 (Round 1) → UC-RFQ-004 (Round 2) → UC-RFQ-005
- **Negotiation Failed**: UC-RFQ-001 → ... → UC-RFQ-006 (No Agreement) → UC-RFQ-005 (Award to Alternative)

---

## 6. Success Metrics

### 6.1 Performance Targets

**RFQ Creation Efficiency**:
- Time to create RFQ: < 2 hours (average)
- RFQ approval time: < 24 hours
- Template usage rate: > 60%

**Vendor Participation**:
- Vendor response rate: > 70%
- Bids per RFQ: > 3 (minimum competitive)
- On-time bid submission rate: > 85%

**Evaluation Efficiency**:
- Time to evaluate bids: < 5 business days
- Evaluator completion rate: 100%
- Evaluation consistency: < 10% score variance between evaluators

**Award Processing**:
- Time from bid closing to award: < 10 business days
- Award approval time: < 48 hours
- Vendor award acceptance rate: > 95%

**Contract Generation**:
- Time from award to contract: < 7 days
- Contract accuracy rate: > 95% (no errors requiring regeneration)
- Contract execution time: < 14 days

**Negotiation Success**:
- Negotiation completion rate: > 80%
- Average savings from negotiation: 5-10%
- Negotiation cycle time: < 7 days

**System Performance**:
- User satisfaction: > 4.0/5.0
- System availability: > 99.5%
- Mobile access rate: > 30%

### 6.2 Business Outcomes

**Cost Savings**:
- Average cost savings per RFQ: 10-15% below budget
- Total annual savings: Tracked and reported

**Process Efficiency**:
- Full RFQ cycle time: < 30 days (from creation to award)
- Reduction in manual effort: > 40% (vs. previous process)

**Quality Metrics**:
- Bid quality score: > 7.5/10 (average)
- Vendor complaint rate: < 5%
- Award dispute rate: < 2%

**Compliance**:
- Policy compliance rate: 100%
- Audit findings: Zero critical findings
- Documentation completeness: 100%

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial use cases document |

---

**End of Use Cases Document**
