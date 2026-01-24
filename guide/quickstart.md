# Quick Start Guide

Get up and running with Kronologi in 5 minutes.

## What's New

**Weekly Summaries**: Kronologi now supports weekly summaries in addition to monthly summaries! See the [Weekly Summaries Guide](./weekly-summaries.md) for details.

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

1. **API Keys**: Set environment variables for your chosen provider

```bash
# For OpenAI (traditional mode, default)
export OPENAI_API_KEY="sk-..."

# For Anthropic (reasoning mode)
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Note**: Kronologi defaults to using OpenAI's `gpt-4o` model. You can override this in your configuration or via the `--model` flag.

2. **Node.js**: Version 18 or higher

```bash
node --version  # Should be >= 18.0.0
```

## First Summary in 3 Steps

### Step 1: Create Job from Template

Use the interactive job creator:

```bash
# Interactive mode
kronologi-init

# Or from a template
kronologi-init --template monthly-summary my-first-job
kronologi-init --template weekly-summary my-weekly

# List available templates
kronologi-init --list-templates
```

This creates:
```
~/.kronologi/context/my-first-job/
├── analysis.yml       # Job configuration
├── persona.md         # AI persona
├── instructions.md    # Task instructions
└── README.md          # Template usage guide
```

**Tip**: Each template includes a comprehensive README.md that explains how to use it, customize it, and troubleshoot common issues. Read this first!

### Step 2: Add Activity Data

Create activity files to summarize:

```bash
mkdir -p ~/.kronologi/activity/2026-01
cat > ~/.kronologi/activity/2026-01/january.md << 'EOF'
# January Activity

## Week 1
- Launched new feature X
- Fixed bug Y

## Week 2
- Improved performance
- Updated documentation
EOF
```

### Step 3: Generate Summary

Run Kronologi:

```bash
# Generate monthly summary
kronologi my-first-job 2026 1

# Generate weekly summary (auto-detects current week)
cd ~/.kronologi && kronologi my-weekly-job

# Generate weekly summary for specific week
kronologi my-weekly-job 2026 4
```

**Note**: Kronologi automatically detects whether you want a monthly or weekly summary based on:
- Job name containing "week" → weekly mode
- Period values 1-12 → monthly (default)
- Period values 13-53 → always weekly
- No arguments → uses current year/week (for weekly jobs)

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

## Validate Your Configuration

Before generating, validate your job configuration:

```bash
kronologi-validate my-first-job
```

This checks for:
- Missing required files
- Invalid parameter references
- Unused parameters
- Configuration errors

## Enable Reasoning Mode (Optional)

For more intelligent reports, enable reasoning mode in your `analysis.yml`:

```yaml
# ~/.kronologi/context/my-first-job/analysis.yml
reasoning:
  enabled: true
  provider: anthropic  # Requires ANTHROPIC_API_KEY
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files
```

**What this does:**
- AI explores activity files dynamically
- Searches for specific information
- Better token efficiency (only reads what's needed)
- More intelligent content selection

**Requirements:**
- Anthropic API key: `export ANTHROPIC_API_KEY="sk-ant-..."`
- Claude Sonnet or Opus model

## Use with Claude Desktop (MCP)

Kronologi includes a Model Context Protocol (MCP) server for seamless integration with AI assistants.

### Setup

1. **Add to Claude config** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "kronologi": {
      "command": "kronologi-mcp"
    }
  }
}
```

2. **Restart Claude Desktop**

3. **Ask Claude**:
   - "Generate a monthly report for my-first-job for January 2026"
   - "Generate a weekly summary for this week"
   - "List all Kronologi jobs"
   - "Show me the report for my-first-job from January 2026"
   - "What reports are available for project-updates?"

### Available MCP Capabilities

**Tools:**
- `generate_report` - Create new reports (supports monthly and weekly)
- `list_jobs` - List all configured jobs
- `get_report` - Retrieve existing reports
- `list_reports` - Query available reports with optional filtering

**Resources:**
- All reports accessible via `kronologi://report/{job}/{year-month}` URIs

**Prompts:**
- `generate-monthly-report` - Guided report generation workflow
- `review-recent-reports` - Analyze patterns across reports

### Testing the MCP Server

Use the MCP Inspector to test:

```bash
npx @modelcontextprotocol/inspector kronologi-mcp
```

### Troubleshooting MCP

**Server won't start:**
```bash
npm install
npm run build
```

**Jobs not found:**
- Verify `KRONOLOGI_DIR` is set correctly
- Check jobs exist in `~/.kronologi/context/`

**Reports not generating:**
- Ensure API keys are configured (OPENAI_API_KEY or ANTHROPIC_API_KEY)
- Verify activity files exist for the specified period
- Check job configuration with `kronologi-validate <job>`

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
  --pretty=format:"- %s (%an)" > ~/.kronologi/activity/2026-01/commits-jan.md

# Generate release notes (new format)
kronologi --job release-notes --year 2026 --month 1

# Legacy format still works
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

Validate before running:

```bash
kronologi-validate my-job
```

Use `--dry-run` to test without consuming API tokens:

```bash
# New format
kronologi --job my-job --year 2026 --month 1 --dry-run

# Legacy format
kronologi release-notes 2026 1 --dry-run
```

This shows what would be generated without making API calls.

## Debugging

Enable verbose logging to see what's happening:

```bash
kronologi --job my-job --year 2026 --month 1 --verbose
```

Or debug mode for even more detail:

```bash
kronologi --job my-job --year 2026 --month 1 --debug
```

## Replace Existing Summaries

By default, Kronologi won't overwrite existing files. Use `--replace`:

```bash
kronologi --job my-job --year 2026 --month 1 --replace
```

## Timezone Support

Specify timezone for date calculations:

```bash
kronologi --job my-job --year 2026 --month 1 --timezone America/New_York
```

## Multiple Jobs

Create multiple job types for different purposes:

```bash
# Create jobs from templates
kronologi-init --template release-notes release-notes
kronologi-init --template team-update team-updates
kronologi-init --template monthly-summary personal-review
```

This creates:
```
~/.kronologi/context/
  release-notes/      # For external release notes
  team-updates/       # For internal team updates
  personal-review/    # For personal monthly reviews
```

Run different jobs:

```bash
# New format (recommended)
kronologi --job release-notes --year 2026 --month 1
kronologi --job team-updates --year 2026 --month 1
kronologi --job personal-review --year 2026 --month 1

# Legacy format (still works)
kronologi release-notes 2026 1
kronologi team-updates 2026 1
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

### Issue: "Job not found"

**Solution**: Validate job exists and configuration is correct

```bash
# List available jobs
ls ~/.kronologi/context/

# Validate job configuration
kronologi-validate my-job
```

### Issue: "Configuration file not found"

**Solution**: Ensure job configuration exists

```bash
ls -la ~/.kronologi/context/my-job/
# Should show: analysis.yml, persona.md, instructions.md
```

### Issue: "No activity files found"

**Solution**: Check your pattern in `analysis.yml` and verify files exist

```bash
# Check activity files
ls ~/.kronologi/activity/2026-01/

# Validate configuration
kronologi-validate my-job
```

Configuration patterns:
```yaml
content:
  activity:
    pattern: '*.md'     # Matches files in activity/2026-01/
    pattern: '**/*.md'  # Matches files recursively
```

### Issue: "API token limit exceeded"

**Solution**: Enable reasoning mode for better token efficiency, or reduce history:

```bash
# Use reasoning mode (in analysis.yml)
reasoning:
  enabled: true
  provider: anthropic

# Or reduce history manually
kronologi --job my-job --year 2026 --month 1 --history-months 1
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

After running `kronologi --job release-notes --year 2026 --month 1`, you'll see:

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
