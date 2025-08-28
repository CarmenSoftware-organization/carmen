/**
 * ABAC Policy Decision Point (PDP) Engine
 * Evaluates policies to determine if access should be granted or denied
 */

import { Policy, PolicyRule, PolicyEffect, Subject, Resource, Action, Environment, PolicyDecision, PolicyEvaluationResult } from '@/lib/types/permissions'

export interface PolicyEngineConfig {
  combiningAlgorithm: 'deny-overrides' | 'permit-overrides' | 'first-applicable' | 'priority-based'
  enableAuditLog: boolean
  defaultDecision: 'permit' | 'deny'
}

export class PolicyEngine {
  private config: PolicyEngineConfig
  private auditLog: PolicyEvaluationResult[] = []

  constructor(config: Partial<PolicyEngineConfig> = {}) {
    this.config = {
      combiningAlgorithm: 'deny-overrides',
      enableAuditLog: true,
      defaultDecision: 'deny',
      ...config
    }
  }

  /**
   * Main policy evaluation method
   */
  async evaluateAccess(
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment,
    policies: Policy[]
  ): Promise<PolicyDecision> {
    const startTime = Date.now()
    
    // Filter applicable policies
    const applicablePolicies = this.findApplicablePolicies(
      subject, resource, action, environment, policies
    )

    if (applicablePolicies.length === 0) {
      const decision: PolicyDecision = {
        decision: this.config.defaultDecision,
        reason: 'No applicable policies found',
        evaluatedPolicies: [],
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      }
      
      this.logEvaluation(subject, resource, action, environment, decision)
      return decision
    }

    // Evaluate each applicable policy
    const evaluationResults: PolicyEvaluationResult[] = []
    
    for (const policy of applicablePolicies) {
      const result = await this.evaluatePolicy(
        policy, subject, resource, action, environment
      )
      evaluationResults.push(result)
    }

    // Apply combining algorithm
    const decision = this.combineResults(evaluationResults)
    decision.executionTime = Date.now() - startTime
    decision.timestamp = new Date()
    
    this.logEvaluation(subject, resource, action, environment, decision)
    return decision
  }

  /**
   * Find policies that match the request context
   */
  private findApplicablePolicies(
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment,
    policies: Policy[]
  ): Policy[] {
    return policies.filter(policy => 
      policy.isActive && 
      this.isPolicyApplicable(policy, subject, resource, action, environment)
    ).sort((a, b) => (b.priority || 500) - (a.priority || 500))
  }

  /**
   * Check if a policy is applicable to the current request
   */
  private isPolicyApplicable(
    policy: Policy,
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment
  ): boolean {
    // Check if policy applies to this subject
    if (!this.matchesSubjectConditions(policy.subjectConditions, subject)) {
      return false
    }

    // Check if policy applies to this resource
    if (!this.matchesResourceConditions(policy.resourceConditions, resource)) {
      return false
    }

    // Check if policy applies to this action
    if (!this.matchesActionConditions(policy.actionConditions, action)) {
      return false
    }

    // Check environmental conditions
    if (!this.matchesEnvironmentConditions(policy.environmentConditions, environment)) {
      return false
    }

    // Check validity period
    const now = new Date()
    if (policy.validFrom && now < policy.validFrom) return false
    if (policy.validUntil && now > policy.validUntil) return false

    return true
  }

  /**
   * Evaluate a single policy against the request
   */
  private async evaluatePolicy(
    policy: Policy,
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment
  ): Promise<PolicyEvaluationResult> {
    const startTime = Date.now()
    
    try {
      // Evaluate all rules in the policy
      const ruleResults = []
      
      for (const rule of policy.rules) {
        const ruleResult = await this.evaluateRule(
          rule, subject, resource, action, environment
        )
        ruleResults.push(ruleResult)
        
        // Early termination for deny rules if deny-overrides
        if (this.config.combiningAlgorithm === 'deny-overrides' && 
            ruleResult.effect === 'deny' && ruleResult.matches) {
          break
        }
      }

      // Combine rule results based on policy's rule combining algorithm
      const effect = this.combineRuleResults(policy, ruleResults)
      const matches = ruleResults.some(r => r.matches)

      return {
        policyId: policy.id,
        effect,
        matches,
        reason: this.generatePolicyReason(policy, ruleResults),
        ruleResults,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        policyId: policy.id,
        effect: 'deny',
        matches: false,
        reason: `Policy evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ruleResults: [],
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    rule: PolicyRule,
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment
  ): Promise<{ effect: PolicyEffect; matches: boolean; reason: string }> {
    try {
      // Evaluate rule condition
      const matches = await this.evaluateRuleCondition(
        rule.condition, subject, resource, action, environment
      )

      return {
        effect: rule.effect,
        matches,
        reason: matches ? `Rule '${rule.name}' matched` : `Rule '${rule.name}' did not match`
      }
    } catch (error) {
      return {
        effect: 'deny',
        matches: false,
        reason: `Rule evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Evaluate rule condition using expression engine
   */
  private async evaluateRuleCondition(
    condition: string,
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment
  ): Promise<boolean> {
    // Create evaluation context
    const context = {
      subject,
      resource,
      action,
      environment,
      // Helper functions
      hasRole: (role: string) => subject.roles?.includes(role) || false,
      hasPermission: (permission: string) => subject.permissions?.includes(permission) || false,
      inDepartment: (dept: string) => subject.department === dept,
      atLocation: (location: string) => subject.location === location,
      resourceType: (type: string) => resource.type === type,
      resourceCategory: (category: string) => resource.category === category,
      actionType: (type: string) => action.type === type,
      timeOfDay: () => environment.timeOfDay || new Date().getHours(),
      dayOfWeek: () => environment.dayOfWeek || new Date().getDay(),
      isWorkingHours: () => {
        const hour = new Date().getHours()
        return hour >= 9 && hour <= 17
      }
    }

    // Simple expression evaluator (in production, use a proper expression engine)
    return this.evaluateExpression(condition, context)
  }

  /**
   * Simple expression evaluator
   */
  private evaluateExpression(expression: string, context: any): boolean {
    try {
      // Replace context variables in expression
      let evalExpression = expression
      
      // Replace common patterns
      evalExpression = evalExpression.replace(/subject\.(\w+)/g, (_, prop) => {
        return JSON.stringify(context.subject[prop])
      })
      
      evalExpression = evalExpression.replace(/resource\.(\w+)/g, (_, prop) => {
        return JSON.stringify(context.resource[prop])
      })
      
      evalExpression = evalExpression.replace(/action\.(\w+)/g, (_, prop) => {
        return JSON.stringify(context.action[prop])
      })
      
      evalExpression = evalExpression.replace(/environment\.(\w+)/g, (_, prop) => {
        return JSON.stringify(context.environment[prop])
      })

      // Replace function calls
      evalExpression = evalExpression.replace(/hasRole\('([^']+)'\)/g, (_, role) => {
        return context.hasRole(role).toString()
      })
      
      evalExpression = evalExpression.replace(/hasPermission\('([^']+)'\)/g, (_, permission) => {
        return context.hasPermission(permission).toString()
      })
      
      evalExpression = evalExpression.replace(/inDepartment\('([^']+)'\)/g, (_, dept) => {
        return context.inDepartment(dept).toString()
      })

      evalExpression = evalExpression.replace(/resourceType\('([^']+)'\)/g, (_, type) => {
        return context.resourceType(type).toString()
      })

      evalExpression = evalExpression.replace(/actionType\('([^']+)'\)/g, (_, type) => {
        return context.actionType(type).toString()
      })

      evalExpression = evalExpression.replace(/isWorkingHours\(\)/g, () => {
        return context.isWorkingHours().toString()
      })

      // Simple evaluation (in production, use a secure expression evaluator)
      return new Function('return ' + evalExpression)()
    } catch (error) {
      console.error('Expression evaluation error:', error)
      return false
    }
  }

  /**
   * Match subject conditions
   */
  private matchesSubjectConditions(conditions: any, subject: Subject): boolean {
    if (!conditions) return true
    
    // Check roles
    if (conditions.roles && conditions.roles.length > 0) {
      const hasRequiredRole = conditions.roles.some((role: string) => 
        subject.roles?.includes(role)
      )
      if (!hasRequiredRole) return false
    }

    // Check department
    if (conditions.departments && conditions.departments.length > 0) {
      if (!conditions.departments.includes(subject.department)) return false
    }

    // Check location
    if (conditions.locations && conditions.locations.length > 0) {
      if (!conditions.locations.includes(subject.location)) return false
    }

    // Check permissions
    if (conditions.permissions && conditions.permissions.length > 0) {
      const hasRequiredPermission = conditions.permissions.some((permission: string) => 
        subject.permissions?.includes(permission)
      )
      if (!hasRequiredPermission) return false
    }

    return true
  }

  /**
   * Match resource conditions
   */
  private matchesResourceConditions(conditions: any, resource: Resource): boolean {
    if (!conditions) return true
    
    // Check resource type
    if (conditions.types && conditions.types.length > 0) {
      if (!conditions.types.includes(resource.type)) return false
    }

    // Check resource category
    if (conditions.categories && conditions.categories.length > 0) {
      if (!conditions.categories.includes(resource.category)) return false
    }

    // Check specific resource IDs
    if (conditions.resourceIds && conditions.resourceIds.length > 0) {
      if (!conditions.resourceIds.includes(resource.id)) return false
    }

    return true
  }

  /**
   * Match action conditions
   */
  private matchesActionConditions(conditions: any, action: Action): boolean {
    if (!conditions) return true
    
    // Check action types
    if (conditions.types && conditions.types.length > 0) {
      if (!conditions.types.includes(action.type)) return false
    }

    // Check specific actions
    if (conditions.actions && conditions.actions.length > 0) {
      if (!conditions.actions.includes(action.name)) return false
    }

    return true
  }

  /**
   * Match environment conditions
   */
  private matchesEnvironmentConditions(conditions: any, environment: Environment): boolean {
    if (!conditions) return true
    
    // Check time constraints
    if (conditions.timeOfDay) {
      const currentHour = environment.timeOfDay || new Date().getHours()
      if (currentHour < conditions.timeOfDay.start || currentHour > conditions.timeOfDay.end) {
        return false
      }
    }

    // Check day of week
    if (conditions.daysOfWeek && conditions.daysOfWeek.length > 0) {
      const currentDay = environment.dayOfWeek || new Date().getDay()
      if (!conditions.daysOfWeek.includes(currentDay)) return false
    }

    // Check IP address ranges
    if (conditions.ipRanges && conditions.ipRanges.length > 0 && environment.ipAddress) {
      // Simple IP check (in production, use proper CIDR matching)
      const matches = conditions.ipRanges.some((range: string) => 
        environment.ipAddress?.startsWith(range.split('/')[0].slice(0, -1))
      )
      if (!matches) return false
    }

    return true
  }

  /**
   * Combine rule results within a policy
   */
  private combineRuleResults(policy: Policy, ruleResults: any[]): PolicyEffect {
    const combiningAlgorithm = policy.ruleCombiningAlgorithm || 'deny-overrides'
    
    switch (combiningAlgorithm) {
      case 'deny-overrides':
        // If any rule denies, the result is deny
        if (ruleResults.some(r => r.effect === 'deny' && r.matches)) {
          return 'deny'
        }
        // If any rule permits, the result is permit
        if (ruleResults.some(r => r.effect === 'permit' && r.matches)) {
          return 'permit'
        }
        return 'deny'

      case 'permit-overrides':
        // If any rule permits, the result is permit
        if (ruleResults.some(r => r.effect === 'permit' && r.matches)) {
          return 'permit'
        }
        // If any rule denies, the result is deny
        if (ruleResults.some(r => r.effect === 'deny' && r.matches)) {
          return 'deny'
        }
        return 'deny'

      case 'first-applicable':
        // Return the effect of the first matching rule
        const firstMatch = ruleResults.find(r => r.matches)
        return firstMatch?.effect || 'deny'

      default:
        return 'deny'
    }
  }

  /**
   * Combine policy evaluation results
   */
  private combineResults(results: PolicyEvaluationResult[]): PolicyDecision {
    const matchingResults = results.filter(r => r.matches)
    
    if (matchingResults.length === 0) {
      return {
        decision: this.config.defaultDecision,
        reason: 'No matching policies found',
        evaluatedPolicies: results
      }
    }

    switch (this.config.combiningAlgorithm) {
      case 'deny-overrides':
        // If any policy denies, deny access
        const denyResult = matchingResults.find(r => r.effect === 'deny')
        if (denyResult) {
          return {
            decision: 'deny',
            reason: `Access denied by policy ${denyResult.policyId}: ${denyResult.reason}`,
            evaluatedPolicies: results
          }
        }
        
        // If any policy permits, permit access
        const permitResult = matchingResults.find(r => r.effect === 'permit')
        if (permitResult) {
          return {
            decision: 'permit',
            reason: `Access permitted by policy ${permitResult.policyId}: ${permitResult.reason}`,
            evaluatedPolicies: results
          }
        }
        break

      case 'permit-overrides':
        // If any policy permits, permit access
        const permitResult2 = matchingResults.find(r => r.effect === 'permit')
        if (permitResult2) {
          return {
            decision: 'permit',
            reason: `Access permitted by policy ${permitResult2.policyId}: ${permitResult2.reason}`,
            evaluatedPolicies: results
          }
        }
        
        // If any policy denies, deny access
        const denyResult2 = matchingResults.find(r => r.effect === 'deny')
        if (denyResult2) {
          return {
            decision: 'deny',
            reason: `Access denied by policy ${denyResult2.policyId}: ${denyResult2.reason}`,
            evaluatedPolicies: results
          }
        }
        break

      case 'first-applicable':
        // Return the decision of the first matching policy
        const firstMatch = matchingResults[0]
        return {
          decision: firstMatch.effect,
          reason: `Decision from first applicable policy ${firstMatch.policyId}: ${firstMatch.reason}`,
          evaluatedPolicies: results
        }

      case 'priority-based':
        // Sort by priority and return highest priority decision
        const sortedResults = matchingResults.sort((a, b) => {
          const aPriority = results.find(r => r.policyId === a.policyId)?.policyId || 0
          const bPriority = results.find(r => r.policyId === b.policyId)?.policyId || 0
          return bPriority - aPriority
        })
        
        const highestPriority = sortedResults[0]
        return {
          decision: highestPriority.effect,
          reason: `Decision from highest priority policy ${highestPriority.policyId}: ${highestPriority.reason}`,
          evaluatedPolicies: results
        }
    }

    return {
      decision: this.config.defaultDecision,
      reason: 'No applicable combining algorithm result',
      evaluatedPolicies: results
    }
  }

  /**
   * Generate human-readable reason for policy evaluation
   */
  private generatePolicyReason(policy: Policy, ruleResults: any[]): string {
    const matchingRules = ruleResults.filter(r => r.matches)
    
    if (matchingRules.length === 0) {
      return `No rules in policy '${policy.name}' matched the request`
    }
    
    const reasons = matchingRules.map(r => r.reason)
    return `Policy '${policy.name}': ${reasons.join(', ')}`
  }

  /**
   * Log policy evaluation for audit purposes
   */
  private logEvaluation(
    subject: Subject,
    resource: Resource,
    action: Action,
    environment: Environment,
    decision: PolicyDecision
  ): void {
    if (!this.config.enableAuditLog) return

    const logEntry: PolicyEvaluationResult = {
      policyId: 'EVALUATION',
      effect: decision.decision,
      matches: true,
      reason: decision.reason,
      ruleResults: [],
      executionTime: decision.executionTime || 0,
      timestamp: decision.timestamp,
      context: {
        subject: { id: subject.id, roles: subject.roles, department: subject.department },
        resource: { id: resource.id, type: resource.type, category: resource.category },
        action: { name: action.name, type: action.type },
        environment: { ipAddress: environment.ipAddress, userAgent: environment.userAgent }
      }
    }

    this.auditLog.push(logEntry)

    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000)
    }
  }

  /**
   * Get audit log entries
   */
  getAuditLog(limit?: number): PolicyEvaluationResult[] {
    return limit ? this.auditLog.slice(-limit) : [...this.auditLog]
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = []
  }

  /**
   * Get engine statistics
   */
  getStats() {
    return {
      totalEvaluations: this.auditLog.length,
      permitDecisions: this.auditLog.filter(e => e.effect === 'permit').length,
      denyDecisions: this.auditLog.filter(e => e.effect === 'deny').length,
      averageExecutionTime: this.auditLog.length > 0 
        ? this.auditLog.reduce((sum, e) => sum + (e.executionTime || 0), 0) / this.auditLog.length
        : 0,
      config: this.config
    }
  }
}

// Export singleton instance
export const policyEngine = new PolicyEngine({
  combiningAlgorithm: 'deny-overrides',
  enableAuditLog: true,
  defaultDecision: 'deny'
})