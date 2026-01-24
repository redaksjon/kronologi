# Weekly Summary Template

A template for creating weekly summaries from your activity files, perfect for regular progress tracking and weekly reviews.

## What This Template Does

This template generates a comprehensive weekly summary by analyzing all markdown files in your activity directory for a given week. Weeks run from Sunday through Saturday.

Perfect for:
- Weekly progress reports
- Personal weekly reviews
- Team stand-up summaries
- Sprint retrospectives

## How It Works

### Week Numbering

Kronologi uses **Sunday-based weeks**:
- Week 1 starts on the first Sunday of the year
- Each week runs Sunday through Saturday
- Week numbers range from 1 to 52/53

**Example for 2026:**
- Week 1: January 4-10 (first Sunday is Jan 4)
- Week 2: January 11-17
- Week 3: January 18-24
- Week 4: January 25-31

### Input Structure

Organize your activity files by year and week with "Week " prefix:

```
activity/
  notes/
    2026/
      Week 1/
        notes.md
        meetings.md
      Week 2/
        notes.md
        accomplishments.md
```

### Output Structure

Generates summaries in your summary directory:

```
summary/
  2026/
    Week 2/
      summary.md          # The AI-generated summary
      completion.json     # API usage statistics
      inputs.json         # Complete input data for debugging
```

**Note**: The "Week " prefix makes it easy to distinguish week-based directories from month-based directories (which use just numbers 1-12).

## Configuration

### Model Settings

```yaml
model: gpt-4o-mini      # Fast, cost-effective model
temperature: 0.7        # Balanced creativity/consistency
```

### Parameters

- `year`: The year to summarize (e.g., 2026)
- `week`: The week number to summarize (1-53)

### Content Sources

```yaml
content:
  activity:
    type: activity
    directory: 'notes'  # Subdirectory for notes
    pattern: '*.md'     # All markdown files
```

## Usage

### Basic Usage

```bash
# Generate summary for current week (automatic)
cd /path/to/your/activity/directory
kronologi weekly-summary

# Generate summary for specific week
kronologi weekly-summary 2026 2
```

**Tip**: When run without arguments, kronologi automatically detects:
- Current year
- Current week number (Sunday-based)
- Uses directories relative to current location

### With History

Include previous weeks for context:

```bash
# Week 4 with 2 weeks of history
kronologi weekly-summary 2026 4 2 1
```

### Convenience Script

Use the provided helper script:

```bash
# Current week
/path/to/kronologi/scripts/weekly-summary.sh

# Specific week
/path/to/kronologi/scripts/weekly-summary.sh 4

# With options
/path/to/kronologi/scripts/weekly-summary.sh 4 --dry-run
```

### Other Options

```bash
# Dry run (test without saving)
kronologi weekly-summary 2026 2 --dry-run

# Different model
kronologi weekly-summary 2026 2 --model gpt-4o

# Replace existing summary
kronologi weekly-summary 2026 2 --replace

# Verbose output
kronologi weekly-summary 2026 2 --verbose
```

## File Organization

### Recommended File Naming

Use this format for consistency:
```
DD-HHMM-descriptive-title.md
```

Examples:
- `11-0830-weekly-planning.md`
- `11-1430-project-review.md`
- `14-0900-team-meeting.md`

### Reorganizing Existing Files

If you have files organized by month, use the reorganization script:

```bash
node /path/to/kronologi/scripts/reorganize-by-week.js \
  "/path/to/activity/notes/2026/1" \
  "/path/to/activity/notes" \
  2026
```

This will:
1. Read files from the month directory
2. Extract the day from each filename
3. Calculate the week number
4. Move files to the appropriate week directory

## Customization

### 1. Adjust the Persona

Edit `persona.md` to change the AI's tone:

```markdown
You are a productivity coach creating weekly reviews.

## Your Role
- Focus on accomplishments and growth
- Identify patterns and trends
- Suggest improvements for next week
```

### 2. Modify the Output Format

Edit `instructions.md` to change the summary structure:

```markdown
## Output Format

# Week {{parameters.week}} Review - {{parameters.year}}

## This Week's Wins
- [Win 1]
- [Win 2]

## Challenges Faced
- [Challenge 1]
- [Challenge 2]

## Next Week's Focus
- [Priority 1]
- [Priority 2]
```

### 3. Add Historical Context

Include previous week's summary for continuity:

```yaml
context:
  previous_week:
    type: history
    name: Previous Week
    from: summary
    weeks: 1
```

## Tips

1. **Daily Notes**: Create a note file each day for best results
2. **Consistent Format**: Use the same file naming convention
3. **Rich Detail**: Include specific accomplishments, decisions, and blockers
4. **Regular Cadence**: Run summaries every Sunday evening or Monday morning
5. **Review and Reflect**: Use summaries for personal reflection and planning

## Automation

### Weekly Cron Job

Add to your crontab to run every Sunday at 9 PM:

```bash
0 21 * * 0 cd "/path/to/activity" && /path/to/kronologi/dist/main.js weekly-summary $(date +\%Y) $(date +\%U)
```

### Shell Alias

Add to `.zshrc` or `.bashrc`:

```bash
alias weekly='cd "/path/to/activity" && /path/to/kronologi/dist/main.js weekly-summary'
```

Then use:
```bash
weekly 2026 4
```

## Troubleshooting

### "Cannot convert undefined or null to object"

Add an empty `context: {}` section to your config.yaml.

### "No contributing files found"

- Verify files are in `activity/notes/YEAR/WEEK/`
- Check that files match the pattern (default: `*.md`)
- Confirm the week number is correct

### Week Number Confusion

Remember: Kronologi uses Sunday-based weeks, which may differ from ISO weeks (Monday-based). Use the calculation script or check the week reference table in the documentation.

### "Missing required parameter: week"

The job name must contain "week" (case-insensitive) for values 1-12 to be interpreted as weeks. Or use values 13-53 which are always interpreted as weeks.

## Week Reference for 2026

| Week | Start (Sun) | End (Sat) | Dates          |
|------|-------------|-----------|----------------|
| 1    | Jan 4       | Jan 10    | Jan 4-10       |
| 2    | Jan 11      | Jan 17    | Jan 11-17      |
| 3    | Jan 18      | Jan 24    | Jan 18-24      |
| 4    | Jan 25      | Jan 31    | Jan 25-31      |
| 5    | Feb 1       | Feb 7     | Feb 1-7        |

## Next Steps

After creating your job:

1. **Organize Files**: Place notes in `activity/notes/YEAR/WEEK/`
2. **Test Run**: Use `--dry-run` to preview
3. **Customize**: Adjust persona and instructions
4. **Automate**: Set up weekly automation
5. **Review**: Make weekly reviews part of your routine

## Related Templates

- **monthly-summary**: For monthly instead of weekly summaries
- **release-notes**: For software release documentation
- **team-update**: For team communications

## Learn More

- [Weekly Summaries Guide](../../../guide/weekly-summaries.md)
- [Configuration Guide](../../../guide/configuration.md)
- [Quick Start Guide](../../../guide/quickstart.md)
