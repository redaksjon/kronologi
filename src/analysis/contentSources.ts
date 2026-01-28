/**
 * Content Source Description Generator
 * 
 * Generates descriptions of available content sources for AI to use with tools.
 * Instead of gathering all content upfront, we describe what's available and
 * how the AI can access it using tools.
 */

import { ContentSourcesConfig, Parameters, KronologiConfig } from '../types';
import { join } from 'path';
import { glob } from 'glob';
import { getLogger } from '../logging';

/**
 * Generate a description of available content sources for the AI
 * This tells the AI what content exists and how to access it via tools
 */
export async function describeContentSources(
    contentSources: ContentSourcesConfig,
    parameters: Parameters,
    kronologiConfig: KronologiConfig
): Promise<string> {
    const descriptions: string[] = [];

    descriptions.push('# Available Content Sources\n');
    descriptions.push('You have access to the following content sources via tools:\n');

    // Describe activity content
    if (contentSources.activity) {
        const activityDesc = await describeActivitySource(
            contentSources.activity,
            parameters,
            kronologiConfig
        );
        descriptions.push(activityDesc);
    }

    // Describe history content
    if (contentSources.history) {
        const historyDesc = await describeHistorySource(
            contentSources.history,
            parameters,
            kronologiConfig
        );
        descriptions.push(historyDesc);
    }

    // Describe summaries content
    if (contentSources.summaries) {
        const summariesDesc = await describeSummariesSource(
            contentSources.summaries,
            parameters,
            kronologiConfig
        );
        descriptions.push(summariesDesc);
    }

    // Describe context content
    if (contentSources.context) {
        const contextDesc = await describeContextSource(
            contentSources.context,
            kronologiConfig
        );
        descriptions.push(contextDesc);
    }

    descriptions.push('\n## How to Access Content\n');
    descriptions.push('Use the following tools to explore and analyze content:\n');
    descriptions.push('- `list_files`: List files in a directory to see what\'s available\n');
    descriptions.push('- `read_file`: Read the contents of a specific file\n');
    descriptions.push('- `search_files`: Search for specific content across multiple files\n');

    return descriptions.join('\n');
}

/**
 * Describe activity content source
 */
async function describeActivitySource(
    source: any,
    parameters: Parameters,
    kronologiConfig: KronologiConfig
): Promise<string> {
    const year = parameters.year.value;
    const month = parameters.month?.value;
    const week = parameters.week?.value;

    // Determine period directory
    const periodDir = week !== undefined ? `Week ${week}` : month?.toString();
    const activityPath = join(
        kronologiConfig.activityDirectory,
        source.directory || '',
        year.toString(),
        periodDir || ''
    );

    // Count available files
    let fileCount = 0;
    try {
        const patterns = source.patterns || ['**/*.md'];
        for (const pattern of patterns) {
            const files = await glob(pattern, { cwd: activityPath });
            fileCount += files.length;
        }
    } catch {
        // Silently handle errors counting files
    }

    return `
## 1. Activity Files
**Description**: ${source.description}
**Location**: \`${activityPath}\`
**Available Files**: ${fileCount} files
**Patterns**: ${source.patterns?.join(', ') || '*.md'}

**How to Access**:
- Use \`list_files\` with directory="${activityPath}" to see all available files
- Use \`read_file\` with path="${activityPath}/[filename]" to read specific files
- Use \`search_files\` with directory="${activityPath}" to search for specific content
`;
}

/**
 * Describe history content source
 */
async function describeHistorySource(
    source: any,
    parameters: Parameters,
    kronologiConfig: KronologiConfig
): Promise<string> {
    const year = parameters.year.value as number;
    const month = parameters.month?.value as number;
    const week = parameters.week?.value as number;

    const monthsAvailable = source.monthsAvailable || 3;
    const weeksAvailable = source.weeksAvailable || 4;

    let historyDesc = `
## 2. Historical Content
**Description**: ${source.description}
**Location**: \`${kronologiConfig.activityDirectory}/${source.directory || ''}\`
`;

    if (week !== undefined) {
        historyDesc += `**History Available**: Previous ${weeksAvailable} weeks\n`;
        historyDesc += `**Current Period**: ${year}-W${week}\n\n`;
        historyDesc += `**How to Access**:\n`;
        historyDesc += `- Historical weeks are in directories like: \`${year}/Week ${week - 1}\`, \`${year}/Week ${week - 2}\`, etc.\n`;
    } else if (month !== undefined) {
        historyDesc += `**History Available**: Previous ${monthsAvailable} months\n`;
        historyDesc += `**Current Period**: ${year}-${month}\n\n`;
        historyDesc += `**How to Access**:\n`;
        historyDesc += `- Historical months are in directories like: \`${year}/${month - 1}\`, \`${year}/${month - 2}\`, etc.\n`;
    }

    historyDesc += `- Use \`list_files\` to explore historical directories\n`;
    historyDesc += `- Use \`read_file\` to read specific historical files\n`;

    return historyDesc;
}

/**
 * Describe summaries content source
 */
async function describeSummariesSource(
    source: any,
    parameters: Parameters,
    kronologiConfig: KronologiConfig
): Promise<string> {
    const year = parameters.year.value;
    const month = parameters.month?.value;
    const week = parameters.week?.value;

    const monthsAvailable = source.monthsAvailable || 2;
    const weeksAvailable = source.weeksAvailable || 3;

    const summaryPath = join(
        kronologiConfig.summaryDirectory,
        source.directory || ''
    );

    let summariesDesc = `
## 3. Previous Summaries
**Description**: ${source.description}
**Location**: \`${summaryPath}\`
`;

    if (week !== undefined) {
        summariesDesc += `**Summaries Available**: Previous ${weeksAvailable} weeks\n`;
        summariesDesc += `**Current Period**: ${year}-W${week}\n\n`;
    } else if (month !== undefined) {
        summariesDesc += `**Summaries Available**: Previous ${monthsAvailable} months\n`;
        summariesDesc += `**Current Period**: ${year}-${month}\n\n`;
    }

    summariesDesc += `**How to Access**:\n`;
    summariesDesc += `- Use \`list_files\` with directory="${summaryPath}" to see available summaries\n`;
    summariesDesc += `- Use \`read_file\` to read specific summary files\n`;
    summariesDesc += `- Previous summaries help provide context and track progress over time\n`;

    return summariesDesc;
}

/**
 * Describe context content source
 */
async function describeContextSource(
    source: any,
    kronologiConfig: KronologiConfig
): Promise<string> {
    const logger = getLogger();
    const contextPath = join(
        kronologiConfig.contextDirectory,
        source.directory || ''
    );

    // Count available files
    let fileCount = 0;
    const fileList: string[] = [];
    try {
        const patterns = source.patterns || ['**/*.md'];
        for (const pattern of patterns) {
            const files = await glob(pattern, { cwd: contextPath });
            fileCount += files.length;
            fileList.push(...files);
        }
    } catch (error) {
        logger.debug(`Could not count context files: ${error}`);
    }

    let contextDesc = `
## 4. Context Files
**Description**: ${source.description}
**Location**: \`${contextPath}\`
**Available Files**: ${fileCount} files
`;

    if (fileList.length > 0 && fileList.length <= 10) {
        contextDesc += `**Files**: ${fileList.join(', ')}\n`;
    }

    contextDesc += `\n**How to Access**:\n`;
    contextDesc += `- Use \`list_files\` with directory="${contextPath}" to see all context files\n`;
    contextDesc += `- Use \`read_file\` to read specific context files\n`;
    contextDesc += `- Context files provide guidelines, reference material, and background information\n`;

    return contextDesc;
}
