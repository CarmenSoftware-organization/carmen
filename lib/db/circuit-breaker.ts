/**
 * Circuit Breaker Pattern Implementation for Database Operations
 * Provides failure protection, retry logic, and automatic recovery
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, block requests
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export interface CircuitBreakerConfig {
  // Failure threshold before opening circuit
  failureThreshold: number
  // Success threshold to close circuit from half-open
  successThreshold: number
  // Time to wait before attempting recovery (ms)
  timeout: number
  // Monitor window for failure counting (ms)
  monitorWindow: number
  // Retry configuration
  retry: {
    attempts: number
    initialDelay: number
    maxDelay: number
    backoffMultiplier: number
  }
}

export interface CircuitBreakerMetrics {
  state: CircuitState
  failures: number
  successes: number
  requests: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  nextAttemptTime: number | null
}

export class DatabaseCircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private requests: number = 0
  private lastFailureTime: number | null = null
  private lastSuccessTime: number | null = null
  private nextAttemptTime: number | null = null
  private readonly config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 3,
      timeout: config.timeout ?? 60000, // 1 minute
      monitorWindow: config.monitorWindow ?? 300000, // 5 minutes
      retry: {
        attempts: config.retry?.attempts ?? 3,
        initialDelay: config.retry?.initialDelay ?? 1000,
        maxDelay: config.retry?.maxDelay ?? 30000,
        backoffMultiplier: config.retry?.backoffMultiplier ?? 2,
        ...config.retry
      }
    }
  }

  /**
   * Execute a database operation with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'database-operation'
  ): Promise<T> {
    const now = Date.now()
    
    // Clean old failure records
    this.cleanOldRecords(now)
    
    // Check if circuit should allow execution
    if (!this.canExecute(now)) {
      throw new DatabaseCircuitBreakerError(
        `Circuit breaker is ${this.state}: ${operationName} blocked`,
        this.state,
        this.getMetrics()
      )
    }

    this.requests++

    try {
      const result = await this.executeWithRetry(operation, operationName)
      this.onSuccess(now)
      return result
    } catch (error) {
      this.onFailure(now, error, operationName)
      throw error
    }
  }

  /**
   * Execute operation with exponential backoff retry
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.config.retry.attempts; attempt++) {
      try {
        return await this.executeWithTimeout(operation, operationName)
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error
        }
        
        // Don't delay on last attempt
        if (attempt < this.config.retry.attempts) {
          const delay = this.calculateBackoffDelay(attempt)
          await this.sleep(delay)
        }
      }
    }
    
    throw new DatabaseRetryError(
      `Operation ${operationName} failed after ${this.config.retry.attempts} attempts: ${lastError.message}`,
      this.config.retry.attempts,
      lastError
    )
  }

  /**
   * Execute operation with timeout protection
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    operationName: string,
    timeout: number = 30000 // 30 seconds default
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new DatabaseTimeoutError(
          `Operation ${operationName} timed out after ${timeout}ms`
        ))
      }, timeout)

      operation()
        .then(result => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * Check if circuit breaker allows execution
   */
  private canExecute(now: number): boolean {
    switch (this.state) {
      case CircuitState.CLOSED:
        return true
      
      case CircuitState.OPEN:
        if (now >= (this.nextAttemptTime ?? 0)) {
          this.state = CircuitState.HALF_OPEN
          this.successes = 0
          return true
        }
        return false
      
      case CircuitState.HALF_OPEN:
        return true
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(now: number): void {
    this.lastSuccessTime = now
    this.successes++
    
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED
        this.failures = 0
        this.nextAttemptTime = null
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      this.failures = Math.max(0, this.failures - 1)
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(now: number, error: unknown, operationName: string): void {
    this.lastFailureTime = now
    this.failures++
    
    // Log the failure
    console.error(`Database circuit breaker failure in ${operationName}:`, error)
    
    if (this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN) {
      if (this.failures >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN
        this.nextAttemptTime = now + this.config.timeout
        this.successes = 0
        
        console.warn(
          `Database circuit breaker opened after ${this.failures} failures. ` +
          `Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`
        )
      }
    }
  }

  /**
   * Clean failure records outside the monitor window
   */
  private cleanOldRecords(now: number): void {
    const cutoff = now - this.config.monitorWindow
    
    if (this.lastFailureTime && this.lastFailureTime < cutoff) {
      this.failures = Math.max(0, this.failures - 1)
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay = this.config.retry.initialDelay * 
      Math.pow(this.config.retry.backoffMultiplier, attempt - 1)
    
    return Math.min(delay, this.config.retry.maxDelay)
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      // Don't retry on syntax errors, auth errors, etc.
      return message.includes('syntax error') ||
        message.includes('authentication') ||
        message.includes('permission denied') ||
        message.includes('invalid') ||
        message.includes('malformed')
    }
    
    return false
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      requests: this.requests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime
    }
  }

  /**
   * Force circuit state change (for testing/manual intervention)
   */
  forceState(state: CircuitState): void {
    this.state = state
    if (state === CircuitState.CLOSED) {
      this.failures = 0
      this.nextAttemptTime = null
    }
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.requests = 0
    this.lastFailureTime = null
    this.lastSuccessTime = null
    this.nextAttemptTime = null
  }
}

/**
 * Custom error classes for circuit breaker
 */
export class DatabaseCircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly state: CircuitState,
    public readonly metrics: CircuitBreakerMetrics
  ) {
    super(message)
    this.name = 'DatabaseCircuitBreakerError'
  }
}

export class DatabaseRetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message)
    this.name = 'DatabaseRetryError'
  }
}

export class DatabaseTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseTimeoutError'
  }
}

// Global circuit breaker instance
export const databaseCircuitBreaker = new DatabaseCircuitBreaker()