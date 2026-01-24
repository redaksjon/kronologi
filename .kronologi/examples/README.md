# Kronologi Example Jobs

This directory contains example job configurations that demonstrate different use cases and features of Kronologi.

## Available Examples

### 1. Monthly Summary (Basic)
**Path**: `monthly-summary/`

A minimal configuration demonstrating the basics of Kronologi:
- Simple parameter usage
- Single content source
- Basic output configuration

**Use Case**: Creating straightforward monthly summaries from activity files.

**To use**:
```bash
# Copy to your jobs directory
cp -r .kronologi/examples/monthly-summary .kronologi/jobs/my-summary

# Run it
kronologi my-summary 2026 1
```

### 2. Release Notes (Advanced)
**Path**: `release-notes/`

An advanced configuration showing:
- Static context (guidelines)
- Historical context (previous releases)
- Multiple content sources (commits, changes, fixes)
- Optional parameters
- Lower temperature for factual output

**Use Case**: Generating professional release notes with continuity and context.

**To use**:
```bash
# Copy to your jobs directory
cp -r .kronologi/examples/release-notes .kronologi/jobs/release-notes

# Create required directory structure
mkdir -p context/global activity/git activity/changes activity/fixes

# Run it
kronologi release-notes 2026 1 --param version="2.0.0"
```

### 3. Team Update (Parameter Usage)
**Path**: `team-update/`

Demonstrates dynamic configuration with parameters:
- Required custom parameters (team name)
- Optional boolean parameters (include_metrics)
- Using parameters in directory paths
- Using parameters in output filenames
- Conditional content in instructions

**Use Case**: Creating team-specific updates with dynamic content.

**To use**:
```bash
# Copy to your jobs directory
cp -r .kronologi/examples/team-update .kronologi/jobs/team-update

# Create team directory structure
mkdir -p activity/teams/engineering activity/teams/design

# Run it
kronologi team-update 2026 1 --param team="engineering"
```

## Learning Path

We recommend exploring the examples in this order:

1. **Start with `monthly-summary`** to understand the basics
2. **Move to `release-notes`** to see context and multiple content sources
3. **Explore `team-update`** to learn parameter usage and dynamic configuration

## Common Patterns

### Directory Structure
All examples expect this base structure:
```
project/
├── .kronologi/
│   └── jobs/
│       └── <job-name>/
│           ├── config.yaml
│           ├── persona.md
│           └── instructions.md
├── context/          # Static context files
├── activity/         # Activity files to analyze
└── summary/          # Generated summaries
```

### Configuration Elements

**Minimal Required**:
```yaml
model: gpt-4o
content:
  activity:
    type: activity
output:
  summary:
    type: summary
    format: markdown
```

**With Sensible Defaults**, you can omit:
- `temperature` (defaults to 0.7)
- `maxCompletionTokens` (defaults to 4000)
- `content[].name` (generated from key)
- `content[].directory` (defaults to '')
- `content[].pattern` (defaults to '**/*.md')

## Parameter Usage

Parameters are powerful for creating reusable, dynamic configurations:

### In config.yaml
```yaml
content:
  team_files:
    directory: 'teams/{{parameters.team}}'
output:
  summary:
    pattern: '{{parameters.team}}-{{parameters.month}}.md'
```

### In persona.md or instructions.md
```markdown
You are creating a report for {{parameters.team}}.

{{#parameters.include_metrics}}
Include detailed metrics.
{{/parameters.include_metrics}}
```

### Passing Parameters
```bash
kronologi job-name 2026 1 \
  --param team="engineering" \
  --param include_metrics=true
```

## Customizing Examples

To customize an example for your needs:

1. **Copy the example**:
   ```bash
   cp -r .kronologi/examples/monthly-summary .kronologi/jobs/my-job
   ```

2. **Edit config.yaml**:
   - Adjust model and temperature
   - Add/remove content sources
   - Define custom parameters

3. **Edit persona.md**:
   - Customize the AI's role and expertise
   - Adjust tone and style
   - Define target audience

4. **Edit instructions.md**:
   - Modify output format
   - Add/remove sections
   - Update guidelines

5. **Test your configuration**:
   ```bash
   kronologi-validate my-job
   kronologi my-job 2026 1 --dry-run
   ```

## Validation

Before using a job, validate it:

```bash
kronologi-validate <job-name>
```

This checks:
- Required files exist
- Configuration is valid
- Parameters are properly defined
- Parameter references resolve correctly

## Getting Help

- **Documentation**: See `guide/` directory for comprehensive guides
- **Configuration Reference**: `guide/configuration.md`
- **Jobs Guide**: `guide/jobs.md`
- **Validation**: Run `kronologi-validate <job-name>` for detailed feedback

## Contributing Examples

If you create a useful job configuration, consider contributing it as an example! Examples should:
- Demonstrate a common use case
- Include clear documentation
- Use best practices
- Be well-tested

Open an issue or PR to discuss adding your example.
