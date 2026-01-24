import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReasoningClient } from '../../src/reasoning/client.js';
import type { CompletionResponse } from '../../src/reasoning/types.js';
import type { Tool, ToolContext } from '../../src/reasoning/tools/types.js';

// Mock the provider modules
vi.mock('../../src/reasoning/providers/openai.js');
vi.mock('../../src/reasoning/providers/anthropic.js');

import { OpenAIProvider } from '../../src/reasoning/providers/openai.js';
import { AnthropicProvider } from '../../src/reasoning/providers/anthropic.js';

describe('ReasoningClient', () => {
    let mockToolContext: ToolContext;

    beforeEach(() => {
        vi.clearAllMocks();

        mockToolContext = {
            activityDirectory: '/test/activity',
            summaryDirectory: '/test/summary',
            contextDirectory: '/test/context',
            targetYear: 2026,
            targetMonth: 1,
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create client with openai provider', () => {
            const client = new ReasoningClient({
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 1000,
                apiKey: 'test-key',
            });

            expect(client).toBeDefined();
            expect(OpenAIProvider).toHaveBeenCalledWith('test-key');
        });

        it('should create client with anthropic provider', () => {
            const client = new ReasoningClient({
                provider: 'anthropic',
                model: 'claude-sonnet-4',
                temperature: 0.7,
                maxTokens: 1000,
                apiKey: 'test-key',
            });

            expect(client).toBeDefined();
            expect(AnthropicProvider).toHaveBeenCalledWith('test-key');
        });

        it('should throw error for unknown provider', () => {
            expect(() => {
                new ReasoningClient({
                    provider: 'unknown' as any,
                    model: 'test-model',
                    temperature: 0.7,
                    maxTokens: 1000,
                    apiKey: 'test-key',
                });
            }).toThrow('Unknown provider: unknown');
        });
    });

    describe('complete', () => {
        it('should complete simple request without tools', async () => {
            const mockResponse: CompletionResponse = {
                content: 'Test response',
                model: 'gpt-4o',
                usage: {
                    inputTokens: 10,
                    outputTokens: 20,
                    totalTokens: 30,
                },
                stopReason: 'end_turn',
            };

            const mockComplete = vi.fn().mockResolvedValue(mockResponse);
            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: mockComplete,
                executeWithTools: vi.fn(),
            } as any));

            const client = new ReasoningClient({
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 1000,
                apiKey: 'test-key',
            });

            const result = await client.complete([
                { role: 'user', content: 'Test message' },
            ]);

            expect(result.content).toBe('Test response');
            expect(result.usage?.totalTokens).toBe(30);
            expect(mockComplete).toHaveBeenCalled();
        });

        it('should handle empty response', async () => {
            const mockResponse: CompletionResponse = {
                content: '',
                model: 'gpt-4o',
                usage: {
                    inputTokens: 10,
                    outputTokens: 0,
                    totalTokens: 10,
                },
                stopReason: 'end_turn',
            };

            const mockComplete = vi.fn().mockResolvedValue(mockResponse);
            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: mockComplete,
                executeWithTools: vi.fn(),
            } as any));

            const client = new ReasoningClient({
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 1000,
                apiKey: 'test-key',
            });

            const result = await client.complete([
                { role: 'user', content: 'Test message' },
            ]);

            expect(result.content).toBe('');
        });

        it('should pass config to provider', async () => {
            const mockComplete = vi.fn().mockResolvedValue({
                content: 'Response',
                model: 'gpt-4o',
                usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
                stopReason: 'end_turn',
            });

            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: mockComplete,
                executeWithTools: vi.fn(),
            } as any));

            const client = new ReasoningClient({
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.5,
                maxTokens: 2000,
                apiKey: 'test-key',
            });

            await client.complete([{ role: 'user', content: 'Test' }]);

            expect(mockComplete).toHaveBeenCalledWith(
                [{ role: 'user', content: 'Test' }],
                expect.objectContaining({
                    model: 'gpt-4o',
                    temperature: 0.5,
                    maxTokens: 2000,
                })
            );
        });
    });

    describe('executeWithTools', () => {
        it('should handle single tool call iteration', async () => {
            const mockResponse: CompletionResponse = {
                content: 'I will read the file',
                model: 'gpt-4o',
                usage: {
                    inputTokens: 50,
                    outputTokens: 30,
                    totalTokens: 80,
                },
                stopReason: 'tool_use',
            };

            const finalResponse: CompletionResponse = {
                content: 'The file contains test data',
                model: 'gpt-4o',
                usage: {
                    inputTokens: 60,
                    outputTokens: 40,
                    totalTokens: 100,
                },
                stopReason: 'end_turn',
            };

            const mockExecuteWithTools = vi.fn()
                .mockResolvedValueOnce({
                    response: mockResponse,
                    toolCalls: [
                        {
                            id: 'call_1',
                            name: 'read_file',
                            input: { path: '/test/file.md' },
                        },
                    ],
                })
                .mockResolvedValueOnce({
                    response: finalResponse,
                    toolCalls: null,
                });

            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            } as any));

            const client = new ReasoningClient(
                {
                    provider: 'openai',
                    model: 'gpt-4o',
                    temperature: 0.7,
                    maxTokens: 1000,
                    apiKey: 'test-key',
                },
                mockToolContext
            );

            const mockTool: Tool = {
                name: 'read_file',
                description: 'Read a file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                    },
                    required: ['path'],
                },
                execute: async () => ({
                    success: true,
                    content: 'File content here',
                }),
            };

            const result = await client.executeWithTools(
                [{ role: 'user', content: 'Read /test/file.md' }],
                [mockTool],
                { maxIterations: 5 }
            );

            expect(result.content).toBe('The file contains test data');
            expect(result.usage?.totalTokens).toBe(100);
            expect(result.iterations).toBe(2);
        });

        it('should handle multiple tool call iterations', async () => {
            const mockExecuteWithTools = vi.fn()
                .mockResolvedValueOnce({
                    response: {
                        content: 'I will list files',
                        model: 'gpt-4o',
                        usage: { inputTokens: 50, outputTokens: 30, totalTokens: 80 },
                        stopReason: 'tool_use',
                    },
                    toolCalls: [
                        { id: 'call_1', name: 'list_files', input: { directory: '/test' } },
                    ],
                })
                .mockResolvedValueOnce({
                    response: {
                        content: 'Now I will read the first file',
                        model: 'gpt-4o',
                        usage: { inputTokens: 60, outputTokens: 35, totalTokens: 95 },
                        stopReason: 'tool_use',
                    },
                    toolCalls: [
                        { id: 'call_2', name: 'read_file', input: { path: '/test/file1.md' } },
                    ],
                })
                .mockResolvedValueOnce({
                    response: {
                        content: 'Here is the analysis',
                        model: 'gpt-4o',
                        usage: { inputTokens: 70, outputTokens: 50, totalTokens: 120 },
                        stopReason: 'end_turn',
                    },
                    toolCalls: null,
                });

            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            } as any));

            const client = new ReasoningClient(
                {
                    provider: 'openai',
                    model: 'gpt-4o',
                    temperature: 0.7,
                    maxTokens: 1000,
                    apiKey: 'test-key',
                },
                mockToolContext
            );

            const mockTools: Tool[] = [
                {
                    name: 'list_files',
                    description: 'List files',
                    inputSchema: {
                        type: 'object',
                        properties: { directory: { type: 'string' } },
                        required: ['directory'],
                    },
                    execute: async () => ({
                        success: true,
                        files: ['file1.md', 'file2.md'],
                    }),
                },
                {
                    name: 'read_file',
                    description: 'Read a file',
                    inputSchema: {
                        type: 'object',
                        properties: { path: { type: 'string' } },
                        required: ['path'],
                    },
                    execute: async () => ({
                        success: true,
                        content: 'File content',
                    }),
                },
            ];

            const result = await client.executeWithTools(
                [{ role: 'user', content: 'Analyze files in /test' }],
                mockTools,
                { maxIterations: 5 }
            );

            expect(result.content).toBe('Here is the analysis');
            expect(result.usage?.totalTokens).toBe(120);
            expect(result.iterations).toBe(3);
        });

        it('should stop at maxIterations', async () => {
            // Always return tool calls to simulate infinite loop
            const mockExecuteWithTools = vi.fn().mockResolvedValue({
                response: {
                    content: 'More tools needed',
                    model: 'gpt-4o',
                    usage: { inputTokens: 50, outputTokens: 30, totalTokens: 80 },
                    stopReason: 'tool_use',
                },
                toolCalls: [
                    { id: 'call_1', name: 'read_file', input: { path: '/file.md' } },
                ],
            });

            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            } as any));

            const client = new ReasoningClient(
                {
                    provider: 'openai',
                    model: 'gpt-4o',
                    temperature: 0.7,
                    maxTokens: 1000,
                    apiKey: 'test-key',
                },
                mockToolContext
            );

            const mockTool: Tool = {
                name: 'read_file',
                description: 'Read a file',
                inputSchema: {
                    type: 'object',
                    properties: { path: { type: 'string' } },
                    required: ['path'],
                },
                execute: async () => ({
                    success: true,
                    content: 'File content',
                }),
            };

            const result = await client.executeWithTools(
                [{ role: 'user', content: 'Test message' }],
                [mockTool],
                { maxIterations: 3 }
            );

            // Should stop after 3 iterations
            expect(result.iterations).toBe(3);
            expect(result.stopReason).toBe('max_tokens');
        });

        it('should throw error if tool context is missing', async () => {
            vi.mocked(OpenAIProvider).mockImplementation(() => ({
                complete: vi.fn(),
                executeWithTools: vi.fn(),
            } as any));

            const client = new ReasoningClient({
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 1000,
                apiKey: 'test-key',
            });

            const mockTool: Tool = {
                name: 'read_file',
                description: 'Read a file',
                inputSchema: {
                    type: 'object',
                    properties: { path: { type: 'string' } },
                    required: ['path'],
                },
                execute: async () => ({
                    success: true,
                    content: 'Content',
                }),
            };

            await expect(
                client.executeWithTools(
                    [{ role: 'user', content: 'Test' }],
                    [mockTool],
                    { maxIterations: 5 }
                )
            ).rejects.toThrow('Tool context is required for executeWithTools');
        });

        it('should throw error if provider does not support tools', async () => {
            const mockProvider = {
                complete: vi.fn(),
                // No executeWithTools method
            };

            vi.mocked(OpenAIProvider).mockImplementation(() => mockProvider as any);

            const client = new ReasoningClient(
                {
                    provider: 'openai',
                    model: 'gpt-4o',
                    temperature: 0.7,
                    maxTokens: 1000,
                    apiKey: 'test-key',
                },
                mockToolContext
            );

            const mockTool: Tool = {
                name: 'read_file',
                description: 'Read a file',
                inputSchema: {
                    type: 'object',
                    properties: { path: { type: 'string' } },
                    required: ['path'],
                },
                execute: async () => ({
                    success: true,
                    content: 'Content',
                }),
            };

            await expect(
                client.executeWithTools(
                    [{ role: 'user', content: 'Test' }],
                    [mockTool],
                    { maxIterations: 5 }
                )
            ).rejects.toThrow('Provider openai does not support tool execution');
        });
    });
});
