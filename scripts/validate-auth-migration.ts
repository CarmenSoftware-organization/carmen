#!/usr/bin/env tsx

/**
 * Authentication Migration Validation Script
 * 
 * Validates that all API endpoints properly implement the new unified Keycloak
 * authentication system while maintaining backward compatibility.
 * 
 * Usage: npx tsx scripts/validate-auth-migration.ts
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

interface ValidationResult {
  file: string
  status: 'pass' | 'fail' | 'warning'
  issues: string[]
  hasAuth: boolean
  authType: 'unified' | 'legacy' | 'none'
  securityFeatures: string[]
}

interface ValidationSummary {
  totalFiles: number
  passedFiles: number
  failedFiles: number
  warningFiles: number
  results: ValidationResult[]
}

/**
 * Validates a single API route file
 */
function validateApiRoute(filePath: string): ValidationResult {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.relative(process.cwd(), filePath)
  
  const result: ValidationResult = {
    file: fileName,
    status: 'pass',
    issues: [],
    hasAuth: false,
    authType: 'none',
    securityFeatures: []
  }

  // Check for authentication imports
  const hasUnifiedAuth = content.includes('from \'@/lib/auth/api-protection\'')
  const hasLegacyAuth = content.includes('from \'@/lib/middleware/auth\'')
  const hasAuthStrategies = content.includes('authStrategies.')
  const hasWithAuth = content.includes('withAuth(')
  const hasWithUnifiedAuth = content.includes('withUnifiedAuth(')

  // Determine authentication type
  if (hasUnifiedAuth || hasAuthStrategies) {
    result.hasAuth = true
    result.authType = 'unified'
  } else if (hasLegacyAuth || hasWithAuth) {
    result.hasAuth = true
    result.authType = 'legacy'
    result.issues.push('Still using legacy JWT-only authentication')
    result.status = 'warning'
  } else {
    result.hasAuth = false
    result.authType = 'none'
    
    // Check if this is a route that should have authentication
    if (fileName.includes('/api/') && !fileName.includes('/auth/') && !isPublicEndpoint(fileName)) {
      result.issues.push('Missing authentication - security vulnerability')
      result.status = 'fail'
    }
  }

  // Check for security features
  const securityFeatures = []
  
  if (content.includes('withSecurity')) {
    securityFeatures.push('Security middleware')
  }
  
  if (content.includes('withRateLimit')) {
    securityFeatures.push('Rate limiting')
  }
  
  if (content.includes('withAuthorization')) {
    securityFeatures.push('Role-based access control')
  }
  
  if (content.includes('auditSecurityEvent')) {
    securityFeatures.push('Audit logging')
  }
  
  if (content.includes('validateInput')) {
    securityFeatures.push('Input validation')
  }
  
  if (content.includes('SecureSchemas')) {
    securityFeatures.push('Secure validation schemas')
  }

  result.securityFeatures = securityFeatures

  // Check for proper type usage
  if (result.hasAuth && result.authType === 'unified') {
    if (content.includes('AuthenticatedUser') && !content.includes('UnifiedAuthenticatedUser')) {
      result.issues.push('Using old AuthenticatedUser type instead of UnifiedAuthenticatedUser')
      result.status = 'warning'
    }
  }

  // Check for proper error handling
  if (result.hasAuth && !content.includes('createSecureResponse')) {
    result.issues.push('Not using secure response creation')
    result.status = 'warning'
  }

  // Validate NextAuth routes (special case)
  if (fileName.includes('/auth/[...nextauth]/')) {
    if (!content.includes('keycloak') && !content.includes('Keycloak')) {
      result.issues.push('NextAuth configuration may be missing Keycloak provider')
      result.status = 'warning'
    }
  }

  return result
}

/**
 * Check if an endpoint should be public (no authentication required)
 */
function isPublicEndpoint(fileName: string): boolean {
  const publicEndpoints = [
    '/health/', // Health checks might be public for load balancers
    '/auth/', // Authentication endpoints
  ]
  
  return publicEndpoints.some(endpoint => fileName.includes(endpoint))
}

/**
 * Main validation function
 */
async function validateAuthMigration(): Promise<ValidationSummary> {
  console.log('🔍 Validating API authentication migration...\n')

  // Find all API route files
  const apiRouteFiles = await glob('app/api/**/route.ts', { 
    cwd: process.cwd(),
    absolute: true 
  })

  console.log(`Found ${apiRouteFiles.length} API route files\n`)

  const results: ValidationResult[] = []
  
  for (const filePath of apiRouteFiles) {
    const result = validateApiRoute(filePath)
    results.push(result)
  }

  // Calculate summary
  const summary: ValidationSummary = {
    totalFiles: results.length,
    passedFiles: results.filter(r => r.status === 'pass').length,
    failedFiles: results.filter(r => r.status === 'fail').length,
    warningFiles: results.filter(r => r.status === 'warning').length,
    results
  }

  return summary
}

/**
 * Print validation results
 */
function printResults(summary: ValidationSummary) {
  console.log('📊 VALIDATION RESULTS')
  console.log('=' .repeat(50))
  console.log(`Total Files: ${summary.totalFiles}`)
  console.log(`✅ Passed: ${summary.passedFiles}`)
  console.log(`⚠️  Warnings: ${summary.warningFiles}`)
  console.log(`❌ Failed: ${summary.failedFiles}`)
  console.log()

  // Group results by status
  const failedResults = summary.results.filter(r => r.status === 'fail')
  const warningResults = summary.results.filter(r => r.status === 'warning')
  const passedResults = summary.results.filter(r => r.status === 'pass')

  // Print failed files
  if (failedResults.length > 0) {
    console.log('❌ FAILED FILES')
    console.log('-'.repeat(30))
    failedResults.forEach(result => {
      console.log(`  ${result.file}`)
      console.log(`    Auth: ${result.authType}`)
      result.issues.forEach(issue => {
        console.log(`    ❌ ${issue}`)
      })
      console.log()
    })
  }

  // Print warning files
  if (warningResults.length > 0) {
    console.log('⚠️  WARNING FILES')
    console.log('-'.repeat(30))
    warningResults.forEach(result => {
      console.log(`  ${result.file}`)
      console.log(`    Auth: ${result.authType}`)
      console.log(`    Security: ${result.securityFeatures.join(', ') || 'None'}`)
      result.issues.forEach(issue => {
        console.log(`    ⚠️  ${issue}`)
      })
      console.log()
    })
  }

  // Print authentication summary
  console.log('🔐 AUTHENTICATION SUMMARY')
  console.log('-'.repeat(30))
  const authSummary = {
    unified: summary.results.filter(r => r.authType === 'unified').length,
    legacy: summary.results.filter(r => r.authType === 'legacy').length,
    none: summary.results.filter(r => r.authType === 'none').length
  }
  
  console.log(`Unified Auth (Keycloak): ${authSummary.unified}`)
  console.log(`Legacy Auth (JWT only): ${authSummary.legacy}`)
  console.log(`No Authentication: ${authSummary.none}`)
  console.log()

  // Print security features summary
  console.log('🛡️  SECURITY FEATURES SUMMARY')
  console.log('-'.repeat(30))
  const allSecurityFeatures = new Set<string>()
  summary.results.forEach(r => {
    r.securityFeatures.forEach(feature => allSecurityFeatures.add(feature))
  })

  Array.from(allSecurityFeatures).forEach(feature => {
    const count = summary.results.filter(r => r.securityFeatures.includes(feature)).length
    console.log(`${feature}: ${count} files`)
  })
  console.log()

  // Print migration recommendations
  if (authSummary.legacy > 0 || summary.failedFiles > 0) {
    console.log('📋 MIGRATION RECOMMENDATIONS')
    console.log('-'.repeat(30))
    
    if (authSummary.legacy > 0) {
      console.log('• Update legacy authentication to unified Keycloak auth')
      console.log('• Replace AuthenticatedUser with UnifiedAuthenticatedUser')
      console.log('• Use authStrategies.hybrid for backward compatibility')
    }
    
    if (summary.failedFiles > 0) {
      console.log('• Add authentication to unprotected endpoints')
      console.log('• Implement proper security middleware')
      console.log('• Add rate limiting and input validation')
    }
    
    if (warningResults.length > 0) {
      console.log('• Address security warnings')
      console.log('• Ensure all endpoints use secure response patterns')
    }
    console.log()
  }

  // Final status
  if (summary.failedFiles === 0 && summary.warningFiles === 0) {
    console.log('🎉 MIGRATION STATUS: COMPLETE')
    console.log('All API endpoints have been successfully migrated to unified Keycloak authentication!')
  } else if (summary.failedFiles === 0) {
    console.log('⚠️  MIGRATION STATUS: MOSTLY COMPLETE')
    console.log('Some warnings exist but no critical failures. Review warnings above.')
  } else {
    console.log('❌ MIGRATION STATUS: INCOMPLETE')
    console.log('Critical failures detected. Please address failed files above.')
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  validateAuthMigration()
    .then(printResults)
    .catch(error => {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    })
}

export { validateAuthMigration, ValidationResult, ValidationSummary }