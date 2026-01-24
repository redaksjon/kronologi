/**
 * Tool Index
 *
 * Central export for all tools and automatic registration with global registry.
 */

import { globalToolRegistry } from './registry';
import { readFileTool, listFilesTool } from './file';
import { searchFilesTool } from './search';

// Register all tools with the global registry
globalToolRegistry.register(readFileTool);
globalToolRegistry.register(listFilesTool);
globalToolRegistry.register(searchFilesTool);

// Export everything for external use
export { globalToolRegistry };
export * from './types';
export * from './registry';
export * from './file';
export * from './search';
