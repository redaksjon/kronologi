/**
 * Tests for Report Generator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateReportSimple, generateReportWithTools } from '../../src/reasoning/reportGenerator';
import { AnalysisConfig } from '../../src/types';
import { Message } from '../../src/reasoning/types';
import { ToolContext } from '../../src/reasoning/tools/types';
import * as client from '../../src/reasoning/client';

// Mock the reasoning client
vi.mock('../../src/reasoning/client', () => ({
    createReasoningClient: vi.fn(),
}));

describe('Report Generator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateReportSimple', () => {
        const analysisConfig: AnalysisConfig = {
            model: 'gpt-4',
            temperature: 0.7,
            maxCompletionTokens: 1000,
            activityDirectory: '/test/activity',
            summaryDirectory: '/test/summary',
            contextDirectory: '/test/context',
        };

        const messages: Message[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Generate a report.' },
        ];

        it('should generate report in simple mode', async () => {
            const mockComplete = vi.fn().mockResolvedValue({
                content: 'Report content',
                usage: {
                    inputTokens: 100,
                    outputTokens: 50,
                    totalTokens: 150,
                },
                model: 'gpt-4',
                stopReason: 'end_turn',
            });

            const mockClient = {
                complete: mockComplete,
                executeWithTools: vi.fn(),
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            const result = await generateReportSimple(analysisConfig, messages);

            expect(result).toEqual({
                content: 'Report content',
                usage: {
                    inputTokens: 100,
                    outputTokens: 50,
                    totalTokens: 150,
                },
            });

            expect(client.createReasoningClient).toHaveBeenCalledWith({
                provider: 'openai',
                model: 'gpt-4',
                temperature: 0.7,
                maxTokens: 1000,
            });

            expect(mockComplete).toHaveBeenCalledWith(messages);
        });

        it('should handle different models', async () => {
            const mockComplete = vi.fn().mockResolvedValue({
                content: 'Report',
                usage: { inputTokens: 50, outputTokens: 25, totalTokens: 75 },
                model: 'gpt-3.5-turbo',
                stopReason: 'end_turn',
            });

            const mockClient = {
                complete: mockComplete,
                executeWithTools: vi.fn(),
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            const customConfig = {
                ...analysisConfig,
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                maxCompletionTokens: 500,
            };

            await generateReportSimple(customConfig, messages);

            expect(client.createReasoningClient).toHaveBeenCalledWith({
                provider: 'openai',
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                maxTokens: 500,
            });
        });

        it('should propagate errors from client', async () => {
            const mockComplete = vi.fn().mockRejectedValue(new Error('API Error'));

            const mockClient = {
                complete: mockComplete,
                executeWithTools: vi.fn(),
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await expect(generateReportSimple(analysisConfig, messages)).rejects.toThrow('API Error');
        });
    });

    describe('generateReportWithTools', () => {
        const analysisConfig: AnalysisConfig = {
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxCompletionTokens: 2000,
            activityDirectory: '/test/activity',
            summaryDirectory: '/test/summary',
            contextDirectory: '/test/context',
            reasoning: {
                provider: 'anthropic',
                tools: ['read_file', 'list_files'],
                maxIterations: 5,
            },
        };

        const messages: Message[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Analyze the activity files.' },
        ];

        const toolContext: ToolContext = {
            config: {
                activityDirectory: '/test/activity',
                summaryDirectory: '/test/summary',
                contextDirectory: '/test/context',
            },
            logger: {
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
            } as any,
        };

        it('should generate report with tools', async () => {
            const mockExecuteWithTools = vi.fn().mockResolvedValue({
                content: 'Analyzed report',
                usage: {
                    inputTokens: 200,
                    outputTokens: 100,
                    totalTokens: 300,
                },
                toolCalls: [
                    { id: 'call_1', name: 'read_file', input: { path: 'test.md' } },
                ],
                iterations: 2,
            });

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            const result = await generateReportWithTools(analysisConfig, messages, toolContext);

            expect(result).toEqual({
                content: 'Analyzed report',
                usage: {
                    inputTokens: 200,
                    outputTokens: 100,
                    totalTokens: 300,
                },
                toolCalls: [
                    { id: 'call_1', name: 'read_file', input: { path: 'test.md' } },
                ],
                iterations: 2,
            });

            expect(client.createReasoningClient).toHaveBeenCalledWith(
                {
                    provider: 'anthropic',
                    model: 'claude-3-5-sonnet-20241022',
                    temperature: 0.7,
                    maxTokens: 2000,
                },
                toolContext
            );

            expect(mockExecuteWithTools).toHaveBeenCalledWith(
                messages,
                expect.any(Array),
                expect.objectContaining({
                    maxIterations: 5,
                    onToolCall: expect.any(Function),
                })
            );
        });

        it('should use default provider if not specified', async () => {
            const configWithoutProvider = {
                ...analysisConfig,
                reasoning: {
                    tools: ['read_file'],
                },
            };

            const mockExecuteWithTools = vi.fn().mockResolvedValue({
                content: 'Report',
                usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
                toolCalls: [],
                iterations: 1,
            });

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await generateReportWithTools(configWithoutProvider, messages, toolContext);

            expect(client.createReasoningClient).toHaveBeenCalledWith(
                expect.objectContaining({
                    provider: 'anthropic',
                }),
                toolContext
            );
        });

        it('should use default tools if not specified', async () => {
            const configWithoutTools = {
                ...analysisConfig,
                reasoning: {
                    provider: 'anthropic',
                },
            };

            const mockExecuteWithTools = vi.fn().mockResolvedValue({
                content: 'Report',
                usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
                toolCalls: [],
                iterations: 1,
            });

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await generateReportWithTools(configWithoutTools, messages, toolContext);

            // Verify default tools were requested
            expect(mockExecuteWithTools).toHaveBeenCalledWith(
                messages,
                expect.any(Array),
                expect.any(Object)
            );
        });

        it('should use default maxIterations if not specified', async () => {
            const configWithoutMaxIterations = {
                ...analysisConfig,
                reasoning: {
                    provider: 'anthropic',
                    tools: ['read_file'],
                },
            };

            const mockExecuteWithTools = vi.fn().mockResolvedValue({
                content: 'Report',
                usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
                toolCalls: [],
                iterations: 1,
            });

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await generateReportWithTools(configWithoutMaxIterations, messages, toolContext);

            expect(mockExecuteWithTools).toHaveBeenCalledWith(
                messages,
                expect.any(Array),
                expect.objectContaining({
                    maxIterations: 10,
                })
            );
        });

        it('should log tool calls', async () => {
            const mockExecuteWithTools = vi.fn().mockResolvedValue({
                content: 'Report',
                usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
                toolCalls: [],
                iterations: 1,
            });

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await generateReportWithTools(analysisConfig, messages, toolContext);

            // Get the onToolCall callback
            const call = mockExecuteWithTools.mock.calls[0];
            const options = call[2];
            const onToolCall = options.onToolCall;

            // Simulate a tool call
            onToolCall({ id: 'test', name: 'read_file', input: { path: 'test.md' } });

            expect(toolContext.logger.info).toHaveBeenCalledWith(
                'Tool called: read_file',
                { path: 'test.md' }
            );
        });

        it('should throw error if no tools available', async () => {
            const configWithInvalidTools = {
                ...analysisConfig,
                reasoning: {
                    provider: 'anthropic',
                    tools: ['nonexistent_tool'],
                },
            };

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: vi.fn(),
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await expect(
                generateReportWithTools(configWithInvalidTools, messages, toolContext)
            ).rejects.toThrow('No tools available for reasoning mode');
        });

        it('should propagate errors from client', async () => {
            const mockExecuteWithTools = vi.fn().mockRejectedValue(new Error('Tool execution failed'));

            const mockClient = {
                complete: vi.fn(),
                executeWithTools: mockExecuteWithTools,
            };

            vi.mocked(client.createReasoningClient).mockReturnValue(mockClient as any);

            await expect(
                generateReportWithTools(analysisConfig, messages, toolContext)
            ).rejects.toThrow('Tool execution failed');
        });
    });
});
