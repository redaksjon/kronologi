import { vi, describe, it, expect, beforeEach } from 'vitest';
import path from 'path';

// Mock fs/promises
const mockWriteFile = vi.fn();
const mockMkdir = vi.fn();
vi.mock('fs/promises', () => ({
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
}));

// Mock logger
const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

// Dynamically import the module *after* mocking
const { writeOutputFile } = await import('../src/output');

describe('writeOutputFile', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    it('should create directory and write file with string content', async () => {
        const baseDir = '/tmp/output';
        const year = 2024;
        const month = 5;
        const pattern = 'report.txt';
        const content = 'This is the report content.';
        const expectedPath = path.join(baseDir, year.toString(), month.toString(), pattern);
        const expectedDir = path.dirname(expectedPath);

        await writeOutputFile(baseDir, year, month, pattern, content, mockLogger);

        // Check that fs operations were called correctly
        expect(mockMkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(expectedPath, content);
        expect(mockLogger.info).toHaveBeenCalledWith(`Output written to ${expectedPath}`);
    });

    it('should create directory and write file with JSON content', async () => {
        const baseDir = '/tmp/data';
        const year = 2023;
        const month = 12;
        const pattern = 'data.json';
        const content = { key: 'value', count: 42 };
        const expectedPath = path.join(baseDir, year.toString(), month.toString(), pattern);
        const expectedDir = path.dirname(expectedPath);
        const expectedJsonContent = JSON.stringify(content, null, 2);

        await writeOutputFile(baseDir, year, month, pattern, content, mockLogger);

        expect(mockMkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(expectedPath, expectedJsonContent);
        expect(mockLogger.info).toHaveBeenCalledWith(`Output written to ${expectedPath}`);
    });

    it('should handle errors during mkdir', async () => {
        const baseDir = '/restricted';
        const year = 2024;
        const month = 1;
        const pattern = 'error.log';
        const content = 'Error log content';
        const expectedPath = path.join(baseDir, year.toString(), month.toString(), pattern);
        const expectedDir = path.dirname(expectedPath);
        const mkdirError = new Error('Permission denied');

        // @ts-ignore
        mockMkdir.mockRejectedValueOnce(mkdirError); // Simulate mkdir failure

        await expect(
            writeOutputFile(baseDir, year, month, pattern, content, mockLogger)
        ).rejects.toThrow(mkdirError);

        expect(mockMkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
        expect(mockWriteFile).not.toHaveBeenCalled(); // writeFile should not be called if mkdir fails
        expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle errors during writeFile', async () => {
        const baseDir = '/tmp/output';
        const year = 2024;
        const month = 6;
        const pattern = 'fail.txt';
        const content = 'This should fail';
        const expectedPath = path.join(baseDir, year.toString(), month.toString(), pattern);
        const expectedDir = path.dirname(expectedPath);
        const writeFileError = new Error('Disk full');

        // Ensure mkdir resolves successfully for this test case
        // @ts-ignore
        mockMkdir.mockResolvedValue(undefined);
        // @ts-ignore
        mockWriteFile.mockRejectedValueOnce(writeFileError); // Simulate writeFile failure

        await expect(
            writeOutputFile(baseDir, year, month, pattern, content, mockLogger)
        ).rejects.toThrow(writeFileError);

        expect(mockMkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(expectedPath, content);
        expect(mockLogger.info).not.toHaveBeenCalled(); // Logger info should not be called if writeFile fails
    });
});
