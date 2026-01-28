/**
 * RiotPrompt Content Loader
 * 
 * Converts content source descriptions to RiotPrompt context items.
 * This allows content source information to be included in prompts
 * without actually gathering all the content.
 */

// Note: RiotPrompt Context type uses 'text' not 'content'
interface ContextItem {
    text: string;
    weight?: number;
}
import { ContentSourcesConfig, Parameters, KronologiConfig } from '../types';
import { describeContentSources } from '../analysis/contentSources';

/**
 * Load content sources as RiotPrompt context
 * 
 * Instead of loading actual content, we create context items that describe
 * what content is available and how the AI can access it via tools.
 */
export async function loadContentAsContext(
    contentSources: ContentSourcesConfig,
    parameters: Parameters,
    kronologiConfig: KronologiConfig
): Promise<ContextItem[]> {
    const contexts: ContextItem[] = [];

    // Generate description of all content sources
    const description = await describeContentSources(
        contentSources,
        parameters,
        kronologiConfig
    );

    // Create a single context item with all content source descriptions
    contexts.push({
        text: description,
        weight: 1.0,
    });

    return contexts;
}

/**
 * Create a context item for tool usage guidance
 */
export function createToolGuidanceContext(): ContextItem {
    return {
        text: `# Tool Usage Strategy

When analyzing content, follow this approach:

1. **Start with Overview**: Use \`list_files\` to understand what content is available
2. **Search Strategically**: Use \`search_files\` to find specific topics, keywords, or themes
3. **Read Selectively**: Use \`read_file\` to read only the most relevant files
4. **Iterate**: Use multiple tool calls to build understanding progressively

## Best Practices

- **Don't read everything**: Focus on what's most relevant to the task
- **Use search first**: Find what you need before reading entire files
- **Look for patterns**: Identify trends and themes across multiple files
- **Prioritize recent content**: Start with current period, then explore history if needed
- **Check context files**: Guidelines and reference material can provide important background

## Example Workflow

1. List files in activity directory to see what's available
2. Search for key topics or themes mentioned in the task
3. Read the most relevant files identified by search
4. If needed, explore historical content for context
5. Check previous summaries to understand trends
6. Synthesize findings into the requested output`,
        weight: 0.8,
    };
}
