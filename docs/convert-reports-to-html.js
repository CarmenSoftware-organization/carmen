#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// HTML template for report documents
const createReportHTML = (title, content, reportInfo) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Carmen ERP Reports</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #2563eb;
            --secondary: #64748b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-light: #f8fafc;
            --bg-white: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --border: #e2e8f0;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: var(--bg-light);
            color: var(--text-primary);
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .header {
            background: var(--bg-white);
            border-bottom: 1px solid var(--border);
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: var(--shadow);
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary);
        }

        .nav-links {
            display: flex;
            gap: 1.5rem;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .breadcrumb {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .breadcrumb a {
            color: var(--primary);
            text-decoration: none;
        }

        .breadcrumb a:hover {
            text-decoration: underline;
        }

        .report-header {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow);
        }

        .report-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .report-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .meta-item {
            display: flex;
            flex-direction: column;
        }

        .meta-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
        }

        .meta-value {
            font-size: 1rem;
            color: var(--text-primary);
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .status-approved {
            background: #dcfce7;
            color: #166534;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .content {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 2rem;
            box-shadow: var(--shadow);
        }

        .content h1 {
            font-size: 1.875rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
            border-bottom: 2px solid var(--border);
            padding-bottom: 0.5rem;
        }

        .content h2 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }

        .content h3 {
            font-size: 1.25rem;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .content h4 {
            font-size: 1.125rem;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .content p {
            margin-bottom: 1rem;
        }

        .content ul, .content ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }

        .content li {
            margin-bottom: 0.5rem;
        }

        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.875rem;
        }

        .content th {
            background: var(--bg-light);
            font-weight: 600;
            text-align: left;
            padding: 0.75rem;
            border: 1px solid var(--border);
        }

        .content td {
            padding: 0.75rem;
            border: 1px solid var(--border);
        }

        .content tr:nth-child(even) {
            background: var(--bg-light);
        }

        .content code {
            background: var(--bg-light);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
        }

        .content pre {
            background: var(--bg-light);
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            margin: 1rem 0;
        }

        .content pre code {
            background: none;
            padding: 0;
        }

        .content blockquote {
            border-left: 4px solid var(--primary);
            padding-left: 1rem;
            margin: 1rem 0;
            color: var(--text-secondary);
        }

        .content strong {
            font-weight: 600;
            color: var(--text-primary);
        }

        .footer {
            margin-top: 3rem;
            padding: 2rem;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        @media print {
            .header, .breadcrumb, .footer {
                display: none;
            }
            .content {
                border: none;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">Carmen ERP - Reports Documentation</div>
            <nav class="nav-links">
                <a href="../index.html">All Reports</a>
                <a href="../../04-modules/reporting/00-REPORTS-INDEX.html">Report Index</a>
                <a href="../../index.html">Docs Home</a>
            </nav>
        </div>
    </div>

    <div class="container">
        <div class="breadcrumb">
            <a href="../index.html">Reports</a>
            <span>/</span>
            <span>${reportInfo.category || 'Report'}</span>
            <span>/</span>
            <span>${reportInfo.name || title}</span>
        </div>

        <div class="report-header">
            <h1 class="report-title">${reportInfo.name || title}</h1>
            <div class="report-meta">
                ${reportInfo.id ? `
                <div class="meta-item">
                    <div class="meta-label">Report ID</div>
                    <div class="meta-value">${reportInfo.id}</div>
                </div>
                ` : ''}
                ${reportInfo.module ? `
                <div class="meta-item">
                    <div class="meta-label">Module</div>
                    <div class="meta-value">${reportInfo.module}</div>
                </div>
                ` : ''}
                ${reportInfo.priority ? `
                <div class="meta-item">
                    <div class="meta-label">Priority</div>
                    <div class="meta-value">${reportInfo.priority}</div>
                </div>
                ` : ''}
                ${reportInfo.status ? `
                <div class="meta-item">
                    <div class="meta-label">Status</div>
                    <div class="meta-value">
                        <span class="status-badge ${reportInfo.status.toLowerCase().includes('approved') ? 'status-approved' : 'status-pending'}">
                            ${reportInfo.status}
                        </span>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="content">
            ${content}
        </div>

        <div class="footer">
            <p>Carmen ERP Documentation - Generated from Markdown</p>
            <p>Report Documentation System © 2025</p>
        </div>
    </div>
</body>
</html>`;

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Extract report metadata
    const reportInfo = {};
    const metaRegex = /\*\*(.+?):\*\*\s*(.+?)(?:\n|$)/g;
    let match;
    while ((match = metaRegex.exec(markdown)) !== null) {
        const key = match[1].toLowerCase().replace(/\s+/g, '_');
        reportInfo[key] = match[2].trim();
    }

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Tables - basic support
    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (match, header, rows) => {
        const headerCells = header.split('|').filter(cell => cell.trim()).map(cell =>
            `<th>${cell.trim()}</th>`
        ).join('');

        const rowCells = rows.trim().split('\n').map(row => {
            const cells = row.split('|').filter(cell => cell.trim()).map(cell =>
                `<td>${cell.trim()}</td>`
            ).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rowCells}</tbody></table>`;
    });

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');

    return { html, reportInfo };
}

// Process all report directories
function convertReportsToHTML() {
    const reportsDir = path.join(__dirname, '04-modules', 'reporting');
    const outputDir = path.join(__dirname, 'carmen-doc', 'public', 'reports');

    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get all report directories
    const reportDirs = fs.readdirSync(reportsDir)
        .filter(dir => /^\d{2}-/.test(dir))
        .sort();

    console.log(`Found ${reportDirs.length} report directories`);

    let convertedCount = 0;

    reportDirs.forEach(reportDir => {
        const reportPath = path.join(reportsDir, reportDir);
        const prdFile = path.join(reportPath, 'PRD.md');
        const templateFile = path.join(reportPath, 'TEMPLATE.md');

        // Create report-specific output directory
        const reportOutputDir = path.join(outputDir, reportDir);
        if (!fs.existsSync(reportOutputDir)) {
            fs.mkdirSync(reportOutputDir, { recursive: true });
        }

        // Convert PRD.md
        if (fs.existsSync(prdFile)) {
            const markdown = fs.readFileSync(prdFile, 'utf8');
            const { html, reportInfo } = convertMarkdownToHTML(markdown);
            const title = `${reportDir} - PRD`;
            const fullHTML = createReportHTML(title, html, reportInfo);

            const outputFile = path.join(reportOutputDir, 'PRD.html');
            fs.writeFileSync(outputFile, fullHTML);
            console.log(`✓ Converted: ${reportDir}/PRD.md -> PRD.html`);
            convertedCount++;
        }

        // Convert TEMPLATE.md
        if (fs.existsSync(templateFile)) {
            const markdown = fs.readFileSync(templateFile, 'utf8');
            const { html, reportInfo } = convertMarkdownToHTML(markdown);
            const title = `${reportDir} - Template`;
            const fullHTML = createReportHTML(title, html, reportInfo);

            const outputFile = path.join(reportOutputDir, 'TEMPLATE.html');
            fs.writeFileSync(outputFile, fullHTML);
            console.log(`✓ Converted: ${reportDir}/TEMPLATE.md -> TEMPLATE.html`);
            convertedCount++;
        }
    });

    console.log(`\nConversion complete: ${convertedCount} files converted`);
    console.log(`Output directory: ${outputDir}`);
}

// Run the conversion
try {
    convertReportsToHTML();
} catch (error) {
    console.error('Error during conversion:', error);
    process.exit(1);
}
