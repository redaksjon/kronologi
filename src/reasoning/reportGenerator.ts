/**
 * Report Generator
 *
 * Generates reports using the reasoning client with tool-based content exploration.
 * All reports use agentic workflows with tool execution.
 */

import { createReasoningClient } from './client';
import { Message } from './types';
import { ToolContext } from './tools/types';
import { globalToolRegistry } from './tools';
import { AnalysisConfig } from '../types';

export interface ReportResult {
    content: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    toolCalls?: any[];
    iterations?: number;
}

/**
 * Generate report using reasoning mode with tools
 */
export async function generateReport(
    analysisConfig: AnalysisConfig,
    messages: Message[],
    toolContext: ToolContext
): Promise<ReportResult> {
    const reasoningConfig = analysisConfig.reasoning!;

    const client = createReasoningClient(
        {
            provider: reasoningConfig.provider || 'anthropic',
            model: analysisConfig.model,
            temperature: analysisConfig.temperature,
            maxTokens: analysisConfig.maxCompletionTokens,
        },
        toolContext
    );

    // Get enabled tools
    const enabledToolNames = reasoningConfig.tools || ['read_file', 'list_files', 'search_files'];
    const tools = globalToolRegistry.getMany(enabledToolNames);

    if (tools.length === 0) {
        throw new Error('No tools available for reasoning mode');
    }

    const result = await client.executeWithTools(messages, tools, {
        maxIterations: reasoningConfig.maxIterations || 10,
        onToolCall: (call) => {
            toolContext.logger.info(`Tool called: ${call.name}`, call.input);
        },
    });

    return {
        content: result.content,
        usage: result.usage,
        toolCalls: result.toolCalls,
        iterations: result.iterations,
    };
}
