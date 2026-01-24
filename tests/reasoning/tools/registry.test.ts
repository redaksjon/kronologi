import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../../../src/reasoning/tools/registry';
import { Tool } from '../../../src/reasoning/tools/types';
import { z } from 'zod';

describe('ToolRegistry', () => {
    let registry: ToolRegistry;

    const mockTool1: Tool = {
        name: 'test_tool_1',
        description: 'Test tool 1',
        inputSchema: z.object({ input: z.string() }),
        execute: async () => ({ success: true }),
    };

    const mockTool2: Tool = {
        name: 'test_tool_2',
        description: 'Test tool 2',
        inputSchema: z.object({ value: z.number() }),
        execute: async () => ({ success: true }),
    };

    beforeEach(() => {
        registry = new ToolRegistry();
    });

    describe('register', () => {
        it('should register a tool', () => {
            registry.register(mockTool1);
            expect(registry.has('test_tool_1')).toBe(true);
        });

        it('should register multiple tools', () => {
            registry.register(mockTool1);
            registry.register(mockTool2);
            expect(registry.has('test_tool_1')).toBe(true);
            expect(registry.has('test_tool_2')).toBe(true);
        });
    });

    describe('get', () => {
        it('should retrieve a registered tool', () => {
            registry.register(mockTool1);
            const tool = registry.get('test_tool_1');
            expect(tool).toBe(mockTool1);
        });

        it('should return undefined for unregistered tool', () => {
            const tool = registry.get('nonexistent');
            expect(tool).toBeUndefined();
        });
    });

    describe('has', () => {
        it('should return true for registered tool', () => {
            registry.register(mockTool1);
            expect(registry.has('test_tool_1')).toBe(true);
        });

        it('should return false for unregistered tool', () => {
            expect(registry.has('nonexistent')).toBe(false);
        });
    });

    describe('list', () => {
        it('should return all registered tools', () => {
            registry.register(mockTool1);
            registry.register(mockTool2);
            const tools = registry.list();
            expect(tools).toHaveLength(2);
            expect(tools).toContain(mockTool1);
            expect(tools).toContain(mockTool2);
        });

        it('should return empty array when no tools registered', () => {
            const tools = registry.list();
            expect(tools).toHaveLength(0);
        });
    });

    describe('getMany', () => {
        it('should retrieve multiple tools by name', () => {
            registry.register(mockTool1);
            registry.register(mockTool2);
            const tools = registry.getMany(['test_tool_1', 'test_tool_2']);
            expect(tools).toHaveLength(2);
            expect(tools).toContain(mockTool1);
            expect(tools).toContain(mockTool2);
        });

        it('should filter out unregistered tools', () => {
            registry.register(mockTool1);
            const tools = registry.getMany(['test_tool_1', 'nonexistent']);
            expect(tools).toHaveLength(1);
            expect(tools[0]).toBe(mockTool1);
        });

        it('should return empty array for all nonexistent tools', () => {
            const tools = registry.getMany(['nonexistent1', 'nonexistent2']);
            expect(tools).toHaveLength(0);
        });
    });
});
