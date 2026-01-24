/**
 * Search Tools
 *
 * Tools for searching through files by content.
 */

import { z } from 'zod';
import { Tool, ToolContext, ToolResult } from './types';
import { join } from 'path';

export interface SearchResult {
    file: string;
    matches: string[];
    matchCount: number;
}

/**
 * Tool: search_files
 * Search for text patterns in files
 */
export const searchFilesTool: Tool = {
    name: 'search_files',
    description: 'Search for text patterns in files',
    inputSchema: z.object({
        directory: z.enum(['activity', 'summary', 'context']).describe('Which directory to search in'),
        query: z.string().describe('Text to search for'),
        path: z.string().optional().describe('Subdirectory to search in (optional)'),
        filePattern: z.string().optional().describe('File pattern (e.g., "*.md")'),
        limit: z.number().optional().describe('Max results to return'),
    }),
    execute: async (input, context: ToolContext): Promise<ToolResult<SearchResult[]>> => {
        try {
            const baseDir = input.directory === 'activity'
                ? context.config.activityDirectory
                : input.directory === 'summary'
                    ? context.config.summaryDirectory
                    : context.config.contextDirectory;

            const searchDir = input.path ? join(baseDir, input.path) : baseDir;
            const pattern = input.filePattern || '**/*.md';
            const results: SearchResult[] = [];

            await context.storage.forEachFileIn(searchDir, async (filePath) => {
                const content = await context.storage.readFile(filePath, 'utf-8');
                const lines = content.split('\n');
                const matches: string[] = [];

                lines.forEach((line, index) => {
                    if (line.toLowerCase().includes(input.query.toLowerCase())) {
                        matches.push(`Line ${index + 1}: ${line.trim()}`);
                    }
                });

                if (matches.length > 0) {
                    results.push({
                        file: filePath,
                        matches: matches.slice(0, 5), // Limit matches per file
                        matchCount: matches.length,
                    });
                }
            }, { pattern });

            // Apply result limit
            const limited = input.limit ? results.slice(0, input.limit) : results;

            return {
                success: true,
                data: limited,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
};
