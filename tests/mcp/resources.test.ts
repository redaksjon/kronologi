/**
 * Tests for MCP Resources
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleListResources, handleReadResource } from '../../src/mcp/resources';
import * as fs from 'fs/promises';
import { glob } from 'glob';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('glob');

describe('MCP Resources', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.HOME = '/test/home';
        process.env.KRONOLOGI_DIR = '/test/.kronologi';
    });

    afterEach(() => {
        delete process.env.KRONOLOGI_DIR;
    });

    describe('handleListResources', () => {
        it('should list all available report resources', async () => {
            const mockFiles = [
                '/test/.kronologi/summary/monthly-summary/2026-01/summary.md',
                '/test/.kronologi/summary/monthly-summary/2025-12/summary.md',
                '/test/.kronologi/summary/release-notes/2026-01/summary.md',
            ];

            vi.mocked(glob).mockResolvedValue(mockFiles as any);

            const result = await handleListResources();

            expect(result.resources).toHaveLength(3);
            expect(result.resources[0]).toEqual({
                uri: 'kronologi://report/monthly-summary/2026-01',
                name: 'monthly-summary Report (2026-01)',
                description: 'Generated report for monthly-summary in 2026-01',
                mimeType: 'text/markdown',
            });
        });

        it('should handle no reports', async () => {
            vi.mocked(glob).mockResolvedValue([]);

            const result = await handleListResources();

            expect(result.resources).toEqual([]);
        });

        it('should handle glob errors gracefully', async () => {
            vi.mocked(glob).mockRejectedValue(new Error('Permission denied'));

            const result = await handleListResources();

            expect(result.resources).toEqual([]);
        });

        it('should use correct MIME type', async () => {
            const mockFiles = ['/test/.kronologi/summary/test/2026-01/summary.md'];
            vi.mocked(glob).mockResolvedValue(mockFiles as any);

            const result = await handleListResources();

            expect(result.resources[0].mimeType).toBe('text/markdown');
        });

        it('should parse job and year-month from path', async () => {
            const mockFiles = [
                '/test/.kronologi/summary/my-job/2025-12/summary.md',
            ];
            vi.mocked(glob).mockResolvedValue(mockFiles as any);

            const result = await handleListResources();

            expect(result.resources[0].uri).toBe('kronologi://report/my-job/2025-12');
            expect(result.resources[0].name).toContain('my-job');
            expect(result.resources[0].name).toContain('2025-12');
        });
    });

    describe('handleReadResource', () => {
        it('should read a valid resource', async () => {
            const mockContent = '# Monthly Summary\n\nReport content';
            vi.mocked(fs.readFile).mockResolvedValue(mockContent);

            const result = await handleReadResource('kronologi://report/monthly-summary/2026-01');

            expect(result.uri).toBe('kronologi://report/monthly-summary/2026-01');
            expect(result.mimeType).toBe('text/markdown');
            expect(result.text).toBe(mockContent);
            expect(fs.readFile).toHaveBeenCalledWith(
                expect.stringContaining('monthly-summary/2026-01/summary.md'),
                'utf-8'
            );
        });

        it('should throw error for invalid URI format', async () => {
            await expect(
                handleReadResource('invalid-uri')
            ).rejects.toThrow('Invalid resource URI');

            await expect(
                handleReadResource('kronologi://invalid')
            ).rejects.toThrow('Invalid resource URI');

            await expect(
                handleReadResource('kronologi://report/job')
            ).rejects.toThrow('Invalid resource URI');
        });

        it('should throw error for non-existent resource', async () => {
            vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

            await expect(
                handleReadResource('kronologi://report/nonexistent/2026-01')
            ).rejects.toThrow('Resource not found');
        });

        it('should validate URI pattern', async () => {
            // Valid patterns
            vi.mocked(fs.readFile).mockResolvedValue('content');

            await expect(
                handleReadResource('kronologi://report/job-name/2026-01')
            ).resolves.toBeDefined();

            await expect(
                handleReadResource('kronologi://report/my_job/2025-12')
            ).resolves.toBeDefined();

            // Invalid patterns
            await expect(
                handleReadResource('kronologi://report/job/26-01')
            ).rejects.toThrow('Invalid resource URI');

            await expect(
                handleReadResource('kronologi://report/job/2026-1')
            ).rejects.toThrow('Invalid resource URI');
        });

        it('should handle file read errors', async () => {
            vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'));

            await expect(
                handleReadResource('kronologi://report/test/2026-01')
            ).rejects.toThrow('Resource not found');
        });

        it('should construct correct file path', async () => {
            vi.mocked(fs.readFile).mockResolvedValue('content');

            await handleReadResource('kronologi://report/my-job/2026-03');

            expect(fs.readFile).toHaveBeenCalledWith(
                '/test/.kronologi/summary/my-job/2026-03/summary.md',
                'utf-8'
            );
        });
    });
});
