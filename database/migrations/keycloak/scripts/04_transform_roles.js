#!/usr/bin/env node

/**
 * Carmen ERP Role and Permission Transformation Script for Keycloak Migration
 * 
 * This script transforms Carmen role definitions into Keycloak-compatible roles,
 * permissions, and authorization policies.
 * 
 * Features:
 * - Transforms Carmen roles to Keycloak realm and client roles
 * - Creates composite role relationships
 * - Maps permissions to Keycloak scopes and resources
 * - Generates authorization policies
 * - Creates resource server configuration
 */

const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

// Configuration
const CONFIG = {
    inputPath: '/tmp',
    outputPath: '/tmp/keycloak_import',
    logPath: '/tmp/keycloak_migration_logs',
    clientId: 'carmen-erp',
    requiredFiles: [
        'carmen_comprehensive_roles_export.csv',
        'carmen_permission_scopes_export.csv',
        'carmen_role_inheritance_export.csv',
        'carmen_department_role_mappings_export.csv'
    ]
};

// Logger utility (reusing from transform_users.js)
class MigrationLogger {
    constructor(logPath) {
        this.logPath = logPath;
        this.logFile = path.join(logPath, `role_transformation_${Date.now()}.log`);
    }

    async init() {
        await fs.mkdir(this.logPath, { recursive: true });
        await this.log('INFO', 'Role transformation logger initialized');
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(this.logFile, logLine);
        
        console.log(`[${timestamp}] ${level}: ${message}`);
        if (data) {
            console.log('Data:', data);
        }
    }
}

// Role transformer class
class RoleDataTransformer {
    constructor(logger) {
        this.logger = logger;
        this.stats = {
            realmRolesCreated: 0,
            clientRolesCreated: 0,
            compositeRolesCreated: 0,
            permissionScopesCreated: 0,
            resourcesCreated: 0,
            policiesCreated: 0,
            errors: 0,
            warnings: 0
        };
        this.roles = [];
        this.permissionScopes = [];
        this.roleInheritance = [];
        this.departmentMappings = [];
    }

    async loadData() {
        await this.logger.log('INFO', 'Starting role data loading phase');
        
        try {
            // Load comprehensive roles
            this.roles = await this.loadCsvFile('carmen_comprehensive_roles_export.csv');
            await this.logger.log('INFO', `Loaded ${this.roles.length} role definitions`);

            // Load permission scopes
            this.permissionScopes = await this.loadCsvFile('carmen_permission_scopes_export.csv');
            await this.logger.log('INFO', `Loaded ${this.permissionScopes.length} permission scopes`);

            // Load role inheritance
            this.roleInheritance = await this.loadCsvFile('carmen_role_inheritance_export.csv');
            await this.logger.log('INFO', `Loaded ${this.roleInheritance.length} role inheritance relationships`);

            // Load department mappings
            this.departmentMappings = await this.loadCsvFile('carmen_department_role_mappings_export.csv');
            await this.logger.log('INFO', `Loaded ${this.departmentMappings.length} department role mappings`);

        } catch (error) {
            await this.logger.log('ERROR', 'Failed to load role data', { error: error.message });
            throw error;
        }
    }

    async loadCsvFile(filename) {
        const filePath = path.join(CONFIG.inputPath, filename);
        const data = [];
        
        return new Promise((resolve, reject) => {
            createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => data.push(row))
                .on('end', () => resolve(data))
                .on('error', reject);
        });
    }

    async transformRealmRoles() {
        await this.logger.log('INFO', 'Transforming realm roles');
        const realmRoles = [];

        // Create realm roles (high-level administrative roles)
        const realmRoleTypes = this.roles.filter(role => role.role_type === 'REALM');
        
        for (const role of realmRoleTypes) {
            const realmRole = {
                name: role.keycloak_role_name,
                description: role.description,
                composite: false, // Will be set to true if has composites
                composites: {
                    realm: [],
                    client: {}
                },
                attributes: this.parseRoleAttributes(role.role_attributes)
            };

            // Check if this role has child roles (making it composite)
            const hasChildren = this.roleInheritance.some(inherit => 
                inherit.parent_role_name === role.keycloak_role_name
            );

            if (hasChildren) {
                realmRole.composite = true;
                const children = this.roleInheritance.filter(inherit => 
                    inherit.parent_role_name === role.keycloak_role_name
                );
                
                for (const child of children) {
                    const childRole = this.roles.find(r => r.keycloak_role_name === child.child_role_name);
                    if (childRole) {
                        if (childRole.role_type === 'REALM') {
                            realmRole.composites.realm.push(child.child_role_name);
                        } else {
                            if (!realmRole.composites.client[CONFIG.clientId]) {
                                realmRole.composites.client[CONFIG.clientId] = [];
                            }
                            realmRole.composites.client[CONFIG.clientId].push(child.child_role_name);
                        }
                    }
                }
            }

            realmRoles.push(realmRole);
            this.stats.realmRolesCreated++;
        }

        // Add default Keycloak realm roles
        realmRoles.push(
            {
                name: 'user',
                description: 'Default user role',
                composite: false,
                attributes: {}
            },
            {
                name: 'admin',
                description: 'Administrator role',
                composite: true,
                composites: {
                    realm: ['user'],
                    client: {
                        [CONFIG.clientId]: ['system_administrator']
                    }
                },
                attributes: {}
            }
        );

        await this.logger.log('INFO', `Created ${realmRoles.length} realm roles`);
        return realmRoles;
    }

    async transformClientRoles() {
        await this.logger.log('INFO', 'Transforming client roles');
        const clientRoles = [];

        // Create client roles (application-specific roles)
        const clientRoleTypes = this.roles.filter(role => role.role_type === 'CLIENT');
        
        for (const role of clientRoleTypes) {
            const permissions = role.permissions_list ? role.permissions_list.split('|') : [];
            
            const clientRole = {
                name: role.keycloak_role_name,
                description: role.description,
                composite: false,
                composites: {
                    realm: [],
                    client: {}
                },
                attributes: {
                    ...this.parseRoleAttributes(role.role_attributes),
                    // Add permission information as attributes
                    permissions: permissions,
                    hierarchyLevel: [role.hierarchy_level.toString()],
                    carmenRoleId: [role.role_id],
                    isSystemRole: [role.is_system_role]
                }
            };

            // Check for composite relationships
            const parentRoles = role.parent_roles_list ? role.parent_roles_list.split(',') : [];
            if (parentRoles.length > 0) {
                clientRole.composite = true;
                
                for (const parentRoleId of parentRoles) {
                    const parentRole = this.roles.find(r => r.role_id === parentRoleId);
                    if (parentRole) {
                        if (parentRole.role_type === 'REALM') {
                            clientRole.composites.realm.push(parentRole.keycloak_role_name);
                        } else {
                            if (!clientRole.composites.client[CONFIG.clientId]) {
                                clientRole.composites.client[CONFIG.clientId] = [];
                            }
                            clientRole.composites.client[CONFIG.clientId].push(parentRole.keycloak_role_name);
                        }
                    }
                }
            }

            clientRoles.push(clientRole);
            this.stats.clientRolesCreated++;
        }

        await this.logger.log('INFO', `Created ${clientRoles.length} client roles`);
        return clientRoles;
    }

    parseRoleAttributes(attributesString) {
        try {
            const attributes = JSON.parse(attributesString || '{}');
            const keycloakAttributes = {};
            
            // Convert each attribute to Keycloak format (array of strings)
            for (const [key, value] of Object.entries(attributes)) {
                if (value !== null && value !== undefined) {
                    keycloakAttributes[key] = [value.toString()];
                }
            }
            
            return keycloakAttributes;
        } catch (error) {
            return {};
        }
    }

    async transformAuthorizationResources() {
        await this.logger.log('INFO', 'Creating authorization resources');
        const resources = [];
        const resourceTypes = new Set();

        // Create resources based on permission scopes
        for (const scope of this.permissionScopes) {
            resourceTypes.add(scope.keycloak_resource);
        }

        for (const resourceType of resourceTypes) {
            const relatedScopes = this.permissionScopes
                .filter(s => s.keycloak_resource === resourceType)
                .map(s => s.keycloak_scope);

            const resource = {
                name: resourceType,
                type: resourceType,
                uris: [`/${resourceType}/*`],
                scopes: [...new Set(relatedScopes)].map(scope => ({
                    name: scope
                })),
                attributes: {
                    description: `${resourceType} resource for Carmen ERP`,
                    category: [this.categorizeResource(resourceType)]
                }
            };

            resources.push(resource);
            this.stats.resourcesCreated++;
        }

        await this.logger.log('INFO', `Created ${resources.length} authorization resources`);
        return resources;
    }

    categorizeResource(resourceType) {
        const categories = {
            procurement: 'business_process',
            inventory: 'business_process',
            vendor_management: 'business_process',
            culinary: 'business_process',
            finance: 'business_process',
            user_management: 'system_administration',
            reporting: 'analytics',
            workflow: 'system_administration'
        };
        
        return categories[resourceType] || 'general';
    }

    async transformAuthorizationScopes() {
        await this.logger.log('INFO', 'Creating authorization scopes');
        const scopes = new Set();

        // Collect all unique scopes
        for (const permScope of this.permissionScopes) {
            scopes.add(permScope.keycloak_scope);
        }

        const scopeObjects = Array.from(scopes).map(scope => ({
            name: scope,
            displayName: scope.charAt(0).toUpperCase() + scope.slice(1).replace(/_/g, ' '),
            iconUri: this.getScopeIcon(scope)
        }));

        this.stats.permissionScopesCreated = scopeObjects.length;
        await this.logger.log('INFO', `Created ${scopeObjects.length} authorization scopes`);
        return scopeObjects;
    }

    getScopeIcon(scope) {
        const icons = {
            read: 'fa fa-eye',
            create: 'fa fa-plus',
            update: 'fa fa-edit',
            delete: 'fa fa-trash',
            approve: 'fa fa-check',
            manage: 'fa fa-cogs',
            admin: 'fa fa-user-shield'
        };
        
        return icons[scope] || 'fa fa-key';
    }

    async transformAuthorizationPolicies() {
        await this.logger.log('INFO', 'Creating authorization policies');
        const policies = [];

        // Create role-based policies
        for (const role of this.roles) {
            const policy = {
                name: `${role.keycloak_role_name}_policy`,
                description: `Policy for ${role.display_name}`,
                type: 'role',
                logic: 'POSITIVE',
                decisionStrategy: 'UNANIMOUS',
                config: {
                    roles: JSON.stringify([{
                        id: role.keycloak_role_name,
                        required: true
                    }])
                }
            };

            policies.push(policy);
        }

        // Create department-based policies
        for (const deptMapping of this.departmentMappings) {
            const policy = {
                name: `${deptMapping.department.toLowerCase()}_department_policy`,
                description: `Policy for ${deptMapping.department} department`,
                type: 'group',
                logic: 'POSITIVE',
                decisionStrategy: 'UNANIMOUS',
                config: {
                    groups: JSON.stringify([{
                        path: `/departments/${deptMapping.department.toLowerCase().replace(/\s+/g, '-')}`,
                        extendChildren: false
                    }])
                }
            };

            policies.push(policy);
        }

        // Create hierarchy-based policies
        const hierarchyPolicy = {
            name: 'hierarchy_based_policy',
            description: 'Policy based on role hierarchy',
            type: 'js',
            logic: 'POSITIVE',
            decisionStrategy: 'UNANIMOUS',
            config: {
                code: `
                    // Check user's role hierarchy level
                    var hierarchyLevel = $evaluation.getContext().getAttributes().getValue('hierarchyLevel');
                    var requiredLevel = $evaluation.getPermission().getResource().getAttribute('minHierarchyLevel');
                    
                    if (hierarchyLevel && requiredLevel) {
                        var userLevel = parseInt(hierarchyLevel.asString(0));
                        var minLevel = parseInt(requiredLevel.asString(0));
                        $evaluation.grant(userLevel <= minLevel);
                    } else {
                        $evaluation.deny();
                    }
                `
            }
        };

        policies.push(hierarchyPolicy);
        this.stats.policiesCreated = policies.length;

        await this.logger.log('INFO', `Created ${policies.length} authorization policies`);
        return policies;
    }

    async transformPermissions() {
        await this.logger.log('INFO', 'Creating permissions');
        const permissions = [];

        // Create resource-based permissions
        const resourceTypes = new Set(this.permissionScopes.map(s => s.keycloak_resource));
        
        for (const resourceType of resourceTypes) {
            const resourceScopes = this.permissionScopes
                .filter(s => s.keycloak_resource === resourceType)
                .map(s => s.keycloak_scope);

            for (const scope of [...new Set(resourceScopes)]) {
                const relatedRoles = this.permissionScopes
                    .filter(s => s.keycloak_resource === resourceType && s.keycloak_scope === scope)
                    .flatMap(s => s.roles_with_permission.split(','));

                const permission = {
                    name: `${resourceType}_${scope}_permission`,
                    description: `Permission to ${scope} ${resourceType}`,
                    type: 'scope',
                    logic: 'POSITIVE',
                    decisionStrategy: 'UNANIMOUS',
                    resources: [resourceType],
                    scopes: [scope],
                    policies: relatedRoles.map(role => `${role}_policy`).concat([
                        'hierarchy_based_policy'
                    ])
                };

                permissions.push(permission);
            }
        }

        await this.logger.log('INFO', `Created ${permissions.length} permissions`);
        return permissions;
    }

    async createKeycloakClientConfiguration() {
        await this.logger.log('INFO', 'Creating Keycloak client configuration');
        
        const resources = await this.transformAuthorizationResources();
        const scopes = await this.transformAuthorizationScopes();
        const policies = await this.transformAuthorizationPolicies();
        const permissions = await this.transformPermissions();

        const clientConfig = {
            clientId: CONFIG.clientId,
            name: 'Carmen ERP',
            description: 'Carmen ERP System Client',
            enabled: true,
            clientAuthenticatorType: 'client-secret',
            redirectUris: [
                'http://localhost:3000/*',
                'https://carmen.example.com/*'
            ],
            webOrigins: [
                'http://localhost:3000',
                'https://carmen.example.com'
            ],
            protocol: 'openid-connect',
            attributes: {
                'saml.assertion.signature': 'false',
                'saml.force.post.binding': 'false',
                'saml.multivalued.roles': 'false',
                'saml.encrypt': 'false',
                'saml.server.signature': 'false',
                'saml.server.signature.keyinfo.ext': 'false',
                'exclude.session.state.from.auth.response': 'false',
                'saml_force_name_id_format': 'false',
                'saml.client.signature': 'false',
                'tls.client.certificate.bound.access.tokens': 'false',
                'saml.authnstatement': 'false',
                'display.on.consent.screen': 'false',
                'saml.onetimeuse.condition': 'false'
            },
            authenticationFlowBindingOverrides: {},
            fullScopeAllowed: true,
            nodeReRegistrationTimeout: -1,
            protocolMappers: [
                {
                    name: 'carmen-role-mapper',
                    protocol: 'openid-connect',
                    protocolMapper: 'oidc-usermodel-client-role-mapper',
                    consentRequired: false,
                    config: {
                        'usermodel.clientRoleMapping.clientId': CONFIG.clientId,
                        'claim.name': 'roles',
                        'access.token.claim': 'true',
                        'id.token.claim': 'true'
                    }
                },
                {
                    name: 'carmen-attributes-mapper',
                    protocol: 'openid-connect',
                    protocolMapper: 'oidc-usermodel-attribute-mapper',
                    consentRequired: false,
                    config: {
                        'userinfo.token.claim': 'true',
                        'user.attribute': 'primaryDepartment',
                        'id.token.claim': 'true',
                        'access.token.claim': 'true',
                        'claim.name': 'department',
                        'jsonType.label': 'String'
                    }
                }
            ],
            defaultClientScopes: [
                'web-origins',
                'profile',
                'roles',
                'email'
            ],
            optionalClientScopes: [
                'address',
                'phone',
                'offline_access',
                'microprofile-jwt'
            ],
            authorizationServicesEnabled: true,
            authorizationSettings: {
                allowRemoteResourceManagement: true,
                policyEnforcementMode: 'ENFORCING',
                decisionStrategy: 'UNANIMOUS',
                resources: resources,
                policies: policies,
                scopes: scopes,
                permissions: permissions
            }
        };

        return clientConfig;
    }

    async saveTransformedData(realmRoles, clientRoles, clientConfig) {
        await this.logger.log('INFO', 'Saving transformed role data');
        
        // Ensure output directory exists
        await fs.mkdir(CONFIG.outputPath, { recursive: true });

        // Save realm roles
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'keycloak_realm_roles.json'),
            JSON.stringify({
                roles: realmRoles,
                metadata: {
                    exportDate: new Date().toISOString(),
                    sourceSystem: 'carmen-erp',
                    totalRoles: realmRoles.length,
                    migrationVersion: '1.0.0'
                }
            }, null, 2)
        );

        // Save client roles
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'keycloak_client_roles.json'),
            JSON.stringify({
                clientId: CONFIG.clientId,
                roles: clientRoles,
                metadata: {
                    exportDate: new Date().toISOString(),
                    sourceSystem: 'carmen-erp',
                    totalRoles: clientRoles.length,
                    migrationVersion: '1.0.0'
                }
            }, null, 2)
        );

        // Save client configuration
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'keycloak_client_config.json'),
            JSON.stringify(clientConfig, null, 2)
        );

        // Save transformation statistics
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'role_transformation_stats.json'),
            JSON.stringify(this.stats, null, 2)
        );

        await this.logger.log('INFO', 'Role transformation data saved successfully', {
            realmRolesFile: 'keycloak_realm_roles.json',
            clientRolesFile: 'keycloak_client_roles.json',
            clientConfigFile: 'keycloak_client_config.json',
            statsFile: 'role_transformation_stats.json'
        });
    }
}

// Main execution function
async function main() {
    const logger = new MigrationLogger(CONFIG.logPath);
    await logger.init();
    
    await logger.log('INFO', 'Starting Carmen to Keycloak role transformation');
    await logger.log('INFO', 'Configuration', CONFIG);

    try {
        const transformer = new RoleDataTransformer(logger);
        
        // Load data from CSV files
        await transformer.loadData();
        
        // Transform realm roles
        const realmRoles = await transformer.transformRealmRoles();
        
        // Transform client roles
        const clientRoles = await transformer.transformClientRoles();
        
        // Create client configuration with authorization settings
        const clientConfig = await transformer.createKeycloakClientConfiguration();
        
        // Save transformed data
        await transformer.saveTransformedData(realmRoles, clientRoles, clientConfig);
        
        // Final statistics
        await logger.log('INFO', 'Role transformation completed successfully', transformer.stats);
        
        console.log('\n=== ROLE TRANSFORMATION SUMMARY ===');
        console.log(`Realm roles created: ${transformer.stats.realmRolesCreated}`);
        console.log(`Client roles created: ${transformer.stats.clientRolesCreated}`);
        console.log(`Authorization resources: ${transformer.stats.resourcesCreated}`);
        console.log(`Permission scopes: ${transformer.stats.permissionScopesCreated}`);
        console.log(`Authorization policies: ${transformer.stats.policiesCreated}`);
        console.log(`Errors: ${transformer.stats.errors}`);
        console.log(`Warnings: ${transformer.stats.warnings}`);
        console.log(`\nOutput files created in: ${CONFIG.outputPath}`);
        console.log('- keycloak_realm_roles.json');
        console.log('- keycloak_client_roles.json');
        console.log('- keycloak_client_config.json');
        console.log('- role_transformation_stats.json');
        
    } catch (error) {
        await logger.log('ERROR', 'Role transformation failed', { error: error.message });
        console.error('Role transformation failed:', error.message);
        process.exit(1);
    }
}

// Run the transformation
if (require.main === module) {
    main();
}

module.exports = { RoleDataTransformer };