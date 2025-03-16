const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to run a command and return its output
function runCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error: any) {
    console.error(`Error running command: ${command}`);
    
    // If the command failed but still produced output, return that output
    if (error.stdout) {
      console.log('Command produced output despite error, using that output.');
      return error.stdout;
    }
    
    return `Command failed with error: ${error.message}`;
  }
}

// Function to generate a static analysis report
function generateReport(): void {
  const reportDir = path.resolve(process.cwd(), 'docs/analysis');
  
  // Create the report directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();

  // Run the static analysis commands
  console.log('Running ESLint analysis...');
  const lintResults = runCommand('npm run analyze:lint');

  console.log('Running TypeScript type checking...');
  const typeResults = runCommand('npm run analyze:types');

  console.log('Running dependency analysis...');
  const depResults = runCommand('npm run analyze:deps');

  console.log('Running dead code analysis...');
  const deadCodeResults = runCommand('npm run analyze:dead');

  // Generate the report
  const report = `# Static Analysis Report
Generated: ${timestamp}

## ESLint Analysis
\`\`\`
${lintResults}
\`\`\`

## TypeScript Type Checking
\`\`\`
${typeResults}
\`\`\`

## Dependency Analysis
\`\`\`
${depResults}
\`\`\`

## Dead Code Analysis
\`\`\`
${deadCodeResults}
\`\`\`
`;

  // Write the report to a file
  const reportPath = path.join(reportDir, 'static-analysis-report.md');
  fs.writeFileSync(reportPath, report);

  console.log(`Report generated at ${reportPath}`);
}

// Run the report generation
generateReport();