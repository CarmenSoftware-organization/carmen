/**
 * ABAC Policy Decision Point (PDP) Engine
 * Evaluates policies to determine if access should be granted or denied
 */

import {
  Policy,
  Rule,
  EffectType,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  AccessDecision,
  PolicyResult
} from '@/lib/types/permissions'

export interface PolicyEngineConfig {
  combiningAlgorithm: 'deny-overrides' | 'permit-overrides' | 'first-applicable' | 'priority-based'
  enableAuditLog: boolean
  defaultDecision: 'permit' | 'deny'
}

export class PolicyEngine {
  private config: PolicyEngineConfig
  private auditLog: PolicyResult[] = []

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
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes,
    policies: Policy[]
  ): Promise<AccessDecision> {
    const startTime = Date.now()
    
    // Filter applicable policies
    const applicablePolicies = this.findApplicablePolicies(
      subject, resource, action, environment, policies
    )

    if (applicablePolicies.length === 0) {
      const decision: AccessDecision = {
        effect: this.config.defaultDecision === 'permit' ? EffectType.PERMIT : EffectType.DENY,
        reason: 'No applicable policies found',
        obligations: [],
        advice: [],
        requestId: '',
        evaluatedPolicies: [],
        evaluationTime: Date.now() - startTime,
        cacheHit: false,
        timestamp: new Date(),
        evaluatedBy: 'policy-engine',
        auditRequired: false
      }
      
      this.logEvaluation(subject, resource, action, environment, decision)
      return decision
    }

    // Evaluate each applicable policy
    const evaluationResults: PolicyResult[] = []

    for (const policy of applicablePolicies) {
      const result = await this.evaluatePolicy(
        policy, subject, resource, action, environment
      )
      evaluationResults.push(result)
    }

    // Apply combining algorithm
    const decision = this.combineResults(evaluationResults)
    decision.evaluationTime = Date.now() - startTime
    decision.timestamp = new Date()
    
    this.logEvaluation(subject, resource, action, environment, decision)
    return decision
  }

  /**
   * Find policies that match the request context
   */
  private findApplicablePolicies(
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes,
    policies: Policy[]
  ): Policy[] {
    return policies.filter(policy =>
      policy.enabled &&
      this.isPolicyApplicable(policy, subject, resource, action, environment)
    ).sort((a, b) => (b.priority || 500) - (a.priority || 500))
  }

  /**
   * Check if a policy is applicable to the current request
   */
  private isPolicyApplicable(
    policy: Policy,
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes
  ): boolean {
    // Check if policy applies to this subject
    if (!this.matchesSubjectConditions(policy.target.subjects, subject)) {
      return false
    }

    // Check if policy applies to this resource
    if (!this.matchesResourceConditions(policy.target.resources, resource)) {
      return false
    }

    // Check if policy applies to this action
    if (!this.matchesActionConditions(policy.target.actions, action)) {
      return false
    }

    // Check environmental conditions
    if (!this.matchesEnvironmentConditions(policy.target.environment, environment)) {
      return false
    }

    // Check validity period
    const now = new Date()
    if (policy.effectiveFrom && now < policy.effectiveFrom) return false
    if (policy.effectiveTo && now > policy.effectiveTo) return false

    return true
  }

  /**
   * Evaluate a single policy against the request
   */
  private async evaluatePolicy(
    policy: Policy,
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes
  ): Promise<PolicyResult> {
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

      return {
        policyId: policy.id,
        effect,
        evaluationTime: Date.now() - startTime,
        reason: this.generatePolicyReason(policy, ruleResults),
        ruleResults: ruleResults.reduce((acc, r, idx) => {
          acc[`rule_${idx}`] = r.matches
          return acc
        }, {} as Record<string, boolean>)
      }
    } catch (error) {
      return {
        policyId: policy.id,
        effect: EffectType.DENY,
        evaluationTime: Date.now() - startTime,
        reason: `Policy evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    rule: Rule,
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes
  ): Promise<{ effect: EffectType; matches: boolean; reason: string }> {
    try {
      // Evaluate rule condition
      const matches = await this.evaluateRuleCondition(
        rule.condition, subject, resource, action, environment
      )

      return {
        effect: EffectType.PERMIT, // Default effect, can be overridden by policy
        matches,
        reason: matches ? `Rule '${rule.id}' matched` : `Rule '${rule.id}' did not match`
      }
    } catch (error) {
      return {
        effect: EffectType.DENY,
        matches: false,
        reason: `Rule evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Evaluate rule condition using expression engine
   */
  private async evaluateRuleCondition(
    condition: any,
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes
  ): Promise<boolean> {
    // Create evaluation context
    const context = {
      subject,
      resource,
      action,
      environment,
      // Helper functions
      hasRole: (role: string) => subject.roles?.map(r => r.name).includes(role) || false,
      inDepartment: (dept: string) => subject.department.name === dept,
      atLocation: (location: string) => subject.location.name === location,
      resourceType: (type: string) => resource.resourceType === type,
      timeOfDay: () => new Date().getHours(),
      dayOfWeek: () => environment.dayOfWeek,
      isWorkingHours: () => {
        const hour = new Date().getHours()
        return hour >= 9 && hour <= 17
      }
    }

    // Simple expression evaluator (in production, use a proper expression engine)
    // For now, just return true as a placeholder
    return true
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
  private matchesSubjectConditions(conditions: any, subject: SubjectAttributes): boolean {
    if (!conditions || conditions.length === 0) return true

    // For each condition, check if it matches
    return conditions.every((condition: any) => {
      const attribute = condition.attribute
      const operator = condition.operator
      const value = condition.value

      // Get the actual value from subject
      let actualValue: any
      if (attribute === 'roles') {
        actualValue = subject.roles.map(r => r.name)
      } else if (attribute === 'department') {
        actualValue = subject.department.name
      } else if (attribute === 'location') {
        actualValue = subject.location.name
      } else {
        actualValue = (subject as any)[attribute]
      }

      // Simple operator matching
      switch (operator) {
        case 'in':
          return Array.isArray(value) && value.includes(actualValue)
        case 'equals':
          return actualValue === value
        default:
          return true
      }
    })
  }

  /**
   * Match resource conditions
   */
  private matchesResourceConditions(conditions: any, resource: ResourceAttributes): boolean {
    if (!conditions || conditions.length === 0) return true

    // For each condition, check if it matches
    return conditions.every((condition: any) => {
      const attribute = condition.attribute
      const operator = condition.operator
      const value = condition.value

      // Get the actual value from resource
      const actualValue = (resource as any)[attribute]

      // Simple operator matching
      switch (operator) {
        case 'in':
          return Array.isArray(value) && value.includes(actualValue)
        case 'equals':
          return actualValue === value
        default:
          return true
      }
    })
  }

  /**
   * Match action conditions
   */
  private matchesActionConditions(conditions: any, action: string): boolean {
    if (!conditions || conditions.length === 0) return true

    // Check if action is in the list of allowed actions
    return conditions.includes(action)
  }

  /**
   * Match environment conditions
   */
  private matchesEnvironmentConditions(conditions: any, environment: EnvironmentAttributes): boolean {
    if (!conditions || conditions.length === 0) return true

    // For each condition, check if it matches
    return conditions.every((condition: any) => {
      const attribute = condition.attribute
      const operator = condition.operator
      const value = condition.value

      // Get the actual value from environment
      const actualValue = (environment as any)[attribute]

      // Simple operator matching
      switch (operator) {
        case 'in':
          return Array.isArray(value) && value.includes(actualValue)
        case 'equals':
          return actualValue === value
        default:
          return true
      }
    })
  }

  /**
   * Combine rule results within a policy
   */
  private combineRuleResults(policy: Policy, ruleResults: any[]): EffectType {
    // Use the policy's effect directly since rules don't have individual effects
    const matchingRules = ruleResults.filter(r => r.matches)

    // If any rule matches, use the policy's effect
    if (matchingRules.length > 0) {
      return policy.effect
    }

    // Default to deny if no rules match
    return EffectType.DENY
  }

  /**
   * Legacy combine rule results (kept for compatibility)
   */
  private legacyCombineRuleResults(policy: Policy, ruleResults: any[]): EffectType {
    const combiningAlgorithm = 'deny-overrides' // Default algorithm
    
    switch (combiningAlgorithm) {
      case 'deny-overrides':
        // If any rule denies, the result is deny
        if (ruleResults.some(r => r.effect === EffectType.DENY && r.matches)) {
          return EffectType.DENY
        }
        // If any rule permits, the result is permit
        if (ruleResults.some(r => r.effect === EffectType.PERMIT && r.matches)) {
          return EffectType.PERMIT
        }
        return EffectType.DENY

      case 'permit-overrides':
        // If any rule permits, the result is permit
        if (ruleResults.some(r => r.effect === EffectType.PERMIT && r.matches)) {
          return EffectType.PERMIT
        }
        // If any rule denies, the result is deny
        if (ruleResults.some(r => r.effect === EffectType.DENY && r.matches)) {
          return EffectType.DENY
        }
        return EffectType.DENY

      case 'first-applicable':
        // Return the effect of the first matching rule
        const firstMatch = ruleResults.find(r => r.matches)
        return firstMatch?.effect || EffectType.DENY

      default:
        return EffectType.DENY
    }
  }

  /**
   * Combine policy evaluation results
   */
  private combineResults(results: PolicyResult[]): AccessDecision {
    if (results.length === 0) {
      return {
        effect: this.config.defaultDecision === 'permit' ? EffectType.PERMIT : EffectType.DENY,
        reason: 'No matching policies found',
        obligations: [],
        advice: [],
        requestId: '',
        evaluatedPolicies: results,
        evaluationTime: 0,
        cacheHit: false,
        timestamp: new Date(),
        evaluatedBy: 'policy-engine',
        auditRequired: false
      }
    }

    switch (this.config.combiningAlgorithm) {
      case 'deny-overrides':
        // If any policy denies, deny access
        const denyResult = results.find(r => r.effect === EffectType.DENY)
        if (denyResult) {
          return {
            effect: EffectType.DENY,
            reason: `Access denied by policy ${denyResult.policyId}: ${denyResult.reason}`,
            obligations: [],
            advice: [],
            requestId: '',
            evaluatedPolicies: results,
            evaluationTime: 0,
            cacheHit: false,
            timestamp: new Date(),
            evaluatedBy: 'policy-engine',
            auditRequired: false
          }
        }

        // If any policy permits, permit access
        const permitResult = results.find(r => r.effect === EffectType.PERMIT)
        if (permitResult) {
          return {
            effect: EffectType.PERMIT,
            reason: `Access permitted by policy ${permitResult.policyId}: ${permitResult.reason}`,
            obligations: [],
            advice: [],
            requestId: '',
            evaluatedPolicies: results,
            evaluationTime: 0,
            cacheHit: false,
            timestamp: new Date(),
            evaluatedBy: 'policy-engine',
            auditRequired: false
          }
        }
        break

      case 'permit-overrides':
        // If any policy permits, permit access
        const permitResult2 = results.find(r => r.effect === EffectType.PERMIT)
        if (permitResult2) {
          return {
            effect: EffectType.PERMIT,
            reason: `Access permitted by policy ${permitResult2.policyId}: ${permitResult2.reason}`,
            obligations: [],
            advice: [],
            requestId: '',
            evaluatedPolicies: results,
            evaluationTime: 0,
            cacheHit: false,
            timestamp: new Date(),
            evaluatedBy: 'policy-engine',
            auditRequired: false
          }
        }

        // If any policy denies, deny access
        const denyResult2 = results.find(r => r.effect === EffectType.DENY)
        if (denyResult2) {
          return {
            effect: EffectType.DENY,
            reason: `Access denied by policy ${denyResult2.policyId}: ${denyResult2.reason}`,
            obligations: [],
            advice: [],
            requestId: '',
            evaluatedPolicies: results,
            evaluationTime: 0,
            cacheHit: false,
            timestamp: new Date(),
            evaluatedBy: 'policy-engine',
            auditRequired: false
          }
        }
        break

      case 'first-applicable':
        // Return the decision of the first matching policy
        const firstMatch = results[0]
        return {
          effect: firstMatch.effect,
          reason: `Decision from first applicable policy ${firstMatch.policyId}: ${firstMatch.reason}`,
          obligations: [],
          advice: [],
          requestId: '',
          evaluatedPolicies: results,
          evaluationTime: 0,
          cacheHit: false,
          timestamp: new Date(),
          evaluatedBy: 'policy-engine',
          auditRequired: false
        }

      case 'priority-based':
        // Return highest priority result
        const highestPriority = results[0] // Already sorted by priority
        return {
          effect: highestPriority.effect,
          reason: `Decision from highest priority policy ${highestPriority.policyId}: ${highestPriority.reason}`,
          obligations: [],
          advice: [],
          requestId: '',
          evaluatedPolicies: results,
          evaluationTime: 0,
          cacheHit: false,
          timestamp: new Date(),
          evaluatedBy: 'policy-engine',
          auditRequired: false
        }
    }

    return {
      effect: this.config.defaultDecision === 'permit' ? EffectType.PERMIT : EffectType.DENY,
      reason: 'No applicable combining algorithm result',
      obligations: [],
      advice: [],
      requestId: '',
      evaluatedPolicies: results,
      evaluationTime: 0,
      cacheHit: false,
      timestamp: new Date(),
      evaluatedBy: 'policy-engine',
      auditRequired: false
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
    subject: SubjectAttributes,
    resource: ResourceAttributes,
    action: string,
    environment: EnvironmentAttributes,
    decision: AccessDecision
  ): void {
    if (!this.config.enableAuditLog) return

    const logEntry: PolicyResult = {
      policyId: 'EVALUATION',
      effect: decision.effect,
      reason: decision.reason,
      evaluationTime: decision.evaluationTime || 0
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
  getAuditLog(limit?: number): PolicyResult[] {
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