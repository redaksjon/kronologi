import { join } from 'path';
import { getLogger } from '../logging';
import { DEFAULT_CONFIG_DIR } from '../constants';
import * as Storage from '../util/storage';

export interface InitOptions {
    jobName: string;
    configDir?: string;
    template?: string;
    interactive?: boolean;
}

export interface JobTemplate {
    name: string;
    description: string;
    path: string;
}

export async function getAvailableTemplates(configDir: string): Promise<JobTemplate[]> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.debug });
    const examplesPath = join(configDir, 'examples');

    if (!(await storage.exists(examplesPath))) {
        return [];
    }

    const templates: JobTemplate[] = [];
    const entries = await storage.listFiles(examplesPath);

    for (const entry of entries) {
        const entryPath = join(examplesPath, entry);

        if (await storage.isDirectory(entryPath) && entry !== 'node_modules') {
            const hasConfig = await storage.exists(join(entryPath, 'config.yaml'));
            const hasPersona = await storage.exists(join(entryPath, 'persona.md'));
            const hasInstructions = await storage.exists(join(entryPath, 'instructions.md'));

            if (hasConfig && hasPersona && hasInstructions) {
                templates.push({
                    name: entry,
                    description: getTemplateDescription(entry),
                    path: entryPath,
                });
            }
        }
    }

    return templates;
}

function getTemplateDescription(templateName: string): string {
    const descriptions: Record<string, string> = {
        'monthly-summary': 'Simple monthly summary (recommended for beginners)',
        'release-notes': 'Professional release notes with context and history',
        'team-update': 'Internal team updates with dynamic parameters',
    };

    return descriptions[templateName] || 'Custom template';
}

export function validateJobName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Job name cannot be empty' };
    }

    if (name.length > 50) {
        return { valid: false, error: 'Job name must be 50 characters or less' };
    }

    if (!/^[a-z0-9-_]+$/.test(name)) {
        return { valid: false, error: 'Job name must contain only lowercase letters, numbers, hyphens, and underscores' };
    }

    if (name.startsWith('-') || name.startsWith('_')) {
        return { valid: false, error: 'Job name cannot start with a hyphen or underscore' };
    }

    return { valid: true };
}

export async function initJob(options: InitOptions): Promise<void> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.debug });
    const configDir = options.configDir || DEFAULT_CONFIG_DIR;

    const validation = validateJobName(options.jobName);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const jobPath = join(configDir, 'jobs', options.jobName);
    if (await storage.exists(jobPath)) {
        throw new Error(`Job '${options.jobName}' already exists at ${jobPath}`);
    }

    const templates = await getAvailableTemplates(configDir);

    if (templates.length === 0) {
        throw new Error(`No templates found in ${join(configDir, 'examples')}. Please ensure example jobs are available.`);
    }

    let templatePath: string;

    if (options.template) {
        const template = templates.find(t => t.name === options.template);
        if (!template) {
            const available = templates.map(t => t.name).join(', ');
            throw new Error(`Template '${options.template}' not found. Available templates: ${available}`);
        }
        templatePath = template.path;
        logger.info(`Using template: ${options.template}`);
    } else {
        templatePath = templates[0].path;
        logger.info(`Using default template: ${templates[0].name}`);
    }

    logger.debug(`Creating job directory: ${jobPath}`);
    await storage.createDirectory(jobPath);

    const filesToCopy = ['config.yaml', 'persona.md', 'instructions.md'];

    for (const file of filesToCopy) {
        const sourcePath = join(templatePath, file);
        const destPath = join(jobPath, file);

        if (await storage.exists(sourcePath)) {
            logger.debug(`Copying ${file} to ${destPath}`);
            const content = await storage.readFile(sourcePath, 'utf-8');
            await storage.writeFile(destPath, content, 'utf-8');
        } else {
            logger.warn(`Template file ${file} not found in template ${templatePath}`);
        }
    }

    logger.info(`✓ Successfully created job '${options.jobName}' at ${jobPath}`);
    logger.info(`\nNext steps:`);
    logger.info(`  1. Edit the configuration: ${join(jobPath, 'config.yaml')}`);
    logger.info(`  2. Customize the persona: ${join(jobPath, 'persona.md')}`);
    logger.info(`  3. Modify instructions: ${join(jobPath, 'instructions.md')}`);
    logger.info(`  4. Validate your job: kronologi-validate ${options.jobName}`);
    logger.info(`  5. Run your job: kronologi ${options.jobName} 2026 1 --dry-run`);
}

export async function listTemplates(configDir?: string): Promise<JobTemplate[]> {
    const dir = configDir || DEFAULT_CONFIG_DIR;
    return await getAvailableTemplates(dir);
}
