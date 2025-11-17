#!/usr/bin/env node

/**
 * Carmen Documentation to WordPress Migration Script
 * Parses all markdown files and generates WordPress-ready data
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const OUTPUT_FILE = path.join(BASE_DIR, 'wordpress-migration-data.json');

// Document type prefixes
const DOC_TYPES = ['DD', 'BR', 'TS', 'UC', 'FD', 'VAL', 'PC', 'SM', 'PROCESS'];

/**
 * Recursively scan directory for markdown files
 */
function scanDirectory(dir, baseDir = dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (item.startsWith('.') || item === 'node_modules') continue;
            files.push(...scanDirectory(fullPath, baseDir));
        } else if (item.endsWith('.md')) {
            const relativePath = path.relative(baseDir, fullPath);
            files.push({
                filename: item,
                relativePath,
                fullPath,
                directory: path.dirname(relativePath)
            });
        }
    }

    return files;
}

/**
 * Parse markdown file and extract metadata
 */
function parseMarkdownFile(fileInfo) {
    const content = fs.readFileSync(fileInfo.fullPath, 'utf8');
    const lines = content.split('\n');

    // Extract title (first H1)
    let title = fileInfo.filename.replace('.md', '');
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
        title = h1Match[1];
    }

    // Determine document type
    let docType = null;
    for (const type of DOC_TYPES) {
        if (fileInfo.filename.startsWith(type + '-') || fileInfo.filename.startsWith(type + '_')) {
            docType = type;
            break;
        }
    }

    // Extract links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
        links.push({
            text: match[1],
            url: match[2],
            isInternal: !match[2].startsWith('http')
        });
    }

    // Determine hierarchy level
    const pathParts = fileInfo.relativePath.split(path.sep);
    const level = pathParts.length - 1; // 0 = root, 1 = module, 2 = sub-module, etc.

    // Generate WordPress slug
    const slug = generateSlug(fileInfo.filename, fileInfo.directory);

    return {
        ...fileInfo,
        title,
        docType,
        content,
        links,
        level,
        slug,
        pathParts: pathParts.slice(0, -1) // directory path without filename
    };
}

/**
 * Generate WordPress-compatible slug
 */
function generateSlug(filename, directory) {
    // Remove .md extension
    let slug = filename.replace('.md', '');

    // Convert to lowercase
    slug = slug.toLowerCase();

    // Replace spaces and special chars with hyphens
    slug = slug.replace(/[^a-z0-9]+/g, '-');

    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');

    // Add directory prefix for uniqueness if not root
    if (directory && directory !== '.') {
        const dirSlug = directory.split(path.sep).pop().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        // Only add prefix if slug doesn't already contain it
        if (!slug.startsWith(dirSlug)) {
            slug = `${dirSlug}-${slug}`;
        }
    }

    return slug;
}

/**
 * Build hierarchical structure
 */
function buildHierarchy(pages) {
    // Sort by level (root first)
    pages.sort((a, b) => a.level - b.level);

    // Map pages by their path for parent lookup
    const pathMap = new Map();

    for (const page of pages) {
        const pagePath = page.relativePath;
        pathMap.set(pagePath, page);

        // Determine parent
        if (page.level > 0) {
            // Find parent directory
            const parentPath = page.pathParts.join(path.sep);

            // Try to find README.md or index.md in parent directory
            const possibleParents = [
                path.join(parentPath, 'README.md'),
                path.join(parentPath, 'INDEX.md'),
                path.join(parentPath, page.pathParts[page.pathParts.length - 1] + '.md')
            ];

            for (const parentPath of possibleParents) {
                if (pathMap.has(parentPath)) {
                    page.parentPath = parentPath;
                    break;
                }
            }

            // If still no parent, use the last component of pathParts
            if (!page.parentPath && page.pathParts.length > 0) {
                page.parentSlug = page.pathParts.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }
        }
    }

    return pages;
}

/**
 * Convert Markdown to HTML (basic conversion)
 */
function markdownToHtml(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'plaintext';
        return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Tables - Convert BEFORE links and paragraphs
    html = convertMarkdownTables(html);

    // Links (preserve for later processing)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');

    return html;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Convert markdown tables to HTML tables
 */
function convertMarkdownTables(text) {
    // Match markdown tables (header | separator | rows)
    const tableRegex = /^\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/gm;

    return text.replace(tableRegex, (match, headerRow, bodyRows) => {
        // Parse header
        const headers = headerRow.split('|')
            .map(h => h.trim())
            .filter(h => h.length > 0);

        // Parse body rows
        const rows = bodyRows.trim().split('\n')
            .map(row => {
                return row.split('|')
                    .map(cell => cell.trim())
                    .filter(cell => cell.length > 0);
            })
            .filter(row => row.length > 0);

        // Build HTML table
        let tableHtml = '<table class="wp-block-table"><thead><tr>';

        // Add headers
        headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        // Add rows
        rows.forEach(row => {
            tableHtml += '<tr>';
            row.forEach(cell => {
                tableHtml += `<td>${cell}</td>`;
            });
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        return tableHtml;
    });
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 Starting Carmen Documentation Migration...\n');

    // Scan all markdown files
    console.log('📁 Scanning documentation files...');
    const files = scanDirectory(BASE_DIR);
    console.log(`   Found ${files.length} markdown files\n`);

    // Parse all files
    console.log('📝 Parsing markdown files...');
    const pages = files.map(file => parseMarkdownFile(file));
    console.log(`   Parsed ${pages.length} pages\n`);

    // Build hierarchy
    console.log('🏗️  Building page hierarchy...');
    const hierarchicalPages = buildHierarchy(pages);
    console.log(`   Built hierarchy with ${hierarchicalPages.length} pages\n`);

    // Convert markdown to HTML
    console.log('🔄 Converting markdown to HTML...');
    for (const page of hierarchicalPages) {
        page.html = markdownToHtml(page.content);
    }
    console.log(`   Converted ${hierarchicalPages.length} pages\n`);

    // Generate statistics
    const stats = {
        totalPages: hierarchicalPages.length,
        byLevel: {},
        byDocType: {},
        totalLinks: hierarchicalPages.reduce((sum, p) => sum + p.links.length, 0),
        internalLinks: hierarchicalPages.reduce((sum, p) =>
            sum + p.links.filter(l => l.isInternal).length, 0
        )
    };

    for (const page of hierarchicalPages) {
        stats.byLevel[page.level] = (stats.byLevel[page.level] || 0) + 1;
        if (page.docType) {
            stats.byDocType[page.docType] = (stats.byDocType[page.docType] || 0) + 1;
        }
    }

    // Save to JSON
    const output = {
        generatedAt: new Date().toISOString(),
        stats,
        pages: hierarchicalPages
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`✅ Migration data saved to: ${OUTPUT_FILE}\n`);

    // Print summary
    console.log('📊 Migration Summary:');
    console.log(`   Total Pages: ${stats.totalPages}`);
    console.log(`   By Level:`);
    Object.keys(stats.byLevel).sort().forEach(level => {
        console.log(`     Level ${level}: ${stats.byLevel[level]} pages`);
    });
    console.log(`   By Document Type:`);
    Object.keys(stats.byDocType).sort().forEach(type => {
        console.log(`     ${type}: ${stats.byDocType[type]} pages`);
    });
    console.log(`   Total Links: ${stats.totalLinks}`);
    console.log(`   Internal Links: ${stats.internalLinks}`);
    console.log('\n✨ Ready for WordPress import!');
}

// Run
main();
