/**
 * Report Generator
 *
 * Generates reports using the reasoning client with optional tool use.
 * Supports both simple (one-shot) and agentic (tool-enabled) modes.
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
 * Generate report in simple mode (no tools)
 */
export async function generateReportSimple(
    analysisConfig: AnalysisConfig,
    messages: Message[]
): Promise<ReportResult> {
    const client = createReasoningClient({
        provider: 'openai',  // Default to OpenAI for simple mode
        model: analysisConfig.model,
        temperature: analysisConfig.temperature,
        maxTokens: analysisConfig.maxCompletionTokens,
    });

    const response = await client.complete(messages);

    return {
        content: response.content,
        usage: response.usage,
    };
}

/**
 * Generate report with tools (agentic mode)
 */
export async function generateReportWithTools(
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
