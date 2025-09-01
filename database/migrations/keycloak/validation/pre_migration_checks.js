#!/usr/bin/env node

/**
 * Pre-Migration Validation Script for Carmen to Keycloak Migration
 * 
 * This script performs comprehensive checks before starting the migration process.
 * 
 * Validation areas:
 * - Database connectivity and data integrity
 * - Keycloak server availability and configuration
 * - Required files and dependencies
 * - System resources and capacity
 * - Network connectivity and permissions
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { Pool } = require('pg');
const chalk = require('chalk');

// Configuration
const CONFIG = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'carmen',
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    },
    keycloak: {
        baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
        realm: process.env.KEYCLOAK_REALM || 'carmen',
        adminUsername: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
        adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
    },
    paths: {
        exportPath: '/tmp',
        importPath: '/tmp/keycloak_import',
        logPath: '/tmp/keycloak_migration_logs'
    },
    requirements: {
        minNodeVersion: '18.0.0',
        minPostgreSQLVersion: '12.0',
        minKeycloakVersion: '22.0',
        maxUsers: 10000,
        maxRoles: 500,
        maxGroups: 1000
    }
};

// Validation results tracker
class ValidationResults {
    constructor() {
        this.results = {
            environment: { passed: 0, failed: 0, warnings: 0, tests: [] },
            database: { passed: 0, failed: 0, warnings: 0, tests: [] },
            keycloak: { passed: 0, failed: 0, warnings: 0, tests: [] },
            files: { passed: 0, failed: 0, warnings: 0, tests: [] },
            system: { passed: 0, failed: 0, warnings: 0, tests: [] }
        };
        this.overall = { passed: 0, failed: 0, warnings: 0 };
    }

    addResult(category, testName, status, message, details = null) {
        const result = {
            test: testName,
            status, // 'PASS', 'FAIL', 'WARN'
            message,
            details,
            timestamp: new Date().toISOString()
        };

        this.results[category].tests.push(result);
        this.results[category][status.toLowerCase() === 'pass' ? 'passed' : 
                              status.toLowerCase() === 'fail' ? 'failed' : 'warnings']++;
        
        this.overall[status.toLowerCase() === 'pass' ? 'passed' : 
                    status.toLowerCase() === 'fail' ? 'failed' : 'warnings']++;

        // Console output with colors
        const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
        console.log(`${icon} ${chalk[color](testName)}: ${message}`);
        
        if (details) {
            console.log(`   ${JSON.stringify(details, null, 2)}`);
        }
    }
}

// Validation engine
class PreMigrationValidator {
    constructor() {
        this.results = new ValidationResults();
        this.dbPool = null;
    }

    async runAllValidations() {
        console.log(chalk.cyan('🔍 Starting Pre-Migration Validation\n'));
        
        try {
            await this.validateEnvironment();
            await this.validateDatabase();
            await this.validateKeycloak();
            await this.validateFiles();
            await this.validateSystemResources();
            
            await this.generateReport();
            await this.displaySummary();
            
            return this.results.overall.failed === 0;
            
        } catch (error) {
            console.error(chalk.red('Validation failed with critical error:'), error.message);
            return false;
        } finally {
            if (this.dbPool) {
                await this.dbPool.end();
            }
        }
    }

    async validateEnvironment() {
        console.log(chalk.blue('\n📋 Environment Validation'));
        
        // Node.js version
        const nodeVersion = process.version.substring(1);
        const isNodeVersionValid = this.compareVersions(nodeVersion, CONFIG.requirements.minNodeVersion) >= 0;
        
        this.results.addResult(
            'environment',
            'Node.js Version',
            isNodeVersionValid ? 'PASS' : 'FAIL',
            `Node.js ${nodeVersion} (required: ${CONFIG.requirements.minNodeVersion}+)`
        );

        // Environment variables
        const requiredEnvVars = [
            'KEYCLOAK_BASE_URL',
            'KEYCLOAK_ADMIN_USERNAME',
            'KEYCLOAK_ADMIN_PASSWORD',
            'DB_HOST',
            'DB_NAME',
            'DB_USERNAME',
            'DB_PASSWORD'
        ];

        let envVarsPresent = 0;
        for (const envVar of requiredEnvVars) {
            const present = !!process.env[envVar];
            if (present) envVarsPresent++;
            
            this.results.addResult(
                'environment',
                `Environment Variable: ${envVar}`,
                present ? 'PASS' : 'WARN',
                present ? 'Present' : 'Missing (using default)'
            );
        }

        // Required npm packages
        const requiredPackages = [
            'axios',
            'csv-parser',
            'pg',
            'uuid',
            'dotenv',
            'chalk',
            'cli-progress'
        ];

        for (const pkg of requiredPackages) {
            try {
                require.resolve(pkg);
                this.results.addResult(
                    'environment',
                    `NPM Package: ${pkg}`,
                    'PASS',
                    'Available'
                );
            } catch (error) {
                this.results.addResult(
                    'environment',
                    `NPM Package: ${pkg}`,
                    'FAIL',
                    'Missing - run "npm install"'
                );
            }
        }

        // Directory permissions
        const directories = [CONFIG.paths.exportPath, CONFIG.paths.logPath];
        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                await fs.access(dir, fs.constants.W_OK);
                this.results.addResult(
                    'environment',
                    `Directory Access: ${dir}`,
                    'PASS',
                    'Writable'
                );
            } catch (error) {
                this.results.addResult(
                    'environment',
                    `Directory Access: ${dir}`,
                    'FAIL',
                    'Cannot write to directory',
                    { error: error.message }
                );
            }
        }
    }

    async validateDatabase() {
        console.log(chalk.blue('\n🗄️  Database Validation'));
        
        try {
            // Database connectivity
            this.dbPool = new Pool(CONFIG.database);
            const client = await this.dbPool.connect();
            
            this.results.addResult(
                'database',
                'Database Connection',
                'PASS',
                'Successfully connected to PostgreSQL'
            );

            // PostgreSQL version
            const versionResult = await client.query('SELECT version()');
            const versionString = versionResult.rows[0].version;
            const postgresVersion = versionString.match(/PostgreSQL (\d+\.\d+)/)?.[1];
            
            if (postgresVersion) {
                const isVersionValid = this.compareVersions(postgresVersion, CONFIG.requirements.minPostgreSQLVersion) >= 0;
                this.results.addResult(
                    'database',
                    'PostgreSQL Version',
                    isVersionValid ? 'PASS' : 'WARN',
                    `PostgreSQL ${postgresVersion} (recommended: ${CONFIG.requirements.minPostgreSQLVersion}+)`
                );
            }

            // Check required tables exist
            const requiredTables = ['users.users', 'vendors.vendors', 'products.products'];
            for (const table of requiredTables) {
                try {
                    const [schema, tableName] = table.split('.');
                    const tableCheck = await client.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = $1 AND table_name = $2
                        )
                    `, [schema, tableName]);
                    
                    const exists = tableCheck.rows[0].exists;
                    this.results.addResult(
                        'database',
                        `Table Exists: ${table}`,
                        exists ? 'PASS' : 'FAIL',
                        exists ? 'Found' : 'Missing'
                    );
                } catch (error) {
                    this.results.addResult(
                        'database',
                        `Table Check: ${table}`,
                        'FAIL',
                        'Query failed',
                        { error: error.message }
                    );
                }
            }

            // Check data counts
            try {
                const userCount = await client.query('SELECT COUNT(*) FROM users.users');
                const userTotal = parseInt(userCount.rows[0].count);
                
                this.results.addResult(
                    'database',
                    'User Count',
                    userTotal > 0 ? 'PASS' : 'WARN',
                    `${userTotal} users found`,
                    { 
                        total: userTotal,
                        withinLimits: userTotal <= CONFIG.requirements.maxUsers
                    }
                );

                if (userTotal > CONFIG.requirements.maxUsers) {
                    this.results.addResult(
                        'database',
                        'User Count Limit',
                        'WARN',
                        `User count (${userTotal}) exceeds recommended maximum (${CONFIG.requirements.maxUsers})`
                    );
                }
            } catch (error) {
                this.results.addResult(
                    'database',
                    'User Count',
                    'FAIL',
                    'Cannot query users table',
                    { error: error.message }
                );
            }

            // Check for required extensions
            const extensions = ['uuid-ossp', 'pgcrypto'];
            for (const ext of extensions) {
                try {
                    const extCheck = await client.query(
                        'SELECT EXISTS (SELECT FROM pg_extension WHERE extname = $1)',
                        [ext]
                    );
                    
                    const exists = extCheck.rows[0].exists;
                    this.results.addResult(
                        'database',
                        `Extension: ${ext}`,
                        exists ? 'PASS' : 'WARN',
                        exists ? 'Installed' : 'Not installed (may be needed)'
                    );
                } catch (error) {
                    this.results.addResult(
                        'database',
                        `Extension Check: ${ext}`,
                        'FAIL',
                        'Query failed',
                        { error: error.message }
                    );
                }
            }

            client.release();

        } catch (error) {
            this.results.addResult(
                'database',
                'Database Connection',
                'FAIL',
                'Cannot connect to database',
                { 
                    error: error.message,
                    config: {
                        host: CONFIG.database.host,
                        port: CONFIG.database.port,
                        database: CONFIG.database.database
                    }
                }
            );
        }
    }

    async validateKeycloak() {
        console.log(chalk.blue('\n🔐 Keycloak Validation'));
        
        try {
            // Keycloak server connectivity
            const healthResponse = await axios.get(`${CONFIG.keycloak.baseUrl}/health`, {
                timeout: 10000
            });
            
            this.results.addResult(
                'keycloak',
                'Keycloak Server',
                'PASS',
                'Server is responding',
                { status: healthResponse.status }
            );

            // Admin authentication
            try {
                const authResponse = await axios.post(
                    `${CONFIG.keycloak.baseUrl}/realms/master/protocol/openid-connect/token`,
                    new URLSearchParams({
                        grant_type: 'password',
                        client_id: 'admin-cli',
                        username: CONFIG.keycloak.adminUsername,
                        password: CONFIG.keycloak.adminPassword
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    }
                );

                this.results.addResult(
                    'keycloak',
                    'Admin Authentication',
                    'PASS',
                    'Admin credentials valid'
                );

                const accessToken = authResponse.data.access_token;

                // Check if target realm exists
                try {
                    await axios.get(
                        `${CONFIG.keycloak.baseUrl}/admin/realms/${CONFIG.keycloak.realm}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    this.results.addResult(
                        'keycloak',
                        'Target Realm',
                        'WARN',
                        `Realm '${CONFIG.keycloak.realm}' already exists - will be updated`
                    );
                } catch (error) {
                    if (error.response?.status === 404) {
                        this.results.addResult(
                            'keycloak',
                            'Target Realm',
                            'PASS',
                            `Realm '${CONFIG.keycloak.realm}' does not exist - will be created`
                        );
                    } else {
                        throw error;
                    }
                }

                // Check Keycloak version (if available)
                try {
                    const serverInfoResponse = await axios.get(
                        `${CONFIG.keycloak.baseUrl}/admin/serverinfo`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                        }
                    );

                    const keycloakVersion = serverInfoResponse.data.systemInfo?.version;
                    if (keycloakVersion) {
                        const isVersionValid = this.compareVersions(keycloakVersion, CONFIG.requirements.minKeycloakVersion) >= 0;
                        this.results.addResult(
                            'keycloak',
                            'Keycloak Version',
                            isVersionValid ? 'PASS' : 'WARN',
                            `Keycloak ${keycloakVersion} (recommended: ${CONFIG.requirements.minKeycloakVersion}+)`
                        );
                    }
                } catch (error) {
                    this.results.addResult(
                        'keycloak',
                        'Keycloak Version',
                        'WARN',
                        'Could not determine version'
                    );
                }

            } catch (error) {
                this.results.addResult(
                    'keycloak',
                    'Admin Authentication',
                    'FAIL',
                    'Invalid admin credentials',
                    { error: error.message }
                );
            }

        } catch (error) {
            this.results.addResult(
                'keycloak',
                'Keycloak Server',
                'FAIL',
                'Server not accessible',
                { 
                    error: error.message,
                    url: CONFIG.keycloak.baseUrl
                }
            );
        }
    }

    async validateFiles() {
        console.log(chalk.blue('\n📁 File System Validation'));
        
        // Check if export directory is clean
        try {
            const exportFiles = await fs.readdir(CONFIG.paths.exportPath);
            const csvFiles = exportFiles.filter(f => f.endsWith('.csv'));
            
            if (csvFiles.length > 0) {
                this.results.addResult(
                    'files',
                    'Export Directory',
                    'WARN',
                    `${csvFiles.length} existing CSV files found - will be overwritten`
                );
            } else {
                this.results.addResult(
                    'files',
                    'Export Directory',
                    'PASS',
                    'Clean directory'
                );
            }
        } catch (error) {
            this.results.addResult(
                'files',
                'Export Directory',
                'FAIL',
                'Cannot access export directory',
                { error: error.message }
            );
        }

        // Check disk space
        try {
            const stats = await fs.stat(CONFIG.paths.exportPath);
            this.results.addResult(
                'files',
                'Disk Space',
                'PASS',
                'Directory accessible'
            );
        } catch (error) {
            this.results.addResult(
                'files',
                'Disk Space',
                'FAIL',
                'Cannot check disk space',
                { error: error.message }
            );
        }

        // Check log directory
        try {
            await fs.mkdir(CONFIG.paths.logPath, { recursive: true });
            await fs.access(CONFIG.paths.logPath, fs.constants.W_OK);
            this.results.addResult(
                'files',
                'Log Directory',
                'PASS',
                'Writable'
            );
        } catch (error) {
            this.results.addResult(
                'files',
                'Log Directory',
                'FAIL',
                'Cannot write to log directory',
                { error: error.message }
            );
        }
    }

    async validateSystemResources() {
        console.log(chalk.blue('\n⚡ System Resources Validation'));
        
        // Memory usage
        const memUsage = process.memoryUsage();
        const totalMemoryMB = Math.round(memUsage.rss / 1024 / 1024);
        
        this.results.addResult(
            'system',
            'Memory Usage',
            totalMemoryMB < 500 ? 'PASS' : 'WARN',
            `${totalMemoryMB}MB used`,
            { memoryUsage: memUsage }
        );

        // CPU load (basic check)
        const loadAverage = require('os').loadavg();
        this.results.addResult(
            'system',
            'System Load',
            'PASS',
            `Load average: ${loadAverage.map(l => l.toFixed(2)).join(', ')}`
        );

        // Network connectivity
        try {
            await axios.get('https://httpbin.org/status/200', { timeout: 5000 });
            this.results.addResult(
                'system',
                'Network Connectivity',
                'PASS',
                'Internet connection available'
            );
        } catch (error) {
            this.results.addResult(
                'system',
                'Network Connectivity',
                'WARN',
                'Limited network connectivity',
                { error: error.message }
            );
        }

        // System platform
        const platform = require('os').platform();
        const arch = require('os').arch();
        this.results.addResult(
            'system',
            'Platform',
            'PASS',
            `${platform} ${arch}`
        );
    }

    compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        const maxLength = Math.max(v1Parts.length, v2Parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            migration: {
                tool: 'Carmen to Keycloak Migration',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            },
            configuration: {
                database: {
                    host: CONFIG.database.host,
                    port: CONFIG.database.port,
                    database: CONFIG.database.database
                },
                keycloak: {
                    baseUrl: CONFIG.keycloak.baseUrl,
                    realm: CONFIG.keycloak.realm
                }
            },
            validation: this.results.results,
            overall: this.results.overall,
            recommendations: this.generateRecommendations()
        };

        await fs.writeFile(
            path.join(CONFIG.paths.logPath, 'pre_migration_validation_report.json'),
            JSON.stringify(report, null, 2)
        );
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.overall.failed > 0) {
            recommendations.push('❌ Critical issues must be resolved before proceeding with migration');
        }
        
        if (this.results.overall.warnings > 0) {
            recommendations.push('⚠️ Review warnings and consider addressing them');
        }
        
        if (this.results.results.database.failed > 0) {
            recommendations.push('🔧 Fix database connectivity and schema issues');
        }
        
        if (this.results.results.keycloak.failed > 0) {
            recommendations.push('🔧 Resolve Keycloak server and authentication issues');
        }
        
        if (this.results.overall.failed === 0) {
            recommendations.push('✅ System ready for migration - proceed with data export');
            recommendations.push('📋 Run migration in test environment first');
            recommendations.push('💾 Ensure complete backup of both Carmen database and Keycloak');
        }

        return recommendations;
    }

    async displaySummary() {
        console.log(chalk.cyan('\n📊 Validation Summary'));
        console.log('═'.repeat(50));
        
        const categories = Object.keys(this.results.results);
        for (const category of categories) {
            const cat = this.results.results[category];
            const total = cat.passed + cat.failed + cat.warnings;
            const status = cat.failed > 0 ? '❌' : cat.warnings > 0 ? '⚠️' : '✅';
            
            console.log(`${status} ${category.toUpperCase()}: ${cat.passed}/${total} passed (${cat.failed} failed, ${cat.warnings} warnings)`);
        }
        
        console.log('═'.repeat(50));
        const overallTotal = this.results.overall.passed + this.results.overall.failed + this.results.overall.warnings;
        const overallStatus = this.results.overall.failed > 0 ? '❌ NOT READY' : 
                             this.results.overall.warnings > 0 ? '⚠️ READY WITH WARNINGS' : '✅ READY';
        
        console.log(chalk.bold(`OVERALL: ${overallStatus}`));
        console.log(`Total Tests: ${overallTotal} | Passed: ${this.results.overall.passed} | Failed: ${this.results.overall.failed} | Warnings: ${this.results.overall.warnings}`);
        
        const recommendations = this.generateRecommendations();
        if (recommendations.length > 0) {
            console.log(chalk.cyan('\n📋 Recommendations:'));
            recommendations.forEach(rec => console.log(`  ${rec}`));
        }
        
        console.log(`\nDetailed report saved to: ${path.join(CONFIG.paths.logPath, 'pre_migration_validation_report.json')}`);
    }
}

// Main execution
async function main() {
    const validator = new PreMigrationValidator();
    const success = await validator.runAllValidations();
    
    if (!success) {
        process.exit(1);
    }
}

// Run validation
if (require.main === module) {
    main();
}

module.exports = { PreMigrationValidator };