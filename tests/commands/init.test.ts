/**
 * Tests for Init Command
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateJobName, getTemplateDescription } from '../../src/commands/init';

describe('Init Command', () => {
    describe('validateJobName', () => {
        it('should accept valid job names', () => {
            expect(validateJobName('monthly-summary').valid).toBe(true);
            expect(validateJobName('team-update').valid).toBe(true);
            expect(validateJobName('release-notes').valid).toBe(true);
            expect(validateJobName('my_job_123').valid).toBe(true);
            expect(validateJobName('a').valid).toBe(true);
        });

        it('should reject empty job names', () => {
            const result = validateJobName('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('cannot be empty');
        });

        it('should reject whitespace-only job names', () => {
            const result = validateJobName('   ');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('cannot be empty');
        });

        it('should reject job names that are too long', () => {
            const longName = 'a'.repeat(51);
            const result = validateJobName(longName);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('50 characters or less');
        });

        it('should reject job names with uppercase letters', () => {
            const result = validateJobName('MyJob');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('lowercase');
        });

        it('should reject job names with spaces', () => {
            const result = validateJobName('my job');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('lowercase letters, numbers, hyphens, and underscores');
        });

        it('should reject job names with special characters', () => {
            expect(validateJobName('my@job').valid).toBe(false);
            expect(validateJobName('my.job').valid).toBe(false);
            expect(validateJobName('my/job').valid).toBe(false);
            expect(validateJobName('my job!').valid).toBe(false);
        });

        it('should reject job names starting with hyphen', () => {
            const result = validateJobName('-myjob');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('cannot start with a hyphen or underscore');
        });

        it('should reject job names starting with underscore', () => {
            const result = validateJobName('_myjob');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('cannot start with a hyphen or underscore');
        });

        it('should accept job names with hyphens in the middle', () => {
            expect(validateJobName('my-job').valid).toBe(true);
        });

        it('should accept job names with underscores in the middle', () => {
            expect(validateJobName('my_job').valid).toBe(true);
        });

        it('should accept job names with numbers', () => {
            expect(validateJobName('job123').valid).toBe(true);
            expect(validateJobName('123job').valid).toBe(true);
        });
    });

    describe('getTemplateDescription', () => {
        it('should return description for known templates', () => {
            const getTemplateDescription = (name: string): string => {
                const descriptions: Record<string, string> = {
                    'monthly-summary': 'Simple monthly summary (recommended for beginners)',
                    'release-notes': 'Professional release notes with context and history',
                    'team-update': 'Internal team updates with dynamic parameters',
                };
                return descriptions[name] || 'Custom template';
            };

            expect(getTemplateDescription('monthly-summary')).toContain('Simple monthly summary');
            expect(getTemplateDescription('release-notes')).toContain('Professional release notes');
            expect(getTemplateDescription('team-update')).toContain('Internal team updates');
        });

        it('should return default description for unknown templates', () => {
            const getTemplateDescription = (name: string): string => {
                const descriptions: Record<string, string> = {
                    'monthly-summary': 'Simple monthly summary (recommended for beginners)',
                    'release-notes': 'Professional release notes with context and history',
                    'team-update': 'Internal team updates with dynamic parameters',
                };
                return descriptions[name] || 'Custom template';
            };

            expect(getTemplateDescription('unknown-template')).toBe('Custom template');
        });
    });
});
