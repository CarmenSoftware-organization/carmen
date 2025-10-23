/**
 * Encryption and Cryptographic Utilities
 * 
 * Provides secure encryption, decryption, hashing, and key management
 * utilities following industry best practices for data protection.
 * 
 * @author Carmen ERP Team
 */

import crypto from 'crypto'
import { getAuthSecurityConfig } from '@/lib/config/environment'

// Encryption Configuration
interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  tagLength: number
  saltLength: number
}

// Encryption Result
export interface EncryptionResult {
  encrypted: string
  iv: string
  tag: string
  salt?: string
}

// Decryption Result
export interface DecryptionResult {
  success: boolean
  decrypted?: string
  error?: string
}

// Hash Result
export interface HashResult {
  hash: string
  salt: string
  iterations: number
  algorithm: string
}

// Hash Verification Result
export interface HashVerificationResult {
  success: boolean
  needsRehash: boolean
}

/**
 * Advanced Encryption Service
 * Provides AES-GCM encryption with secure key derivation and random IV generation
 */
export class EncryptionService {
  private config = getAuthSecurityConfig()
  
  private readonly encryptionConfig: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32, // 256 bits
    ivLength: 16,  // 128 bits
    tagLength: 16, // 128 bits
    saltLength: 32 // 256 bits
  }

  private readonly hashConfig = {
    algorithm: 'pbkdf2',
    hashAlgorithm: 'sha256',
    iterations: 100000, // OWASP recommended minimum
    saltLength: 32,
    keyLength: 64
  }

  /**
   * Encrypt sensitive data using AES-GCM
   */
  encrypt(plaintext: string, useKeyDerivation: boolean = false): EncryptionResult {
    try {
      const iv = crypto.randomBytes(this.encryptionConfig.ivLength)
      let key: Buffer
      let salt: string | undefined

      if (useKeyDerivation) {
        // Use key derivation for extra security
        const saltBuffer = crypto.randomBytes(this.encryptionConfig.saltLength)
        salt = saltBuffer.toString('base64')
        key = crypto.pbkdf2Sync(
          this.config.ENCRYPTION_KEY,
          saltBuffer,
          10000,
          this.encryptionConfig.keyLength,
          'sha256'
        )
      } else {
        // Use direct key
        key = Buffer.from(this.config.ENCRYPTION_KEY, 'utf8')
      }

      const cipher = crypto.createCipheriv(this.encryptionConfig.algorithm, key, iv) as crypto.CipherGCM
      cipher.setAAD(Buffer.from('carmen-erp', 'utf8')) // Additional authenticated data

      let encrypted = cipher.update(plaintext, 'utf8', 'base64')
      encrypted += cipher.final('base64')

      const tag = cipher.getAuthTag()

      return {
        encrypted,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        salt
      }

    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Encryption failed')
    }
  }

  /**
   * Decrypt data encrypted with AES-GCM
   */
  decrypt(encryptionResult: EncryptionResult): DecryptionResult {
    try {
      const { encrypted, iv, tag, salt } = encryptionResult
      
      let key: Buffer

      if (salt) {
        // Use key derivation
        const saltBuffer = Buffer.from(salt, 'base64')
        key = crypto.pbkdf2Sync(
          this.config.ENCRYPTION_KEY,
          saltBuffer,
          10000,
          this.encryptionConfig.keyLength,
          'sha256'
        )
      } else {
        // Use direct key
        key = Buffer.from(this.config.ENCRYPTION_KEY, 'utf8')
      }

      const ivBuffer = Buffer.from(iv, 'base64')
      const decipher = crypto.createDecipheriv(this.encryptionConfig.algorithm, key, ivBuffer) as crypto.DecipherGCM
      decipher.setAAD(Buffer.from('carmen-erp', 'utf8')) // Must match AAD from encryption
      decipher.setAuthTag(Buffer.from(tag, 'base64'))

      let decrypted = decipher.update(encrypted, 'base64', 'utf8')
      decrypted += decipher.final('utf8')

      return {
        success: true,
        decrypted
      }

    } catch (error) {
      return {
        success: false,
        error: 'Decryption failed: Invalid data or key'
      }
    }
  }

  /**
   * Create secure hash with salt (for passwords)
   */
  createHash(input: string, customSalt?: string): HashResult {
    try {
      const salt = customSalt || crypto.randomBytes(this.hashConfig.saltLength).toString('base64')
      const saltBuffer = Buffer.from(salt, 'base64')

      const hash = crypto.pbkdf2Sync(
        input,
        saltBuffer,
        this.hashConfig.iterations,
        this.hashConfig.keyLength,
        this.hashConfig.hashAlgorithm
      )

      return {
        hash: hash.toString('base64'),
        salt,
        iterations: this.hashConfig.iterations,
        algorithm: `${this.hashConfig.algorithm}-${this.hashConfig.hashAlgorithm}`
      }

    } catch (error) {
      console.error('Hash creation error:', error)
      throw new Error('Hash creation failed')
    }
  }

  /**
   * Verify hash against input
   */
  verifyHash(input: string, hashResult: HashResult): HashVerificationResult {
    try {
      const computedHash = this.createHash(input, hashResult.salt)
      
      // Constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(computedHash.hash, 'base64'),
        Buffer.from(hashResult.hash, 'base64')
      )

      // Check if rehashing is needed (iterations changed)
      const needsRehash = hashResult.iterations < this.hashConfig.iterations

      return {
        success: isValid,
        needsRehash
      }

    } catch (error) {
      return {
        success: false,
        needsRehash: false
      }
    }
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url')
  }

  /**
   * Generate secure random password
   */
  generatePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length)
      password += charset[randomIndex]
    }

    // Ensure password meets complexity requirements
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)

    if (!hasLower || !hasUpper || !hasDigit || !hasSpecial) {
      // Regenerate if doesn't meet requirements
      return this.generatePassword(length)
    }

    return password
  }

  /**
   * Create HMAC signature
   */
  createSignature(data: string, secret?: string): string {
    const key = secret || this.config.ENCRYPTION_KEY
    return crypto.createHmac('sha256', key).update(data).digest('base64')
  }

  /**
   * Verify HMAC signature
   */
  verifySignature(data: string, signature: string, secret?: string): boolean {
    try {
      const expectedSignature = this.createSignature(data, secret)
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      )
    } catch (error) {
      return false
    }
  }

  /**
   * Generate cryptographic hash (SHA-256)
   */
  hash(input: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(input).digest('hex')
  }

  /**
   * Encrypt JSON data
   */
  encryptJSON(data: any, useKeyDerivation: boolean = true): string {
    const jsonString = JSON.stringify(data)
    const encryptionResult = this.encrypt(jsonString, useKeyDerivation)
    return Buffer.from(JSON.stringify(encryptionResult)).toString('base64')
  }

  /**
   * Decrypt JSON data
   */
  decryptJSON<T = any>(encryptedData: string): T | null {
    try {
      const encryptionResult = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'))
      const decryptionResult = this.decrypt(encryptionResult)
      
      if (!decryptionResult.success || !decryptionResult.decrypted) {
        return null
      }

      return JSON.parse(decryptionResult.decrypted)
    } catch (error) {
      return null
    }
  }

  /**
   * Create session token with expiration
   */
  createSessionToken(userId: string, sessionData: any = {}): string {
    const tokenData = {
      userId,
      sessionData,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }

    return this.encryptJSON(tokenData)
  }

  /**
   * Verify and decode session token
   */
  verifySessionToken(token: string): { valid: boolean; userId?: string; sessionData?: any; expired?: boolean } {
    try {
      const tokenData = this.decryptJSON(token)
      
      if (!tokenData || !tokenData.userId) {
        return { valid: false }
      }

      // Check expiration
      if (Date.now() > tokenData.expiresAt) {
        return { valid: false, expired: true }
      }

      return {
        valid: true,
        userId: tokenData.userId,
        sessionData: tokenData.sessionData
      }

    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Encrypt sensitive field for database storage
   */
  encryptField(value: string): string {
    // Use key derivation for database fields for extra security
    const result = this.encrypt(value, true)
    return JSON.stringify(result)
  }

  /**
   * Decrypt sensitive field from database
   */
  decryptField(encryptedValue: string): string | null {
    try {
      const encryptionResult = JSON.parse(encryptedValue)
      const decryptionResult = this.decrypt(encryptionResult)
      return decryptionResult.success ? decryptionResult.decrypted || null : null
    } catch (error) {
      return null
    }
  }

  /**
   * Generate API key
   */
  generateAPIKey(): string {
    const prefix = 'carmen_'
    const randomPart = this.generateToken(32)
    return `${prefix}${randomPart}`
  }

  /**
   * Hash API key for storage
   */
  hashAPIKey(apiKey: string): HashResult {
    return this.createHash(apiKey)
  }

  /**
   * Create time-limited verification code
   */
  createVerificationCode(identifier: string, expirationMinutes: number = 15): {
    code: string
    hash: string
    expiresAt: number
  } {
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString()
    const expiresAt = Date.now() + (expirationMinutes * 60 * 1000)
    
    // Create hash with expiration and identifier
    const dataToHash = `${identifier}:${code}:${expiresAt}`
    const hash = this.createSignature(dataToHash)

    return { code, hash, expiresAt }
  }

  /**
   * Verify time-limited verification code
   */
  verifyVerificationCode(
    identifier: string,
    code: string,
    hash: string,
    expiresAt: number
  ): { valid: boolean; expired?: boolean } {
    try {
      // Check expiration first
      if (Date.now() > expiresAt) {
        return { valid: false, expired: true }
      }

      // Verify hash
      const dataToVerify = `${identifier}:${code}:${expiresAt}`
      const isValid = this.verifySignature(dataToVerify, hash)

      return { valid: isValid }

    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Generate secure file name
   */
  generateSecureFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = this.generateToken(8)
    const extension = originalName.split('.').pop()
    return `${timestamp}_${random}.${extension}`
  }

  /**
   * Create checksum for file integrity
   */
  createChecksum(data: Buffer, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex')
  }

  /**
   * Verify file checksum
   */
  verifyChecksum(data: Buffer, expectedChecksum: string, algorithm: string = 'sha256'): boolean {
    const actualChecksum = this.createChecksum(data, algorithm)
    return actualChecksum === expectedChecksum
  }
}

// Singleton instance
export const encryptionService = new EncryptionService()

/**
 * Convenience functions for common operations
 */

// Password utilities
export function hashPassword(password: string): HashResult {
  return encryptionService.createHash(password)
}

export function verifyPassword(password: string, hashResult: HashResult): HashVerificationResult {
  return encryptionService.verifyHash(password, hashResult)
}

// Data encryption utilities
export function encryptSensitiveData(data: string): EncryptionResult {
  return encryptionService.encrypt(data, true)
}

export function decryptSensitiveData(encryptionResult: EncryptionResult): string | null {
  const result = encryptionService.decrypt(encryptionResult)
  return result.success ? result.decrypted || null : null
}

// Token utilities
export function generateSecureToken(length?: number): string {
  return encryptionService.generateToken(length)
}

export function generateAPIKey(): string {
  return encryptionService.generateAPIKey()
}

// Session utilities
export function createSessionToken(userId: string, sessionData?: any): string {
  return encryptionService.createSessionToken(userId, sessionData)
}

export function verifySessionToken(token: string) {
  return encryptionService.verifySessionToken(token)
}

// Database field encryption
export function encryptDatabaseField(value: string): string {
  return encryptionService.encryptField(value)
}

export function decryptDatabaseField(encryptedValue: string): string | null {
  return encryptionService.decryptField(encryptedValue)
}

// Types are already exported above with 'export interface'