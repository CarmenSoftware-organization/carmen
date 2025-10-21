#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filepath) {
    try {
        return fs.existsSync(filepath);
    } catch (error) {
        return false;
    }
}

// Function to extract all href links from HTML
function extractLinks(htmlContent) {
    const linkRegex = /href=["']([^"']+\.html)["']/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(htmlContent)) !== null) {
        links.push(match[1]);
    }

    return links;
}

// Function to check links in an HTML file
function checkLinksInFile(htmlFilePath) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    const links = extractLinks(htmlContent);
    const dir = path.dirname(htmlFilePath);
    const broken = [];
    const working = [];

    links.forEach(link => {
        // Skip external links and anchors
        if (link.startsWith('http') || link.startsWith('#')) {
            return;
        }

        const fullPath = path.join(dir, link);
        if (fileExists(fullPath)) {
            working.push(link);
        } else {
            broken.push(link);
        }
    });

    return { broken, working, total: links.length };
}

// Main execution
const docsDir = '/Users/peak/Documents/GitHub/carmen/docs/documents';
console.log('🔍 Scanning all module index.html files for broken links...\n');

// Find all index.html files
const modules = [
    'dashboard',
    'finance',
    'inv',
    'op',
    'pm',
    'pr',
    'production',
    'reporting',
    'sa',
    'store-ops',
    'vm'
];

let totalBrokenLinks = 0;
let modulesWithBrokenLinks = [];

modules.forEach(module => {
    const indexPath = path.join(docsDir, module, 'index.html');

    if (!fileExists(indexPath)) {
        console.log(`⚠️  ${module}/index.html - NOT FOUND`);
        return;
    }

    const result = checkLinksInFile(indexPath);

    if (result.broken.length > 0) {
        console.log(`\n❌ ${module}/index.html - ${result.broken.length} broken links:`);
        result.broken.forEach(link => {
            console.log(`   - ${link}`);
        });
        totalBrokenLinks += result.broken.length;
        modulesWithBrokenLinks.push({
            module,
            broken: result.broken,
            working: result.working
        });
    } else {
        console.log(`✅ ${module}/index.html - All ${result.total} links working`);
    }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`   - Total modules checked: ${modules.length}`);
console.log(`   - Modules with broken links: ${modulesWithBrokenLinks.length}`);
console.log(`   - Total broken links: ${totalBrokenLinks}`);
console.log(`${'='.repeat(60)}\n`);

// Output detailed report
if (modulesWithBrokenLinks.length > 0) {
    console.log('📋 Modules requiring fixes:\n');
    modulesWithBrokenLinks.forEach(({ module, broken }) => {
        console.log(`${module}: ${broken.length} broken link(s)`);
    });
}
