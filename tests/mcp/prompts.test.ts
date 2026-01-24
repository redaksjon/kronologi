/**
 * Tests for MCP Prompts
 */

import { describe, it, expect } from 'vitest';
import { prompts, handleGetPrompt } from '../../src/mcp/prompts';

describe('MCP Prompts', () => {
    describe('Prompt Definitions', () => {
        it('should export 2 prompts', () => {
            expect(prompts).toHaveLength(2);
        });

        it('should have generate-monthly-report prompt', () => {
            const prompt = prompts.find(p => p.name === 'generate-monthly-report');
            expect(prompt).toBeDefined();
            expect(prompt?.description).toContain('Generate');
            expect(prompt?.arguments).toHaveLength(3);
            expect(prompt?.arguments?.map(a => a.name)).toEqual(['job', 'year', 'month']);
        });

        it('should have review-recent-reports prompt', () => {
            const prompt = prompts.find(p => p.name === 'review-recent-reports');
            expect(prompt).toBeDefined();
            expect(prompt?.description).toContain('Review');
            expect(prompt?.arguments).toHaveLength(1);
            expect(prompt?.arguments?.[0].name).toBe('job');
        });

        it('should mark required arguments', () => {
            const generatePrompt = prompts.find(p => p.name === 'generate-monthly-report');
            expect(generatePrompt?.arguments?.every(a => a.required)).toBe(true);

            const reviewPrompt = prompts.find(p => p.name === 'review-recent-reports');
            expect(reviewPrompt?.arguments?.[0].required).toBe(true);
        });
    });

    describe('handleGetPrompt', () => {
        describe('generate-monthly-report', () => {
            it('should return prompt with provided arguments', async () => {
                const result = await handleGetPrompt('generate-monthly-report', {
                    job: 'monthly-summary',
                    year: '2026',
                    month: '1',
                });

                expect(result.messages).toHaveLength(1);
                expect(result.messages[0].role).toBe('user');
                expect(result.messages[0].content.type).toBe('text');
                expect(result.messages[0].content.text).toContain('monthly-summary');
                expect(result.messages[0].content.text).toContain('2026');
                expect(result.messages[0].content.text).toContain('1');
            });

            it('should use placeholders when arguments not provided', async () => {
                const result = await handleGetPrompt('generate-monthly-report');

                expect(result.messages[0].content.text).toContain('{JOB_NAME}');
                expect(result.messages[0].content.text).toContain('{YEAR}');
                expect(result.messages[0].content.text).toContain('{MONTH}');
            });

            it('should include workflow instructions', async () => {
                const result = await handleGetPrompt('generate-monthly-report', {
                    job: 'test',
                    year: '2026',
                    month: '1',
                });

                const text = result.messages[0].content.text;
                expect(text).toContain('generate_report tool');
                expect(text).toContain('Review the generated report');
                expect(text).toContain('list_jobs');
                expect(text).toContain('activity files');
            });

            it('should provide troubleshooting steps', async () => {
                const result = await handleGetPrompt('generate-monthly-report');

                const text = result.messages[0].content.text;
                expect(text).toContain('If there were any issues');
                expect(text).toContain('configured correctly');
                expect(text).toContain('error messages');
            });
        });

        describe('review-recent-reports', () => {
            it('should return prompt with job argument', async () => {
                const result = await handleGetPrompt('review-recent-reports', {
                    job: 'monthly-summary',
                });

                expect(result.messages).toHaveLength(1);
                expect(result.messages[0].role).toBe('user');
                expect(result.messages[0].content.text).toContain('monthly-summary');
            });

            it('should use placeholder when job not provided', async () => {
                const result = await handleGetPrompt('review-recent-reports');

                expect(result.messages[0].content.text).toContain('{JOB_NAME}');
            });

            it('should include analysis workflow', async () => {
                const result = await handleGetPrompt('review-recent-reports', {
                    job: 'test',
                });

                const text = result.messages[0].content.text;
                expect(text).toContain('list_reports');
                expect(text).toContain('3 most recent reports');
                expect(text).toContain('get_report');
                expect(text).toContain('Analyze the reports');
            });

            it('should include analysis criteria', async () => {
                const result = await handleGetPrompt('review-recent-reports');

                const text = result.messages[0].content.text;
                expect(text).toContain('Common themes or patterns');
                expect(text).toContain('Changes over time');
                expect(text).toContain('recurring issues');
                expect(text).toContain('summary of your findings');
            });
        });

        describe('unknown prompt', () => {
            it('should throw error for unknown prompt', async () => {
                await expect(
                    handleGetPrompt('unknown-prompt')
                ).rejects.toThrow('Unknown prompt');
            });

            it('should include prompt name in error', async () => {
                await expect(
                    handleGetPrompt('invalid-prompt')
                ).rejects.toThrow('invalid-prompt');
            });
        });

        describe('prompt structure', () => {
            it('should return messages array', async () => {
                const result = await handleGetPrompt('generate-monthly-report');
                expect(Array.isArray(result.messages)).toBe(true);
            });

            it('should have user role messages', async () => {
                const result = await handleGetPrompt('generate-monthly-report');
                expect(result.messages[0].role).toBe('user');
            });

            it('should have text content type', async () => {
                const result = await handleGetPrompt('generate-monthly-report');
                expect(result.messages[0].content.type).toBe('text');
            });

            it('should have non-empty text content', async () => {
                const result = await handleGetPrompt('generate-monthly-report');
                expect(result.messages[0].content.text.length).toBeGreaterThan(0);
            });
        });
    });
});
