/**
 * Reasoning Client Types
 *
 * Type definitions for the reasoning client infrastructure.
 * Provides abstractions for AI provider interactions.
 */

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface CompletionResponse {
    content: string;
    usage: TokenUsage;
    model: string;
    stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence';
}

export interface ReasoningConfig {
    provider: 'openai' | 'anthropic';  // Phase 2C: Added Anthropic
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey?: string;
}

/**
 * Tool call representation
 */
export interface ToolCall {
    id: string;
    name: string;
    input: any;
}

/**
 * Result of a tool call
 */
export interface ToolCallResult {
    toolCallId: string;
    result: any;
    error?: string;
}

/**
 * Extended response with tool execution info
 */
export interface ReasoningResult extends CompletionResponse {
    toolCalls?: ToolCall[];
    iterations: number;
}
