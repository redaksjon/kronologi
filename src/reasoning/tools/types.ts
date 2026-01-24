/**
 * Tool Types
 *
 * Defines the structure and context for tools used by the reasoning client.
 * Tools enable AI to actively search, read, and analyze files.
 */

import { z } from 'zod';
import * as Storage from '../../util/storage';
import { KronologiConfig, JobConfig } from '../../types';
import { Logger } from 'winston';

/**
 * Context provided to tools during execution
 * Gives tools access to filesystem, configuration, and logging
 */
export interface ToolContext {
    storage: Storage.Utility;
    config: KronologiConfig;
    job: JobConfig;
    logger: Logger;
}

/**
 * Tool definition with input schema and execution logic
 */
export interface Tool<TInput = any, TOutput = any> {
    name: string;
    description: string;
    inputSchema: z.ZodSchema<TInput>;
    execute: (input: TInput, context: ToolContext) => Promise<TOutput>;
}

/**
 * Result wrapper for tool execution
 */
export interface ToolResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
