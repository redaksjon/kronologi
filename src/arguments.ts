import * as CardiganTime from '@theunwalked/cardigantime';
import { Command } from "commander";
import { ALLOWED_MODELS, DEFAULT_ACTIVITY_DIR, DEFAULT_CONFIG_DIR, DEFAULT_CONTEXT_DIR, DEFAULT_DEBUG, DEFAULT_DRY_RUN, DEFAULT_HISTORY_MONTHS, DEFAULT_HISTORY_WEEKS, DEFAULT_MODEL, DEFAULT_REPLACE, DEFAULT_SUMMARY_DIR, DEFAULT_SUMMARY_MONTHS, DEFAULT_SUMMARY_WEEKS, DEFAULT_VERBOSE, PROGRAM_NAME, KRONOLOGI_DEFAULTS, JOB_DEFAULTS, VERSION } from "./constants";
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
        .argument('[year]', 'Year for the summary (defaults to current year)')
        .argument('[period]', 'Month (1-12) or Week (1-53) for the summary (defaults to current period)')
        .argument('[historyPeriods]', `Number of periods of history to include (Default: ${DEFAULT_HISTORY_MONTHS} for monthly, ${DEFAULT_HISTORY_WEEKS} for weekly)`)
        .argument('[summaryPeriods]', `Number of periods to summarize (Default: ${DEFAULT_SUMMARY_MONTHS} for monthly, ${DEFAULT_SUMMARY_WEEKS} for weekly)`)
        .option('--dry-run', `perform a dry run without saving files (Default: ${DEFAULT_DRY_RUN})`)
        .option('--verbose', `enable verbose logging (Default: ${DEFAULT_VERBOSE})`)
        .option('--debug', `enable debug logging (Default: ${DEFAULT_DEBUG})`)
        .option('--model <model>', `OpenAI model to use (Default: ${DEFAULT_MODEL})`)
        .option('--config-dir <configDir>', `config directory (Default: ${DEFAULT_CONFIG_DIR})`)
        .option('--context-directory <contextDirectory>', `directory containing context files to be included in prompts (Default: ${DEFAULT_CONTEXT_DIR})`)
        .option('--activity-directory <activityDirectory>', `directory containing activity files to be included in prompts (Default: ${DEFAULT_ACTIVITY_DIR})`)
        .option('--summary-directory <summaryDirectory>', `directory containing summary files to be included in prompts (Default: ${DEFAULT_SUMMARY_DIR})`)
        .option('--replace', `replace existing summary files if they exist (Default: ${DEFAULT_REPLACE})`)
        .option('--period-type <periodType>', `Period type: 'month' or 'week' (auto-detected if not specified)`)
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
        ...cliArgs,                         // Apply CLI args to ensure all flags are captured
    } as KronologiConfig;
    await validateKronologiConfig(kronologiConfig);

    const cliJobArguments: Partial<JobConfig> = parseJobArguments(program.args);
    const jobConfig: JobConfig = {
        ...JOB_DEFAULTS,
        ...cliJobArguments,
        ...(fileValues.job || {}),
    } as JobConfig;

    return [kronologiConfig, jobConfig];
}

/**
 * Calculate the current week number (Sunday-based)
 */
function getCurrentWeek(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const firstDayOfYear = startOfYear.getDay(); // 0 = Sunday
    const daysUntilFirstSunday = firstDayOfYear === 0 ? 0 : 7 - firstDayOfYear;
    const daysSinceFirstSunday = dayOfYear - daysUntilFirstSunday;
    return daysSinceFirstSunday < 0 ? 1 : Math.floor(daysSinceFirstSunday / 7) + 1;
}

function parseJobArguments(args: string[]): Partial<JobConfig> {
    const [job, year, period, historyPeriods, summaryPeriods] = args;

    // Validate required arguments
    if (!job) {
        throw new Error('Job is required');
    }

    // Default to current year and period if not provided
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const currentWeek = getCurrentWeek();

    // Determine if this is a weekly job based on job name
    const isWeeklyJob = /week/i.test(job);

    // Use provided year or default to current
    const yearNum = year ? parseInt(year) : currentYear;
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        throw new Error('Year must be a valid number between 1900 and 2100');
    }

    // Use provided period or default to current week/month based on job type
    let periodNum: number;
    if (period) {
        periodNum = parseInt(period);
        if (isNaN(periodNum) || periodNum < 1) {
            throw new Error('Period must be a positive number');
        }
    } else {
        // Default to current period based on job type
        periodNum = isWeeklyJob ? currentWeek : currentMonth;
    }

    // Determine if this is a month or week based on the value and job name
    // Months: 1-12, Weeks: 1-53
    let periodType: 'month' | 'week';
    
    if (periodNum > 12 && periodNum <= 53) {
        // Must be a week (13-53)
        periodType = 'week';
    } else if (periodNum <= 12) {
        // Could be either month (1-12) or week (1-12)
        // Use job name as a hint, otherwise default to month for backward compatibility
        periodType = isWeeklyJob ? 'week' : 'month';
    } else {
        throw new Error('Period must be between 1-12 for months or 1-53 for weeks');
    }

    const jobConfig: Partial<JobConfig> = {
        job: job,
        year: yearNum,
        periodType: periodType,
    }

    if (periodType === 'month') {
        jobConfig.month = periodNum;
        
        if (historyPeriods) {
            const historyPeriodsNum = parseInt(historyPeriods);
            if (isNaN(historyPeriodsNum) || historyPeriodsNum < 1) {
                throw new Error('History periods must be a positive number');
            }
            jobConfig.historyMonths = historyPeriodsNum;
        }

        if (summaryPeriods) {
            const summaryPeriodsNum = parseInt(summaryPeriods);
            if (isNaN(summaryPeriodsNum) || summaryPeriodsNum < 1) {
                throw new Error('Summary periods must be a positive number');
            }
            jobConfig.summaryMonths = summaryPeriodsNum;
        }
    } else {
        jobConfig.week = periodNum;
        
        if (historyPeriods) {
            const historyPeriodsNum = parseInt(historyPeriods);
            if (isNaN(historyPeriodsNum) || historyPeriodsNum < 1) {
                throw new Error('History periods must be a positive number');
            }
            jobConfig.historyWeeks = historyPeriodsNum;
        }

        if (summaryPeriods) {
            const summaryPeriodsNum = parseInt(summaryPeriods);
            if (isNaN(summaryPeriodsNum) || summaryPeriodsNum < 1) {
                throw new Error('Summary periods must be a positive number');
            }
            jobConfig.summaryWeeks = summaryPeriodsNum;
        }
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