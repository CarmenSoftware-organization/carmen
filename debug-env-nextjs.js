#!/usr/bin/env node

// Test environment validation in Next.js context
console.log('🔍 Testing environment configuration...')

// Load environment variables first
require('dotenv').config({ path: '.env.local' })

console.log('\n📋 Environment variables loaded:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET)

// Check problematic optional variables
const optionalVars = [
  'DB_ALERT_WEBHOOK_URL',
  'CSP_REPORT_URI', 
  'EMAIL_FROM',
  'EMAIL_PORT',
  'REDIS_URL',
  'METRICS_PORT'
]

console.log('\n🔍 Optional variables status:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`${varName}:`, {
    exists: varName in process.env,
    value: value,
    type: typeof value,
    isEmpty: value === '',
    isUndefined: value === undefined
  })
})

// Now test the validation
try {
  const { validateEnvironment } = require('./lib/config/environment')
  
  console.log('\n🧪 Running validation...')
  const result = validateEnvironment()
  
  console.log('Validation success:', result.success)
  
  if (!result.success) {
    console.log('\n❌ Critical errors:')
    result.criticalErrors?.forEach(error => console.log(`  • ${error}`))
    
    console.log('\n⚠️ Warnings:')  
    result.warnings?.forEach(warning => console.log(`  • ${warning}`))
    
    if (result.errors) {
      console.log('\n📋 Full validation errors:')
      console.log(JSON.stringify(result.errors.format(), null, 2))
    }
  } else {
    console.log('✅ Environment validation passed!')
  }
  
} catch (error) {
  console.error('❌ Error testing validation:', error.message)
  console.error('Stack trace:', error.stack)
}