import { getContext } from './service';
import { Person, Project, Term } from '@redaksjon/context';

/**
 * Look up a person by ID.
 */
export const lookupPerson = async (
    id: string
): Promise<Person | undefined> => {
    const ctx = getContext();
    if (!ctx) return undefined;
  
    return ctx.get('person', id);
};

/**
 * Look up a project by ID.
 */
export const lookupProject = async (
    id: string
): Promise<Project | undefined> => {
    const ctx = getContext();
    if (!ctx) return undefined;
  
    return ctx.get('project', id);
};

/**
 * Look up a term by ID.
 */
export const lookupTerm = async (
    id: string
): Promise<Term | undefined> => {
    const ctx = getContext();
    if (!ctx) return undefined;
  
    return ctx.get('term', id);
};

/**
 * Get all people.
 */
export const getAllPeople = async (): Promise<Person[]> => {
    const ctx = getContext();
    if (!ctx) return [];
  
    return ctx.getAll('person');
};

/**
 * Get all active projects.
 */
export const getActiveProjects = async (): Promise<Project[]> => {
    const ctx = getContext();
    if (!ctx) return [];
  
    const all = await ctx.getAll('project');
    return all.filter(p => p.active !== false);
};

/**
 * Get all terms.
 */
export const getAllTerms = async (): Promise<Term[]> => {
    const ctx = getContext();
    if (!ctx) return [];
  
    return ctx.getAll('term');
};
