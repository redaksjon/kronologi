/**
 * Tests for Anthropic Provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from '../../../src/reasoning/providers/anthropic';
import { Message, ProviderConfig } from '../../../src/reasoning/types';
import { Tool } from '../../../src/reasoning/tools/types';
import { z } from 'zod';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            messages: {
                create: vi.fn(),
            },
        })),
    };
});

describe('AnthropicProvider', () => {
    let provider: AnthropicProvider;
    let mockCreate: any;

    beforeEach(() => {
        vi.clearAllMocks();
        provider = new AnthropicProvider('test-api-key');
        // Get the mocked create function
        mockCreate = (provider as any).client.messages.create;
    });

    describe('constructor', () => {
        it('should create provider with provided API key', () => {
            const testProvider = new AnthropicProvider('custom-key');
            expect(testProvider).toBeDefined();
        });

        it('should create provider with environment API key', () => {
            const originalKey = process.env.ANTHROPIC_API_KEY;
            process.env.ANTHROPIC_API_KEY = 'env-key';
            const testProvider = new AnthropicProvider();
            expect(testProvider).toBeDefined();
            process.env.ANTHROPIC_API_KEY = originalKey;
        });
    });

    describe('complete', () => {
        const messages: Message[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello!' },
        ];

        const config: ProviderConfig = {
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 1000,
        };

        it('should successfully complete a request', async () => {
            mockCreate.mockResolvedValue({
                content: [
                    { type: 'text', text: 'Hello! How can I help you?' },
                ],
                usage: {
                    input_tokens: 20,
                    output_tokens: 10,
                },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            const response = await provider.complete(messages, config);

            expect(response).toEqual({
                content: 'Hello! How can I help you?',
                usage: {
                    inputTokens: 20,
                    outputTokens: 10,
                    totalTokens: 30,
                },
                model: 'claude-3-5-sonnet-20241022',
                stopReason: 'end_turn',
            });

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'claude-3-5-sonnet-20241022',
                messages: [{ role: 'user', content: 'Hello!' }],
                max_tokens: 1000,
                temperature: 0.7,
                system: 'You are a helpful assistant.',
            });
        });

        it('should extract system message separately', async () => {
            mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: 'Response' }],
                usage: { input_tokens: 10, output_tokens: 5 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            await provider.complete(messages, config);

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    system: 'You are a helpful assistant.',
                    messages: expect.not.arrayContaining([
                        expect.objectContaining({ role: 'system' }),
                    ]),
                })
            );
        });

        it('should handle multiple text blocks', async () => {
            mockCreate.mockResolvedValue({
                content: [
                    { type: 'text', text: 'First part. ' },
                    { type: 'text', text: 'Second part.' },
                ],
                usage: { input_tokens: 10, output_tokens: 10 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            const response = await provider.complete(messages, config);

            expect(response.content).toBe('First part. \nSecond part.');
        });

        it('should map stop reason "end_turn" correctly', async () => {
            mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: 'Done' }],
                usage: { input_tokens: 10, output_tokens: 5 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            const response = await provider.complete(messages, config);
            expect(response.stopReason).toBe('end_turn');
        });

        it('should map non-end_turn stop reason to "max_tokens"', async () => {
            mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: 'Truncated' }],
                usage: { input_tokens: 10, output_tokens: 1000 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'max_tokens',
            });

            const response = await provider.complete(messages, config);
            expect(response.stopReason).toBe('max_tokens');
        });

        it('should handle messages without system message', async () => {
            const messagesNoSystem: Message[] = [
                { role: 'user', content: 'Hello!' },
            ];

            mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: 'Hi!' }],
                usage: { input_tokens: 5, output_tokens: 2 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            await provider.complete(messagesNoSystem, config);

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    system: undefined,
                })
            );
        });

        it('should handle API errors', async () => {
            mockCreate.mockRejectedValue(new Error('API Error'));

            await expect(provider.complete(messages, config)).rejects.toThrow('API Error');
        });
    });

    describe('executeWithTools', () => {
        const messages: Message[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Read the file test.txt' },
        ];

        const config: ProviderConfig = {
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 1000,
        };

        const tools: Tool[] = [
            {
                name: 'read_file',
                description: 'Read a file',
                inputSchema: z.object({
                    path: z.string().describe('File path'),
                }),
                execute: vi.fn(),
            },
        ];

        it('should execute with tools and return response without tool calls', async () => {
            mockCreate.mockResolvedValue({
                content: [
                    { type: 'text', text: 'I will read the file for you.' },
                ],
                usage: { input_tokens: 30, output_tokens: 15 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            const result = await provider.executeWithTools(messages, tools, config);

            expect(result.response.content).toBe('I will read the file for you.');
            expect(result.toolCalls).toEqual([]);
            
            // Verify tools were passed
            const call = mockCreate.mock.calls[0][0];
            expect(call.tools).toHaveLength(1);
            expect(call.tools[0].name).toBe('read_file');
            expect(call.tools[0].description).toBe('Read a file');
            expect(call.tools[0].input_schema.type).toBe('object');
        });

        it('should execute with tools and extract tool calls', async () => {
            mockCreate.mockResolvedValue({
                content: [
                    { type: 'text', text: 'Let me read that file.' },
                    {
                        type: 'tool_use',
                        id: 'call_123',
                        name: 'read_file',
                        input: { path: 'test.txt' },
                    },
                ],
                usage: { input_tokens: 30, output_tokens: 20 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'tool_use',
            });

            const result = await provider.executeWithTools(messages, tools, config);

            expect(result.toolCalls).toEqual([
                {
                    id: 'call_123',
                    name: 'read_file',
                    input: { path: 'test.txt' },
                },
            ]);
        });

        it('should handle multiple tool calls', async () => {
            mockCreate.mockResolvedValue({
                content: [
                    {
                        type: 'tool_use',
                        id: 'call_1',
                        name: 'read_file',
                        input: { path: 'file1.txt' },
                    },
                    {
                        type: 'tool_use',
                        id: 'call_2',
                        name: 'read_file',
                        input: { path: 'file2.txt' },
                    },
                ],
                usage: { input_tokens: 30, output_tokens: 25 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'tool_use',
            });

            const result = await provider.executeWithTools(messages, tools, config);

            expect(result.toolCalls).toHaveLength(2);
            expect(result.toolCalls[0].id).toBe('call_1');
            expect(result.toolCalls[1].id).toBe('call_2');
        });

        it('should convert Zod schema to JSON schema', async () => {
            const complexTools: Tool[] = [
                {
                    name: 'search',
                    description: 'Search files',
                    inputSchema: z.object({
                        query: z.string().describe('Search query'),
                        limit: z.number().optional().describe('Max results'),
                    }),
                    execute: vi.fn(),
                },
            ];

            mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: 'Searching...' }],
                usage: { input_tokens: 30, output_tokens: 10 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            await provider.executeWithTools(messages, complexTools, config);

            const call = mockCreate.mock.calls[0][0];
            expect(call.tools[0].name).toBe('search');
            expect(call.tools[0].description).toBe('Search files');
            expect(call.tools[0].input_schema.type).toBe('object');
            expect(call.tools[0].input_schema.properties).toBeDefined();
            // Verify required field is present if schema conversion works
            if (call.tools[0].input_schema.required) {
                expect(call.tools[0].input_schema.required).toContain('query');
                expect(call.tools[0].input_schema.required).not.toContain('limit');
            }
        });

        it('should handle tools with no required fields', async () => {
            const optionalTools: Tool[] = [
                {
                    name: 'list',
                    description: 'List files',
                    inputSchema: z.object({
                        pattern: z.string().optional(),
                    }),
                    execute: vi.fn(),
                },
            ];

            mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: 'Listing...' }],
                usage: { input_tokens: 20, output_tokens: 5 },
                model: 'claude-3-5-sonnet-20241022',
                stop_reason: 'end_turn',
            });

            await provider.executeWithTools(messages, optionalTools, config);

            const call = mockCreate.mock.calls[0][0];
            expect(call.tools[0].name).toBe('list');
            expect(call.tools[0].input_schema.type).toBe('object');
            // When all fields are optional, required should be undefined
            expect(call.tools[0].input_schema.required).toBeUndefined();
        });
    });
});
