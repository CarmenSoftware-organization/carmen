# Carmen ERP Permission Management - E2E Test Suite

A comprehensive end-to-end test suite for the Carmen ERP Permission Management system using Puppeteer with Page Object Model architecture and parallel execution capabilities.

## 🚀 Quick Start

### Prerequisites

```bash
# System Requirements
Node.js v18+ 
16GB RAM (32GB recommended for full parallel execution)
100GB+ SSD storage
Stable broadband connection

# Verify Node.js version
node --version
```

### Installation

```bash
# Navigate to test directory
cd tests/e2e/permission-management

# Install dependencies
npm install

# Set up browsers
npm run setup
npm run setup:deps

# Validate environment
npm run validate
```

### Basic Usage

```bash
# Run complete test suite
npm run test:permission-management

# Run specific test categories
npm run test:toggle          # RBAC/ABAC toggle tests
npm run test:policy          # Policy management tests
npm run test:performance     # Performance benchmarks

# Run with different browsers
npm run test:chrome          # Chrome only
npm run test:firefox         # Firefox only
npm run test:safari          # Safari only
npm run test:mobile          # Mobile Chrome

# Run in different modes
npm run test:headed          # With browser UI
npm run test:debug           # Debug mode
npm run test:ci              # CI/CD mode

# View test reports
npm run report               # Open HTML report
npm run report:json          # View JSON results
```

## 📋 Test Architecture

### Page Object Model Structure

```
tests/e2e/permission-management/
├── config/
│   ├── test.config.ts           # Test configuration and selectors
│   ├── browser.config.ts        # Browser pool configuration
│   └── performance.config.ts    # Performance thresholds
├── page-objects/
│   ├── base/
│   │   ├── BasePage.ts          # Base page functionality
│   │   ├── BaseModal.ts         # Modal interactions
│   │   └── BaseTable.ts         # Table operations
│   ├── pages/
│   │   └── PermissionManagementPage.ts
│   ├── components/
│   │   ├── ToggleComponent.ts   # RBAC/ABAC toggle
│   │   └── PolicyListComponent.ts
│   └── modals/
├── specs/
│   ├── toggle.test.ts           # Toggle functionality tests
│   ├── policy-management.test.ts
│   └── integration.test.ts
├── utilities/
│   ├── TestDataFactory.ts      # Test data generation
│   ├── ParallelCoordinator.ts   # Parallel execution
│   └── PerformanceMonitor.ts    # Performance tracking
├── fixtures/                   # Test data fixtures
├── reports/                    # Generated test reports
└── runner/                     # Test execution scripts
```

### Test Categories

#### 1. Toggle Functionality Tests (`test:toggle`)
- **RBAC ↔ ABAC switching**: Response time validation (<500ms)
- **Migration handling**: Progress monitoring and error recovery
- **Accessibility**: Keyboard navigation and screen reader compatibility
- **Responsive design**: Functionality across all viewport sizes
- **Performance stress**: Repeated switching under load

#### 2. Policy Management Tests (`test:policy`)
- **Simple Creator workflow**: 3-step policy creation process
- **Policy list operations**: Search, filter, sort, pagination
- **CRUD operations**: Create, read, update, delete policies
- **Bulk operations**: Multi-select and batch actions
- **Data validation**: Form validation and error handling

#### 3. Integration Tests
- **Cross-module consistency**: Toggle state preservation during policy operations
- **Cross-browser compatibility**: Chrome, Firefox, Safari, Edge
- **User journey flows**: Complete end-to-end workflows
- **Data persistence**: State management across sessions

#### 4. Performance Tests (`test:performance`)
- **Page load benchmarks**: <3s on 3G, <1s on WiFi
- **Search performance**: <1s response time for search results
- **Memory monitoring**: Memory leak detection during extended usage
- **Concurrent user simulation**: Multi-user scenario testing

## 🔧 Configuration

### Environment Variables

```bash
# Application settings
BASE_URL=http://localhost:3004
NODE_ENV=test

# Browser settings
DEBUG=false                    # Show browser UI
HEADLESS=true                 # Headless mode
SLOW_MO=0                     # Slow motion delay

# Performance settings
PARALLEL_WORKERS=4            # Parallel test workers
MAX_RETRIES=2                 # Test retry attempts
TEST_TIMEOUT=30000            # Test timeout (ms)

# Reporting settings
SCREENSHOT_MODE=failure       # always|failure|never
VIDEO_MODE=retain-on-failure  # on-first-retry|retain-on-failure|off
GENERATE_TRACE=true           # Generate trace files
```

### Browser Pool Configuration

```typescript
// config/browser.config.ts
export const browserPoolConfig = {
  'chrome-desktop-1': {
    browsers: ['chromium'],
    maxInstances: 2,
    viewport: { width: 1368, height: 720 }
  },
  // ... additional pools
};
```

### Performance Benchmarks

```typescript
// config/test.config.ts
export const performanceBenchmarks = {
  pageLoadBenchmark: 3000,        // Page load time (ms)
  toggleResponseBenchmark: 500,   // Toggle response time (ms)
  searchResultsBenchmark: 1000,   // Search response time (ms)
  memoryThreshold: 500,           // Memory usage limit (MB)
  cpuThreshold: 80                // CPU usage limit (%)
};
```

## 📊 Parallel Execution Strategy

### Multi-Dimensional Parallelization

```
Phase 1: Independent Module Tests (Parallel - 15 minutes)
├── Toggle Tests (Chrome 1-2) → 8 min
├── Policy Tests (Chrome 3-4, Firefox 1) → 15 min  
├── Navigation Tests (Firefox 2, Safari 1) → 12 min
└── UI Tests (Safari 2, Edge 1-2) → 6 min

Phase 2: Integration Testing (Parallel - 18 minutes)
├── Cross-module Integration → 10 min
├── User Journey E2E → 18 min
├── Permission Inheritance → 12 min
└── Data Persistence → 8 min

Phase 3: Performance Testing (Sequential - 35 minutes)
├── Load Testing → 20 min
└── Stress Testing → 15 min

Total Time: 68 minutes (vs 210 minutes sequential)
Efficiency Gain: 68% time reduction
```

### Resource Allocation

```bash
# Browser instances: 14 parallel browsers across 4 types
# Memory usage: ~24GB peak (4GB per major browser instance)
# CPU utilization: 12-14 cores during peak testing
# Network: Stable broadband connection required
```

## 🎯 Test Execution Examples

### Complete Test Suite

```bash
# Full parallel execution with all browsers
npm run test:permission-management

# Custom parallel execution
npx ts-node runner/execute-tests.ts \
  --suite=permission-management-complete \
  --parallel=true \
  --output=html \
  --verbose
```

### Targeted Testing

```bash
# Toggle functionality only
npm run test:toggle

# Policy management workflows
npm run test:policy

# Performance benchmarks
npm run test:performance

# Responsive design validation
npm run test:responsive

# Accessibility compliance
npm run test:accessibility
```

### Cross-Browser Testing

```bash
# Individual browsers
npm run test:chrome
npm run test:firefox  
npm run test:safari

# Mobile devices
npm run test:mobile

# All browsers in parallel
npm test -- --project=chromium --project=firefox --project=webkit
```

### CI/CD Integration

```bash
# Optimized for CI environments
npm run test:ci

# GitHub Actions integration
npm test -- --reporter=github --reporter=html
```

## 📈 Performance Monitoring

### Real-Time Monitoring

```bash
# Monitor system resources during test execution
npm run monitor

# System performance benchmark
npm run benchmark

# Memory usage analysis
npm run analyze:memory
```

### Performance Metrics

| Metric | Target | Good | Acceptable | Poor |
|--------|---------|------|------------|------|
| Page Load Time | <3s | <2s | 2-4s | >4s |
| Toggle Response | <500ms | <300ms | 300-800ms | >800ms |
| Search Results | <1s | <500ms | 500ms-1.5s | >1.5s |
| Memory Usage | <500MB | <300MB | 300-500MB | >500MB |
| CPU Usage | <80% | <50% | 50-80% | >80% |

## 🔍 Debugging and Troubleshooting

### Debug Mode

```bash
# Run tests with browser UI visible
npm run test:headed

# Run with Playwright debugger
npm run test:debug

# Run specific test with verbose output
npx playwright test toggle.test.ts --headed --debug
```

### Common Issues

#### Browser Pool Exhaustion
```bash
# Reduce parallel workers
export PARALLEL_WORKERS=2

# Increase timeout
export TEST_TIMEOUT=60000
```

#### Memory Limitations
```bash
# Monitor memory usage
npm run monitor

# Reduce concurrent browser instances
export MAX_INSTANCES=1
```

#### Network Timeouts
```bash
# Increase navigation timeout
export NAVIGATION_TIMEOUT=60000

# Test with slower network
npm test -- --slow-mo=1000
```

### Log Analysis

```bash
# View test execution logs
tail -f test-results/test-execution.log

# Analyze performance logs
grep "Performance" test-results/*.log

# Check error patterns
grep "ERROR" test-results/*.log | head -20
```

## 📋 Test Data Management

### Test Data Factory

```typescript
import { TestDataFactory } from './utilities/TestDataFactory';

// Generate test users
const testUser = TestDataFactory.generateUser('department-manager');

// Generate test policies
const testPolicy = TestDataFactory.generatePolicy('moderate');

// Generate test scenarios
const scenario = TestDataFactory.generateTestScenario('policy-creation');
```

### Mock Data Fixtures

```typescript
// fixtures/users.json
{
  "superAdmin": {
    "email": "super.admin@carmen.test",
    "role": "super-admin",
    "permissions": ["*"]
  }
}
```

## 🚨 Error Handling & Recovery

### Automatic Retry Logic

```typescript
// Automatic retry on failure with exponential backoff
const maxRetries = 3;
const retryDelay = [1000, 2000, 4000]; // Progressive delay

// Network error recovery
await page.route('**/*', route => {
  if (route.request().resourceType() === 'fetch') {
    // Retry logic for API calls
  }
});
```

### Error Screenshots & Videos

```bash
# Failure artifacts automatically generated
reports/
├── screenshots/
│   ├── toggle-rbac-switch-failure-2024-01-15.png
│   └── policy-search-error-2024-01-15.png
└── videos/
    ├── toggle-test-failure.webm
    └── policy-management-error.webm
```

## 📊 Reporting

### HTML Reports

```bash
# Generate and open HTML report
npm run report

# Custom HTML report with detailed metrics
npx playwright show-report --port=9323
```

### JSON Reports

```bash
# View JSON results
npm run report:json

# Extract specific metrics
cat reports/json/results.json | jq '.summary'
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
- name: Run E2E Tests
  run: npm run test:ci
  
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: reports/
```

## 🤝 Contributing

### Adding New Tests

1. **Create test specification**: Add to `specs/` directory
2. **Update page objects**: Extend existing or create new page objects
3. **Add test data**: Update `TestDataFactory` with new generators
4. **Update configuration**: Add new test categories to configs
5. **Document changes**: Update README and inline documentation

### Test Naming Conventions

```typescript
// Test file: feature-name.test.ts
// Test describe: 'Feature Name Functionality'
// Test case: 'should perform specific action under conditions'

describe('Policy Management Functionality', () => {
  test('should create policy via simple creator with validation', async () => {
    // Test implementation
  });
});
```

### Code Quality Standards

- **TypeScript**: Strict mode enabled, full type coverage
- **ESLint**: Consistent code formatting and standards  
- **Page Object Model**: All UI interactions through page objects
- **Error Handling**: Comprehensive try-catch with meaningful errors
- **Documentation**: JSDoc comments for all public methods
- **Testing**: Test the tests with validation scenarios

## 📞 Support

### Getting Help

- **Documentation**: Refer to inline code documentation
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Wiki**: Comprehensive guides and examples

### Maintenance

```bash
# Update dependencies
npm update

# Update browsers
npm run setup

# Clean old reports
npm run clean

# Validate environment
npm run validate
```

---

**Happy Testing! 🧪**

This comprehensive E2E test suite ensures the Carmen ERP Permission Management system works flawlessly across all supported browsers, devices, and user scenarios. The parallel execution architecture provides fast feedback while maintaining thorough coverage and reliability.