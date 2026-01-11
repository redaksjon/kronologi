#!/usr/bin/env node
import * as Cardigantime from '@theunwalked/cardigantime';
import 'dotenv/config';
import { writeOutputFile } from './output';
import { join } from 'path';
import { runModel } from './run';
import { JobConfig, KronologiConfig, KronologiConfigSchema } from './types';
import * as Analysis from './analysis/inputs';
import * as Arguments from './arguments';
import { DEFAULT_CONFIG_DIR, DEFAULT_TIMEZONE, PROGRAM_NAME, VERSION } from './constants';
import { getLogger, setLogLevel } from './logging';
import * as Storage from './util/storage';
import * as Dreadcabinet from '@theunwalked/dreadcabinet';

export async function main() {

    // eslint-disable-next-line no-console
    console.info(`Starting ${PROGRAM_NAME}: ${VERSION}`);

    const dreadcabinetOptions = {
        defaults: {
            timezone: DEFAULT_TIMEZONE,
        },
        features: [],
        addDefaults: false,
    };

    const dreadcabinet = Dreadcabinet.create(dreadcabinetOptions);


    const partialSchema = KronologiConfigSchema.partial();
    const cardigantime: Cardigantime.Cardigantime<any> = Cardigantime.create({
        defaults: {
            configDirectory: DEFAULT_CONFIG_DIR,
        },
        configShape: partialSchema.shape as any,
    });

    const [kronologiConfig, jobConfig]: [KronologiConfig, JobConfig] = await Arguments.configure(dreadcabinet, cardigantime);

    // Set log level based on verbose flag
    if (kronologiConfig.verbose) {
        setLogLevel('verbose');
    }
    if (kronologiConfig.debug) {
        setLogLevel('debug');
    }

    const logger = getLogger();
    logger.debug('Kronologi config: %j', kronologiConfig);
    logger.debug('Job config: %j', jobConfig);

    try {

        const storage = Storage.create({ log: logger.debug });
        try {

            logger.info(`Generating ${jobConfig.job} summary for ${jobConfig.year}-${jobConfig.month} with historyMonths=${jobConfig.historyMonths} and summaryMonths=${jobConfig.summaryMonths}`);

            // Get the configuration to determine the output pattern
            const monthlySummaryConfig = await Analysis.createInputs(jobConfig.job, {
                year: jobConfig.year,
                month: jobConfig.month,
                historyMonths: jobConfig.historyMonths,
                summaryMonths: jobConfig.summaryMonths
            }, kronologiConfig, jobConfig);

            // Check if output file already exists
            const outputPath = join(
                kronologiConfig.summaryDirectory,
                jobConfig.year.toString(),
                jobConfig.month.toString(),
                monthlySummaryConfig.config.output.summary.pattern
            );

            if (await storage.exists(outputPath) && !kronologiConfig.replace) {
                logger.error(`Output file ${outputPath} already exists. Use --replace flag to overwrite.`);
                process.exit(1);
            }

            let success = false;
            let result;
            const originalHistoryMonths = jobConfig.historyMonths;
            const originalSummaryMonths = jobConfig.summaryMonths;

            while (!success && (jobConfig.historyMonths >= 0 || jobConfig.summaryMonths >= 0)) {
                try {
                    result = await runModel(monthlySummaryConfig.config, kronologiConfig, jobConfig);
                    // Check if the result contains a blank string
                    if (result?.aiSummary?.trim() === '') {
                        logger.info('Summary generation skipped: AI returned a blank response');
                        process.exit(0); // Exit gracefully
                    }
                    success = true;
                } catch (error: any) {
                    if (error?.message?.includes('429 Request too large')) {
                        // Extract token limits from error message
                        const limitMatch = error.message.match(/Limit (\d+), Requested (\d+)/);
                        const limit = limitMatch ? limitMatch[1] : 'unknown';
                        const requested = limitMatch ? limitMatch[2] : 'unknown';

                        if (jobConfig.historyMonths > 0) {
                            jobConfig.historyMonths--;
                            logger.info(`Token limit exceeded (Limit: ${limit}, Requested: ${requested}). Reducing history months to ${jobConfig.historyMonths} and retrying...`);
                        } else if (jobConfig.summaryMonths > 0) {
                            // Once history Months is 0, we move on to the summaryMonths.
                            jobConfig.summaryMonths--;
                            logger.info(`Token limit exceeded (Limit: ${limit}, Requested: ${requested}). Reducing summary months to ${jobConfig.summaryMonths} and retrying...`);
                        } else {
                            throw new Error(`Unable to generate summary even with minimum history and summary months. Last error: ${error.message}`);
                        }
                    } else {
                        throw error;
                    }
                }
            }

            if (!success || !result) {
                throw new Error('Failed to generate summary after all retries');
            }

            const { aiSummary, aiUsage, monthlySummary } = result;

            // Log final parameters used
            logger.info(`Successfully generated summary with historyMonths=${jobConfig.historyMonths} and summaryMonths=${jobConfig.summaryMonths}`);
            if (jobConfig.historyMonths !== originalHistoryMonths || jobConfig.summaryMonths !== originalSummaryMonths) {
                logger.info(`Note: Original parameters were historyMonths=${originalHistoryMonths} and summaryMonths=${originalSummaryMonths}`);
            }

            // Write all output files
            await writeOutputFile(
                kronologiConfig.summaryDirectory,
                jobConfig.year,
                jobConfig.month,
                monthlySummary.config.output.summary.pattern,
                aiSummary,
                logger
            );

            await writeOutputFile(
                kronologiConfig.summaryDirectory,
                jobConfig.year,
                jobConfig.month,
                monthlySummary.config.output.completion.pattern,
                aiUsage,
                logger
            );

            await writeOutputFile(
                kronologiConfig.summaryDirectory,
                jobConfig.year,
                jobConfig.month,
                monthlySummary.config.output.inputs.pattern,
                monthlySummary,
                logger
            );

        } catch (error: any) {
            logger.error(`Error generating summary: ${error.message} ${error.stack}`);
            process.exit(1);
        }
    } catch (error: any) {
        logger.error('Exiting due to Error: %s, %s', error.message, error.stack);
        process.exit(1);
    }
}
