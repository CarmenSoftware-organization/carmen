/**
 * JSON-based Data Storage System
 *
 * Simple file-based storage to replace Prisma for prototype/development.
 * Uses JSON files to store data with in-memory caching for performance.
 *
 * @author Carmen ERP Team
 */

import fs from 'fs'
import path from 'path'

// Storage directory
const STORAGE_DIR = path.join(process.cwd(), '.data')

// In-memory cache
const cache: Map<string, any> = new Map()

/**
 * Ensures storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

/**
 * Get file path for a collection
 */
function getFilePath(collection: string): string {
  return path.join(STORAGE_DIR, `${collection}.json`)
}

/**
 * Read data from a collection
 */
export function read<T = any>(collection: string): T[] {
  // Check cache first
  if (cache.has(collection)) {
    return cache.get(collection)
  }

  ensureStorageDir()
  const filePath = getFilePath(collection)

  if (!fs.existsSync(filePath)) {
    return []
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    cache.set(collection, data)
    return data
  } catch (error) {
    console.error(`Error reading ${collection}:`, error)
    return []
  }
}

/**
 * Write data to a collection
 */
export function write<T = any>(collection: string, data: T[]): void {
  ensureStorageDir()
  const filePath = getFilePath(collection)

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    cache.set(collection, data)
  } catch (error) {
    console.error(`Error writing ${collection}:`, error)
    throw error
  }
}

/**
 * Find one item by condition
 */
export function findOne<T = any>(
  collection: string,
  condition: (item: T) => boolean
): T | null {
  const data = read<T>(collection)
  return data.find(condition) || null
}

/**
 * Find many items by condition
 */
export function findMany<T = any>(
  collection: string,
  condition?: (item: T) => boolean
): T[] {
  const data = read<T>(collection)
  if (!condition) return data
  return data.filter(condition)
}

/**
 * Create a new item
 */
export function create<T extends { id: string }>(
  collection: string,
  item: T
): T {
  const data = read<T>(collection)

  // Check for duplicate ID
  if (data.some(existing => existing.id === item.id)) {
    throw new Error(`Item with id ${item.id} already exists in ${collection}`)
  }

  data.push(item)
  write(collection, data)
  return item
}

/**
 * Create many items
 */
export function createMany<T extends { id: string }>(
  collection: string,
  items: T[]
): T[] {
  const data = read<T>(collection)

  // Check for duplicate IDs
  const existingIds = new Set(data.map(item => item.id))
  const duplicates = items.filter(item => existingIds.has(item.id))

  if (duplicates.length > 0) {
    throw new Error(`Duplicate IDs found in ${collection}: ${duplicates.map(d => d.id).join(', ')}`)
  }

  data.push(...items)
  write(collection, data)
  return items
}

/**
 * Update an item by ID
 */
export function update<T extends { id: string }>(
  collection: string,
  id: string,
  updates: Partial<T>
): T | null {
  const data = read<T>(collection)
  const index = data.findIndex(item => item.id === id)

  if (index === -1) {
    return null
  }

  data[index] = { ...data[index], ...updates }
  write(collection, data)
  return data[index]
}

/**
 * Update many items by condition
 */
export function updateMany<T extends { id: string }>(
  collection: string,
  condition: (item: T) => boolean,
  updates: Partial<T>
): number {
  const data = read<T>(collection)
  let count = 0

  for (let i = 0; i < data.length; i++) {
    if (condition(data[i])) {
      data[i] = { ...data[i], ...updates }
      count++
    }
  }

  if (count > 0) {
    write(collection, data)
  }

  return count
}

/**
 * Delete an item by ID
 */
export function deleteOne<T extends { id: string }>(
  collection: string,
  id: string
): boolean {
  const data = read<T>(collection)
  const initialLength = data.length
  const filtered = data.filter(item => item.id !== id)

  if (filtered.length < initialLength) {
    write(collection, filtered)
    return true
  }

  return false
}

/**
 * Delete many items by condition
 */
export function deleteMany<T = any>(
  collection: string,
  condition: (item: T) => boolean
): number {
  const data = read<T>(collection)
  const initialLength = data.length
  const filtered = data.filter(item => !condition(item))

  const deletedCount = initialLength - filtered.length
  if (deletedCount > 0) {
    write(collection, filtered)
  }

  return deletedCount
}

/**
 * Count items by condition
 */
export function count<T = any>(
  collection: string,
  condition?: (item: T) => boolean
): number {
  const data = read<T>(collection)
  if (!condition) return data.length
  return data.filter(condition).length
}

/**
 * Clear cache for a collection
 */
export function clearCache(collection?: string): void {
  if (collection) {
    cache.delete(collection)
  } else {
    cache.clear()
  }
}

/**
 * Initialize a collection with default data
 */
export function initialize<T = any>(
  collection: string,
  defaultData: T[]
): void {
  const filePath = getFilePath(collection)

  if (!fs.existsSync(filePath)) {
    write(collection, defaultData)
  }
}

/**
 * Check if collection exists
 */
export function exists(collection: string): boolean {
  const filePath = getFilePath(collection)
  return fs.existsSync(filePath)
}

/**
 * Get all collection names
 */
export function getCollections(): string[] {
  ensureStorageDir()

  if (!fs.existsSync(STORAGE_DIR)) {
    return []
  }

  return fs.readdirSync(STORAGE_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''))
}

/**
 * Export data from a collection
 */
export function exportData<T = any>(collection: string): T[] {
  return read<T>(collection)
}

/**
 * Import data to a collection (replaces existing data)
 */
export function importData<T = any>(
  collection: string,
  data: T[],
  merge: boolean = false
): void {
  if (merge) {
    const existing = read<T>(collection)
    write(collection, [...existing, ...data])
  } else {
    write(collection, data)
  }
}

// JSON Storage Client (Prisma-like interface)
export const jsonDb = {
  read,
  write,
  findOne,
  findMany,
  create,
  createMany,
  update,
  updateMany,
  delete: deleteOne,
  deleteMany,
  count,
  clearCache,
  initialize,
  exists,
  getCollections,
  export: exportData,
  import: importData,
}

export default jsonDb
