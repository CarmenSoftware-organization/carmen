# Recipe Management Sub-Module - Technical PRD

## Document Information

| **Attribute**     | **Value**                         |
|-------------------|-----------------------------------|
| **Document Type** | Sub-Module Product Requirements   |
| **Version**       | 1.0.0                            |
| **Date**          | January 2025                     |
| **Status**        | Production Ready                 |
| **Owner**         | Culinary Operations Team         |
| **Parent Module** | [Operational Planning](../module-prd.md) |

---

## Executive Summary

The Recipe Management Sub-Module provides comprehensive recipe lifecycle management capabilities including creation, costing, nutritional analysis, version control, and approval workflows. This module ensures recipe standardization, cost control, and nutritional compliance while maintaining the flexibility needed for culinary creativity and menu evolution.

### Key Objectives

1. **Recipe Standardization**: Maintain consistent recipes with precise measurements and procedures
2. **Cost Control**: Accurate recipe costing with real-time ingredient price updates
3. **Nutritional Compliance**: Complete nutritional analysis and allergen tracking
4. **Version Management**: Recipe versioning with approval workflows and change tracking
5. **Yield Management**: Flexible yield calculations and portion cost analysis
6. **Integration Ready**: Seamless integration with inventory, procurement, and menu systems

---

## Business Requirements

### Functional Requirements

#### RM-001: Recipe Creation and Management
**Priority**: Critical  
**Complexity**: High

**User Story**: As a head chef, I want to create and manage standardized recipes with accurate measurements and procedures, so that all kitchen staff can consistently reproduce high-quality dishes.

**Acceptance Criteria**:
- ✅ Comprehensive recipe creation with ingredients, steps, and metadata
- ✅ Support for both product ingredients and sub-recipes (recipe-in-recipe)
- ✅ Flexible yield calculations with automatic scaling
- ✅ Equipment and timing specifications for each preparation step
- ✅ Photo and video attachment support for visual instructions
- ✅ Recipe categorization and tagging system

**Technical Implementation**:
```typescript
interface Recipe {
  id: string;
  code: string; // Auto-generated unique identifier
  name: string;
  description: string;
  category: RecipeCategory;
  cuisine: CuisineType;
  status: RecipeStatus;
  version: number;
  
  // Yield Information
  yield: number;
  yieldUnit: string;
  portionSize: number;
  portionUnit: string;
  servingsPerBatch: number;
  
  // Timing and Difficulty
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // calculated
  difficulty: DifficultyLevel;
  skillLevel: SkillLevel;
  
  // Ingredients
  ingredients: RecipeIngredient[];
  
  // Preparation Steps
  steps: PreparationStep[];
  
  // Equipment and Tools
  equipment: Equipment[];
  specialEquipment: SpecialEquipment[];
  
  // Instructions and Notes
  specialInstructions: string[];
  chefNotes: string;
  platingInstructions: string;
  storageInstructions: string;
  
  // Media
  photos: RecipePhoto[];
  videos: RecipeVideo[];
  
  // Metadata
  tags: string[];
  createdBy: User;
  createdAt: Date;
  updatedBy: User;
  updatedAt: Date;
}

interface RecipeIngredient {
  id: string;
  lineNumber: number;
  item: InventoryItem | Recipe; // Support for sub-recipes
  itemType: 'PRODUCT' | 'RECIPE';
  quantity: number;
  unit: string;
  preparation: string; // "diced", "chopped", "julienned", etc.
  isOptional: boolean;
  substitutes: IngredientSubstitute[];
  wastagePercentage: Percentage;
  notes?: string;
  
  // Cost Information (calculated)
  costPerUnit: Money;
  totalCost: Money;
  lastCostUpdate: Date;
}

interface PreparationStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  duration?: number; // minutes
  temperature?: TemperatureSpec;
  technique: CookingTechnique;
  equipment: string[];
  ingredients: string[]; // References to ingredient line numbers
  criticalControlPoint?: boolean; // HACCP requirement
  images: string[];
  videos: string[];
  notes?: string;
}

interface TemperatureSpec {
  value: number;
  unit: 'C' | 'F';
  range?: {
    min: number;
    max: number;
  };
  probe?: 'internal' | 'surface' | 'ambient';
}

type RecipeStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'RETIRED';

type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
type SkillLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
type CookingTechnique = 
  | 'SAUTÉ' | 'ROAST' | 'GRILL' | 'BRAISE' | 'STEAM' 
  | 'POACH' | 'DEEP_FRY' | 'BAKE' | 'BROIL' | 'SMOKE';
```

---

#### RM-002: Recipe Costing and Financial Analysis
**Priority**: Critical  
**Complexity**: High

**User Story**: As a kitchen manager, I want accurate recipe costing with real-time ingredient price updates, so that I can maintain target food cost percentages and make informed pricing decisions.

**Acceptance Criteria**:
- ✅ Real-time ingredient cost calculation from inventory system
- ✅ Wastage factor inclusion in cost calculations
- ✅ Labor cost allocation and overhead distribution
- ✅ Cost per portion and batch cost analysis
- ✅ Price sensitivity analysis and margin calculations
- ✅ Historical cost trending and variance analysis

**Recipe Costing Engine**:
```typescript
interface RecipeCostAnalysis {
  recipeId: string;
  calculationDate: Date;
  yieldQuantity: number;
  
  // Ingredient Costs
  ingredientCosts: IngredientCostBreakdown[];
  totalIngredientCost: Money;
  ingredientCostPerPortion: Money;
  
  // Labor Costs
  laborTime: number; // minutes
  laborRate: Money; // per hour
  laborCost: Money;
  laborCostPerPortion: Money;
  
  // Overhead Costs
  overheadPercentage: Percentage;
  overheadCost: Money;
  overheadCostPerPortion: Money;
  
  // Total Costs
  totalCost: Money;
  costPerPortion: Money;
  
  // Pricing Analysis
  suggestedSellingPrice: Money;
  targetFoodCostPercentage: Percentage;
  actualFoodCostPercentage: Percentage;
  grossMargin: Money;
  grossMarginPercentage: Percentage;
  
  // Variance Analysis
  costVariance: CostVariance;
  
  lastUpdate: Date;
}

interface IngredientCostBreakdown {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: Money;
  wastage: Percentage;
  effectiveQuantity: number;
  totalCost: Money;
  costPerPortion: Money;
  percentOfRecipe: Percentage;
}

interface CostVariance {
  previousCost: Money;
  currentCost: Money;
  variance: Money;
  variancePercentage: Percentage;
  variantIngredients: VariantIngredient[];
}

interface VariantIngredient {
  ingredientId: string;
  ingredientName: string;
  previousCost: Money;
  currentCost: Money;
  variance: Money;
  variancePercentage: Percentage;
  reason: VarianceReason;
}

type VarianceReason = 
  | 'PRICE_INCREASE'
  | 'PRICE_DECREASE'
  | 'SUPPLIER_CHANGE'
  | 'SEASONAL_VARIATION'
  | 'MARKET_FLUCTUATION'
  | 'CURRENCY_CHANGE';

class RecipeCostingService {
  async calculateRecipeCost(
    recipeId: string,
    costingDate: Date = new Date()
  ): Promise<RecipeCostAnalysis> {
    const recipe = await this.getRecipe(recipeId);
    const ingredientCosts = await this.getIngredientCosts(recipe.ingredients, costingDate);
    
    const ingredientCostBreakdown = recipe.ingredients.map(ingredient => {
      const unitCost = ingredientCosts.find(cost => cost.itemId === ingredient.item.id)?.cost || 0;
      const wastageMultiplier = 1 + (ingredient.wastagePercentage / 100);
      const effectiveQuantity = ingredient.quantity * wastageMultiplier;
      const totalCost = effectiveQuantity * unitCost;
      
      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.item.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitCost,
        wastage: ingredient.wastagePercentage,
        effectiveQuantity,
        totalCost,
        costPerPortion: totalCost / recipe.servingsPerBatch,
        percentOfRecipe: (totalCost / recipe.totalCost) * 100
      };
    });
    
    const totalIngredientCost = ingredientCostBreakdown.reduce(
      (sum, item) => sum + item.totalCost, 0
    );
    
    const laborCost = this.calculateLaborCost(recipe);
    const overheadCost = this.calculateOverheadCost(totalIngredientCost + laborCost);
    
    const totalCost = totalIngredientCost + laborCost + overheadCost;
    const costPerPortion = totalCost / recipe.servingsPerBatch;
    
    return {
      recipeId,
      calculationDate: costingDate,
      yieldQuantity: recipe.yield,
      ingredientCosts: ingredientCostBreakdown,
      totalIngredientCost,
      ingredientCostPerPortion: totalIngredientCost / recipe.servingsPerBatch,
      laborTime: recipe.totalTime,
      laborRate: await this.getLaborRate(),
      laborCost,
      laborCostPerPortion: laborCost / recipe.servingsPerBatch,
      overheadPercentage: await this.getOverheadPercentage(),
      overheadCost,
      overheadCostPerPortion: overheadCost / recipe.servingsPerBatch,
      totalCost,
      costPerPortion,
      suggestedSellingPrice: await this.calculateSuggestedPrice(costPerPortion),
      targetFoodCostPercentage: recipe.targetFoodCostPercentage || 30,
      actualFoodCostPercentage: (costPerPortion / recipe.sellingPrice) * 100,
      grossMargin: recipe.sellingPrice - costPerPortion,
      grossMarginPercentage: ((recipe.sellingPrice - costPerPortion) / recipe.sellingPrice) * 100,
      costVariance: await this.calculateCostVariance(recipeId, totalCost),
      lastUpdate: new Date()
    };
  }
}
```

---

#### RM-003: Nutritional Analysis and Compliance
**Priority**: High  
**Complexity**: Medium

**User Story**: As a nutritionist, I want comprehensive nutritional analysis for all recipes, so that I can ensure menu compliance with dietary requirements and provide accurate nutritional information to customers.

**Acceptance Criteria**:
- ✅ Complete nutritional analysis including macros and micronutrients
- ✅ Allergen identification and cross-contamination warnings
- ✅ Dietary restriction compliance checking (vegan, gluten-free, etc.)
- ✅ Nutritional labeling generation for regulatory compliance
- ✅ Portion-based nutritional calculations
- ✅ Integration with nutritional databases

**Nutritional Analysis System**:
```typescript
interface NutritionalAnalysis {
  recipeId: string;
  analysisDate: Date;
  portionSize: number;
  portionUnit: string;
  
  // Macronutrients
  calories: number;
  totalFat: number; // grams
  saturatedFat: number;
  transFat: number;
  cholesterol: number; // milligrams
  sodium: number; // milligrams
  totalCarbohydrates: number; // grams
  dietaryFiber: number;
  sugars: number;
  addedSugars: number;
  protein: number; // grams
  
  // Micronutrients
  vitaminA: number; // mcg
  vitaminC: number; // mg
  vitaminD: number; // mcg
  vitaminE: number; // mg
  vitaminK: number; // mcg
  thiamine: number; // mg
  riboflavin: number; // mg
  niacin: number; // mg
  vitaminB6: number; // mg
  folate: number; // mcg
  vitaminB12: number; // mcg
  calcium: number; // mg
  iron: number; // mg
  magnesium: number; // mg
  phosphorus: number; // mg
  potassium: number; // mg
  zinc: number; // mg
  
  // Allergen Information
  allergens: AllergenInfo[];
  crossContaminationRisk: CrossContaminationRisk[];
  
  // Dietary Compliance
  dietaryCompliance: DietaryCompliance;
  
  // Nutritional Quality
  nutritionScore: number; // 0-100
  healthRating: HealthRating;
  
  calculatedBy: NutritionCalculationMethod;
  lastUpdate: Date;
}

interface AllergenInfo {
  allergen: AllergenType;
  source: string; // Which ingredient contains the allergen
  severity: AllergenSeverity;
  isTraceAmount: boolean;
}

interface CrossContaminationRisk {
  allergen: AllergenType;
  riskLevel: RiskLevel;
  source: string; // Equipment, preparation area, etc.
  mitigationSteps: string[];
}

interface DietaryCompliance {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
  seafoodFree: boolean;
  kosher: boolean;
  halal: boolean;
  lowSodium: boolean; // <140mg per serving
  lowFat: boolean; // <3g per serving
  lowCalorie: boolean; // <40 calories per serving
  highFiber: boolean; // >5g per serving
  highProtein: boolean; // >20% calories from protein
  keto: boolean;
  paleo: boolean;
  mediterranean: boolean;
}

type AllergenType = 
  | 'MILK' | 'EGGS' | 'FISH' | 'SHELLFISH' | 'TREE_NUTS' 
  | 'PEANUTS' | 'WHEAT' | 'SOYBEANS' | 'SESAME';

type AllergenSeverity = 'TRACE' | 'MINOR' | 'MAJOR' | 'PRIMARY';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type HealthRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
type NutritionCalculationMethod = 'DATABASE_LOOKUP' | 'LAB_ANALYSIS' | 'ESTIMATION';

class NutritionalAnalysisService {
  async analyzeRecipeNutrition(
    recipeId: string
  ): Promise<NutritionalAnalysis> {
    const recipe = await this.getRecipe(recipeId);
    const ingredientNutrition = await this.getIngredientNutritionData(recipe.ingredients);
    
    // Calculate nutritional values
    const nutrition = this.calculateNutrition(ingredientNutrition, recipe.servingsPerBatch);
    
    // Identify allergens
    const allergens = this.identifyAllergens(recipe.ingredients);
    
    // Check dietary compliance
    const dietaryCompliance = this.checkDietaryCompliance(nutrition, allergens);
    
    // Calculate nutrition score
    const nutritionScore = this.calculateNutritionScore(nutrition);
    
    return {
      recipeId,
      analysisDate: new Date(),
      portionSize: recipe.portionSize,
      portionUnit: recipe.portionUnit,
      ...nutrition,
      allergens,
      crossContaminationRisk: await this.assessCrossContaminationRisk(recipe),
      dietaryCompliance,
      nutritionScore,
      healthRating: this.determineHealthRating(nutritionScore),
      calculatedBy: 'DATABASE_LOOKUP',
      lastUpdate: new Date()
    };
  }
  
  generateNutritionLabel(analysis: NutritionalAnalysis): NutritionLabel {
    return {
      format: 'FDA_NUTRITION_FACTS',
      data: {
        servingSize: `${analysis.portionSize}${analysis.portionUnit}`,
        calories: analysis.calories,
        totalFat: analysis.totalFat,
        saturatedFat: analysis.saturatedFat,
        transFat: analysis.transFat,
        cholesterol: analysis.cholesterol,
        sodium: analysis.sodium,
        totalCarbs: analysis.totalCarbohydrates,
        dietaryFiber: analysis.dietaryFiber,
        sugars: analysis.sugars,
        protein: analysis.protein
      },
      allergenStatement: this.generateAllergenStatement(analysis.allergens),
      generatedDate: new Date()
    };
  }
}
```

---

#### RM-004: Recipe Versioning and Approval Workflow
**Priority**: Medium  
**Complexity**: Medium

**User Story**: As a culinary director, I want recipe versioning and approval workflows, so that I can maintain quality standards while allowing for recipe evolution and improvement.

**Acceptance Criteria**:
- ✅ Recipe versioning with change tracking and comparison
- ✅ Configurable approval workflows based on recipe complexity and cost impact
- ✅ Change request system with justification requirements
- ✅ Recipe rollback capabilities to previous versions
- ✅ Audit trail for all recipe modifications
- ✅ Approval delegation and escalation procedures

**Version Control System**:
```typescript
interface RecipeVersion {
  id: string;
  recipeId: string;
  versionNumber: number;
  versionLabel?: string; // "Winter 2025", "Seasonal Update", etc.
  
  // Change Information
  changeType: ChangeType;
  changeReason: string;
  changeDescription: string;
  changedBy: User;
  changedAt: Date;
  
  // Recipe Data Snapshot
  recipeSnapshot: Recipe;
  
  // Comparison with Previous Version
  changes: RecipeChange[];
  
  // Approval Information
  approvalRequired: boolean;
  approvalStatus: ApprovalStatus;
  approvals: RecipeApproval[];
  
  // Deployment Information
  deployedAt?: Date;
  deployedBy?: User;
  deploymentNotes?: string;
  
  status: VersionStatus;
}

interface RecipeChange {
  field: string;
  fieldType: ChangeFieldType;
  previousValue: any;
  newValue: any;
  changeType: ChangeType;
  impact: ChangeImpact;
}

interface RecipeApproval {
  approver: User;
  approvalStep: number;
  status: ApprovalDecision;
  approvedAt?: Date;
  comments?: string;
  delegatedFrom?: User;
}

type ChangeType = 
  | 'INGREDIENT_ADD'
  | 'INGREDIENT_REMOVE'
  | 'INGREDIENT_MODIFY'
  | 'STEP_ADD'
  | 'STEP_REMOVE'
  | 'STEP_MODIFY'
  | 'TIMING_CHANGE'
  | 'COST_CHANGE'
  | 'PORTION_CHANGE'
  | 'METADATA_UPDATE';

type ChangeFieldType = 'INGREDIENT' | 'STEP' | 'METADATA' | 'COST' | 'NUTRITION';
type ChangeImpact = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'DELEGATED';
type VersionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'RETIRED';

class RecipeVersioningService {
  async createRecipeVersion(
    recipeId: string,
    changes: Partial<Recipe>,
    changeReason: string,
    changeDescription: string,
    changedBy: User
  ): Promise<RecipeVersion> {
    const currentRecipe = await this.getRecipe(recipeId);
    const previousVersion = await this.getLatestVersion(recipeId);
    
    const newVersionNumber = previousVersion ? previousVersion.versionNumber + 1 : 1;
    
    // Create recipe snapshot with changes
    const updatedRecipe = { ...currentRecipe, ...changes };
    
    // Calculate changes
    const recipeChanges = this.calculateChanges(currentRecipe, updatedRecipe);
    
    // Determine if approval is required
    const requiresApproval = this.determineApprovalRequirement(recipeChanges);
    
    const version: RecipeVersion = {
      id: generateId(),
      recipeId,
      versionNumber: newVersionNumber,
      changeType: this.determineChangeType(recipeChanges),
      changeReason,
      changeDescription,
      changedBy,
      changedAt: new Date(),
      recipeSnapshot: updatedRecipe,
      changes: recipeChanges,
      approvalRequired: requiresApproval,
      approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
      approvals: [],
      status: requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED'
    };
    
    if (requiresApproval) {
      await this.initiateApprovalProcess(version);
    } else {
      await this.deployVersion(version);
    }
    
    return this.saveRecipeVersion(version);
  }
  
  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<VersionComparison> {
    const version1 = await this.getVersion(version1Id);
    const version2 = await this.getVersion(version2Id);
    
    return {
      version1,
      version2,
      differences: this.calculateChanges(version1.recipeSnapshot, version2.recipeSnapshot),
      costImpact: this.calculateCostImpact(version1.recipeSnapshot, version2.recipeSnapshot),
      nutritionalImpact: await this.calculateNutritionalImpact(version1.recipeSnapshot, version2.recipeSnapshot)
    };
  }
  
  async rollbackToVersion(
    recipeId: string,
    targetVersionId: string,
    rolledBackBy: User,
    reason: string
  ): Promise<RecipeVersion> {
    const targetVersion = await this.getVersion(targetVersionId);
    
    return this.createRecipeVersion(
      recipeId,
      targetVersion.recipeSnapshot,
      'ROLLBACK',
      `Rolled back to version ${targetVersion.versionNumber}: ${reason}`,
      rolledBackBy
    );
  }
}
```

---

#### RM-005: Recipe Scaling and Yield Management
**Priority**: Medium  
**Complexity**: Low

**User Story**: As a production chef, I want to scale recipes up or down while maintaining ingredient ratios and adjusting cooking times, so that I can produce the right quantities for different service sizes.

**Acceptance Criteria**:
- ✅ Automatic ingredient quantity scaling with ratio preservation
- ✅ Cooking time adjustments based on batch size
- ✅ Equipment requirement scaling and substitution suggestions
- ✅ Cost recalculation for scaled recipes
- ✅ Yield validation and portion count verification
- ✅ Scaling limitation warnings for critical recipes

**Recipe Scaling Engine**:
```typescript
interface RecipeScaling {
  originalRecipeId: string;
  originalYield: number;
  targetYield: number;
  scalingFactor: number;
  
  scaledIngredients: ScaledIngredient[];
  scaledSteps: ScaledPreparationStep[];
  scaledEquipment: ScaledEquipment[];
  
  timingAdjustments: TimingAdjustment[];
  temperatureAdjustments: TemperatureAdjustment[];
  
  costAnalysis: ScaledCostAnalysis;
  scalingWarnings: ScalingWarning[];
  
  scaledAt: Date;
  scaledBy: User;
}

interface ScaledIngredient extends RecipeIngredient {
  originalQuantity: number;
  scaledQuantity: number;
  roundedQuantity: number;
  unit: string;
  conversionApplied?: UnitConversion;
  scalingNote?: string;
}

interface ScaledPreparationStep extends PreparationStep {
  originalDuration?: number;
  scaledDuration?: number;
  scalingNote?: string;
}

interface TimingAdjustment {
  stepNumber: number;
  originalTime: number;
  scaledTime: number;
  adjustmentRatio: number;
  adjustmentReason: string;
}

interface ScalingWarning {
  type: WarningType;
  severity: WarningSeverity;
  message: string;
  affectedElement: string;
  recommendation?: string;
}

type WarningType = 
  | 'EQUIPMENT_CAPACITY'
  | 'COOKING_TIME_NONLINEAR'
  | 'INGREDIENT_AVAILABILITY'
  | 'TASTE_BALANCE'
  | 'TEXTURE_CHANGE'
  | 'PORTION_SIZE_IMPACT';

type WarningSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

class RecipeScalingService {
  async scaleRecipe(
    recipeId: string,
    targetYield: number,
    scalingOptions: ScalingOptions = {}
  ): Promise<RecipeScaling> {
    const recipe = await this.getRecipe(recipeId);
    const scalingFactor = targetYield / recipe.yield;
    
    // Scale ingredients
    const scaledIngredients = recipe.ingredients.map(ingredient => {
      const scaledQuantity = ingredient.quantity * scalingFactor;
      const roundedQuantity = this.roundToUsableAmount(scaledQuantity, ingredient.unit);
      
      return {
        ...ingredient,
        originalQuantity: ingredient.quantity,
        scaledQuantity,
        roundedQuantity,
        quantity: roundedQuantity,
        totalCost: ingredient.costPerUnit * roundedQuantity,
        scalingNote: this.generateScalingNote(scaledQuantity, roundedQuantity)
      };
    });
    
    // Scale preparation steps with time adjustments
    const scaledSteps = recipe.steps.map(step => {
      const scaledDuration = step.duration ? 
        this.adjustCookingTime(step.duration, scalingFactor, step.technique) : 
        step.duration;
      
      return {
        ...step,
        originalDuration: step.duration,
        scaledDuration,
        duration: scaledDuration,
        scalingNote: scaledDuration !== step.duration ? 
          `Time adjusted from ${step.duration} to ${scaledDuration} minutes` : 
          undefined
      };
    });
    
    // Calculate equipment scaling
    const scaledEquipment = await this.scaleEquipment(recipe.equipment, scalingFactor);
    
    // Generate warnings
    const warnings = await this.generateScalingWarnings(recipe, scalingFactor);
    
    // Recalculate costs
    const costAnalysis = await this.calculateScaledCosts(recipe, scaledIngredients);
    
    return {
      originalRecipeId: recipeId,
      originalYield: recipe.yield,
      targetYield,
      scalingFactor,
      scaledIngredients,
      scaledSteps,
      scaledEquipment,
      timingAdjustments: this.calculateTimingAdjustments(recipe.steps, scaledSteps),
      temperatureAdjustments: [], // Most temperatures don't change with scaling
      costAnalysis,
      scalingWarnings: warnings,
      scaledAt: new Date(),
      scaledBy: this.getCurrentUser()
    };
  }
  
  private adjustCookingTime(
    originalTime: number,
    scalingFactor: number,
    technique: CookingTechnique
  ): number {
    // Different cooking techniques scale differently
    const scalingMap: Record<CookingTechnique, number> = {
      'SAUTÉ': 0.8, // Slight increase
      'ROAST': 0.7, // Moderate increase
      'GRILL': 0.9, // Minimal increase
      'BRAISE': 0.6, // Significant increase
      'STEAM': 0.8,
      'POACH': 0.8,
      'DEEP_FRY': 0.9,
      'BAKE': 0.7,
      'BROIL': 0.9,
      'SMOKE': 0.5
    };
    
    const timeScalingFactor = Math.pow(scalingFactor, scalingMap[technique] || 0.7);
    return Math.round(originalTime * timeScalingFactor);
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Recipe Search**: <1 second for full-text search across 10,000+ recipes
- **Cost Calculation**: <2 seconds for complex recipes with 50+ ingredients
- **Nutritional Analysis**: <3 seconds for complete nutritional breakdown
- **Recipe Scaling**: <1 second for ingredient quantity adjustments
- **Version Comparison**: <2 seconds for detailed version diff analysis

#### Scalability Requirements
- **Recipe Volume**: Support 10,000+ active recipes per location
- **Concurrent Users**: Handle 200+ simultaneous recipe editors
- **Version History**: Maintain 100+ versions per recipe
- **Media Storage**: Support 10GB+ of recipe photos and videos per location

#### Security Requirements
- **Recipe Protection**: Encrypted storage of proprietary recipes and formulations
- **Access Control**: Granular permissions for recipe viewing, editing, and approval
- **Audit Trail**: Complete change tracking with user attribution and timestamps
- **IP Protection**: Watermarking and access logging for sensitive recipes

---

## Technical Architecture

### Database Schema

```sql
-- Recipe categories table
CREATE TABLE recipe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES recipe_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table (main entity)
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES recipe_categories(id),
    cuisine_type VARCHAR(50) NOT NULL,
    status recipe_status DEFAULT 'DRAFT',
    version INTEGER DEFAULT 1,
    
    -- Yield information
    yield_quantity DECIMAL(10,4) NOT NULL,
    yield_unit VARCHAR(50) NOT NULL,
    portion_size DECIMAL(10,4) NOT NULL,
    portion_unit VARCHAR(50) NOT NULL,
    servings_per_batch INTEGER NOT NULL,
    
    -- Timing
    prep_time INTEGER NOT NULL, -- minutes
    cook_time INTEGER NOT NULL, -- minutes
    total_time INTEGER GENERATED ALWAYS AS (prep_time + cook_time) STORED,
    difficulty difficulty_level NOT NULL,
    skill_level skill_level NOT NULL,
    
    -- Cost information
    total_cost DECIMAL(15,4) DEFAULT 0,
    cost_per_portion DECIMAL(15,4) DEFAULT 0,
    labor_cost_percentage DECIMAL(5,2) DEFAULT 0,
    overhead_percentage DECIMAL(5,2) DEFAULT 0,
    target_food_cost_percentage DECIMAL(5,2),
    
    -- Pricing
    suggested_price DECIMAL(15,4),
    selling_price DECIMAL(15,4),
    gross_margin DECIMAL(15,4),
    
    -- Instructions and notes
    special_instructions TEXT[],
    chef_notes TEXT,
    plating_instructions TEXT,
    storage_instructions TEXT,
    
    -- Media
    photos TEXT[],
    videos TEXT[],
    
    -- Metadata
    tags TEXT[],
    is_signature_dish BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    season VARCHAR(20), -- 'spring', 'summer', 'fall', 'winter'
    
    -- Audit fields
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_recipe_code (code),
    INDEX idx_recipe_name (name),
    INDEX idx_recipe_category (category_id),
    INDEX idx_recipe_cuisine (cuisine_type),
    INDEX idx_recipe_status (status),
    INDEX idx_recipe_cost (cost_per_portion),
    INDEX idx_recipe_tags (tags) USING GIN,
    FULLTEXT INDEX idx_recipe_fulltext (name, description, chef_notes)
);

-- Recipe ingredients table
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_id UUID NOT NULL, -- References inventory_items or recipes
    item_type item_type_enum NOT NULL, -- 'PRODUCT' or 'RECIPE'
    quantity DECIMAL(12,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    preparation VARCHAR(100), -- 'diced', 'chopped', etc.
    is_optional BOOLEAN DEFAULT FALSE,
    wastage_percentage DECIMAL(5,2) DEFAULT 0,
    cost_per_unit DECIMAL(15,6) NOT NULL,
    total_cost DECIMAL(15,4) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(recipe_id, line_number),
    INDEX idx_recipe_ingredient_recipe (recipe_id),
    INDEX idx_recipe_ingredient_item (item_id, item_type),
    INDEX idx_recipe_ingredient_cost (total_cost)
);

-- Ingredient substitutes table
CREATE TABLE ingredient_substitutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_ingredient_id UUID REFERENCES recipe_ingredients(id) ON DELETE CASCADE,
    substitute_item_id UUID NOT NULL,
    substitute_item_type item_type_enum NOT NULL,
    substitution_ratio DECIMAL(8,4) DEFAULT 1.0, -- 1.0 = 1:1 substitution
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_substitute_ingredient (recipe_ingredient_id),
    INDEX idx_substitute_item (substitute_item_id, substitute_item_type)
);

-- Recipe preparation steps table
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    duration INTEGER, -- minutes
    temperature DECIMAL(5,2), -- celsius
    temperature_unit CHAR(1) DEFAULT 'C', -- 'C' or 'F'
    technique cooking_technique,
    equipment TEXT[],
    ingredients INTEGER[], -- Array of recipe_ingredients.line_number
    is_critical_control_point BOOLEAN DEFAULT FALSE, -- HACCP
    images TEXT[],
    videos TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(recipe_id, step_number),
    INDEX idx_recipe_steps_recipe (recipe_id),
    INDEX idx_recipe_steps_technique (technique)
);

-- Recipe nutritional analysis table
CREATE TABLE recipe_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    portion_size DECIMAL(10,4) NOT NULL,
    portion_unit VARCHAR(50) NOT NULL,
    
    -- Macronutrients
    calories DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    saturated_fat DECIMAL(8,2) DEFAULT 0,
    trans_fat DECIMAL(8,2) DEFAULT 0,
    cholesterol DECIMAL(8,2) DEFAULT 0,
    sodium DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    dietary_fiber DECIMAL(8,2) DEFAULT 0,
    sugars DECIMAL(8,2) DEFAULT 0,
    added_sugars DECIMAL(8,2) DEFAULT 0,
    protein DECIMAL(8,2) DEFAULT 0,
    
    -- Micronutrients (selected key vitamins and minerals)
    vitamin_a DECIMAL(8,2) DEFAULT 0,
    vitamin_c DECIMAL(8,2) DEFAULT 0,
    vitamin_d DECIMAL(8,2) DEFAULT 0,
    calcium DECIMAL(8,2) DEFAULT 0,
    iron DECIMAL(8,2) DEFAULT 0,
    potassium DECIMAL(8,2) DEFAULT 0,
    
    -- Analysis metadata
    analysis_method nutrition_method DEFAULT 'DATABASE_LOOKUP',
    nutrition_score INTEGER, -- 0-100
    health_rating health_rating,
    
    -- Allergen information
    allergens allergen_type[] DEFAULT '{}',
    
    -- Dietary compliance
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_dairy_free BOOLEAN DEFAULT FALSE,
    is_nut_free BOOLEAN DEFAULT FALSE,
    is_kosher BOOLEAN DEFAULT FALSE,
    is_halal BOOLEAN DEFAULT FALSE,
    is_keto BOOLEAN DEFAULT FALSE,
    is_paleo BOOLEAN DEFAULT FALSE,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by UUID REFERENCES users(id),
    
    UNIQUE(recipe_id), -- One nutrition analysis per recipe
    INDEX idx_nutrition_calories (calories),
    INDEX idx_nutrition_allergens (allergens) USING GIN,
    INDEX idx_nutrition_dietary (is_vegetarian, is_vegan, is_gluten_free)
);

-- Recipe versions table
CREATE TABLE recipe_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_label VARCHAR(100),
    
    change_type change_type NOT NULL,
    change_reason TEXT NOT NULL,
    change_description TEXT NOT NULL,
    changed_by UUID REFERENCES users(id) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Recipe snapshot as JSON
    recipe_snapshot JSONB NOT NULL,
    
    -- Changes from previous version
    changes JSONB,
    
    -- Approval information
    approval_required BOOLEAN DEFAULT FALSE,
    approval_status approval_status DEFAULT 'PENDING',
    
    -- Deployment
    deployed_at TIMESTAMP WITH TIME ZONE,
    deployed_by UUID REFERENCES users(id),
    deployment_notes TEXT,
    
    status version_status DEFAULT 'DRAFT',
    
    UNIQUE(recipe_id, version_number),
    INDEX idx_version_recipe (recipe_id),
    INDEX idx_version_status (status),
    INDEX idx_version_changed (changed_at)
);

-- Recipe version approvals table
CREATE TABLE recipe_version_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES recipe_versions(id) ON DELETE CASCADE,
    approval_step INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id) NOT NULL,
    status approval_decision DEFAULT 'PENDING',
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    delegated_from UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(version_id, approval_step),
    INDEX idx_approval_version (version_id),
    INDEX idx_approval_approver (approver_id, status)
);

-- Custom types
CREATE TYPE recipe_status AS ENUM (
    'DRAFT', 'PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'RETIRED'
);

CREATE TYPE difficulty_level AS ENUM (
    'EASY', 'MEDIUM', 'HARD', 'EXPERT'
);

CREATE TYPE skill_level AS ENUM (
    'BASIC', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'
);

CREATE TYPE item_type_enum AS ENUM (
    'PRODUCT', 'RECIPE'
);

CREATE TYPE cooking_technique AS ENUM (
    'SAUTÉ', 'ROAST', 'GRILL', 'BRAISE', 'STEAM', 'POACH', 'DEEP_FRY', 'BAKE', 'BROIL', 'SMOKE'
);

CREATE TYPE nutrition_method AS ENUM (
    'DATABASE_LOOKUP', 'LAB_ANALYSIS', 'ESTIMATION'
);

CREATE TYPE health_rating AS ENUM (
    'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
);

CREATE TYPE allergen_type AS ENUM (
    'MILK', 'EGGS', 'FISH', 'SHELLFISH', 'TREE_NUTS', 'PEANUTS', 'WHEAT', 'SOYBEANS', 'SESAME'
);

CREATE TYPE change_type AS ENUM (
    'INGREDIENT_ADD', 'INGREDIENT_REMOVE', 'INGREDIENT_MODIFY', 'STEP_ADD', 'STEP_REMOVE', 
    'STEP_MODIFY', 'TIMING_CHANGE', 'COST_CHANGE', 'PORTION_CHANGE', 'METADATA_UPDATE'
);

CREATE TYPE approval_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
);

CREATE TYPE approval_decision AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'DELEGATED'
);

CREATE TYPE version_status AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'RETIRED'
);
```

---

### API Endpoints

#### Recipe Management
```typescript
// Get recipes with advanced filtering
GET /api/operational-planning/recipe-management/recipes
Query Parameters:
  - search: string (name, description, ingredients)
  - category: string[]
  - cuisine: string[]
  - status: recipe_status[]
  - difficulty: difficulty_level[]
  - allergens: allergen_type[]
  - dietary: string[] ('vegetarian', 'vegan', 'gluten-free')
  - costRange: { min: number, max: number }
  - prepTimeMax: number (minutes)
  - tags: string[]
  - isSignatureDish: boolean
  - isSeasonal: boolean
  - page: number
  - limit: number
  - sortBy: 'name' | 'cost' | 'createdAt' | 'popularity'
  - sortOrder: 'asc' | 'desc'

Response: 200 OK
{
  "recipes": [
    {
      "id": "recipe-001",
      "code": "RCP-001",
      "name": "Thai Green Curry",
      "description": "Authentic Thai curry with coconut milk and fresh herbs",
      "category": {
        "id": "cat-001",
        "name": "Main Course"
      },
      "cuisineType": "Thai",
      "status": "PUBLISHED",
      "version": 3,
      "yield": 4,
      "yieldUnit": "portions",
      "costPerPortion": 4.75,
      "difficulty": "MEDIUM",
      "prepTime": 30,
      "cookTime": 20,
      "totalTime": 50,
      "allergens": ["FISH", "SHELLFISH"],
      "tags": ["spicy", "coconut", "healthy"],
      "photos": ["/images/recipes/thai-green-curry.jpg"],
      "nutrition": {
        "calories": 320,
        "protein": 28,
        "isVegetarian": false,
        "isGlutenFree": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  },
  "filters": {
    "categories": [
      { "id": "cat-001", "name": "Main Course", "count": 45 },
      { "id": "cat-002", "name": "Appetizer", "count": 32 }
    ],
    "cuisines": [
      { "name": "Thai", "count": 12 },
      { "name": "Italian", "count": 18 }
    ]
  }
}

// Create new recipe
POST /api/operational-planning/recipe-management/recipes
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "Grilled Salmon with Herb Butter",
  "description": "Fresh Atlantic salmon with aromatic herb butter",
  "categoryId": "cat-seafood-001",
  "cuisineType": "Contemporary",
  "yield": 6,
  "yieldUnit": "portions",
  "portionSize": 180,
  "portionUnit": "g",
  "prepTime": 20,
  "cookTime": 15,
  "difficulty": "MEDIUM",
  "skillLevel": "INTERMEDIATE",
  "ingredients": [
    {
      "itemId": "salmon-fillet-001",
      "itemType": "PRODUCT",
      "quantity": 1080,
      "unit": "g",
      "preparation": "skin removed",
      "wastagePercentage": 5,
      "isOptional": false
    },
    {
      "itemId": "herb-butter-recipe",
      "itemType": "RECIPE",
      "quantity": 120,
      "unit": "g",
      "preparation": "softened",
      "isOptional": false
    }
  ],
  "steps": [
    {
      "title": "Prepare the grill",
      "description": "Preheat grill to medium-high heat and clean grates",
      "duration": 10,
      "technique": "GRILL",
      "equipment": ["grill", "wire-brush"]
    },
    {
      "title": "Season the salmon",
      "description": "Season salmon fillets with salt and pepper",
      "duration": 5,
      "ingredients": [1],
      "equipment": ["cutting-board"]
    }
  ],
  "specialInstructions": [
    "Ensure internal temperature reaches 145°F (63°C)",
    "Let rest for 3 minutes before serving"
  ],
  "tags": ["healthy", "high-protein", "quick-cook"],
  "targetFoodCostPercentage": 28.5
}

Response: 201 Created
{
  "id": "recipe-002",
  "code": "RCP-002",
  "status": "DRAFT",
  "version": 1,
  "costAnalysis": {
    "totalCost": 28.50,
    "costPerPortion": 4.75,
    "suggestedPrice": 18.99,
    "grossMargin": 75.0
  },
  "nutritionAnalysis": {
    "calories": 285,
    "protein": 32.5,
    "totalFat": 16.2,
    "allergens": ["FISH"]
  }
}
```

#### Recipe Costing
```typescript
// Get detailed cost analysis
GET /api/operational-planning/recipe-management/recipes/{id}/cost-analysis
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "recipeId": "recipe-001",
  "calculationDate": "2025-01-15T10:30:00Z",
  "ingredientCosts": [
    {
      "ingredientId": "ing-001",
      "ingredientName": "Salmon Fillet",
      "quantity": 1080,
      "unit": "g",
      "unitCost": 0.028,
      "wastage": 5.0,
      "effectiveQuantity": 1134,
      "totalCost": 31.75,
      "costPerPortion": 5.29,
      "percentOfRecipe": 65.2
    }
  ],
  "costBreakdown": {
    "ingredientCost": 48.70,
    "laborCost": 8.50,
    "overheadCost": 5.25,
    "totalCost": 62.45,
    "costPerPortion": 10.41
  },
  "pricingAnalysis": {
    "suggestedPrice": 24.99,
    "targetFoodCostPercentage": 28.5,
    "actualFoodCostPercentage": 41.7,
    "grossMargin": 14.58,
    "grossMarginPercentage": 58.3
  },
  "costVariance": {
    "previousCost": 59.80,
    "currentCost": 62.45,
    "variance": 2.65,
    "variancePercentage": 4.4,
    "majorChanges": [
      {
        "ingredient": "Salmon Fillet",
        "variance": 3.25,
        "reason": "MARKET_FLUCTUATION"
      }
    ]
  }
}

// Recalculate recipe costs
POST /api/operational-planning/recipe-management/recipes/{id}/recalculate-cost
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "recalculateAt": "2025-01-15T00:00:00Z",
  "updatePricing": true,
  "targetMargin": 65.0
}

Response: 200 OK
{
  "costAnalysis": { /* same structure as above */ },
  "pricingRecommendations": [
    {
      "type": "PRICE_INCREASE",
      "currentPrice": 22.99,
      "recommendedPrice": 24.99,
      "reason": "Maintain target food cost percentage",
      "impact": "8.7% price increase"
    }
  ]
}
```

#### Recipe Scaling
```typescript
// Scale recipe to target yield
POST /api/operational-planning/recipe-management/recipes/{id}/scale
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "targetYield": 12,
  "preservePortionSize": true,
  "roundToUsableAmounts": true,
  "adjustTimings": true
}

Response: 200 OK
{
  "originalYield": 6,
  "targetYield": 12,
  "scalingFactor": 2.0,
  "scaledIngredients": [
    {
      "ingredientName": "Salmon Fillet",
      "originalQuantity": 1080,
      "scaledQuantity": 2160,
      "roundedQuantity": 2200,
      "unit": "g",
      "scalingNote": "Rounded up to practical amount"
    }
  ],
  "timingAdjustments": [
    {
      "stepNumber": 3,
      "stepTitle": "Grill salmon",
      "originalTime": 8,
      "scaledTime": 12,
      "adjustmentReason": "Increased batch size requires longer cooking time"
    }
  ],
  "costAnalysis": {
    "totalCost": 125.90,
    "costPerPortion": 10.49
  },
  "scalingWarnings": [
    {
      "type": "EQUIPMENT_CAPACITY",
      "severity": "WARNING",
      "message": "Standard grill may not accommodate 12 portions simultaneously",
      "recommendation": "Consider cooking in two batches of 6 portions each"
    }
  ]
}
```

---

### User Interface Specifications

#### Recipe Creation/Edit Form
```typescript
const RecipeForm: React.FC<RecipeFormProps> = ({ 
  recipe, 
  mode = 'create', 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Recipe>(recipe || defaultRecipe);
  const [activeTab, setActiveTab] = useState<RecipeTab>('basic');
  const [costAnalysis, setCostAnalysis] = useState<RecipeCostAnalysis>();
  
  return (
    <div className="recipe-form">
      <div className="form-header">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Recipe' : `Edit ${recipe.name}`}
        </h2>
        {mode === 'edit' && (
          <div className="version-info">
            <span className="text-sm text-muted-foreground">
              Version {recipe.version} • Last updated {formatDate(recipe.updatedAt)}
            </span>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="steps">Preparation</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="costing">Costing</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Recipe Name" required>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter recipe name"
                  />
                </FormField>
                
                <FormField label="Category" required>
                  <RecipeCategorySelect
                    value={formData.category?.id}
                    onValueChange={(categoryId) => handleCategoryChange(categoryId)}
                  />
                </FormField>
              </div>
              
              <FormField label="Description">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the dish"
                  rows={3}
                />
              </FormField>
              
              <div className="grid grid-cols-4 gap-4">
                <FormField label="Yield">
                  <Input
                    type="number"
                    value={formData.yield}
                    onChange={(e) => handleYieldChange(Number(e.target.value))}
                  />
                </FormField>
                
                <FormField label="Yield Unit">
                  <Select
                    value={formData.yieldUnit}
                    onValueChange={(unit) => setFormData({...formData, yieldUnit: unit})}
                  >
                    <SelectItem value="portions">Portions</SelectItem>
                    <SelectItem value="servings">Servings</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="l">Liters</SelectItem>
                  </Select>
                </FormField>
                
                <FormField label="Prep Time (min)">
                  <Input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({...formData, prepTime: Number(e.target.value)})}
                  />
                </FormField>
                
                <FormField label="Cook Time (min)">
                  <Input
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({...formData, cookTime: Number(e.target.value)})}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Ingredients
                <Button onClick={handleAddIngredient}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeIngredientsTable
                ingredients={formData.ingredients}
                onIngredientsChange={(ingredients) => setFormData({...formData, ingredients})}
                onCostUpdate={handleCostUpdate}
              />
              
              {costAnalysis && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Cost Summary</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Cost:</span>
                      <div className="font-medium">{formatCurrency(costAnalysis.totalCost)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost per Portion:</span>
                      <div className="font-medium">{formatCurrency(costAnalysis.costPerPortion)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Suggested Price:</span>
                      <div className="font-medium">{formatCurrency(costAnalysis.suggestedPrice)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margin:</span>
                      <div className="font-medium">{costAnalysis.grossMarginPercentage.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Preparation Steps
                <Button onClick={handleAddStep}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PreparationStepsEditor
                steps={formData.steps}
                onStepsChange={(steps) => setFormData({...formData, steps})}
                availableIngredients={formData.ingredients}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="form-footer flex justify-between items-center mt-8">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button onClick={handleSubmitForApproval}>
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

### Integration Points

#### Inventory Management Integration
```typescript
interface InventoryIntegration {
  // Get current ingredient costs and availability
  getIngredientDetails(itemIds: string[]): Promise<IngredientDetail[]>;
  
  // Update recipe costs when ingredient prices change
  notifyRecipeCostChanges(priceChanges: IngredientPriceChange[]): Promise<void>;
  
  // Check ingredient availability for recipe production
  checkIngredientAvailability(
    requirements: IngredientRequirement[]
  ): Promise<AvailabilityCheck[]>;
  
  // Create procurement requests for recipe ingredients
  generateIngredientProcurement(
    recipeId: string,
    quantity: number
  ): Promise<ProcurementRequest>;
}
```

#### Menu Management Integration
```typescript
interface MenuIntegration {
  // Sync recipe changes to menu items
  syncRecipeToMenuItems(recipeId: string): Promise<MenuSyncResult>;
  
  // Get recipe usage across menus
  getRecipeMenuUsage(recipeId: string): Promise<MenuUsage[]>;
  
  // Validate menu impact of recipe changes
  validateMenuImpact(
    recipeId: string,
    changes: RecipeChange[]
  ): Promise<MenuImpactAnalysis>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **Recipe Cost Analysis Report**
   - Cost trends by recipe and category
   - Ingredient cost variance analysis
   - Price sensitivity assessments

2. **Recipe Usage Report**
   - Most/least used recipes
   - Seasonal usage patterns
   - Menu item performance correlation

3. **Nutritional Compliance Report**
   - Dietary restriction compliance summary
   - Allergen exposure analysis
   - Nutritional quality scores

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered recipe optimization for cost and nutrition
- Computer vision for automatic ingredient recognition
- Voice-controlled recipe execution interface
- Integration with supplier nutritional databases
- Advanced allergen cross-contamination analysis

#### Phase 3 Features (Q3 2025)
- Machine learning recipe recommendation engine
- Automated recipe scaling with ML time adjustments
- IoT integration for real-time cooking monitoring
- Blockchain recipe IP protection
- Advanced sustainability scoring

---

## Conclusion

The Recipe Management Sub-Module provides comprehensive recipe lifecycle management with advanced costing, nutritional analysis, and version control capabilities. The integration of real-time cost calculations, detailed nutritional compliance, and flexible scaling ensures operational efficiency while maintaining quality standards and regulatory compliance.

The production-ready implementation delivers immediate value through standardized recipe management and accurate cost control, while the extensible architecture supports future enhancements and technological innovations across the hospitality industry.

---

*This document serves as the definitive technical specification for the Recipe Management Sub-Module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025