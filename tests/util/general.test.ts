import { describe, test, expect } from 'vitest';
import { deepMerge, stringifyJSON } from '../../src/util/general';

describe('deepMerge', () => {
    test('should merge two flat objects', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };
        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: 3, c: 4 });
        expect(result).toBe(target); // should modify the target object
    });

    test('should recursively merge nested objects', () => {
        const target = { a: 1, b: { x: 1, y: 2 } };
        const source = { b: { y: 3, z: 4 }, c: 5 };
        const result = deepMerge(target, source);

        expect(result).toEqual({
            a: 1,
            b: { x: 1, y: 3, z: 4 },
            c: 5
        });
        expect(result).toBe(target);
    });

    test('should handle nested objects with missing properties in target', () => {
        const target = { a: 1 };
        const source = { b: { x: 1, y: 2 } };
        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: { x: 1, y: 2 } });
        expect(result.b).toEqual({ x: 1, y: 2 });
    });

    test('should replace arrays (not merge them)', () => {
        const target = { a: [1, 2, 3], b: 2 };
        const source = { a: [4, 5], c: 3 };
        const result = deepMerge(target, source);

        expect(result).toEqual({ a: [4, 5], b: 2, c: 3 });
        expect(result.a).toBe(source.a); // Array reference should be replaced
    });

    test('should handle null and undefined values', () => {
        const target = { a: 1, b: null, c: undefined };
        const source = { a: null, b: 2, d: undefined };
        const result = deepMerge(target, source);

        expect(result).toEqual({ a: null, b: 2, c: undefined, d: undefined });
    });

    test('should handle empty objects', () => {
        const target = {};
        const source = {};
        const result = deepMerge(target, source);

        expect(result).toEqual({});
        expect(result).toBe(target);
    });

    test('should handle complex nested structures', () => {
        const target = {
            config: {
                api: {
                    endpoint: 'https://old-api.com',
                    version: 'v1',
                    settings: {
                        timeout: 1000
                    }
                }
            },
            data: [1, 2, 3]
        };

        const source = {
            config: {
                api: {
                    endpoint: 'https://new-api.com',
                    settings: {
                        timeout: 2000,
                        retry: true
                    }
                },
                newSetting: true
            },
            data: [4, 5]
        };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            config: {
                api: {
                    endpoint: 'https://new-api.com',
                    version: 'v1',
                    settings: {
                        timeout: 2000,
                        retry: true
                    }
                },
                newSetting: true
            },
            data: [4, 5]
        });
    });

    test('should prevent prototype pollution', () => {
        const target = {};
        const source = {
            __proto__: { polluted: true },
            constructor: { polluted: true },
            prototype: { polluted: true }
        };
        deepMerge(target, source);
        expect((target as any).polluted).toBeUndefined();
    });
});

describe('stringifyJSON', () => {
    test('should stringify numbers', () => {
        expect(stringifyJSON(42)).toBe('42');
        expect(stringifyJSON(0)).toBe('0');
        expect(stringifyJSON(-10)).toBe('-10');
    });

    test('should stringify booleans', () => {
        expect(stringifyJSON(true)).toBe('true');
        expect(stringifyJSON(false)).toBe('false');
    });

    test('should stringify null', () => {
        expect(stringifyJSON(null)).toBe('null');
    });

    test('should stringify strings', () => {
        expect(stringifyJSON('hello')).toBe('"hello"');
        expect(stringifyJSON('')).toBe('""');
    });

    test('should stringify empty arrays', () => {
        expect(stringifyJSON([])).toBe('[]');
    });

    test('should stringify arrays with primitives', () => {
        expect(stringifyJSON([1, 2, 3])).toBe('[1,2,3]');
        expect(stringifyJSON(['a', 'b'])).toBe('["a","b"]');
    });

    test('should stringify simple objects', () => {
        expect(stringifyJSON({ a: 1 })).toBe('{"a":1}');
        expect(stringifyJSON({ a: 'test' })).toBe('{"a":"test"}');
    });

    test('should stringify nested objects', () => {
        expect(stringifyJSON({ a: { b: 1 } })).toBe('{"a":{"b":1}}');
    });

    test('should skip functions', () => {
        const obj = {
            a: 1,
            b: function() { return 2; },
            c: 3
        };
        const result = stringifyJSON(obj);
        expect(result).toContain('"a":1');
        expect(result).toContain('"c":3');
    });

    test('should skip undefined properties', () => {
        const obj = {
            a: 1,
            b: undefined,
            c: 3
        };
        const result = stringifyJSON(obj);
        expect(result).toContain('"a":1');
        expect(result).toContain('"c":3');
    });

    test('should handle arrays with objects', () => {
        const arr = [{ a: 1 }, { b: 2 }];
        expect(stringifyJSON(arr)).toBe('[{"a":1},{"b":2}]');
    });
});
