export * from './config';
export * from './service';
export * from './lookup';

// Re-export types for convenience
export type {
    Person,
    Project,
    Term,
    Company,
    IgnoredTerm,
    RedaksjonEntity,
} from '@redaksjon/context';
