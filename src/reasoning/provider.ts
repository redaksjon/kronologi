/**
 * Provider Interface
 *
 * Abstract interface for AI providers (OpenAI, Anthropic, etc.)
 * Enables swapping between different AI backends.
 */

import { CompletionResponse, Message, ToolCall } from './types';
import { Tool } from './tools/types';

export interface Provider {
    complete(
        messages: Message[],
        config: ProviderConfig
    ): Promise<CompletionResponse>;

    /**
     * Execute with tools (optional for providers that support tool use)
     */
    executeWithTools?(
        messages: Message[],
        tools: Tool[],
        config: ProviderConfig
    ): Promise<{ response: CompletionResponse; toolCalls: ToolCall[] }>;
}

export interface ProviderConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey?: string;
}
