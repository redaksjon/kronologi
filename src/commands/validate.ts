import { join } from 'path';
import { DEFAULT_CHARACTER_ENCODING, JOB_CONFIG_FILE } from '../constants';
import { getLogger } from '../logging';
import { AnalysisConfig } from '../types';
import * as Storage from '../util/storage';
import { createConfig } from '../analysis/configLoader';

interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    message: string;
    location?: string;
}

interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    config?: AnalysisConfig;
}

/**
 * Validates a job configuration and all related files
 */
export async function validateJob(jobName: string, configPath: string): Promise<ValidationResult> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.debug });
    const issues: ValidationIssue[] = [];

    // Check if job directory exists
    if (!(await storage.exists(configPath))) {
        issues.push({
            severity: 'error',
            message: `Job directory not found: ${configPath}`,
        });
        return { valid: false, issues };
    }

    // Check if config.yaml exists
    const configFilePath = join(configPath, JOB_CONFIG_FILE);
    if (!(await storage.exists(configFilePath))) {
        issues.push({
            severity: 'error',
            message: `Configuration file not found: ${configFilePath}`,
        });
        return { valid: false, issues };
    }

    // Check if persona.md exists
    const personaPath = join(configPath, 'persona.md');
    if (!(await storage.exists(personaPath))) {
        issues.push({
            severity: 'warning',
            message: `Persona file not found: ${personaPath}`,
        });
    }

    // Check if instructions.md exists
    const instructionsPath = join(configPath, 'instructions.md');
    if (!(await storage.exists(instructionsPath))) {
        issues.push({
            severity: 'warning',
            message: `Instructions file not found: ${instructionsPath}`,
        });
    }

    // Try to parse and validate the configuration
    let config: AnalysisConfig;
    try {
        config = await createConfig(jobName, configPath);
    } catch (error) {
        issues.push({
            severity: 'error',
            message: `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
            location: configFilePath,
        });
        return { valid: false, issues };
    }

    // Validate model is specified
    if (!config.model) {
        issues.push({
            severity: 'error',
            message: 'Model is not specified in config.yaml',
            location: 'config.yaml',
        });
    }

    // Validate parameters
    if (config.parameters) {
        for (const [key, param] of Object.entries(config.parameters)) {
            if (param.required && param.default !== undefined && param.default !== null) {
                issues.push({
                    severity: 'warning',
                    message: `Parameter '${key}' is marked as required but has a default value`,
                    location: 'config.yaml',
                });
            }
        }
    }

    // Check for parameter usage in persona.md and instructions.md
    const parameterNames = config.parameters ? Object.keys(config.parameters) : [];

    if (await storage.exists(personaPath)) {
        const personaContent = await storage.readFile(personaPath, DEFAULT_CHARACTER_ENCODING);
        const usedParams = extractParameterReferences(personaContent);

        for (const paramName of usedParams) {
            if (!parameterNames.includes(paramName)) {
                issues.push({
                    severity: 'error',
                    message: `Parameter '${paramName}' used in persona.md but not defined in config.yaml`,
                    location: 'persona.md',
                });
            }
        }
    }

    if (await storage.exists(instructionsPath)) {
        const instructionsContent = await storage.readFile(instructionsPath, DEFAULT_CHARACTER_ENCODING);
        const usedParams = extractParameterReferences(instructionsContent);

        for (const paramName of usedParams) {
            if (!parameterNames.includes(paramName)) {
                issues.push({
                    severity: 'error',
                    message: `Parameter '${paramName}' used in instructions.md but not defined in config.yaml`,
                    location: 'instructions.md',
                });
            }
        }
    }

    // Check for unused parameters
    if ((await storage.exists(personaPath)) && (await storage.exists(instructionsPath))) {
        const personaContent = await storage.readFile(personaPath, DEFAULT_CHARACTER_ENCODING);
        const instructionsContent = await storage.readFile(instructionsPath, DEFAULT_CHARACTER_ENCODING);
        const allContent = personaContent + '\n' + instructionsContent;
        const usedParams = extractParameterReferences(allContent);

        for (const paramName of parameterNames) {
            if (!usedParams.includes(paramName)) {
                issues.push({
                    severity: 'info',
                    message: `Parameter '${paramName}' is defined but never used in persona.md or instructions.md`,
                    location: 'config.yaml',
                });
            }
        }
    }

    // Validate context configurations
    if (config.context) {
        for (const [key, contextConfig] of Object.entries(config.context)) {
            if (contextConfig.type === 'static') {
                // Static context should have a directory
                if (!contextConfig.directory) {
                    issues.push({
                        severity: 'error',
                        message: `Static context '${key}' is missing required 'directory' property`,
                        location: 'config.yaml',
                    });
                }
            } else if (contextConfig.type === 'history') {
                // History context should have 'from' property
                if (!contextConfig.from) {
                    issues.push({
                        severity: 'error',
                        message: `History context '${key}' is missing required 'from' property`,
                        location: 'config.yaml',
                    });
                }
            }
        }
    }

    // Validate content configurations
    if (config.content) {
        for (const [key, contentConfig] of Object.entries(config.content)) {
            if (!contentConfig.name) {
                issues.push({
                    severity: 'warning',
                    message: `Content '${key}' is missing 'name' property`,
                    location: 'config.yaml',
                });
            }
        }
    }

    // Validate output configurations
    if (!config.output || Object.keys(config.output).length === 0) {
        issues.push({
            severity: 'error',
            message: 'No output configuration defined',
            location: 'config.yaml',
        });
    }

    const hasErrors = issues.some(issue => issue.severity === 'error');
    return {
        valid: !hasErrors,
        issues,
        config,
    };
}

/**
 * Extracts parameter references from markdown content
 * Looks for patterns like {{parameters.name}} or ${parameters.name}
 */
function extractParameterReferences(content: string): string[] {
    const patterns = [
        /\{\{parameters\.(\w+)\}\}/g,  // Handlebars style: {{parameters.name}}
        /\$\{parameters\.(\w+)\}/g,     // Template literal style: ${parameters.name}
    ];

    const found = new Set<string>();

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            found.add(match[1]);
        }
    }

    return Array.from(found);
}

/**
 * Formats validation results for display
 */
export function formatValidationResults(result: ValidationResult, jobName: string): string {
    const lines: string[] = [];

    lines.push(`\nValidation Results for job '${jobName}':`);
    lines.push('='.repeat(60));

    if (result.valid) {
        lines.push('\n✓ Configuration is valid');
    } else {
        lines.push('\n✗ Configuration has errors');
    }

    if (result.issues.length === 0) {
        lines.push('\nNo issues found.');
    } else {
        const errors = result.issues.filter(i => i.severity === 'error');
        const warnings = result.issues.filter(i => i.severity === 'warning');
        const infos = result.issues.filter(i => i.severity === 'info');

        if (errors.length > 0) {
            lines.push('\n❌ Errors:');
            for (const issue of errors) {
                lines.push(`  - ${issue.message}`);
                if (issue.location) {
                    lines.push(`    Location: ${issue.location}`);
                }
            }
        }

        if (warnings.length > 0) {
            lines.push('\n⚠️  Warnings:');
            for (const issue of warnings) {
                lines.push(`  - ${issue.message}`);
                if (issue.location) {
                    lines.push(`    Location: ${issue.location}`);
                }
            }
        }

        if (infos.length > 0) {
            lines.push('\nℹ️  Info:');
            for (const issue of infos) {
                lines.push(`  - ${issue.message}`);
                if (issue.location) {
                    lines.push(`    Location: ${issue.location}`);
                }
            }
        }
    }

    lines.push('\n' + '='.repeat(60));

    return lines.join('\n');
}
