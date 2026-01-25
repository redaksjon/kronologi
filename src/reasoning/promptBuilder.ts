/**
 * Prompt Builder using RiotPrompt
 *
 * Builds prompts for reasoning mode using RiotPrompt for composition.
 * This replaces the traditional prompt composition approach.
 *
 * In reasoning-only mode, prompts include:
 * - Instructions for the task
 * - Descriptions of available content sources
 * - Guidance on using tools to explore content
 * 
 * Content is NOT included in the prompt - the AI uses tools to access it.
 */

import { join } from 'path';
import { ToolContext } from './tools/types';
import { ContentSourcesConfig, Parameters } from '../types';
import * as Storage from '../util/storage';
import { DEFAULT_CHARACTER_ENCODING } from '../constants';

/**
 * Build a prompt using RiotPrompt for reasoning mode
 * 
 * NOTE: This file is prepared for future use when we fully migrate to RiotPrompt.
 * Currently, inputs.ts handles prompt building using the existing RiotPrompt integration.
 * 
 * @param jobPath - Path to the job configuration directory
 * @param contentSources - Content source descriptions (not the actual content)
 * @param parameters - Job parameters
 * @param toolContext - Tool execution context
 */
export async function buildPrompt(
    jobPath: string,
    contentSources: ContentSourcesConfig | undefined,
    parameters: Parameters,
    toolContext: ToolContext
): Promise<string> {
    const storage = Storage.create({ log: toolContext.logger.debug });

    // Load instructions from job directory
    let instructions = '';
    try {
        const instructionsPath = join(jobPath, 'instructions.md');
        instructions = await storage.readFile(instructionsPath, DEFAULT_CHARACTER_ENCODING);
    } catch {
        toolContext.logger.warn(`No instructions.md found in ${jobPath}, using default`);
        instructions = getDefaultInstructions();
    }

    // Load persona if available
    let persona = '';
    try {
        const personaPath = join(jobPath, 'persona.md');
        persona = await storage.readFile(personaPath, DEFAULT_CHARACTER_ENCODING);
    } catch {
        // Persona is optional
        toolContext.logger.debug(`No persona.md found in ${jobPath}`);
    }

    // For now, return a simple combined prompt
    // Full RiotPrompt integration will be completed in future iteration
    const parts: string[] = [];
    
    if (persona) {
        parts.push(persona);
    }
    
    parts.push(instructions);
    
    return parts.join('\n\n');
}

/**
 * Get default instructions when none are provided
 */
function getDefaultInstructions(): string {
    return `# Task

Generate a comprehensive summary report based on the available content.

## Approach

1. Use the available tools to explore and understand the content
2. Read relevant files and search for important information
3. Synthesize the information into a coherent summary
4. Focus on key insights, trends, and important events

## Output

Provide a well-structured markdown report with:
- Clear sections and headings
- Key insights and highlights
- Important events or changes
- Relevant context and background`;
}
