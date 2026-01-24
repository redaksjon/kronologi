/**
 * Reasoning Client
 *
 * Main entry point for AI completions.
 * Wraps providers and provides a consistent interface.
 */

import { Provider } from './provider';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { Message, CompletionResponse, ReasoningConfig, ReasoningResult } from './types';
import { Tool, ToolContext } from './tools/types';

export class ReasoningClient {
    private provider: Provider;
    private config: ReasoningConfig;
    private toolContext?: ToolContext;

    constructor(config: ReasoningConfig, toolContext?: ToolContext) {
        this.config = config;
        this.provider = this.createProvider(config.provider);
        this.toolContext = toolContext;
    }

    private createProvider(type: 'openai' | 'anthropic'): Provider {
        if (type === 'openai') {
            return new OpenAIProvider(this.config.apiKey);
        }
        if (type === 'anthropic') {
            return new AnthropicProvider(this.config.apiKey);
        }
        throw new Error(`Unknown provider: ${type}`);
    }

    async complete(messages: Message[]): Promise<CompletionResponse> {
        return await this.provider.complete(messages, {
            model: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            apiKey: this.config.apiKey,
        });
    }

    /**
     * Execute with tools - enables agentic workflows with multi-turn tool use
     */
    async executeWithTools(
        initialMessages: Message[],
        tools: Tool[],
        options: {
            maxIterations?: number;
            onToolCall?: (call: any) => void;
        } = {}
    ): Promise<ReasoningResult> {
        if (!this.provider.executeWithTools) {
            throw new Error(`Provider ${this.config.provider} does not support tool execution`);
        }

        if (!this.toolContext) {
            throw new Error('Tool context is required for executeWithTools');
        }

        const maxIterations = options.maxIterations || 10;
        const conversationHistory: Message[] = [...initialMessages];
        const allToolCalls: any[] = [];
        let iterations = 0;
        let lastResponse: CompletionResponse | null = null;

        while (iterations < maxIterations) {
            iterations++;

            // Get response with potential tool calls
            const { response, toolCalls } = await this.provider.executeWithTools(
                conversationHistory,
                tools,
                {
                    model: this.config.model,
                    temperature: this.config.temperature,
                    maxTokens: this.config.maxTokens,
                }
            );

            lastResponse = response;

            // If no tool calls, we're done
            if (!toolCalls || toolCalls.length === 0) {
                return {
                    ...response,
                    toolCalls: allToolCalls,
                    iterations,
                };
            }

            // Execute tool calls
            for (const call of toolCalls) {
                allToolCalls.push(call);

                if (options.onToolCall) {
                    options.onToolCall(call);
                }

                const tool = tools.find(t => t.name === call.name);
                if (!tool) {
                    throw new Error(`Tool not found: ${call.name}`);
                }

                // Execute tool
                const result = await tool.execute(call.input, this.toolContext);

                // Add tool result to conversation
                conversationHistory.push({
                    role: 'assistant',
                    content: `Using tool: ${call.name}`,
                });
                conversationHistory.push({
                    role: 'user',
                    content: `Tool result: ${JSON.stringify(result)}`,
                });
            }
        }

        // Max iterations reached
        return {
            content: lastResponse?.content || '',
            usage: lastResponse?.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
            model: lastResponse?.model || this.config.model,
            stopReason: 'max_tokens' as const,
            toolCalls: allToolCalls,
            iterations,
        };
    }
}

export function createReasoningClient(config: ReasoningConfig, toolContext?: ToolContext): ReasoningClient {
    return new ReasoningClient(config, toolContext);
}
