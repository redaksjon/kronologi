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
 * Uses the new 'context' directory structure with redaksjon namespace.
 */
export const kronologiDiscoveryOptions = {
    contextDirName: 'context',
    maxLevels: 10,
};
