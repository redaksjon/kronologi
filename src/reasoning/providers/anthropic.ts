/**
 * Anthropic Provider
 *
 * Implements the Provider interface for Anthropic's Claude API.
 * Supports tool use for agentic workflows.
 */

import Anthropic from '@anthropic-ai/sdk';
import { Provider, ProviderConfig } from '../provider';
import { CompletionResponse, Message, ToolCall } from '../types';
import { Tool } from '../tools/types';

export class AnthropicProvider implements Provider {
    private client: Anthropic;

    constructor(apiKey?: string) {
        this.client = new Anthropic({
            apiKey: apiKey || process.env.ANTHROPIC_API_KEY
        });
    }

    async complete(
        messages: Message[],
        config: ProviderConfig
    ): Promise<CompletionResponse> {
        const response = await this.client.messages.create({
            model: config.model,
            messages: this.convertMessages(messages),
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            system: this.extractSystemMessage(messages),
        });

        return {
            content: this.extractContent(response),
            usage: {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            },
            model: response.model,
            stopReason: response.stop_reason === 'end_turn' ? 'end_turn' : 'max_tokens',
        };
    }

    async executeWithTools(
        messages: Message[],
        tools: Tool[],
        config: ProviderConfig
    ): Promise<{ response: CompletionResponse; toolCalls: ToolCall[] }> {
        const anthropicTools = tools.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: this.zodToJsonSchema(t.inputSchema),
        }));

        const response = await this.client.messages.create({
            model: config.model,
            messages: this.convertMessages(messages),
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            system: this.extractSystemMessage(messages),
            tools: anthropicTools,
        });

        const toolCalls: ToolCall[] = [];
        if (response.stop_reason === 'tool_use') {
            // Extract tool calls from response
            for (const block of response.content) {
                if (block.type === 'tool_use') {
                    toolCalls.push({
                        id: block.id,
                        name: block.name,
                        input: block.input,
                    });
                }
            }
        }

        return {
            response: {
                content: this.extractContent(response),
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                    totalTokens: response.usage.input_tokens + response.usage.output_tokens,
                },
                model: response.model,
                stopReason: response.stop_reason === 'end_turn' ? 'end_turn' : 'max_tokens',
            },
            toolCalls,
        };
    }

    private convertMessages(messages: Message[]): Anthropic.MessageParam[] {
        // Filter out system messages (handled separately)
        return messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));
    }

    private extractSystemMessage(messages: Message[]): string | undefined {
        const systemMessage = messages.find(m => m.role === 'system');
        return systemMessage?.content;
    }

    private extractContent(response: Anthropic.Message): string {
        // Extract text content from response
        return response.content
            .filter((block): block is Anthropic.TextBlock => block.type === 'text')
            .map(block => block.text)
            .join('\n');
    }

    private zodToJsonSchema(schema: any): any {
        // Simple Zod to JSON Schema conversion
        // For production, consider using zod-to-json-schema library
        
        // Handle ZodObject
        if (schema._def?.typeName === 'ZodObject') {
            const shape = schema._def.shape();
            const properties: any = {};
            const required: string[] = [];

            for (const [key, value] of Object.entries(shape)) {
                const field = value as any;
                const isOptional = field._def?.typeName === 'ZodOptional';
                
                // Get the actual field (unwrap optional)
                const actualField = isOptional ? field._def.innerType : field;
                
                properties[key] = {
                    type: this.getJsonType(actualField),
                    description: actualField._def?.description || undefined,
                };

                // Add to required if not optional
                if (!isOptional) {
                    required.push(key);
                }
            }

            return {
                type: 'object',
                properties,
                required: required.length > 0 ? required : undefined,
            };
        }

        // Fallback for other types
        return { type: 'object', properties: {} };
    }

    private getJsonType(field: any): string {
        const typeName = field._def?.typeName;
        if (!typeName) return 'string';

        if (typeName.includes('String')) return 'string';
        if (typeName.includes('Number')) return 'number';
        if (typeName.includes('Boolean')) return 'boolean';
        if (typeName.includes('Array')) return 'array';
        if (typeName.includes('Object')) return 'object';
        if (typeName.includes('Enum')) return 'string';

        return 'string';
    }
}
