import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobConfig, KronologiConfig } from '../src/types';
import { AnalysisConfig } from '../src/types';

// Mock dependencies before importing the module under test
const mockGetLogger = vi.fn().mockReturnValue({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
});
const mockCreateInputs = vi.fn();
const mockReasoningClientComplete = vi.fn();

vi.mock('../src/logging', () => ({
    getLogger: mockGetLogger,
}));

vi.mock('../src/analysis/inputs', () => ({
    createInputs: mockCreateInputs,
}));

// Mock the reasoning client
vi.mock('../src/reasoning/client', () => ({
    createReasoningClient: vi.fn().mockReturnValue({
        complete: mockReasoningClientComplete,
    }),
}));

// Now import the module under test
const { runModel } = await import('../src/run');

describe('runModel', () => {
    // @ts-ignore
    const analysisConfig: AnalysisConfig = {
        model: 'gpt-4',
        temperature: 0.7,
        maxCompletionTokens: 500,
        // Add other required fields if any
    };
    // @ts-ignore
    const mindshahnConfig: KronologiConfig = { /* Mock config */ };
    // @ts-ignore
    const jobConfig: JobConfig = {
        job: 'test-job',
        year: 2023,
        month: 10,
        historyMonths: 3,
        summaryMonths: 1,
        // Add other required fields if any
    };

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        // Reset process.env if needed, or set it here
        process.env.OPENAI_API_KEY = 'test-key';
    });

    it('should call createInputs and reasoning client, returning the summary', async () => {
        const mockMonthlySummary = {
            request: {
                messages: [{ role: 'user', content: 'Test prompt' }],
            },
            contributingFiles: { content: ['file1.txt'], metadata: {} } // Ensure content is not empty
            // Add other necessary fields
        };
        const mockReasoningResponse = {
            content: 'AI generated summary',
            usage: {
                inputTokens: 50,
                outputTokens: 50,
                totalTokens: 100,
            },
            model: 'gpt-4',
            stopReason: 'end_turn' as const,
        };

        // @ts-ignore
        mockCreateInputs.mockResolvedValue(mockMonthlySummary);
        // @ts-ignore
        mockReasoningClientComplete.mockResolvedValue(mockReasoningResponse);

        const result = await runModel(analysisConfig, mindshahnConfig, jobConfig);

        expect(mockCreateInputs).toHaveBeenCalledWith(
            jobConfig.job,
            {
                year: jobConfig.year,
                month: jobConfig.month,
                historyMonths: jobConfig.historyMonths,
                summaryMonths: jobConfig.summaryMonths,
            },
            mindshahnConfig,
            jobConfig
        );
        expect(mockReasoningClientComplete).toHaveBeenCalledWith(
            mockMonthlySummary.request.messages
        );
        expect(result.aiSummary).toBe('AI generated summary');
        expect(result.aiUsage).toEqual({
            choices: [{
                message: { content: 'AI generated summary' },
                finish_reason: 'stop',
            }],
            usage: {
                prompt_tokens: 50,
                completion_tokens: 50,
                total_tokens: 100,
            },
            model: 'gpt-4',
        });
        expect(result.monthlySummary).toEqual(mockMonthlySummary);
        // @ts-ignore
        expect(mockGetLogger().info).not.toHaveBeenCalledWith(expect.stringContaining('Skipping generation'));
    });

    it('should use existingMonthlySummary if provided', async () => {
        const existingMonthlySummary = {
            request: {
                messages: [{ role: 'user', content: 'Existing prompt' }],
            },
            contributingFiles: { content: ['file2.txt'], metadata: {} }, // Ensure content is not empty
            // Add other necessary fields
        };
        const mockReasoningResponse = {
            content: 'AI summary from existing',
            usage: {
                inputTokens: 60,
                outputTokens: 60,
                totalTokens: 120,
            },
            model: 'gpt-4',
            stopReason: 'end_turn' as const,
        };

        // @ts-ignore
        mockReasoningClientComplete.mockResolvedValue(mockReasoningResponse);

        const result = await runModel(analysisConfig, mindshahnConfig, jobConfig, existingMonthlySummary);

        expect(mockCreateInputs).not.toHaveBeenCalled();
        expect(mockReasoningClientComplete).toHaveBeenCalledWith(
            existingMonthlySummary.request.messages
        );
        expect(result.aiSummary).toBe('AI summary from existing');
        expect(result.aiUsage).toEqual({
            choices: [{
                message: { content: 'AI summary from existing' },
                finish_reason: 'stop',
            }],
            usage: {
                prompt_tokens: 60,
                completion_tokens: 60,
                total_tokens: 120,
            },
            model: 'gpt-4',
        });
        expect(result.monthlySummary).toEqual(existingMonthlySummary);
        // @ts-ignore
        expect(mockGetLogger().info).not.toHaveBeenCalledWith(expect.stringContaining('Skipping generation'));
    });

});
