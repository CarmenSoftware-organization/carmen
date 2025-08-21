// Simple test script to verify validation system
const { priceValidationEngine } = require('./lib/services/price-validation-engine.ts');

async function testValidation() {
  console.log('Testing Price Validation Engine...');
  
  const testSubmission = {
    vendorId: '123e4567-e89b-12d3-a456-426614174000',
    categoryId: 'cat_001',
    currency: 'USD',
    effectiveDate: new Date('2024-02-01'),
    expirationDate: new Date('2024-05-01'),
    items: [
      {
        productId: 'PROD-001',
        productName: 'Test Product',
        unitPrice: 29.99,
        currency: 'USD',
        minQuantity: 1,
        validFrom: new Date('2024-02-01'),
        validTo: new Date('2024-05-01')
      }
    ],
    submissionMethod: 'manual'
  };

  try {
    const result = await priceValidationEngine.validatePriceSubmission(testSubmission);
    console.log('Validation Result:', {
      isValid: result.isValid,
      qualityScore: result.qualityScore,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length
    });
    
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings);
    }
    
    console.log('✅ Validation system is working!');
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

testValidation();