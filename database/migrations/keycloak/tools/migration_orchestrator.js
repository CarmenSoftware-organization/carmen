#!/usr/bin/env node

/**
 * Carmen to Keycloak Migration Orchestrator
 * 
 * This is the main orchestrator script that coordinates the entire migration process
 * from Carmen ERP to Keycloak, ensuring proper execution order, error handling,
 * and rollback capabilities.
 * 
 * Features:
 * - Complete migration workflow orchestration
 * - Interactive prompts for safety
 * - Real-time progress monitoring
 * - Comprehensive error handling and rollback
 * - Post-migration validation
 * - Detailed reporting
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');
const cliProgress = require('cli-progress');

// Import validation and migration modules
const { PreMigrationValidator } = require('../validation/pre_migration_checks.js');

// Configuration
const CONFIG = {
    scriptsPath: path.join(__dirname, '../scripts'),
    validationPath: path.join(__dirname, '../validation'),
    rollbackPath: path.join(__dirname, '../rollback'),
    logPath: '/tmp/keycloak_migration_logs',
    outputPath: '/tmp/keycloak_import',
    interactive: true,
    autoConfirm: false
};

// Migration steps configuration
const MIGRATION_STEPS = [
    {
        name: 'Pre-Migration Validation',
        script: '../validation/pre_migration_checks.js',
        required: true,
        description: 'Validates system requirements and connectivity',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Database Export - Users',
        script: '01_export_users.sql',
        required: true,
        description: 'Exports user data from Carmen database',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Database Export - Roles & Permissions',
        script: '02_export_roles_permissions.sql',
        required: true,
        description: 'Exports role and permission definitions',
        estimatedTime: '1 minute'
    },
    {
        name: 'Data Transformation - Users',
        script: '03_transform_users.js',
        required: true,
        description: 'Transforms user data to Keycloak format',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Data Transformation - Roles',
        script: '04_transform_roles.js',
        required: true,
        description: 'Transforms role data to Keycloak format',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Keycloak Import',
        script: '05_import_to_keycloak.js',
        required: true,
        description: 'Imports data into Keycloak server',
        estimatedTime: '5-10 minutes'
    },
    {
        name: 'Post-Migration Validation',
        script: '../validation/post_migration_validation.js',
        required: true,
        description: 'Validates migration success and data integrity',
        estimatedTime: '3-5 minutes'
    }
];

// Logger utility
class MigrationLogger {
    constructor(logPath) {
        this.logPath = logPath;
        this.logFile = path.join(logPath, `migration_orchestrator_${Date.now()}.log`);
        this.stepLogs = [];
    }

    async init() {
        await fs.mkdir(this.logPath, { recursive: true });
        await this.log('INFO', 'Migration orchestrator initialized');
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        this.stepLogs.push(logEntry);
        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(this.logFile, logLine);
    }

    async saveStepLog(stepName, success, output, error = null) {
        const stepLog = {
            step: stepName,
            timestamp: new Date().toISOString(),
            success,
            output,
            error
        };

        const stepLogFile = path.join(this.logPath, `step_${stepName.toLowerCase().replace(/\s+/g, '_')}.log`);
        await fs.writeFile(stepLogFile, JSON.stringify(stepLog, null, 2));
    }
}

// Migration orchestrator class
class MigrationOrchestrator {
    constructor() {
        this.logger = new MigrationLogger(CONFIG.logPath);
        this.currentStep = 0;
        this.results = {
            startTime: null,
            endTime: null,
            duration: null,
            steps: [],
            success: false,
            errors: [],
            warnings: []
        };
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async orchestrate() {
        try {
            await this.logger.init();
            await this.displayWelcome();
            
            if (CONFIG.interactive && !CONFIG.autoConfirm) {
                const proceed = await this.confirmProceed();
                if (!proceed) {
                    console.log(chalk.yellow('Migration cancelled by user.'));
                    return false;
                }
            }

            this.results.startTime = new Date();
            await this.logger.log('INFO', 'Starting migration orchestration');

            // Execute migration steps
            for (let i = 0; i < MIGRATION_STEPS.length; i++) {
                this.currentStep = i;
                const step = MIGRATION_STEPS[i];
                
                const success = await this.executeStep(step, i + 1);
                if (!success && step.required) {
                    await this.handleStepFailure(step);
                    return false;
                }
            }

            this.results.endTime = new Date();
            this.results.duration = this.results.endTime - this.results.startTime;
            this.results.success = true;

            await this.generateFinalReport();
            await this.displaySuccess();
            return true;

        } catch (error) {
            await this.logger.log('ERROR', 'Migration orchestration failed', { error: error.message });
            await this.handleCriticalFailure(error);
            return false;
        } finally {
            this.rl.close();
        }
    }

    async displayWelcome() {
        console.clear();
        console.log(chalk.cyan('🚀 Carmen ERP to Keycloak Migration Orchestrator'));
        console.log(chalk.cyan('=' .repeat(60)));
        console.log();
        console.log(chalk.white('This tool will migrate your Carmen ERP users and authentication'));
        console.log(chalk.white('data to Keycloak. The process includes:'));
        console.log();

        MIGRATION_STEPS.forEach((step, index) => {
            console.log(`${index + 1}. ${chalk.blue(step.name)}`);
            console.log(`   ${step.description}`);
            console.log(`   ${chalk.gray('Estimated time: ' + step.estimatedTime)}`);
            console.log();
        });

        console.log(chalk.yellow('⚠️  IMPORTANT NOTES:'));
        console.log(chalk.yellow('- Ensure you have complete backups of both systems'));
        console.log(chalk.yellow('- The migration should be tested in a development environment first'));
        console.log(chalk.yellow('- Users will need to reset their passwords after migration'));
        console.log(chalk.yellow('- The process may take 15-30 minutes depending on data size'));
        console.log();
    }

    async confirmProceed() {
        return new Promise((resolve) => {
            this.rl.question(chalk.cyan('Do you want to proceed with the migration? (yes/no): '), (answer) => {
                const confirmed = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
                resolve(confirmed);
            });
        });
    }

    async executeStep(step, stepNumber) {
        const stepPrefix = `[${stepNumber}/${MIGRATION_STEPS.length}]`;
        console.log(chalk.cyan(`\n${stepPrefix} Starting: ${step.name}`));
        console.log(chalk.gray(`Description: ${step.description}`));

        const stepResult = {
            name: step.name,
            startTime: new Date(),
            endTime: null,
            duration: null,
            success: false,
            output: '',
            error: null
        };

        try {
            // Create progress bar
            const progressBar = new cliProgress.SingleBar({
                format: `${stepPrefix} ${step.name} |{bar}| {percentage}% | ETA: {eta}s`,
                barCompleteChar: '█',
                barIncompleteChar: '░',
                hideCursor: true
            });

            progressBar.start(100, 0);

            let output = '';
            let success = false;

            if (step.script.endsWith('.sql')) {
                // Execute SQL script
                success = await this.executeSQLScript(step.script, (progress) => {
                    progressBar.update(progress);
                });
            } else if (step.script.endsWith('.js')) {
                // Execute Node.js script
                const result = await this.executeNodeScript(step.script, (progress, data) => {
                    progressBar.update(progress);
                    output += data;
                });
                success = result.success;
                output = result.output;
            }

            progressBar.update(100);
            progressBar.stop();

            stepResult.success = success;
            stepResult.output = output;
            stepResult.endTime = new Date();
            stepResult.duration = stepResult.endTime - stepResult.startTime;

            if (success) {
                console.log(chalk.green(`✅ ${step.name} completed successfully`));
                await this.logger.log('INFO', `Step completed: ${step.name}`);
            } else {
                console.log(chalk.red(`❌ ${step.name} failed`));
                await this.logger.log('ERROR', `Step failed: ${step.name}`, { output });
            }

            await this.logger.saveStepLog(step.name, success, output, stepResult.error);
            this.results.steps.push(stepResult);

            return success;

        } catch (error) {
            stepResult.success = false;
            stepResult.error = error.message;
            stepResult.endTime = new Date();
            stepResult.duration = stepResult.endTime - stepResult.startTime;

            console.log(chalk.red(`❌ ${step.name} failed with error: ${error.message}`));
            await this.logger.log('ERROR', `Step failed: ${step.name}`, { error: error.message });
            
            this.results.steps.push(stepResult);
            this.results.errors.push(`${step.name}: ${error.message}`);
            
            return false;
        }
    }

    async executeSQLScript(scriptPath, progressCallback) {
        return new Promise((resolve) => {
            const fullPath = path.join(CONFIG.scriptsPath, scriptPath);
            
            // Simulate progress for SQL scripts
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 95) progress = 95;
                progressCallback(Math.round(progress));
            }, 1000);

            const psqlCommand = spawn('psql', [
                '-h', process.env.DB_HOST || 'localhost',
                '-p', process.env.DB_PORT || '5432',
                '-U', process.env.DB_USERNAME || 'postgres',
                '-d', process.env.DB_NAME || 'carmen',
                '-f', fullPath
            ], {
                env: { 
                    ...process.env, 
                    PGPASSWORD: process.env.DB_PASSWORD || 'postgres'
                }
            });

            let output = '';
            let hasError = false;

            psqlCommand.stdout.on('data', (data) => {
                output += data.toString();
            });

            psqlCommand.stderr.on('data', (data) => {
                const error = data.toString();
                if (!error.includes('NOTICE') && !error.includes('INFO')) {
                    hasError = true;
                    output += error;
                }
            });

            psqlCommand.on('close', (code) => {
                clearInterval(progressInterval);
                progressCallback(100);
                resolve(code === 0 && !hasError);
            });

            psqlCommand.on('error', () => {
                clearInterval(progressInterval);
                resolve(false);
            });
        });
    }

    async executeNodeScript(scriptPath, progressCallback) {
        return new Promise((resolve) => {
            const fullPath = path.resolve(CONFIG.scriptsPath, scriptPath);
            
            const nodeProcess = spawn('node', [fullPath], {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let output = '';
            let progress = 0;

            // Simulate progress
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 95) progress = 95;
                progressCallback(Math.round(progress), '');
            }, 2000);

            nodeProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                
                // Try to extract progress from output if available
                const progressMatch = text.match(/(\d+)%/);
                if (progressMatch) {
                    progress = parseInt(progressMatch[1]);
                    progressCallback(progress, text);
                }
            });

            nodeProcess.stderr.on('data', (data) => {
                output += data.toString();
            });

            nodeProcess.on('close', (code) => {
                clearInterval(progressInterval);
                progressCallback(100, '');
                resolve({
                    success: code === 0,
                    output
                });
            });

            nodeProcess.on('error', (error) => {
                clearInterval(progressInterval);
                resolve({
                    success: false,
                    output: output + error.message
                });
            });
        });
    }

    async handleStepFailure(step) {
        console.log(chalk.red(`\n❌ Critical step failed: ${step.name}`));
        
        if (CONFIG.interactive) {
            const options = await this.promptFailureOptions();
            
            switch (options) {
                case 'retry':
                    console.log(chalk.yellow('Retrying step...'));
                    return await this.executeStep(step, this.currentStep + 1);
                    
                case 'skip':
                    console.log(chalk.yellow('Skipping step (not recommended)...'));
                    this.results.warnings.push(`Skipped step: ${step.name}`);
                    return true;
                    
                case 'rollback':
                    await this.initiateRollback();
                    return false;
                    
                case 'abort':
                default:
                    console.log(chalk.red('Migration aborted.'));
                    return false;
            }
        } else {
            console.log(chalk.red('Automated mode: Migration aborted due to failure.'));
            return false;
        }
    }

    async promptFailureOptions() {
        return new Promise((resolve) => {
            console.log(chalk.cyan('\nOptions:'));
            console.log('1. retry - Try the failed step again');
            console.log('2. skip - Skip this step (not recommended)');
            console.log('3. rollback - Rollback changes and exit');
            console.log('4. abort - Exit without rollback');
            
            this.rl.question(chalk.cyan('Choose an option (retry/skip/rollback/abort): '), (answer) => {
                resolve(answer.toLowerCase());
            });
        });
    }

    async initiateRollback() {
        console.log(chalk.yellow('\n🔄 Initiating rollback procedure...'));
        
        try {
            const rollbackScript = path.join(CONFIG.rollbackPath, 'restore_procedures.js');
            const rollbackExists = await fs.access(rollbackScript).then(() => true).catch(() => false);
            
            if (rollbackExists) {
                console.log(chalk.blue('Executing rollback script...'));
                const result = await this.executeNodeScript('../rollback/restore_procedures.js', () => {});
                
                if (result.success) {
                    console.log(chalk.green('✅ Rollback completed successfully'));
                } else {
                    console.log(chalk.red('❌ Rollback failed - manual intervention required'));
                }
            } else {
                console.log(chalk.yellow('⚠️  Rollback script not found - manual rollback required'));
                console.log(chalk.gray('Please refer to the rollback documentation'));
            }
        } catch (error) {
            console.log(chalk.red('❌ Rollback procedure failed'));
            console.log(chalk.red('Manual intervention required'));
            await this.logger.log('ERROR', 'Rollback failed', { error: error.message });
        }
    }

    async handleCriticalFailure(error) {
        console.log(chalk.red('\n💥 CRITICAL FAILURE'));
        console.log(chalk.red('Migration has encountered a critical error and cannot continue.'));
        console.log(chalk.red(`Error: ${error.message}`));
        
        this.results.success = false;
        this.results.errors.push(`Critical failure: ${error.message}`);
        
        if (CONFIG.interactive) {
            const shouldRollback = await this.confirmRollback();
            if (shouldRollback) {
                await this.initiateRollback();
            }
        }
    }

    async confirmRollback() {
        return new Promise((resolve) => {
            this.rl.question(chalk.cyan('Attempt to rollback changes? (yes/no): '), (answer) => {
                resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
            });
        });
    }

    async generateFinalReport() {
        const report = {
            migration: {
                tool: 'Carmen to Keycloak Migration Orchestrator',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            },
            execution: {
                startTime: this.results.startTime.toISOString(),
                endTime: this.results.endTime.toISOString(),
                duration: `${Math.round(this.results.duration / 1000)}s`,
                success: this.results.success
            },
            steps: this.results.steps,
            summary: {
                totalSteps: MIGRATION_STEPS.length,
                completedSteps: this.results.steps.filter(s => s.success).length,
                failedSteps: this.results.steps.filter(s => !s.success).length,
                errors: this.results.errors,
                warnings: this.results.warnings
            },
            nextSteps: this.generateNextSteps()
        };

        const reportPath = path.join(CONFIG.outputPath, 'migration_final_report.json');
        await fs.mkdir(CONFIG.outputPath, { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        await this.logger.log('INFO', 'Final report generated', { reportPath });
        return report;
    }

    generateNextSteps() {
        const nextSteps = [];
        
        if (this.results.success) {
            nextSteps.push('✅ Verify user login functionality in Keycloak');
            nextSteps.push('✅ Test role-based access control');
            nextSteps.push('✅ Configure Carmen ERP integration with Keycloak');
            nextSteps.push('✅ Set up password reset workflow for users');
            nextSteps.push('✅ Train users on new authentication system');
            nextSteps.push('✅ Monitor system performance and user feedback');
            nextSteps.push('✅ Schedule regular backups of Keycloak configuration');
        } else {
            nextSteps.push('❌ Review failure logs and resolve issues');
            nextSteps.push('❌ Consider rollback if system is in inconsistent state');
            nextSteps.push('❌ Test migration in development environment');
            nextSteps.push('❌ Contact support if issues persist');
        }
        
        return nextSteps;
    }

    async displaySuccess() {
        console.log(chalk.green('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!'));
        console.log(chalk.green('=' .repeat(60)));
        
        const duration = Math.round(this.results.duration / 1000);
        const completedSteps = this.results.steps.filter(s => s.success).length;
        
        console.log(chalk.white(`Total time: ${duration}s`));
        console.log(chalk.white(`Steps completed: ${completedSteps}/${MIGRATION_STEPS.length}`));
        
        if (this.results.warnings.length > 0) {
            console.log(chalk.yellow(`Warnings: ${this.results.warnings.length}`));
        }
        
        console.log(chalk.cyan('\n📋 Next Steps:'));
        const nextSteps = this.generateNextSteps();
        nextSteps.forEach((step, index) => {
            console.log(`${index + 1}. ${step}`);
        });
        
        console.log(chalk.gray(`\nDetailed report: ${path.join(CONFIG.outputPath, 'migration_final_report.json')}`));
        console.log(chalk.gray(`Migration logs: ${CONFIG.logPath}`));
    }
}

// Main execution
async function main() {
    const orchestrator = new MigrationOrchestrator();
    
    // Handle command line arguments
    if (process.argv.includes('--auto-confirm')) {
        CONFIG.autoConfirm = true;
    }
    
    if (process.argv.includes('--non-interactive')) {
        CONFIG.interactive = false;
    }
    
    const success = await orchestrator.orchestrate();
    process.exit(success ? 0 : 1);
}

// Run orchestrator
if (require.main === module) {
    main().catch(error => {
        console.error(chalk.red('Orchestrator failed to start:'), error.message);
        process.exit(1);
    });
}

module.exports = { MigrationOrchestrator };