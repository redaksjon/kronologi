# Release Notes Template

A professional template for generating release notes with historical context and comprehensive changelog formatting.

## What This Template Does

This template generates polished release notes by analyzing your activity files and previous releases. It's designed for:

- Software releases
- Product updates
- Version announcements
- Changelog generation

## How It Works

### Input Structure

The template expects activity files organized by year and month, plus access to previous release notes for context:

```
activity/
  2026/
    1/
      commits.md
      changes.md
      features.md

summary/
  release-notes/
    2025/
      12/
        summary.md    # Previous release for context
```

### Output Structure

Generates professional release notes:

```
summary/
  release-notes/
    2026/
      1/
        summary.md          # The formatted release notes
        completion.json     # API usage statistics
        inputs.json         # Complete input data
```

## Configuration

### Model Settings

```yaml
model: gpt-4o              # More sophisticated for professional output
temperature: 0.7
maxCompletionTokens: 4000
```

**Why gpt-4o?** Release notes benefit from the more sophisticated reasoning and formatting capabilities of the full GPT-4o model.

### Parameters

- `year`: Release year (e.g., 2026)
- `month`: Release month (1-12)
- `project`: Project name (default: "Main Project")

### Context Sources

```yaml
context:
  previous_summary:
    type: history
    name: Previous Month
    from: summary
    months: 1
```

This includes the previous release notes to maintain consistency and avoid repetition.

### Content Sources

```yaml
content:
  activity:
    type: activity
    directory: ''
    pattern: '*.md'
  
  history:
    type: activity
    directory: ''
    pattern: '*.md'
    months: 2
```

Includes both current month's activity and 2 months of history for comprehensive context.

## Usage

### Basic Usage

```bash
# Generate release notes for January 2026
kronologi release-notes 2026 1
```

### With Custom Project Name

First, update the config to make project a required parameter or pass it via command line (if supported by your setup).

### Dry Run

Test the output:
```bash
kronologi release-notes 2026 1 --dry-run
```

### Different Model

Use a faster model for drafts:
```bash
kronologi release-notes 2026 1 --model gpt-4o-mini
```

## Customization

### 1. Adjust the Persona

Edit `persona.md` to match your brand voice:

```markdown
You are a technical writer for [Company Name] creating release notes.

## Your Role
- Maintain our brand voice and tone
- Focus on user benefits, not just features
- Use clear, jargon-free language
- Highlight breaking changes prominently
```

### 2. Modify the Output Format

Edit `instructions.md` to match your release note style:

```markdown
## Output Format

# Release Notes - v{{parameters.version}}

## 🎉 New Features
- **Feature Name**: Description focusing on user benefit

## 🐛 Bug Fixes
- Fixed: [Issue description]

## ⚠️ Breaking Changes
- [Change]: Migration guide

## 📝 Other Changes
- [Minor updates]
```

### 3. Add Version Parameter

Update config.yaml to include version:

```yaml
parameters:
  year:
    type: number
    description: Year for the release
  month:
    type: number
    description: Month for the release (1-12)
  version:
    type: string
    description: Version number (e.g., "2.1.0")
```

### 4. Include Static Guidelines

Add company-specific guidelines:

```yaml
context:
  guidelines:
    type: static
    name: Release Note Guidelines
    directory: 'context/release-guidelines'
    pattern: '*.md'
  
  previous_summary:
    type: history
    name: Previous Release
    from: summary
    months: 1
```

## Tips

1. **Structured Input**: Organize activity files by type (features.md, bugs.md, breaking-changes.md)
2. **Commit Messages**: Include well-formatted commit messages in your activity files
3. **User Focus**: Emphasize user benefits over technical implementation
4. **Breaking Changes**: Always highlight breaking changes prominently
5. **Migration Guides**: Include upgrade instructions for breaking changes

## Example Activity File Structure

### features.md
```markdown
# New Features - January 2026

## User Authentication
- Added OAuth2 support for Google and GitHub
- Implemented two-factor authentication
- Added password strength requirements

## Dashboard Improvements
- New analytics widget
- Customizable layout
- Dark mode support
```

### bugs.md
```markdown
# Bug Fixes - January 2026

## Critical
- Fixed data loss issue in export function (#234)
- Resolved memory leak in background sync (#245)

## Minor
- Fixed typo in error message (#256)
- Corrected date formatting in reports (#267)
```

## Troubleshooting

### Release notes are too technical

- Adjust the persona to emphasize user benefits
- Provide examples of user-friendly language in instructions
- Include sample release notes in context

### Missing important changes

- Ensure all activity files are in the correct directory
- Check that file patterns match your naming convention
- Verify the history months setting captures all relevant changes

### Inconsistent formatting

- Provide clear formatting examples in instructions.md
- Include previous release notes for consistency
- Consider adding a style guide to context

## Automation

### Release Pipeline Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/release.yml
- name: Generate Release Notes
  run: |
    kronologi release-notes $(date +%Y) $(date +%-m) --replace
    
- name: Create GitHub Release
  uses: actions/create-release@v1
  with:
    body_path: summary/$(date +%Y)/$(date +%-m)/summary.md
```

### Pre-Release Script

```bash
#!/bin/bash
# scripts/prepare-release.sh

YEAR=$(date +%Y)
MONTH=$(date +%-m)

echo "Generating release notes for $YEAR-$MONTH..."
kronologi release-notes $YEAR $MONTH --replace

echo "Release notes generated at: summary/$YEAR/$MONTH/summary.md"
echo "Please review and edit before publishing."
```

## Next Steps

After creating your job:

1. **Organize Activity**: Structure your activity files by change type
2. **Test Generation**: Run with --dry-run to preview
3. **Customize Format**: Adjust to match your release note style
4. **Add to Workflow**: Integrate into your release process
5. **Review Process**: Establish a review workflow before publishing

## Related Templates

- **monthly-summary**: For general monthly summaries
- **team-update**: For internal team communications
- **weekly-summary**: For weekly progress tracking

## Learn More

- [Configuration Guide](../../../guide/configuration.md)
- [Jobs Guide](../../../guide/jobs.md)
- [Prompts Guide](../../../guide/prompts.md)
