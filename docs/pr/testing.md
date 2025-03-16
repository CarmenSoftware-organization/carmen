# Purchase Request Module - Testing Documentation

This document outlines the testing strategy, procedures, and test cases for the Purchase Request (PR) module. It serves as a guide for developers, QA engineers, and stakeholders to ensure the module meets quality standards and business requirements.

## 1. Testing Strategy

### 1.1 Testing Levels

The PR module testing is structured into the following levels:

1. **Unit Testing**: Testing individual components in isolation
2. **Integration Testing**: Testing interactions between components
3. **End-to-End Testing**: Testing complete user flows
4. **Performance Testing**: Testing system performance under load
5. **Security Testing**: Testing for vulnerabilities and access control

### 1.2 Testing Environments

| Environment | Purpose | Database | URL |
|-------------|---------|----------|-----|
| Development | Developer testing | dev_db | https://dev.example.com |
| QA | Quality assurance | qa_db | https://qa.example.com |
| Staging | Pre-production validation | staging_db | https://staging.example.com |
| Production | Live environment | prod_db | https://app.example.com |

### 1.3 Testing Tools

- **Unit Testing**: Jest, React Testing Library
- **Integration Testing**: Cypress, Supertest
- **End-to-End Testing**: Playwright
- **Performance Testing**: k6, Lighthouse
- **Security Testing**: OWASP ZAP, SonarQube

## 2. Unit Testing

### 2.1 Component Tests

| Component | Test File | Description |
|-----------|-----------|-------------|
| PurchaseRequestList | `purchase-request-list.test.tsx` | Tests the PR list component rendering and filtering |
| PRDetailPage | `PRDetailPage.test.tsx` | Tests the PR detail page component |
| PRForm | `PRForm.test.tsx` | Tests the PR form component |
| ItemsTab | `ItemsTab.test.tsx` | Tests the items tab component |
| ItemDetailsEditForm | `item-details-edit-form.test.tsx` | Tests the item details edit form |

### 2.2 Utility Function Tests

| Function | Test File | Description |
|----------|-----------|-------------|
| calculateSubTotal | `utils.test.tsx` | Tests subtotal calculation |
| calculateDiscount | `utils.test.tsx` | Tests discount calculation |
| calculateTax | `utils.test.tsx` | Tests tax calculation |
| calculateTotal | `utils.test.tsx` | Tests total calculation |
| getBadgeVariant | `utils.test.tsx` | Tests badge variant selection |
| handleDocumentAction | `utils.test.tsx` | Tests document action handling |

### 2.3 Sample Unit Test

```typescript
// utils.test.tsx
import { calculateSubTotal, calculateTotal } from './utils';

describe('PR Calculation Functions', () => {
  const mockPR = {
    items: [
      { subTotalPrice: 100, discountAmount: 10, taxAmount: 7 },
      { subTotalPrice: 200, discountAmount: 20, taxAmount: 14 }
    ]
  };

  test('calculateSubTotal returns correct sum', () => {
    expect(calculateSubTotal(mockPR)).toBe(300);
  });

  test('calculateTotal returns correct total', () => {
    expect(calculateTotal(mockPR)).toBe(291); // 300 - 30 + 21
  });

  test('handles empty items array', () => {
    expect(calculateSubTotal({ items: [] })).toBe(0);
    expect(calculateTotal({ items: [] })).toBe(0);
  });

  test('handles undefined items', () => {
    expect(calculateSubTotal({ items: undefined })).toBe(0);
    expect(calculateTotal({ items: undefined })).toBe(0);
  });
});
```

## 3. Integration Testing

### 3.1 API Integration Tests

| API Endpoint | Test File | Description |
|--------------|-----------|-------------|
| GET /api/purchase-requests | `pr-api.test.ts` | Tests retrieving PR list |
| GET /api/purchase-requests/:id | `pr-api.test.ts` | Tests retrieving PR by ID |
| POST /api/purchase-requests | `pr-api.test.ts` | Tests creating a new PR |
| PUT /api/purchase-requests/:id | `pr-api.test.ts` | Tests updating a PR |
| DELETE /api/purchase-requests/:id | `pr-api.test.ts` | Tests deleting a PR |
| POST /api/purchase-requests/:id/submit | `pr-workflow.test.ts` | Tests submitting a PR |
| POST /api/purchase-requests/:id/workflow/action | `pr-workflow.test.ts` | Tests workflow actions |

### 3.2 Component Integration Tests

| Integration | Test File | Description |
|-------------|-----------|-------------|
| PR List + Filtering | `pr-list-integration.test.tsx` | Tests PR list with filtering |
| PR Form + Item Addition | `pr-form-integration.test.tsx` | Tests PR form with item addition |
| PR Detail + Tabs | `pr-detail-integration.test.tsx` | Tests PR detail with tab navigation |
| Workflow + Notifications | `workflow-integration.test.ts` | Tests workflow with notifications |

### 3.3 Sample Integration Test

```typescript
// pr-api.test.ts
import { createPR, getPRById, updatePR } from '../api/purchase-requests';

describe('PR API Integration', () => {
  let createdPRId: string;

  test('creates a new PR', async () => {
    const newPR = {
      type: 'GeneralPurchase',
      description: 'Test PR',
      deliveryDate: new Date('2024-04-01'),
      department: 'IT',
      location: 'HQ',
      jobCode: 'IT-2024-Q1',
      currency: 'THB',
      items: [
        {
          location: 'HQ',
          name: 'Test Item',
          description: 'Test Description',
          unit: 'Units',
          quantityRequested: 2,
          price: 100,
          deliveryDate: new Date('2024-04-01'),
          deliveryPoint: 'IT Department',
          itemCategory: 'Hardware',
          itemSubcategory: 'Misc'
        }
      ]
    };

    const result = await createPR(newPR);
    expect(result).toHaveProperty('id');
    expect(result.description).toBe('Test PR');
    createdPRId = result.id;
  });

  test('retrieves a PR by ID', async () => {
    const pr = await getPRById(createdPRId);
    expect(pr).toHaveProperty('id', createdPRId);
    expect(pr).toHaveProperty('items');
    expect(pr.items).toHaveLength(1);
  });

  test('updates a PR', async () => {
    const updates = {
      description: 'Updated Test PR',
      deliveryDate: new Date('2024-04-15')
    };

    const result = await updatePR(createdPRId, updates);
    expect(result.description).toBe('Updated Test PR');
    expect(new Date(result.deliveryDate)).toEqual(new Date('2024-04-15'));
  });
});
```

## 4. End-to-End Testing

### 4.1 User Flow Test Cases

| Test Case | Test File | Description |
|-----------|-----------|-------------|
| Create PR | `create-pr.spec.ts` | Tests complete PR creation flow |
| Edit PR | `edit-pr.spec.ts` | Tests PR editing flow |
| Submit PR | `submit-pr.spec.ts` | Tests PR submission flow |
| Approve PR | `approve-pr.spec.ts` | Tests PR approval flow |
| Reject PR | `reject-pr.spec.ts` | Tests PR rejection flow |
| Add Items | `add-items.spec.ts` | Tests adding items to PR |
| Use Template | `use-template.spec.ts` | Tests creating PR from template |

### 4.2 Sample E2E Test

```typescript
// create-pr.spec.ts
import { test, expect } from '@playwright/test';

test('Create a new purchase request', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to PR module
  await page.click('text=Procurement');
  await page.click('text=Purchase Requests');
  
  // Create new PR
  await page.click('button:has-text("New Request")');
  
  // Fill PR form
  await page.fill('[name="description"]', 'E2E Test PR');
  await page.selectOption('[name="type"]', 'GeneralPurchase');
  await page.fill('[name="deliveryDate"]', '2024-04-01');
  await page.selectOption('[name="department"]', 'IT');
  await page.selectOption('[name="location"]', 'HQ');
  await page.fill('[name="jobCode"]', 'IT-2024-Q1');
  
  // Add item
  await page.click('button:has-text("Add Item")');
  await page.fill('[name="name"]', 'Test Item');
  await page.fill('[name="description"]', 'Test Description');
  await page.fill('[name="unit"]', 'Units');
  await page.fill('[name="quantityRequested"]', '2');
  await page.fill('[name="price"]', '100');
  await page.click('button:has-text("Save")');
  
  // Submit PR
  await page.click('button:has-text("Submit")');
  
  // Verify success
  await expect(page.locator('.toast-success')).toBeVisible();
  await expect(page.locator('.toast-success')).toContainText('Purchase request created successfully');
  
  // Verify PR in list
  await page.click('text=Purchase Requests');
  await expect(page.locator('text=E2E Test PR')).toBeVisible();
});
```

## 5. Performance Testing

### 5.1 Load Testing Scenarios

| Scenario | Test File | Description |
|----------|-----------|-------------|
| PR List Loading | `pr-list-load.js` | Tests PR list loading with 1000+ records |
| PR Creation | `pr-creation-load.js` | Tests creating multiple PRs simultaneously |
| PR Approval | `pr-approval-load.js` | Tests approving multiple PRs simultaneously |
| Search and Filter | `pr-search-load.js` | Tests search and filter performance |

### 5.2 Performance Benchmarks

| Operation | Target Response Time | Max Load | Success Criteria |
|-----------|----------------------|----------|------------------|
| PR List Loading | < 2 seconds | 100 concurrent users | 95% under target |
| PR Creation | < 3 seconds | 50 concurrent users | 95% under target |
| PR Detail Loading | < 1.5 seconds | 100 concurrent users | 95% under target |
| PR Submission | < 2 seconds | 50 concurrent users | 95% under target |

### 5.3 Sample Performance Test

```javascript
// pr-list-load.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
  },
};

export default function() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  };

  // Test PR list loading
  const response = http.get('https://api.example.com/purchase-requests', params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'contains data array': (r) => JSON.parse(r.body).data !== undefined,
  });
  
  sleep(1);
}
```

## 6. Security Testing

### 6.1 Access Control Tests

| Test Case | Description |
|-----------|-------------|
| Unauthorized Access | Verify unauthorized users cannot access PR data |
| Role-Based Access | Verify users can only access PRs based on their role |
| Department Restrictions | Verify users can only access PRs from their department |
| Workflow Permissions | Verify only authorized users can perform workflow actions |

### 6.2 Data Validation Tests

| Test Case | Description |
|-----------|-------------|
| Input Validation | Verify all inputs are properly validated |
| SQL Injection | Test for SQL injection vulnerabilities |
| XSS Prevention | Test for cross-site scripting vulnerabilities |
| CSRF Protection | Test for cross-site request forgery vulnerabilities |

### 6.3 API Security Tests

| Test Case | Description |
|-----------|-------------|
| Authentication | Verify all API endpoints require authentication |
| Authorization | Verify API endpoints enforce proper authorization |
| Rate Limiting | Verify API endpoints implement rate limiting |
| Data Encryption | Verify sensitive data is encrypted in transit |

## 7. Test Automation

### 7.1 CI/CD Integration

The PR module tests are integrated into the CI/CD pipeline:

1. **Pull Request**: Unit and integration tests run automatically
2. **Merge to Development**: E2E tests run automatically
3. **Promotion to Staging**: Performance tests run automatically
4. **Promotion to Production**: Smoke tests run automatically

### 7.2 Test Data Management

- Test data is generated using factories and fixtures
- Database is reset before each test run
- Sensitive data is masked in test environments
- Test data is isolated between test runs

### 7.3 Test Reporting

- Test results are published to the test dashboard
- Failed tests trigger notifications
- Test coverage reports are generated
- Performance test results are tracked over time

## 8. Troubleshooting Guide

### 8.1 Common Test Failures

| Failure | Possible Cause | Resolution |
|---------|----------------|------------|
| PR creation fails | Invalid data format | Check request payload format |
| Workflow test fails | Missing role assignment | Assign required roles to test user |
| Performance test fails | Database indexing issue | Review and optimize database indexes |
| E2E test fails | UI element changed | Update selectors in test |

### 8.2 Test Environment Issues

| Issue | Resolution |
|-------|------------|
| Test database connection fails | Check database credentials and network |
| Test user cannot login | Reset test user password |
| API returns 500 errors | Check server logs for exceptions |
| Tests timeout | Increase timeout settings or optimize code |

## 9. Appendices

### 9.1 Test Data Examples

```json
{
  "validPR": {
    "type": "GeneralPurchase",
    "description": "Test PR",
    "deliveryDate": "2024-04-01T00:00:00Z",
    "department": "IT",
    "location": "HQ",
    "jobCode": "IT-2024-Q1",
    "currency": "THB",
    "items": [
      {
        "location": "HQ",
        "name": "Test Item",
        "description": "Test Description",
        "unit": "Units",
        "quantityRequested": 2,
        "price": 100,
        "deliveryDate": "2024-04-01T00:00:00Z",
        "deliveryPoint": "IT Department",
        "itemCategory": "Hardware",
        "itemSubcategory": "Misc"
      }
    ]
  },
  "invalidPR": {
    "type": "InvalidType",
    "description": "",
    "deliveryDate": "2023-01-01T00:00:00Z",
    "department": "",
    "location": "",
    "jobCode": "",
    "currency": "INVALID",
    "items": []
  }
}
```

### 9.2 Test User Accounts

| Username | Password | Role | Department |
|----------|----------|------|------------|
| requester@example.com | password | Requester | IT |
| approver@example.com | password | Department Head | IT |
| finance@example.com | password | Finance Manager | Finance |
| admin@example.com | password | Administrator | System |

## 10. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Development Lead | | | |
| Product Owner | | | |
| Security Officer | | | | 