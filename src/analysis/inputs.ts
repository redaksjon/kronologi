import { Content, Context, createPrompt, Formatter, Instruction, Model, Prompt, Request, Section } from '@riotprompt/riotprompt';
import { join } from 'path';
import { JobConfig, MindshahnConfig } from '../types';
import { checkDirectory } from './file';
import { Inputs } from '../types';
import { createConfig, createParameters } from './configLoader';
import { generateContent, generateContext, generateInstructions, generatePersona } from './prompt';
import { replaceParameters } from './section';

/**
 * Main function that creates inputs for analysis by combining configuration, parameters, and content generation
 */
export const createInputs = async (analysisName: string, params: Record<string, string | number>, mindshahnConfig: MindshahnConfig, jobConfig: JobConfig): Promise<Inputs> => {
    const configPath = join(mindshahnConfig.configDirectory, jobConfig.job);
    checkDirectory(configPath);

    // Load and validate configuration
    const config = await createConfig(jobConfig.job, configPath);

    // Process parameters
    const parameters = createParameters(config, params);

    // Generate prompt sections
    let persona: Section<Instruction> = await generatePersona(configPath);
    let instructions: Section<Instruction> = await generateInstructions(configPath);

    // Replace parameters in text
    persona = replaceParameters(persona, parameters);
    instructions = replaceParameters(instructions, parameters);

    // Generate context and content
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

