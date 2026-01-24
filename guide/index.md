# Kronologi AI Guide

Kronologi is an intelligent reporting tool that uses AI to analyze and synthesize information from activity logs and contextual data over customizable timeperiods. It transforms raw activity data (code changes, logs, documents) into comprehensive, meaningful reports—whether you need monthly summaries, weekly updates, quarterly reviews, or custom-period documentation.

## Quick Reference

### Essential Commands

```bash
# Create a new job from template
kronologi-init --template monthly-summary my-job
kronologi-init --template weekly-summary my-weekly

# Validate job configuration
kronologi-validate my-job

# Generate a monthly report (new format)
kronologi --job monthly-summary --year 2026 --month 1

# Generate a weekly report (auto-detects current week)
cd /path/to/activity && kronologi weekly-summary

# Generate a weekly report for specific week
kronologi weekly-summary 2026 4

# Generate with historical context
kronologi --job my-job --year 2026 --month 1 --history-months 3

# Start MCP server (for Claude Desktop integration)
kronologi-mcp

# Legacy format (still supported)
kronologi release-notes 2026 1

# Dry run to see what would be generated
kronologi --job my-job --year 2026 --month 1 --dry-run

# Replace existing report
kronologi --job my-job --year 2026 --month 1 --replace
```

### Command Structure

#### New Format (Recommended)

```bash
# Monthly reports
kronologi --job <job-name> --year <year> --month <month> [options]

# Weekly reports (auto-detects current week)
kronologi <job-name>

# Weekly reports (specific week)
kronologi <job-name> <year> <week>
```

**Required:**
- `--job <name>`: Job name from `~/.kronologi/context/`
- `--year <year>`: Year (1900-2100, optional for weekly)
- `--month <month>`: Month (1-12) or `--week <week>`: Week (1-53, optional - auto-detects)

**Options:**
- `--history-months <n>`: Months of historical activity (default: from config)
- `--summary-months <n>`: Previous reports to include (default: from config)
- `--dry-run`: Test run without saving
- `--verbose`: Verbose logging
- `--debug`: Debug logging
- `--replace`: Overwrite existing files

#### Legacy Format (Still Supported)

```bash
# Monthly
kronologi <job> <year> <month> [historyMonths] [summaryMonths] [options]

# Weekly (auto-detects current week if year/week omitted)
kronologi <job> [year] [week] [historyWeeks] [summaryWeeks] [options]
```

#### Additional Commands

```bash
# Create new job
kronologi-init [--template <template>] [job-name]

# Validate configuration
kronologi-validate <job-name>

# Start MCP server
kronologi-mcp
```

## Key Capabilities

### 1. Intelligent Summarization

Kronologi uses AI to:
- Analyze activity patterns across configurable timeperiods (monthly, weekly, custom intervals)
- Synthesize multiple data sources (activity logs, historical data, previous reports, static context)
- Generate coherent narratives from raw technical data
- Create various report types: release notes, change logs, weekly updates, monthly summaries, quarterly reviews
- **NEW**: Support for reasoning mode where AI actively explores files and makes intelligent decisions

### 2. Multiple AI Providers

- **OpenAI**: GPT-4, GPT-4o, GPT-4o-mini, o1, o1-mini, o3-mini
- **Anthropic**: Claude (Sonnet, Opus) with reasoning capabilities
- Provider abstraction for easy addition of new AI models
- Simple and agentic modes available

### 3. Reasoning Mode (Agentic Workflows)

When enabled, AI can:
- **Explore files dynamically** instead of receiving all content upfront
- **Search for specific information** across activity files
- **Make intelligent decisions** about what to include
- **Better token efficiency** by only reading what's needed
- **Multi-turn conversations** with tool use

Available tools:
- `read_file`: Read specific activity, summary, or context files
- `list_files`: Discover available files with pattern matching
- `search_files`: Search file content for specific queries

### 4. MCP Server Integration

Full Model Context Protocol support for seamless AI assistant integration:

**Setup:**
```json
{
  "mcpServers": {
    "kronologi": {
      "command": "kronologi-mcp"
    }
  }
}
```

**Capabilities:**
- **Tools**: 
  - `generate_report` - Create monthly or weekly reports
  - `list_jobs` - List all configured jobs
  - `get_report` - Retrieve existing reports
  - `list_reports` - Query available reports with filtering
- **Resources**: All reports exposed as `kronologi://report/{job}/{year-month}` URIs
- **Prompts**: 
  - `generate-monthly-report` - Guided report generation
  - `review-recent-reports` - Pattern analysis across reports
- **Natural Language**: Ask Claude to generate reports conversationally
- **Automatic Reasoning**: Uses reasoning mode when configured in jobs

### 5. Flexible Configuration

- **Job-Based Configuration**: Each report type has its own configuration (weekly, monthly, quarterly, etc.)
- **Multiple Data Sources**: Static context, activity files, historical data, previous reports
- **Parameter Templates**: Dynamic values in prompts via `{{parameters.key}}`
- **Customizable Timeperiods**: Define reports for any timeframe that fits your workflow
- **Customizable Output**: Multiple output formats per job
- **Interactive Setup**: Create jobs from templates with `kronologi-init`
- **Validation**: Validate configurations with `kronologi-validate`

### 6. Context-Aware Processing

- **Historical Context**: Include previous periods of activity to inform current reports
- **Report Continuity**: Reference previous reports to maintain narrative consistency
- **Static Context**: Project-specific knowledge, guidelines, and entity definitions
- **Parameter System**: Pass dynamic values to prompts for flexible report generation

### 7. Intelligent Error Handling

- **Token Management**: Automatically reduces history when exceeding API limits
- **Retry Logic**: Graceful handling of API failures
- **Validation**: Zod schemas ensure configuration correctness
- **Structured Logging**: Winston-based logging for debugging

## For AI Assistants

When working with Kronologi, start with:

1. [Quick Start](./quickstart.md) - Get up and running
2. [Architecture](./architecture.md) - Understand the system design
3. [Jobs](./jobs.md) - Learn how to configure jobs
4. [Configuration](./configuration.md) - Deep dive into configuration options
5. [Prompts](./prompts.md) - Master prompt engineering

**Key Concepts:**
- **Jobs**: Configured report types (e.g., "release-notes", "weekly-update", "monthly-review", "quarterly-report")
- **Context**: Background information for AI (static files, historical data, previous reports)
- **Content**: Primary material to analyze (activity logs from the target timeperiod)
- **Parameters**: Dynamic values passed through the system
- **Output**: Generated reports with configurable naming and format
- **Timeperiods**: Customizable intervals for aggregating and summarizing activity

## Default Configuration

```yaml
# .kronologi/jobs/release-notes/config.yaml
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000
historyMonths: 1
summaryMonths: 1
```

## Directory Structure

```
project/
├── .kronologi/              # Configuration directory
│   └── jobs/
│       └── <job-name>/
│           ├── config.yaml      # Job configuration
│           ├── persona.md       # AI persona instructions
│           └── instructions.md  # Task-specific instructions
├── context/                 # Static context files
│   └── global/
│       └── guidelines.md
├── activity/                # Activity/log files
│   ├── commits.md
│   └── changes.md
└── summary/                 # Generated summaries
    └── 2026/
        └── 01/
            ├── summary.md       # Main output
            ├── completion.json  # API metadata
            └── inputs.json      # Input analysis
```

## Integration with Other Tools

### Protokoll Integration

Kronologi works naturally with [Protokoll](../protokoll/guide/index.md):
- **Protokoll transcribes** audio notes → organized transcripts
- **Kronologi summarizes** transcripts → weekly, monthly, or custom-period reports

```bash
# Example workflow
# 1. Use Protokoll to transcribe meetings
protokoll --input-directory ~/recordings

# 2. Transcripts written to ~/notes/2026/01/

# 3. Configure Kronologi to read from notes
# .kronologi/jobs/weekly-notes/config.yaml:
#   content:
#     notes:
#       type: activity
#       directory: '~/notes'
#       pattern: '**/*.md'

# 4. Generate weekly summary
kronologi weekly-notes 2026 1

# Or generate monthly summary
kronologi monthly-notes 2026 1
```

### Observasjon Integration

Use with Observasjon for enhanced context:
- Observasjon manages entity definitions (people, projects, terms)
- Kronologi can reference these entities in summaries
- Static context can include entity databases

## Common Use Cases

### 1. Release Notes

Generate release notes from Git history:

```bash
# Generate release notes for January 2026
kronologi release-notes 2026 1
```

### 2. Weekly Team Updates

Summarize team activity across multiple projects:

```bash
# Weekly update with 2 weeks of history, 1 previous report
kronologi weekly-update 2026 1 2 1

# Or monthly team update
kronologi monthly-update 2026 1 2 1
```

### 3. Project Documentation

Create monthly documentation from changelogs:

```bash
kronologi project-docs 2026 1 --replace
```

### 4. Personal Reviews

Generate personal reviews from notes at any timeperiod:

```bash
# Weekly personal review
kronologi weekly-review 2026 1 --timezone America/New_York

# Monthly personal review
kronologi monthly-review 2026 1 3 2 --timezone America/New_York
```

## Best Practices

### For Configuration

1. **Start Simple**: Begin with minimal config, add complexity as needed
2. **Use Parameters**: Make prompts reusable with parameter templates
3. **Organize Context**: Keep static context separate from activity data
4. **Version Control**: Track `.kronologi/` directory in Git

### For Prompts

1. **Clear Instructions**: Be explicit about desired output format
2. **Provide Examples**: Include examples in persona/instructions
3. **Use Context Wisely**: Don't overload with irrelevant history
4. **Test Iteratively**: Use `--dry-run` to test without consuming tokens

### For Operations

1. **Monitor Token Usage**: Check `completion.json` for API usage
2. **Use Appropriate Models**: Balance cost and capability
3. **Leverage History**: Include relevant previous months for context
4. **Review Outputs**: Use `inputs.json` to understand what was sent to AI

## Output Files

Each run generates three files:

### 1. summary.md (or custom name)

The main AI-generated report:

```markdown
# Report for January 2026

## Highlights
- Feature X shipped successfully
- Performance improved by 40%
...
```

### 2. completion.json

API metadata for analysis:

```json
{
  "id": "chatcmpl-...",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 2847,
    "completion_tokens": 1205,
    "total_tokens": 4052
  },
  "created": 1737574800
}
```

### 3. inputs.json

Input analysis for debugging:

```json
{
  "context": {
    "previous_summary": {
      "characterCount": 3421,
      "files": ["summary/2025/12/summary.md"]
    }
  },
  "content": {
    "activity": {
      "characterCount": 15432,
      "files": ["activity/commits.md", "activity/changes.md"]
    }
  }
}
```

## Model Selection

### OpenAI Models

| Model | Best For | Cost |
|-------|----------|------|
| `gpt-4o` | **Default** - Balanced performance | Medium |
| `gpt-4o-mini` | Quick summaries, lower cost | Low |
| `gpt-4` | High-quality analysis | High |
| `o1` | Complex reasoning tasks | High |
| `o1-mini` | Reasoning on a budget | Medium |
| `o3-mini` | Latest reasoning model | Medium |

### Anthropic Models (Reasoning Mode)

| Model | Best For | Cost |
|-------|----------|------|
| `claude-sonnet-4` | **Recommended** - Agentic workflows, tool use | Medium |
| `claude-opus-4` | High-quality reasoning | High |
| `claude-3-5-sonnet` | Previous generation | Medium |

**Note**: Anthropic models support reasoning mode with tool use (file reading, searching, exploration).

## Reasoning Mode Configuration

Enable AI to actively explore files:

```yaml
# In your job's analysis.yml
reasoning:
  enabled: true
  provider: anthropic  # or 'openai' (limited tool support)
  maxIterations: 10    # Max tool use rounds
  tools:
    - read_file        # Read specific files
    - list_files       # Discover available files
    - search_files     # Search file content
```

**Benefits:**
- Better token efficiency (only reads what's needed)
- More intelligent content selection
- Dynamic exploration of activity files
- Searchable content discovery

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (required for OpenAI models) |
| `ANTHROPIC_API_KEY` | Anthropic API key (required for reasoning mode with Anthropic) |
| `KRONOLOGI_DIR` | Override default Kronologi directory (default: `~/.kronologi`) |
| `KRONOLOGI_TIMEZONE` | Default timezone for date calculations |

## MCP Server Integration

### Setup with Claude Desktop

1. **Configure Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

3. **Use Claude to generate reports**:
   - "Generate a monthly report for project-updates for January 2026"
   - "List all available Kronologi jobs"
   - "Show me the report for team-updates from December 2025"

### Available MCP Tools

- **generate_report**: Generate a new report for any job
- **list_jobs**: List all configured jobs
- **get_report**: Retrieve an existing report
- **list_reports**: Query available reports by job

### Resources

All generated reports are accessible as resources:
- URI format: `kronologi://report/{job}/{year-month}`
- Example: `kronologi://report/monthly-summary/2026-01`

For complete MCP setup and usage, see the [Quick Start Guide](./quickstart.md#use-with-claude-desktop-mcp) and [Development Guide](./development.md#adding-a-new-mcp-tool).

## Getting Help

```bash
# Show all options
kronologi --help

# Check version
kronologi --version

# Validate job configuration
kronologi-validate my-job

# List available templates
kronologi-init --list-templates
```

## Next Steps

- [Quick Start](./quickstart.md) - Get started in 5 minutes
- [Architecture](./architecture.md) - Understand the system
- [Jobs](./jobs.md) - Configure your first job
- [Configuration](./configuration.md) - Master configuration
- [Prompts](./prompts.md) - Write effective prompts
- [Models](./models.md) - Choose the right model
- [Development](./development.md) - Contribute to Kronologi
