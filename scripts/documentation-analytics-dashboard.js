#!/usr/bin/env node

/**
 * Documentation Analytics Dashboard
 * Advanced analytics and insights for Carmen ERP documentation capture
 * 
 * Features:
 * - Capture performance analytics
 * - Success rate monitoring
 * - Module completion predictions
 * - Quality metrics tracking
 * - Export capabilities for reporting
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentationAnalyticsDashboard {
  constructor() {
    this.screenshotsDir = path.join(__dirname, '../docs/screenshots');
    this.analyticsDir = path.join(this.screenshotsDir, 'analytics');
    this.metricsFile = path.join(this.analyticsDir, 'capture-metrics.json');
    
    this.metrics = {
      startTime: Date.now(),
      captureHistory: [],
      performanceMetrics: {},
      qualityMetrics: {},
      predictions: {}
    };
  }

  async initialize() {
    console.log('📊 Documentation Analytics Dashboard Initializing...\n');
    
    try {
      await this.ensureDirectories();
      await this.loadHistoricalMetrics();
      await this.startAnalytics();
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error.message);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    await fs.mkdir(this.analyticsDir, { recursive: true });
  }

  async loadHistoricalMetrics() {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf8');
      const historical = JSON.parse(data);
      this.metrics = { ...this.metrics, ...historical };
      console.log('📈 Loaded historical metrics');
    } catch {
      console.log('🆕 Starting fresh analytics tracking');
    }
  }

  async startAnalytics() {
    console.log('🔍 Starting advanced analytics monitoring...\n');
    
    // Initial analytics scan
    await this.collectMetrics();
    
    // Set up analytics interval
    const analyticsInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.generateInsights();
      await this.displayAnalytics();
    }, 15000); // Analytics every 15 seconds

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n📊 Final Analytics Report:');
      clearInterval(analyticsInterval);
      this.generateFinalReport().then(() => process.exit(0));
    });
  }

  async collectMetrics() {
    const timestamp = Date.now();
    
    // Collect current state metrics
    const deepCapture = await this.analyzeDeepCapture();
    const roleBasedCapture = await this.analyzeRoleBasedCapture();
    
    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(timestamp, deepCapture, roleBasedCapture);
    
    // Update historical data
    this.metrics.captureHistory.push({
      timestamp,
      deepCapture,
      roleBasedCapture,
      performance: performanceMetrics
    });

    // Keep only last 100 data points
    if (this.metrics.captureHistory.length > 100) {
      this.metrics.captureHistory = this.metrics.captureHistory.slice(-100);
    }

    await this.saveMetrics();
  }

  async analyzeDeepCapture() {
    try {
      const deepDir = path.join(this.screenshotsDir, 'comprehensive');
      const files = await fs.readdir(deepDir).catch(() => []);
      
      const analysis = {
        totalFiles: files.length,
        mainScreenshots: files.filter(f => f.endsWith('-main.png')).length,
        interactiveElements: {
          dropdowns: files.filter(f => f.includes('-dropdown-')).length,
          forms: files.filter(f => f.includes('-form-')).length,
          modals: files.filter(f => f.includes('-modal-')).length
        },
        moduleBreakdown: await this.getModuleBreakdown(files),
        averageFileSize: await this.getAverageFileSize(deepDir, files),
        qualityMetrics: await this.assessImageQuality(deepDir, files.slice(0, 5)) // Sample 5 files
      };

      return analysis;
    } catch (error) {
      return { error: error.message, totalFiles: 0 };
    }
  }

  async analyzeRoleBasedCapture() {
    try {
      const roleDir = path.join(this.screenshotsDir, 'role-based');
      const files = await fs.readdir(roleDir).catch(() => []);
      
      const analysis = {
        totalFiles: files.length,
        roleDistribution: await this.getRoleDistribution(files),
        routeDistribution: await this.getRouteDistribution(files),
        averageFileSize: await this.getAverageFileSize(roleDir, files),
        completionMatrix: await this.getCompletionMatrix(files)
      };

      return analysis;
    } catch (error) {
      return { error: error.message, totalFiles: 0 };
    }
  }

  calculatePerformanceMetrics(timestamp, deepCapture, roleBasedCapture) {
    const elapsedMinutes = (timestamp - this.metrics.startTime) / (1000 * 60);
    
    const metrics = {
      captureRate: {
        deep: elapsedMinutes > 0 ? (deepCapture.mainScreenshots / elapsedMinutes).toFixed(2) : 0,
        roleBased: elapsedMinutes > 0 ? (roleBasedCapture.totalFiles / elapsedMinutes).toFixed(2) : 0
      },
      throughput: {
        totalScreenshotsPerMinute: elapsedMinutes > 0 ? 
          ((deepCapture.totalFiles + roleBasedCapture.totalFiles) / elapsedMinutes).toFixed(2) : 0
      },
      efficiency: {
        interactiveElementsRatio: deepCapture.mainScreenshots > 0 ? 
          ((deepCapture.interactiveElements.dropdowns + deepCapture.interactiveElements.forms + deepCapture.interactiveElements.modals) / deepCapture.mainScreenshots).toFixed(2) : 0
      }
    };

    return metrics;
  }

  async getModuleBreakdown(files) {
    const modules = {};
    const knownModules = [
      'inventory-management', 'procurement', 'vendor-management', 
      'product-management', 'operational-planning', 'store-operations',
      'reporting-analytics', 'finance', 'system-administration', 'dashboard'
    ];

    knownModules.forEach(module => modules[module] = 0);
    modules.other = 0;

    files.forEach(file => {
      if (file.endsWith('-main.png')) {
        const found = knownModules.find(module => file.startsWith(module));
        if (found) {
          modules[found]++;
        } else {
          modules.other++;
        }
      }
    });

    return modules;
  }

  async getRoleDistribution(files) {
    const roles = {
      'staff': 0, 'department-manager': 0, 'financial-manager': 0,
      'purchasing-staff': 0, 'counter': 0, 'chef': 0
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

  async getRouteDistribution(files) {
    const routes = {};
    
    files.forEach(file => {
      const routeMatch = file.match(/^([^-]+(?:-[^-]+)*)-(?:staff|department-manager|financial-manager|purchasing-staff|counter|chef)\.png$/);
      if (routeMatch) {
        const route = routeMatch[1];
        routes[route] = (routes[route] || 0) + 1;
      }
    });

    return routes;
  }

  async getCompletionMatrix(files) {
    const roles = ['staff', 'department-manager', 'financial-manager', 'purchasing-staff', 'counter', 'chef'];
    const routes = [...new Set(files.map(f => {
      const match = f.match(/^([^-]+(?:-[^-]+)*)-(?:staff|department-manager|financial-manager|purchasing-staff|counter|chef)\.png$/);
      return match ? match[1] : null;
    }).filter(Boolean))];

    const matrix = {};
    routes.forEach(route => {
      matrix[route] = {};
      roles.forEach(role => {
        matrix[route][role] = files.includes(`${route}-${role}.png`);
      });
    });

    return matrix;
  }

  async getAverageFileSize(dir, files) {
    try {
      let totalSize = 0;
      let count = 0;

      for (const file of files.slice(0, 20)) { // Sample first 20 files
        try {
          const stats = await fs.stat(path.join(dir, file));
          totalSize += stats.size;
          count++;
        } catch {
          // Skip files that can't be read
        }
      }

      return count > 0 ? Math.round(totalSize / count / 1024) : 0; // KB
    } catch {
      return 0;
    }
  }

  async assessImageQuality(dir, sampleFiles) {
    // Simplified quality assessment based on file size consistency
    let sizes = [];
    
    for (const file of sampleFiles) {
      try {
        const stats = await fs.stat(path.join(dir, file));
        sizes.push(stats.size);
      } catch {
        // Skip
      }
    }

    if (sizes.length === 0) return { score: 0, assessment: 'no-data' };

    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const variance = sizes.reduce((acc, size) => acc + Math.pow(size - avg, 2), 0) / sizes.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev / avg * 100));

    return {
      score: Math.round(consistencyScore),
      assessment: consistencyScore > 80 ? 'excellent' : 
                 consistencyScore > 60 ? 'good' : 
                 consistencyScore > 40 ? 'fair' : 'needs-review',
      averageSize: Math.round(avg / 1024), // KB
      consistency: `${Math.round(consistencyScore)}%`
    };
  }

  async generateInsights() {
    const latest = this.metrics.captureHistory[this.metrics.captureHistory.length - 1];
    if (!latest) return;

    // Generate predictions
    this.metrics.predictions = await this.generatePredictions(latest);
    
    // Calculate quality insights
    this.metrics.qualityMetrics = await this.calculateQualityMetrics(latest);
  }

  async generatePredictions(latest) {
    const history = this.metrics.captureHistory;
    if (history.length < 3) return { status: 'insufficient-data' };

    // Calculate capture velocity (screenshots per minute)
    const recentHistory = history.slice(-5);
    const timeSpan = recentHistory[recentHistory.length - 1].timestamp - recentHistory[0].timestamp;
    const screenshotIncrease = recentHistory[recentHistory.length - 1].deepCapture.mainScreenshots - 
                              recentHistory[0].deepCapture.mainScreenshots;
    
    const velocity = timeSpan > 0 ? (screenshotIncrease / (timeSpan / 1000 / 60)) : 0;

    // Predict completion times
    const remainingDeepRoutes = 105 - latest.deepCapture.mainScreenshots;
    const remainingRoleCombinations = 60 - latest.roleBasedCapture.totalFiles;
    
    const predictions = {
      velocity: velocity.toFixed(2),
      deepCaptureETA: velocity > 0 ? Math.ceil(remainingDeepRoutes / velocity) : null,
      roleBasedETA: velocity > 0 ? Math.ceil(remainingRoleCombinations / velocity) : null,
      overallCompletion: new Date(Date.now() + (velocity > 0 ? Math.max(remainingDeepRoutes, remainingRoleCombinations) / velocity * 60 * 1000 : 0)).toLocaleTimeString()
    };

    return predictions;
  }

  async calculateQualityMetrics(latest) {
    return {
      imageQuality: latest.deepCapture.qualityMetrics || { score: 0, assessment: 'unknown' },
      captureCompleteness: {
        interactiveElementsRatio: latest.deepCapture.mainScreenshots > 0 ? 
          (latest.deepCapture.interactiveElements.dropdowns + latest.deepCapture.interactiveElements.forms + latest.deepCapture.interactiveElements.modals) / latest.deepCapture.mainScreenshots : 0,
        roleDistributionBalance: this.calculateRoleBalance(latest.roleBasedCapture.roleDistribution)
      }
    };
  }

  calculateRoleBalance(roleDistribution) {
    const values = Object.values(roleDistribution || {});
    if (values.length === 0) return 0;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    return Math.max(0, 100 - Math.sqrt(variance));
  }

  async displayAnalytics() {
    const latest = this.metrics.captureHistory[this.metrics.captureHistory.length - 1];
    if (!latest) return;

    console.clear();
    console.log('📊 CARMEN ERP DOCUMENTATION - ADVANCED ANALYTICS\n');
    console.log('═'.repeat(80));
    
    // Performance Metrics
    console.log('⚡ PERFORMANCE ANALYTICS');
    console.log(`   Capture Velocity: ${latest.performance.captureRate.deep} routes/min (deep)`);
    console.log(`   Throughput: ${latest.performance.throughput.totalScreenshotsPerMinute} screenshots/min`);
    console.log(`   Interactive Ratio: ${latest.performance.efficiency.interactiveElementsRatio}:1 (elements per route)`);
    
    if (this.metrics.predictions.velocity) {
      console.log(`   ETA Predictions:`);
      console.log(`     • Deep Capture: ${this.metrics.predictions.deepCaptureETA} min remaining`);
      console.log(`     • Role-Based: ${this.metrics.predictions.roleBasedETA} min remaining`);
      console.log(`     • Overall: ${this.metrics.predictions.overallCompletion}`);
    }
    
    console.log();
    
    // Quality Metrics
    console.log('🎯 QUALITY ANALYTICS');
    const quality = this.metrics.qualityMetrics;
    if (quality.imageQuality) {
      console.log(`   Image Quality: ${quality.imageQuality.assessment} (${quality.imageQuality.score}% consistency)`);
      console.log(`   Average Size: ${quality.imageQuality.averageSize} KB`);
    }
    if (quality.captureCompleteness) {
      console.log(`   Interactive Coverage: ${(quality.captureCompleteness.interactiveElementsRatio * 100).toFixed(0)}%`);
      console.log(`   Role Balance: ${quality.captureCompleteness.roleDistributionBalance.toFixed(0)}%`);
    }
    
    console.log();
    
    // Module Progress
    console.log('📈 MODULE PROGRESS');
    const modules = latest.deepCapture.moduleBreakdown || {};
    const topModules = Object.entries(modules)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
      
    topModules.forEach(([module, count]) => {
      const percentage = Math.round((count / 105) * 100 * 12); // Estimate
      console.log(`   ${module.padEnd(25)} [${'█'.repeat(Math.min(percentage / 5, 20))}${' '.repeat(Math.max(0, 20 - percentage / 5))}] ${count} routes`);
    });
    
    console.log();
    
    // Storage Analytics
    const totalFiles = latest.deepCapture.totalFiles + latest.roleBasedCapture.totalFiles;
    const estimatedSize = totalFiles * (latest.deepCapture.averageFileSize || 100); // KB
    console.log('💾 STORAGE ANALYTICS');
    console.log(`   Total Files: ${totalFiles}`);
    console.log(`   Estimated Size: ${(estimatedSize / 1024).toFixed(1)} MB`);
    console.log(`   Avg File Size: ${latest.deepCapture.averageFileSize || 0} KB`);
    
    console.log('\n' + '═'.repeat(80));
    console.log(`Analytics Updated: ${new Date().toLocaleTimeString()}`);
    console.log('Press Ctrl+C to generate final analytics report\n');
  }

  async generateFinalReport() {
    const reportData = {
      summary: {
        totalAnalyticsTime: Date.now() - this.metrics.startTime,
        dataPoints: this.metrics.captureHistory.length,
        finalMetrics: this.metrics.captureHistory[this.metrics.captureHistory.length - 1],
        predictions: this.metrics.predictions,
        qualityAssessment: this.metrics.qualityMetrics
      },
      historicalData: this.metrics.captureHistory
    };

    // Save detailed analytics report
    await fs.writeFile(
      path.join(this.analyticsDir, 'final-analytics-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    // Generate human-readable report
    const humanReport = this.generateHumanReadableReport(reportData);
    await fs.writeFile(
      path.join(this.analyticsDir, 'ANALYTICS_REPORT.md'),
      humanReport
    );

    console.log('\n📊 Analytics Summary:');
    console.log(`   Total Monitoring Time: ${this.formatDuration(reportData.summary.totalAnalyticsTime)}`);
    console.log(`   Data Points Collected: ${reportData.summary.dataPoints}`);
    console.log(`   Final Capture Rate: ${reportData.summary.finalMetrics?.performance?.captureRate?.deep || 0} routes/min`);
    console.log(`   Reports Saved: ${this.analyticsDir}`);
  }

  generateHumanReadableReport(data) {
    const final = data.summary.finalMetrics;
    
    return `# Carmen ERP Documentation - Analytics Report

**Generated**: ${new Date().toISOString()}  
**Monitoring Duration**: ${this.formatDuration(data.summary.totalAnalyticsTime)}  
**Data Points**: ${data.summary.dataPoints}  

## Performance Summary

- **Capture Velocity**: ${final?.performance?.captureRate?.deep || 0} routes/min
- **Total Throughput**: ${final?.performance?.throughput?.totalScreenshotsPerMinute || 0} screenshots/min  
- **Interactive Element Ratio**: ${final?.performance?.efficiency?.interactiveElementsRatio || 0}:1

## Quality Assessment

- **Image Quality**: ${data.summary.qualityAssessment?.imageQuality?.assessment || 'unknown'}
- **Consistency Score**: ${data.summary.qualityAssessment?.imageQuality?.score || 0}%
- **Role Distribution Balance**: ${data.summary.qualityAssessment?.captureCompleteness?.roleDistributionBalance?.toFixed(0) || 0}%

## Final Statistics

- **Deep Capture Routes**: ${final?.deepCapture?.mainScreenshots || 0}/105
- **Role Combinations**: ${final?.roleBasedCapture?.totalFiles || 0}/60
- **Total Screenshots**: ${(final?.deepCapture?.totalFiles || 0) + (final?.roleBasedCapture?.totalFiles || 0)}
- **Estimated Storage**: ${(((final?.deepCapture?.totalFiles || 0) + (final?.roleBasedCapture?.totalFiles || 0)) * 100 / 1024).toFixed(1)} MB

## Predictions (Final)

${data.summary.predictions?.velocity ? `
- **Completion Velocity**: ${data.summary.predictions.velocity} routes/min
- **Projected Completion**: ${data.summary.predictions.overallCompletion}
` : '- Predictions: Insufficient data'}

---

*This report provides comprehensive analytics on the Carmen ERP documentation capture process.*`;
  }

  async saveMetrics() {
    try {
      await fs.writeFile(
        this.metricsFile, 
        JSON.stringify(this.metrics, null, 2)
      );
    } catch (error) {
      // Silent fail for metrics file
    }
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Start analytics if run directly
if (require.main === module) {
  const analytics = new DocumentationAnalyticsDashboard();
  analytics.initialize().catch(console.error);
}

module.exports = DocumentationAnalyticsDashboard;