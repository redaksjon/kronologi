import * as CardiganTime from '@theunwalked/cardigantime';
import { Command } from "commander";
import { ALLOWED_MODELS, DEFAULT_ACTIVITY_DIR, DEFAULT_CONFIG_DIR, DEFAULT_CONTEXT_DIR, DEFAULT_DEBUG, DEFAULT_DRY_RUN, DEFAULT_HISTORY_MONTHS, DEFAULT_MODEL, DEFAULT_REPLACE, DEFAULT_SUMMARY_DIR, DEFAULT_SUMMARY_MONTHS, DEFAULT_VERBOSE, PROGRAM_NAME, KRONOLOGI_DEFAULTS, VERSION } from "./constants";
import { ArgumentError } from "./error/ArgumentError";
import { getLogger } from "./logging";
import { Args, JobConfig, KronologiConfig } from "./types";
import * as Dates from "./util/dates";
import * as Storage from "./util/storage";
import * as DreadCabinet from "@theunwalked/dreadcabinet";

export const configure = async (dreadcabinet: DreadCabinet.DreadCabinet, cardigantime: CardiganTime.Cardigantime<any>): Promise<[KronologiConfig, JobConfig]> => {
    const logger = getLogger();
    let program = new Command();

    program
        .name(PROGRAM_NAME)
        .summary('Create Intelligent Release Notes or Change Logs from Git')
        .description('Create Intelligent Release Notes or Change Logs from Git')
        .argument('<job>', 'Type of summary to generate')
        .argument('<year>', 'Year for the summary')
        .argument('<month>', 'Month for the summary')
        .argument('[historyMonths]', `Number of months of history to include (Default: ${DEFAULT_HISTORY_MONTHS})`)
        .argument('[summaryMonths]', `Number of months to summarize (Default: ${DEFAULT_SUMMARY_MONTHS})`)
        .option('--dry-run', `perform a dry run without saving files (Default: ${DEFAULT_DRY_RUN})`)
        .option('--verbose', `enable verbose logging (Default: ${DEFAULT_VERBOSE})`)
        .option('--debug', `enable debug logging (Default: ${DEFAULT_DEBUG})`)
        .option('--model <model>', `OpenAI model to use (Default: ${DEFAULT_MODEL})`)
        .option('--config-dir <configDir>', `config directory (Default: ${DEFAULT_CONFIG_DIR})`)
        .option('--context-directory <contextDirectory>', `directory containing context files to be included in prompts (Default: ${DEFAULT_CONTEXT_DIR})`)
        .option('--activity-directory <activityDirectory>', `directory containing activity files to be included in prompts (Default: ${DEFAULT_ACTIVITY_DIR})`)
        .option('--summary-directory <summaryDirectory>', `directory containing summary files to be included in prompts (Default: ${DEFAULT_SUMMARY_DIR})`)
        .option('--replace', `replace existing summary files if they exist (Default: ${DEFAULT_REPLACE})`)
        .version(VERSION);

    await dreadcabinet.configure(program);
    // TODO: This is a hack, cardigantime should not need to return the program
    program = await cardigantime.configure(program);
    program.parse();

    const cliArgs: Args = program.opts<Args>();
    logger.info('Loaded Command Line Options: %s', JSON.stringify(cliArgs, null, 2));

    // Get values from config file first
    // Validate that the configuration read from the file is valid.
    const fileValues = await cardigantime.read(cliArgs);
    await cardigantime.validate(fileValues);

    // Read the Raw values from the Dreadcabinet Command Line Arguments
    const dreadcabinetValues = await dreadcabinet.read(cliArgs);

    const kronologiConfig: KronologiConfig = {
        ...KRONOLOGI_DEFAULTS,
        ...fileValues,   // Apply file values (overwrites defaults), ensure object
        ...dreadcabinetValues,              // Apply all CLI args last (highest precedence for all keys, including Dreadcabinet's)
    } as KronologiConfig;
    await validateKronologiConfig(kronologiConfig);

    const cliJobArguments: Partial<JobConfig> = parseJobArguments(program.args);
    const jobConfig: JobConfig = {
        ...cliJobArguments,
        ...(fileValues.job || {}),
    } as JobConfig;

    return [kronologiConfig, jobConfig];
}

function parseJobArguments(args: string[]): Partial<JobConfig> {
    const [job, year, month, historyMonths, summaryMonths] = args;

    // Validate required arguments
    if (!job) {
        throw new Error('Job is required');
    }
    if (!year) {
        throw new Error('Year is required');
    }
    if (!month) {
        throw new Error('Month is required');
    }

    // Validate year and month format
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        throw new Error('Year must be a valid number between 1900 and 2100');
    }

    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        throw new Error('Month must be a valid number between 1 and 12');
    }

    const jobConfig: Partial<JobConfig> = {
        job: job,
        year: yearNum,
        month: monthNum,
    }

    if (historyMonths) {
        // Validate historyMonths and summaryMonths
        const historyMonthsNum = parseInt(historyMonths);
        if (isNaN(historyMonthsNum) || historyMonthsNum < 1) {
            throw new Error('History months must be a positive number');
        }
        jobConfig.historyMonths = historyMonthsNum;
    }

    if (summaryMonths) {
        const summaryMonthsNum = parseInt(summaryMonths);
        if (isNaN(summaryMonthsNum) || summaryMonthsNum < 1) {
            throw new Error('Summary months must be a positive number');
        }
        jobConfig.summaryMonths = summaryMonthsNum;
    }

    return jobConfig;
}

async function validateKronologiConfig(
    config: KronologiConfig
): Promise<void> {

    validateTimezone(config.timezone);

    if (config.configDirectory) {
        await validateConfigDirectory(config.configDirectory);
    }

    if (config.contextDirectory) {
        await validateInputDirectory(config.contextDirectory);
    }

    if (config.activityDirectory) {
        await validateInputDirectory(config.activityDirectory);
    }

    if (config.summaryDirectory) {
        await validateOutputDirectory(config.summaryDirectory);
    }


    validateModel(config.model, true, 'model', '--model');
}


function validateModel(model: string | undefined, required: boolean, modelConfigName: string, modelOptionName: string): void {
    if (required && !model) {
        throw new Error(`Model is required either in the config file (${modelConfigName}) or as a command line argument (${modelOptionName})`);
    }

    if (model && !ALLOWED_MODELS.includes(model)) {
        throw new Error(`Invalid model: ${model}. Valid models are: ${ALLOWED_MODELS.join(', ')}`);
    }
}

async function validateConfigDirectory(configDir: string): Promise<void> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.info });
    if (!storage.isDirectoryReadable(configDir)) {
        throw new Error(`Config directory does not exist: ${configDir}`);
    }
}

async function validateInputDirectory(inputDirectory: string): Promise<void> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.info });
    if (!storage.isDirectoryReadable(inputDirectory)) {
        throw new Error(`Input directory does not exist: ${inputDirectory}`);
    }
}

async function validateOutputDirectory(outputDirectory: string): Promise<void> {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.info });
    if (!storage.isDirectoryWritable(outputDirectory)) {
        throw new Error(`Output directory does not exist: ${outputDirectory}`);
    }
}

function validateTimezone(timezone: string): void {
    const validOptions = Dates.validTimezones();
    if (validOptions.includes(timezone)) {
        return;
    }
    throw new ArgumentError('--timezone', `Invalid timezone: ${timezone}. Valid options are: ${validOptions.join(', ')}`);
}