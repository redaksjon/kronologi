import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFilesTool } from '../../../src/reasoning/tools/search';
import { ToolContext } from '../../../src/reasoning/tools/types';

describe('Search Tools', () => {
    let mockContext: ToolContext;

    beforeEach(() => {
        mockContext = {
            storage: {
                forEachFileIn: vi.fn(),
                readFile: vi.fn(),
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

    describe('searchFilesTool', () => {
        it('should search files for query', async () => {
            const mockFileContent = 'Line 1: test content\nLine 2: matching query here\nLine 3: more content\nLine 4: another query match';

            (mockContext.storage.forEachFileIn as any).mockImplementation(async (dir: string, callback: Function) => {
                (mockContext.storage.readFile as any).mockResolvedValue(mockFileContent);
                await callback('/test/activity/file1.md');
            });

            const result = await searchFilesTool.execute(
                { directory: 'activity', query: 'query' },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data![0].file).toBe('/test/activity/file1.md');
            expect(result.data![0].matchCount).toBe(2);
            expect(result.data![0].matches).toHaveLength(2);
            expect(result.data![0].matches[0]).toContain('Line 2:');
            expect(result.data![0].matches[1]).toContain('Line 4:');
        });

        it('should limit results', async () => {
            (mockContext.storage.forEachFileIn as any).mockImplementation(async (dir: string, callback: Function) => {
                (mockContext.storage.readFile as any).mockResolvedValue('query match');
                await callback('/test/activity/file1.md');
                await callback('/test/activity/file2.md');
                await callback('/test/activity/file3.md');
            });

            const result = await searchFilesTool.execute(
                { directory: 'activity', query: 'query', limit: 2 },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
        });

        it('should handle case-insensitive search', async () => {
            const mockFileContent = 'Line 1: TEST content\nLine 2: Test CONTENT';

            (mockContext.storage.forEachFileIn as any).mockImplementation(async (dir: string, callback: Function) => {
                (mockContext.storage.readFile as any).mockResolvedValue(mockFileContent);
                await callback('/test/activity/file1.md');
            });

            const result = await searchFilesTool.execute(
                { directory: 'activity', query: 'test' },
                mockContext
            );

            expect(result.success).toBe(true);
            expect(result.data![0].matchCount).toBe(2);
        });

        it('should handle search errors', async () => {
            (mockContext.storage.forEachFileIn as any).mockRejectedValue(new Error('Search failed'));

            const result = await searchFilesTool.execute(
                { directory: 'activity', query: 'test' },
                mockContext
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Search failed');
        });

        it('should use custom file pattern', async () => {
            (mockContext.storage.forEachFileIn as any).mockImplementation(async (dir: string, callback: Function, options: any) => {
                expect(options.pattern).toBe('*.txt');
            });

            await searchFilesTool.execute(
                { directory: 'summary', query: 'test', filePattern: '*.txt' },
                mockContext
            );

            expect(mockContext.storage.forEachFileIn).toHaveBeenCalled();
        });
    });
});
