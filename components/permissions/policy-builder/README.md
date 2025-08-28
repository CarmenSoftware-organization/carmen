# ABAC Policy Builder Components

A comprehensive set of React components for building, managing, and testing Attribute-Based Access Control (ABAC) policies in Carmen ERP system.

## Overview

The Policy Builder provides a complete suite of tools for technical support teams to create, test, and manage sophisticated ABAC policies. It follows Carmen ERP's design patterns and integrates seamlessly with the existing permission management system.

## Components

### 1. PolicyBuilderDashboard

**Purpose**: Main dashboard for policy management with overview, search, and quick actions.

**Key Features**:
- Policy list with advanced search and filtering
- Quick actions (Create New, Import, Export)
- Policy status indicators (Active, Draft, Expired)
- Recent activity feed with user actions
- Performance metrics and system health

**Usage**:
```tsx
import { PolicyBuilderDashboard } from '@/components/permissions/policy-builder';

<PolicyBuilderDashboard
  onCreatePolicy={() => navigateToBuilder()}
  onEditPolicy={(id) => openEditor(id)}
  onViewPolicy={(id) => showDetails(id)}
  onDeletePolicy={(id) => confirmDelete(id)}
  onDuplicatePolicy={(id) => duplicatePolicy(id)}
/>
```

### 2. VisualPolicyEditor

**Purpose**: Step-by-step policy creation wizard with real-time validation and preview.

**Key Features**:
- 7-step guided workflow (Basic Info, Subject, Resource, Actions, Environment, Rules, Review)
- Real-time policy validation with error reporting
- Integrated AttributeInspector for condition building
- Policy preview and testing capabilities
- Progress tracking with step completion indicators

**Usage**:
```tsx
import { VisualPolicyEditor } from '@/components/permissions/policy-builder';

<VisualPolicyEditor
  initialPolicy={existingPolicy}
  onSave={(policy) => savePolicy(policy)}
  onCancel={() => exitEditor()}
  onChange={(policy) => updateDraft(policy)}
  readonly={viewOnly}
/>
```

### 3. AttributeInspector

**Purpose**: Browse and select attributes with search, categorization, and detailed information.

**Key Features**:
- Tabbed interface by category (Subject, Resource, Environment, Actions)
- Advanced search with relevance scoring
- Favorites system for frequently used attributes
- Detailed attribute information with examples
- Tag-based grouping and organization

**Usage**:
```tsx
import { AttributeInspector } from '@/components/permissions/policy-builder';

<AttributeInspector
  onAttributeSelect={(attr) => addToCondition(attr)}
  selectedAttributes={currentSelection}
  category="subject"
  showSearch={true}
  showFavorites={true}
/>
```

### 4. RuleConditionBuilder

**Purpose**: Visual editor for complex policy conditions with expression support.

**Key Features**:
- Visual condition tree with drag-and-drop
- Expression editor with syntax highlighting
- Predefined condition templates
- Nested condition groups (AND/OR logic)
- Real-time validation and error reporting

**Usage**:
```tsx
import { RuleConditionBuilder } from '@/components/permissions/policy-builder';

<RuleConditionBuilder
  initialConditions={existingConditions}
  availableAttributes={attributesList}
  onChange={(conditions) => updateConditions(conditions)}
  onValidationChange={(validation) => updateValidation(validation)}
  showTemplates={true}
  allowNesting={true}
  maxDepth={3}
/>
```

### 5. PolicyTester

**Purpose**: Real-time policy testing with mock requests and performance analysis.

**Key Features**:
- Single and batch policy testing
- Mock request builder with user/resource selection
- Policy evaluation trace with step-by-step breakdown
- Performance metrics and optimization suggestions
- Test scenario management

**Usage**:
```tsx
import { PolicyTester } from '@/components/permissions/policy-builder';

<PolicyTester
  policies={activePolicies}
  onTestComplete={(result) => analyzeResult(result)}
  showPerformanceMetrics={true}
  enableBatchTesting={true}
/>
```

## Architecture

### Type System

The components use a comprehensive TypeScript type system defined in:
- `lib/types/policy-builder.ts` - UI-specific types and interfaces
- `lib/types/permissions.ts` - Core ABAC types
- `lib/mock-data/policy-builder-attributes.ts` - Attribute definitions

### Design Patterns

**Consistent with Carmen ERP**:
- Uses existing Shadcn/ui component library
- Follows established card-based layouts
- Implements standard form patterns with React Hook Form + Zod
- Uses Tailwind CSS for styling consistency

**Accessibility**:
- WCAG 2.1 AA compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

**Error Handling**:
- Comprehensive validation with user-friendly messages
- Progressive disclosure of errors and warnings
- Recovery guidance and suggestions
- Graceful degradation when services unavailable

### State Management

**Local State**: Each component manages its own UI state with React hooks
**Validation**: Real-time validation with immediate user feedback
**Integration**: Components communicate through well-defined callback interfaces

## Data Model

### Attribute Categories

1. **Subject Attributes** (Who)
   - Identity: userId, username, email
   - Roles: role, roles, permissions
   - Organization: department, location, manager
   - Employment: employeeType, seniority, clearanceLevel
   - Financial: approvalLimit, budgetAccess
   - Status: accountStatus, onDuty, sessionInfo

2. **Resource Attributes** (What)
   - Identity: resourceId, resourceType, resourceName
   - Ownership: owner, ownerDepartment, dataClassification
   - Business: documentStatus, workflowStage, priority
   - Financial: totalValue, budgetCategory, costCenter
   - Temporal: createdAt, updatedAt, expiresAt
   - Compliance: requiresAudit, regulatoryFlags

3. **Environment Attributes** (When/Where)
   - Temporal: currentTime, dayOfWeek, businessHours
   - Location: requestIP, isInternalNetwork, facility
   - Device: deviceType, authenticationMethod, sessionAge
   - System: systemLoad, maintenanceMode, threatLevel

4. **Actions** (How)
   - CRUD: create, read, update, delete
   - Approval: approve, reject, submit_for_approval
   - Domain-specific: place_order, adjust_stock, process_payment

### Policy Structure

```typescript
interface PolicyBuilderState {
  // Basic Information
  name: string;
  description: string;
  priority: number; // 0-1000
  enabled: boolean;
  effect: EffectType; // PERMIT | DENY
  
  // Conditions
  subjectConditions: AttributeCondition[];
  resourceConditions: AttributeCondition[];
  actionConditions: string[];
  environmentConditions: AttributeCondition[];
  
  // Advanced
  rules: Rule[];
  testScenarios: PolicyTestScenario[];
  
  // Metadata
  version: string;
  category?: string;
  tags?: string[];
  effectiveFrom?: Date;
  effectiveTo?: Date;
}
```

## Integration

### Existing Carmen ERP Integration

The components integrate with existing Carmen ERP systems:

1. **Enhanced Permission Service**: For policy evaluation and caching
2. **Attribute Resolver**: For real-time attribute value resolution
3. **User Management**: For subject attribute lookup
4. **Resource Management**: For resource attribute discovery
5. **Audit System**: For policy change tracking

### Navigation Integration

```tsx
// In existing policy management page
const handleCreatePolicy = () => {
  window.location.href = '/system-administration/permission-management/policies/builder';
};

const handleEditPolicy = (policyId: string) => {
  window.location.href = `/system-administration/permission-management/policies/builder?edit=${policyId}`;
};
```

## Performance Considerations

### Optimization Strategies

1. **Component Lazy Loading**: Large components load on-demand
2. **Virtual Scrolling**: For large attribute lists and policy results
3. **Debounced Search**: Prevents excessive API calls during typing
4. **Memoization**: Expensive calculations cached with useMemo/useCallback
5. **Progressive Enhancement**: Core functionality works without JavaScript

### Caching Strategy

1. **Attribute Definitions**: Cached locally for session duration
2. **Policy Validation**: Results cached to avoid re-computation
3. **Test Results**: Recent test executions stored for comparison
4. **User Preferences**: Favorites and settings persisted locally

## Testing Strategy

### Unit Tests
- Component rendering and interaction
- State management and validation logic
- Utility functions and type guards

### Integration Tests
- Component communication and data flow
- Form submission and validation
- Error handling and recovery

### E2E Tests
- Complete policy creation workflow
- Policy testing and validation scenarios
- Cross-browser compatibility

## Future Enhancements

### Planned Features

1. **Drag-and-Drop Policy Builder**: Visual policy graph editor
2. **Policy Templates**: Industry-standard policy templates
3. **Bulk Operations**: Import/export multiple policies
4. **Advanced Analytics**: Policy usage and performance analytics
5. **Collaborative Editing**: Multi-user policy editing with conflicts resolution

### Performance Improvements

1. **Real-time Collaboration**: WebSocket integration for live updates
2. **Advanced Caching**: Redis-based caching for improved performance
3. **Background Processing**: Async policy validation and testing
4. **Mobile Optimization**: Enhanced mobile experience

## Troubleshooting

### Common Issues

1. **Slow Performance**: Check for large attribute lists, enable virtual scrolling
2. **Validation Errors**: Ensure all required fields completed, check attribute compatibility
3. **Test Failures**: Verify mock data consistency, check policy logic
4. **UI Responsiveness**: Check browser compatibility, enable fallback modes

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'policy-builder:*');
```

## Contributing

### Code Style
- Follow existing Carmen ERP TypeScript conventions
- Use functional components with hooks
- Implement proper error boundaries
- Include comprehensive JSDoc comments

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Address review feedback

## License

This code is part of the Carmen ERP system and follows the same licensing terms as the main project.