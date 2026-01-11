import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Logger } from 'winston';

vi.mock('openai', () => ({
    OpenAI: vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vi.fn()
            }
        },
        audio: {
            transcriptions: {
                create: vi.fn()
            }
        }
    }))
}));

vi.mock('../../src/util/storage.js', () => ({
    create: vi.fn()
}));

vi.mock('../../src/logging.js', () => ({
    getLogger: vi.fn()
}));


let Logging: any;
let OpenAI: any;
let storage: any;
let mockLogger: any;
let openAiUtils: any;

describe('OpenAI utilities', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        openAiUtils = await import('../../src/util/openai.js');

        OpenAI = await import('openai');
        storage = await import('../../src/util/storage');
        Logging = await import('../../src/logging');

        mockLogger = {
            debug: vi.fn(),
            error: vi.fn()
        } as unknown as Logger;

        (Logging.getLogger as any).mockReturnValue(mockLogger);
    });

    describe('createCompletion', () => {
        it('should successfully create a completion', async () => {
            const mockMessages = [{ role: 'user', content: 'test' }];
            const mockResponse = { choices: [{ message: { content: 'test response' } }] };

            OpenAI.OpenAI.mockImplementation(() => ({
                chat: {
                    completions: {
                        // @ts-ignore
                        create: vi.fn().mockResolvedValue(mockResponse)
                    }
                }
            }));

            process.env.OPENAI_API_KEY = 'test-key';

            // @ts-ignore
            const result = await openAiUtils.createCompletion(mockMessages);

            expect(result).toBe('test response');
            expect(mockLogger.debug).toHaveBeenCalledWith('Sending prompt to OpenAI: %j', mockMessages);
            expect(mockLogger.debug).toHaveBeenCalledWith('Received response from OpenAI: %s', 'test response');
        });

        it('should handle JSON response format', async () => {
            const mockMessages = [{ role: 'user', content: 'test' }];
            const mockResponse = { choices: [{ message: { content: '{"key": "value"}' } }] };

            OpenAI.OpenAI.mockImplementation(() => ({
                chat: {
                    completions: {
                        // @ts-ignore
                        create: vi.fn().mockResolvedValue(mockResponse)
                    }
                }
            }));

            process.env.OPENAI_API_KEY = 'test-key';

            // @ts-ignore
            const result = await openAiUtils.createCompletion(mockMessages, mockLogger, { responseFormat: { type: 'json' } });

            expect(result).toEqual("{\"key\": \"value\"}");
        });

        it('should throw error when API key is missing', async () => {
            delete process.env.OPENAI_API_KEY;

            await expect(openAiUtils.createCompletion([], mockLogger))
                .rejects
                .toThrow('OPENAI_API_KEY environment variable is not set');
        });

        it('should throw error when no response is received', async () => {
            const mockResponse = { choices: [{ message: { content: '' } }] };

            OpenAI.OpenAI.mockImplementation(() => ({
                chat: {
                    completions: {
                        // @ts-ignore
                        create: vi.fn().mockResolvedValue(mockResponse)
                    }
                }
            }));

            process.env.OPENAI_API_KEY = 'test-key';

            await expect(openAiUtils.createCompletion([], mockLogger))
                .rejects
                .toThrow('No response received from OpenAI');
        });
    });

    describe('transcribeAudio', () => {
        it('should successfully transcribe audio', async () => {
            const mockFilePath = '/test/audio.mp3';
            const mockTranscription = { text: 'test transcription' };
            const mockStream = {};

            storage.create.mockReturnValue({
                // @ts-ignore
                readStream: vi.fn().mockResolvedValue(mockStream)
            });

            OpenAI.OpenAI.mockImplementation(() => ({
                audio: {
                    transcriptions: {
                        // @ts-ignore
                        create: vi.fn().mockResolvedValue(mockTranscription)
                    }
                }
            }));

            process.env.OPENAI_API_KEY = 'test-key';

            const result = await openAiUtils.transcribeAudio(mockFilePath, mockLogger);

            expect(result).toEqual(mockTranscription);
            expect(mockLogger.debug).toHaveBeenCalledWith('Transcribing audio file: %s', mockFilePath);
            expect(mockLogger.debug).toHaveBeenCalledWith('Received transcription from OpenAI: %s', mockTranscription);
        });

        it('should throw error when API key is missing', async () => {
            delete process.env.OPENAI_API_KEY;

            await expect(openAiUtils.transcribeAudio('/test/audio.mp3', mockLogger))
                .rejects
                .toThrow('OPENAI_API_KEY environment variable is not set');
        });

        it('should throw error when no transcription is received', async () => {
            const mockStream = {};

            storage.create.mockReturnValue({
                // @ts-ignore
                readStream: vi.fn().mockResolvedValue(mockStream)
            });

            OpenAI.OpenAI.mockImplementation(() => ({
                audio: {
                    transcriptions: {
                        // @ts-ignore
                        create: vi.fn().mockResolvedValue(null)
                    }
                }
            }));

            process.env.OPENAI_API_KEY = 'test-key';

            await expect(openAiUtils.transcribeAudio('/test/audio.mp3', mockLogger))
                .rejects
                .toThrow('No transcription received from OpenAI');
        });
    });
});
