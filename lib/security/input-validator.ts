/**
 * Input Validation and Sanitization
 * 
 * Provides comprehensive input validation, sanitization, and protection
 * against common attacks like XSS, SQL injection, and command injection.
 * 
 * @author Carmen ERP Team
 */

import { z } from 'zod'
import { createSecurityAuditLog, SecurityEventType } from './audit-logger'

// Validation Result Interface
export interface ValidationResult<T = any> {
  success: boolean
  data?: T
  errors?: string[]
  sanitized?: T
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  threats?: string[]
}

// Sanitization Options
export interface SanitizationOptions {
  allowHtml?: boolean
  allowScripts?: boolean
  allowStyles?: boolean
  allowLinks?: boolean
  maxLength?: number
  trimWhitespace?: boolean
  normalizeUnicode?: boolean
  removeSuspiciousPatterns?: boolean
}

/**
 * Advanced Input Validator with Security Features
 */
export class SecurityInputValidator {
  
  // Common attack patterns
  private readonly ATTACK_PATTERNS = {
    // XSS patterns
    xss: [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /expression\s*\(/gi,
      /url\s*\(\s*javascript:/gi,
      /@import/gi,
      /binding\s*:/gi
    ],
    
    // SQL injection patterns
    sqlInjection: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(\b(UNION|JOIN)\b.*\b(SELECT)\b)/gi,
      /(--|\#|\/\*|\*\/)/g,
      /(\bOR\b.*=.*\bOR\b)/gi,
      /(\bAND\b.*=.*\bAND\b)/gi,
      /('|\")(\s)*(or|and)(\s)*('|\")/gi,
      /(=\s*'[^']*'\s*(or|and)\s*'[^']*'\s*=)/gi,
      /(\bunion\b.*\bselect\b.*\bfrom\b)/gi,
      /(\bdrop\b.*\btable\b)/gi,
      /(\bexec\b.*\bxp_)/gi
    ],
    
    // Command injection patterns
    commandInjection: [
      /[;&|`$(){}[\]]/g,
      /\b(rm|del|format|fdisk|mkfs)\b/gi,
      /\b(cat|type|more|less)\b.*[>|<]/gi,
      /\b(wget|curl|nc|netcat)\b/gi,
      /\b(chmod|chown|sudo|su)\b/gi,
      /(\\x[0-9a-fA-F]{2})/g,
      /%[0-9a-fA-F]{2}/g
    ],
    
    // Path traversal patterns
    pathTraversal: [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%252e%252e%252f/gi,
      /\.\.%2f/gi,
      /\.\.%5c/gi
    ],
    
    // LDAP injection patterns
    ldapInjection: [
      /[()&|!]/g,
      /\*(?!\s*$)/g, // Asterisk not at end
      /\\[0-9a-fA-F]{2}/g
    ],
    
    // Email header injection
    emailInjection: [
      /[\r\n](to|cc|bcc|from|subject):/gi,
      /[\r\n]content-type:/gi,
      /[\r\n]mime-version:/gi,
      /[\r\n]x-/gi
    ],
    
    // Common malicious patterns
    malicious: [
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /RegExp\s*\(/gi,
      /.constructor/gi,
      /__proto__/gi,
      /prototype/gi,
      /document\.(cookie|domain)/gi,
      /window\.(location|open)/gi,
      /XMLHttpRequest/gi,
      /fetch\s*\(/gi,
      /import\s*\(/gi,
      /require\s*\(/gi
    ]
  }

  // Safe HTML tags (if HTML is allowed)
  private readonly SAFE_HTML_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre'
  ]

  // Safe HTML attributes
  private readonly SAFE_HTML_ATTRIBUTES = [
    'class', 'id', 'title', 'alt'
  ]

  /**
   * Validate and sanitize input data
   */
  async validateInput<T>(
    input: unknown,
    schema: z.ZodSchema<T>,
    options: SanitizationOptions = {}
  ): Promise<ValidationResult<T>> {
    try {
      // First pass: basic validation
      const parseResult = schema.safeParse(input)
      
      if (!parseResult.success) {
        return {
          success: false,
          errors: parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          riskLevel: 'low',
          threats: []
        }
      }

      // Second pass: security validation
      const securityResult = await this.performSecurityValidation(parseResult.data, options)
      
      if (!securityResult.success) {
        // Log security threats
        await createSecurityAuditLog({
          eventType: SecurityEventType.MALICIOUS_REQUEST,
          details: {
            threats: securityResult.threats,
            riskLevel: securityResult.riskLevel,
            inputType: typeof input,
            blocked: true
          }
        })

        return securityResult
      }

      // Third pass: sanitization
      const sanitized = await this.sanitizeInput(parseResult.data, options)

      return {
        success: true,
        data: parseResult.data,
        sanitized,
        riskLevel: 'low',
        threats: []
      }

    } catch (error) {
      console.error('Input validation error:', error)
      return {
        success: false,
        errors: ['Validation system error'],
        riskLevel: 'high',
        threats: ['system_error']
      }
    }
  }

  /**
   * Perform security validation on input
   */
  private async performSecurityValidation(
    data: any,
    options: SanitizationOptions
  ): Promise<ValidationResult> {
    const threats: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Recursively check all string values
    const checkValue = (value: any, path: string = ''): void => {
      if (typeof value === 'string') {
        const valueThreats = this.detectThreats(value)
        threats.push(...valueThreats.map(threat => `${path}: ${threat}`))
        
        // Update risk level
        if (valueThreats.length > 0) {
          if (valueThreats.some(t => ['xss', 'sql_injection', 'command_injection'].includes(t))) {
            riskLevel = 'critical'
          } else if (valueThreats.some(t => ['path_traversal', 'ldap_injection'].includes(t))) {
            riskLevel = 'high'
          } else if (riskLevel === 'low') {
            riskLevel = 'medium'
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => checkValue(item, `${path}[${index}]`))
      } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(([key, val]) => 
          checkValue(val, path ? `${path}.${key}` : key)
        )
      }
    }

    checkValue(data)

    // Check if threats should block the request
    const blockingThreats = threats.filter(threat => 
      threat.includes('xss') || 
      threat.includes('sql_injection') || 
      threat.includes('command_injection')
    )

    if (blockingThreats.length > 0 || riskLevel === 'critical') {
      return {
        success: false,
        errors: ['Malicious input detected'],
        threats,
        riskLevel
      }
    }

    return {
      success: true,
      threats,
      riskLevel
    }
  }

  /**
   * Detect security threats in string value
   */
  private detectThreats(value: string): string[] {
    const threats: string[] = []

    // Check XSS patterns
    if (this.ATTACK_PATTERNS.xss.some(pattern => pattern.test(value))) {
      threats.push('xss')
    }

    // Check SQL injection patterns
    if (this.ATTACK_PATTERNS.sqlInjection.some(pattern => pattern.test(value))) {
      threats.push('sql_injection')
    }

    // Check command injection patterns
    if (this.ATTACK_PATTERNS.commandInjection.some(pattern => pattern.test(value))) {
      threats.push('command_injection')
    }

    // Check path traversal patterns
    if (this.ATTACK_PATTERNS.pathTraversal.some(pattern => pattern.test(value))) {
      threats.push('path_traversal')
    }

    // Check LDAP injection patterns
    if (this.ATTACK_PATTERNS.ldapInjection.some(pattern => pattern.test(value))) {
      threats.push('ldap_injection')
    }

    // Check email injection patterns
    if (this.ATTACK_PATTERNS.emailInjection.some(pattern => pattern.test(value))) {
      threats.push('email_injection')
    }

    // Check malicious patterns
    if (this.ATTACK_PATTERNS.malicious.some(pattern => pattern.test(value))) {
      threats.push('malicious_code')
    }

    // Check for suspicious Unicode characters
    if (this.hasSuspiciousUnicode(value)) {
      threats.push('suspicious_unicode')
    }

    // Check for excessive length
    if (value.length > 100000) {
      threats.push('excessive_length')
    }

    return threats
  }

  /**
   * Sanitize input data
   */
  private async sanitizeInput(data: any, options: SanitizationOptions): Promise<any> {
    const {
      allowHtml = false,
      maxLength,
      trimWhitespace = true,
      normalizeUnicode = true,
      removeSuspiciousPatterns = true
    } = options

    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        let sanitized = value

        // Trim whitespace
        if (trimWhitespace) {
          sanitized = sanitized.trim()
        }

        // Normalize Unicode
        if (normalizeUnicode) {
          sanitized = sanitized.normalize('NFC')
        }

        // Remove suspicious patterns
        if (removeSuspiciousPatterns) {
          sanitized = this.removeSuspiciousPatterns(sanitized)
        }

        // Handle HTML
        if (!allowHtml) {
          sanitized = this.escapeHtml(sanitized)
        } else {
          sanitized = this.sanitizeHtml(sanitized)
        }

        // Apply length limit
        if (maxLength && sanitized.length > maxLength) {
          sanitized = sanitized.substring(0, maxLength)
        }

        return sanitized
      } else if (Array.isArray(value)) {
        return value.map(sanitizeValue)
      } else if (value && typeof value === 'object') {
        const sanitizedObj: any = {}
        for (const [key, val] of Object.entries(value)) {
          sanitizedObj[key] = sanitizeValue(val)
        }
        return sanitizedObj
      }

      return value
    }

    return sanitizeValue(data)
  }

  /**
   * Remove suspicious patterns from string
   */
  private removeSuspiciousPatterns(input: string): string {
    let cleaned = input

    // Remove null bytes
    cleaned = cleaned.replace(/\x00/g, '')

    // Remove control characters (except common ones)
    cleaned = cleaned.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Remove suspicious Unicode ranges
    cleaned = cleaned.replace(/[\uFEFF\uFFF0-\uFFFF]/g, '')

    // Remove zero-width characters that could be used for bypasses
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '')

    return cleaned
  }

  /**
   * Escape HTML entities
   */
  private escapeHtml(input: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }

    return input.replace(/[&<>"'`=/]/g, char => entityMap[char])
  }

  /**
   * Sanitize HTML (if HTML is allowed)
   */
  private sanitizeHtml(input: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    let sanitized = input

    // Remove script tags and content
    sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')

    // Remove dangerous attributes
    sanitized = sanitized.replace(/\s(on\w+|javascript:|vbscript:|data:)\s*=\s*["'][^"']*["']/gi, '')

    // Remove dangerous tags
    const dangerousTags = ['script', 'object', 'embed', 'iframe', 'frame', 'frameset', 'meta', 'link', 'style']
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis')
      sanitized = sanitized.replace(regex, '')
      
      // Self-closing tags
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi')
      sanitized = sanitized.replace(selfClosingRegex, '')
    }

    return sanitized
  }

  /**
   * Check for suspicious Unicode characters
   */
  private hasSuspiciousUnicode(input: string): boolean {
    // Check for right-to-left override characters
    if (/[\u202E\u202D]/g.test(input)) return true

    // Check for zero-width joiners used for bypasses
    if (/[\u200C\u200D]/g.test(input)) return true

    // Check for homograph attacks
    if (/[\u0430-\u044F\u0410-\u042F]/g.test(input) && /[a-zA-Z]/g.test(input)) {
      return true // Mixed Cyrillic and Latin
    }

    return false
  }

  /**
   * Validate specific data types with enhanced security
   */
  
  /**
   * Validate email with additional security checks
   */
  validateEmail(email: string): ValidationResult<string> {
    const emailSchema = z.string().email()
    const parseResult = emailSchema.safeParse(email)

    if (!parseResult.success) {
      return {
        success: false,
        errors: ['Invalid email format'],
        riskLevel: 'low'
      }
    }

    // Additional security checks
    const threats: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Check for header injection
    if (this.ATTACK_PATTERNS.emailInjection.some(pattern => pattern.test(email))) {
      threats.push('email_injection')
      riskLevel = 'high'
    }

    // Check for suspicious domains
    const domain = email.split('@')[1]?.toLowerCase()
    const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com']
    if (suspiciousDomains.some(d => domain?.includes(d))) {
      threats.push('suspicious_domain')
      riskLevel = 'medium'
    }

    return {
      success: threats.length === 0,
      data: parseResult.data,
      sanitized: parseResult.data.toLowerCase().trim(),
      threats,
      riskLevel
    }
  }

  /**
   * Validate URL with security checks
   */
  validateUrl(url: string): ValidationResult<string> {
    const urlSchema = z.string().url()
    const parseResult = urlSchema.safeParse(url)

    if (!parseResult.success) {
      return {
        success: false,
        errors: ['Invalid URL format'],
        riskLevel: 'low'
      }
    }

    const threats: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    try {
      const urlObj = new URL(url)

      // Check for dangerous protocols
      const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:', 'ftp:']
      if (dangerousProtocols.some(proto => urlObj.protocol === proto)) {
        threats.push('dangerous_protocol')
        riskLevel = 'critical'
      }

      // Check for local/private IPs
      const hostname = urlObj.hostname
      if (this.isPrivateIP(hostname)) {
        threats.push('private_ip')
        riskLevel = 'high'
      }

      // Check for suspicious domains
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf']
      if (suspiciousTlds.some(tld => hostname.endsWith(tld))) {
        threats.push('suspicious_tld')
        riskLevel = 'medium'
      }

    } catch (error) {
      return {
        success: false,
        errors: ['Invalid URL'],
        riskLevel: 'low'
      }
    }

    return {
      success: riskLevel !== 'critical',
      data: parseResult.data,
      sanitized: parseResult.data,
      threats,
      riskLevel
    }
  }

  /**
   * Check if hostname is a private/local IP
   */
  private isPrivateIP(hostname: string): boolean {
    // IPv4 private ranges
    const ipv4Patterns = [
      /^127\./,           // Loopback
      /^10\./,            // Private Class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private Class B
      /^192\.168\./,      // Private Class C
      /^169\.254\./,      // Link-local
      /^0\./,             // This network
    ]

    // IPv6 private patterns
    const ipv6Patterns = [
      /^::1$/,            // Loopback
      /^fe80:/,           // Link-local
      /^fc00:/,           // Unique local
      /^fd00:/,           // Unique local
      /^::$/,             // Unspecified
    ]

    return ipv4Patterns.some(pattern => pattern.test(hostname)) ||
           ipv6Patterns.some(pattern => pattern.test(hostname))
  }
}

// Singleton instance
export const inputValidator = new SecurityInputValidator()

/**
 * Convenience function for input validation
 */
export async function validateInput<T>(
  input: unknown,
  schema: z.ZodSchema<T>,
  options?: SanitizationOptions
): Promise<ValidationResult<T>> {
  return inputValidator.validateInput(input, schema, options)
}

/**
 * Convenience function for email validation
 */
export function validateEmail(email: string): ValidationResult<string> {
  return inputValidator.validateEmail(email)
}

/**
 * Convenience function for URL validation
 */
export function validateUrl(url: string): ValidationResult<string> {
  return inputValidator.validateUrl(url)
}

/**
 * Common validation schemas with security enhancements
 */
export const SecureSchemas = {
  // Safe string with XSS protection
  safeString: (maxLength: number = 255) => z.string()
    .max(maxLength)
    .refine(val => !/<script|javascript:|vbscript:|onload=/i.test(val), {
      message: 'String contains potentially malicious content'
    }),

  // SQL-safe string
  sqlSafeString: (maxLength: number = 255) => z.string()
    .max(maxLength)
    .refine(val => !/(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b|--|#|\/\*)/i.test(val), {
      message: 'String contains potentially malicious SQL content'
    }),

  // File path validation
  safePath: z.string()
    .refine(val => !/\.\.\/|\.\.\\|\0/.test(val), {
      message: 'Path contains directory traversal or null bytes'
    }),

  // Username validation
  username: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

  // Strong password validation
  strongPassword: z.string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  // Secure ID validation
  uuid: z.string().uuid(),
  
  // IP address validation
  ipAddress: z.string().ip(),
  
  // Phone number validation
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
}

// Export types
export type { ValidationResult, SanitizationOptions }