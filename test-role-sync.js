// Simple test to verify role store functionality
const { roleStore } = require('./lib/stores/role-store');

console.log('Testing Role Store Functionality...\n');

// Test 1: Get initial roles
console.log('1. Initial roles count:', roleStore.getRoles().length);

// Test 2: Add a new role
const newRole = {
  name: 'Test Manager',
  description: 'Test role for synchronization',
  hierarchy: 500,
  permissions: ['user.read', 'user.create'],
  isActive: true
};

console.log('2. Adding new role...');
const createdRole = roleStore.addRole(newRole);
console.log('   Created role ID:', createdRole.id);
console.log('   New roles count:', roleStore.getRoles().length);

// Test 3: Update the role
console.log('3. Updating role...');
const updatedRole = roleStore.updateRole(createdRole.id, { 
  name: 'Updated Test Manager',
  permissions: ['user.read', 'user.create', 'user.update']
});
console.log('   Updated role name:', updatedRole?.name);
console.log('   Updated permissions count:', updatedRole?.permissions?.length);

// Test 4: Get specific role
console.log('4. Retrieving specific role...');
const retrievedRole = roleStore.getRole(createdRole.id);
console.log('   Retrieved role name:', retrievedRole?.name);

// Test 5: Delete role
console.log('5. Deleting role...');
const deleteResult = roleStore.deleteRole(createdRole.id);
console.log('   Delete successful:', deleteResult);
console.log('   Final roles count:', roleStore.getRoles().length);

console.log('\n✅ Role store functionality test completed!');