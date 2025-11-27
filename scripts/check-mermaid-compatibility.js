#!/usr/bin/env node
/**
 * Mermaid 8.8.2 Compatibility Checker
 *
 * Checks all Mermaid diagrams in vendor management documentation
 * for compatibility with Mermaid version 8.8.2
 *
 * Usage: node check-mermaid-compatibility.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = 'docs/app/vendor-management';

// Known compatibility issues with Mermaid 8.8.2
const COMPATIBILITY_CHECKS = [
  {
    name: 'Quadrant Chart (Not supported in 8.8.2)',
    pattern: /quadrantChart/i,
    severity: 'error',
    message: 'Quadrant charts are not supported in Mermaid 8.8.2. Use a different chart type or upgrade Mermaid.'
  },
  {
    name: 'Timeline (Not fully supported in 8.8.2)',
    pattern: /^\s*timeline\s*$/mi,
    severity: 'warning',
    message: 'Timeline diagrams have limited support in 8.8.2. Consider using a sequence diagram instead.'
  },
  {
    name: 'Mindmap (Not supported in 8.8.2)',
    pattern: /mindmap/i,
    severity: 'error',
    message: 'Mindmap diagrams are not supported in 8.8.2. Use flowchart or other diagram types.'
  },
  {
    name: 'GitGraph Advanced Features',
    pattern: /gitGraph[\s\S]*?(branch.*type:|commit.*tag:)/,
    severity: 'warning',
    message: 'Advanced GitGraph features may have limited support in 8.8.2'
  },
  {
    name: 'Class Diagram Generic Types',
    pattern: /classDiagram[\s\S]*?~.*~/,
    severity: 'warning',
    message: 'Generic types in class diagrams may not render correctly in 8.8.2'
  },
  {
    name: 'Sequence Diagram Box Syntax',
    pattern: /box\s+.*\n/,
    severity: 'warning',
    message: 'Box syntax in sequence diagrams may have rendering issues in 8.8.2'
  },
  {
    name: 'ER Diagram Extended Attributes',
    pattern: /erDiagram[\s\S]*?\{[\s\S]*?(?:string|int|float|boolean)\s+\w+\s+PK/,
    severity: 'info',
    message: 'Extended ER diagram attributes - verify rendering in 8.8.2'
  },
  {
    name: 'Flowchart Subgraph Styles',
    pattern: /subgraph.*\n.*style\s+\w+\s+/,
    severity: 'info',
    message: 'Subgraph styling may have limited support in 8.8.2'
  }
];

// Extract all Mermaid code blocks from a file
function extractMermaidBlocks(content, filename) {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  let blockIndex = 0;

  while ((match = mermaidRegex.exec(content)) !== null) {
    blocks.push({
      index: blockIndex++,
      content: match[1],
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

// Main analysis function
function analyzeAllFiles() {
  console.log('🔍 Checking Mermaid diagrams for 8.8.2 compatibility...\n');

  const files = getAllMarkdownFiles(DOCS_DIR);
  console.log(`📁 Found ${files.length} markdown files\n`);

  let totalBlocks = 0;
  let totalIssues = 0;
  const issuesByFile = {};
  const issuesBySeverity = {
    error: 0,
    warning: 0,
    info: 0
  };

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const blocks = extractMermaidBlocks(content, file);

    if (blocks.length === 0) continue;

    totalBlocks += blocks.length;

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

  // Print results
  console.log('='.repeat(80));
  console.log('📊 COMPATIBILITY CHECK SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Mermaid diagrams checked: ${totalBlocks}`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`  ❌ Errors: ${issuesBySeverity.error}`);
  console.log(`  ⚠️  Warnings: ${issuesBySeverity.warning}`);
  console.log(`  ℹ️  Info: ${issuesBySeverity.info}`);
  console.log('');

  if (totalIssues === 0) {
    console.log('✅ All Mermaid diagrams are compatible with version 8.8.2!');
    return;
  }

  console.log('📋 DETAILED ISSUES BY FILE:\n');

  for (const [file, issues] of Object.entries(issuesByFile)) {
    const relativePath = file.replace(DOCS_DIR + '/', '');
    console.log(`\n📄 ${relativePath}`);
    console.log('─'.repeat(80));

    for (const issue of issues) {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} Block ${issue.blockIndex + 1}: ${issue.name}`);
      console.log(`   ${issue.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS:');
  console.log('='.repeat(80));

  if (issuesBySeverity.error > 0) {
    console.log('❌ CRITICAL: Some diagram types are not supported in Mermaid 8.8.2');
    console.log('   → Replace unsupported diagram types with alternatives');
    console.log('   → Or upgrade to Mermaid 9.x or 10.x');
  }

  if (issuesBySeverity.warning > 0) {
    console.log('⚠️  WARNING: Some features may not render correctly');
    console.log('   → Test diagrams in Wiki.js with Mermaid 8.8.2');
    console.log('   → Simplify complex syntax if rendering issues occur');
  }

  if (issuesBySeverity.info > 0) {
    console.log('ℹ️  INFO: Some features need verification');
    console.log('   → Review rendering in production environment');
  }

  console.log('\n📝 Next Steps:');
  console.log('   1. Review the issues listed above');
  console.log('   2. Test problematic diagrams in Wiki.js');
  console.log('   3. Fix or replace incompatible diagrams');
  console.log('   4. Re-run this script to verify fixes');
}

// Run the analysis
try {
  analyzeAllFiles();
} catch (error) {
  console.error('❌ Error during analysis:', error.message);
  process.exit(1);
}
