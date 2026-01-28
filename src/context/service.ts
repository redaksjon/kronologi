import {
    discoverOvercontext,
    OvercontextAPI,
} from '@theunwalked/overcontext';
import {
    redaksjonSchemas,
    redaksjonPluralNames,
} from '@redaksjon/context';
import { kronologiDiscoveryOptions } from './config';

export type KronologiContext = OvercontextAPI<typeof redaksjonSchemas>;

let contextInstance: KronologiContext | undefined;

/**
 * Initialize context for kronologi.
 * Discovers context from .protokoll and .kronologi directories.
 */
export const initializeContext = async (
    startDir?: string
): Promise<KronologiContext | undefined> => {
    // Try .protokoll first (most common case - sharing with protokoll)
    try {
        contextInstance = await discoverOvercontext({
            schemas: redaksjonSchemas,
            pluralNames: redaksjonPluralNames,
            contextDirName: '.protokoll',
            startDir,
            maxLevels: kronologiDiscoveryOptions.maxLevels,
        });
        return contextInstance;
    } catch {
        // Fall back to .kronologi
    }
  
    try {
        contextInstance = await discoverOvercontext({
            schemas: redaksjonSchemas,
            pluralNames: redaksjonPluralNames,
            contextDirName: '.kronologi',
            startDir,
            maxLevels: kronologiDiscoveryOptions.maxLevels,
        });
        return contextInstance;
    } catch {
        // No context found
        contextInstance = undefined;
        return undefined;
    }
};

/**
 * Get the current context instance.
 * Returns undefined if context not initialized.
 */
export const getContext = (): KronologiContext | undefined => {
    return contextInstance;
};

/**
 * Check if context is initialized.
 */
export const hasContext = (): boolean => {
    return contextInstance !== undefined;
};

/**
 * Clear context (for testing).
 */
export const clearContext = (): void => {
    contextInstance = undefined;
};
