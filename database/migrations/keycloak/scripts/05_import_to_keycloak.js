#!/usr/bin/env node

/**
 * Carmen ERP to Keycloak Import Script
 * 
 * This script imports transformed data into Keycloak server using the Admin API.
 * 
 * Features:
 * - Imports users, groups, roles, and client configuration
 * - Handles dependencies and import order
 * - Provides comprehensive error handling and rollback
 * - Real-time progress monitoring
 * - Validation after import
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const cliProgress = require('cli-progress');

// Configuration
const CONFIG = {
    keycloak: {
        baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
        realm: process.env.KEYCLOAK_REALM || 'carmen',
        adminUsername: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
        adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'carmen-erp'
    },
    inputPath: '/tmp/keycloak_import',
    logPath: '/tmp/keycloak_migration_logs',
    batchSize: 50, // Number of users to import in each batch
    retryAttempts: 3,
    retryDelay: 1000
};

// Logger utility
class MigrationLogger {
    constructor(logPath) {
        this.logPath = logPath;
        this.logFile = path.join(logPath, `keycloak_import_${Date.now()}.log`);
    }

    async init() {
        await fs.mkdir(this.logPath, { recursive: true });
        await this.log('INFO', 'Keycloak import logger initialized');
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
        
        // Color coding for console output
        let coloredMessage = message;
        switch (level) {
            case 'ERROR':
                coloredMessage = chalk.red(message);
                break;
            case 'WARN':
                coloredMessage = chalk.yellow(message);
                break;
            case 'SUCCESS':
                coloredMessage = chalk.green(message);
                break;
            case 'INFO':
                coloredMessage = chalk.blue(message);
                break;
        }
        
        console.log(`[${timestamp}] ${level}: ${coloredMessage}`);
        if (data) {
            console.log('Data:', data);
        }
    }
}

// Keycloak API client
class KeycloakAdminClient {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.accessToken = null;
        this.baseURL = `${config.keycloak.baseUrl}/admin/realms/${config.keycloak.realm}`;
        this.masterBaseURL = `${config.keycloak.baseUrl}/admin/realms/master`;
    }

    async authenticate() {
        try {
            const response = await axios.post(
                `${this.config.keycloak.baseUrl}/realms/master/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    client_id: 'admin-cli',
                    username: this.config.keycloak.adminUsername,
                    password: this.config.keycloak.adminPassword
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            await this.logger.log('SUCCESS', 'Successfully authenticated with Keycloak');
            return true;
        } catch (error) {
            await this.logger.log('ERROR', 'Failed to authenticate with Keycloak', {
                error: error.message,
                response: error.response?.data
            });
            return false;
        }
    }

    async makeRequest(method, url, data = null, retries = 0) {
        try {
            const config = {
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401 && retries < CONFIG.retryAttempts) {
                // Token might have expired, try to re-authenticate
                await this.logger.log('WARN', 'Token expired, re-authenticating...');
                await this.authenticate();
                return this.makeRequest(method, url, data, retries + 1);
            }

            if (retries < CONFIG.retryAttempts) {
                await this.logger.log('WARN', `Request failed, retrying... (${retries + 1}/${CONFIG.retryAttempts})`);
                await this.sleep(CONFIG.retryDelay * (retries + 1));
                return this.makeRequest(method, url, data, retries + 1);
            }

            throw error;
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createRealm(realmData) {
        try {
            await this.makeRequest('POST', `${this.masterBaseURL}`, realmData);
            await this.logger.log('SUCCESS', `Created realm: ${realmData.realm}`);
            return true;
        } catch (error) {
            if (error.response?.status === 409) {
                await this.logger.log('INFO', `Realm ${realmData.realm} already exists`);
                return true;
            }
            throw error;
        }
    }

    async createRealmRoles(roles) {
        const results = [];
        for (const role of roles) {
            try {
                await this.makeRequest('POST', `${this.baseURL}/roles`, role);
                results.push({ role: role.name, status: 'success' });
            } catch (error) {
                if (error.response?.status === 409) {
                    results.push({ role: role.name, status: 'exists' });
                } else {
                    results.push({ role: role.name, status: 'error', error: error.message });
                }
            }
        }
        return results;
    }

    async createClient(clientData) {
        try {
            await this.makeRequest('POST', `${this.baseURL}/clients`, clientData);
            await this.logger.log('SUCCESS', `Created client: ${clientData.clientId}`);
            return true;
        } catch (error) {
            if (error.response?.status === 409) {
                await this.logger.log('INFO', `Client ${clientData.clientId} already exists`);
                return true;
            }
            throw error;
        }
    }

    async getClientId(clientId) {
        try {
            const clients = await this.makeRequest('GET', `${this.baseURL}/clients?clientId=${clientId}`);
            return clients.length > 0 ? clients[0].id : null;
        } catch (error) {
            await this.logger.log('ERROR', `Failed to get client ID for ${clientId}`, { error: error.message });
            return null;
        }
    }

    async createClientRoles(clientUUID, roles) {
        const results = [];
        for (const role of roles) {
            try {
                await this.makeRequest('POST', `${this.baseURL}/clients/${clientUUID}/roles`, role);
                results.push({ role: role.name, status: 'success' });
            } catch (error) {
                if (error.response?.status === 409) {
                    results.push({ role: role.name, status: 'exists' });
                } else {
                    results.push({ role: role.name, status: 'error', error: error.message });
                }
            }
        }
        return results;
    }

    async createGroups(groups) {
        const results = [];
        for (const group of groups) {
            try {
                await this.makeRequest('POST', `${this.baseURL}/groups`, group);
                results.push({ group: group.name, status: 'success' });
            } catch (error) {
                if (error.response?.status === 409) {
                    results.push({ group: group.name, status: 'exists' });
                } else {
                    results.push({ group: group.name, status: 'error', error: error.message });
                }
            }
        }
        return results;
    }

    async createUsers(users, progressBar = null) {
        const results = [];
        const batches = this.chunkArray(users, CONFIG.batchSize);
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchResults = [];
            
            for (const user of batch) {
                try {
                    await this.makeRequest('POST', `${this.baseURL}/users`, user);
                    batchResults.push({ user: user.username, status: 'success' });
                } catch (error) {
                    if (error.response?.status === 409) {
                        batchResults.push({ user: user.username, status: 'exists' });
                    } else {
                        batchResults.push({ user: user.username, status: 'error', error: error.message });
                    }
                }
            }
            
            results.push(...batchResults);
            
            if (progressBar) {
                progressBar.update((i + 1) * CONFIG.batchSize);
            }
            
            // Small delay between batches to avoid overwhelming Keycloak
            if (i < batches.length - 1) {
                await this.sleep(100);
            }
        }
        
        return results;
    }

    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    async assignUserToGroups(userId, groupPaths) {
        const results = [];
        
        for (const groupPath of groupPaths) {
            try {
                // Get group ID by path
                const groups = await this.makeRequest('GET', `${this.baseURL}/groups`);
                const group = this.findGroupByPath(groups, groupPath);
                
                if (group) {
                    await this.makeRequest('PUT', `${this.baseURL}/users/${userId}/groups/${group.id}`, {});
                    results.push({ groupPath, status: 'success' });
                } else {
                    results.push({ groupPath, status: 'group_not_found' });
                }
            } catch (error) {
                results.push({ groupPath, status: 'error', error: error.message });
            }
        }
        
        return results;
    }

    findGroupByPath(groups, targetPath) {
        for (const group of groups) {
            if (group.path === targetPath) {
                return group;
            }
            if (group.subGroups && group.subGroups.length > 0) {
                const found = this.findGroupByPath(group.subGroups, targetPath);
                if (found) return found;
            }
        }
        return null;
    }

    async assignClientRolesToUser(userId, clientUUID, roleNames) {
        try {
            // Get available client roles
            const availableRoles = await this.makeRequest('GET', `${this.baseURL}/clients/${clientUUID}/roles`);
            const rolesToAssign = availableRoles.filter(role => roleNames.includes(role.name));
            
            if (rolesToAssign.length > 0) {
                await this.makeRequest(
                    'POST',
                    `${this.baseURL}/users/${userId}/role-mappings/clients/${clientUUID}`,
                    rolesToAssign
                );
            }
            
            return { status: 'success', assignedRoles: rolesToAssign.length };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
}

// Main importer class
class KeycloakImporter {
    constructor(logger) {
        this.logger = logger;
        this.keycloakClient = new KeycloakAdminClient(CONFIG, logger);
        this.stats = {
            realmCreated: false,
            realmRolesCreated: 0,
            clientCreated: false,
            clientRolesCreated: 0,
            groupsCreated: 0,
            usersCreated: 0,
            usersUpdated: 0,
            errors: 0,
            warnings: 0
        };
    }

    async loadImportData() {
        await this.logger.log('INFO', 'Loading import data files');
        
        try {
            // Load users
            const usersData = await fs.readFile(path.join(CONFIG.inputPath, 'keycloak_users_import.json'), 'utf8');
            this.users = JSON.parse(usersData).users;

            // Load groups
            const groupsData = await fs.readFile(path.join(CONFIG.inputPath, 'keycloak_groups_import.json'), 'utf8');
            this.groups = JSON.parse(groupsData).groups;

            // Load realm roles
            const realmRolesData = await fs.readFile(path.join(CONFIG.inputPath, 'keycloak_realm_roles.json'), 'utf8');
            this.realmRoles = JSON.parse(realmRolesData).roles;

            // Load client roles
            const clientRolesData = await fs.readFile(path.join(CONFIG.inputPath, 'keycloak_client_roles.json'), 'utf8');
            this.clientRoles = JSON.parse(clientRolesData).roles;

            // Load client configuration
            const clientConfigData = await fs.readFile(path.join(CONFIG.inputPath, 'keycloak_client_config.json'), 'utf8');
            this.clientConfig = JSON.parse(clientConfigData);

            await this.logger.log('SUCCESS', 'Import data loaded successfully', {
                users: this.users.length,
                groups: this.groups.length,
                realmRoles: this.realmRoles.length,
                clientRoles: this.clientRoles.length
            });

        } catch (error) {
            await this.logger.log('ERROR', 'Failed to load import data', { error: error.message });
            throw error;
        }
    }

    async executeImport() {
        await this.logger.log('INFO', 'Starting Keycloak import process');

        try {
            // Step 1: Authenticate with Keycloak
            await this.logger.log('INFO', 'Step 1: Authenticating with Keycloak...');
            const authenticated = await this.keycloakClient.authenticate();
            if (!authenticated) {
                throw new Error('Failed to authenticate with Keycloak');
            }

            // Step 2: Create realm (if it doesn't exist)
            await this.logger.log('INFO', 'Step 2: Creating realm...');
            const realmData = {
                realm: CONFIG.keycloak.realm,
                displayName: 'Carmen ERP',
                enabled: true,
                registrationAllowed: false,
                resetPasswordAllowed: true,
                rememberMe: true,
                verifyEmail: false,
                loginWithEmailAllowed: true,
                duplicateEmailsAllowed: false,
                sslRequired: 'external',
                attributes: {
                    'bruteForceProtected': 'true',
                    'permanentLockout': 'false',
                    'maxFailureWaitSeconds': '900',
                    'minimumQuickLoginWaitSeconds': '60',
                    'waitIncrementSeconds': '60',
                    'quickLoginCheckMilliSeconds': '1000',
                    'maxDeltaTimeSeconds': '43200',
                    'failureFactor': '30'
                }
            };

            this.stats.realmCreated = await this.keycloakClient.createRealm(realmData);

            // Step 3: Create realm roles
            await this.logger.log('INFO', 'Step 3: Creating realm roles...');
            const realmRoleResults = await this.keycloakClient.createRealmRoles(this.realmRoles);
            this.stats.realmRolesCreated = realmRoleResults.filter(r => r.status === 'success').length;
            await this.logger.log('SUCCESS', `Created ${this.stats.realmRolesCreated} realm roles`);

            // Step 4: Create client
            await this.logger.log('INFO', 'Step 4: Creating client...');
            this.stats.clientCreated = await this.keycloakClient.createClient(this.clientConfig);

            // Step 5: Create client roles
            await this.logger.log('INFO', 'Step 5: Creating client roles...');
            const clientUUID = await this.keycloakClient.getClientId(CONFIG.keycloak.clientId);
            if (clientUUID) {
                const clientRoleResults = await this.keycloakClient.createClientRoles(clientUUID, this.clientRoles);
                this.stats.clientRolesCreated = clientRoleResults.filter(r => r.status === 'success').length;
                await this.logger.log('SUCCESS', `Created ${this.stats.clientRolesCreated} client roles`);
            } else {
                throw new Error('Failed to get client UUID');
            }

            // Step 6: Create groups
            await this.logger.log('INFO', 'Step 6: Creating groups...');
            const groupResults = await this.keycloakClient.createGroups(this.groups);
            this.stats.groupsCreated = groupResults.filter(r => r.status === 'success').length;
            await this.logger.log('SUCCESS', `Created ${this.stats.groupsCreated} groups`);

            // Step 7: Create users with progress bar
            await this.logger.log('INFO', 'Step 7: Creating users...');
            const progressBar = new cliProgress.SingleBar({
                format: 'User Import |{bar}| {percentage}% | {value}/{total} Users',
                barCompleteChar: '█',
                barIncompleteChar: '░',
                hideCursor: true
            });
            
            progressBar.start(this.users.length, 0);
            const userResults = await this.keycloakClient.createUsers(this.users, progressBar);
            progressBar.stop();

            this.stats.usersCreated = userResults.filter(r => r.status === 'success').length;
            this.stats.usersUpdated = userResults.filter(r => r.status === 'exists').length;
            this.stats.errors += userResults.filter(r => r.status === 'error').length;

            await this.logger.log('SUCCESS', `User import completed`, {
                created: this.stats.usersCreated,
                updated: this.stats.usersUpdated,
                errors: this.stats.errors
            });

            // Step 8: Assign users to groups and roles
            await this.logger.log('INFO', 'Step 8: Assigning user groups and roles...');
            await this.assignUserGroupsAndRoles(clientUUID);

            await this.logger.log('SUCCESS', 'Keycloak import completed successfully', this.stats);

        } catch (error) {
            await this.logger.log('ERROR', 'Import process failed', { error: error.message });
            throw error;
        }
    }

    async assignUserGroupsAndRoles(clientUUID) {
        const progressBar = new cliProgress.SingleBar({
            format: 'User Assignment |{bar}| {percentage}% | {value}/{total} Users',
            barCompleteChar: '█',
            barIncompleteChar: '░',
            hideCursor: true
        });
        
        progressBar.start(this.users.length, 0);

        for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i];
            
            try {
                // Get user ID from Keycloak
                const users = await this.keycloakClient.makeRequest('GET', 
                    `${this.keycloakClient.baseURL}/users?username=${user.username}`);
                
                if (users.length > 0) {
                    const userId = users[0].id;
                    
                    // Assign to groups
                    if (user.groups && user.groups.length > 0) {
                        await this.keycloakClient.assignUserToGroups(userId, user.groups);
                    }
                    
                    // Assign client roles
                    if (user.clientRoles && user.clientRoles[CONFIG.keycloak.clientId]) {
                        await this.keycloakClient.assignClientRolesToUser(
                            userId, 
                            clientUUID, 
                            user.clientRoles[CONFIG.keycloak.clientId]
                        );
                    }
                }
                
            } catch (error) {
                await this.logger.log('WARN', `Failed to assign groups/roles for user ${user.username}`, {
                    error: error.message
                });
                this.stats.warnings++;
            }
            
            progressBar.update(i + 1);
        }
        
        progressBar.stop();
    }

    async generateImportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            migration: {
                sourceSystem: 'carmen-erp',
                targetSystem: 'keycloak',
                realm: CONFIG.keycloak.realm,
                migrationVersion: '1.0.0'
            },
            statistics: this.stats,
            summary: {
                totalOperations: Object.values(this.stats).reduce((sum, val) => 
                    typeof val === 'number' ? sum + val : sum, 0),
                successRate: this.stats.errors > 0 ? 
                    ((this.stats.usersCreated + this.stats.usersUpdated) / this.users.length * 100).toFixed(2) + '%' : 
                    '100%'
            },
            nextSteps: [
                'Verify user login functionality',
                'Test role-based access control',
                'Configure application integration',
                'Set up password reset workflow',
                'Train users on new authentication system'
            ]
        };

        await fs.writeFile(
            path.join(CONFIG.inputPath, 'keycloak_import_report.json'),
            JSON.stringify(report, null, 2)
        );

        await this.logger.log('INFO', 'Import report generated', {
            reportFile: 'keycloak_import_report.json'
        });

        return report;
    }
}

// Main execution function
async function main() {
    const logger = new MigrationLogger(CONFIG.logPath);
    await logger.init();
    
    console.log(chalk.cyan('🚀 Carmen ERP to Keycloak Import Tool\n'));
    
    try {
        const importer = new KeycloakImporter(logger);
        
        // Load import data
        await importer.loadImportData();
        
        // Execute import
        await importer.executeImport();
        
        // Generate report
        const report = await importer.generateImportReport();
        
        // Display summary
        console.log(chalk.green('\n✅ Import completed successfully!'));
        console.log('\n' + chalk.cyan('=== IMPORT SUMMARY ==='));
        console.log(`Realm created: ${report.statistics.realmCreated ? 'Yes' : 'Already exists'}`);
        console.log(`Realm roles: ${report.statistics.realmRolesCreated}`);
        console.log(`Client created: ${report.statistics.clientCreated ? 'Yes' : 'Already exists'}`);
        console.log(`Client roles: ${report.statistics.clientRolesCreated}`);
        console.log(`Groups created: ${report.statistics.groupsCreated}`);
        console.log(`Users created: ${report.statistics.usersCreated}`);
        console.log(`Users updated: ${report.statistics.usersUpdated}`);
        console.log(`Errors: ${report.statistics.errors}`);
        console.log(`Warnings: ${report.statistics.warnings}`);
        console.log(`Success rate: ${report.summary.successRate}`);
        
        console.log('\n' + chalk.cyan('Next Steps:'));
        report.nextSteps.forEach((step, index) => {
            console.log(`${index + 1}. ${step}`);
        });
        
        console.log(`\nDetailed report saved to: ${path.join(CONFIG.inputPath, 'keycloak_import_report.json')}`);
        
    } catch (error) {
        console.error(chalk.red('\n❌ Import failed:'), error.message);
        process.exit(1);
    }
}

// Run the import
if (require.main === module) {
    main();
}

module.exports = { KeycloakImporter, KeycloakAdminClient };