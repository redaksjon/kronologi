import {
    redaksjonSchemas,
    redaksjonPluralNames,
} from '@redaksjon/context';

/**
 * Context configuration for kronologi.
 * Uses the same schemas as protokoll for shared context.
 */
export const kronologiContextConfig: {
    schemas: typeof redaksjonSchemas;
    pluralNames: typeof redaksjonPluralNames;
} = {
    schemas: redaksjonSchemas,
    pluralNames: redaksjonPluralNames,
};

/**
 * Discovery options for kronologi.
 * Looks for context in multiple locations:
 * 1. .protokoll/context/ (shared with protokoll)
 * 2. .kronologi/context/ (kronologi-specific)
 * 3. context/ (generic)
 */
export const kronologiDiscoveryOptions = {
    contextDirNames: ['.protokoll', '.kronologi', 'context'],
    maxLevels: 10,
};
