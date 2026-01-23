# Kronologi

<!-- Test publish 2026-01-22 -->

Kronologi is a powerful tool for generating intelligent reports and summaries from activity and context over customizable timeperiods. It uses AI to analyze and synthesize information, making it easier to create comprehensive and meaningful documentation for your work, whether you need monthly, weekly, or custom-period reports.

## Features

- Generate intelligent reports for any timeperiod (monthly, weekly, custom intervals)
- Analyze Git history with customizable time periods
- AI-powered summarization of activity and changes
- Flexible configuration for different report types
- Support for multiple output formats
- Context-aware analysis with historical continuity
- Aggregate and summarize activity across projects and teams

## Installation

```bash
npm install -g @redaksjon/kronologi
```

## Command Line Usage

Kronologi provides a rich set of command line options to customize its behavior:

### Required Arguments

- `<summaryType>`: Type of summary to generate
- `<year>`: Year for the summary (must be between 1900 and 2100)
- `<month>`: Month for the summary (1-12)

### Optional Arguments

- `[historyMonths]`: Number of months of history to include (default: 1)
- `[summaryMonths]`: Number of months to summarize (default: 1)

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

### Examples

1. Generate a monthly release notes report for January 2024:
```bash
kronologi release-notes 2024 1
```

2. Generate a weekly team update with 3 weeks of historical context:
```bash
kronologi weekly-update 2024 1 3
```

3. Generate a report with custom directories:
```bash
kronologi release-notes 2024 1 --config-dir ./my-config --context-directory ./my-context
```

4. Generate a quarterly report with specific timezone:
```bash
kronologi quarterly-review 2024 1 --timezone America/New_York
```

## How It Works

Kronologi analyzes your activity and context over customizable timeperiods using a sophisticated analysis engine that:

1. Reads and processes job-specific configuration files
2. Gathers content from various sources including:
   - Static context files (guidelines, entity definitions)
   - Historical context from previous periods and summaries
   - Activity files from the specified timeperiod
3. Processes and combines this information using AI to generate meaningful reports
4. Outputs structured results in your preferred format

The analysis engine is highly configurable, allowing you to:
- Define custom report types for different timeperiods (monthly, weekly, quarterly, etc.)
- Aggregate and summarize activity from multiple sources
- Include historical data to inform current summaries
- Control AI processing parameters (temperature, token limits, models)
- Customize the output format and structure
- Reference previous summaries for continuity

## Name Origin

The name "Kronologi" comes from the Norwegian word for "chronology" or "timeline", reflecting its purpose of creating temporal reports and documentation of your work over customizable timeperiods.
TEST
