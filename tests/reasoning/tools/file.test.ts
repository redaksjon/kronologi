import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileTool, listFilesTool } from '../../../src/reasoning/tools/file';
import { ToolContext } from '../../../src/reasoning/tools/types';

describe('File Tools', () => {
    let mockContext: ToolContext;

    beforeEach(() => {
        mockContext = {
            storage: {
                exists: vi.fn(),
                readFile: vi.fn(),
                listFiles: vi.fn(),
            } as any,
            config: {
                activityDirectory: '/test/activity',
                summaryDirectory: '/test/summary',
                contextDirectory: '/test/context',
            } as any,
            job: {} as any,
            logger: {
                info: vi.fn(),
                error: vi.fn(),
            } as any,
        };
    });

    describe('readFileTool', () => {
        it('should read file from activity directory', async () => {
            const mockContent = 'Test file content';
            (mockContext.storage.exists as any).mockResolvedValue(true);
            (mockContext.storage.readFile as any).mockResolvedValue(mockContent);

            const result = await readFileTool.execute(
                { path: '2026-01/test.md', directory: 'activity' },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data).toBe(mockContent);
            expect(mockContext.storage.exists).toHaveBeenCalledWith('/test/activity/2026-01/test.md');
            expect(mockContext.storage.readFile).toHaveBeenCalledWith('/test/activity/2026-01/test.md', 'utf-8');
        });

        it('should return error when file does not exist', async () => {
            (mockContext.storage.exists as any).mockResolvedValue(false);

            const result = await readFileTool.execute(
                { path: 'missing.md', directory: 'summary' },
                mockContext
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('File not found: missing.md');
        });

        it('should handle read errors', async () => {
            (mockContext.storage.exists as any).mockResolvedValue(true);
            (mockContext.storage.readFile as any).mockRejectedValue(new Error('Read error'));

            const result = await readFileTool.execute(
                { path: 'test.md', directory: 'context' },
                mockContext
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Read error');
        });
    });

    describe('listFilesTool', () => {
        it('should list files in directory', async () => {
            const mockFiles = ['file1.md', 'file2.md', 'file3.txt'];
            (mockContext.storage.exists as any).mockResolvedValue(true);
            (mockContext.storage.listFiles as any).mockResolvedValue(mockFiles);

            const result = await listFilesTool.execute(
                { directory: 'activity' },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockFiles);
            expect(mockContext.storage.listFiles).toHaveBeenCalledWith('/test/activity');
        });

        it('should filter files by pattern', async () => {
            const mockFiles = ['file1.md', 'file2.md', 'file3.txt'];
            (mockContext.storage.exists as any).mockResolvedValue(true);
            (mockContext.storage.listFiles as any).mockResolvedValue(mockFiles);

            const result = await listFilesTool.execute(
                { directory: 'summary', pattern: '*.md' },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(['file1.md', 'file2.md']);
        });

        it('should return error when directory does not exist', async () => {
            (mockContext.storage.exists as any).mockResolvedValue(false);

            const result = await listFilesTool.execute(
                { directory: 'activity', path: 'missing' },
                mockContext
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Directory not found: missing');
        });

        it('should handle subdirectory path', async () => {
            const mockFiles = ['sub1.md', 'sub2.md'];
            (mockContext.storage.exists as any).mockResolvedValue(true);
            (mockContext.storage.listFiles as any).mockResolvedValue(mockFiles);

            const result = await listFilesTool.execute(
                { directory: 'context', path: '2026-01' },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockFiles);
            expect(mockContext.storage.listFiles).toHaveBeenCalledWith('/test/context/2026-01');
        });
    });
});
