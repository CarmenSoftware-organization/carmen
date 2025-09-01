#!/usr/bin/env npx ts-node

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';
import testRunner from './test-runner';

interface TestOptions {
  suite?: string;
  parallel?: boolean;
  headless?: boolean;
  responsive?: boolean;
  accessibility?: boolean;
  output?: string;
  timeout?: number;
  retries?: number;
  verbose?: boolean;
}

program
  .name('permission-management-e2e')
  .description('Carmen ERP Permission Management E2E Test Runner')
  .version('1.0.0');

program
  .option('-s, --suite <suite>', 'Test suite to run', 'permission-management-complete')
  .option('-p, --parallel', 'Enable parallel execution', true)
  .option('-h, --headless', 'Run in headless mode', false)
  .option('-r, --responsive', 'Run responsive design tests', false)
  .option('-a, --accessibility', 'Run accessibility tests', false)
  .option('-o, --output <format>', 'Output format (json|html|console)', 'console')
  .option('-t, --timeout <ms>', 'Test timeout in milliseconds', '30000')
  .option('--retries <count>', 'Number of retry attempts', '2')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options: TestOptions) => {
    await runTests(options);
  });

program
  .command('list-suites')
  .description('List available test suites')
  .action(() => {
    console.log(chalk.blue.bold('Available Test Suites:'));
    console.log(chalk.green('• permission-management-complete') + ' - Complete test suite with all functionality');
    console.log(chalk.green('• toggle-functionality') + ' - RBAC/ABAC toggle tests only');
    console.log(chalk.green('• policy-management') + ' - Policy management workflow tests');
    console.log(chalk.green('• performance-benchmarks') + ' - Performance and load testing');
  });

program
  .command('validate-environment')
  .description('Validate test environment setup')
  .action(async () => {
    const spinner = ora('Validating test environment...').start();
    
    try {
      // Basic environment validation
      const nodeVersion = process.version;
      const isNodeVersionValid = parseInt(nodeVersion.slice(1)) >= 18;
      
      if (!isNodeVersionValid) {
        spinner.fail(`Node.js version ${nodeVersion} is not supported. Required: >=18.0.0`);
        process.exit(1);
      }
      
      // Check if Carmen app is running
      try {
        const response = await fetch('http://localhost:3004/health');
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }
      } catch (error) {
        spinner.warn('Carmen application not running on localhost:3004. Please start the application first.');
      }
      
      spinner.succeed('Environment validation completed');
      
      console.log(chalk.green('\n✓ Environment Status:'));
      console.log(`  Node.js: ${nodeVersion}`);
      console.log(`  Platform: ${process.platform}`);
      console.log(`  Architecture: ${process.arch}`);
      
    } catch (error) {
      spinner.fail('Environment validation failed');
      console.error(chalk.red(error));
      process.exit(1);
    }
  });

program
  .command('benchmark')
  .description('Run system benchmarks')
  .action(async () => {
    console.log(chalk.blue.bold('System Performance Benchmark'));
    console.log('This would run system performance benchmarks...');
    // Implementation would go here
  });

async function runTests(options: TestOptions): Promise<void> {
  const startTime = Date.now();
  let spinner = ora('Initializing test runner...').start();
  
  try {
    // Initialize test runner
    await testRunner.initialize();
    spinner.succeed('Test runner initialized');
    
    // Run selected test suite
    spinner = ora(`Running ${options.suite} test suite...`).start();
    
    let results;
    switch (options.suite) {
      case 'toggle-functionality':
        results = await testRunner.runToggleTests();
        break;
      case 'policy-management':
        results = await testRunner.runPolicyTests();
        break;
      case 'performance-benchmarks':
        results = await testRunner.runPerformanceTests();
        break;
      case 'permission-management-complete':
      default:
        results = await testRunner.runCompleteTestSuite();
        break;
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    spinner.succeed(`Test suite completed in ${totalTime}ms`);
    
    // Display results
    displayTestResults(results, options);
    
    // Cleanup
    await testRunner.cleanup();
    
    // Exit with appropriate code
    const exitCode = results.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    spinner.fail('Test execution failed');
    console.error(chalk.red('\nError Details:'));
    console.error(error);
    
    // Cleanup on error
    try {
      await testRunner.cleanup();
    } catch (cleanupError) {
      console.error(chalk.red('Cleanup failed:'), cleanupError);
    }
    
    process.exit(1);
  }
}

function displayTestResults(results: any, options: TestOptions): void {
  console.log('\n' + chalk.blue.bold('Test Results Summary'));
  console.log('='.repeat(50));
  
  // Summary table
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Tests', results.summary.totalTests.toString()],
    ['Passed', chalk.green(results.summary.passed.toString())],
    ['Failed', results.summary.failed > 0 ? chalk.red(results.summary.failed.toString()) : '0'],
    ['Skipped', results.summary.skipped.toString()],
    ['Pass Rate', `${results.summary.passRate.toFixed(1)}%`],
    ['Total Time', `${results.totalTime}ms`]
  ];
  
  console.log(table(summaryData, {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼'
    }
  }));
  
  // Phase breakdown
  console.log('\n' + chalk.blue.bold('Phase Breakdown'));
  console.log('─'.repeat(30));
  
  const phases = [results.moduleResults, results.integrationResults, results.performanceResults];
  
  for (const phase of phases) {
    const status = phase.failed > 0 ? chalk.red('FAILED') : chalk.green('PASSED');
    console.log(`${phase.phase.toUpperCase().padEnd(12)} ${status} (${phase.passed}/${phase.total}) - ${phase.duration}ms`);
  }
  
  // Failed tests details
  if (results.summary.failed > 0) {
    console.log('\n' + chalk.red.bold('Failed Tests'));
    console.log('─'.repeat(30));
    
    phases.forEach(phase => {
      const failedTests = phase.results.filter((test: any) => test.status === 'failed');
      failedTests.forEach((test: any) => {
        console.log(chalk.red(`✗ ${test.name}`));
        if (test.error && options.verbose) {
          console.log(chalk.gray(`  Error: ${test.error.message}`));
        }
      });
    });
  }
  
  // Performance metrics
  if (results.metrics) {
    console.log('\n' + chalk.blue.bold('Performance Metrics'));
    console.log('─'.repeat(30));
    console.log(`Total Execution Time: ${results.metrics.totalExecutionTime}ms`);
    console.log(`Average Test Time: ${results.metrics.averageTestTime}ms`);
  }
  
  // Resource usage
  if (results.resourceUsage) {
    console.log('\n' + chalk.blue.bold('Resource Usage'));
    console.log('─'.repeat(30));
    console.log(`Peak Memory: ${results.resourceUsage.peak.memory.toFixed(1)}MB`);
    console.log(`Average Memory: ${results.resourceUsage.average.memory.toFixed(1)}MB`);
    console.log(`Peak CPU: ${results.resourceUsage.peak.cpu.toFixed(1)}%`);
  }
  
  // Output files
  console.log('\n' + chalk.blue.bold('Generated Reports'));
  console.log('─'.repeat(30));
  console.log('📊 HTML Report: reports/html/index.html');
  console.log('📄 JSON Results: reports/json/results.json');
  console.log('📸 Screenshots: reports/screenshots/');
  console.log('🎥 Videos: reports/videos/');
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\nUnhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

export { runTests, displayTestResults };