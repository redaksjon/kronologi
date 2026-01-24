#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { DEFAULT_CONFIG_DIR, PROGRAM_NAME, VERSION } from './constants';
import { getLogger, setLogLevel } from './logging';
import { initJob, listTemplates } from './commands/init';

async function main() {
    const program = new Command();

    program
        .name(`${PROGRAM_NAME}-init`)
        .description('Initialize a new Kronologi job from a template')
        .version(VERSION)
        .argument('[job]', 'Job name to create')
        .option('--config-dir <configDir>', `Config directory (Default: ${DEFAULT_CONFIG_DIR})`, DEFAULT_CONFIG_DIR)
        .option('--template <template>', 'Template to use (e.g., monthly-summary, release-notes, team-update)')
        .option('--list-templates', 'List available templates and exit')
        .option('--verbose', 'Enable verbose logging', false)
        .option('--debug', 'Enable debug logging', false)
        .parse();

    const [jobName] = program.args;
    const options = program.opts();

    // Set log level
    if (options.debug) {
        setLogLevel('debug');
    } else if (options.verbose) {
        setLogLevel('verbose');
    }

    const logger = getLogger();

    // Handle --list-templates
    if (options.listTemplates) {
        const templates = await listTemplates(options.configDir);

        if (templates.length === 0) {
            // eslint-disable-next-line no-console
            console.error('No templates available.');
            // eslint-disable-next-line no-console
            console.error(`Templates should be located in: ${options.configDir}/examples/`);
            process.exit(1);
        }

        // eslint-disable-next-line no-console
        console.error('\nAvailable Templates:\n');
        for (const template of templates) {
            // eslint-disable-next-line no-console
            console.error(`  ${template.name}`);
            // eslint-disable-next-line no-console
            console.error(`    ${template.description}`);
            // eslint-disable-next-line no-console
            console.error(`    Path: ${template.path}\n`);
        }

        // eslint-disable-next-line no-console
        console.error('Usage:');
        // eslint-disable-next-line no-console
        console.error(`  kronologi-init my-job --template ${templates[0].name}`);
        // eslint-disable-next-line no-console
        console.error(`  kronologi-init my-job  (uses default template: ${templates[0].name})\n`);

        process.exit(0);
    }

    // Validate job name is provided
    if (!jobName) {
        // eslint-disable-next-line no-console
        console.error('Error: Job name is required');
        // eslint-disable-next-line no-console
        console.error('\nUsage:');
        // eslint-disable-next-line no-console
        console.error('  kronologi-init <job-name> [options]');
        // eslint-disable-next-line no-console
        console.error('\nExamples:');
        // eslint-disable-next-line no-console
        console.error('  kronologi-init my-summary');
        // eslint-disable-next-line no-console
        console.error('  kronologi-init release-notes --template release-notes');
        // eslint-disable-next-line no-console
        console.error('  kronologi-init --list-templates');
        // eslint-disable-next-line no-console
        console.error('\nFor more information, run: kronologi-init --help');
        process.exit(1);
    }

    try {
        await initJob({
            jobName,
            configDir: options.configDir,
            template: options.template,
        });
    } catch (error) {
        logger.error(`Failed to initialize job: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}

main();
