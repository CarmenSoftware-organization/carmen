# User Management Module - Cypress Testing Setup

## 1. Project Setup

### 1.1 Installation
```bash
# Install Cypress via npm
npm install cypress --save-dev

# Install additional dependencies
npm install @testing-library/cypress --save-dev
npm install cypress-file-upload --save-dev
npm install @4tw/cypress-drag-drop --save-dev
```

### 1.2 Configuration
```javascript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
    env: {
      apiUrl: 'http://localhost:3000/api',
      adminEmail: 'admin@carmen.com',
      adminPassword: 'test123',
    },
  },
})
```

### 1.3 Folder Structure
```plaintext
cypress/
├── e2e/
│   └── user-management/
│       ├── user-creation.cy.ts
│       ├── role-management.cy.ts
│       ├── user-profile.cy.ts
│       ├── user-deactivation.cy.ts
│       └── permissions.cy.ts
├── fixtures/
│   └── user-management/
│       ├── users.json
│       ├── roles.json
│       └── departments.json
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── utils/
    └── user-management-helpers.ts
```

## 2. Custom Commands

### 2.1 Authentication Commands
```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginAsAdmin(): Chainable<void>
      createUser(userData: UserData): Chainable<void>
      assignRole(userId: string, roleId: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
})

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
})

Cypress.Commands.add('createUser', (userData: UserData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users`,
    body: userData,
  })
})
```

### 2.2 User Management Commands
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('assignRole', (userId: string, roleId: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/${userId}/roles`,
    body: { roleId },
  })
})

Cypress.Commands.add('deactivateUser', (userId: string, reason: string) => {
  cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}/users/${userId}/deactivate`,
    body: { reason },
  })
})
```

## 3. Test Examples

### 3.1 User Creation Test
```typescript
// cypress/e2e/user-management/user-creation.cy.ts
describe('User Creation', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
    cy.visit('/system-administration/user-management')
  })

  it('should create a new user successfully', () => {
    // Click create new user button
    cy.get('[data-cy=create-user-btn]').click()

    // Fill in user details
    cy.get('[data-cy=email-input]').type('test.user@carmen.com')
    cy.get('[data-cy=name-input]').type('Test User')
    cy.get('[data-cy=business-unit-select]').click()
    cy.get('[data-cy=business-unit-option]').contains('F&B Operations').click()
    cy.get('[data-cy=department-select]').click()
    cy.get('[data-cy=department-option]').contains('Kitchen').click()
    cy.get('[data-cy=role-select]').click()
    cy.get('[data-cy=role-option]').contains('Staff').click()

    // Submit form
    cy.get('[data-cy=submit-button]').click()

    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'User created successfully')

    // Verify user in list
    cy.get('[data-cy=users-table]')
      .should('contain', 'test.user@carmen.com')
      .and('contain', 'Test User')
  })

  it('should validate required fields', () => {
    cy.get('[data-cy=create-user-btn]').click()
    cy.get('[data-cy=submit-button]').click()

    // Verify validation messages
    cy.get('[data-cy=email-error]').should('be.visible')
    cy.get('[data-cy=name-error]').should('be.visible')
    cy.get('[data-cy=business-unit-error]').should('be.visible')
    cy.get('[data-cy=department-error]').should('be.visible')
    cy.get('[data-cy=role-error]').should('be.visible')
  })
})
```

### 3.2 Role Management Test
```typescript
// cypress/e2e/user-management/role-management.cy.ts
describe('Role Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
    cy.visit('/system-administration/user-management')
  })

  it('should assign a new role to user', () => {
    // Select user
    cy.get('[data-cy=users-table]')
      .contains('test.user@carmen.com')
      .parent('tr')
      .find('[data-cy=edit-roles-btn]')
      .click()

    // Add new role
    cy.get('[data-cy=add-role-btn]').click()
    cy.get('[data-cy=role-select]').click()
    cy.get('[data-cy=role-option]').contains('Supervisor').click()
    cy.get('[data-cy=save-roles-btn]').click()

    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Roles updated successfully')
  })
})
```

### 3.3 User Deactivation Test
```typescript
// cypress/e2e/user-management/user-deactivation.cy.ts
describe('User Deactivation', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
    cy.visit('/system-administration/user-management')
  })

  it('should deactivate user successfully', () => {
    // Select user and deactivate
    cy.get('[data-cy=users-table]')
      .contains('test.user@carmen.com')
      .parent('tr')
      .find('[data-cy=deactivate-btn]')
      .click()

    // Enter reason
    cy.get('[data-cy=deactivation-reason]')
      .type('User no longer with company')

    // Confirm deactivation
    cy.get('[data-cy=confirm-deactivation-btn]').click()

    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'User deactivated successfully')

    // Verify status change
    cy.get('[data-cy=users-table]')
      .contains('test.user@carmen.com')
      .parent('tr')
      .should('contain', 'Inactive')
  })
})
```

## 4. Test Data Management

### 4.1 User Data Fixture
```json
// cypress/fixtures/user-management/users.json
{
  "validUser": {
    "email": "test.user@carmen.com",
    "name": "Test User",
    "businessUnit": "F&B Operations",
    "department": "Kitchen",
    "role": "Staff"
  },
  "invalidUser": {
    "email": "invalid@email",
    "name": "",
    "businessUnit": "",
    "department": "",
    "role": ""
  }
}
```

### 4.2 Test Data Helper
```typescript
// cypress/utils/user-management-helpers.ts
export const generateTestUser = () => {
  const timestamp = new Date().getTime()
  return {
    email: `test.user.${timestamp}@carmen.com`,
    name: `Test User ${timestamp}`,
    businessUnit: 'F&B Operations',
    department: 'Kitchen',
    role: 'Staff'
  }
}
```

## 5. CI/CD Integration

### 5.1 GitHub Actions Workflow
```yaml
name: Cypress Tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
```

## 6. Best Practices

### 6.1 General Guidelines
- Use data-cy attributes for element selection
- Keep tests independent and atomic
- Clean up test data after each test
- Use custom commands for repetitive actions
- Implement proper error handling
- Use TypeScript for better type safety
- Follow page object pattern for complex pages

### 6.2 Performance Considerations
- Use API calls for setup when possible
- Minimize unnecessary UI interactions
- Use proper waiting strategies
- Batch operations where possible
- Optimize test data management

## 7. Debugging Tips

### 7.1 Common Commands
```bash
# Open Cypress Test Runner
npx cypress open

# Run tests headlessly
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/user-management/user-creation.cy.ts"

# Run tests with Chrome
npx cypress run --browser chrome
```

### 7.2 Debugging Tools
- Use cy.debug() for breakpoints
- Enable Chrome DevTools
- Check Cypress screenshots
- Review video recordings
- Use Cypress Dashboard for CI/CD 