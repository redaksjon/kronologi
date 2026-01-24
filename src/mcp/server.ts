#!/usr/bin/env node
/**
 * Kronologi MCP Server
 *
 * Exposes Kronologi report generation and management as MCP tools for AI assistants.
 * Allows AI tools to generate reports, manage jobs, and query historical summaries
 * without needing to understand command-line interfaces.
 *
 * Key capabilities:
 * - Generate reports for configured jobs
 * - List and query available reports
 * - Access historical summaries as resources
 * - Provide workflow prompts for common operations
 */

import 'dotenv/config';
// eslint-disable-next-line import/extensions
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// eslint-disable-next-line import/extensions
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
// eslint-disable-next-line import/extensions
} from '@modelcontextprotocol/sdk/types.js';
import * as Resources from './resources';
import * as Prompts from './prompts';
import { tools, handleToolCall } from './tools';

// ============================================================================
// Server Setup
// ============================================================================

export async function main() {
    const server = new Server(
        {
            name: 'kronologi',
            version: '0.1.0',
            description:
                'Intelligent report generation from activity logs using AI. ' +
                'Generate monthly summaries, track patterns over time, and maintain context. ' +
                'Configure jobs with personas and instructions to customize report style and content. ' +
                'Access historical reports and activity data.',
        },
        {
            capabilities: {
                tools: {},
                resources: {
                    subscribe: false,
                    listChanged: true,
                },
                prompts: {
                    listChanged: false,
                },
            },
        }
    );

    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools,
    }));

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            const result = await handleToolCall(name, args || {});
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [{ type: 'text', text: `Error: ${message}` }],
                isError: true,
            };
        }
    });

    // List available resources
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return Resources.handleListResources();
    });

    // Read a resource
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;

        try {
            const contents = await Resources.handleReadResource(uri);
            return { contents: [contents] };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    });

    // List available prompts
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: Prompts.prompts,
    }));

    // Get prompt content
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            return Prompts.handleGetPrompt(name, args);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    });

    // Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Error handling
    process.on('SIGINT', async () => {
        await server.close();
        process.exit(0);
    });
}

// Only run if this is the main module
if (require.main === module) {
    main().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Server error:', error);
        process.exit(1);
    });
}
