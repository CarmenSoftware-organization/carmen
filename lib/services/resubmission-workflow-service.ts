import { ValidationResult } from './price-validation-engine';
import { QualityReport } from './data-quality-service';
import { ErrorReport, ResubmissionTracker, SubmissionChange } from './error-reporting-service';

export interface ResubmissionWorkflow {
  id: string;
  originalSubmissionId: string;
  vendorId: string;
  status: 'initiated' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled';
  currentAttempt: number;
  maxAttempts: number;
  requiredChanges: RequiredChange[];
  completedChanges: CompletedChange[];
  changeHistory: ChangeHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  reviewNotes?: string;
}

export interface RequiredChange {
  id: string;
  category: 'error' | 'warning' | 'quality' | 'compliance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  field: string;
  itemIndex?: number;
  description: string;
  currentValue: any;
  expectedValue?: any;
  correctionInstructions: string[];
  isCompleted: boolean;
  completedAt?: Date;
  verificationStatus?: 'pending' | 'verified' | 'failed';
}

export interface CompletedChange {
  id: string;
  requiredChangeId: string;
  field: string;
  itemIndex?: number;
  oldValue: any;
  newValue: any;
  changeType: 'correction' | 'addition' | 'removal' | 'modification';
  timestamp: Date;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface ChangeHistoryEntry {
  id: string;
  submissionId: string;
  attemptNumber: number;
  changesSummary: string;
  changesCount: number;
  qualityScoreBefore: number;
  qualityScoreAfter: number;
  validationResult: ValidationResult;
  timestamp: Date;
  status: 'submitted' | 'approved' | 'rejected' | 'requires_changes';
}

export interface ResubmissionValidation {
  isValid: boolean;
  allRequiredChangesCompleted: boolean;
  newIssuesDetected: boolean;
  qualityImprovement: number;
  remainingIssues: string[];
  recommendations: string[];
}

export interface ChangeComparison {
  field: string;
  itemIndex?: number;
  changeType: 'added' | 'modified' | 'removed' | 'unchanged';
  oldValue: any;
  newValue: any;
  isRequiredChange: boolean;
  impactsQuality: boolean;
}

export class ResubmissionWorkflowService {
  private workflows: Map<string, ResubmissionWorkflow> = new Map();
  private changeTrackers: Map<string, ResubmissionTracker> = new Map();

  // Initiate resubmission workflow
  async initiateResubmissionWorkflow(
    originalSubmissionId: string,
    vendorId: string,
    validationResult: ValidationResult,
    qualityReport: QualityReport,
    errorReport: ErrorReport
  ): Promise<ResubmissionWorkflow> {
    
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const requiredChanges = this.extractRequiredChanges(validationResult, qualityReport, errorReport);

    const workflow: ResubmissionWorkflow = {
      id: workflowId,
      originalSubmissionId,
      vendorId,
      status: 'initiated',
      currentAttempt: 1,
      maxAttempts: 3,
      requiredChanges,
      completedChanges: [],
      changeHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflowId, workflow);
    
    // Create initial change tracker
    const tracker = await this.createChangeTracker(workflowId, originalSubmissionId, requiredChanges);
    this.changeTrackers.set(workflowId, tracker);

    return workflow;
  }

  // Extract required changes from validation and quality reports
  private extractRequiredChanges(
    validationResult: ValidationResult,
    qualityReport: QualityReport,
    errorReport: ErrorReport
  ): RequiredChange[] {
    
    const requiredChanges: RequiredChange[] = [];

    // Extract from validation errors
    validationResult.errors.forEach((error, index) => {
      const fieldParts = error.field.split('.');
      const itemIndex = fieldParts[0] === 'items' && fieldParts[1] ? 
        parseInt(fieldParts[1].replace(/[\[\]]/g, '')) : undefined;

      requiredChanges.push({
        id: `change_${index}_${Date.now()}`,
        category: 'error',
        priority: error.severity === 'error' ? 'critical' : 'high',
        field: error.field,
        itemIndex,
        description: error.message,
        currentValue: null, // Would be extracted from submission data
        correctionInstructions: [error.suggestion || 'Please correct this error'],
        isCompleted: false
      });
    });

    // Extract from quality issues
    qualityReport.issues.forEach((issue, index) => {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        requiredChanges.push({
          id: `quality_${index}_${Date.now()}`,
          category: 'quality',
          priority: issue.severity === 'critical' ? 'critical' : 'high',
          field: issue.category,
          description: issue.description,
          currentValue: null,
          correctionInstructions: [issue.recommendation],
          isCompleted: false
        });
      }
    });

    // Extract from error report
    errorReport.detailedErrors.forEach((error, index) => {
      if (error.severity === 'critical' || error.severity === 'high') {
        requiredChanges.push({
          id: `detailed_${index}_${Date.now()}`,
          category: 'error',
          priority: error.severity,
          field: error.field,
          itemIndex: error.itemIndex,
          description: error.message,
          currentValue: error.currentValue,
          expectedValue: error.expectedFormat,
          correctionInstructions: error.correctionSteps,
          isCompleted: false
        });
      }
    });

    return requiredChanges;
  }

  // Create change tracker
  private async createChangeTracker(
    workflowId: string,
    originalSubmissionId: string,
    requiredChanges: RequiredChange[]
  ): Promise<ResubmissionTracker> {
    
    return {
      submissionId: workflowId,
      originalSubmissionId,
      attemptNumber: 1,
      changesRequired: requiredChanges.map(c => c.description),
      changesMade: [],
      status: 'pending',
      lastModified: new Date()
    };
  }

  // Process resubmission attempt
  async processResubmission(
    workflowId: string,
    newSubmissionData: any,
    originalSubmissionData: any
  ): Promise<{
    workflow: ResubmissionWorkflow;
    validation: ResubmissionValidation;
    changeComparison: ChangeComparison[];
    newValidationResult: ValidationResult;
  }> {
    
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Compare submissions to detect changes
    const changeComparison = this.compareSubmissions(originalSubmissionData, newSubmissionData, workflow.requiredChanges);
    
    // Update completed changes
    const completedChanges = this.identifyCompletedChanges(changeComparison, workflow.requiredChanges);
    workflow.completedChanges.push(...completedChanges);

    // Mark required changes as completed
    this.updateRequiredChangesStatus(workflow.requiredChanges, completedChanges);

    // Validate resubmission
    const validation = await this.validateResubmission(workflow, newSubmissionData);
    
    // Update workflow status
    workflow.currentAttempt++;
    workflow.updatedAt = new Date();
    
    if (validation.allRequiredChangesCompleted && validation.isValid) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
    } else if (workflow.currentAttempt >= workflow.maxAttempts) {
      workflow.status = 'cancelled';
    } else {
      workflow.status = 'in_progress';
    }

    // Add to change history
    const historyEntry: ChangeHistoryEntry = {
      id: `history_${Date.now()}`,
      submissionId: workflowId,
      attemptNumber: workflow.currentAttempt - 1,
      changesSummary: this.generateChangesSummary(changeComparison),
      changesCount: changeComparison.filter(c => c.changeType !== 'unchanged').length,
      qualityScoreBefore: 0, // Would come from previous validation
      qualityScoreAfter: 0, // Would come from new validation
      validationResult: validation.newIssuesDetected ? 
        { isValid: false, errors: [], warnings: [], qualityScore: 0, itemsValidated: 0, itemsWithErrors: 0, itemsWithWarnings: 0 } :
        { isValid: true, errors: [], warnings: [], qualityScore: 100, itemsValidated: 0, itemsWithErrors: 0, itemsWithWarnings: 0 },
      timestamp: new Date(),
      status: validation.isValid ? 'approved' : 'requires_changes'
    };

    workflow.changeHistory.push(historyEntry);

    return {
      workflow,
      validation,
      changeComparison,
      newValidationResult: historyEntry.validationResult
    };
  }

  // Compare original and new submissions
  private compareSubmissions(
    originalData: any,
    newData: any,
    requiredChanges: RequiredChange[]
  ): ChangeComparison[] {
    
    const comparisons: ChangeComparison[] = [];
    const requiredFields = new Set(requiredChanges.map(c => c.field));

    // Compare basic fields
    const fieldsToCompare = ['vendorId', 'categoryId', 'currency', 'effectiveDate', 'expirationDate'];
    fieldsToCompare.forEach(field => {
      if (originalData[field] !== newData[field]) {
        comparisons.push({
          field,
          changeType: 'modified',
          oldValue: originalData[field],
          newValue: newData[field],
          isRequiredChange: requiredFields.has(field),
          impactsQuality: true
        });
      }
    });

    // Compare items arrays
    if (originalData.items && newData.items) {
      const maxLength = Math.max(originalData.items.length, newData.items.length);
      
      for (let i = 0; i < maxLength; i++) {
        const originalItem = originalData.items[i];
        const newItem = newData.items[i];

        if (!originalItem && newItem) {
          // Item added
          comparisons.push({
            field: `items[${i}]`,
            itemIndex: i,
            changeType: 'added',
            oldValue: null,
            newValue: newItem,
            isRequiredChange: false,
            impactsQuality: true
          });
        } else if (originalItem && !newItem) {
          // Item removed
          comparisons.push({
            field: `items[${i}]`,
            itemIndex: i,
            changeType: 'removed',
            oldValue: originalItem,
            newValue: null,
            isRequiredChange: false,
            impactsQuality: true
          });
        } else if (originalItem && newItem) {
          // Compare item fields
          const itemComparisons = this.compareItems(originalItem, newItem, i, requiredFields);
          comparisons.push(...itemComparisons);
        }
      }
    }

    return comparisons;
  }

  // Compare individual items
  private compareItems(
    originalItem: any,
    newItem: any,
    itemIndex: number,
    requiredFields: Set<string>
  ): ChangeComparison[] {
    
    const comparisons: ChangeComparison[] = [];
    const fieldsToCompare = ['productId', 'productName', 'unitPrice', 'currency', 'minQuantity', 'bulkPrice', 'validFrom', 'validTo'];

    fieldsToCompare.forEach(field => {
      const fieldPath = `items[${itemIndex}].${field}`;
      
      if (originalItem[field] !== newItem[field]) {
        comparisons.push({
          field: fieldPath,
          itemIndex,
          changeType: 'modified',
          oldValue: originalItem[field],
          newValue: newItem[field],
          isRequiredChange: requiredFields.has(fieldPath),
          impactsQuality: this.fieldImpactsQuality(field)
        });
      }
    });

    return comparisons;
  }

  // Determine if field impacts quality
  private fieldImpactsQuality(field: string): boolean {
    const qualityImpactFields = ['productName', 'unitPrice', 'currency', 'validFrom', 'validTo'];
    return qualityImpactFields.includes(field);
  }

  // Identify completed changes
  private identifyCompletedChanges(
    changeComparison: ChangeComparison[],
    requiredChanges: RequiredChange[]
  ): CompletedChange[] {
    
    const completedChanges: CompletedChange[] = [];

    changeComparison.forEach(comparison => {
      if (comparison.changeType !== 'unchanged' && comparison.isRequiredChange) {
        const relatedRequiredChange = requiredChanges.find(rc => rc.field === comparison.field);
        
        if (relatedRequiredChange) {
          completedChanges.push({
            id: `completed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            requiredChangeId: relatedRequiredChange.id,
            field: comparison.field,
            itemIndex: comparison.itemIndex,
            oldValue: comparison.oldValue,
            newValue: comparison.newValue,
            changeType: this.mapChangeType(comparison.changeType),
            timestamp: new Date()
          });
        }
      }
    });

    return completedChanges;
  }

  // Map comparison change type to completed change type
  private mapChangeType(changeType: string): 'correction' | 'addition' | 'removal' | 'modification' {
    switch (changeType) {
      case 'added': return 'addition';
      case 'removed': return 'removal';
      case 'modified': return 'modification';
      default: return 'correction';
    }
  }

  // Update required changes status
  private updateRequiredChangesStatus(
    requiredChanges: RequiredChange[],
    completedChanges: CompletedChange[]
  ): void {
    
    completedChanges.forEach(completed => {
      const requiredChange = requiredChanges.find(rc => rc.id === completed.requiredChangeId);
      if (requiredChange) {
        requiredChange.isCompleted = true;
        requiredChange.completedAt = completed.timestamp;
        requiredChange.verificationStatus = 'pending';
      }
    });
  }

  // Validate resubmission
  private async validateResubmission(
    workflow: ResubmissionWorkflow,
    newSubmissionData: any
  ): Promise<ResubmissionValidation> {
    
    const allRequiredChangesCompleted = workflow.requiredChanges.every(rc => rc.isCompleted);
    const criticalChangesCompleted = workflow.requiredChanges
      .filter(rc => rc.priority === 'critical')
      .every(rc => rc.isCompleted);

    // This would typically run full validation on new submission
    const isValid = allRequiredChangesCompleted && criticalChangesCompleted;
    const newIssuesDetected = false; // Would be determined by running validation
    const qualityImprovement = 15; // Would be calculated from quality scores

    const remainingIssues = workflow.requiredChanges
      .filter(rc => !rc.isCompleted)
      .map(rc => rc.description);

    const recommendations = this.generateResubmissionRecommendations(workflow, allRequiredChangesCompleted);

    return {
      isValid,
      allRequiredChangesCompleted,
      newIssuesDetected,
      qualityImprovement,
      remainingIssues,
      recommendations
    };
  }

  // Generate resubmission recommendations
  private generateResubmissionRecommendations(
    workflow: ResubmissionWorkflow,
    allChangesCompleted: boolean
  ): string[] {
    
    const recommendations: string[] = [];

    if (!allChangesCompleted) {
      const remainingCritical = workflow.requiredChanges.filter(rc => !rc.isCompleted && rc.priority === 'critical').length;
      const remainingHigh = workflow.requiredChanges.filter(rc => !rc.isCompleted && rc.priority === 'high').length;

      if (remainingCritical > 0) {
        recommendations.push(`Complete ${remainingCritical} remaining critical changes before resubmission`);
      }
      if (remainingHigh > 0) {
        recommendations.push(`Address ${remainingHigh} high-priority changes to improve approval chances`);
      }
    }

    if (workflow.currentAttempt >= workflow.maxAttempts - 1) {
      recommendations.push('This is your final resubmission attempt. Ensure all changes are completed.');
    }

    if (workflow.completedChanges.length > 0) {
      recommendations.push('Good progress on addressing required changes. Continue with remaining items.');
    }

    return recommendations;
  }

  // Generate changes summary
  private generateChangesSummary(changeComparison: ChangeComparison[]): string {
    const changes = changeComparison.filter(c => c.changeType !== 'unchanged');
    const added = changes.filter(c => c.changeType === 'added').length;
    const modified = changes.filter(c => c.changeType === 'modified').length;
    const removed = changes.filter(c => c.changeType === 'removed').length;

    const parts = [];
    if (added > 0) parts.push(`${added} added`);
    if (modified > 0) parts.push(`${modified} modified`);
    if (removed > 0) parts.push(`${removed} removed`);

    return parts.length > 0 ? parts.join(', ') : 'No changes detected';
  }

  // Get workflow status
  async getWorkflowStatus(workflowId: string): Promise<ResubmissionWorkflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  // Get workflows for vendor
  async getVendorWorkflows(vendorId: string): Promise<ResubmissionWorkflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.vendorId === vendorId);
  }

  // Get active workflows
  async getActiveWorkflows(): Promise<ResubmissionWorkflow[]> {
    return Array.from(this.workflows.values()).filter(w => 
      w.status === 'initiated' || w.status === 'in_progress' || w.status === 'pending_review'
    );
  }

  // Cancel workflow
  async cancelWorkflow(workflowId: string, reason: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'cancelled';
      workflow.updatedAt = new Date();
      workflow.reviewNotes = `Cancelled: ${reason}`;
    }
  }

  // Complete workflow
  async completeWorkflow(workflowId: string, reviewNotes?: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      workflow.updatedAt = new Date();
      if (reviewNotes) {
        workflow.reviewNotes = reviewNotes;
      }
    }
  }

  // Get change statistics
  async getChangeStatistics(workflowId: string): Promise<{
    totalRequired: number;
    totalCompleted: number;
    completionRate: number;
    byPriority: Record<string, { required: number; completed: number }>;
    byCategory: Record<string, { required: number; completed: number }>;
  }> {
    
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const totalRequired = workflow.requiredChanges.length;
    const totalCompleted = workflow.requiredChanges.filter(rc => rc.isCompleted).length;
    const completionRate = totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0;

    const byPriority = workflow.requiredChanges.reduce((acc, rc) => {
      if (!acc[rc.priority]) acc[rc.priority] = { required: 0, completed: 0 };
      acc[rc.priority].required++;
      if (rc.isCompleted) acc[rc.priority].completed++;
      return acc;
    }, {} as Record<string, { required: number; completed: number }>);

    const byCategory = workflow.requiredChanges.reduce((acc, rc) => {
      if (!acc[rc.category]) acc[rc.category] = { required: 0, completed: 0 };
      acc[rc.category].required++;
      if (rc.isCompleted) acc[rc.category].completed++;
      return acc;
    }, {} as Record<string, { required: number; completed: number }>);

    return {
      totalRequired,
      totalCompleted,
      completionRate,
      byPriority,
      byCategory
    };
  }
}

// Export singleton instance
export const resubmissionWorkflowService = new ResubmissionWorkflowService();