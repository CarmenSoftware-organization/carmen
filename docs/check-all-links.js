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

// Function to recursively find all HTML files
function findAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAllHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Function to extract all href links from HTML
function extractLinks(htmlContent) {
    const linkRegex = /href=["']([^"']+)["']/g;
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
    const external = [];
    const anchors = [];

    links.forEach(link => {
        // Skip external links
        if (link.startsWith('http')) {
            external.push(link);
            return;
        }

        // Skip pure anchors (within same page)
        if (link.startsWith('#')) {
            anchors.push(link);
            return;
        }

        // Handle links with anchors (file.html#anchor)
        const [filePath, anchor] = link.split('#');

        if (!filePath) {
            // Just an anchor
            anchors.push(link);
            return;
        }

        const fullPath = path.join(dir, filePath);
        if (fileExists(fullPath)) {
            working.push(link);
        } else {
            broken.push(link);
        }
    });

    return {
        broken,
        working,
        external,
        anchors,
        total: links.length
    };
}

// Main execution
const docsDir = '/Users/peak/Documents/GitHub/carmen/docs/documents';
console.log('🔍 Comprehensive scan of ALL HTML files for broken links...\n');

// Find all HTML files
const allHtmlFiles = findAllHtmlFiles(docsDir);
console.log(`📁 Found ${allHtmlFiles.length} HTML files\n`);

let totalBrokenLinks = 0;
let filesWithBrokenLinks = [];
let totalWorkingLinks = 0;
let totalExternalLinks = 0;

allHtmlFiles.forEach(htmlFile => {
    const relativePath = path.relative(docsDir, htmlFile);
    const result = checkLinksInFile(htmlFile);

    if (result.broken.length > 0) {
        console.log(`\n❌ ${relativePath} - ${result.broken.length} broken links:`);
        result.broken.forEach(link => {
            console.log(`   - ${link}`);
        });
        totalBrokenLinks += result.broken.length;
        filesWithBrokenLinks.push({
            file: relativePath,
            broken: result.broken,
            working: result.working
        });
    } else if (result.total > 0) {
        console.log(`✅ ${relativePath} - All ${result.working.length} local links working`);
    }

    totalWorkingLinks += result.working.length;
    totalExternalLinks += result.external.length;
});

console.log(`\n${'='.repeat(70)}`);
console.log(`📊 Summary:`);
console.log(`   - Total HTML files scanned: ${allHtmlFiles.length}`);
console.log(`   - Files with broken links: ${filesWithBrokenLinks.length}`);
console.log(`   - Total broken links: ${totalBrokenLinks}`);
console.log(`   - Total working local links: ${totalWorkingLinks}`);
console.log(`   - Total external links (not checked): ${totalExternalLinks}`);
console.log(`${'='.repeat(70)}\n`);

// Output detailed report
if (filesWithBrokenLinks.length > 0) {
    console.log('📋 Files requiring fixes:\n');
    filesWithBrokenLinks.forEach(({ file, broken }) => {
        console.log(`${file}:`);
        broken.forEach(link => console.log(`  - ${link}`));
    });
    console.log('\n');
}

process.exit(totalBrokenLinks > 0 ? 1 : 0);
