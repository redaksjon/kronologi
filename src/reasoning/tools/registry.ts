/**
 * Tool Registry
 *
 * Manages registration and lookup of available tools.
 * Provides a central registry for all tools that can be used by the reasoning client.
 */

import { Tool } from './types';

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    /**
     * Register a tool to make it available for use
     */
    register(tool: Tool): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Get a specific tool by name
     */
    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all registered tools
     */
    list(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Check if a tool is registered
     */
    has(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Get multiple tools by name
     */
    getMany(names: string[]): Tool[] {
        return names
            .map(name => this.get(name))
            .filter((tool): tool is Tool => tool !== undefined);
    }
}

/**
 * Global tool registry instance
 */
export const globalToolRegistry = new ToolRegistry();
