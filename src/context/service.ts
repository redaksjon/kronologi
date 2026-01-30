import {
    discoverOvercontext,
    OvercontextAPI,
} from '@utilarium/overcontext';
import {
    redaksjonSchemas,
    redaksjonPluralNames,
} from '@redaksjon/context';
import { kronologiDiscoveryOptions } from './config';

export type KronologiContext = OvercontextAPI<typeof redaksjonSchemas>;

let contextInstance: KronologiContext | undefined;

/**
 * Initialize context for kronologi.
 * Discovers context from the new 'context/redaksjon/' directory structure.
 * The 'redaksjon' namespace is automatically detected from the directory structure.
 */
export const initializeContext = async (
    startDir?: string
): Promise<KronologiContext | undefined> => {
    try {
        contextInstance = await discoverOvercontext({
            schemas: redaksjonSchemas,
            pluralNames: redaksjonPluralNames,
            startDir,
            ...kronologiDiscoveryOptions,
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
