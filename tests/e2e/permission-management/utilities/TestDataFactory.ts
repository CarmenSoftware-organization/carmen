// Test data factory for generating realistic test data
export class TestDataFactory {
  private static counter = 0;
  private static getUniqueId(): string {
    return `test-${Date.now()}-${++this.counter}`;
  }

  // User generation
  static generateUser(role: string = 'staff'): TestUser {
    const firstName = this.getRandomFirstName();
    const lastName = this.getRandomLastName();
    
    return {
      id: this.getUniqueId(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@carmen-test.local`,
      firstName,
      lastName,
      role: role,
      department: this.getRandomDepartment(),
      location: this.getRandomLocation(),
      isActive: true,
      permissions: this.getPermissionsForRole(role),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateUsers(count: number, role: string = 'staff'): TestUser[] {
    return Array.from({ length: count }, () => this.generateUser(role));
  }

  // Policy generation
  static generatePolicy(complexity: 'simple' | 'moderate' | 'complex' = 'simple'): TestPolicy {
    const basePolicy: TestPolicy = {
      id: this.getUniqueId(),
      name: `${this.getRandomPolicyName()} Policy`,
      description: this.getRandomPolicyDescription(),
      priority: this.getRandomNumber(100, 900),
      effect: this.getRandomChoice(['permit', 'deny']) as 'permit' | 'deny',
      enabled: this.getRandomBoolean(0.8), // 80% chance of being enabled
      conditions: [],
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    switch (complexity) {
      case 'simple':
        basePolicy.conditions = [this.generateSimpleCondition()];
        break;
      case 'moderate':
        basePolicy.conditions = [
          this.generateSimpleCondition(),
          this.generateSimpleCondition()
        ];
        break;
      case 'complex':
        basePolicy.conditions = [
          this.generateSimpleCondition(),
          this.generateComplexCondition(),
          this.generateSimpleCondition()
        ];
        break;
    }

    return basePolicy;
  }

  static generatePolicies(count: number, complexity: 'simple' | 'moderate' | 'complex' = 'simple'): TestPolicy[] {
    return Array.from({ length: count }, () => this.generatePolicy(complexity));
  }

  // Role generation
  static generateRole(department?: string): TestRole {
    const roleName = this.getRandomRoleName();
    const dept = department || this.getRandomDepartment();
    
    return {
      id: this.getUniqueId(),
      name: `${dept} ${roleName}`,
      description: `${roleName} role for ${dept} department`,
      department: dept,
      permissions: this.generatePermissionSet(),
      userCount: this.getRandomNumber(1, 25),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static generateRoles(count: number, department?: string): TestRole[] {
    return Array.from({ length: count }, () => this.generateRole(department));
  }

  // Test scenario generation
  static generateTestScenario(scenarioType: string): TestScenario {
    const baseScenario = {
      id: this.getUniqueId(),
      name: '',
      description: '',
      users: [],
      policies: [],
      roles: [],
      expectedOutcome: '',
      preconditions: [],
      validationRules: []
    };

    switch (scenarioType) {
      case 'policy-creation':
        return {
          ...baseScenario,
          name: 'Policy Creation Scenario',
          description: 'Test complete policy creation workflow',
          users: [this.generateUser('super-admin')],
          policies: [this.generatePolicy('moderate')],
          expectedOutcome: 'policy-created',
          preconditions: ['user-authenticated', 'permission-management-accessible'],
          validationRules: ['policy-exists-in-list', 'policy-status-enabled']
        };
        
      case 'role-assignment':
        return {
          ...baseScenario,
          name: 'Role Assignment Scenario',
          description: 'Test bulk user role assignment',
          users: this.generateUsers(5, 'staff'),
          roles: [this.generateRole()],
          expectedOutcome: 'users-assigned-to-role',
          preconditions: ['role-exists', 'users-exist'],
          validationRules: ['users-have-role', 'role-permissions-inherited']
        };
        
      case 'permission-inheritance':
        return {
          ...baseScenario,
          name: 'Permission Inheritance Scenario',
          description: 'Test complex permission inheritance chains',
          users: [this.generateUser('department-manager')],
          policies: [this.generatePolicy('complex')],
          roles: this.generateRoles(2),
          expectedOutcome: 'permissions-inherited-correctly',
          preconditions: ['hierarchical-roles-exist', 'policies-configured'],
          validationRules: ['permission-cascade-working', 'no-permission-conflicts']
        };
        
      case 'rbac-to-abac-migration':
        return {
          ...baseScenario,
          name: 'RBAC to ABAC Migration Scenario',
          description: 'Test migration from RBAC to ABAC system',
          users: this.generateUsers(3, 'department-manager'),
          policies: this.generatePolicies(5, 'moderate'),
          roles: this.generateRoles(3),
          expectedOutcome: 'successful-migration',
          preconditions: ['rbac-system-configured', 'data-backup-available'],
          validationRules: ['no-data-loss', 'permissions-preserved', 'abac-policies-active']
        };

      case 'performance-stress':
        return {
          ...baseScenario,
          name: 'Performance Stress Scenario',
          description: 'Test system performance with large datasets',
          users: this.generateUsers(50),
          policies: this.generatePolicies(100, 'moderate'),
          roles: this.generateRoles(20),
          expectedOutcome: 'performance-within-benchmarks',
          preconditions: ['system-baseline-established'],
          validationRules: [
            'response-time-under-500ms',
            'memory-usage-stable',
            'ui-remains-responsive'
          ]
        };
        
      default:
        throw new Error(`Unknown scenario type: ${scenarioType}`);
    }
  }

  // Helper methods for generating realistic data
  private static generateSimpleCondition(): any {
    const attributes = [
      'user.department',
      'user.role', 
      'user.location',
      'resource.type',
      'resource.classification',
      'environment.time',
      'environment.location',
      'request.action'
    ];

    const operators = ['equals', 'not_equals', 'contains', 'in', 'not_in', 'greater_than', 'less_than'];
    
    const attribute = this.getRandomChoice(attributes);
    const operator = this.getRandomChoice(operators);
    
    let value;
    switch (attribute) {
      case 'user.department':
        value = this.getRandomDepartment();
        break;
      case 'user.role':
        value = this.getRandomChoice(['staff', 'manager', 'admin', 'super-admin']);
        break;
      case 'user.location':
        value = this.getRandomLocation();
        break;
      case 'resource.type':
        value = this.getRandomChoice(['PURCHASE_REQUEST', 'PURCHASE_ORDER', 'INVENTORY_ITEM', 'FINANCIAL_RECORD']);
        break;
      case 'environment.time':
        value = this.getRandomChoice(['09:00-17:00', '00:00-23:59', 'business-hours']);
        break;
      default:
        value = `test-value-${this.getRandomNumber(1, 100)}`;
    }

    return {
      attribute,
      operator,
      value
    };
  }

  private static generateComplexCondition(): any {
    return {
      type: 'composite',
      operator: this.getRandomChoice(['AND', 'OR']),
      conditions: [
        this.generateSimpleCondition(),
        this.generateSimpleCondition()
      ]
    };
  }

  private static getPermissionsForRole(role: string): string[] {
    const permissionMap: { [key: string]: string[] } = {
      'super-admin': [
        'system:*',
        'user:*',
        'policy:*',
        'role:*',
        'report:*',
        'finance:*',
        'inventory:*',
        'procurement:*'
      ],
      'department-manager': [
        'user:read',
        'user:write',
        'report:read',
        'inventory:read',
        'inventory:write',
        'staff:manage'
      ],
      'financial-manager': [
        'finance:read',
        'finance:write',
        'report:read',
        'report:write',
        'approval:financial',
        'budget:manage'
      ],
      'purchasing-staff': [
        'procurement:read',
        'procurement:write',
        'vendor:read',
        'vendor:write',
        'purchase-request:create',
        'purchase-order:create'
      ],
      'staff': [
        'basic:read',
        'profile:write',
        'request:create'
      ]
    };

    return permissionMap[role] || permissionMap['staff'];
  }

  private static generatePermissionSet(): string[] {
    const allPermissions = [
      'user:read', 'user:write', 'user:delete',
      'policy:read', 'policy:write', 'policy:delete',
      'role:read', 'role:write', 'role:delete',
      'report:read', 'report:write',
      'finance:read', 'finance:write',
      'inventory:read', 'inventory:write',
      'procurement:read', 'procurement:write',
      'vendor:read', 'vendor:write'
    ];

    const permissionCount = this.getRandomNumber(2, 8);
    const permissions: string[] = [];
    
    for (let i = 0; i < permissionCount; i++) {
      const permission = this.getRandomChoice(allPermissions);
      if (!permissions.includes(permission)) {
        permissions.push(permission);
      }
    }

    return permissions;
  }

  // Random data generators
  private static getRandomFirstName(): string {
    const names = [
      'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
      'Iris', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia', 'Peter',
      'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
      'Yuki', 'Zoe'
    ];
    return this.getRandomChoice(names);
  }

  private static getRandomLastName(): string {
    const names = [
      'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia',
      'Harris', 'Johnson', 'Kim', 'Lopez', 'Martinez', 'Nielsen', 'O\'Brien',
      'Patel', 'Rodriguez', 'Smith', 'Thompson', 'Williams', 'Zhang'
    ];
    return this.getRandomChoice(names);
  }

  private static getRandomDepartment(): string {
    const departments = [
      'Kitchen', 'Front Office', 'Finance', 'Procurement', 
      'Housekeeping', 'Security', 'Maintenance', 'HR'
    ];
    return this.getRandomChoice(departments);
  }

  private static getRandomLocation(): string {
    const locations = [
      'Hotel Main', 'Hotel North', 'Restaurant Downtown', 
      'Conference Center', 'Spa & Wellness', 'Catering Kitchen'
    ];
    return this.getRandomChoice(locations);
  }

  private static getRandomPolicyName(): string {
    const prefixes = ['Access Control', 'Security', 'Workflow', 'Data Protection', 'Operational'];
    const suffixes = ['Standard', 'Enhanced', 'Basic', 'Advanced', 'Premium'];
    return `${this.getRandomChoice(prefixes)} ${this.getRandomChoice(suffixes)}`;
  }

  private static getRandomPolicyDescription(): string {
    const descriptions = [
      'Controls access to sensitive financial data and operations',
      'Manages workflow permissions for department staff members',
      'Restricts access to confidential guest information',
      'Governs procurement and purchasing authorization levels',
      'Regulates inventory management and stock control access',
      'Defines security clearance for restricted areas',
      'Sets permissions for report generation and viewing',
      'Controls administrative function access'
    ];
    return this.getRandomChoice(descriptions);
  }

  private static getRandomRoleName(): string {
    const roles = [
      'Manager', 'Supervisor', 'Coordinator', 'Specialist', 
      'Assistant', 'Lead', 'Senior', 'Junior'
    ];
    return this.getRandomChoice(roles);
  }

  private static getRandomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static getRandomBoolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  }

  // Cleanup methods
  static cleanup(): void {
    this.counter = 0;
  }

  // Utility methods for test data validation
  static validateUser(user: TestUser): boolean {
    return !!(
      user.id &&
      user.email &&
      user.firstName &&
      user.lastName &&
      user.role &&
      user.department &&
      user.permissions &&
      Array.isArray(user.permissions)
    );
  }

  static validatePolicy(policy: TestPolicy): boolean {
    return !!(
      policy.id &&
      policy.name &&
      policy.description &&
      typeof policy.priority === 'number' &&
      ['permit', 'deny'].includes(policy.effect) &&
      Array.isArray(policy.conditions)
    );
  }

  static validateRole(role: TestRole): boolean {
    return !!(
      role.id &&
      role.name &&
      role.department &&
      Array.isArray(role.permissions) &&
      typeof role.userCount === 'number'
    );
  }
}

// Type definitions
export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  location: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestPolicy {
  id: string;
  name: string;
  description: string;
  priority: number;
  effect: 'permit' | 'deny';
  enabled: boolean;
  conditions: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TestRole {
  id: string;
  name: string;
  description: string;
  department: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  users: TestUser[];
  policies: TestPolicy[];
  roles: TestRole[];
  expectedOutcome: string;
  preconditions: string[];
  validationRules: string[];
}

export default TestDataFactory;