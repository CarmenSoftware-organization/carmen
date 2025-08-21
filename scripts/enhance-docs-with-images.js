#!/usr/bin/env node

/**
 * Carmen ERP Documentation Enhancement Script
 * Automatically integrates captured screenshots into documentation files
 */

const fs = require('fs').promises;
const path = require('path');
const screenMapping = require('./screen-route-mapping.json');

// Paths
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'prd', 'output', 'screens');
const IMAGES_DIR = path.join(DOCS_DIR, 'images');

// Image enhancement configuration
const IMAGE_CONFIG = {
  imageFormats: ['png', 'jpg', 'jpeg'],
  maxWidth: 1200,
  thumbnailWidth: 400,
  viewports: ['desktop', 'tablet', 'mobile'],
  modalPriority: [
    'create-pr-modal',
    'item-details-modal',
    'fractional-sales-modal',
    'vendor-comparison-modal',
    'approval-modal',
    'settings-modal'
  ]
};

// Documentation templates for image insertion
const IMAGE_TEMPLATES = {
  screenHeader: (screenName, description) => `
## Visual Interface

![${screenName} Main Interface](./images/${screenName}/${screenName}-default.png)
*${description}*
`,

  modalSection: (modalName, description) => `
### ${modalName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}

![${modalName}](./images/${getScreenNameFromModal(modalName)}/${getScreenNameFromModal(modalName)}-${modalName}.png)
*${description}*
`,

  stateComparison: (screenName, states) => `
### Interface States

The ${screenName} interface supports multiple visual states:

${states.map(state => `
#### ${state.charAt(0).toUpperCase() + state.slice(1)} State
![${screenName} - ${state}](./images/${screenName}/${screenName}-${state}.png)
`).join('\n')}
`,

  responsiveShowcase: (screenName) => `
### Responsive Design

The interface adapts seamlessly across different device sizes:

<div class="responsive-showcase">

**Desktop View (1920x1080)**
![Desktop View](./images/${screenName}/${screenName}-default.png)

**Tablet View (1366x768)**  
![Tablet View](./images/${screenName}-tablet/${screenName}-tablet-default.png)

**Mobile View (390x844)**
![Mobile View](./images/${screenName}-mobile/${screenName}-mobile-default.png)

</div>
`,

  fractionalSalesSection: (screenName) => `
## Fractional Sales Features

This screen includes specialized support for fractional sales management:

![Fractional Sales Modal](./images/${screenName}/${screenName}-fractional-sales-modal.png)
*Fractional sales configuration interface supporting pizza slices, cake portions, and other divisible products*

### Key Fractional Features:
- **Multi-yield Recipe Support**: Configure different portion sizes and yields
- **Automatic Inventory Calculation**: Real-time inventory deduction based on fractional sales
- **Price Optimization**: Portion-based pricing with margin analysis
- **POS Integration**: Seamless integration with point-of-sale systems
`
};

// Helper functions
function getScreenNameFromModal(modalName) {
  // Extract screen name from modal name or use mapping
  for (const [screenKey, config] of Object.entries(screenMapping.screenRouteMapping.screens)) {
    if (config.modals && config.modals[modalName]) {
      return config.documentationFile.match(/([^/]+)-screen\.md$/)?.[1] || screenKey;
    }
  }
  return modalName.split('-')[0];
}

function getDocumentationFilePath(screenKey) {
  const config = screenMapping.screenRouteMapping.screens[screenKey];
  return config ? path.join(__dirname, '..', config.documentationFile) : null;
}

async function findAvailableImages(screenName) {
  const screenImagesDir = path.join(IMAGES_DIR, screenName);
  const images = {
    base: [],
    modals: [],
    states: [],
    responsive: {
      desktop: [],
      tablet: [],
      mobile: []
    }
  };

  try {
    const files = await fs.readdir(screenImagesDir);
    
    for (const file of files) {
      const filePath = path.join(screenImagesDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && IMAGE_CONFIG.imageFormats.some(ext => file.endsWith(`.${ext}`))) {
        if (file.includes('-modal')) {
          images.modals.push(file);
        } else if (file.includes('-default')) {
          images.base.push(file);
        } else if (file.includes('-loading') || file.includes('-error') || file.includes('-empty')) {
          images.states.push(file);
        } else {
          images.base.push(file);
        }
      }
    }

    // Check for responsive variants
    for (const viewport of IMAGE_CONFIG.viewports) {
      const responsiveDir = path.join(IMAGES_DIR, `${screenName}-${viewport}`);
      try {
        const responsiveFiles = await fs.readdir(responsiveDir);
        images.responsive[viewport] = responsiveFiles.filter(file => 
          IMAGE_CONFIG.imageFormats.some(ext => file.endsWith(`.${ext}`))
        );
      } catch (e) {
        // Directory doesn't exist, skip
      }
    }

  } catch (error) {
    console.warn(`⚠ Could not read images for ${screenName}: ${error.message}`);
  }

  return images;
}

async function insertImagesIntoDocumentation(screenKey, screenConfig) {
  const docPath = getDocumentationFilePath(screenKey);
  if (!docPath) {
    console.warn(`⚠ No documentation file found for ${screenKey}`);
    return false;
  }

  try {
    // Read current documentation
    const content = await fs.readFile(docPath, 'utf8');
    
    // Extract screen name from documentation file name
    const screenName = path.basename(docPath).replace('-screen.md', '');
    
    // Find available images
    const images = await findAvailableImages(screenName);
    
    if (images.base.length === 0 && images.modals.length === 0) {
      console.log(`📷 No images found for ${screenName}, skipping enhancement`);
      return false;
    }

    let enhancedContent = content;
    let hasChanges = false;

    // Insert main interface screenshot after implementation overview
    if (images.base.length > 0 && !content.includes('## Visual Interface')) {
      const insertPoint = content.indexOf('## Layout & Navigation');
      if (insertPoint > -1) {
        const imageSection = IMAGE_TEMPLATES.screenHeader(
          screenName, 
          `Main interface showing ${screenConfig.route} with all primary navigation and content areas`
        );
        enhancedContent = enhancedContent.slice(0, insertPoint) + imageSection + '\n' + enhancedContent.slice(insertPoint);
        hasChanges = true;
      }
    }

    // Add modal documentation
    if (images.modals.length > 0 && !content.includes('### Modal Interactions')) {
      const modalSection = '\n## Modal Interactions\n\nThe interface includes several modal dialogs for enhanced functionality:\n\n';
      let modalContent = modalSection;

      // Sort modals by priority
      const sortedModals = images.modals.sort((a, b) => {
        const modalA = a.replace(`${screenName}-`, '').replace('.png', '');
        const modalB = b.replace(`${screenName}-`, '').replace('.png', '');
        const priorityA = IMAGE_CONFIG.modalPriority.indexOf(modalA);
        const priorityB = IMAGE_CONFIG.modalPriority.indexOf(modalB);
        
        if (priorityA === -1 && priorityB === -1) return 0;
        if (priorityA === -1) return 1;
        if (priorityB === -1) return -1;
        return priorityA - priorityB;
      });

      for (const modalFile of sortedModals) {
        const modalName = modalFile.replace(`${screenName}-`, '').replace('.png', '');
        const modalConfig = screenConfig.modals?.[modalName];
        const description = modalConfig?.description || `${modalName} interface for enhanced functionality`;
        
        modalContent += IMAGE_TEMPLATES.modalSection(modalName, description);
      }

      // Insert before final section
      const insertPoint = content.lastIndexOf('## Current Limitations') || 
                          content.lastIndexOf('## Business Rules') ||
                          content.length;
      
      enhancedContent = enhancedContent.slice(0, insertPoint) + modalContent + '\n' + enhancedContent.slice(insertPoint);
      hasChanges = true;
    }

    // Add state variations if available
    if (images.states.length > 0 && !content.includes('### Interface States')) {
      const states = images.states.map(file => 
        file.replace(`${screenName}-`, '').replace('.png', '')
      );
      const stateSection = IMAGE_TEMPLATES.stateComparison(screenName, states);
      
      const insertPoint = content.indexOf('## Current Limitations') || content.length;
      enhancedContent = enhancedContent.slice(0, insertPoint) + stateSection + '\n' + enhancedContent.slice(insertPoint);
      hasChanges = true;
    }

    // Add responsive showcase if responsive images exist
    const hasResponsiveImages = Object.values(images.responsive).some(arr => arr.length > 0);
    if (hasResponsiveImages && !content.includes('### Responsive Design')) {
      const responsiveSection = IMAGE_TEMPLATES.responsiveShowcase(screenName);
      
      const insertPoint = content.indexOf('## Current Limitations') || content.length;
      enhancedContent = enhancedContent.slice(0, insertPoint) + responsiveSection + '\n' + enhancedContent.slice(insertPoint);
      hasChanges = true;
    }

    // Add fractional sales section for supported screens
    if (screenConfig.fractionalSalesSupport && 
        images.modals.some(img => img.includes('fractional-sales')) &&
        !content.includes('## Fractional Sales Features')) {
      
      const fractionalSection = IMAGE_TEMPLATES.fractionalSalesSection(screenName);
      
      const insertPoint = content.indexOf('## Current Limitations') || content.length;
      enhancedContent = enhancedContent.slice(0, insertPoint) + fractionalSection + '\n' + enhancedContent.slice(insertPoint);
      hasChanges = true;
    }

    // Save enhanced documentation
    if (hasChanges) {
      await fs.writeFile(docPath, enhancedContent);
      console.log(`✅ Enhanced ${screenName} documentation with ${images.base.length + images.modals.length} images`);
      return true;
    } else {
      console.log(`📝 ${screenName} documentation already contains images`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error enhancing ${screenKey} documentation: ${error.message}`);
    return false;
  }
}

async function generateImageIndex() {
  const indexPath = path.join(IMAGES_DIR, 'README.md');
  const screens = Object.entries(screenMapping.screenRouteMapping.screens);
  
  let indexContent = `# Carmen ERP Screenshots Index

This directory contains comprehensive screenshots for all Carmen ERP screens, including base states, modal interactions, and responsive variants.

## Generated: ${new Date().toISOString()}

## Screen Coverage

`;

  // Add fractional sales priority section
  const fractionalScreens = screenMapping.screenRouteMapping.fractionalSalesScreens;
  indexContent += `### Fractional Sales Screens (Priority)\n\n`;
  for (const screenKey of fractionalScreens) {
    const config = screenMapping.screenRouteMapping.screens[screenKey];
    if (config) {
      const screenName = config.documentationFile.match(/([^/]+)-screen\.md$/)?.[1] || screenKey;
      indexContent += `- **${screenName}**: ${config.route}\n`;
      indexContent += `  - Base states: default, loading, error\n`;
      indexContent += `  - Modals: ${Object.keys(config.modals || {}).join(', ')}\n`;
      indexContent += `  - Documentation: [${config.documentationFile}](../${path.basename(config.documentationFile)})\n\n`;
    }
  }

  indexContent += `### All Screens\n\n`;
  for (const [screenKey, config] of screens) {
    const screenName = config.documentationFile.match(/([^/]+)-screen\.md$/)?.[1] || screenKey;
    indexContent += `#### ${screenName}\n`;
    indexContent += `- **Route**: ${config.route}\n`;
    indexContent += `- **Component**: ${config.component}\n`;
    indexContent += `- **Fractional Sales**: ${config.fractionalSalesSupport ? '✅' : '❌'}\n`;
    
    if (config.modals && Object.keys(config.modals).length > 0) {
      indexContent += `- **Modals**: ${Object.keys(config.modals).join(', ')}\n`;
    }
    
    indexContent += `- **Documentation**: [${path.basename(config.documentationFile)}](../${path.basename(config.documentationFile)})\n\n`;
  }

  indexContent += `
## Image Naming Convention

### Base Screenshots
- \`{screen-name}-default.png\`: Default screen state
- \`{screen-name}-loading.png\`: Loading state
- \`{screen-name}-error.png\`: Error state
- \`{screen-name}-empty.png\`: Empty state

### Modal Screenshots  
- \`{screen-name}-{modal-name}.png\`: Modal dialog captures
- Example: \`purchase-request-detail-item-details-modal.png\`

### Responsive Variants
- \`{screen-name}-tablet/\`: Tablet viewport (1366x768)
- \`{screen-name}-mobile/\`: Mobile viewport (390x844)

## Fractional Sales Priority

These screens receive priority for screenshot capture and documentation:
${fractionalScreens.map(screen => `- ${screen}`).join('\n')}

## Usage in Documentation

Screenshots are automatically integrated into documentation using the enhancement script:

\`\`\`bash
node scripts/enhance-docs-with-images.js
\`\`\`

This updates all \`.md\` files in the screens directory with appropriate image references.
`;

  await fs.writeFile(indexPath, indexContent);
  console.log('📚 Generated image index at images/README.md');
}

async function enhanceAllDocumentation() {
  console.log('🎨 Starting documentation enhancement with screenshots...');
  
  const screens = Object.entries(screenMapping.screenRouteMapping.screens);
  let enhanced = 0;
  let skipped = 0;
  
  for (const [screenKey, screenConfig] of screens) {
    const result = await insertImagesIntoDocumentation(screenKey, screenConfig);
    if (result) {
      enhanced++;
    } else {
      skipped++;
    }
  }

  // Generate image index
  await generateImageIndex();
  
  console.log(`\n✅ Documentation enhancement completed:`);
  console.log(`   📸 ${enhanced} files enhanced with images`);
  console.log(`   📝 ${skipped} files skipped (no images or already enhanced)`);
  console.log(`   📚 Generated comprehensive image index`);
  
  return { enhanced, skipped };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Carmen ERP Documentation Enhancement Tool

Usage: node enhance-docs-with-images.js [options]

Options:
  --help, -h          Show this help message
  --generate-index    Generate image index only
  --screen <name>     Enhance specific screen only

Examples:
  node enhance-docs-with-images.js
  node enhance-docs-with-images.js --screen purchase-requests
  node enhance-docs-with-images.js --generate-index
`);
    process.exit(0);
  }

  if (args.includes('--generate-index')) {
    generateImageIndex().catch(console.error);
  } else if (args.includes('--screen')) {
    const screenIndex = args.indexOf('--screen');
    const screenName = args[screenIndex + 1];
    if (screenName) {
      const config = screenMapping.screenRouteMapping.screens[screenName];
      if (config) {
        insertImagesIntoDocumentation(screenName, config).catch(console.error);
      } else {
        console.error(`❌ Screen not found: ${screenName}`);
        process.exit(1);
      }
    }
  } else {
    enhanceAllDocumentation().catch(console.error);
  }
}

module.exports = {
  enhanceAllDocumentation,
  insertImagesIntoDocumentation,
  generateImageIndex
};