# Quick Start Guide

Get up and running with Kronologi in 5 minutes.

## Installation

```bash
# Install globally
npm install -g @redaksjon/kronologi

# Or install in your project
npm install @redaksjon/kronologi

# Verify installation
kronologi --version
```

## Prerequisites

1. **OpenAI API Key**: Set environment variable

```bash
export OPENAI_API_KEY="sk-..."
```

2. **Node.js**: Version 18 or higher

```bash
node --version  # Should be >= 18.0.0
```

## First Summary in 3 Steps

### Step 1: Create Job Configuration

Create a job configuration directory:

```bash
mkdir -p .kronologi/jobs/release-notes
cd .kronologi/jobs/release-notes
```

Create `config.yaml`:

```yaml
# .kronologi/jobs/release-notes/config.yaml
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

parameters:
  year:
    type: number
    required: true
  month:
    type: number
    required: true

content:
  activity:
    type: activity
    name: Monthly Activity
    directory: ''
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    name: Monthly Summary
    pattern: 'summary.md'
```

Create `persona.md`:

```markdown
You are an expert technical writer specializing in creating clear, concise release notes and documentation.
```

Create `instructions.md`:

```markdown
Generate a comprehensive monthly summary based on the provided activity data.

## Output Format

# Monthly Summary - {{parameters.month}}/{{parameters.year}}

## Highlights
- List key achievements and milestones

## Changes
- Detail significant changes

## Statistics
- Provide relevant metrics
```

### Step 2: Add Activity Data

Create activity files to summarize:

```bash
mkdir -p activity
echo "# January Activity

## Week 1
- Launched new feature X
- Fixed bug Y

## Week 2
- Improved performance
- Updated documentation" > activity/january.md
```

### Step 3: Generate Summary

Run Kronologi:

```bash
# From project root
kronologi release-notes 2026 1
```

**Output**:
```
✓ Loading configuration...
✓ Analyzing inputs...
✓ Generating summary...
✓ Summary written to: summary/2026/01/summary.md
```

Check the result:

```bash
cat summary/2026/01/summary.md
```

## Your First Summary

Congratulations! You've generated your first Kronologi summary. The `summary/` directory now contains:

- **summary.md** - The AI-generated summary
- **completion.json** - API metadata (tokens used, model, etc.)
- **inputs.json** - Analysis of what was sent to the AI

## Next Steps

### Add Historical Context

Include previous months of activity:

```bash
# Analyze last 3 months of activity
kronologi release-notes 2026 1 3
```

### Add Previous Summaries

Reference previous summaries for continuity:

```bash
# Include last 2 previous summaries
kronologi release-notes 2026 1 3 2
```

### Add Static Context

Create reusable context that applies to all summaries:

```bash
mkdir -p context/global
echo "# Project Guidelines

Our project focuses on developer experience and performance.

## Writing Style
- Be concise and technical
- Use bullet points
- Include metrics when available" > context/global/guidelines.md
```

Update `config.yaml` to include context:

```yaml
context:
  guidelines:
    type: static
    name: Project Guidelines
    directory: global

content:
  activity:
    type: activity
    name: Monthly Activity
    directory: ''
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    name: Monthly Summary
    pattern: 'summary.md'
```

### Customize the Prompt

Edit `instructions.md` to change output format:

```markdown
Generate a comprehensive monthly summary.

## Required Sections

1. **Executive Summary**: 2-3 sentences
2. **Key Metrics**: Quantify changes
3. **Notable Features**: Shipped this month
4. **Bug Fixes**: Critical fixes
5. **Next Month**: Preview upcoming work

## Style Guidelines
- Use active voice
- Be specific with numbers
- Highlight user impact
```

## Common Patterns

### Pattern 1: Weekly Activity → Monthly Summary

```bash
# Directory structure
activity/
  2026-01-week1.md
  2026-01-week2.md
  2026-01-week3.md
  2026-01-week4.md

# Config pattern
content:
  weekly_notes:
    type: activity
    directory: ''
    pattern: '2026-01-*.md'
```

### Pattern 2: Git Commits → Release Notes

```bash
# Export git log to activity file
git log --since="2026-01-01" --until="2026-02-01" \
  --pretty=format:"- %s (%an)" > activity/commits-jan.md

# Generate release notes
kronologi release-notes 2026 1
```

### Pattern 3: Multiple Projects → Combined Summary

```bash
# Directory structure
activity/
  project-a/
    changes.md
  project-b/
    changes.md

# Config pattern
content:
  all_projects:
    type: activity
    directory: ''
    pattern: '**/*.md'
```

## Testing Your Configuration

Use `--dry-run` to test without consuming API tokens:

```bash
kronologi release-notes 2026 1 --dry-run
```

This shows what would be generated without making API calls.

## Debugging

Enable verbose logging to see what's happening:

```bash
kronologi release-notes 2026 1 --verbose
```

Or debug mode for even more detail:

```bash
kronologi release-notes 2026 1 --debug
```

## Replace Existing Summaries

By default, Kronologi won't overwrite existing files. Use `--replace`:

```bash
kronologi release-notes 2026 1 --replace
```

## Timezone Support

Specify timezone for date calculations:

```bash
kronologi release-notes 2026 1 --timezone America/New_York
```

## Multiple Jobs

Create multiple job types for different purposes:

```bash
.kronologi/jobs/
  release-notes/      # For external release notes
  team-update/        # For internal team updates
  personal-review/    # For personal monthly reviews
```

Run different jobs:

```bash
kronologi release-notes 2026 1
kronologi team-update 2026 1
kronologi personal-review 2026 1
```

## Tips for Success

### 1. Start Small

Begin with a single job and simple configuration:
- One content source (activity files)
- Basic persona and instructions
- Default model (gpt-4o)

### 2. Iterate on Prompts

The AI's output quality depends on your prompts:
- Be specific in `instructions.md`
- Provide examples of desired output
- Include style guidelines in `persona.md`

### 3. Use Parameters

Make prompts reusable with parameters:

```markdown
# Summary for {{parameters.month}}/{{parameters.year}}

Project: {{parameters.project}}
Team: {{parameters.team}}
```

### 4. Monitor Token Usage

Check `completion.json` after each run:

```json
{
  "usage": {
    "prompt_tokens": 2847,
    "completion_tokens": 1205,
    "total_tokens": 4052
  }
}
```

Large token usage? Reduce history months or use a smaller model.

### 5. Version Control

Track your configuration in Git:

```bash
git add .kronologi/
git commit -m "Add Kronologi configuration"
```

## Common Issues

### Issue: "Configuration file not found"

**Solution**: Ensure `.kronologi/jobs/<job-name>/config.yaml` exists

```bash
ls -la .kronologi/jobs/release-notes/
# Should show: config.yaml, persona.md, instructions.md
```

### Issue: "No activity files found"

**Solution**: Check your pattern in `config.yaml`

```yaml
content:
  activity:
    pattern: '*.md'  # Matches files in activity/
    pattern: '**/*.md'  # Matches files recursively
```

### Issue: "API token limit exceeded"

**Solution**: Kronologi automatically retries with reduced history. Or manually reduce:

```bash
# Reduce history from 3 to 1 month
kronologi release-notes 2026 1 1 1
```

### Issue: "Summary is too generic"

**Solution**: Improve your prompts with more specific instructions:

```markdown
# instructions.md

Focus on:
1. User-facing changes (not internal refactoring)
2. Performance improvements with metrics
3. Bug fixes that affected users

Avoid:
- Generic statements like "improved code quality"
- Implementation details
- Internal technical debt
```

## Example Output

After running `kronologi release-notes 2026 1`, you'll see:

```markdown
# Monthly Summary - January 2026

## Executive Summary

January was a productive month with the successful launch of Feature X,
significant performance improvements, and resolution of critical bugs.

## Key Metrics

- 47 commits merged
- 12 features shipped
- 23 bugs fixed
- Performance improved by 35%

## Notable Features

### Feature X - User Dashboard
Launched new user dashboard with real-time analytics and customizable widgets.

### Feature Y - API v2
Released v2 of our public API with improved rate limiting and documentation.

## Bug Fixes

- Fixed critical memory leak in data processing pipeline
- Resolved authentication issues affecting 5% of users
- Corrected timezone handling in date displays

## Next Month

Planning to focus on:
- Mobile app improvements
- Enhanced security features
- Performance optimization for large datasets
```

## Next Steps

Now that you have a working setup:

1. [Architecture](./architecture.md) - Understand how Kronologi works
2. [Jobs](./jobs.md) - Learn about job configuration
3. [Configuration](./configuration.md) - Explore all configuration options
4. [Prompts](./prompts.md) - Master prompt engineering
5. [Models](./models.md) - Choose the right model for your needs
