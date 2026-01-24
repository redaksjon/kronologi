/**
 * Tests for MCP Tools
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tools, handleToolCall } from '../../src/mcp/tools';
import * as fs from 'fs/promises';
import { glob } from 'glob';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('glob');
vi.mock('../../src/run', () => ({
    runModel: vi.fn(),
}));

describe('MCP Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set up environment
        process.env.HOME = '/test/home';
        process.env.KRONOLOGI_DIR = '/test/.kronologi';
    });

    afterEach(() => {
        delete process.env.KRONOLOGI_DIR;
    });

    describe('Tool Definitions', () => {
        it('should export 4 tools', () => {
            expect(tools).toHaveLength(4);
        });

        it('should have generate_report tool', () => {
            const tool = tools.find(t => t.name === 'generate_report');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('Generate');
            expect(tool?.inputSchema.required).toContain('job');
            expect(tool?.inputSchema.required).toContain('year');
            expect(tool?.inputSchema.required).toContain('month');
        });

        it('should have list_jobs tool', () => {
            const tool = tools.find(t => t.name === 'list_jobs');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('List');
        });

        it('should have get_report tool', () => {
            const tool = tools.find(t => t.name === 'get_report');
            expect(tool).toBeDefined();
            expect(tool?.inputSchema.required).toContain('job');
            expect(tool?.inputSchema.required).toContain('year');
            expect(tool?.inputSchema.required).toContain('month');
        });

        it('should have list_reports tool', () => {
            const tool = tools.find(t => t.name === 'list_reports');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('List');
        });
    });

    describe('handleToolCall', () => {
        describe('list_jobs', () => {
            it('should list available jobs', async () => {
                const mockDirents = [
                    { name: 'monthly-summary', isDirectory: () => true },
                    { name: 'release-notes', isDirectory: () => true },
                    { name: 'file.txt', isDirectory: () => false },
                    { name: '.hidden', isDirectory: () => true },
                ];

                vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);

                const result = await handleToolCall('list_jobs', {});

                expect(result.success).toBe(true);
                expect(result.jobs).toEqual(['monthly-summary', 'release-notes']);
                expect(result.count).toBe(2);
            });

            it('should handle empty job directory', async () => {
                vi.mocked(fs.readdir).mockResolvedValue([]);

                const result = await handleToolCall('list_jobs', {});

                expect(result.success).toBe(true);
                expect(result.jobs).toEqual([]);
                expect(result.count).toBe(0);
            });

            it('should handle readdir errors', async () => {
                vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

                await expect(handleToolCall('list_jobs', {})).rejects.toThrow('Permission denied');
            });
        });

        describe('get_report', () => {
            it('should retrieve an existing report', async () => {
                const mockContent = '# Monthly Summary\n\nReport content here';
                vi.mocked(fs.readFile).mockResolvedValue(mockContent);

                const result = await handleToolCall('get_report', {
                    job: 'monthly-summary',
                    year: 2026,
                    month: 1,
                });

                expect(result.success).toBe(true);
                expect(result.job).toBe('monthly-summary');
                expect(result.year).toBe(2026);
                expect(result.month).toBe(1);
                expect(result.content).toBe(mockContent);
                expect(fs.readFile).toHaveBeenCalledWith(
                    expect.stringContaining('monthly-summary/2026-01/summary.md'),
                    'utf-8'
                );
            });

            it('should handle missing report', async () => {
                vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

                const result = await handleToolCall('get_report', {
                    job: 'monthly-summary',
                    year: 2026,
                    month: 1,
                });

                expect(result.success).toBe(false);
                expect(result.error).toContain('Report not found');
            });

            it('should pad month with zero', async () => {
                vi.mocked(fs.readFile).mockResolvedValue('content');

                await handleToolCall('get_report', {
                    job: 'test',
                    year: 2026,
                    month: 5,
                });

                expect(fs.readFile).toHaveBeenCalledWith(
                    expect.stringContaining('2026-05'),
                    'utf-8'
                );
            });

            it('should validate required fields', async () => {
                await expect(handleToolCall('get_report', {
                    job: 'test',
                    // missing year and month
                })).rejects.toThrow();
            });
        });

        describe('list_reports', () => {
            it('should list all reports', async () => {
                const mockFiles = [
                    '/test/.kronologi/summary/monthly-summary/2026-01/summary.md',
                    '/test/.kronologi/summary/monthly-summary/2025-12/summary.md',
                    '/test/.kronologi/summary/release-notes/2026-01/summary.md',
                ];

                vi.mocked(glob).mockResolvedValue(mockFiles as any);

                const result = await handleToolCall('list_reports', {});

                expect(result.success).toBe(true);
                expect(result.reports).toHaveLength(3);
                expect(result.count).toBe(3);
                expect(result.reports[0]).toEqual({
                    job: 'monthly-summary',
                    year: 2026,
                    month: 1,
                    path: mockFiles[0],
                });
            });

            it('should filter by job', async () => {
                const mockFiles = [
                    '/test/.kronologi/summary/monthly-summary/2026-01/summary.md',
                ];

                vi.mocked(glob).mockResolvedValue(mockFiles as any);

                const result = await handleToolCall('list_reports', {
                    job: 'monthly-summary',
                });

                expect(result.success).toBe(true);
                expect(glob).toHaveBeenCalledWith(
                    expect.stringContaining('monthly-summary')
                );
            });

            it('should handle no reports found', async () => {
                vi.mocked(glob).mockResolvedValue([]);

                const result = await handleToolCall('list_reports', {});

                expect(result.success).toBe(true);
                expect(result.reports).toEqual([]);
                expect(result.count).toBe(0);
            });

            it('should parse year and month correctly', async () => {
                const mockFiles = [
                    '/test/.kronologi/summary/test/2025-12/summary.md',
                ];

                vi.mocked(glob).mockResolvedValue(mockFiles as any);

                const result = await handleToolCall('list_reports', {});

                expect(result.reports[0].year).toBe(2025);
                expect(result.reports[0].month).toBe(12);
            });
        });

        describe('generate_report', () => {
            it('should validate input schema', async () => {
                await expect(handleToolCall('generate_report', {
                    // missing required fields
                })).rejects.toThrow();
            });

            it('should use default values for optional fields', async () => {
                const { runModel } = await import('../../src/run');
                vi.mocked(runModel).mockResolvedValue({
                    aiSummary: 'Test summary',
                    aiUsage: { totalTokens: 100 },
                } as any);

                vi.mocked(fs.readFile).mockResolvedValue('config: test');

                const result = await handleToolCall('generate_report', {
                    job: 'test',
                    year: 2026,
                    month: 1,
                });

                expect(result.success).toBe(true);
                expect(runModel).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.any(Object),
                    expect.objectContaining({
                        historyMonths: 3,
                        summaryMonths: 1,
                    })
                );
            });
        });

        describe('unknown tool', () => {
            it('should throw error for unknown tool', async () => {
                await expect(handleToolCall('unknown_tool', {})).rejects.toThrow('Unknown tool');
            });
        });
    });
});
