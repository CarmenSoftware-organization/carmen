import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    datasourceUrl: process.env.DATABASE_URL,
  })
} else {
  // In development, use a global variable so the connection is cached across hot reloads
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasourceUrl: process.env.DATABASE_URL,
      errorFormat: 'pretty',
    })
  }
  prisma = global.cachedPrisma
}

// Connection pool configuration
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Shutting down Prisma client...')
  try {
    await prisma.$disconnect()
    console.log('Prisma client disconnected successfully')
  } catch (error) {
    console.error('Error during Prisma client shutdown:', error)
  }
}

// Handle various shutdown signals
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('beforeExit', gracefulShutdown)

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error)
  await gracefulShutdown()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
  await gracefulShutdown()
  process.exit(1)
})

export { prisma }
export default prisma

// Export types for use throughout the application
export type { PrismaClient } from '../../generated/client'