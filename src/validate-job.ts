#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { join } from 'path';
import { DEFAULT_CONFIG_DIR, PROGRAM_NAME, VERSION } from './constants';
import { getLogger, setLogLevel } from './logging';
import { validateJob, formatValidationResults } from './commands/validate';

async function main() {
    const program = new Command();

    program
        .name(`${PROGRAM_NAME}-validate`)
        .description('Validate a Kronologi job configuration')
        .version(VERSION)
        .argument('<job>', 'Job name to validate')
        .option('--config-dir <configDir>', `Config directory (Default: ${DEFAULT_CONFIG_DIR})`, DEFAULT_CONFIG_DIR)
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

    // Construct job config path
    const configPath = join(options.configDir, 'jobs', jobName);

    logger.debug(`Validating job '${jobName}' at path: ${configPath}`);

    try {
        const result = await validateJob(jobName, configPath);
        const output = formatValidationResults(result, jobName);

        // eslint-disable-next-line no-console
        console.error(output);

        // Exit with error code if validation failed
        if (!result.valid) {
            process.exit(1);
        }
    } catch (error) {
        logger.error(`Failed to validate job: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}

main();
