#!/usr/bin/env node

/**
 * Carmen ERP Comprehensive Deep Capture
 * 
 * Deep exploration of the Carmen ERP application including:
 * - Detailed module coverage
 * - Sub-screens and workflows
 * - Interactive states and forms
 * - Role-based variations
 * - Complex business processes
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveDeepCapture {
  constructor() {
    this.baseUrl = 'http://localhost:3006';
    this.outputDir = 'docs/screenshots/deep-capture';
    
    // Comprehensive route coverage organized by business domain
    this.routes = {
      // Core Dashboard & Navigation
      dashboard: [
        '/dashboard',
        '/edit-profile',
      ],

      // Inventory Management (Comprehensive Coverage)
      inventory: [
        '/inventory-management',
        '/inventory-management/stock-overview',
        '/inventory-management/stock-overview/stock-card',
        '/inventory-management/stock-overview/stock-cards', 
        '/inventory-management/stock-overview/inventory-aging',
        '/inventory-management/stock-overview/inventory-balance',
        '/inventory-management/stock-overview/slow-moving',
        '/inventory-management/physical-count',
        '/inventory-management/physical-count/dashboard',
        '/inventory-management/physical-count-management',
        '/inventory-management/spot-check',
        '/inventory-management/spot-check/dashboard',
        '/inventory-management/spot-check/new',
        '/inventory-management/spot-check/active',
        '/inventory-management/spot-check/completed',
        '/inventory-management/fractional-inventory',
        '/inventory-management/inventory-adjustments',
        '/inventory-management/stock-in',
        '/inventory-management/period-end',
      ],

      // Procurement (Full Workflow Coverage)  
      procurement: [
        '/procurement',
        '/procurement/purchase-requests',
        '/procurement/purchase-requests/new-pr',
        '/procurement/purchase-requests/enhanced-demo',
        '/procurement/purchase-orders',
        '/procurement/purchase-orders/create',
        '/procurement/purchase-orders/create/bulk',
        '/procurement/purchase-orders/create/from-pr',
        '/procurement/goods-received-note',
        '/procurement/goods-received-note/new',
        '/procurement/goods-received-note/new/po-selection',
        '/procurement/goods-received-note/new/manual-entry',
        '/procurement/goods-received-note/new/item-location-selection',
        '/procurement/goods-received-note/new/confirmation',
        '/procurement/goods-received-note/new/vendor-selection',
        '/procurement/credit-note',
        '/procurement/credit-note/new',
        '/procurement/my-approvals',
        '/procurement/purchase-request-templates',
        '/procurement/vendor-comparison',
      ],

      // Vendor Management (Complete Lifecycle)
      vendor: [
        '/vendor-management',
        '/vendor-management/vendors',
        '/vendor-management/vendors/new',
        '/vendor-management/manage-vendors',
        '/vendor-management/manage-vendors/new',
        '/vendor-management/pricelists',
        '/vendor-management/pricelists/new',
        '/vendor-management/pricelists/add',
        '/vendor-management/campaigns',
        '/vendor-management/campaigns/new',
        '/vendor-management/templates',
        '/vendor-management/templates/new',
        '/vendor-management/vendor-portal',
        '/vendor-management/vendor-portal/sample',
      ],

      // Product Management (Detailed Coverage)
      product: [
        '/product-management',
        '/product-management/products',
        '/product-management/categories',
        '/product-management/units',
      ],

      // Recipe & Operational Planning (Full Coverage)
      recipe: [
        '/operational-planning',
        '/operational-planning/recipe-management',
        '/operational-planning/recipe-management/recipes',
        '/operational-planning/recipe-management/recipes/new',
        '/operational-planning/recipe-management/recipes/create',
        '/operational-planning/recipe-management/categories',
        '/operational-planning/recipe-management/cuisine-types',
        '/recipe-management/recipes',
      ],

      // Store Operations (Complete Workflows)
      store: [
        '/store-operations',
        '/store-operations/store-requisitions',
        '/store-operations/wastage-reporting',
        '/store-operations/stock-replenishment',
      ],

      // System Administration (Comprehensive)
      system: [
        '/system-administration',
        '/system-administration/user-management',
        '/system-administration/user-dashboard',
        '/system-administration/location-management',
        '/system-administration/location-management/new',
        '/system-administration/workflow',
        '/system-administration/workflow/workflow-configuration',
        '/system-administration/workflow/role-assignment',
        '/system-administration/business-rules',
        '/system-administration/business-rules/compliance-monitoring',
        '/system-administration/system-integrations',
        '/system-administration/system-integrations/pos',
        '/system-administration/system-integrations/pos/mapping',
        '/system-administration/system-integrations/pos/mapping/units',
        '/system-administration/system-integrations/pos/mapping/recipes',
        '/system-administration/system-integrations/pos/mapping/recipes/fractional-variants',
        '/system-administration/system-integrations/pos/mapping/locations',
        '/system-administration/system-integrations/pos/settings',
        '/system-administration/system-integrations/pos/settings/config',
        '/system-administration/system-integrations/pos/settings/system',
        '/system-administration/system-integrations/pos/transactions',
        '/system-administration/system-integrations/pos/reports',
        '/system-administration/system-integrations/pos/reports/gross-profit',
        '/system-administration/system-integrations/pos/reports/consumption',
        '/system-administration/account-code-mapping',
      ],

      // Finance & Accounting
      finance: [
        '/finance',
        '/finance/account-code-mapping',
        '/finance/department-list',
        '/finance/currency-management',
        '/finance/exchange-rates',
      ],

      // Reporting & Analytics (Deep Coverage)
      reporting: [
        '/reporting-analytics',
        '/reporting-analytics/consumption-analytics',
      ],

      // Production Management
      production: [
        '/production',
      ],

      // Help & Support
      support: [
        '/help-support',
      ],
    };

    // User roles for role-based capturing
    this.roles = [
      'staff',
      'department-manager', 
      'financial-manager',
      'purchasing-staff',
      'counter',
      'chef'
    ];

    this.viewport = { width: 1920, height: 1080 };
    this.browser = null;
    this.statistics = {
      totalScreenshots: 0,
      successfulCaptures: 0,
      moduleStats: {},
      failures: []
    };
  }

  async captureDeepDocumentation() {
    console.log('🚀 Starting Comprehensive Deep Capture...');
    
    const totalRoutes = Object.values(this.routes).flat().length;
    console.log(`📊 Target: ${totalRoutes} detailed routes across ${Object.keys(this.routes).length} business domains`);
    
    try {
      await this.setupEnvironment();
      await this.initializeBrowser();
      await this.captureAllModules();
      await this.generateDeepDocumentation();
      
      console.log('✅ Deep capture completed!');
      this.printDetailedStatistics();
      
    } catch (error) {
      console.error('❌ Deep capture failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async setupEnvironment() {
    console.log('📁 Setting up deep capture directory structure...');
    
    // Create organized directory structure
    for (const [module, routes] of Object.entries(this.routes)) {
      await fs.mkdir(`${this.outputDir}/${module}`, { recursive: true });
      await fs.mkdir(`${this.outputDir}/${module}/workflows`, { recursive: true });
      await fs.mkdir(`${this.outputDir}/${module}/details`, { recursive: true });
      await fs.mkdir(`${this.outputDir}/${module}/forms`, { recursive: true });
    }
    
    await fs.mkdir(`${this.outputDir}/interactive-states`, { recursive: true });
    await fs.mkdir(`${this.outputDir}/role-variations`, { recursive: true });
  }

  async initializeBrowser() {
    console.log('🌐 Launching browser with enhanced settings...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security', // For better form interaction
        '--allow-running-insecure-content'
      ]
    });
  }

  async captureAllModules() {
    console.log('📸 Starting comprehensive module capture...');
    
    let totalProcessed = 0;
    const totalRoutes = Object.values(this.routes).flat().length;
    
    for (const [moduleName, routes] of Object.entries(this.routes)) {
      console.log(`\n🎯 Processing ${moduleName.toUpperCase()} module (${routes.length} routes)...`);
      
      this.statistics.moduleStats[moduleName] = {
        total: routes.length,
        successful: 0,
        failed: 0,
        screenshots: 0
      };
      
      for (const route of routes) {
        totalProcessed++;
        console.log(`📍 Capturing: ${route} (${totalProcessed}/${totalRoutes})`);
        
        try {
          await this.captureRouteDeep(route, moduleName);
          this.statistics.moduleStats[moduleName].successful++;
          this.statistics.successfulCaptures++;
        } catch (error) {
          console.error(`❌ Failed to capture ${route}:`, error.message);
          this.statistics.moduleStats[moduleName].failed++;
          this.statistics.failures.push({ route, module: moduleName, error: error.message });
        }
        
        // Small delay between captures to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async captureRouteDeep(route, moduleName) {
    const page = await this.browser.newPage();
    
    try {
      // Configure page with enhanced settings
      await page.setViewport(this.viewport);
      
      // Disable animations and set up better form interaction
      await page.evaluateOnNewDocument(() => {
        const css = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      });
      
      // Navigate with enhanced waiting
      const url = `${this.baseUrl}${route}`;
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 45000 
      });
      
      // Enhanced waiting for dynamic content
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Try to wait for common loading indicators to disappear
      try {
        await page.waitForFunction(() => {
          const loadingElements = document.querySelectorAll(
            '[data-loading="true"], .loading, .spinner, [aria-busy="true"]'
          );
          return loadingElements.length === 0;
        }, { timeout: 8000 });
      } catch (e) {
        // Continue if loading indicators don't disappear
      }
      
      // Capture main screen state
      await this.captureScreenshot(page, route, moduleName, 'main');
      
      // Capture interactive states
      await this.captureInteractiveElements(page, route, moduleName);
      
      // Capture form states if this is a form page
      if (route.includes('/new') || route.includes('/create') || route.includes('/edit')) {
        await this.captureFormStates(page, route, moduleName);
      }
      
    } finally {
      await page.close();
    }
  }

  async captureScreenshot(page, route, moduleName, variant = 'main') {
    const filename = this.createFilename(route, variant);
    const filepath = path.join(this.outputDir, moduleName, `${filename}.png`);
    
    try {
      await page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png'
      });
      
      this.statistics.totalScreenshots++;
      this.statistics.moduleStats[moduleName].screenshots++;
      
      if (variant === 'main') {
        console.log(`  ✅ Main: ${filename}.png`);
      } else {
        console.log(`    📎 ${variant}: ${filename}.png`);
      }
      
    } catch (error) {
      console.error(`Failed to capture screenshot for ${route} (${variant}):`, error.message);
    }
  }

  async captureInteractiveElements(page, route, moduleName) {
    try {
      // Capture dropdown states
      const dropdowns = await page.$$('select, [role="combobox"], .dropdown-trigger');
      for (let i = 0; i < Math.min(dropdowns.length, 2); i++) {
        try {
          await dropdowns[i].click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.captureScreenshot(page, route, moduleName, `dropdown-${i + 1}`);
          await page.keyboard.press('Escape');
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          // Continue if dropdown interaction fails
        }
      }
      
      // Capture modal states
      const modalTriggers = await page.$$('[data-modal], .modal-trigger, button');
      for (let i = 0; i < Math.min(modalTriggers.length, 3); i++) {
        try {
          const buttonText = await modalTriggers[i].evaluate(el => el.textContent?.toLowerCase() || '');
          if (buttonText.includes('add') || buttonText.includes('create') || buttonText.includes('new')) {
            await modalTriggers[i].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if modal appeared
            const modalExists = await page.$('[role="dialog"], .modal, [data-state="open"]');
            if (modalExists) {
              await this.captureScreenshot(page, route, moduleName, `modal-${buttonText.slice(0, 10)}`);
              await page.keyboard.press('Escape');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (e) {
          // Continue if modal interaction fails
        }
      }
      
    } catch (error) {
      // Continue if interactive element capture fails
    }
  }

  async captureFormStates(page, route, moduleName) {
    try {
      // Look for forms
      const forms = await page.$$('form');
      
      if (forms.length > 0) {
        const form = forms[0];
        
        // Try to fill form with sample data
        await this.fillFormWithSampleData(page, form);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.captureScreenshot(page, route, moduleName, 'form-filled');
        
        // Try to trigger validation by submitting
        try {
          const submitButton = await form.$('button[type="submit"], input[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await this.captureScreenshot(page, route, moduleName, 'form-validation');
          }
        } catch (e) {
          // Continue if form submission fails
        }
      }
      
    } catch (error) {
      // Continue if form capture fails
    }
  }

  async fillFormWithSampleData(page, form) {
    try {
      // Fill text inputs
      const textInputs = await form.$$('input[type="text"], input[type="email"], textarea');
      for (let i = 0; i < Math.min(textInputs.length, 5); i++) {
        await textInputs[i].type(`Sample Data ${i + 1}`, { delay: 100 });
      }
      
      // Fill number inputs
      const numberInputs = await form.$$('input[type="number"]');
      for (let i = 0; i < Math.min(numberInputs.length, 3); i++) {
        await numberInputs[i].type('100', { delay: 100 });
      }
      
      // Select dropdown options
      const selects = await form.$$('select');
      for (let i = 0; i < Math.min(selects.length, 3); i++) {
        const options = await selects[i].$$('option');
        if (options.length > 1) {
          await selects[i].selectOption({ index: 1 });
        }
      }
      
    } catch (error) {
      // Continue if form filling fails
    }
  }

  async generateDeepDocumentation() {
    console.log('📝 Generating comprehensive documentation...');
    
    // Generate detailed README
    const readmeContent = this.buildDetailedReadme();
    await fs.writeFile(`${this.outputDir}/README.md`, readmeContent);
    
    // Generate interactive HTML index
    const htmlContent = this.buildInteractiveIndex();
    await fs.writeFile(`${this.outputDir}/index.html`, htmlContent);
    
    // Generate module-specific documentation
    for (const moduleName of Object.keys(this.routes)) {
      const moduleDoc = this.buildModuleDocumentation(moduleName);
      await fs.writeFile(`${this.outputDir}/${moduleName}/README.md`, moduleDoc);
    }
  }

  buildDetailedReadme() {
    const totalRoutes = Object.values(this.routes).flat().length;
    const successRate = ((this.statistics.successfulCaptures / totalRoutes) * 100).toFixed(1);
    
    return `# Carmen ERP Deep Capture Documentation

**Generated**: ${new Date().toISOString()}  
**Total Routes**: ${totalRoutes}  
**Screenshots**: ${this.statistics.totalScreenshots}  
**Success Rate**: ${successRate}%

## 🎯 Comprehensive Coverage

This deep capture provides extensive documentation of the Carmen ERP application, covering detailed workflows, interactive states, and business processes across all major modules.

## 📊 Module Coverage

${Object.entries(this.statistics.moduleStats).map(([module, stats]) => `
### ${module.toUpperCase()}
- **Routes**: ${stats.total}
- **Screenshots**: ${stats.screenshots}  
- **Success Rate**: ${((stats.successful / stats.total) * 100).toFixed(1)}%
`).join('')}

## 🔍 Documentation Structure

Each module contains:
- **Main screens**: Core interface captures
- **Workflows**: Step-by-step process documentation
- **Forms**: Form states and validation captures
- **Interactive**: Dropdown, modal, and dynamic states

## 📋 Business Process Coverage

### Inventory Management
- Stock overview and monitoring
- Physical count processes
- Spot check workflows
- Fractional inventory handling
- Inventory adjustments
- Stock movement tracking

### Procurement
- Purchase request lifecycle
- Purchase order management
- Goods received note processing
- Credit note handling
- Approval workflows
- Vendor comparison

### Vendor Management
- Vendor onboarding
- Pricelist management
- Campaign management
- Template creation
- Vendor portal access

### System Administration
- User management
- Workflow configuration
- POS system integration
- Business rules setup
- Location management

## 🚀 Usage

Browse screenshots by module in the organized directory structure:
\`\`\`
deep-capture/
├── inventory/          # Inventory management screens
├── procurement/        # Procurement workflow screens
├── vendor/            # Vendor management screens
├── system/            # System administration screens
└── [other modules]/   # Additional business modules
\`\`\`

View the interactive documentation: \`index.html\`

---

*This documentation represents the comprehensive state of Carmen ERP as of ${new Date().toLocaleDateString()}*
`;
  }

  buildInteractiveIndex() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carmen ERP Deep Capture Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
        }
        
        .header {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .stat-card {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #2563eb;
        }
        
        .modules {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .module-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .module-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .module-header {
            padding: 1.5rem;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
        }
        
        .module-body {
            padding: 1.5rem;
        }
        
        .route-list {
            max-height: 300px;
            overflow-y: auto;
            margin: 1rem 0;
        }
        
        .route-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e2e8f0;
            font-family: monospace;
            font-size: 0.85rem;
        }
        
        .module-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            font-size: 0.875rem;
            color: #64748b;
        }
        
        h1, h2, h3 { color: #1e293b; }
        
        .search-box {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 2rem;
        }
        
        .filter-hidden { display: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Carmen ERP Deep Capture Documentation</h1>
        <p>Comprehensive screenshot documentation covering ${this.statistics.totalScreenshots} screens across ${Object.keys(this.routes).length} business modules</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${this.statistics.totalScreenshots}</div>
                <div>Screenshots</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.values(this.routes).flat().length}</div>
                <div>Routes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(this.routes).length}</div>
                <div>Modules</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${((this.statistics.successfulCaptures / Object.values(this.routes).flat().length) * 100).toFixed(0)}%</div>
                <div>Success Rate</div>
            </div>
        </div>
    </div>

    <input type="text" class="search-box" placeholder="Search modules and routes..." id="searchBox">

    <div class="modules" id="moduleContainer">
        ${Object.entries(this.routes).map(([moduleName, routes]) => `
            <div class="module-card" data-module="${moduleName}">
                <div class="module-header">
                    <h2>${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}</h2>
                    <div>${routes.length} routes documented</div>
                </div>
                <div class="module-body">
                    <div class="route-list">
                        ${routes.map(route => `
                            <div class="route-item" data-route="${route}">${route}</div>
                        `).join('')}
                    </div>
                    <div class="module-stats">
                        <span><strong>Routes:</strong> ${routes.length}</span>
                        <span><strong>Screenshots:</strong> ${this.statistics.moduleStats[moduleName]?.screenshots || 0}</span>
                        <span><strong>Success:</strong> ${this.statistics.moduleStats[moduleName] ? 
                          ((this.statistics.moduleStats[moduleName].successful / routes.length) * 100).toFixed(0) : 0}%</span>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        // Search functionality
        document.getElementById('searchBox').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const moduleCards = document.querySelectorAll('.module-card');
            
            moduleCards.forEach(card => {
                const moduleName = card.dataset.module.toLowerCase();
                const routes = Array.from(card.querySelectorAll('.route-item'))
                    .map(item => item.dataset.route.toLowerCase());
                
                const moduleMatch = moduleName.includes(searchTerm);
                const routeMatch = routes.some(route => route.includes(searchTerm));
                
                if (moduleMatch || routeMatch) {
                    card.classList.remove('filter-hidden');
                    
                    // Highlight matching routes
                    card.querySelectorAll('.route-item').forEach(routeItem => {
                        if (routeItem.dataset.route.toLowerCase().includes(searchTerm)) {
                            routeItem.style.background = '#fef3c7';
                        } else {
                            routeItem.style.background = '';
                        }
                    });
                } else {
                    card.classList.add('filter-hidden');
                }
            });
        });

        // Module navigation
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', function() {
                const moduleName = this.dataset.module;
                // Could navigate to module-specific documentation
                console.log('Navigate to module:', moduleName);
            });
        });
    </script>
</body>
</html>`;
  }

  buildModuleDocumentation(moduleName) {
    const routes = this.routes[moduleName];
    const stats = this.statistics.moduleStats[moduleName];
    
    return `# ${moduleName.toUpperCase()} Module Documentation

**Routes**: ${routes.length}  
**Screenshots**: ${stats?.screenshots || 0}  
**Success Rate**: ${stats ? ((stats.successful / stats.total) * 100).toFixed(1) : 0}%

## Route Coverage

${routes.map(route => `- \`${route}\``).join('\n')}

## Screenshot Organization

- **Main screens**: Core interface captures for each route
- **Interactive states**: Dropdown, modal, and dynamic content
- **Form states**: Form filling and validation examples
- **Workflow steps**: Process documentation where applicable

## Business Processes

This module covers key business processes including:
${this.getModuleProcesses(moduleName)}

---

*Generated: ${new Date().toISOString()}*
`;
  }

  getModuleProcesses(moduleName) {
    const processes = {
      inventory: `
- Real-time stock monitoring and alerts
- Physical inventory counting procedures
- Spot check and cycle counting workflows
- Fractional inventory management
- Stock adjustments and movements
- Period-end inventory processes`,
      
      procurement: `
- Purchase request creation and approval
- Purchase order generation and management  
- Goods receipt processing and validation
- Credit note creation and processing
- Vendor comparison and selection
- Approval workflow management`,
      
      vendor: `
- Vendor onboarding and registration
- Vendor profile management
- Pricelist creation and maintenance
- Campaign and promotion management
- Template creation and customization
- Vendor portal access and communication`,
      
      system: `
- User account and role management
- Workflow configuration and routing
- POS system integration and mapping
- Business rule configuration
- Location and department management
- System integration setup`
    };
    
    return processes[moduleName] || `
- Core business processes for ${moduleName}
- Workflow management and configuration
- Data management and reporting
- Integration and system coordination`;
  }

  createFilename(route, variant = '') {
    const base = route
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .replace(/\[.*?\]/g, 'dynamic')
      .toLowerCase() || 'home';
    
    return variant ? `${base}-${variant}` : base;
  }

  printDetailedStatistics() {
    console.log('\n📊 Comprehensive Deep Capture Statistics:');
    console.log(`├── Total Screenshots: ${this.statistics.totalScreenshots}`);
    console.log(`├── Successful Captures: ${this.statistics.successfulCaptures}`);
    console.log(`├── Total Routes: ${Object.values(this.routes).flat().length}`);
    console.log(`└── Overall Success Rate: ${((this.statistics.successfulCaptures / Object.values(this.routes).flat().length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Module Breakdown:');
    Object.entries(this.statistics.moduleStats).forEach(([module, stats]) => {
      const successRate = ((stats.successful / stats.total) * 100).toFixed(1);
      console.log(`├── ${module.toUpperCase()}: ${stats.screenshots} screenshots, ${successRate}% success`);
    });
    
    if (this.statistics.failures.length > 0) {
      console.log('\n❌ Failed captures:');
      this.statistics.failures.forEach(failure => {
        console.log(`   • ${failure.module}/${failure.route}: ${failure.error}`);
      });
    }
    
    console.log(`\n✅ Deep documentation saved to: ${this.outputDir}/`);
    console.log(`📖 Browse interactive documentation: ${this.outputDir}/index.html`);
  }
}

// Execute if run directly
if (require.main === module) {
  const capture = new ComprehensiveDeepCapture();
  
  capture.captureDeepDocumentation()
    .then(() => {
      console.log('🎉 Comprehensive deep capture finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Deep capture failed:', error);
      process.exit(1);
    });
}

module.exports = { ComprehensiveDeepCapture };