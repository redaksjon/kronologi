/**
 * Tests for Config Loader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createConfig } from '../../src/analysis/configLoader';
import * as Storage from '../../src/util/storage';
import * as yaml from 'js-yaml';

vi.mock('../../src/util/storage');
vi.mock('js-yaml');

describe('Config Loader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createConfig', () => {
        it('should load and parse valid config', async () => {
            const mockConfig = {
                model: 'gpt-4',
                temperature: 0.7,
                maxCompletionTokens: 4000,
                reasoning: {
                    provider: 'openai',
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            const result = await createConfig('test-job', '/test/path');

            expect(result.name).toBe('test-job');
            expect(result.model).toBe('gpt-4');
            expect(mockStorage.readFile).toHaveBeenCalledWith(
                expect.stringContaining('config.yaml'),
                'utf-8'
            );
        });

        it('should throw error if model is missing', async () => {
            const mockConfig = {
                temperature: 0.7,
                // model is missing
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('Missing required config property');
        });

        it('should apply default values', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'anthropic',
                },
                // Missing optional fields that should get defaults
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            const result = await createConfig('test-job', '/test/path');

            expect(result.temperature).toBeDefined();
            expect(result.maxCompletionTokens).toBeDefined();
        });

        it('should validate static context has directory', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                context: {
                    myContext: {
                        type: 'static',
                        // missing directory
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('Missing required directory property');
        });

        it('should validate history context has from property', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                context: {
                    myHistory: {
                        type: 'history',
                        // missing from
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow("Missing required 'from' property");
        });

        it('should auto-generate context name if not provided', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                context: {
                    my_context: {
                        type: 'static',
                        directory: '/test',
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            const result = await createConfig('test-job', '/test/path');

            expect(result.context?.my_context.name).toBe('My context');
        });

        it('should validate parameter references in history months', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                parameters: {
                    historyMonths: {
                        type: 'number',
                        required: true,
                    },
                },
                context: {
                    history: {
                        type: 'history',
                        from: 'activity',
                        months: '${parameters.historyMonths}',
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            const result = await createConfig('test-job', '/test/path');

            expect(result.context?.history.months).toBe('${parameters.historyMonths}');
        });

        it('should throw error for invalid parameter reference', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                context: {
                    history: {
                        type: 'history',
                        from: 'activity',
                        months: '${parameters.nonexistent}',
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('Parameter nonexistent referenced');
        });

        it('should throw error for wrong parameter type', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                parameters: {
                    historyMonths: {
                        type: 'string', // Wrong type, should be number
                        required: true,
                    },
                },
                context: {
                    history: {
                        type: 'history',
                        from: 'activity',
                        months: '${parameters.historyMonths}',
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('must be of type number');
        });

        it('should handle file read errors', async () => {
            const mockStorage = {
                readFile: vi.fn().mockRejectedValue(new Error('File not found')),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('File not found');
        });

        it('should handle YAML parse errors', async () => {
            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('invalid: yaml: content:'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockImplementation(() => {
                throw new Error('Invalid YAML');
            });

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('Invalid YAML');
        });

        it('should validate invalid context type', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                context: {
                    invalid: {
                        type: 'unknown_type',
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            await expect(
                createConfig('test-job', '/test/path')
            ).rejects.toThrow('Invalid context type');
        });

        it('should auto-generate content name if not provided', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                content: {
                    my_content: {
                        from: 'activity',
                        pattern: '**/*.md',
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            const result = await createConfig('test-job', '/test/path');

            expect(result.content?.my_content.name).toBe('My content');
        });

        it('should apply default pattern for content', async () => {
            const mockConfig = {
                model: 'gpt-4',
                reasoning: {
                    provider: 'openai',
                },
                content: {
                    myContent: {
                        from: 'activity',
                        // pattern not provided
                    },
                },
            };

            const mockStorage = {
                readFile: vi.fn().mockResolvedValue('yaml content'),
            };

            vi.mocked(Storage.create).mockReturnValue(mockStorage as any);
            vi.mocked(yaml.load).mockReturnValue(mockConfig);

            const result = await createConfig('test-job', '/test/path');

            expect(result.content?.myContent.pattern).toBe('**/*.md');
        });
    });
});
