# Configuration Guide

Comprehensive guide to configuring Kronologi for your needs.

## Configuration Hierarchy

Kronologi uses a hierarchical configuration system:

```
1. Command-line arguments (highest priority)
2. Environment variables
3. Job configuration (.kronologi/jobs/<job>/config.yaml)
4. Default values (lowest priority)
```

## Directory Structure

```
.kronologi/                    # Configuration root
├── jobs/                      # Job definitions
│   ├── release-notes/
│   │   ├── config.yaml       # Job configuration
│   │   ├── persona.md        # AI persona
│   │   └── instructions.md   # Task instructions
│   ├── team-update/
│   │   ├── config.yaml
│   │   ├── persona.md
│   │   └── instructions.md
│   └── monthly-review/
│       ├── config.yaml
│       ├── persona.md
│       └── instructions.md
context/                       # Static context files
├── global/                    # Project-wide context
│   ├── guidelines.md
│   └── style.md
└── projects/                  # Project-specific context
    ├── project-a.md
    └── project-b.md
activity/                      # Activity files to analyze
├── 2026-01/
│   ├── commits.md
│   └── changes.md
└── 2025-12/
    ├── commits.md
    └── changes.md
summary/                       # Generated summaries
├── 2026/
│   └── 01/
│       ├── summary.md
│       ├── completion.json
│       └── inputs.json
└── 2025/
    └── 12/
        ├── summary.md
        ├── completion.json
        └── inputs.json
```

## Job Configuration File

### Basic Structure

```yaml
# .kronologi/jobs/<job-name>/config.yaml

# AI Model settings
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

# Parameters (passed to prompts)
parameters:
  year:
    type: number
    required: true
  month:
    type: number
    required: true
  project:
    type: string
    default: "Main Project"

# Context sections (background information)
context:
  guidelines:
    type: static
    name: Project Guidelines
    directory: global

  previous_summary:
    type: summary
    name: Previous Month
    from: summary
    months: 1

# Content sections (material to analyze)
content:
  activity:
    type: activity
    name: Monthly Activity
    directory: ''
    pattern: '*.md'

  history:
    type: activity
    name: Historical Activity
    directory: ''
    pattern: '*.md'
    months: 2

# Output configuration
output:
  summary:
    type: summary
    format: markdown
    name: Monthly Summary
    pattern: 'summary.md'

  metadata:
    type: metadata
    format: json
    pattern: 'completion.json'
```

## Model Settings

### model (required)

The OpenAI model to use for generation.

```yaml
model: gpt-4o  # Default
```

**Supported models**:
- `gpt-4o` - Balanced performance (default)
- `gpt-4o-mini` - Fast and cost-effective
- `gpt-4` - High quality
- `o1` - Advanced reasoning
- `o1-mini` - Reasoning on budget
- `o3-mini` - Latest reasoning model

See [Models Guide](./models.md) for detailed comparison.

### temperature (optional)

Controls randomness in output (0.0 to 2.0).

```yaml
temperature: 0.7  # Default
```

- **0.0**: Deterministic, focused
- **0.7**: Balanced creativity
- **1.0**: More creative
- **2.0**: Very creative (rarely useful)

**Recommendations**:
- Release notes: `0.3` (factual)
- Creative writing: `0.9` (varied)
- Technical docs: `0.5` (clear)

### maxCompletionTokens (optional)

Maximum tokens in generated output.

```yaml
maxCompletionTokens: 4000  # Default
```

**Guidelines**:
- Short summaries: `1000`
- Standard reports: `4000`
- Detailed analysis: `8000`
- Long documents: `16000`

Note: Higher limits cost more and may take longer.

## Parameters

Parameters are dynamic values passed through the system.

### Parameter Definition

```yaml
parameters:
  year:
    type: number
    required: true
    description: "Year for summary"

  month:
    type: number
    required: true
    min: 1
    max: 12

  project:
    type: string
    default: "Main Project"

  team:
    type: string
    required: false

  include_stats:
    type: boolean
    default: true
```

### Parameter Types

**number**:
```yaml
year:
  type: number
  required: true
  min: 1900
  max: 2100
```

**string**:
```yaml
project:
  type: string
  default: "Main Project"
  pattern: "^[A-Z][a-zA-Z0-9-]+$"  # Optional regex
```

**boolean**:
```yaml
include_metrics:
  type: boolean
  default: true
```

**array**:
```yaml
tags:
  type: array
  items: string
  default: []
```

### Parameter Usage in Prompts

Reference parameters using `{{parameters.name}}`:

```markdown
# Monthly Summary for {{parameters.month}}/{{parameters.year}}

Project: {{parameters.project}}
Team: {{parameters.team}}

{{#parameters.include_stats}}
## Statistics
[Stats will be included]
{{/parameters.include_stats}}
```

### Command-Line Parameters

Pass custom parameters via CLI:

```bash
kronologi release-notes 2026 1 \
  --param project="Project X" \
  --param team="Engineering"
```

## Context Configuration

Context provides background information for AI.

### Static Context

Fixed reference material that doesn't change.

```yaml
context:
  guidelines:
    type: static
    name: Project Guidelines
    directory: global        # Relative to context/
    pattern: '*.md'          # Optional glob pattern
```

**Directory structure**:
```
context/
└── global/
    ├── guidelines.md
    ├── style.md
    └── glossary.md
```

**Usage**: Project guidelines, style guides, terminology

### Summary Context

Previous summaries for continuity.

```yaml
context:
  previous_summary:
    type: summary
    name: Previous Month Summary
    from: summary            # Reference output section
    months: 1                # How many previous months
```

**Behavior**:
- Reads from `summary/` directory
- Automatically calculates previous month dates
- Provides continuity between summaries

### History Context

Referenced from other content sources.

```yaml
context:
  historical_context:
    type: history
    name: Last Quarter Context
    from: activity           # Reference content section
    months: 3
```

**Behavior**:
- References content from another section
- Includes in context (background) instead of content (analysis target)
- Useful for "what led to this" information

## Content Configuration

Content is the primary material for AI to analyze.

### Activity Content

Files from the current period.

```yaml
content:
  activity:
    type: activity
    name: Monthly Activity
    directory: ''            # Relative to activity/
    pattern: '*.md'
```

**Directory structure**:
```
activity/
├── commits.md
├── changes.md
└── notes.md
```

**Usage**: Current month's changes, commits, notes

### History Content

Files from previous periods.

```yaml
content:
  history:
    type: activity
    name: Previous Months
    directory: ''
    pattern: '**/*.md'
    months: 3                # Include last 3 months
```

**Behavior**:
- Automatically finds files from previous months
- Uses date-based directory traversal
- Respects `historyMonths` CLI parameter

### Summary Content

Previous summaries as content.

```yaml
content:
  previous_summaries:
    type: summary
    name: Past Summaries
    from: summary
    months: 2
```

**Usage**: Include previous summaries as analysis input

### Custom Directory Structure

Support non-standard layouts:

```yaml
content:
  project_a:
    type: activity
    name: Project A Activity
    directory: 'projects/a'
    pattern: '*.md'

  project_b:
    type: activity
    name: Project B Activity
    directory: 'projects/b'
    pattern: '*.md'
```

**Directory structure**:
```
activity/
└── projects/
    ├── a/
    │   └── changes.md
    └── b/
        └── changes.md
```

## Output Configuration

Configure what files are generated.

### Summary Output

Main AI-generated content.

```yaml
output:
  summary:
    type: summary
    format: markdown
    name: Monthly Summary
    pattern: 'summary.md'
```

**Supported formats**:
- `markdown` - Markdown files (default)
- `json` - JSON output
- `text` - Plain text

### Metadata Output

API completion metadata.

```yaml
output:
  metadata:
    type: metadata
    format: json
    pattern: 'completion.json'
```

**Contents**:
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

### Custom Output Names

Use parameters in filenames:

```yaml
output:
  summary:
    type: summary
    format: markdown
    pattern: '{{parameters.project}}-{{parameters.month}}.md'
```

Result: `ProjectX-01.md`

### Multiple Outputs

Generate multiple files from one run:

```yaml
output:
  full_report:
    type: summary
    format: markdown
    pattern: 'report-full.md'

  executive_summary:
    type: summary
    format: markdown
    pattern: 'report-exec.md'

  data:
    type: metadata
    format: json
    pattern: 'metadata.json'
```

Note: All outputs receive the same AI response; use different instructions per output to generate different content.

## Environment Variables

Override configuration via environment variables.

### Required

```bash
export OPENAI_API_KEY="sk-..."  # Required for OpenAI API
```

### Optional

```bash
# Override config directory
export KRONOLOGI_CONFIG_DIR="/path/to/config"

# Override default timezone
export KRONOLOGI_TIMEZONE="America/New_York"

# Override default model
export KRONOLOGI_MODEL="gpt-4o-mini"

# Logging
export KRONOLOGI_LOG_LEVEL="debug"  # error, info, verbose, debug
```

## Command-Line Options

Override any configuration from the command line.

### Directory Options

```bash
--config-dir <dir>          # Configuration directory (default: .kronologi)
--context-directory <dir>   # Static context files (default: context)
--activity-directory <dir>  # Activity files (default: activity)
--summary-directory <dir>   # Output summaries (default: summary)
```

### Model Options

```bash
--model <model>             # OpenAI model (default: gpt-4o)
--temperature <num>         # Temperature 0.0-2.0
--max-tokens <num>          # Max completion tokens
```

### Behavior Options

```bash
--dry-run                   # Show what would happen without API calls
--replace                   # Overwrite existing files
--verbose                   # Verbose logging
--debug                     # Debug logging
```

### Time Options

```bash
--timezone <tz>             # Timezone for date calculations (default: UTC)
```

### Parameter Options

```bash
--param <key>=<value>       # Custom parameter
--param project="Project X" \
--param team="Engineering"
```

## Complete Example

### Real-World Configuration

```yaml
# .kronologi/jobs/release-notes/config.yaml

# Model settings
model: gpt-4o
temperature: 0.3  # Factual output
maxCompletionTokens: 6000

# Parameters
parameters:
  year:
    type: number
    required: true
  month:
    type: number
    required: true
  version:
    type: string
    required: false
  project:
    type: string
    default: "Main Project"

# Context: Background information
context:
  # Project guidelines
  guidelines:
    type: static
    name: Release Notes Guidelines
    directory: global
    pattern: 'guidelines.md'

  # Previous release notes
  previous_release:
    type: summary
    name: Previous Release Notes
    from: release_notes
    months: 1

  # Historical context (3 months)
  historical:
    type: history
    name: Recent History
    from: commits
    months: 3

# Content: Material to analyze
content:
  # Current month commits
  commits:
    type: activity
    name: Git Commits
    directory: 'git'
    pattern: 'commits-*.md'

  # Current month changes
  changes:
    type: activity
    name: Changelog Entries
    directory: 'changes'
    pattern: '*.md'

  # Bug fixes
  bug_fixes:
    type: activity
    name: Bug Fixes
    directory: 'bugs'
    pattern: 'fixed-*.md'

# Output: What to generate
output:
  # Main release notes
  release_notes:
    type: summary
    format: markdown
    name: Release Notes
    pattern: 'RELEASE-NOTES.md'

  # Executive summary
  exec_summary:
    type: summary
    format: markdown
    name: Executive Summary
    pattern: 'EXEC-SUMMARY.md'

  # Metadata
  metadata:
    type: metadata
    format: json
    pattern: 'completion.json'
```

### Directory Structure

```
project/
├── .kronologi/
│   └── jobs/
│       └── release-notes/
│           ├── config.yaml
│           ├── persona.md
│           └── instructions.md
├── context/
│   └── global/
│       └── guidelines.md
├── activity/
│   ├── git/
│   │   ├── commits-2026-01.md
│   │   └── commits-2025-12.md
│   ├── changes/
│   │   ├── feature-x.md
│   │   └── feature-y.md
│   └── bugs/
│       ├── fixed-123.md
│       └── fixed-456.md
└── summary/
    ├── 2026/
    │   └── 01/
    │       ├── RELEASE-NOTES.md
    │       ├── EXEC-SUMMARY.md
    │       ├── completion.json
    │       └── inputs.json
    └── 2025/
        └── 12/
            └── RELEASE-NOTES.md
```

### Running

```bash
# Generate release notes for January 2026
kronologi release-notes 2026 1

# With version parameter
kronologi release-notes 2026 1 \
  --param version="2.5.0"

# Include more history
kronologi release-notes 2026 1 3 2

# Dry run to test
kronologi release-notes 2026 1 --dry-run

# Verbose output
kronologi release-notes 2026 1 --verbose
```

## Configuration Patterns

### Pattern 1: Simple Monthly Summary

```yaml
model: gpt-4o-mini
temperature: 0.7

content:
  activity:
    type: activity
    directory: ''
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    pattern: 'summary.md'
```

**Use case**: Basic monthly notes summarization

### Pattern 2: Release Notes with History

```yaml
model: gpt-4o
temperature: 0.3

context:
  previous_release:
    type: summary
    from: summary
    months: 1

content:
  current_changes:
    type: activity
    pattern: '*.md'

  historical_changes:
    type: activity
    pattern: '*.md'
    months: 3

output:
  release_notes:
    type: summary
    format: markdown
    pattern: 'RELEASE.md'
```

**Use case**: Release notes with continuity

### Pattern 3: Multi-Project Summary

```yaml
model: gpt-4o

content:
  project_a:
    type: activity
    directory: 'projects/a'
    pattern: '**/*.md'

  project_b:
    type: activity
    directory: 'projects/b'
    pattern: '**/*.md'

  project_c:
    type: activity
    directory: 'projects/c'
    pattern: '**/*.md'

output:
  combined:
    type: summary
    format: markdown
    pattern: 'all-projects.md'
```

**Use case**: Aggregate summaries across projects

### Pattern 4: Custom Parameters

```yaml
model: gpt-4o

parameters:
  team:
    type: string
    required: true
  sprint:
    type: number
    required: true
  include_metrics:
    type: boolean
    default: true

content:
  activity:
    type: activity
    directory: '{{parameters.team}}'
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    pattern: '{{parameters.team}}-sprint-{{parameters.sprint}}.md'
```

**Use case**: Team-specific sprint summaries

## Validation

Kronologi validates configuration using Zod schemas.

### Common Errors

**Missing required field**:
```
Configuration validation failed:
  - model: Required
```

**Invalid type**:
```
Configuration validation failed:
  - temperature: Expected number, received string
```

**Invalid value**:
```
Configuration validation failed:
  - temperature: Number must be less than or equal to 2
```

### Validation Tips

1. **Use --dry-run**: Test configuration without API calls
2. **Check syntax**: Use YAML validator (yamllint)
3. **Start simple**: Begin with minimal config
4. **Add incrementally**: Test after each addition

## Best Practices

### 1. Organize by Purpose

Separate jobs by purpose:
- `release-notes/` - External release notes
- `team-update/` - Internal team updates
- `sprint-review/` - Sprint retrospectives

### 2. Reuse Context

Share context across jobs:
```yaml
context:
  shared_guidelines:
    type: static
    directory: global
```

### 3. Use Sensible Defaults

Provide defaults for optional parameters:
```yaml
parameters:
  include_stats:
    type: boolean
    default: true
```

### 4. Monitor Token Usage

Check `completion.json` to optimize:
```json
{
  "usage": {
    "prompt_tokens": 5234,  # Input cost
    "completion_tokens": 1567,  # Output cost
    "total_tokens": 6801
  }
}
```

High token usage? Reduce `historyMonths` or use smaller model.

### 5. Version Control Configuration

Track configuration changes:
```bash
git add .kronologi/
git commit -m "Update release notes configuration"
```

### 6. Document Custom Parameters

Add descriptions to parameters:
```yaml
parameters:
  team:
    type: string
    description: "Team name for sprint summary"
    required: true
```

## Next Steps

- [Jobs](./jobs.md) - Deep dive into job configuration
- [Prompts](./prompts.md) - Learn prompt engineering
- [Models](./models.md) - Choose the right model
- [Development](./development.md) - Contribute to Kronologi
