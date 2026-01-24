/**
 * File Tools
 *
 * Tools for reading and listing files from activity, summary, and context directories.
 */

import { z } from 'zod';
import { Tool, ToolContext, ToolResult } from './types';
import { join } from 'path';

/**
 * Tool: read_file
 * Reads the contents of a file from activity, summary, or context directory
 */
export const readFileTool: Tool = {
    name: 'read_file',
    description: 'Read the contents of a file from the activity, summary, or context directory',
    inputSchema: z.object({
        path: z.string().describe('Relative path to the file (e.g., "2026-01/summary.md")'),
        directory: z.enum(['activity', 'summary', 'context']).describe('Which directory to read from'),
    }),
    execute: async (input, context: ToolContext): Promise<ToolResult<string>> => {
        try {
            const baseDir = input.directory === 'activity'
                ? context.config.activityDirectory
                : input.directory === 'summary'
                    ? context.config.summaryDirectory
                    : context.config.contextDirectory;

            const fullPath = join(baseDir, input.path);

            if (!(await context.storage.exists(fullPath))) {
                return {
                    success: false,
                    error: `File not found: ${input.path}`,
                };
            }

            const content = await context.storage.readFile(fullPath, 'utf-8');

            return {
                success: true,
                data: content,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
};

/**
 * Tool: list_files
 * Lists files in a directory with optional pattern matching
 */
export const listFilesTool: Tool = {
    name: 'list_files',
    description: 'List files in a directory',
    inputSchema: z.object({
        directory: z.enum(['activity', 'summary', 'context']).describe('Which directory to list from'),
        path: z.string().optional().describe('Subdirectory path (optional)'),
        pattern: z.string().optional().describe('Glob pattern (e.g., "*.md")'),
    }),
    execute: async (input, context: ToolContext): Promise<ToolResult<string[]>> => {
        try {
            const baseDir = input.directory === 'activity'
                ? context.config.activityDirectory
                : input.directory === 'summary'
                    ? context.config.summaryDirectory
                    : context.config.contextDirectory;

            const targetDir = input.path ? join(baseDir, input.path) : baseDir;

            if (!(await context.storage.exists(targetDir))) {
                return {
                    success: false,
                    error: `Directory not found: ${input.path || '/'}`,
                };
            }

            const files = await context.storage.listFiles(targetDir);

            // Apply pattern filter if provided
            let filtered = files;
            if (input.pattern) {
                const regex = new RegExp(
                    input.pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
                );
                filtered = files.filter(f => regex.test(f));
            }

            return {
                success: true,
                data: filtered,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
};
