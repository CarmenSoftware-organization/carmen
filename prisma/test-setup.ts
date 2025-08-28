#!/usr/bin/env ts-node

/**
 * ABAC Setup Test Script
 * Validates database connection, schema, and basic operations
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL'
  message: string
  duration?: number
}

class ABACSetupTester {
  private results: TestResult[] = []

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting ABAC Setup Tests...\n')

    await this.testDatabaseConnection()
    await this.testSchemaValidation()
    await this.testBasicOperations()
    await this.testJSONOperations()
    await this.testRelationships()
    
    this.printResults()
    
    if (this.results.some(r => r.status === 'FAIL')) {
      process.exit(1)
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    const startTime = Date.now()
    
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT version()`
      
      this.results.push({
        name: 'Database Connection',
        status: 'PASS',
        message: 'Successfully connected to PostgreSQL',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        name: 'Database Connection',
        status: 'FAIL',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      })
    }
  }

  private async testSchemaValidation(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test that all models are accessible
      const modelTests = [
        () => prisma.user.findMany({ take: 0 }),
        () => prisma.role.findMany({ take: 0 }),
        () => prisma.policy.findMany({ take: 0 }),
        () => prisma.resourceDefinition.findMany({ take: 0 }),
        () => prisma.environmentDefinition.findMany({ take: 0 }),
        () => prisma.accessRequest.findMany({ take: 0 }),
        () => prisma.userRoleAssignment.findMany({ take: 0 })
      ]
      
      await Promise.all(modelTests.map(test => test()))
      
      this.results.push({
        name: 'Schema Validation',
        status: 'PASS',
        message: 'All models accessible, schema is valid',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        name: 'Schema Validation',
        status: 'FAIL',
        message: `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      })
    }
  }

  private async testBasicOperations(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test basic CRUD operations
      const testUser = await prisma.user.create({
        data: {
          name: 'test_user_setup',
          email: 'test@setup.com',
          userData: {
            profile: { firstName: 'Test', lastName: 'User' },
            context: { department: 'testing' }
          },
          createdBy: 'setup-test',
          updatedBy: 'setup-test'
        }
      })
      
      const foundUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      })
      
      if (!foundUser) {
        throw new Error('User not found after creation')
      }
      
      await prisma.user.delete({
        where: { id: testUser.id }
      })
      
      this.results.push({
        name: 'Basic Operations',
        status: 'PASS',
        message: 'CRUD operations working correctly',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        name: 'Basic Operations',
        status: 'FAIL',
        message: `CRUD operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      })
    }
  }

  private async testJSONOperations(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test JSON field operations
      const testPolicy = await prisma.policy.create({
        data: {
          name: 'test_policy_setup',
          effect: 'PERMIT',
          policyData: {
            target: {
              subjects: [{ type: 'role', values: ['test'] }],
              resources: [{ type: 'test_resource' }],
              actions: ['test_action']
            },
            rules: [{
              id: 'test_rule',
              name: 'Test Rule',
              condition: {
                type: 'simple',
                attribute: 'user.department',
                operator: 'EQUALS',
                value: 'testing'
              }
            }]
          },
          createdBy: 'setup-test',
          updatedBy: 'setup-test'
        }
      })
      
      // Test JSON querying
      const foundPolicy = await prisma.policy.findFirst({
        where: {
          policyData: {
            path: ['target', 'actions'],
            array_contains: 'test_action'
          }
        }
      })
      
      if (!foundPolicy) {
        throw new Error('JSON query did not return expected result')
      }
      
      await prisma.policy.delete({
        where: { id: testPolicy.id }
      })
      
      this.results.push({
        name: 'JSON Operations',
        status: 'PASS',
        message: 'JSON fields working correctly',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        name: 'JSON Operations',
        status: 'FAIL',
        message: `JSON operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      })
    }
  }

  private async testRelationships(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test relationships
      const testRole = await prisma.role.create({
        data: {
          name: 'test_role_setup',
          displayName: 'Test Role',
          level: 0,
          path: '/test_role_setup',
          roleData: {
            attributes: { testAttribute: 'testValue' },
            basePermissions: []
          },
          createdBy: 'setup-test',
          updatedBy: 'setup-test'
        }
      })
      
      const testUser = await prisma.user.create({
        data: {
          name: 'test_user_rel',
          email: 'test-rel@setup.com',
          userData: {
            profile: { firstName: 'Test', lastName: 'Relationship' }
          },
          createdBy: 'setup-test',
          updatedBy: 'setup-test'
        }
      })
      
      const roleAssignment = await prisma.userRoleAssignment.create({
        data: {
          userId: testUser.id,
          roleId: testRole.id,
          assignedBy: 'setup-test',
          createdBy: 'setup-test',
          updatedBy: 'setup-test',
          context: { isPrimary: true }
        }
      })
      
      // Test relationship queries
      const userWithRoles = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: { roleAssignments: true }
      })
      
      if (!userWithRoles || userWithRoles.roleAssignments.length === 0) {
        throw new Error('Relationship query failed')
      }
      
      // Cleanup
      await prisma.userRoleAssignment.delete({ where: { id: roleAssignment.id } })
      await prisma.user.delete({ where: { id: testUser.id } })
      await prisma.role.delete({ where: { id: testRole.id } })
      
      this.results.push({
        name: 'Relationships',
        status: 'PASS',
        message: 'Model relationships working correctly',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        name: 'Relationships',
        status: 'FAIL',
        message: `Relationship test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      })
    }
  }

  private printResults(): void {
    console.log('\n📊 Test Results:')
    console.log('================')
    
    let passCount = 0
    let failCount = 0
    
    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : '❌'
      const duration = result.duration ? `(${result.duration}ms)` : ''
      
      console.log(`${icon} ${result.name} ${duration}`)
      console.log(`   ${result.message}`)
      
      if (result.status === 'PASS') {
        passCount++
      } else {
        failCount++
      }
    }
    
    console.log('\n📈 Summary:')
    console.log(`   ${passCount} tests passed`)
    console.log(`   ${failCount} tests failed`)
    
    if (failCount === 0) {
      console.log('\n🎉 All tests passed! ABAC system is ready.')
    } else {
      console.log('\n🚨 Some tests failed. Please check the configuration.')
    }
  }
}

async function main() {
  const tester = new ABACSetupTester()
  
  try {
    await tester.runAllTests()
  } catch (error) {
    console.error('❌ Setup test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch(console.error)
}