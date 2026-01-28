/**
 * System Prompt Wrapper
 * 
 * Automatically wraps user's task-focused instructions with tool usage guidance.
 * This keeps job configurations clean and focused on domain tasks rather than
 * implementation details.
 * 
 * Separation of Concerns:
 * - Job Instructions (user-defined): WHAT to do, domain requirements, output format
 * - System Wrapper (kronologi-injected): HOW to do it, tool usage, exploration patterns
 */

import { ContentSourcesConfig } from '../types';

/**
 * Build system message that describes tools and content sources
 */
export function buildSystemMessage(contentSources?: ContentSourcesConfig): string {
    const sections: string[] = [];

    sections.push(`You are an intelligent analysis assistant with access to tools for exploring content.

# Your Tools

You have access to the following tools for content exploration:

- **list_files**: List files in a directory with optional pattern matching
  - Use to see what files are available
  - Supports glob patterns (e.g., "*.md", "2025-*.md")
  - Returns file names for further exploration

- **read_file**: Read the contents of a specific file
  - Use when you know which file you need
  - Reads from activity, summary, or context directories
  - Returns full file content

- **search_files**: Search for text patterns across files
  - Use to find files containing specific keywords or topics
  - Searches file content, not just names
  - Returns matching files with context

# Your Approach

Follow this systematic approach to complete tasks:

1. **Explore First**: Use \`list_files\` to understand what content is available
2. **Search Strategically**: Use \`search_files\` to find relevant content before reading everything
3. **Read Selectively**: Only read files that are relevant to the task
4. **Iterate**: Make multiple tool calls to refine your understanding
5. **Synthesize**: Once you have sufficient information, complete the task

# Best Practices

- Start with exploration tools (list_files) to get an overview
- Use search to identify relevant files before reading
- Read context files early to understand requirements and guidelines
- Review previous summaries for continuity and context
- Only read content that's directly relevant to the task
- Don't try to read everything - be selective and strategic
- Use multiple tool calls to progressively build understanding

# Important

The user's instructions describe WHAT to do (the task, requirements, and output format).
Use your tools to explore content and complete the task effectively.
Focus on the user's requirements and deliver the requested output.`);

    // Add content source information if available
    if (contentSources) {
        sections.push('\n# Available Content Sources\n');
        
        if (contentSources.activity) {
            sections.push(`\n## Activity Files
${contentSources.activity.description}
- Directory: ${contentSources.activity.directory}
- Use \`list_files\` with directory="activity" to explore
- Use \`read_file\` to read specific activity files`);
        }

        if (contentSources.history) {
            sections.push(`\n## Historical Content
${contentSources.history.description}
- Directory: ${contentSources.history.directory}
${contentSources.history.monthsAvailable ? `- Historical depth: ${contentSources.history.monthsAvailable} months` : ''}
${contentSources.history.weeksAvailable ? `- Historical depth: ${contentSources.history.weeksAvailable} weeks` : ''}
- Use \`list_files\` to explore historical directories
- Use \`read_file\` to read historical files`);
        }

        if (contentSources.summaries) {
            sections.push(`\n## Previous Summaries
${contentSources.summaries.description}
- Directory: ${contentSources.summaries.directory}
${contentSources.summaries.monthsAvailable ? `- Summaries available: ${contentSources.summaries.monthsAvailable} months` : ''}
${contentSources.summaries.weeksAvailable ? `- Summaries available: ${contentSources.summaries.weeksAvailable} weeks` : ''}
- Use \`list_files\` to see available summaries
- Use \`read_file\` to read previous summaries for context`);
        }

        if (contentSources.context) {
            sections.push(`\n## Context Files
${contentSources.context.description}
- Directory: ${contentSources.context.directory}
- Use \`list_files\` to see available context files
- Read these early to understand guidelines and requirements`);
        }
    }

    return sections.join('\n');
}

/**
 * Build complete prompt with system wrapper and user instructions
 * 
 * Returns an object with system and user messages separated
 */
export function buildWrappedPrompt(
    userInstructions: string,
    contentSources?: ContentSourcesConfig
): { system: string; user: string } {
    return {
        system: buildSystemMessage(contentSources),
        user: userInstructions
    };
}

/**
 * Get tool usage guidance for inclusion in prompts
 */
export function getToolUsageGuidance(): string {
    return `# Tool Usage Strategy

When analyzing content, follow this approach:

1. **Start with Overview**: Use \`list_files\` to understand what content is available
2. **Search Strategically**: Use \`search_files\` to find specific topics, keywords, or themes
3. **Read Selectively**: Use \`read_file\` to read only the most relevant files
4. **Iterate**: Use multiple tool calls to build understanding progressively

## Example Workflow

1. List files in activity directory to see what's available
2. Search for key topics or themes mentioned in the task
3. Read the most relevant files identified by search
4. If needed, explore historical content for context
5. Check previous summaries to understand trends
6. Synthesize findings into the requested output

Remember: You don't need to read everything. Focus on what's most relevant to the task.`;
}
