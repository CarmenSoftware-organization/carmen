// Test file to verify role-based permissions work correctly
import { canEditField } from './field-permissions';

// Test the permission system
export function testPermissions() {
  console.log('=== Role-Based Permission Tests ===');
  
  // Test Requestor permissions
  console.log('\n--- Requestor Role Tests ---');
  console.log('Location editable:', canEditField('location', 'Requestor')); // Should be true
  console.log('Product editable:', canEditField('product', 'Requestor')); // Should be true
  console.log('Comment editable:', canEditField('comment', 'Requestor')); // Should be true
  console.log('Price editable:', canEditField('price', 'Requestor')); // Should be false
  console.log('Vendor editable:', canEditField('vendor', 'Requestor')); // Should be false
  
  // Test Department Manager permissions
  console.log('\n--- Department Manager Role Tests ---');
  console.log('Location editable:', canEditField('location', 'Department Manager')); // Should be false
  console.log('Comment editable:', canEditField('comment', 'Department Manager')); // Should be true
  console.log('Approved Qty editable:', canEditField('approvedQty', 'Department Manager')); // Should be true
  console.log('Price editable:', canEditField('price', 'Department Manager')); // Should be false
  
  // Test Purchasing Staff permissions
  console.log('\n--- Purchasing Staff Role Tests ---');
  console.log('Location editable:', canEditField('location', 'Purchasing Staff')); // Should be false
  console.log('Comment editable:', canEditField('comment', 'Purchasing Staff')); // Should be true
  console.log('Price editable:', canEditField('price', 'Purchasing Staff')); // Should be true
  console.log('Vendor editable:', canEditField('vendor', 'Purchasing Staff')); // Should be true
  
  console.log('\n=== Tests Complete ===');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).testPermissions = testPermissions;
}