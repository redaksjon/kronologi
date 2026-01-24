# Monthly Summary Template

A simple, beginner-friendly template for creating monthly summaries from your activity files.

## What This Template Does

This template generates a comprehensive monthly summary by analyzing all markdown files in your activity directory for a given month. It's perfect for:

- Personal monthly reviews
- Project status updates
- Team retrospectives
- Progress tracking

## How It Works

### Input Structure

The template expects your activity files to be organized by year and month:

```
activity/
  2026/
    1/
      notes.md
      meetings.md
      accomplishments.md
```

### Output Structure

Generates summaries in your summary directory:

```
summary/
  2026/
    1/
      summary.md          # The AI-generated summary
      completion.json     # API usage statistics
      inputs.json         # Complete input data for debugging
```

## Configuration

### Model Settings

```yaml
model: gpt-4o-mini      # Fast, cost-effective model
temperature: 0.7        # Balanced creativity/consistency
```

**Tip**: Change to `gpt-4o` for more sophisticated analysis, or `gpt-4o-mini` for faster/cheaper results.

### Parameters

- `year`: The year to summarize (e.g., 2026)
- `month`: The month to summarize (1-12)

### Content Sources

```yaml
content:
  activity:
    type: activity
    directory: ''       # Root of activity directory
    pattern: '*.md'     # All markdown files
```

**Customization**: Change `directory` to target a specific subdirectory (e.g., `'notes'` for `activity/notes/YEAR/MONTH/`)

## Usage

### Basic Usage

```bash
# Generate summary for January 2026
kronologi monthly-summary 2026 1
```

### With History

To include previous months for context, modify the config to add a `context` section:

```yaml
context:
  previous_month:
    type: history
    name: Previous Month
    from: activity
    months: 1
```

Then run:
```bash
kronologi monthly-summary 2026 1 1 1
```

### Dry Run

Test without saving files:
```bash
kronologi monthly-summary 2026 1 --dry-run
```

### Different Model

Override the model:
```bash
kronologi monthly-summary 2026 1 --model gpt-4o
```

## Customization

### 1. Adjust the Persona

Edit `persona.md` to change the AI's tone and approach:

```markdown
You are a technical project manager creating executive summaries.

## Your Role
- Focus on business impact and ROI
- Use data and metrics
- Highlight risks and opportunities
```

### 2. Modify the Output Format

Edit `instructions.md` to change the summary structure:

```markdown
## Output Format

# Executive Summary - {{parameters.month}}/{{parameters.year}}

## Key Metrics
- [Metric 1]: [Value]
- [Metric 2]: [Value]

## Strategic Initiatives
...
```

### 3. Add Context

Add historical context or static reference material:

```yaml
context:
  guidelines:
    type: static
    name: Project Guidelines
    directory: 'context/guidelines'
    pattern: '*.md'
```

## Tips

1. **Consistent File Naming**: Use consistent naming in your activity files for better organization
2. **Rich Content**: The more detailed your activity files, the better the summary
3. **Regular Cadence**: Run summaries monthly for best results
4. **Review and Edit**: Always review AI-generated summaries before sharing

## Troubleshooting

### "No contributing files found"

- Check that files exist in `activity/YEAR/MONTH/`
- Verify files match the pattern (default: `*.md`)
- Ensure the activity directory path is correct

### Summary is too generic

- Add more detail to your activity files
- Include specific dates, numbers, and outcomes
- Consider adding context from previous months

### Token limit exceeded

- Reduce the number of history months
- Split large activity files into smaller ones
- Use a model with a larger context window

## Next Steps

After creating your job:

1. **Add Activity Files**: Place markdown files in `activity/YEAR/MONTH/`
2. **Test Run**: Use `--dry-run` to preview without saving
3. **Customize**: Adjust persona and instructions to match your needs
4. **Automate**: Set up a cron job or CI/CD workflow for regular summaries

## Related Templates

- **release-notes**: For generating release notes with changelogs
- **team-update**: For internal team communications
- **weekly-summary**: For weekly instead of monthly summaries

## Learn More

- [Configuration Guide](../../../guide/configuration.md)
- [Quick Start Guide](../../../guide/quickstart.md)
- [Jobs Guide](../../../guide/jobs.md)
