#!/usr/bin/env node

/**
 * Keycloak Integration Validation Script
 * 
 * This script validates the Carmen ERP Keycloak integration by:
 * 1. Checking all updated files for correct import statements
 * 2. Validating authentication flow configurations
 * 3. Testing component integration points
 * 4. Ensuring no old user context references remain
 * 
 * @author Carmen ERP Team
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function findFiles(dir, extensions = ['.tsx', '.ts'], exclude = ['node_modules', '.next', '.git']) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !exclude.includes(file)) {
        results = results.concat(findFiles(filePath, extensions, exclude));
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return results;
}

function checkFileForOldImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = [];
    
    // Check for old user context imports
    if (content.includes("from '@/lib/context/user-context'")) {
      issues.push({
        type: 'old_import',
        message: 'Found old user-context import',
        line: content.split('\n').findIndex(line => 
          line.includes("from '@/lib/context/user-context'")
        ) + 1
      });
    }
    
    // Check for old useUser hook without Keycloak
    const useUserMatches = content.match(/const\s*{\s*user\s*}\s*=\s*useUser\(\)/g);
    if (useUserMatches && !content.includes('useKeycloakUser')) {
      issues.push({
        type: 'old_hook',
        message: 'Found useUser hook without Keycloak integration',
        occurrences: useUserMatches.length
      });
    }
    
    return issues;
  } catch (error) {
    return [{
      type: 'read_error',
      message: `Could not read file: ${error.message}`
    }];
  }
}

function validateKeycloakConfig() {
  logHeader('Validating Keycloak Configuration');
  
  const configPath = path.join(PROJECT_ROOT, 'lib/auth/next-auth.config.ts');
  let issues = 0;
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    
    // Check for required configurations
    const requiredConfigs = [
      'keycloak',
      'NextAuthOptions',
      'ROLE_MAPPING',
      'mapKeycloakRoles',
      'extractKeycloakRoles'
    ];
    
    for (const config of requiredConfigs) {
      if (!content.includes(config)) {
        log('red', `❌ Missing required configuration: ${config}`);
        issues++;
      } else {
        log('green', `✅ Found configuration: ${config}`);
      }
    }
    
    log('blue', `Keycloak config validation: ${issues === 0 ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    log('red', `❌ Could not validate Keycloak config: ${error.message}`);
    issues++;
  }
  
  return issues;
}

function validateProviderSetup() {
  logHeader('Validating Provider Setup');
  
  let issues = 0;
  
  // Check root layout
  const rootLayoutPath = path.join(PROJECT_ROOT, 'app/layout.tsx');
  try {
    const content = fs.readFileSync(rootLayoutPath, 'utf-8');
    
    if (!content.includes('KeycloakUserProvider')) {
      log('red', '❌ Root layout missing KeycloakUserProvider');
      issues++;
    } else {
      log('green', '✅ Root layout has KeycloakUserProvider');
    }
    
  } catch (error) {
    log('red', `❌ Could not check root layout: ${error.message}`);
    issues++;
  }
  
  // Check providers file
  const providersPath = path.join(PROJECT_ROOT, 'app/providers.tsx');
  try {
    const content = fs.readFileSync(providersPath, 'utf-8');
    
    if (!content.includes('SessionProvider')) {
      log('red', '❌ Providers missing SessionProvider');
      issues++;
    } else {
      log('green', '✅ Providers has SessionProvider');
    }
    
  } catch (error) {
    log('red', `❌ Could not check providers: ${error.message}`);
    issues++;
  }
  
  log('blue', `Provider setup validation: ${issues === 0 ? 'PASSED' : 'FAILED'}`);
  return issues;
}

function validateComponentUpdates() {
  logHeader('Validating Component Updates');
  
  const files = findFiles(PROJECT_ROOT);
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  for (const filePath of files) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const issues = checkFileForOldImports(filePath);
    
    if (issues.length > 0) {
      filesWithIssues++;
      log('yellow', `⚠️  Issues in ${relativePath}:`);
      
      for (const issue of issues) {
        totalIssues++;
        if (issue.line) {
          log('red', `   - ${issue.message} (line ${issue.line})`);
        } else if (issue.occurrences) {
          log('red', `   - ${issue.message} (${issue.occurrences} occurrences)`);
        } else {
          log('red', `   - ${issue.message}`);
        }
      }
    }
  }
  
  if (totalIssues === 0) {
    log('green', '✅ All components properly updated for Keycloak');
  } else {
    log('red', `❌ Found ${totalIssues} issues in ${filesWithIssues} files`);
  }
  
  log('blue', `Component validation: ${totalIssues === 0 ? 'PASSED' : 'FAILED'}`);
  return totalIssues;
}

function validateAuthGuard() {
  logHeader('Validating Authentication Guard');
  
  const authGuardPath = path.join(PROJECT_ROOT, 'components/auth/auth-guard.tsx');
  let issues = 0;
  
  try {
    const content = fs.readFileSync(authGuardPath, 'utf-8');
    
    const requiredFeatures = [
      'useKeycloakUser',
      'useSession',
      'AuthGuard',
      'withAuthGuard',
      'requireRoles',
      'requirePermissions'
    ];
    
    for (const feature of requiredFeatures) {
      if (!content.includes(feature)) {
        log('red', `❌ AuthGuard missing feature: ${feature}`);
        issues++;
      } else {
        log('green', `✅ AuthGuard has feature: ${feature}`);
      }
    }
    
  } catch (error) {
    log('red', `❌ Could not validate AuthGuard: ${error.message}`);
    issues++;
  }
  
  // Check if main layout uses AuthGuard
  const mainLayoutPath = path.join(PROJECT_ROOT, 'app/(main)/main-layout-client.tsx');
  try {
    const content = fs.readFileSync(mainLayoutPath, 'utf-8');
    
    if (!content.includes('AuthGuard')) {
      log('red', '❌ Main layout not using AuthGuard');
      issues++;
    } else {
      log('green', '✅ Main layout using AuthGuard');
    }
    
  } catch (error) {
    log('red', `❌ Could not check main layout: ${error.message}`);
    issues++;
  }
  
  log('blue', `Auth guard validation: ${issues === 0 ? 'PASSED' : 'FAILED'}`);
  return issues;
}

function validateAuthPages() {
  logHeader('Validating Authentication Pages');
  
  const authPages = [
    'app/(auth)/auth/signin/page.tsx',
    'app/(auth)/auth/signout/page.tsx',
    'app/(auth)/auth/error/page.tsx'
  ];
  
  let issues = 0;
  
  for (const pagePath of authPages) {
    const fullPath = path.join(PROJECT_ROOT, pagePath);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      if (pagePath.includes('signin') && !content.includes('signIn')) {
        log('red', `❌ ${pagePath} missing signIn functionality`);
        issues++;
      } else if (pagePath.includes('signin')) {
        log('green', `✅ ${pagePath} has signIn functionality`);
      }
      
      if (pagePath.includes('signout') && !content.includes('signOut')) {
        log('red', `❌ ${pagePath} missing signOut functionality`);
        issues++;
      } else if (pagePath.includes('signout')) {
        log('green', `✅ ${pagePath} has signOut functionality`);
      }
      
    } catch (error) {
      log('red', `❌ Could not validate ${pagePath}: ${error.message}`);
      issues++;
    }
  }
  
  log('blue', `Auth pages validation: ${issues === 0 ? 'PASSED' : 'FAILED'}`);
  return issues;
}

function runTypeScriptCheck() {
  logHeader('Running TypeScript Check');
  
  try {
    execSync('npx tsc --noEmit', { 
      cwd: PROJECT_ROOT, 
      stdio: 'pipe' 
    });
    log('green', '✅ TypeScript compilation successful');
    return 0;
  } catch (error) {
    log('red', '❌ TypeScript compilation failed');
    log('yellow', 'TypeScript errors:');
    console.log(error.stdout?.toString() || error.message);
    return 1;
  }
}

function generateSummary(results) {
  logHeader('Validation Summary');
  
  const totalIssues = Object.values(results).reduce((sum, issues) => sum + issues, 0);
  
  console.log(`
${colors.bold}Keycloak Integration Validation Results:${colors.reset}

📋 Keycloak Configuration: ${results.config === 0 ? '✅ PASSED' : '❌ FAILED'}
🔧 Provider Setup: ${results.providers === 0 ? '✅ PASSED' : '❌ FAILED'}  
📁 Component Updates: ${results.components === 0 ? '✅ PASSED' : '❌ FAILED'}
🛡️  Auth Guard: ${results.authGuard === 0 ? '✅ PASSED' : '❌ FAILED'}
📄 Auth Pages: ${results.authPages === 0 ? '✅ PASSED' : '❌ FAILED'}
⚙️  TypeScript: ${results.typescript === 0 ? '✅ PASSED' : '❌ FAILED'}

${colors.bold}Total Issues Found: ${totalIssues}${colors.reset}

${totalIssues === 0 
  ? colors.green + '🎉 All validations passed! Keycloak integration is ready.' + colors.reset
  : colors.red + '⚠️  Please fix the issues above before deploying.' + colors.reset
}
  `);
  
  if (totalIssues === 0) {
    console.log(`${colors.blue}Next Steps:${colors.reset}
1. Update your environment variables with Keycloak configuration
2. Test the authentication flow in development
3. Verify user roles and permissions are working correctly
4. Test sign-in/sign-out functionality
5. Validate session management and token refresh
    `);
  }
}

// Main execution
async function main() {
  log('bold', '🔐 Carmen ERP Keycloak Integration Validator\n');
  
  const results = {
    config: validateKeycloakConfig(),
    providers: validateProviderSetup(),
    components: validateComponentUpdates(),
    authGuard: validateAuthGuard(),
    authPages: validateAuthPages(),
    typescript: runTypeScriptCheck()
  };
  
  generateSummary(results);
  
  process.exit(Object.values(results).some(issues => issues > 0) ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  validateKeycloakConfig,
  validateProviderSetup,
  validateComponentUpdates,
  validateAuthGuard,
  validateAuthPages
};