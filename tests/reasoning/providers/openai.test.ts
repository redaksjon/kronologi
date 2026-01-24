/**
 * Tests for OpenAI Provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '../../../src/reasoning/providers/openai';
import { Message, ProviderConfig } from '../../../src/reasoning/types';

// Mock the OpenAI SDK
vi.mock('openai', () => {
    return {
        OpenAI: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn(),
                },
            },
        })),
    };
});

describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;
    let mockCreate: any;

    beforeEach(() => {
        vi.clearAllMocks();
        provider = new OpenAIProvider('test-api-key');
        // Get the mocked create function
        mockCreate = (provider as any).client.chat.completions.create;
    });

    describe('constructor', () => {
        it('should create provider with provided API key', () => {
            const testProvider = new OpenAIProvider('custom-key');
            expect(testProvider).toBeDefined();
        });

        it('should create provider with environment API key', () => {
            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'env-key';
            const testProvider = new OpenAIProvider();
            expect(testProvider).toBeDefined();
            process.env.OPENAI_API_KEY = originalKey;
        });
    });

    describe('complete', () => {
        const messages: Message[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello!' },
        ];

        const config: ProviderConfig = {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000,
        };

        it('should successfully complete a request', async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: { content: 'Hello! How can I help you?' },
                        finish_reason: 'stop',
                    },
                ],
                usage: {
                    prompt_tokens: 20,
                    completion_tokens: 10,
                    total_tokens: 30,
                },
                model: 'gpt-4',
            });

            const response = await provider.complete(messages, config);

            expect(response).toEqual({
                content: 'Hello! How can I help you?',
                usage: {
                    inputTokens: 20,
                    outputTokens: 10,
                    totalTokens: 30,
                },
                model: 'gpt-4',
                stopReason: 'end_turn',
            });

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'gpt-4',
                messages,
                temperature: 0.7,
                max_completion_tokens: 1000,
            });
        });

        it('should handle empty content', async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: { content: null },
                        finish_reason: 'stop',
                    },
                ],
                usage: {
                    prompt_tokens: 20,
                    completion_tokens: 0,
                    total_tokens: 20,
                },
                model: 'gpt-4',
            });

            const response = await provider.complete(messages, config);

            expect(response.content).toBe('');
        });

        it('should handle missing usage data', async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: { content: 'Response' },
                        finish_reason: 'stop',
                    },
                ],
                usage: undefined,
                model: 'gpt-4',
            });

            const response = await provider.complete(messages, config);

            expect(response.usage).toEqual({
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
            });
        });

        it('should map stop reason "stop" to "end_turn"', async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: { content: 'Done' },
                        finish_reason: 'stop',
                    },
                ],
                usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
                model: 'gpt-4',
            });

            const response = await provider.complete(messages, config);
            expect(response.stopReason).toBe('end_turn');
        });

        it('should map stop reason "length" to "max_tokens"', async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: { content: 'Truncated...' },
                        finish_reason: 'length',
                    },
                ],
                usage: { prompt_tokens: 10, completion_tokens: 1000, total_tokens: 1010 },
                model: 'gpt-4',
            });

            const response = await provider.complete(messages, config);
            expect(response.stopReason).toBe('max_tokens');
        });

        it('should map unknown stop reason to "stop_sequence"', async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: { content: 'Done' },
                        finish_reason: 'content_filter',
                    },
                ],
                usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
                model: 'gpt-4',
            });

            const response = await provider.complete(messages, config);
            expect(response.stopReason).toBe('stop_sequence');
        });

        it('should handle API errors', async () => {
            mockCreate.mockRejectedValue(new Error('API Error'));

            await expect(provider.complete(messages, config)).rejects.toThrow('API Error');
        });

        it('should use provided config parameters', async () => {
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
                usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
                model: 'gpt-3.5-turbo',
            });

            const customConfig: ProviderConfig = {
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                maxTokens: 500,
            };

            await provider.complete(messages, customConfig);

            expect(mockCreate).toHaveBeenCalledWith({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: 0.3,
                max_completion_tokens: 500,
            });
        });
    });
});
