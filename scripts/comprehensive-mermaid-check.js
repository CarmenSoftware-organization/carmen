#!/usr/bin/env node
/**
 * Comprehensive Mermaid 8.8.2 Compatibility Check
 *
 * Performs detailed analysis of all Mermaid diagrams for compatibility issues
 * with specific syntax features introduced after 8.8.2
 *
 * Usage: node comprehensive-mermaid-check.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = 'docs/app/vendor-management';

// Comprehensive compatibility checks for Mermaid 8.8.2
const COMPATIBILITY_CHECKS = [
  // Critical issues (not supported in 8.8.2)
  {
    name: 'Quadrant Chart',
    pattern: /^\s*quadrantChart/mi,
    severity: 'error',
    message: 'Quadrant charts were introduced in Mermaid 9.0+. Not supported in 8.8.2.'
  },
  {
    name: 'Mindmap Diagram',
    pattern: /^\s*mindmap/mi,
    severity: 'error',
    message: 'Mindmap diagrams were introduced in Mermaid 9.0+. Not supported in 8.8.2.'
  },
  {
    name: 'Timeline Diagram',
    pattern: /^\s*timeline\s*$/mi,
    severity: 'error',
    message: 'Timeline diagrams were introduced in Mermaid 9.0+. Not supported in 8.8.2.'
  },
  {
    name: 'Sankey Diagram',
    pattern: /^\s*sankey-beta/mi,
    severity: 'error',
    message: 'Sankey diagrams were introduced in Mermaid 10.0+. Not supported in 8.8.2.'
  },
  {
    name: 'XY Chart',
    pattern: /^\s*xychart/mi,
    severity: 'error',
    message: 'XY charts were introduced in Mermaid 10.0+. Not supported in 8.8.2.'
  },
  {
    name: 'Block Diagram',
    pattern: /^\s*block-beta/mi,
    severity: 'error',
    message: 'Block diagrams were introduced in Mermaid 10.0+. Not supported in 8.8.2.'
  },

  // Warnings (limited or changed support)
  {
    name: 'GitGraph Advanced Features',
    pattern: /gitGraph[\s\S]{0,500}(type:|tag:|rotateCommitLabel:)/,
    severity: 'warning',
    message: 'Advanced GitGraph features may not work correctly in 8.8.2.'
  },
  {
    name: 'Class Diagram Generic Types',
    pattern: /classDiagram[\s\S]{0,500}~[^~]+~/,
    severity: 'warning',
    message: 'Generic type syntax in class diagrams may not render in 8.8.2.'
  },
  {
    name: 'Sequence Diagram Box Feature',
    pattern: /sequenceDiagram[\s\S]{0,500}\n\s*box\s+/,
    severity: 'warning',
    message: 'Box grouping in sequence diagrams has limited support in 8.8.2.'
  },
  {
    name: 'State Diagram Composite States V2',
    pattern: /stateDiagram-v2/,
    severity: 'warning',
    message: 'State diagram v2 syntax has limited support in 8.8.2. Use stateDiagram instead.'
  },
  {
    name: 'ER Diagram Cardinality Syntax',
    pattern: /erDiagram[\s\S]{0,500}\|\|--o\{/,
    severity: 'info',
    message: 'Complex ER diagram cardinality notation - verify rendering in 8.8.2.'
  },

  // Syntax issues
  {
    name: 'Link Opening in New Window',
    pattern: /click\s+\w+\s+"[^"]+"\s+"[^"]+"\s+_blank/,
    severity: 'warning',
    message: 'Link target="_blank" may not work correctly in 8.8.2.'
  },
  {
    name: 'Advanced Styling Classes',
    pattern: /classDef\s+\w+\s+[^;]+stroke-dasharray/,
    severity: 'info',
    message: 'Advanced stroke-dasharray styling - verify rendering in 8.8.2.'
  },
  {
    name: 'Subgraph Direction Syntax',
    pattern: /subgraph\s+\w+\s*\[direction\s*:\s*(TB|BT|LR|RL)\]/,
    severity: 'warning',
    message: 'Subgraph direction syntax may not work in 8.8.2. Use graph direction instead.'
  },
  {
    name: 'HTML Line Break Tags',
    pattern: /<br\s*\/?>/gi,
    severity: 'error',
    message: 'HTML <br/> tags are not supported in Mermaid 8.8.2. Use \\n for line breaks or remove breaks.'
  }
];

// Extract all Mermaid code blocks from a file
function extractMermaidBlocks(content, filename) {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  let blockIndex = 0;

  while ((match = mermaidRegex.exec(content)) !== null) {
    // Determine diagram type
    const diagramType = match[1].trim().split(/\s+/)[0];

    blocks.push({
      index: blockIndex++,
      content: match[1],
      diagramType: diagramType,
      fullMatch: match[0],
      startPos: match.index,
      filename: filename
    });
  }

  return blocks;
}

// Check a single Mermaid block for compatibility issues
function checkBlock(block) {
  const issues = [];

  for (const check of COMPATIBILITY_CHECKS) {
    if (check.pattern.test(block.content)) {
      issues.push({
        name: check.name,
        severity: check.severity,
        message: check.message,
        blockIndex: block.index,
        diagramType: block.diagramType,
        filename: block.filename
      });
    }
  }

  return issues;
}

// Get all markdown files recursively
function getAllMarkdownFiles(dir) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Analyze diagram type distribution
function analyzeDiagramTypes(allBlocks) {
  const typeCount = {};

  for (const block of allBlocks) {
    typeCount[block.diagramType] = (typeCount[block.diagramType] || 0) + 1;
  }

  return typeCount;
}

// Main analysis function
function analyzeAllFiles() {
  console.log('🔍 Comprehensive Mermaid 8.8.2 Compatibility Check\n');

  const files = getAllMarkdownFiles(DOCS_DIR);
  console.log(`📁 Found ${files.length} markdown files\n`);

  let totalBlocks = 0;
  let totalIssues = 0;
  const allBlocks = [];
  const issuesByFile = {};
  const issuesBySeverity = {
    error: 0,
    warning: 0,
    info: 0
  };

  // First pass: collect all blocks
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const blocks = extractMermaidBlocks(content, file);

    if (blocks.length === 0) continue;

    totalBlocks += blocks.length;
    allBlocks.push(...blocks);

    for (const block of blocks) {
      const issues = checkBlock(block);

      if (issues.length > 0) {
        if (!issuesByFile[file]) {
          issuesByFile[file] = [];
        }
        issuesByFile[file].push(...issues);
        totalIssues += issues.length;

        issues.forEach(issue => {
          issuesBySeverity[issue.severity]++;
        });
      }
    }
  }

  // Analyze diagram types
  const diagramTypes = analyzeDiagramTypes(allBlocks);

  // Print results
  console.log('='.repeat(80));
  console.log('📊 COMPATIBILITY CHECK SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Mermaid diagrams checked: ${totalBlocks}`);
  console.log(`Total compatibility issues: ${totalIssues}`);
  console.log(`  ❌ Errors (Not Supported): ${issuesBySeverity.error}`);
  console.log(`  ⚠️  Warnings (Limited Support): ${issuesBySeverity.warning}`);
  console.log(`  ℹ️  Info (Verify Rendering): ${issuesBySeverity.info}`);
  console.log('');

  // Print diagram type distribution
  console.log('📈 DIAGRAM TYPE DISTRIBUTION:');
  console.log('─'.repeat(80));
  const sortedTypes = Object.entries(diagramTypes).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    console.log(`   ${type.padEnd(20)} : ${count} diagram(s)`);
  }
  console.log('');

  if (totalIssues === 0) {
    console.log('✅ All Mermaid diagrams are compatible with version 8.8.2!');
    console.log('');
    console.log('📝 Diagram types used:');
    for (const [type, count] of sortedTypes) {
      console.log(`   ✓ ${type}: ${count} diagram(s) - Fully supported in 8.8.2`);
    }
    return;
  }

  console.log('📋 DETAILED ISSUES BY FILE:\n');

  for (const [file, issues] of Object.entries(issuesByFile)) {
    const relativePath = file.replace(DOCS_DIR + '/', '');
    console.log(`\n📄 ${relativePath}`);
    console.log('─'.repeat(80));

    for (const issue of issues) {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} Block ${issue.blockIndex + 1} (${issue.diagramType}): ${issue.name}`);
      console.log(`   ${issue.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS:');
  console.log('='.repeat(80));

  if (issuesBySeverity.error > 0) {
    console.log('❌ CRITICAL: Some diagram types are not supported in Mermaid 8.8.2');
    console.log('   Actions:');
    console.log('   1. Replace unsupported diagram types with alternatives:');
    console.log('      - Quadrant → Scatter plot or table');
    console.log('      - Mindmap → Flowchart with hierarchical layout');
    console.log('      - Timeline → Gantt chart or sequence diagram');
    console.log('   2. OR upgrade Wiki.js Mermaid to version 9.x or 10.x');
  }

  if (issuesBySeverity.warning > 0) {
    console.log('\n⚠️  WARNING: Some features may not render correctly');
    console.log('   Actions:');
    console.log('   1. Test each warning in Wiki.js interface');
    console.log('   2. Simplify complex syntax if rendering fails');
    console.log('   3. Use alternative syntax when available');
  }

  if (issuesBySeverity.info > 0) {
    console.log('\nℹ️  INFO: Some features need verification');
    console.log('   Action: Review rendering in production Wiki.js');
  }
}

// Run the analysis
try {
  analyzeAllFiles();
} catch (error) {
  console.error('❌ Error during analysis:', error.message);
  console.error(error.stack);
  process.exit(1);
}
