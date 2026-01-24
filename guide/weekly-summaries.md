# Weekly Summaries Guide

Kronologi supports weekly summaries with automatic week detection, making it easy to generate AI-powered summaries of your weekly activity.

## Overview

Weekly summaries allow you to generate AI-powered summaries of your activity on a weekly basis. Weeks are defined as:
- **Start**: Sunday (day 0)
- **End**: Saturday (day 6)
- **Numbering**: Week 1 starts on the first Sunday of the year
- **Auto-detection**: Automatically uses current week when year/week not specified
- **Directory prefix**: Uses "Week " prefix (e.g., "Week 2") for clarity

## Command Line Usage

### Basic Weekly Summary

```bash
# Current week (automatic detection)
cd /path/to/your/activity/directory
kronologi weekly-summary

# Specific week
kronologi weekly-summary 2026 4

# Current year, specific week
kronologi weekly-summary 2026 4
```

The first command automatically detects the current week and year, making it incredibly fast to generate summaries. The second generates a summary for week 4 of 2026.

**Key Features:**
- **No arguments needed**: Just run `kronologi weekly-summary` from your activity directory
- **Current directory support**: Works with relative paths (`activity/`, `summary/`)
- **Automatic week calculation**: Uses Sunday-based week numbering
- **Backward compatible**: All existing usage patterns still work

### With History and Summary Periods

```bash
kronologi weekly-summary 2026 4 2 1
```

This generates a summary for week 4 of 2026, including 2 weeks of history and summarizing 1 week.

### Arguments

```
kronologi <job> <year> <period> [historyPeriods] [summaryPeriods]
```

- `<job>`: The job name (e.g., `weekly-summary`)
- `<year>`: The year (e.g., `2026`)
- `<period>`: Week number (1-53) or month number (1-12)
  - Values 1-12: Interpreted as months (for backward compatibility)
  - Values 13-53: Interpreted as weeks
- `[historyPeriods]`: Optional number of periods of history to include
- `[summaryPeriods]`: Optional number of periods to summarize

## Directory Structure

Weekly summaries use a clear directory structure with "Week " prefix for easy identification:

```
activity/
  notes/
    2026/
      Week 1/      # Week 1
        notes.md
      Week 2/      # Week 2
        notes.md
      Week 4/      # Week 4
        notes.md

summary/
  weekly-summary/
    2026/
      Week 4/      # Week 4 summary
        summary.md
        completion.json
        inputs.json
```

**Note**: The "Week " prefix makes it easy to distinguish week-based directories from month-based directories (which use just numbers 1-12).

## Configuration File

Create a job configuration at `.kronologi/jobs/weekly-summary/config.yaml`. You can use `kronologi-init --template weekly-summary my-weekly` to create this automatically.

```yaml
# Weekly Summary Configuration
model: gpt-4o-mini
temperature: 0.7

parameters:
  year:
    type: number
    description: Year for the summary
  week:
    type: number
    description: Week number for the summary (1-53)

context: {}  # Required even if empty

content:
  activity:
    type: activity
    name: Weekly Activity
    directory: 'notes'
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    name: Weekly Summary
    pattern: 'summary.md'

  completion:
    type: metadata
    format: json
    pattern: 'completion.json'

  inputs:
    type: metadata
    format: json
    pattern: 'inputs.json'
```

**Important**: The `context: {}` section is required, even if empty. This prevents errors during processing.

### With Context (Historical Data)

```yaml
# Weekly Summary with Historical Context
model: gpt-4o-mini
temperature: 0.7

parameters:
  year:
    type: number
    description: Year for the summary
  week:
    type: number
    description: Week number for the summary (1-53)
  historyWeeks:
    type: number
    default: 1
    description: Number of weeks of history to include

context:
  previous_summaries:
    type: history
    name: Previous Summaries
    from: summary
    weeks: ${parameters.historyWeeks}

content:
  activity:
    type: activity
    name: Weekly Activity
    directory: 'notes'
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    name: Weekly Summary
    pattern: 'summary.md'

  completion:
    type: metadata
    format: json
    pattern: 'completion.json'

  inputs:
    type: metadata
    format: json
    pattern: 'inputs.json'
```

## Prompt Files

Create persona and instructions files alongside your config:

### `.kronologi/jobs/weekly-summary/persona.md`

```markdown
# Weekly Summary Assistant

You are an AI assistant that creates concise weekly summaries from activity notes.
```

### `.kronologi/jobs/weekly-summary/instructions.md`

```markdown
# Instructions

Create a weekly summary for week ${parameters.week} of ${parameters.year}.

## Format

- Start with a brief overview
- Highlight key activities and accomplishments
- Note any important decisions or changes
- Keep it concise but informative

## Output

Provide a markdown-formatted summary.
```

## Week Number Calculation

Kronologi uses a Sunday-based week numbering system:

- **Week 1**: Starts on the first Sunday of the year
- **Week numbering**: Sequential from 1 to 52/53
- **Days**: Sunday (start) through Saturday (end)

### Example: 2026

- Week 1: January 4 (first Sunday) - January 10
- Week 2: January 11 - January 17
- Week 4: January 25 - January 31

## Migrating from Monthly to Weekly

If you have existing monthly summaries and want to switch to weekly:

1. **Reorganize your activity files**:
   ```bash
   # Old structure
   activity/notes/2026/1/notes.md  # January
   
   # New structure
   activity/notes/2026/1/notes.md  # Week 1
   activity/notes/2026/2/notes.md  # Week 2
   ```

2. **Create a weekly job configuration** (see above)

3. **Update your workflow** to organize notes by week instead of month

## Tips

1. **Consistent naming**: Use consistent file names within each week directory (e.g., `DD-HHMM-title.md`)
2. **Week boundaries**: Remember that weeks span Sunday-Saturday
3. **History context**: Use `historyWeeks` to include previous weeks for context
4. **Automation**: Consider automating weekly summary generation with cron or CI/CD
5. **Shell alias**: Create an alias for quick access: `alias weekly='cd ~/my-project && kronologi weekly-summary'`
6. **Directory organization**: Use "Week " prefix directories for clarity (e.g., `Week 2`, not just `2`)
7. **Migration script**: Use `scripts/reorganize-by-week.js` to reorganize existing month-based files into weeks

## Automation Ideas

### Weekly Cron Job

Add to your crontab to run every Sunday at 9 PM:

```bash
0 21 * * 0 cd "/path/to/activity" && kronologi weekly-summary
```

### Shell Alias

Add to your `.zshrc` or `.bashrc`:

```bash
alias weekly='cd "/path/to/activity" && kronologi weekly-summary'
```

Then just run:
```bash
weekly
```

### CI/CD Integration

```yaml
# .github/workflows/weekly-summary.yml
name: Weekly Summary
on:
  schedule:
    - cron: '0 21 * * 0'  # Every Sunday at 9 PM
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @redaksjon/kronologi
      - run: kronologi weekly-summary
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Troubleshooting

### "Cannot convert undefined or null to object"

This error occurs when the `context` section is missing from your config file. Make sure your config includes at least an empty `context: {}` section.

**Solution**: Add `context: {}` to your `config.yaml`

### "Period must be between 1-12 for months or 1-53 for weeks"

Week numbers must be between 1 and 53. If you're using a value outside this range, check your week calculation.

**Solution**: Verify the week number is correct. For 2026, week 1 starts January 4 (first Sunday).

### "No contributing files found"

Make sure your activity files are organized in the correct directory structure with "Week " prefix:

```
activity/notes/YEAR/Week WEEK/filename.md
```

**Solution**: 
1. Check directory name includes "Week " prefix (e.g., "Week 2" not just "2")
2. Verify files match the pattern in config.yaml (default: `*.md`)
3. Confirm the week number is correct
4. Use `ls -la activity/notes/2026/` to verify directory structure

### "Missing required parameter: week"

The job name must contain "week" (case-insensitive) for auto-detection to work with values 1-12. Or use values 13-53 which are always interpreted as weeks.

**Solution**: Name your job with "week" in it (e.g., `weekly-summary`, `week-report`)

### Week Number Confusion

Kronologi uses Sunday-based weeks starting from the first Sunday of the year. This may differ from ISO week numbers (which start on Monday).

**Example for 2026**:
- January 1, 2026 is a Thursday
- First Sunday is January 4
- Week 1: January 4-10
- Week 2: January 11-17
- Week 3: January 18-24
- Week 4: January 25-31

## Examples

### Generate summary for current week

```bash
# Assuming it's week 4 of 2026
kronologi weekly-summary 2026 4
```

### Generate summary with 2 weeks of history

```bash
kronologi weekly-summary 2026 4 2 1
```

### Dry run (don't save files)

```bash
kronologi weekly-summary 2026 4 --dry-run
```

### Use a different model

```bash
kronologi weekly-summary 2026 4 --model gpt-4o
```
