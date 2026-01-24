# Kronologi

<!-- Test publish 2026-01-22 -->

Kronologi is a powerful tool for generating intelligent reports and summaries from activity and context over customizable timeperiods. It uses AI to analyze and synthesize information, making it easier to create comprehensive and meaningful documentation for your work, whether you need monthly, weekly, or custom-period reports.

## Features

- **Intelligent Reports**: Generate AI-powered reports for any timeperiod (monthly, weekly, custom intervals)
- **Weekly & Monthly Summaries**: Automatic week detection with Sunday-Saturday weeks, or traditional monthly reports
- **Multiple AI Providers**: Support for both OpenAI (GPT-4) and Anthropic (Claude) models
- **Reasoning Mode**: Enable agentic workflows where AI can explore files, search content, and make intelligent decisions
- **MCP Server**: Full integration with AI assistants like Claude Desktop via Model Context Protocol
- **Interactive Setup**: Create new jobs from templates with `kronologi-init`
- **Configuration Validation**: Validate job configurations with `kronologi-validate`
- **Git History Analysis**: Analyze Git history with customizable time periods
- **Context-Aware**: Historical continuity and context across reports
- **Flexible Configuration**: Customizable report types and output formats
- **Aggregate Activity**: Summarize activity across projects and teams

## Installation

```bash
npm install -g @redaksjon/kronologi
```

## Quick Start

### Create a New Job

```bash
# Interactive mode
kronologi-init

# From template
kronologi-init --template monthly-summary my-job
kronologi-init --template weekly-summary my-weekly

# List available templates
kronologi-init --list-templates
```

### Generate a Report

```bash
# Monthly report
kronologi --job monthly-summary --year 2026 --month 1

# Weekly report (auto-detects current week)
cd /path/to/activity/directory
kronologi weekly-summary

# Weekly report for specific week
kronologi weekly-summary 2026 4

# With custom history
kronologi --job my-job --year 2026 --month 1 --history-months 3
```

### Validate Configuration

```bash
kronologi-validate my-job
```

### Start MCP Server

```bash
# For use with Claude Desktop or other MCP clients
kronologi-mcp
```

## Command Line Usage

Kronologi provides a rich set of command line options to customize its behavior:

### Required Arguments

- `<summaryType>`: Type of summary to generate (e.g., `monthly-summary`, `weekly-summary`)
- `<year>`: Year for the summary (optional for weekly summaries - defaults to current year)
- `<period>`: Period for the summary
  - For monthly: 1-12 (month number)
  - For weekly: 1-53 (week number, optional - defaults to current week)

### Optional Arguments

- `[historyPeriods]`: Number of periods of history to include (default: 1)
- `[summaryPeriods]`: Number of periods to summarize (default: 1)

### Options

- `--dry-run`: Perform a dry run without saving files (default: false)
- `--verbose`: Enable verbose logging (default: false)
- `--debug`: Enable debug logging (default: false)
- `--timezone <timezone>`: Timezone for date calculations (default: system timezone)
- `--openai-api-key <openaiApiKey>`: OpenAI API key (can also be set via OPENAI_API_KEY environment variable)
- `--model <model>`: OpenAI model to use (default: gpt-4)
- `--config-dir <configDir>`: Config directory (default: ./config)
- `--context-directory <contextDirectory>`: Directory containing context files to be included in prompts (default: ./context)
- `--activity-directory <activityDirectory>`: Directory containing activity files to be included in prompts (default: ./activity)
- `--summary-directory <summaryDirectory>`: Directory containing summary files to be included in prompts (default: ./summary)
- `--replace`: Replace existing summary files if they exist (default: false)
- `--version`: Display version information

### Environment Variables

```bash
# Optional: Set custom Kronologi directory
export KRONOLOGI_DIR=~/.kronologi

# Required: AI provider keys
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...  # For reasoning mode with Anthropic
```

### Examples

1. Generate a monthly report using the new command format:
```bash
kronologi --job monthly-summary --year 2026 --month 1
```

2. Generate a weekly report (auto-detects current week):
```bash
cd /path/to/activity/directory
kronologi weekly-summary
```

3. Generate a weekly report for a specific week:
```bash
kronologi weekly-summary 2026 4
```

4. Generate with extended history:
```bash
kronologi --job team-updates --year 2026 --month 1 --history-months 3
kronologi weekly-summary 2026 4 2 1  # Week 4 with 2 weeks history
```

5. Generate using reasoning mode (configured in analysis.yml):
```bash
# First enable reasoning in ~/.kronologi/context/my-job/analysis.yml
# Then run normally:
kronologi --job my-job --year 2026 --month 1
```

6. Replace an existing report:
```bash
kronologi --job my-job --year 2026 --month 1 --replace
```

7. Legacy format (still supported):
```bash
kronologi release-notes 2024 1
kronologi quarterly-review 2024 1 --timezone America/New_York
```

## How It Works

Kronologi analyzes your activity and context over customizable timeperiods using a sophisticated analysis engine that supports two modes:

### Traditional Mode (Default)

1. Reads and processes job-specific configuration files
2. Gathers content from various sources including:
   - Static context files (guidelines, entity definitions)
   - Historical context from previous periods and summaries
   - Activity files from the specified timeperiod
3. Sends all content to AI in a single request for report generation
4. Outputs structured results in your preferred format

### Reasoning Mode (Optional)

When enabled, AI actively explores and reasons about content:

1. Reads job configuration and provides initial context
2. AI receives tool capabilities (read_file, list_files, search_files)
3. AI autonomously explores activity files, searching for relevant information
4. AI makes intelligent decisions about what to include in the report
5. Multi-turn conversation continues until AI has gathered sufficient information
6. Final report is generated with optimized token usage

The analysis engine is highly configurable, allowing you to:
- Choose between multiple AI providers (OpenAI, Anthropic)
- Enable reasoning mode for agentic workflows
- Define custom report types for different timeperiods (monthly, weekly, quarterly, etc.)
- Aggregate and summarize activity from multiple sources
- Include historical data to inform current summaries
- Control AI processing parameters (temperature, token limits, models)
- Customize the output format and structure
- Reference previous summaries for continuity

## Advanced Features

### Reasoning Mode

Enable AI to actively explore files and make intelligent decisions during report generation:

```yaml
# In your job's analysis.yml
reasoning:
  enabled: true
  provider: anthropic  # or 'openai'
  maxIterations: 10
  tools:
    - read_file      # AI can read specific files
    - list_files     # AI can discover available files
    - search_files   # AI can search for content
```

**Benefits:**
- AI explores activity files dynamically instead of receiving all content upfront
- Better token efficiency (only reads what's needed)
- More intelligent content selection
- Searches for specific information when needed

### MCP Server Integration

Kronologi includes a Model Context Protocol (MCP) server that exposes report generation capabilities to AI assistants like Claude Desktop, enabling natural language interaction with your reports.

#### Quick Setup

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

3. **Ask Claude to generate reports**:
```
"Generate a monthly report for project-updates for January 2026"
"List all available Kronologi jobs"
"Show me the report from last month"
```

#### Available MCP Tools

- **`generate_report`** - Generate reports for any job
  - Parameters: `job`, `year`, `month`, `historyMonths`, `summaryMonths`, `replace`
  - Supports both monthly and weekly reports
  
- **`list_jobs`** - List available job configurations
  - Returns all configured jobs from `~/.kronologi/context/`
  
- **`get_report`** - Retrieve existing reports
  - Parameters: `job`, `year`, `month`
  - Returns report content in markdown format
  
- **`list_reports`** - Query available reports
  - Optional parameter: `job` (filter by job name)
  - Returns array of reports with metadata

#### MCP Resources

All generated reports are exposed as MCP resources with URI format:
```
kronologi://report/{job}/{year-month}
```

Example: `kronologi://report/monthly-summary/2026-01`

#### MCP Prompts

- **`generate-monthly-report`** - Guided workflow for generating reports
- **`review-recent-reports`** - Analyze recent reports for patterns

#### Reasoning Mode with MCP

When reasoning mode is enabled in your job configuration, the MCP server automatically uses it for agentic workflows:

```yaml
# In your job's analysis.yml
reasoning:
  enabled: true
  provider: anthropic
```

This enables AI to actively explore files and make intelligent decisions during report generation.

### Configuration

Jobs are configured in `~/.kronologi/context/{job}/analysis.yml`:

```yaml
name: monthly-summary
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

# Optional: Enable reasoning mode
reasoning:
  enabled: true
  provider: anthropic

parameters:
  CURRENT_MONTH:
    type: string
    default: "2026-01"

content:
  activity:
    name: "Activity Files"
    directory: "activity"
    pattern: "**/*.md"

output:
  report:
    name: "Monthly Summary"
    format: markdown
    pattern: "summary.md"
```

## Troubleshooting

### "Job not found"

```bash
# List available jobs
ls ~/.kronologi/context/

# Validate job configuration
kronologi-validate my-job
```

### "No API key"

```bash
# Set OpenAI key
export OPENAI_API_KEY=sk-...

# Or Anthropic key (for reasoning mode)
export ANTHROPIC_API_KEY=sk-ant-...
```

### "Activity files not found"

```bash
# Check directory structure
ls ~/.kronologi/activity/2026-01/

# Verify pattern in analysis.yml matches your files
```

### MCP Server Not Starting

```bash
# Rebuild
npm run build

# Test manually
npm run mcp

# Test with MCP Inspector
npx @modelcontextprotocol/inspector kronologi-mcp

# Check logs
cat ~/Library/Logs/Claude/mcp*.log
```

**Common issues:**
- Missing dependencies: Run `npm install`
- Jobs not found: Verify `KRONOLOGI_DIR` is set correctly
- Reports not generating: Check API keys are configured

## Documentation

- [guide/](./guide/) - Comprehensive documentation
  - [Quick Start](./guide/quickstart.md) - Get started in 5 minutes
  - [Configuration](./guide/configuration.md) - Complete configuration reference
  - [Weekly Summaries](./guide/weekly-summaries.md) - Weekly report guide
  - [Architecture](./guide/architecture.md) - System design
  - [Development](./guide/development.md) - Contributing guide
- [examples/](~/.kronologi/examples/) - Template jobs

## Name Origin

The name "Kronologi" comes from the Norwegian word for "chronology" or "timeline", reflecting its purpose of creating temporal reports and documentation of your work over customizable timeperiods.
TEST
