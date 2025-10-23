'use client'

import { errorManager, ErrorType, ErrorSeverity, createError } from '@/lib/error/error-manager'
import { enhancedToast } from '@/components/ui/enhanced-toast'

// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: Response,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Network status tracking
class NetworkStatusManager {
  private isOnline = navigator.onLine
  private listeners: Array<(isOnline: boolean) => void> = []

  constructor() {
    this.setupNetworkListeners()
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners()
      enhancedToast.success('Connection restored', {
        title: 'Back Online',
        duration: 3000
      })
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners()
      enhancedToast.warning('You are currently offline. Some features may not be available.', {
        title: 'Connection Lost',
        persistent: true
      })
    })
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline))
  }

  public addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink,
      rtt: (navigator as any).connection?.rtt
    }
  }
}

// Request configuration
export interface ApiRequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: ApiError, attempt: number) => boolean
  showErrorToast?: boolean
  showLoadingToast?: boolean
  loadingMessage?: string
  suppressGlobalErrorHandling?: boolean
  requireAuth?: boolean
}

// Response interceptor
export interface ResponseInterceptor {
  onSuccess?: (response: Response) => Response | Promise<Response>
  onError?: (error: ApiError) => ApiError | Promise<ApiError>
}

// Enhanced API Client
class EnhancedApiClient {
  private baseURL: string
  private defaultConfig: ApiRequestConfig
  private interceptors: ResponseInterceptor[] = []
  private networkManager = new NetworkStatusManager()
  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private activeRequests = new Map<string, Promise<any>>()

  constructor(baseURL = '', defaultConfig: ApiRequestConfig = {}) {
    this.baseURL = baseURL
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      showErrorToast: true,
      showLoadingToast: false,
      requireAuth: true,
      ...defaultConfig
    }
  }

  // Add response interceptor
  addInterceptor(interceptor: ResponseInterceptor) {
    this.interceptors.push(interceptor)
    return () => {
      const index = this.interceptors.indexOf(interceptor)
      if (index > -1) {
        this.interceptors.splice(index, 1)
      }
    }
  }

  // Main request method with comprehensive error handling
  async request<T = any>(
    url: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const fullUrl = this.buildUrl(url)
    const requestKey = this.getRequestKey(fullUrl, finalConfig)

    // Check if request is already in flight (deduplication)
    if (this.activeRequests.has(requestKey)) {
      return this.activeRequests.get(requestKey)!
    }

    // Check cache first (for GET requests)
    if (finalConfig.method === 'GET' || !finalConfig.method) {
      const cached = this.getFromCache(requestKey)
      if (cached) {
        return cached
      }
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(fullUrl, finalConfig)
    
    // Store active request for deduplication
    this.activeRequests.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      
      // Cache successful GET requests
      if ((finalConfig.method === 'GET' || !finalConfig.method) && finalConfig.cache !== 'no-store') {
        this.setCache(requestKey, result, 5 * 60 * 1000) // 5 minutes default TTL
      }

      return result
    } finally {
      // Clean up active request
      this.activeRequests.delete(requestKey)
    }
  }

  private async executeRequest<T>(url: string, config: ApiRequestConfig): Promise<T> {
    let loadingToastId: string | undefined

    try {
      // Show loading toast if requested
      if (config.showLoadingToast) {
        loadingToastId = enhancedToast.loading(
          config.loadingMessage || 'Processing request...',
          { showProgress: true }
        )
      }

      // Check network status
      if (!this.networkManager.getNetworkStatus().isOnline) {
        throw createError({
          message: 'No internet connection available',
          type: ErrorType.NETWORK,
          severity: ErrorSeverity.HIGH,
          retryable: true
        })
      }

      // Execute request with retries
      const response = await this.executeWithRetries(url, config)
      const data = await this.parseResponse<T>(response)

      // Dismiss loading toast and show success
      if (loadingToastId) {
        enhancedToast.dismiss(loadingToastId)
        enhancedToast.success('Request completed successfully', {
          duration: 2000
        })
      }

      return data
    } catch (error) {
      // Update loading toast to error
      if (loadingToastId) {
        enhancedToast.dismiss(loadingToastId)
      }

      // Handle and propagate error
      const apiError = this.handleError(error, config)
      
      if (!config.suppressGlobalErrorHandling) {
        this.processError(apiError, config)
      }

      throw apiError
    }
  }

  private async executeWithRetries(
    url: string, 
    config: ApiRequestConfig,
    attempt = 1
  ): Promise<Response> {
    try {
      const controller = new AbortController()
      const timeoutId = config.timeout 
        ? setTimeout(() => controller.abort(), config.timeout)
        : null

      const requestConfig: RequestInit = {
        ...config,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...await this.getAuthHeaders(config.requireAuth),
          ...config.headers
        }
      }

      const response = await fetch(url, requestConfig)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Apply response interceptors
      let processedResponse = response
      for (const interceptor of this.interceptors) {
        if (interceptor.onSuccess) {
          processedResponse = await interceptor.onSuccess(processedResponse)
        }
      }

      if (!response.ok) {
        const errorData = await this.extractErrorData(response)
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response,
          errorData
        )
      }

      return processedResponse
    } catch (error) {
      const apiError = error instanceof ApiError 
        ? error 
        : this.convertToApiError(error)

      // Apply error interceptors
      let processedError = apiError
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          processedError = await interceptor.onError(processedError)
        }
      }

      // Check retry conditions
      if (this.shouldRetry(processedError, attempt, config)) {
        const delay = this.calculateRetryDelay(attempt, config.retryDelay || 1000)
        await this.delay(delay)
        return this.executeWithRetries(url, config, attempt + 1)
      }

      throw processedError
    }
  }

  private shouldRetry(error: ApiError, attempt: number, config: ApiRequestConfig): boolean {
    const maxRetries = config.retries || 3
    
    if (attempt >= maxRetries) {
      return false
    }

    // Custom retry condition
    if (config.retryCondition) {
      return config.retryCondition(error, attempt)
    }

    // Default retry conditions
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    const isNetworkError = error.message.toLowerCase().includes('network') || 
                          error.message.toLowerCase().includes('fetch')
    
    return retryableStatuses.includes(error.statusCode) || 
           isNetworkError ||
           error.name === 'AbortError'
  }

  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 0.1 * exponentialDelay
    return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    if (contentType?.includes('text/')) {
      return response.text() as T
    }
    
    return response.blob() as T
  }

  private async extractErrorData(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }
      return { message: await response.text() }
    } catch {
      return { message: response.statusText }
    }
  }

  private convertToApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new ApiError('Request timeout', 408)
      }
      
      if (error.message.toLowerCase().includes('network')) {
        return new ApiError('Network error', 0)
      }

      return new ApiError(error.message, 500)
    }

    return new ApiError('Unknown error occurred', 500)
  }

  private handleError(error: unknown, config: ApiRequestConfig): ApiError {
    const apiError = this.convertToApiError(error)
    
    // Create app error for tracking
    const appError = createError({
      message: apiError.message,
      type: this.classifyErrorType(apiError),
      severity: this.classifyErrorSeverity(apiError),
      statusCode: apiError.statusCode,
      details: {
        url: window.location.href,
        method: config.method || 'GET',
        data: apiError.data
      },
      retryable: this.shouldRetry(apiError, 1, config)
    })

    // Add app error properties to API error
    ;(apiError as any).appError = appError

    return apiError
  }

  private classifyErrorType(error: ApiError): ErrorType {
    if (error.statusCode === 401) return ErrorType.AUTHENTICATION
    if (error.statusCode === 403) return ErrorType.AUTHORIZATION
    if (error.statusCode >= 400 && error.statusCode < 500) return ErrorType.VALIDATION
    if (error.statusCode >= 500) return ErrorType.SERVER
    if (error.statusCode === 0) return ErrorType.NETWORK
    return ErrorType.CLIENT
  }

  private classifyErrorSeverity(error: ApiError): ErrorSeverity {
    if (error.statusCode === 401 || error.statusCode === 403) return ErrorSeverity.HIGH
    if (error.statusCode >= 500) return ErrorSeverity.HIGH
    if (error.statusCode === 0) return ErrorSeverity.MEDIUM
    return ErrorSeverity.LOW
  }

  private processError(error: ApiError, config: ApiRequestConfig): void {
    const appError = (error as any).appError

    if (config.showErrorToast) {
      const shouldShowRetry = this.shouldRetry(error, 1, config)
      
      enhancedToast.error(error.message, {
        title: this.getErrorTitle(error),
        duration: 6000,
        actions: shouldShowRetry ? [{
          label: 'Retry',
          onClick: () => {
            // Re-trigger the request (this would need to be implemented based on your needs)
            console.log('Retry requested for failed API call')
          }
        }] : undefined
      })
    }

    // Report error to error manager
    if (appError) {
      errorManager.handleError(appError, {
        showToast: false // Already shown above if needed
      })
    }
  }

  private getErrorTitle(error: ApiError): string {
    if (error.statusCode === 401) return 'Authentication Error'
    if (error.statusCode === 403) return 'Permission Denied'
    if (error.statusCode === 404) return 'Not Found'
    if (error.statusCode >= 500) return 'Server Error'
    if (error.statusCode === 0) return 'Connection Error'
    return 'Request Failed'
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }
    return `${this.baseURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  private getRequestKey(url: string, config: ApiRequestConfig): string {
    return `${config.method || 'GET'}:${url}:${JSON.stringify(config.body || '')}`
  }

  private async getAuthHeaders(requireAuth = true): Promise<Record<string, string>> {
    if (!requireAuth) return {}

    // TODO: Implement your authentication logic here
    // This is a placeholder - replace with your actual auth implementation
    const token = localStorage.getItem('authToken') // or wherever you store tokens
    
    if (token) {
      return { 'Authorization': `Bearer ${token}` }
    }
    
    if (requireAuth) {
      throw createError({
        message: 'Authentication required',
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH
      })
    }

    return {}
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.requestCache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Convenience methods
  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  // Upload with progress
  async upload<T = any>(
    url: string,
    file: File | FormData,
    config?: ApiRequestConfig & {
      onProgress?: (progress: number) => void
    }
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // Set up progress tracking
      if (config?.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            config.onProgress!(progress)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            resolve(xhr.responseText as T)
          }
        } else {
          reject(new ApiError(`Upload failed: ${xhr.statusText}`, xhr.status))
        }
      }

      xhr.onerror = () => {
        reject(new ApiError('Upload failed: Network error', 0))
      }

      xhr.ontimeout = () => {
        reject(new ApiError('Upload failed: Timeout', 408))
      }

      const fullUrl = this.buildUrl(url)
      xhr.open('POST', fullUrl)
      
      // Set timeout if provided
      if (config?.timeout) {
        xhr.timeout = config.timeout
      }

      // Set headers (auth headers will be added automatically)
      const headers: Record<string, string> = { ...config?.headers as Record<string, string> }
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key])
      })

      // Send the file
      const formData = file instanceof FormData ? file : (() => {
        const fd = new FormData()
        fd.append('file', file)
        return fd
      })()

      xhr.send(formData)
    })
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', {
        timeout: 5000,
        retries: 1,
        showErrorToast: false,
        requireAuth: false
      })
      return true
    } catch {
      return false
    }
  }

  // Clear cache
  clearCache(): void {
    this.requestCache.clear()
  }
}

// Export singleton instance
export const apiClient = new EnhancedApiClient(process.env.NEXT_PUBLIC_API_URL || '')

// Export convenience functions
export const api = {
  get: <T = any>(url: string, config?: ApiRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: ApiRequestConfig) => apiClient.delete<T>(url, config),
  upload: <T = any>(url: string, file: File | FormData, config?: ApiRequestConfig & { onProgress?: (progress: number) => void }) => 
    apiClient.upload<T>(url, file, config)
}

export default apiClient