/**
 * Fractional Sales Rule Validation Service
 * 
 * Handles comprehensive rule validation for pizza and cake fractional sales,
 * including food safety compliance, quality standards, and operational efficiency.
 */

import { 
  BusinessRule, 
  FractionalSalesRule, 
  FoodSafetyRule, 
  InventoryThresholdRule,
  WasteManagementRule,
  ComplianceViolation,
  CorrectiveAction,
  QualityStandard 
} from "@/lib/types/business-rules"

export interface ValidationContext {
  itemId: string
  itemType: 'pizza' | 'cake' | 'other'
  fractionalType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  location: string
  timestamp: Date
  staffId: string
  operationType: 'cutting' | 'storage' | 'sale' | 'disposal' | 'production'
  
  // Item-specific data
  itemData: {
    temperature?: number
    weight?: number
    size?: number
    appearance_score?: number
    holding_time?: number // minutes
    days_since_baked?: number
    display_hours?: number
    storage_temperature?: number
    allergen_info?: string[]
    requires_refrigeration?: boolean
    slice_count?: number
    waste_percentage?: number
    inventory_level?: number
    expiration_time?: Date
  }
  
  // Context data
  contextData: {
    cutting_tool_sanitized?: boolean
    peak_hours_approaching?: boolean
    holiday_period?: boolean
    customer_complaint?: boolean
    competitive_pricing?: number[]
    demand_forecast?: number
    staff_skill_level?: number
    equipment_status?: 'operational' | 'maintenance' | 'broken'
  }
}

export interface ValidationResult {
  isValid: boolean
  violations: ComplianceViolation[]
  warnings: string[]
  requiredActions: CorrectiveAction[]
  blockingViolations: boolean
  complianceScore: number // 0-100
  recommendations: string[]
  nextReviewDate?: Date
}

export class FractionalSalesRuleValidationService {
  private rules: Map<string, BusinessRule> = new Map()
  private activeRules: BusinessRule[] = []
  
  constructor() {
    this.loadRules()
  }

  /**
   * Validates all applicable rules for the given context
   */
  async validateRules(context: ValidationContext): Promise<ValidationResult> {
    const applicableRules = this.getApplicableRules(context)
    const violations: ComplianceViolation[] = []
    const warnings: string[] = []
    const requiredActions: CorrectiveAction[] = []
    const recommendations: string[] = []
    
    let totalScore = 0
    let maxPossibleScore = 0
    let hasBlockingViolations = false

    for (const rule of applicableRules) {
      const ruleResult = await this.validateSingleRule(rule, context)
      
      if (!ruleResult.passed) {
        const violation = this.createViolation(rule, context, ruleResult)
        violations.push(violation)
        
        if (violation.violationType === 'critical') {
          hasBlockingViolations = true
        }
        
        requiredActions.push(...violation.correctiveActions)
      } else {
        totalScore += this.getRuleWeight(rule)
      }
      
      maxPossibleScore += this.getRuleWeight(rule)
      
      // Add warnings and recommendations
      warnings.push(...ruleResult.warnings || [])
      recommendations.push(...ruleResult.recommendations || [])
    }

    const complianceScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 100

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      requiredActions: this.deduplicateActions(requiredActions),
      blockingViolations: hasBlockingViolations,
      complianceScore: Math.round(complianceScore),
      recommendations: this.deduplicateRecommendations(recommendations),
      nextReviewDate: this.calculateNextReviewDate(context, violations)
    }
  }

  /**
   * Validates food safety rules specifically
   */
  async validateFoodSafety(context: ValidationContext): Promise<ValidationResult> {
    const foodSafetyRules = this.activeRules.filter(rule => 
      rule.category === 'food-safety' || 
      (rule.category === 'fractional-sales' && (rule as FractionalSalesRule).foodSafetyLevel === 'high')
    )
    
    const violations: ComplianceViolation[] = []
    const requiredActions: CorrectiveAction[] = []
    
    for (const rule of foodSafetyRules) {
      if (rule.category === 'food-safety') {
        const foodSafetyRule = rule as FoodSafetyRule
        const result = await this.validateFoodSafetyRule(foodSafetyRule, context)
        
        if (!result.passed) {
          const violation = this.createFoodSafetyViolation(foodSafetyRule, context, result)
          violations.push(violation)
          requiredActions.push(...violation.correctiveActions)
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings: [],
      requiredActions,
      blockingViolations: violations.some(v => v.violationType === 'critical'),
      complianceScore: violations.length === 0 ? 100 : 50,
      recommendations: []
    }
  }

  /**
   * Validates quality standards for fractional items
   */
  async validateQualityStandards(
    context: ValidationContext, 
    qualityStandards: QualityStandard[]
  ): Promise<ValidationResult> {
    const violations: ComplianceViolation[] = []
    const warnings: string[] = []
    
    for (const standard of qualityStandards) {
      const result = this.validateQualityStandard(standard, context)
      
      if (!result.passed) {
        const violation: ComplianceViolation = {
          id: `QV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ruleId: `quality-${standard.id}`,
          ruleName: standard.standardName,
          violationType: standard.criticalControl ? 'critical' : 'minor',
          description: result.message || 'No description provided',
          location: context.location,
          timestamp: context.timestamp,
          detectedBy: 'system',
          status: 'open',
          correctiveActions: result.correctiveActions || [],
          businessImpact: standard.criticalControl ? 'safety-risk' : 'reputation-risk'
        }
        
        violations.push(violation)
      } else if (result.warning) {
        warnings.push(result.warning)
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      requiredActions: [],
      blockingViolations: violations.some(v => v.violationType === 'critical'),
      complianceScore: violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length * 20)),
      recommendations: []
    }
  }

  /**
   * Monitors and validates inventory thresholds
   */
  async validateInventoryThresholds(context: ValidationContext): Promise<ValidationResult> {
    const inventoryRules = this.activeRules.filter(rule => rule.category === 'inventory-management') as InventoryThresholdRule[]
    const violations: ComplianceViolation[] = []
    const recommendations: string[] = []
    
    for (const rule of inventoryRules) {
      const result = await this.validateInventoryRule(rule, context)
      
      if (!result.passed) {
        const violation = this.createInventoryViolation(rule, context, result)
        violations.push(violation)
      }
      
      recommendations.push(...(result.recommendations || []))
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings: [],
      requiredActions: [],
      blockingViolations: false,
      complianceScore: violations.length === 0 ? 100 : 75,
      recommendations
    }
  }

  /**
   * Validates waste management rules
   */
  async validateWasteManagement(context: ValidationContext): Promise<ValidationResult> {
    const wasteRules = this.activeRules.filter(rule => rule.category === 'waste-management') as WasteManagementRule[]
    const violations: ComplianceViolation[] = []
    
    for (const rule of wasteRules) {
      const result = await this.validateWasteRule(rule, context)
      
      if (!result.passed) {
        const violation = this.createWasteViolation(rule, context, result)
        violations.push(violation)
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings: [],
      requiredActions: [],
      blockingViolations: false,
      complianceScore: violations.length === 0 ? 100 : 70,
      recommendations: []
    }
  }

  // Private helper methods

  private loadRules(): void {
    // In a real implementation, this would load from database or configuration
    // For now, we'll simulate loading the rules
    this.activeRules = []
  }

  private getApplicableRules(context: ValidationContext): BusinessRule[] {
    return this.activeRules.filter(rule => {
      // Filter rules based on context
      if (rule.category === 'fractional-sales') {
        const fractionalRule = rule as FractionalSalesRule
        return fractionalRule.fractionalType === context.fractionalType
      }
      
      return rule.isActive
    })
  }

  private async validateSingleRule(rule: BusinessRule, context: ValidationContext): Promise<{
    passed: boolean
    message?: string
    warnings?: string[]
    recommendations?: string[]
  }> {
    const conditionResults = rule.conditions.map(condition => 
      this.evaluateCondition(condition, context)
    )
    
    const passed = this.evaluateConditionsLogic(conditionResults, rule.conditions)
    
    return {
      passed,
      message: passed ? undefined : `Rule violation: ${rule.name}`,
      warnings: [],
      recommendations: []
    }
  }

  private evaluateCondition(condition: any, context: ValidationContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context)
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value)
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value)
      case 'between':
        const [min, max] = condition.value
        return Number(fieldValue) >= min && Number(fieldValue) <= max
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'contains':
        return String(fieldValue).includes(String(condition.value))
      default:
        return false
    }
  }

  private getFieldValue(field: string, context: ValidationContext): any {
    // Navigate the context object to get the field value
    const parts = field.split('.')
    let value: any = context
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }
    
    return value
  }

  private evaluateConditionsLogic(results: boolean[], conditions: any[]): boolean {
    if (results.length === 0) return true
    if (results.length === 1) return results[0]
    
    let finalResult = results[0]
    
    for (let i = 1; i < results.length; i++) {
      const operator = conditions[i-1].logicalOperator || 'AND'
      if (operator === 'AND') {
        finalResult = finalResult && results[i]
      } else if (operator === 'OR') {
        finalResult = finalResult || results[i]
      }
    }
    
    return finalResult
  }

  private createViolation(rule: BusinessRule, context: ValidationContext, result: any): ComplianceViolation {
    const severity = this.determineViolationSeverity(rule)
    
    return {
      id: `V-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      violationType: severity,
      description: result.message || `Violation of rule: ${rule.name}`,
      location: context.location,
      timestamp: context.timestamp,
      detectedBy: 'system',
      status: 'open',
      correctiveActions: this.generateCorrectiveActions(rule, context),
      businessImpact: this.determineBusinessImpact(rule, severity)
    }
  }

  private createFoodSafetyViolation(rule: FoodSafetyRule, context: ValidationContext, result: any): ComplianceViolation {
    return {
      id: `FSV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      violationType: rule.riskLevel === 'critical' ? 'critical' : 'major',
      description: `Food Safety Violation: ${result.message}`,
      location: context.location,
      timestamp: context.timestamp,
      detectedBy: 'system',
      status: 'open',
      correctiveActions: rule.corrective_actions.map(action => ({
        id: `CA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        responsible: 'kitchen_manager',
        targetDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        status: 'pending',
        evidenceRequired: true,
        verificationMethod: 'visual_inspection'
      })),
      businessImpact: 'safety-risk'
    }
  }

  private validateQualityStandard(standard: QualityStandard, context: ValidationContext): {
    passed: boolean
    message?: string
    warning?: string
    correctiveActions?: CorrectiveAction[]
  } {
    const fieldValue = this.getFieldValue(standard.measurementType, context)
    
    if (fieldValue === undefined) {
      return {
        passed: false,
        message: `Missing measurement for ${standard.standardName}`
      }
    }

    const numValue = Number(fieldValue)
    let passed = true
    let warning: string | undefined

    if (standard.minimumValue !== undefined && numValue < standard.minimumValue) {
      passed = false
    } else if (standard.maximumValue !== undefined && numValue > standard.maximumValue) {
      passed = false
    } else if (standard.minimumValue !== undefined && numValue < (standard.minimumValue + standard.toleranceLevel)) {
      warning = `${standard.standardName} is approaching minimum threshold`
    }

    return {
      passed,
      message: passed ? undefined : `${standard.standardName} is out of acceptable range`,
      warning,
      correctiveActions: passed ? [] : [{
        id: `QCA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action: `Adjust ${standard.standardName} to meet quality standards`,
        responsible: 'quality_controller',
        targetDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        status: 'pending',
        evidenceRequired: true,
        verificationMethod: 'measurement_verification'
      }]
    }
  }

  private async validateFoodSafetyRule(rule: FoodSafetyRule, context: ValidationContext): Promise<{ passed: boolean; message?: string }> {
    // Implement specific food safety validation logic
    return { passed: true }
  }

  private async validateInventoryRule(rule: InventoryThresholdRule, context: ValidationContext): Promise<{ 
    passed: boolean; 
    message?: string;
    recommendations?: string[]
  }> {
    // Implement inventory threshold validation logic
    return { passed: true, recommendations: [] }
  }

  private async validateWasteRule(rule: WasteManagementRule, context: ValidationContext): Promise<{ passed: boolean; message?: string }> {
    // Implement waste management validation logic
    return { passed: true }
  }

  private createInventoryViolation(rule: InventoryThresholdRule, context: ValidationContext, result: any): ComplianceViolation {
    return {
      id: `IV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      violationType: 'minor',
      description: result.message || 'Inventory threshold violation',
      location: context.location,
      timestamp: context.timestamp,
      detectedBy: 'system',
      status: 'open',
      correctiveActions: [],
      businessImpact: 'operational-inefficiency'
    }
  }

  private createWasteViolation(rule: WasteManagementRule, context: ValidationContext, result: any): ComplianceViolation {
    return {
      id: `WV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      violationType: 'major',
      description: result.message || 'Waste management violation',
      location: context.location,
      timestamp: context.timestamp,
      detectedBy: 'system',
      status: 'open',
      correctiveActions: [],
      businessImpact: 'financial-loss'
    }
  }

  private determineViolationSeverity(rule: BusinessRule): 'critical' | 'major' | 'minor' | 'observation' {
    if (rule.priority >= 9) return 'critical'
    if (rule.priority >= 7) return 'major'
    if (rule.priority >= 5) return 'minor'
    return 'observation'
  }

  private determineBusinessImpact(rule: BusinessRule, severity: string): 'safety-risk' | 'financial-loss' | 'reputation-risk' | 'operational-inefficiency' {
    if (rule.category === 'food-safety') return 'safety-risk'
    if (severity === 'critical') return 'safety-risk'
    if (rule.category === 'waste-management') return 'financial-loss'
    if (rule.category === 'quality-control') return 'reputation-risk'
    return 'operational-inefficiency'
  }

  private generateCorrectiveActions(rule: BusinessRule, context: ValidationContext): CorrectiveAction[] {
    return rule.actions.map(action => ({
      id: `CA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: `Execute ${action.type} with parameters: ${JSON.stringify(action.parameters)}`,
      responsible: 'system_operator',
      targetDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      status: 'pending',
      evidenceRequired: true,
      verificationMethod: 'system_verification'
    }))
  }

  private getRuleWeight(rule: BusinessRule): number {
    return rule.priority
  }

  private deduplicateActions(actions: CorrectiveAction[]): CorrectiveAction[] {
    const seen = new Set<string>()
    return actions.filter(action => {
      const key = `${action.action}-${action.responsible}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  private deduplicateRecommendations(recommendations: string[]): string[] {
    return [...new Set(recommendations)]
  }

  private calculateNextReviewDate(context: ValidationContext, violations: ComplianceViolation[]): Date | undefined {
    if (violations.length === 0) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
    
    const hasCritical = violations.some(v => v.violationType === 'critical')
    if (hasCritical) {
      return new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    }
    
    return new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
  }
}

export default FractionalSalesRuleValidationService