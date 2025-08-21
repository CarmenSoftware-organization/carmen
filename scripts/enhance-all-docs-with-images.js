const fs = require('fs').promises;
const path = require('path');

// Screen to image mappings based on capture results
const screenImageMappings = [
  // High Priority Screens
  {
    specFile: 'main-dashboard-screen.md',
    imagePath: './images/main-dashboard/main-dashboard-default.png',
    imageAlt: 'Main Dashboard Interface',
    description: 'Executive overview dashboard displaying real-time metrics, charts, and operational performance tracking for Carmen hospitality ERP'
  },
  {
    specFile: 'operational-dashboard-fractional-screen.md',
    imagePath: './images/operational-dashboard-fractional/operational-dashboard-fractional-default.png',
    imageAlt: 'Operational Dashboard with Fractional Sales',
    description: 'Operational planning dashboard showcasing fractional sales analytics, recipe management, and production forecasting capabilities'
  },
  {
    specFile: 'purchase-order-detail-screen.md',
    imagePath: './images/purchase-order-detail/purchase-order-detail-default.png',
    imageAlt: 'Purchase Order Detail View',
    description: 'Comprehensive purchase order management interface showing detailed item information, vendor details, and approval workflows'
  },
  {
    specFile: 'goods-received-note-detail-screen.md',
    imagePath: './images/goods-received-note-detail/goods-received-note-detail-default.png',
    imageAlt: 'Goods Received Note Detail View',
    description: 'Detailed goods received note interface for validating deliveries, managing discrepancies, and updating inventory records'
  },
  {
    specFile: 'vendor-detail-screen.md',
    imagePath: './images/vendor-detail/vendor-detail-default.png',
    imageAlt: 'Vendor Detail Profile View',
    description: 'Comprehensive vendor profile management interface showing contact details, certifications, pricing information, and relationship management'
  },
  {
    specFile: 'vendor-list-screen.md',
    imagePath: './images/vendor-list/vendor-list-default.png',
    imageAlt: 'Vendor List Management View',
    description: 'Vendor directory interface with search, filtering, and management capabilities for supplier relationship management'
  },
  {
    specFile: 'inventory-adjustment-detail-screen.md',
    imagePath: './images/inventory-adjustment-detail/inventory-adjustment-detail-default.png',
    imageAlt: 'Inventory Adjustment Detail View',
    description: 'Detailed inventory adjustment interface for managing stock variance corrections, approval workflows, and audit documentation'
  },
  {
    specFile: 'consumption-analytics-fractional-screen.md',
    imagePath: './images/consumption-analytics-fractional/consumption-analytics-fractional-default.png',
    imageAlt: 'Consumption Analytics with Fractional Sales',
    description: 'Advanced consumption analytics dashboard featuring fractional sales analysis, usage patterns, and cost optimization insights'
  },

  // Medium Priority Overview Screens
  {
    specFile: 'vendor-management-overview-screen.md',
    imagePath: './images/vendor-management-overview/vendor-management-overview-default.png',
    imageAlt: 'Vendor Management Overview',
    description: 'Vendor management module overview displaying key metrics, recent activities, and navigation to vendor management functions'
  },
  {
    specFile: 'inventory-management-overview-screen.md',
    imagePath: './images/inventory-management-overview/inventory-management-overview-default.png',
    imageAlt: 'Inventory Management Overview',
    description: 'Inventory management module overview showing stock levels, recent transactions, and access to inventory control functions'
  },
  {
    specFile: 'store-operations-overview-screen.md',
    imagePath: './images/store-operations-overview/store-operations-overview-default.png',
    imageAlt: 'Store Operations Overview',
    description: 'Store operations module overview displaying inter-store activities, requisition summaries, and operational workflow management'
  },
  {
    specFile: 'stock-balance-report-screen.md',
    imagePath: './images/stock-balance-report/stock-balance-report-default.png',
    imageAlt: 'Stock Balance Report View',
    description: 'Comprehensive stock balance reporting interface showing current inventory levels, valuation, and variance analysis'
  },
  {
    specFile: 'my-approvals-screen.md',
    imagePath: './images/my-approvals/my-approvals-default.png',
    imageAlt: 'My Approvals Workflow View',
    description: 'Personal approval dashboard displaying pending approvals, workflow status, and decision-making interface across all modules'
  }
];

async function enhanceDocumentationWithImages() {
  console.log('🖼️ Starting documentation enhancement with screenshots...');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const results = [];

  for (const mapping of screenImageMappings) {
    try {
      const specPath = path.join('docs/prd/output/screens', mapping.specFile);
      
      // Check if spec file exists
      try {
        await fs.access(specPath);
      } catch (accessError) {
        console.log(`⚠️ Spec file not found: ${mapping.specFile}`);
        results.push({
          file: mapping.specFile,
          status: 'skip',
          reason: 'file not found'
        });
        skipCount++;
        continue;
      }

      // Read current content
      const currentContent = await fs.readFile(specPath, 'utf-8');
      
      // Check if already has Visual Interface section
      if (currentContent.includes('## Visual Interface')) {
        console.log(`⏭️ Already enhanced: ${mapping.specFile}`);
        results.push({
          file: mapping.specFile,
          status: 'skip',
          reason: 'already enhanced'
        });
        skipCount++;
        continue;
      }

      // Find insertion point (after Implementation Overview)
      const lines = currentContent.split('\n');
      let insertIndex = -1;
      
      // Look for common insertion points
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('## Layout & Navigation') || 
            line.startsWith('## Layout') || 
            line.startsWith('### Header Area') ||
            line.startsWith('**Header Area')) {
          insertIndex = i;
          break;
        }
      }

      if (insertIndex === -1) {
        console.log(`⚠️ Could not find insertion point in: ${mapping.specFile}`);
        results.push({
          file: mapping.specFile,
          status: 'skip',
          reason: 'no insertion point found'
        });
        skipCount++;
        continue;
      }

      // Create Visual Interface section
      const visualInterfaceSection = [
        '',
        '## Visual Interface',
        '',
        `![${mapping.imageAlt}](${mapping.imagePath})`,
        `*${mapping.description}*`,
        ''
      ];

      // Insert the section
      lines.splice(insertIndex, 0, ...visualInterfaceSection);
      
      // Write updated content
      const updatedContent = lines.join('\n');
      await fs.writeFile(specPath, updatedContent, 'utf-8');
      
      console.log(`✅ Enhanced: ${mapping.specFile}`);
      results.push({
        file: mapping.specFile,
        status: 'success',
        imagePath: mapping.imagePath
      });
      successCount++;
      
    } catch (error) {
      console.log(`❌ Error enhancing ${mapping.specFile}: ${error.message}`);
      results.push({
        file: mapping.specFile,
        status: 'error',
        error: error.message
      });
      errorCount++;
    }
  }

  // Generate enhancement report
  const enhancementReport = {
    timestamp: new Date().toISOString(),
    total_files: screenImageMappings.length,
    successful_enhancements: successCount,
    skipped_files: skipCount,
    failed_enhancements: errorCount,
    success_rate: ((successCount / screenImageMappings.length) * 100).toFixed(1),
    results: results
  };

  const reportPath = 'docs/prd/output/screens/images/enhancement-report.json';
  await fs.writeFile(reportPath, JSON.stringify(enhancementReport, null, 2));

  console.log('\n📊 ENHANCEMENT SUMMARY');
  console.log('======================');
  console.log(`Total files: ${screenImageMappings.length}`);
  console.log(`✅ Enhanced: ${successCount}`);
  console.log(`⏭️ Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success rate: ${enhancementReport.success_rate}%`);
  console.log(`📝 Report saved: ${reportPath}`);

  // Show detailed results
  console.log('\n📋 DETAILED RESULTS');
  console.log('===================');
  results.forEach(result => {
    const statusIcon = result.status === 'success' ? '✅' : 
                      result.status === 'skip' ? '⏭️' : '❌';
    const reason = result.reason ? ` (${result.reason})` : '';
    const error = result.error ? ` - ${result.error}` : '';
    console.log(`${statusIcon} ${result.file}${reason}${error}`);
  });

  return enhancementReport;
}

// Handle script execution
if (require.main === module) {
  enhanceDocumentationWithImages()
    .then((report) => {
      console.log('\n🎉 Documentation enhancement completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during documentation enhancement:', error);
      process.exit(1);
    });
}

module.exports = { enhanceDocumentationWithImages, screenImageMappings };