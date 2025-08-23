#!/usr/bin/env node

/**
 * Carmen ERP Role-Based Interface Capture
 * 
 * Captures interface variations based on different user roles to document
 * how permissions and role-based access control affects the UI
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class RoleBasedCapture {
  constructor() {
    this.baseUrl = 'http://localhost:3006';
    this.outputDir = 'docs/screenshots/role-based';
    
    // Key routes that show significant role-based differences
    this.keyRoutes = [
      '/dashboard',
      '/procurement/purchase-requests',
      '/procurement/purchase-requests/new-pr', 
      '/procurement/purchase-orders',
      '/inventory-management/stock-overview',
      '/vendor-management/vendors',
      '/system-administration/user-management',
      '/finance/account-code-mapping',
      '/operational-planning/recipe-management/recipes',
      '/store-operations/store-requisitions'
    ];

    // User roles with their characteristics
    this.roles = {
      'staff': {
        displayName: 'Staff User',
        description: 'Basic operational access with limited permissions',
        color: '#64748b',
        permissions: ['read', 'basic-operations']
      },
      'department-manager': {
        displayName: 'Department Manager', 
        description: 'Department-level management with approval capabilities',
        color: '#059669',
        permissions: ['read', 'write', 'approve-departmental', 'manage-team']
      },
      'financial-manager': {
        displayName: 'Financial Manager',
        description: 'Financial oversight with budget and cost controls',
        color: '#dc2626', 
        permissions: ['read', 'write', 'financial-approve', 'budget-control']
      },
      'purchasing-staff': {
        displayName: 'Purchasing Staff',
        description: 'Procurement specialization with vendor management',
        color: '#2563eb',
        permissions: ['read', 'write', 'vendor-manage', 'procurement-full']
      },
      'counter': {
        displayName: 'Counter Staff',
        description: 'Inventory operations with counting and stock management',
        color: '#7c3aed',
        permissions: ['read', 'write', 'inventory-operations', 'count-manage']
      },
      'chef': {
        displayName: 'Chef',
        description: 'Recipe management with ingredient and menu control',
        color: '#ea580c',
        permissions: ['read', 'write', 'recipe-manage', 'menu-plan']
      }
    };

    this.viewport = { width: 1920, height: 1080 };
    this.browser = null;
    this.statistics = {
      totalScreenshots: 0,
      roleComparisons: 0,
      routesCovered: 0,
      roleStats: {}
    };
  }

  async captureRoleBasedInterfaces() {
    console.log('🎭 Starting Role-Based Interface Capture...');
    console.log(`👥 Roles: ${Object.keys(this.roles).length}`);
    console.log(`📍 Routes: ${this.keyRoutes.length}`); 
    console.log(`🎯 Total combinations: ${Object.keys(this.roles).length * this.keyRoutes.length}`);
    
    try {
      await this.setupRoleEnvironment();
      await this.initializeBrowser();
      await this.captureAllRoleVariations();
      await this.generateRoleComparisons();
      
      console.log('✅ Role-based capture completed!');
      this.printRoleStatistics();
      
    } catch (error) {
      console.error('❌ Role-based capture failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async setupRoleEnvironment() {
    console.log('📁 Setting up role-based directory structure...');
    
    // Create directories for each role
    for (const roleName of Object.keys(this.roles)) {
      await fs.mkdir(`${this.outputDir}/${roleName}`, { recursive: true });
      this.statistics.roleStats[roleName] = {
        screenshots: 0,
        successful: 0,
        failed: 0
      };
    }
    
    // Create comparison directories
    await fs.mkdir(`${this.outputDir}/comparisons`, { recursive: true });
    await fs.mkdir(`${this.outputDir}/differences`, { recursive: true });
  }

  async initializeBrowser() {
    console.log('🌐 Launching browser for role simulation...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-gpu'
      ]
    });
  }

  async captureAllRoleVariations() {
    console.log('📸 Capturing role-based interface variations...');
    
    let totalProcessed = 0;
    const totalCombinations = Object.keys(this.roles).length * this.keyRoutes.length;
    
    for (const route of this.keyRoutes) {
      console.log(`\n🎯 Processing route: ${route}`);
      
      const routeVariations = {};
      
      for (const [roleName, roleInfo] of Object.entries(this.roles)) {
        totalProcessed++;
        console.log(`👤 ${roleInfo.displayName} (${totalProcessed}/${totalCombinations})`);
        
        try {
          const screenshotPath = await this.captureRoleRoute(route, roleName, roleInfo);
          routeVariations[roleName] = screenshotPath;
          this.statistics.roleStats[roleName].successful++;
          this.statistics.roleStats[roleName].screenshots++;
          this.statistics.totalScreenshots++;
        } catch (error) {
          console.error(`❌ Failed ${roleName} for ${route}:`, error.message);
          this.statistics.roleStats[roleName].failed++;
        }
        
        // Small delay between role switches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Create comparison for this route
      await this.createRouteComparison(route, routeVariations);
      this.statistics.routesCovered++;
    }
  }

  async captureRoleRoute(route, roleName, roleInfo) {
    const page = await this.browser.newPage();
    
    try {
      await page.setViewport(this.viewport);
      
      // Simulate role-based authentication
      await this.simulateRoleContext(page, roleName, roleInfo);
      
      // Disable animations
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
      
      // Navigate to route
      const url = `${this.baseUrl}${route}`;
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      // Wait for role-based content to load
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Try to wait for loading to complete
      try {
        await page.waitForFunction(() => {
          const loadingElements = document.querySelectorAll('[data-loading="true"], .loading, .spinner');
          return loadingElements.length === 0;
        }, { timeout: 5000 });
      } catch (e) {
        // Continue if loading indicators don't disappear
      }
      
      // Capture screenshot
      const filename = this.createRoleFilename(route, roleName);
      const filepath = path.join(this.outputDir, roleName, `${filename}.png`);
      
      await page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png'
      });
      
      console.log(`  ✅ Captured: ${filename}.png`);
      return filepath;
      
    } finally {
      await page.close();
    }
  }

  async simulateRoleContext(page, roleName, roleInfo) {
    // Simulate user context by setting localStorage
    await page.evaluateOnNewDocument((roleData, roleName) => {
      localStorage.setItem('userContext', JSON.stringify({
        currentRole: roleName,
        user: {
          id: `test-${roleName}`,
          name: `Test ${roleData.displayName}`,
          email: `${roleName}@test.com`,
          roles: [roleName]
        },
        permissions: roleData.permissions,
        currentDepartment: 'test-department',
        currentLocation: 'test-location'
      }));
    }, roleInfo, roleName);
  }

  async createRouteComparison(route, routeVariations) {
    // Create a simple HTML comparison page for this route
    const comparisonFilename = this.createRoleFilename(route, 'comparison');
    const comparisonPath = path.join(this.outputDir, 'comparisons', `${comparisonFilename}.html`);
    
    const htmlContent = this.generateRouteComparisonHTML(route, routeVariations);
    await fs.writeFile(comparisonPath, htmlContent);
    
    this.statistics.roleComparisons++;
  }

  generateRouteComparisonHTML(route, routeVariations) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role Comparison: ${route}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .route-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1e293b;
            font-family: monospace;
            background: white;
            padding: 1rem;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .role-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .role-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .role-header {
            padding: 1rem;
            color: white;
            font-weight: 600;
        }
        
        .role-image {
            width: 100%;
            height: auto;
            display: block;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .role-info {
            padding: 1rem;
        }
        
        .role-description {
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        
        .permissions {
            margin-top: 1rem;
        }
        
        .permission-tag {
            display: inline-block;
            background: #f1f5f9;
            color: #475569;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            margin: 0.125rem;
        }
        
        .timestamp {
            text-align: center;
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            .comparison-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="route-title">${route}</div>
        <p>Interface variations across user roles</p>
    </div>
    
    <div class="comparison-grid">
        ${Object.entries(routeVariations).map(([roleName, imagePath]) => {
          const roleInfo = this.roles[roleName];
          return `
            <div class="role-card">
                <div class="role-header" style="background: ${roleInfo.color};">
                    ${roleInfo.displayName}
                </div>
                <img src="../${roleName}/${path.basename(imagePath)}" alt="${roleInfo.displayName} view" class="role-image" 
                     onerror="this.style.display='none'; this.nextElementSibling.innerHTML='Screenshot not available';">
                <div class="role-info">
                    <div class="role-description">${roleInfo.description}</div>
                    <div class="permissions">
                        ${roleInfo.permissions.map(perm => `
                            <span class="permission-tag">${perm}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
          `;
        }).join('')}
    </div>
    
    <div class="timestamp">
        Generated: ${new Date().toISOString()}
    </div>
</body>
</html>`;
  }

  async generateRoleComparisons() {
    console.log('📋 Generating comprehensive role documentation...');
    
    // Generate main index
    const indexContent = this.generateRoleIndexHTML();
    await fs.writeFile(`${this.outputDir}/index.html`, indexContent);
    
    // Generate README
    const readmeContent = this.generateRoleReadme();
    await fs.writeFile(`${this.outputDir}/README.md`, readmeContent);
  }

  generateRoleIndexHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carmen ERP Role-Based Interface Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            line-height: 1.6;
        }
        
        .header {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .stat-card {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2563eb;
        }
        
        .roles-section {
            margin-bottom: 3rem;
        }
        
        .roles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .role-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .role-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .role-badge {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .comparisons-section {
            margin-bottom: 3rem;
        }
        
        .comparisons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .comparison-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
        }
        
        .comparison-card:hover {
            border-color: #2563eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .route-name {
            font-family: monospace;
            font-size: 0.875rem;
            background: #f8fafc;
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 0.5rem;
        }
        
        h1, h2 { color: #1e293b; }
        h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        
        .permission-tag {
            display: inline-block;
            background: #e2e8f0;
            color: #475569;
            padding: 0.125rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            margin: 0.125rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 Carmen ERP Role-Based Interface Documentation</h1>
        <p>Comprehensive documentation showing how user roles affect interface presentation and functionality</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${this.statistics.totalScreenshots}</div>
                <div>Screenshots</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(this.roles).length}</div>
                <div>User Roles</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.statistics.routesCovered}</div>
                <div>Routes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.statistics.roleComparisons}</div>
                <div>Comparisons</div>
            </div>
        </div>
    </div>

    <section class="roles-section">
        <h2>👥 User Roles</h2>
        <div class="roles-grid">
            ${Object.entries(this.roles).map(([roleName, roleInfo]) => `
                <div class="role-card">
                    <div class="role-header">
                        <div class="role-badge" style="background: ${roleInfo.color};"></div>
                        <h3>${roleInfo.displayName}</h3>
                    </div>
                    <p>${roleInfo.description}</p>
                    <div class="permissions">
                        ${roleInfo.permissions.map(perm => `
                            <span class="permission-tag">${perm}</span>
                        `).join('')}
                    </div>
                    <div style="margin-top: 1rem; color: #64748b; font-size: 0.875rem;">
                        Screenshots: ${this.statistics.roleStats[roleName]?.screenshots || 0}
                    </div>
                </div>
            `).join('')}
        </div>
    </section>

    <section class="comparisons-section">
        <h2>📊 Route Comparisons</h2>
        <p>Click on any route to see how the interface differs across user roles:</p>
        <div class="comparisons-grid">
            ${this.keyRoutes.map(route => `
                <a href="comparisons/${this.createRoleFilename(route, 'comparison')}.html" class="comparison-card">
                    <strong>${route.split('/').pop() || 'dashboard'}</strong>
                    <div class="route-name">${route}</div>
                </a>
            `).join('')}
        </div>
    </section>
</body>
</html>`;
  }

  generateRoleReadme() {
    return `# Carmen ERP Role-Based Interface Documentation

**Generated**: ${new Date().toISOString()}  
**Screenshots**: ${this.statistics.totalScreenshots}  
**User Roles**: ${Object.keys(this.roles).length}  
**Routes Covered**: ${this.statistics.routesCovered}

## 🎭 Overview

This documentation demonstrates how the Carmen ERP interface adapts to different user roles, showing the practical implementation of role-based access control (RBAC) in the user interface.

## 👥 User Roles

${Object.entries(this.roles).map(([roleName, roleInfo]) => `
### ${roleInfo.displayName} (\`${roleName}\`)
${roleInfo.description}

**Permissions**: ${roleInfo.permissions.join(', ')}  
**Screenshots**: ${this.statistics.roleStats[roleName]?.screenshots || 0}
`).join('')}

## 📊 Interface Variations

Each role sees different:
- **Navigation options**: Menu items and accessible features
- **Action buttons**: Available operations based on permissions
- **Data visibility**: Information filtered by role and department
- **Approval workflows**: Different approval paths and authorities
- **Form fields**: Editable vs read-only fields based on permissions

## 🔍 Route Coverage

${this.keyRoutes.map(route => `- \`${route}\``).join('\n')}

## 📁 File Organization

\`\`\`
role-based/
├── index.html              # Main role documentation portal
├── comparisons/            # Side-by-side role comparisons
│   ├── dashboard-comparison.html
│   ├── procurement-purchase-requests-comparison.html
│   └── [other route comparisons]
├── staff/                  # Staff user screenshots
├── department-manager/     # Department manager screenshots
├── financial-manager/      # Financial manager screenshots
├── purchasing-staff/       # Purchasing staff screenshots
├── counter/               # Counter staff screenshots
└── chef/                  # Chef user screenshots
\`\`\`

## 🚀 Usage

1. **Browse by Role**: Navigate to individual role directories to see their specific interface
2. **Compare Roles**: Use the comparison HTML files to see side-by-side differences
3. **Interactive Portal**: Open \`index.html\` for a comprehensive browsing experience

## 📈 Statistics

${Object.entries(this.statistics.roleStats).map(([roleName, stats]) => `
- **${this.roles[roleName].displayName}**: ${stats.screenshots} screenshots, ${stats.successful} successful, ${stats.failed} failed`).join('')}

---

*This role-based documentation helps understand how RBAC is implemented in the Carmen ERP user interface and supports accurate role-based feature replication.*
`;
  }

  createRoleFilename(route, suffix = '') {
    const base = route
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .replace(/\[.*?\]/g, 'dynamic')
      .toLowerCase() || 'home';
    
    return suffix ? `${base}-${suffix}` : base;
  }

  printRoleStatistics() {
    console.log('\n🎭 Role-Based Capture Statistics:');
    console.log(`├── Total Screenshots: ${this.statistics.totalScreenshots}`);
    console.log(`├── Routes Covered: ${this.statistics.routesCovered}/${this.keyRoutes.length}`);
    console.log(`├── Role Comparisons: ${this.statistics.roleComparisons}`);
    
    console.log('\n👥 Role Breakdown:');
    Object.entries(this.statistics.roleStats).forEach(([roleName, stats]) => {
      const roleInfo = this.roles[roleName];
      console.log(`├── ${roleInfo.displayName}: ${stats.screenshots} screenshots, ${stats.successful} successful`);
    });
    
    console.log(`\n✅ Role-based documentation saved to: ${this.outputDir}/`);
    console.log(`📖 Browse role comparisons: ${this.outputDir}/index.html`);
  }
}

// Execute if run directly
if (require.main === module) {
  const capture = new RoleBasedCapture();
  
  capture.captureRoleBasedInterfaces()
    .then(() => {
      console.log('🎉 Role-based capture finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Role-based capture failed:', error);
      process.exit(1);
    });
}

module.exports = { RoleBasedCapture };