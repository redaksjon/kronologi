import { Content, Context, createPrompt, Formatter, Instruction, Model, Prompt, Request, Section, createSection } from '@kjerneverk/riotprompt';
import { join } from 'path';
import { JobConfig, KronologiConfig, AnalysisConfigWithSources } from '../types';
import { checkDirectory } from './file';
import { Inputs } from '../types';
import { createConfig, createParameters } from './configLoader';
import { generateContent, generateContext, generateInstructions, generatePersona } from './prompt';
import { replaceParameters } from './section';
import { buildSystemMessage } from '../reasoning/systemPrompt';
import { getLogger } from '../logging';

/**
 * Main function that creates inputs for analysis by combining configuration, parameters, and content generation
 */
export const createInputs = async (analysisName: string, params: Record<string, string | number | undefined>, mindshahnConfig: KronologiConfig, jobConfig: JobConfig): Promise<Inputs> => {
    const configPath = join(mindshahnConfig.configDirectory, 'jobs', jobConfig.job);
    checkDirectory(configPath);

    const logger = getLogger();
    
    // Load and validate configuration
    const config = await createConfig(jobConfig.job, configPath) as AnalysisConfigWithSources;

    // Process parameters - filter out undefined values
    const filteredParams: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            filteredParams[key] = value;
        }
    }
    const parameters = createParameters(config, filteredParams);

    // Generate prompt sections
    let persona: Section<Instruction> = await generatePersona(configPath);
    let instructions: Section<Instruction> = await generateInstructions(configPath);

    // Replace parameters in text
    persona = replaceParameters(persona, parameters);
    instructions = replaceParameters(instructions, parameters);

    // Check if using new content sources (reasoning-only mode)
    if (config.contentSources) {
        logger.info('Using reasoning-only mode with system prompt wrapper');
        
        // Build system message with tool usage guidance and content sources
        const systemMessage = buildSystemMessage(config.contentSources);

        // Create context section with system message
        const context: Section<Context> = createSection<Context>({ title: 'System' });
        context.add(systemMessage);

        // User instructions go in content section
        const content: Section<Content> = createSection<Content>({ title: 'Task' });
        // Instructions section contains the user's task-focused instructions
        content.add(instructions.toString());

        // Create the complete prompt with sections object
        // Persona is optional and goes in instructions if present
        const prompt: Prompt = createPrompt({
            persona: persona.toString() ? persona : undefined,
            instructions: instructions,
            contexts: context,
            contents: content
        });

        // Format for the model using formatter instance
        const formatter = Formatter.create();
        const request: Request = formatter.formatPrompt(mindshahnConfig.model as Model, prompt);

        return {
            config,
            request
        };
    } else {
        // Traditional mode (deprecated but kept for backward compatibility)
        logger.warn('Using deprecated traditional mode - consider migrating to contentSources');
        
        // Generate context and content (old way)
        const context: Section<Context> = await generateContext(config, parameters, mindshahnConfig);
        const content: Section<Content> = await generateContent(config, parameters, mindshahnConfig);

        // Create the complete prompt with sections object
        const prompt: Prompt = createPrompt({
            persona,
            instructions,
            contexts: context,
            contents: content
        });

        // Format for the model using formatter instance
        const formatter = Formatter.create();
        const request: Request = formatter.formatPrompt(mindshahnConfig.model as Model, prompt);

        return {
            config,
            request
        };
    }
}

