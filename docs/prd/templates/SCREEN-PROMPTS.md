# Source Code Documentation Prompt

  Create a comprehensive Product Requirements Document (PRD) for [PAGE/COMPONENT NAME] based strictly on actual source code
  implementation. Follow these guidelines:

  ## CRITICAL REQUIREMENTS:
  1. **Source Code First**: Document ONLY what exists in the actual source code - never add fictional features
  2. **Descriptive Text Only**: Use clear business language, NO code snippets, component names, or technical field references
  3. **User-Focused**: Describe what users see and do, not how it's technically implemented
  4. **Role-Based**: Organize functionality by user permissions and capabilities
  5. **Complete Accuracy**: Every feature must be verifiable in the source code

  ## DOCUMENT STRUCTURE:

  ### Header Section (Required):
  ```yaml
  Title: [Page Name] Screen Specification
  Module: [Module Name]
  Function: [Function Name]
  Screen: [Specific Screen]
  Version: 1.0
  Date: [Current Date]
  Status: Based on Actual Source Code Analysis

  Implementation Overview (Required):

  - Purpose: What this screen/page accomplishes
  - File Locations: Main component files (for reference only)
  - User Types: Who can access this functionality
  - Current Status: Implementation completeness level

  Content Sections (Adapt as needed):

  Layout & Navigation:

  - Header/Title Area: What users see at the top, navigation elements
  - Action Buttons: What buttons exist, what they do, when they're visible
  - Layout Structure: How content is organized (cards, tabs, columns, etc.)

  Data Display:

  - Information Fields: What data is shown, how it's formatted, edit capabilities
  - Tables/Lists: Column structure, sorting, filtering, pagination
  - Status Indicators: Badges, progress indicators, workflow states

  User Interactions:

  - Form Elements: Input types, dropdowns, date pickers, validation
  - Bulk Operations: Multi-select actions, batch processing
  - Modal Dialogs: Pop-ups, confirmation dialogs, detailed views

  Role-Based Functionality:

  - [Role 1] Permissions: What this user type can view/edit/do
  - [Role 2] Permissions: Different capabilities for this role
  - [Role 3] Permissions: Additional role-specific features

  Business Rules & Validation:

  - Field Requirements: Mandatory vs optional fields
  - Validation Rules: What triggers errors or warnings
  - Workflow Logic: How status changes, approval flows

  Current Limitations:

  - Placeholder Features: What only console.logs or shows mock data
  - Missing Integration: Backend connections not yet implemented
  - Known Issues: Documented gaps or temporary implementations

  WRITING STYLE:

  DO:

  - ✅ Use business language: "Select vendor from dropdown" not "<Select> component"
  - ✅ Describe user actions: "Click to expand details" not "handleToggleExpand()"
  - ✅ Explain purposes: "Status badge shows approval state" not "<StatusBadge status={item.status}>"
  - ✅ Organize by user journey: What users see → What they can do → What happens next
  - ✅ Include visual descriptions: "Color-coded badges", "Expandable rows", "Two-column layout"

  DON'T:

  - ❌ Include code snippets or component names
  - ❌ Reference technical field names (use "Product Name" not "item.name")
  - ❌ Show implementation details or handlers
  - ❌ Add features that don't exist in source code
  - ❌ Use developer terminology

  VERIFICATION CHECKLIST:

  Before finalizing, ensure:
  - Every feature described exists in the actual source code
  - No code snippets or technical references included
  - All user roles and permissions documented
  - Current limitations honestly stated
  - Document reads like business requirements, not technical specs
  - Someone without coding knowledge could understand the functionality

  EXAMPLE TRANSFORMATIONS:

  Instead of: "<Button onClick={handleSubmit}> with validation"
  Write: "Save button with form validation that prevents submission if required fields are empty"

  Instead of: "formData.status === 'Approved' shows green badge"
  Write: "Approved items display with green status badge"

  Instead of: "useEffect updates localItems state"
  Write: "Item changes are immediately reflected in the display"

  This approach ensures documentation that accurately reflects the current implementation while being accessible to all
  stakeholders.

  This prompt will help create consistent, accurate, and user-friendly documentation for any page or component in the system
  while maintaining the same quality and approach used for the PR Detail Screen specification.