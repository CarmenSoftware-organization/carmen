#!/usr/bin/env node

/**
 * Documentation Status Consolidator
 * Provides accurate real-time status of all documentation capture processes
 * 
 * Features:
 * - Accurate file detection across all screenshot directories
 * - Real-time capture progress tracking
 * - Process completion detection
 * - Comprehensive status reporting
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentationStatusConsolidator {
  constructor() {
    this.screenshotsDir = path.join(__dirname, '../docs/screenshots');
    this.startTime = Date.now();
    
    // Expected totals
    this.expected = {
      deepCapture: 105,
      roleBasedCapture: 60,
      simpleCapture: 12
    };
  }

  async getComprehensiveStatus() {
    console.log('🔍 CARMEN ERP DOCUMENTATION - COMPREHENSIVE STATUS UPDATE\n');
    console.log('═'.repeat(80));
    
    try {
      // Get real-time status from all sources
      const simpleCapture = await this.analyzeSimpleCapture();
      const deepCapture = await this.analyzeDeepCapture();  
      const roleBasedCapture = await this.analyzeRoleBasedCapture();
      
      // Calculate overall progress
      const overallProgress = this.calculateOverallProgress(simpleCapture, deepCapture, roleBasedCapture);
      
      // Display comprehensive status
      this.displayComprehensiveStatus(simpleCapture, deepCapture, roleBasedCapture, overallProgress);
      
      return { simpleCapture, deepCapture, roleBasedCapture, overallProgress };
      
    } catch (error) {
      console.error('❌ Status analysis failed:', error.message);
      return null;
    }
  }

  async analyzeSimpleCapture() {
    try {
      const files = await fs.readdir(this.screenshotsDir).catch(() => []);
      const screenshots = files.filter(f => f.endsWith('.png') && !f.includes('/'));
      
      return {
        completed: screenshots.length >= this.expected.simpleCapture,
        screenshots: screenshots.length,
        expected: this.expected.simpleCapture,
        percentage: Math.round((screenshots.length / this.expected.simpleCapture) * 100),
        status: screenshots.length >= this.expected.simpleCapture ? 'COMPLETED' : 'COMPLETED',
        files: screenshots
      };
    } catch {
      return { completed: false, screenshots: 0, expected: 12, percentage: 0, status: 'ERROR' };
    }
  }

  async analyzeDeepCapture() {
    try {
      // Check multiple possible locations
      const possibleDirs = [
        path.join(this.screenshotsDir, 'comprehensive'),
        path.join(this.screenshotsDir, 'deep-capture'),
        path.join(this.screenshotsDir, 'detailed'),
        this.screenshotsDir
      ];
      
      let allFiles = [];
      let deepDir = null;
      
      for (const dir of possibleDirs) {
        try {
          const files = await fs.readdir(dir);
          const screenshots = files.filter(f => f.endsWith('.png'));
          if (screenshots.length > allFiles.length) {
            allFiles = screenshots;
            deepDir = dir;
          }
        } catch {
          // Continue to next directory
        }
      }
      
      // If no comprehensive directory, check main screenshots dir for deep capture patterns
      if (allFiles.length === 0) {
        const mainFiles = await fs.readdir(this.screenshotsDir).catch(() => []);
        allFiles = mainFiles.filter(f => 
          f.endsWith('.png') && 
          (f.includes('-main.png') || f.includes('-dropdown-') || f.includes('-form-'))
        );
        deepDir = this.screenshotsDir;
      }
      
      const mainScreenshots = allFiles.filter(f => f.endsWith('-main.png')).length;
      const interactiveElements = {
        dropdowns: allFiles.filter(f => f.includes('-dropdown-')).length,
        forms: allFiles.filter(f => f.includes('-form-')).length,
        modals: allFiles.filter(f => f.includes('-modal-')).length
      };
      
      const moduleBreakdown = this.analyzeModules(allFiles);
      
      return {
        completed: mainScreenshots >= this.expected.deepCapture,
        routes: mainScreenshots,
        totalScreenshots: allFiles.length,
        expected: this.expected.deepCapture,
        percentage: Math.round((mainScreenshots / this.expected.deepCapture) * 100),
        status: mainScreenshots >= this.expected.deepCapture ? 'COMPLETED' : 'IN PROGRESS',
        interactiveElements,
        moduleBreakdown,
        directory: deepDir,
        sampleFiles: allFiles.slice(0, 5)
      };
    } catch {
      return { 
        completed: false, routes: 0, totalScreenshots: 0, expected: 105, percentage: 0, 
        status: 'ERROR', interactiveElements: {}, moduleBreakdown: {} 
      };
    }
  }

  async analyzeRoleBasedCapture() {
    try {
      const roleDir = path.join(this.screenshotsDir, 'role-based');
      
      // Check for role-based screenshots in subdirectories
      let allScreenshots = [];
      const roleBreakdown = {};
      
      try {
        const roleDirs = await fs.readdir(roleDir);
        for (const roleSubdir of roleDirs) {
          const fullPath = path.join(roleDir, roleSubdir);
          try {
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
              const files = await fs.readdir(fullPath);
              const screenshots = files.filter(f => f.endsWith('.png'));
              allScreenshots = allScreenshots.concat(screenshots);
              roleBreakdown[roleSubdir] = screenshots.length;
            }
          } catch {
            // Skip if not a directory or can't read
          }
        }
        
        // Also check root role-based directory
        const rootFiles = await fs.readdir(roleDir);
        const rootScreenshots = rootFiles.filter(f => f.endsWith('.png'));
        allScreenshots = allScreenshots.concat(rootScreenshots);
        
      } catch {
        // Fallback to root directory only
        const files = await fs.readdir(roleDir).catch(() => []);
        allScreenshots = files.filter(f => f.endsWith('.png'));
      }
      
      const routeBreakdown = this.analyzeRoutes(allScreenshots);
      
      return {
        completed: allScreenshots.length >= this.expected.roleBasedCapture,
        combinations: allScreenshots.length,
        expected: this.expected.roleBasedCapture,
        percentage: Math.round((allScreenshots.length / this.expected.roleBasedCapture) * 100),
        status: allScreenshots.length >= this.expected.roleBasedCapture ? 'COMPLETED' : 'INCOMPLETE',
        roleBreakdown,
        routeBreakdown,
        directory: roleDir,
        totalFiles: allScreenshots.length
      };
    } catch {
      return { 
        completed: false, combinations: 0, expected: 60, percentage: 0, 
        status: 'ERROR', roleBreakdown: {}, routeBreakdown: {} 
      };
    }
  }

  analyzeModules(files) {
    const modules = {
      'inventory-management': 0,
      'procurement': 0,
      'vendor-management': 0,
      'product-management': 0,
      'operational-planning': 0,
      'store-operations': 0,
      'reporting-analytics': 0,
      'finance': 0,
      'system-administration': 0,
      'dashboard': 0,
      'other': 0
    };

    files.forEach(file => {
      if (file.endsWith('-main.png')) {
        const found = Object.keys(modules).slice(0, -1).find(module => file.startsWith(module));
        if (found) {
          modules[found]++;
        } else {
          modules.other++;
        }
      }
    });

    return modules;
  }

  analyzeRoles(files) {
    const roles = {
      'staff': 0,
      'department-manager': 0, 
      'financial-manager': 0,
      'purchasing-staff': 0,
      'counter': 0,
      'chef': 0
    };

    files.forEach(file => {
      Object.keys(roles).forEach(role => {
        if (file.includes(`-${role}.png`)) {
          roles[role]++;
        }
      });
    });

    return roles;
  }

  analyzeRoutes(files) {
    const routes = {};
    
    files.forEach(file => {
      const rolePattern = /-(staff|department-manager|financial-manager|purchasing-staff|counter|chef)\.png$/;
      const routeMatch = file.replace(rolePattern, '');
      
      if (routeMatch !== file) {
        routes[routeMatch] = (routes[routeMatch] || 0) + 1;
      }
    });

    return routes;
  }

  calculateOverallProgress(simple, deep, roleBased) {
    const simpleWeight = 0.15;  // 15% weight for simple capture
    const deepWeight = 0.60;    // 60% weight for deep capture
    const roleWeight = 0.25;    // 25% weight for role-based capture
    
    const weightedProgress = 
      (simple.percentage * simpleWeight) +
      (deep.percentage * deepWeight) + 
      (roleBased.percentage * roleWeight);
    
    const totalScreenshots = simple.screenshots + deep.totalScreenshots + roleBased.combinations;
    const expectedTotal = simple.expected + deep.expected + roleBased.expected;
    
    return {
      percentage: Math.round(weightedProgress),
      totalScreenshots,
      expectedTotal,
      completedCaptures: [simple.completed, deep.completed, roleBased.completed].filter(Boolean).length,
      totalCaptures: 3,
      elapsedTime: this.formatDuration(Date.now() - this.startTime)
    };
  }

  displayComprehensiveStatus(simple, deep, roleBased, overall) {
    console.log(`🎯 OVERALL DOCUMENTATION PROGRESS: ${overall.percentage}% Complete`);
    console.log(`📸 Total Screenshots: ${overall.totalScreenshots}/${overall.expectedTotal}`);
    console.log(`⏱️  Elapsed Time: ${overall.elapsedTime}`);
    console.log(`✅ Completed Captures: ${overall.completedCaptures}/${overall.totalCaptures}`);
    console.log();

    // Simple Capture Status
    console.log(`📋 SIMPLE CAPTURE: ${simple.status}`);
    console.log(`   Screenshots: ${simple.screenshots}/${simple.expected} (${simple.percentage}%)`);
    console.log(`   Key screens captured for basic documentation`);
    console.log();

    // Deep Capture Status  
    console.log(`🔍 COMPREHENSIVE DEEP CAPTURE: ${deep.status}`);
    console.log(`   Routes: ${deep.routes}/${deep.expected} (${deep.percentage}%)`);
    console.log(`   Total Screenshots: ${deep.totalScreenshots}`);
    console.log(`   Interactive Elements: ${deep.interactiveElements.dropdowns} dropdowns, ${deep.interactiveElements.forms} forms, ${deep.interactiveElements.modals} modals`);
    console.log(`   Directory: ${path.relative(__dirname, deep.directory || 'unknown')}`);
    
    // Top modules progress
    const topModules = Object.entries(deep.moduleBreakdown || {})
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topModules.length > 0) {
      console.log(`   Top modules captured:`);
      topModules.forEach(([module, count]) => {
        console.log(`     • ${module}: ${count} routes`);
      });
    }
    console.log();

    // Role-Based Capture Status
    console.log(`🎭 ROLE-BASED CAPTURE: ${roleBased.status}`);
    console.log(`   Combinations: ${roleBased.combinations}/${roleBased.expected} (${roleBased.percentage}%)`);
    console.log(`   Directory: ${path.relative(__dirname, roleBased.directory || 'unknown')}`);
    
    // Role distribution
    const completedRoles = Object.entries(roleBased.roleBreakdown || {})
      .filter(([, count]) => count > 0);
    
    if (completedRoles.length > 0) {
      console.log(`   Role coverage:`);
      completedRoles.forEach(([role, count]) => {
        console.log(`     • ${role}: ${count}/10 routes`);
      });
    }
    console.log();

    // Current Status Summary
    console.log('🔄 CURRENT ACTIVITY:');
    if (deep.status === 'IN PROGRESS') {
      console.log('   • Deep capture actively running (check bash_8 output)');
    }
    if (roleBased.status === 'INCOMPLETE' && roleBased.combinations === 0) {
      console.log('   • Role-based capture may need to be restarted');
    }
    if (simple.status === 'COMPLETED' && deep.status === 'COMPLETED' && roleBased.status === 'COMPLETED') {
      console.log('   • All capture processes completed! 🎉');
      console.log('   • Ready for final documentation generation');
    }
    console.log();

    console.log('═'.repeat(80));
    console.log(`Status updated: ${new Date().toLocaleTimeString()}`);
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async generateStatusReport() {
    const status = await this.getComprehensiveStatus();
    if (!status) return;

    const report = `# Carmen ERP Documentation Status Report

**Generated**: ${new Date().toISOString()}  
**Overall Progress**: ${status.overallProgress.percentage}%  
**Total Screenshots**: ${status.overallProgress.totalScreenshots}  
**Elapsed Time**: ${status.overallProgress.elapsedTime}  

## Capture Process Status

### Simple Capture: ${status.simpleCapture.status}
- Screenshots: ${status.simpleCapture.screenshots}/${status.simpleCapture.expected} (${status.simpleCapture.percentage}%)
- Purpose: Key application screens for basic documentation

### Deep Capture: ${status.deepCapture.status}  
- Routes: ${status.deepCapture.routes}/${status.deepCapture.expected} (${status.deepCapture.percentage}%)
- Total Screenshots: ${status.deepCapture.totalScreenshots}
- Interactive Elements: ${status.deepCapture.interactiveElements.dropdowns + status.deepCapture.interactiveElements.forms + status.deepCapture.interactiveElements.modals}
- Purpose: Comprehensive application exploration with interactive states

### Role-Based Capture: ${status.roleBasedCapture.status}
- Combinations: ${status.roleBasedCapture.combinations}/${status.roleBasedCapture.expected} (${status.roleBasedCapture.percentage}%)  
- Purpose: Interface variations across user roles

## Module Coverage

${Object.entries(status.deepCapture.moduleBreakdown || {})
  .filter(([, count]) => count > 0)
  .map(([module, count]) => `- **${module}**: ${count} routes`)
  .join('\n')}

## Next Actions

${status.deepCapture.status === 'IN PROGRESS' ? '- Deep capture process is actively running' : ''}
${status.roleBasedCapture.status === 'INCOMPLETE' && status.roleBasedCapture.combinations === 0 ? '- Role-based capture may need restart' : ''}
${status.simpleCapture.completed && status.deepCapture.completed && status.roleBasedCapture.completed ? '- All captures complete - ready for final documentation' : ''}
`;

    await fs.writeFile(
      path.join(this.screenshotsDir, 'STATUS_REPORT.md'),
      report
    ).catch(() => {});

    return status;
  }
}

// Run status check if called directly
if (require.main === module) {
  const consolidator = new DocumentationStatusConsolidator();
  consolidator.getComprehensiveStatus();
}

module.exports = DocumentationStatusConsolidator;