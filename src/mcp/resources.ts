/**
 * Kronologi MCP Resources
 *
 * Resource handlers for accessing reports and activity files.
 * Resources provide read-only access to generated content.
 */

import * as fs from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';

/**
 * Get Kronologi directories from environment
 */
function getDirectories() {
    const homeDir = process.env.HOME || '';
    const kronologiDir = process.env.KRONOLOGI_DIR || join(homeDir, '.kronologi');

    return {
        summary: join(kronologiDir, 'summary'),
        activity: join(kronologiDir, 'activity'),
        context: join(kronologiDir, 'context'),
    };
}

/**
 * List all available resources
 */
export async function handleListResources() {
    const dirs = getDirectories();
    const resources = [];

    try {
        // List all summary reports
        const summaryFiles = await glob(join(dirs.summary, '*', '*', 'summary.md'));

        for (const file of summaryFiles) {
            const parts = file.split('/');
            const yearMonth = parts[parts.length - 2];
            const job = parts[parts.length - 3];

            resources.push({
                uri: `kronologi://report/${job}/${yearMonth}`,
                name: `${job} Report (${yearMonth})`,
                description: `Generated report for ${job} in ${yearMonth}`,
                mimeType: 'text/markdown',
            });
        }

        return {
            resources,
        };
    } catch {
        return { resources: [] };
    }
}

/**
 * Read a specific resource
 */
export async function handleReadResource(uri: string) {
    const dirs = getDirectories();

    // Parse URI: kronologi://report/{job}/{year-month}
    const match = uri.match(/^kronologi:\/\/report\/([^/]+)\/(\d{4}-\d{2})$/);

    if (!match) {
        throw new Error(`Invalid resource URI: ${uri}`);
    }

    const [, job, yearMonth] = match;
    const reportPath = join(dirs.summary, job, yearMonth, 'summary.md');

    try {
        const content = await fs.readFile(reportPath, 'utf-8');

        return {
            uri,
            mimeType: 'text/markdown',
            text: content,
        };
    } catch {
        throw new Error(`Resource not found: ${uri}`);
    }
}
