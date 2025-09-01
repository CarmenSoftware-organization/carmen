#!/usr/bin/env node

/**
 * Carmen ERP User Data Transformation Script for Keycloak Migration
 * 
 * This script transforms exported Carmen user data into Keycloak-compatible format.
 * 
 * Features:
 * - Transforms user profiles to Keycloak user format
 * - Maps Carmen roles to Keycloak roles
 * - Creates group memberships for departments/locations
 * - Generates user attributes
 * - Validates data integrity
 * - Provides comprehensive logging
 */

const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream, createWriteStream } = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuration
const CONFIG = {
    inputPath: '/tmp',
    outputPath: '/tmp/keycloak_import',
    logPath: '/tmp/keycloak_migration_logs',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    requiredFiles: [
        'carmen_users_export.csv',
        'carmen_user_roles_export.csv',
        'carmen_departments_export.csv',
        'carmen_locations_export.csv',
        'carmen_user_attributes_export.csv',
        'carmen_migration_summary.csv'
    ]
};

// Logger utility
class MigrationLogger {
    constructor(logPath) {
        this.logPath = logPath;
        this.logFile = path.join(logPath, `user_transformation_${Date.now()}.log`);
    }

    async init() {
        await fs.mkdir(this.logPath, { recursive: true });
        await this.log('INFO', 'Migration logger initialized');
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
        
        // Also log to console
        console.log(`[${timestamp}] ${level}: ${message}`);
        if (data) {
            console.log('Data:', data);
        }
    }
}

// Data transformer class
class UserDataTransformer {
    constructor(logger) {
        this.logger = logger;
        this.stats = {
            usersProcessed: 0,
            rolesCreated: 0,
            groupsCreated: 0,
            attributesGenerated: 0,
            errors: 0,
            warnings: 0
        };
        this.users = [];
        this.roles = [];
        this.departments = [];
        this.locations = [];
        this.userAttributes = [];
    }

    async loadData() {
        await this.logger.log('INFO', 'Starting data loading phase');
        
        try {
            // Load users
            this.users = await this.loadCsvFile('carmen_users_export.csv');
            await this.logger.log('INFO', `Loaded ${this.users.length} users`);

            // Load user roles
            this.userRoles = await this.loadCsvFile('carmen_user_roles_export.csv');
            await this.logger.log('INFO', `Loaded ${this.userRoles.length} user role assignments`);

            // Load departments
            this.departments = await this.loadCsvFile('carmen_departments_export.csv');
            await this.logger.log('INFO', `Loaded ${this.departments.length} departments`);

            // Load locations
            this.locations = await this.loadCsvFile('carmen_locations_export.csv');
            await this.logger.log('INFO', `Loaded ${this.locations.length} locations`);

            // Load user attributes
            this.userAttributes = await this.loadCsvFile('carmen_user_attributes_export.csv');
            await this.logger.log('INFO', `Loaded ${this.userAttributes.length} user attribute sets`);

            // Load migration summary
            this.migrationSummary = await this.loadCsvFile('carmen_migration_summary.csv');
            await this.logger.log('INFO', 'Migration summary loaded', this.migrationSummary[0]);

        } catch (error) {
            await this.logger.log('ERROR', 'Failed to load data', { error: error.message });
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

    async transformUsers() {
        await this.logger.log('INFO', 'Starting user transformation');
        const transformedUsers = [];

        for (const user of this.users) {
            try {
                const keycloakUser = await this.transformSingleUser(user);
                transformedUsers.push(keycloakUser);
                this.stats.usersProcessed++;
            } catch (error) {
                await this.logger.log('ERROR', `Failed to transform user ${user.email}`, { 
                    error: error.message,
                    user: user 
                });
                this.stats.errors++;
            }
        }

        await this.logger.log('INFO', `Transformed ${transformedUsers.length} users`);
        return transformedUsers;
    }

    async transformSingleUser(user) {
        // Find user attributes
        const userAttrs = this.userAttributes.find(attr => attr.user_id === user.user_id);
        const attributes = userAttrs ? JSON.parse(userAttrs.keycloak_attributes) : {};

        // Find user role details
        const userRoleDetails = this.userRoles.find(role => role.user_id === user.user_id);

        return {
            // Basic Keycloak user structure
            id: user.user_id,
            username: user.email.toLowerCase(),
            email: user.email.toLowerCase(),
            emailVerified: true,
            firstName: user.first_name,
            lastName: user.last_name,
            enabled: user.keycloak_status === 'ENABLED',
            
            // Account metadata
            createdTimestamp: new Date(user.created_at).getTime(),
            
            // User attributes (Keycloak custom attributes)
            attributes: {
                // Carmen-specific attributes
                carmenUserId: [user.user_id],
                primaryRole: [user.primary_role_id],
                primaryDepartment: [user.primary_department || ''],
                primaryLocation: [user.primary_location || ''],
                fullName: [user.full_name],
                accountType: ['carmen_migrated'],
                migrationDate: [new Date().toISOString().split('T')[0]],
                
                // Role hierarchy information
                roleHierarchy: userRoleDetails ? [userRoleDetails.role_hierarchy.toString()] : ['10'],
                
                // Additional attributes from export
                ...Object.keys(attributes).reduce((acc, key) => {
                    if (attributes[key] !== null && attributes[key] !== '') {
                        acc[key] = [attributes[key].toString()];
                    }
                    return acc;
                }, {})
            },

            // Groups (will be populated by group assignment)
            groups: this.generateUserGroups(user),

            // Client roles (will be populated by role assignment)
            clientRoles: {
                'carmen-erp': this.mapCarmenRolesToKeycloak(user.primary_role_id, userRoleDetails)
            },

            // Realm roles
            realmRoles: this.getRealmRoles(user.primary_role_id),

            // Required actions (force password reset on first login)
            requiredActions: ['UPDATE_PASSWORD'],

            // Credentials (empty - users will need to set password)
            credentials: []
        };
    }

    generateUserGroups(user) {
        const groups = [];
        
        // Add department group
        if (user.primary_department) {
            groups.push(`/departments/${user.primary_department.toLowerCase().replace(/\s+/g, '-')}`);
        }
        
        // Add location group
        if (user.primary_location) {
            groups.push(`/locations/${user.primary_location.toLowerCase().replace(/\s+/g, '-')}`);
        }
        
        // Add role-based group
        groups.push(`/roles/${user.primary_role_id}`);
        
        return groups;
    }

    mapCarmenRolesToKeycloak(primaryRoleId, roleDetails) {
        const roleMapping = {
            'admin': ['system_administrator'],
            'chef': ['chef', 'staff'],
            'purchasing-staff': ['purchasing_staff', 'staff'],
            'general-manager': ['general_manager', 'department_manager', 'staff'],
            'finance-director': ['finance_director', 'financial_manager', 'staff'],
            'procurement-manager': ['procurement_manager', 'purchasing_staff', 'staff'],
            'inventory-manager': ['inventory_manager', 'inventory_staff', 'staff'],
            'department-manager': ['department_manager', 'staff'],
            'head-chef': ['head_chef', 'chef', 'staff'],
            'financial-manager': ['financial_manager', 'staff'],
            'inventory-staff': ['inventory_staff', 'staff'],
            'staff': ['staff']
        };

        // Get base roles for this user
        let roles = roleMapping[primaryRoleId] || ['staff'];

        // Add inherited roles if available
        if (roleDetails && roleDetails.primary_role_permissions) {
            const permissions = roleDetails.primary_role_permissions;
            if (permissions.includes('*')) {
                roles.push('system_administrator');
            }
        }

        return roles;
    }

    getRealmRoles(primaryRoleId) {
        // Only top-level roles get realm roles
        const realmRoleMapping = {
            'admin': ['admin'],
            'general-manager': ['user'],
            'finance-director': ['user'],
            'staff': ['user']
        };

        return realmRoleMapping[primaryRoleId] || ['user'];
    }

    async transformGroups() {
        await this.logger.log('INFO', 'Starting group transformation');
        const groups = [];

        // Create department groups
        for (const dept of this.departments) {
            groups.push({
                name: dept.dept_name,
                path: `/departments/${dept.dept_id.toLowerCase().replace(/\s+/g, '-')}`,
                attributes: {
                    type: ['department'],
                    carmenId: [dept.dept_id],
                    userCount: [dept.user_count.toString()],
                    description: [dept.description || `Department: ${dept.dept_name}`]
                },
                subGroups: []
            });
        }

        // Create location groups
        for (const location of this.locations) {
            groups.push({
                name: location.location_name,
                path: `/locations/${location.location_id.toLowerCase().replace(/\s+/g, '-')}`,
                attributes: {
                    type: ['location'],
                    carmenId: [location.location_id],
                    userCount: [location.user_count.toString()],
                    description: [location.description || `Location: ${location.location_name}`]
                },
                subGroups: []
            });
        }

        // Create role groups
        const roleGroups = [
            'system_administrator',
            'general_manager',
            'finance_director',
            'procurement_manager',
            'inventory_manager',
            'department_manager',
            'head_chef',
            'financial_manager',
            'purchasing_staff',
            'inventory_staff',
            'chef',
            'staff'
        ];

        for (const role of roleGroups) {
            groups.push({
                name: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                path: `/roles/${role}`,
                attributes: {
                    type: ['role_group'],
                    roleId: [role],
                    description: [`Users with ${role} role`]
                },
                subGroups: []
            });
        }

        this.stats.groupsCreated = groups.length;
        await this.logger.log('INFO', `Created ${groups.length} groups`);
        return groups;
    }

    async validateTransformedData(users, groups) {
        await this.logger.log('INFO', 'Starting data validation');
        const validationResults = {
            valid: true,
            issues: [],
            warnings: []
        };

        // Validate users
        for (const user of users) {
            // Check required fields
            if (!user.username || !user.email) {
                validationResults.issues.push(`User ${user.id} missing username or email`);
                validationResults.valid = false;
            }

            // Check email format
            if (user.email && !user.email.includes('@')) {
                validationResults.issues.push(`User ${user.id} has invalid email format`);
                validationResults.valid = false;
            }

            // Check attributes
            if (!user.attributes.carmenUserId) {
                validationResults.warnings.push(`User ${user.email} missing Carmen user ID`);
                this.stats.warnings++;
            }

            // Validate group paths exist
            for (const groupPath of user.groups) {
                const groupExists = groups.some(g => g.path === groupPath);
                if (!groupExists) {
                    validationResults.issues.push(`User ${user.email} assigned to non-existent group: ${groupPath}`);
                    validationResults.valid = false;
                }
            }
        }

        // Validate groups
        for (const group of groups) {
            if (!group.name || !group.path) {
                validationResults.issues.push(`Group missing name or path: ${JSON.stringify(group)}`);
                validationResults.valid = false;
            }
        }

        await this.logger.log('INFO', 'Validation completed', validationResults);
        return validationResults;
    }

    async saveTransformedData(users, groups) {
        await this.logger.log('INFO', 'Starting data save phase');
        
        // Ensure output directory exists
        await fs.mkdir(CONFIG.outputPath, { recursive: true });

        // Save users
        const usersOutput = {
            users: users,
            metadata: {
                exportDate: new Date().toISOString(),
                sourceSystem: 'carmen-erp',
                totalUsers: users.length,
                migrationVersion: '1.0.0'
            }
        };
        
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'keycloak_users_import.json'),
            JSON.stringify(usersOutput, null, 2)
        );

        // Save groups
        const groupsOutput = {
            groups: groups,
            metadata: {
                exportDate: new Date().toISOString(),
                sourceSystem: 'carmen-erp',
                totalGroups: groups.length,
                migrationVersion: '1.0.0'
            }
        };
        
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'keycloak_groups_import.json'),
            JSON.stringify(groupsOutput, null, 2)
        );

        // Save transformation statistics
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'transformation_stats.json'),
            JSON.stringify(this.stats, null, 2)
        );

        await this.logger.log('INFO', 'Data saved successfully', {
            usersFile: 'keycloak_users_import.json',
            groupsFile: 'keycloak_groups_import.json',
            statsFile: 'transformation_stats.json'
        });
    }

    async generatePasswordResetList(users) {
        const passwordResetList = users.map(user => ({
            username: user.username,
            email: user.email,
            fullName: `${user.firstName} ${user.lastName}`,
            department: user.attributes.primaryDepartment[0],
            location: user.attributes.primaryLocation[0],
            role: user.attributes.primaryRole[0],
            resetRequired: true,
            migrationDate: new Date().toISOString().split('T')[0]
        }));

        await fs.writeFile(
            path.join(CONFIG.outputPath, 'password_reset_list.json'),
            JSON.stringify(passwordResetList, null, 2)
        );

        // Also create CSV for easy review
        const csvHeader = 'username,email,fullName,department,location,role,resetRequired,migrationDate\n';
        const csvData = passwordResetList.map(user => 
            `${user.username},${user.email},"${user.fullName}",${user.department},${user.location},${user.role},${user.resetRequired},${user.migrationDate}`
        ).join('\n');
        
        await fs.writeFile(
            path.join(CONFIG.outputPath, 'password_reset_list.csv'),
            csvHeader + csvData
        );

        await this.logger.log('INFO', `Generated password reset list for ${passwordResetList.length} users`);
    }
}

// Main execution function
async function main() {
    const logger = new MigrationLogger(CONFIG.logPath);
    await logger.init();
    
    await logger.log('INFO', 'Starting Carmen to Keycloak user data transformation');
    await logger.log('INFO', 'Configuration', CONFIG);

    try {
        const transformer = new UserDataTransformer(logger);
        
        // Load data from CSV files
        await transformer.loadData();
        
        // Transform users
        const transformedUsers = await transformer.transformUsers();
        
        // Transform groups
        const transformedGroups = await transformer.transformGroups();
        
        // Validate transformed data
        const validationResults = await transformer.validateTransformedData(transformedUsers, transformedGroups);
        
        if (!validationResults.valid) {
            await logger.log('ERROR', 'Data validation failed', validationResults);
            throw new Error('Data validation failed');
        }
        
        if (validationResults.warnings.length > 0) {
            await logger.log('WARN', 'Data validation completed with warnings', validationResults.warnings);
        }
        
        // Save transformed data
        await transformer.saveTransformedData(transformedUsers, transformedGroups);
        
        // Generate password reset list
        await transformer.generatePasswordResetList(transformedUsers);
        
        // Final statistics
        await logger.log('INFO', 'Transformation completed successfully', transformer.stats);
        
        console.log('\n=== TRANSFORMATION SUMMARY ===');
        console.log(`Users processed: ${transformer.stats.usersProcessed}`);
        console.log(`Groups created: ${transformer.stats.groupsCreated}`);
        console.log(`Errors: ${transformer.stats.errors}`);
        console.log(`Warnings: ${transformer.stats.warnings}`);
        console.log(`\nOutput files created in: ${CONFIG.outputPath}`);
        console.log('- keycloak_users_import.json');
        console.log('- keycloak_groups_import.json');
        console.log('- password_reset_list.json');
        console.log('- password_reset_list.csv');
        console.log('- transformation_stats.json');
        
    } catch (error) {
        await logger.log('ERROR', 'Transformation failed', { error: error.message });
        console.error('Transformation failed:', error.message);
        process.exit(1);
    }
}

// Run the transformation
if (require.main === module) {
    main();
}

module.exports = { UserDataTransformer, MigrationLogger };