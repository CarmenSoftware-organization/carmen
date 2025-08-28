import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface SeedData {
  resourceDefinitions: any[]
  environmentDefinitions: any[]
  roles: any[]
  policies: any[]
  users: any[]
  accessRequests: any[]
}

async function loadSeedData(): Promise<SeedData> {
  const seedDataPath = join(__dirname, 'seed-data')
  
  const resourceDefinitions = JSON.parse(
    readFileSync(join(seedDataPath, 'resource-definitions.json'), 'utf8')
  )
  
  const environmentDefinitions = JSON.parse(
    readFileSync(join(seedDataPath, 'environment-definitions.json'), 'utf8')
  )
  
  const roles = JSON.parse(
    readFileSync(join(seedDataPath, 'sample-roles.json'), 'utf8')
  )
  
  const policies = JSON.parse(
    readFileSync(join(seedDataPath, 'sample-policies.json'), 'utf8')
  )
  
  const users = JSON.parse(
    readFileSync(join(seedDataPath, 'sample-users.json'), 'utf8')
  )
  
  const accessRequests = JSON.parse(
    readFileSync(join(seedDataPath, 'sample-access-requests.json'), 'utf8')
  )
  
  return {
    resourceDefinitions,
    environmentDefinitions,
    roles,
    policies,
    users,
    accessRequests
  }
}

async function seedResourceDefinitions(data: any[]) {
  console.log('🔧 Seeding resource definitions...')
  
  for (const resource of data) {
    await prisma.resourceDefinition.upsert({
      where: { resourceType: resource.resourceType },
      update: {
        displayName: resource.displayName,
        description: resource.description,
        category: resource.category,
        definition: resource.definition,
        isActive: resource.isActive,
        version: resource.version || '1.0',
        updatedBy: resource.updatedBy || 'seed-script'
      },
      create: {
        resourceType: resource.resourceType,
        displayName: resource.displayName,
        description: resource.description,
        category: resource.category,
        definition: resource.definition,
        isActive: resource.isActive,
        version: resource.version || '1.0',
        createdBy: resource.createdBy || 'seed-script',
        updatedBy: resource.updatedBy || 'seed-script'
      }
    })
  }
  
  console.log(`✅ Created ${data.length} resource definitions`)
}

async function seedEnvironmentDefinitions(data: any[]) {
  console.log('🌍 Seeding environment definitions...')
  
  for (const environment of data) {
    await prisma.environmentDefinition.upsert({
      where: { name: environment.name },
      update: {
        displayName: environment.displayName,
        description: environment.description,
        definition: environment.definition,
        isActive: environment.isActive,
        updatedBy: environment.updatedBy || 'seed-script'
      },
      create: {
        name: environment.name,
        displayName: environment.displayName,
        description: environment.description,
        definition: environment.definition,
        isActive: environment.isActive,
        createdBy: environment.createdBy || 'seed-script',
        updatedBy: environment.updatedBy || 'seed-script'
      }
    })
  }
  
  console.log(`✅ Created ${data.length} environment definitions`)
}

async function seedRoles(data: any[]) {
  console.log('👥 Seeding roles...')
  
  // First pass: Create all roles without parent relationships
  for (const role of data) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
        level: role.level,
        path: role.path,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
        priority: role.priority,
        color: role.color,
        icon: role.icon,
        roleData: role.roleData,
        updatedBy: role.updatedBy || 'seed-script'
      },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        level: role.level,
        path: role.path,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
        priority: role.priority,
        color: role.color,
        icon: role.icon,
        roleData: role.roleData,
        createdBy: role.createdBy || 'seed-script',
        updatedBy: role.updatedBy || 'seed-script'
      }
    })
  }
  
  // Second pass: Update parent relationships
  for (const role of data) {
    if (role.parentId) {
      const parentRole = await prisma.role.findUnique({
        where: { name: role.parentId }
      })
      
      if (parentRole) {
        await prisma.role.update({
          where: { name: role.name },
          data: { parentId: parentRole.id }
        })
      }
    }
  }
  
  console.log(`✅ Created ${data.length} roles with hierarchy`)
}

async function seedPolicies(data: any[]) {
  console.log('📋 Seeding policies...')
  
  for (const policy of data) {
    await prisma.policy.upsert({
      where: { name: policy.name },
      update: {
        description: policy.description,
        policyData: policy.policyData,
        priority: policy.priority,
        effect: policy.effect || 'PERMIT',
        status: policy.isActive ? 'ACTIVE' : 'INACTIVE',
        updatedBy: policy.updatedBy || 'seed-script'
      },
      create: {
        name: policy.name,
        description: policy.description,
        policyData: policy.policyData,
        priority: policy.priority,
        effect: policy.effect || 'PERMIT',
        status: policy.isActive ? 'ACTIVE' : 'INACTIVE',
        createdBy: policy.createdBy || 'seed-script',
        updatedBy: policy.updatedBy || 'seed-script'
      }
    })
  }
  
  console.log(`✅ Created ${data.length} policies`)
}

async function seedUsers(data: any[]) {
  console.log('👤 Seeding users...')
  
  for (const user of data) {
    await prisma.user.upsert({
      where: { name: user.name },
      update: {
        email: user.email,
        userData: user.userData,
        isActive: user.isActive,
        updatedBy: user.updatedBy || 'seed-script'
      },
      create: {
        name: user.name,
        email: user.email,
        userData: user.userData,
        isActive: user.isActive,
        createdBy: user.createdBy || 'seed-script',
        updatedBy: user.updatedBy || 'seed-script'
      }
    })
  }
  
  console.log(`✅ Created ${data.length} users`)
}

async function seedAccessRequests(data: any[]) {
  console.log('🔍 Seeding sample access requests...')
  
  for (const request of data) {
    await prisma.accessRequest.create({
      data: {
        requestType: request.requestType,
        requestData: request.requestData,
        evaluationResult: request.evaluationMetadata || {}, // Use evaluationMetadata as evaluationResult
        decision: request.decision,
        matchedPolicies: request.matchedPolicies || [],
        evaluationMetadata: request.evaluationMetadata
      }
    })
  }
  
  console.log(`✅ Created ${data.length} access request examples`)
}

async function createRoleAssignments() {
  console.log('🔗 Creating role assignments...')
  
  const roleAssignments = [
    { userName: 'admin', roleName: 'system_administrator' },
    { userName: 'john.manager', roleName: 'general_manager' },
    { userName: 'maria.chef', roleName: 'executive_chef' },
    { userName: 'david.staff', roleName: 'staff' },
    { userName: 'sarah.purchasing', roleName: 'department_manager' }
  ]
  
  for (const assignment of roleAssignments) {
    const user = await prisma.user.findUnique({
      where: { name: assignment.userName }
    })
    
    const role = await prisma.role.findUnique({
      where: { name: assignment.roleName }
    })
    
    if (user && role) {
      await prisma.userRoleAssignment.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id
          }
        },
        update: {
          isActive: true,
          updatedBy: 'seed-script'
        },
        create: {
          userId: user.id,
          roleId: role.id,
          assignedBy: 'seed-script',
          assignedAt: new Date(),
          isActive: true,
          createdBy: 'seed-script',
          updatedBy: 'seed-script'
        }
      })
    }
  }
  
  console.log(`✅ Created ${roleAssignments.length} role assignments`)
}

async function verifySeeding() {
  console.log('🔎 Verifying seeded data...')
  
  const counts = {
    resourceDefinitions: await prisma.resourceDefinition.count(),
    environmentDefinitions: await prisma.environmentDefinition.count(),
    roles: await prisma.role.count(),
    policies: await prisma.policy.count(),
    users: await prisma.user.count(),
    roleAssignments: await prisma.userRoleAssignment.count(),
    accessRequests: await prisma.accessRequest.count()
  }
  
  console.log('📊 Database Summary:')
  console.log(`   Resource Definitions: ${counts.resourceDefinitions}`)
  console.log(`   Environment Definitions: ${counts.environmentDefinitions}`)
  console.log(`   Roles: ${counts.roles}`)
  console.log(`   Policies: ${counts.policies}`)
  console.log(`   Users: ${counts.users}`)
  console.log(`   Role Assignments: ${counts.roleAssignments}`)
  console.log(`   Access Requests: ${counts.accessRequests}`)
  
  return counts
}

async function main() {
  console.log('🚀 Starting ABAC database seeding...')
  
  try {
    // Load all seed data
    const seedData = await loadSeedData()
    
    // Clear existing data (in reverse dependency order)
    console.log('🧹 Cleaning existing data...')
    await prisma.accessRequest.deleteMany()
    await prisma.userRoleAssignment.deleteMany()
    await prisma.user.deleteMany()
    await prisma.policy.deleteMany()
    await prisma.role.deleteMany()
    await prisma.environmentDefinition.deleteMany()
    await prisma.resourceDefinition.deleteMany()
    
    // Seed data (in dependency order)
    await seedResourceDefinitions(seedData.resourceDefinitions)
    await seedEnvironmentDefinitions(seedData.environmentDefinitions)
    await seedRoles(seedData.roles)
    await seedPolicies(seedData.policies)
    await seedUsers(seedData.users)
    await createRoleAssignments()
    await seedAccessRequests(seedData.accessRequests)
    
    // Verify the results
    const summary = await verifySeeding()
    
    console.log('🎉 ABAC database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })