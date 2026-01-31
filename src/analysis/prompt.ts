import { Content, Context, createSection, Instruction, Parser, Section } from '@kjerneverk/riotprompt';
import { join } from 'path';
import { JOB_INSTRUCTIONS_PROMPT_FILE, JOB_PERSONA_PROMPT_FILE } from '../constants';
import { getLogger } from '../logging';
import { AnalysisConfig, HistoryContextConfig, Parameters, StaticContextConfig } from '../types';
import { KronologiConfig } from '../types';
import { readFiles } from './file';

/**
 * Type guard for static context config
 */
export const isStaticContextConfig = (config: any): config is StaticContextConfig => {
    return config && (config.type === 'static');
}

/**
 * Type guard for history context config
 */
export const isHistoryContextConfig = (config: any): config is HistoryContextConfig => {
    return config && config.type === 'history';
}

/**
 * Generates the persona section for the prompt
 */
export async function generatePersona(configPath: string): Promise<Section<Instruction>> {
    const parser = Parser.create();
    const persona = await parser.parseFile(join(configPath, JOB_PERSONA_PROMPT_FILE));
    return persona;
}

/**
 * Generates the instructions section for the prompt
 */
export async function generateInstructions(configPath: string): Promise<Section<Instruction>> {
    const parser = Parser.create();
    const instructions = await parser.parseFile(join(configPath, JOB_INSTRUCTIONS_PROMPT_FILE));
    return instructions;
}

/**
 * Generates the context section for the prompt
 */
export async function generateContext(config: AnalysisConfig, parameters: Parameters, mindshahnConfig: KronologiConfig): Promise<Section<Context>> {
    const logger = getLogger();

    const context = createSection<Context>({ title: 'Context' });

    // Step through each context directory defined in config
    for (const [key, contextConfig] of Object.entries(config.context)) {
        if (contextConfig.include === false) {
            logger.info(`Skipping ${contextConfig.name || key} Context because it is not included`);
            continue;
        }

        if (isStaticContextConfig(contextConfig)) {
            const contextSection = await readStaticContext(contextConfig, mindshahnConfig);
            context.add(contextSection);
        } else if (isHistoryContextConfig(contextConfig)) {
            const contextSection = await readHistoricalContext(contextConfig, config, parameters, mindshahnConfig);
            context.add(contextSection);
        }
    }

    return context;
}

/**
 * Reads historical context for the prompt
 */
export async function readHistoricalContext(contextConfig: HistoryContextConfig, config: AnalysisConfig, parameters: Parameters, mindshahnConfig: KronologiConfig): Promise<Section<Context>> {
    const logger = getLogger();

    // If this is a history context config, we need to get the configuration for the source
    const sourceConfig = config.content[contextConfig.from] || config.output[contextConfig.from];
    if (!sourceConfig) {
        throw new Error(`Missing required source context ${contextConfig.from} for history context ${contextConfig.name}`);
    }

    const year = parameters.year.value as number;
    const month = parameters.month?.value as number | undefined;
    const week = parameters.week?.value as number | undefined;

    // Determine the location of the source context based on the type of the source config
    const sourceDirectory = sourceConfig.type === 'activity' ? mindshahnConfig.activityDirectory : mindshahnConfig.summaryDirectory;
    const sourcePattern = sourceConfig.pattern;

    // Add section header for this context directory
    const sourceSection: Section<Context> = createSection<Context>({ title: `${sourceConfig.name || contextConfig.from} Context` });

    // Handle week-based history
    if (week !== undefined) {
        // Get the number of weeks which may be a parameter reference or a number
        const weeks: number = typeof contextConfig.weeks === 'string' && /^\${parameters\.(.*)}$/.test(contextConfig.weeks)
            ? parameters[contextConfig.weeks.match(/^\${parameters\.(.*)}$/)![1]].value as number
            : contextConfig.weeks as number || 1;

        // Get historical data for the specified number of weeks
        for (let i = 1; i < weeks + 1; i++) {
            // Calculate the target year and week
            let targetWeek = week - i;
            let targetYear = year;

            // Handle week rollover
            while (targetWeek <= 0) {
                targetYear--;
                // Assume 52 weeks per year (simplified)
                targetWeek += 52;
            }

            try {
                // Read files from the target directory
                const weekDir = `Week ${targetWeek}`;
                const historyPath = join(sourceDirectory, sourceConfig.directory || '', targetYear.toString(), weekDir);
                logger.debug(`Reading historical data from ${historyPath} with pattern ${sourcePattern}`);

                const contents = await readFiles(historyPath, sourcePattern);

                // Add each file's contents
                for (const [filename, content] of Object.entries(contents)) {
                    const fileSection: Section<Context> = createSection<Context>({ title: filename });
                    fileSection.add(content as string);
                    sourceSection.add(fileSection);
                }
            } catch (error) {
                logger.warn(`Could not read historical data for ${targetYear}-W${targetWeek}: ${error}`);
            }
        }
    } else if (month !== undefined) {
        // Get the number of months which may be a parameter reference or a number
        const months: number = typeof contextConfig.months === 'string' && /^\${parameters\.(.*)}$/.test(contextConfig.months)
            ? parameters[contextConfig.months.match(/^\${parameters\.(.*)}$/)![1]].value as number
            : contextConfig.months as number || 1;

        // Get historical data for the specified number of months
        for (let i = 1; i < months + 1; i++) {
            // Calculate the target year and month
            let targetMonth = month - i;
            let targetYear = year;

            // Handle month rollover
            while (targetMonth <= 0) {
                targetMonth += 12;
                targetYear--;
            }

            try {
                // Read files from the target directory
                const historyPath = join(sourceDirectory, sourceConfig.directory || '', targetYear.toString(), targetMonth.toString());
                logger.debug(`Reading historical data from ${historyPath} with pattern ${sourcePattern}`);

                const contents = await readFiles(historyPath, sourcePattern);

                // Add each file's contents
                for (const [filename, content] of Object.entries(contents)) {
                    const fileSection: Section<Context> = createSection<Context>({ title: filename });
                    fileSection.add(content as string);
                    sourceSection.add(fileSection);
                }
            } catch (error) {
                logger.warn(`Could not read historical data for ${targetYear}-${targetMonth}: ${error}`);
            }
        }
    }

    return sourceSection;
}

/**
 * Reads static context for the prompt
 */
export async function readStaticContext(contextConfig: StaticContextConfig, mindshahnConfig: KronologiConfig): Promise<Section<Context>> {
    const logger = getLogger();
    const section: Section<Context> = createSection<Context>({ title: `${contextConfig.name} Context` });
    const directoryPath = contextConfig.directory;
    logger.debug(`Generating ${contextConfig.name} Context from ${directoryPath} with pattern ${contextConfig.pattern}`);
    try {
        // Read all files in the directory
        const contents = await readFiles(join(mindshahnConfig.contextDirectory, directoryPath), contextConfig.pattern);

        // Add each file's contents
        for (const [filename, content] of Object.entries(contents)) {
            const fileSection: Section<Context> = createSection<Context>({ title: filename });
            fileSection.add(content as string);
            section.add(fileSection);
        }
    } catch (error) {
        logger.warn(`Could not read context directory ${directoryPath}: ${error}`);
        throw error;
    }
    return section;
}

/**
 * Formats the period directory name (adds "Week " prefix for weeks)
 */
function formatPeriodDirectory(week: number | string | undefined, month: number | string | undefined): string {
    if (week !== undefined) {
        return `Week ${week}`;
    } else if (month !== undefined) {
        return month.toString();
    }
    throw new Error('Either month or week parameter must be provided');
}

/**
 * Generates the content section for the prompt
 */
export async function generateContent(config: AnalysisConfig, parameters: Parameters, mindshahnConfig: KronologiConfig): Promise<Section<Content>> {
    const logger = getLogger();

    const content = createSection<Content>({ title: 'Content' });

    const year = parameters.year.value as string;
    const month = parameters.month?.value as number | undefined;
    const week = parameters.week?.value as number | undefined;

    let contributingFileCount = 0;

    for (const [key, value] of Object.entries(config.content)) {
        let directoryPath = '';

        // Format the period directory name
        const periodDir = formatPeriodDirectory(week, month);

        if (value.type === 'summary') {
            directoryPath = join(mindshahnConfig.summaryDirectory, value.directory || '', year.toString(), periodDir);
        } else {
            directoryPath = join(mindshahnConfig.activityDirectory, value.directory || '', year.toString(), periodDir);
        }

        logger.debug(`Generating ${value.name || key} Content from ${directoryPath} with pattern ${value.pattern}`);

        const contents = await readFiles(directoryPath, value.pattern);
        const contentSection: Section<Content> = createSection<Content>({ title: `${value.name || key} Content` });

        // Add each file's contents to the content section
        for (const [filename, content] of Object.entries(contents)) {
            const fileSection: Section<Content> = createSection<Content>({ title: filename });
            fileSection.add(content as string);
            contentSection.add(fileSection);
            contributingFileCount++;
        }

        content.add(contentSection);
    }

    if (contributingFileCount === 0) {
        logger.warn(`No contributing files found for ${config.name}`);
    }

    return content;
} 