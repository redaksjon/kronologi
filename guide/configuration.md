# Configuration Guide

Comprehensive guide to configuring Kronologi for your needs.

## Configuration Hierarchy

Kronologi uses a hierarchical configuration system:

```
1. Command-line arguments (highest priority)
2. Environment variables
3. Job configuration (.kronologi/jobs/<job>/config.yaml)
4. Root configuration (.kronologi/config.yaml)
5. Default values (lowest priority)
```

**Default Model**: If no model is specified anywhere in the configuration hierarchy, Kronologi defaults to `gpt-4o`. You can override this at any level:
- In the root config file (`.kronologi/config.yaml`)
- In the job config file (`.kronologi/jobs/<job>/config.yaml`)
- Via command line (`--model gpt-4o-mini`)

## Directory Structure

```
~/.kronologi/                  # Configuration root (default)
├── context/                   # Job definitions
│   ├── release-notes/
│   │   ├── analysis.yml      # Job configuration
│   │   ├── persona.md        # AI persona
│   │   └── instructions.md   # Task instructions
│   ├── team-update/
│   │   ├── analysis.yml
│   │   ├── persona.md
│   │   └── instructions.md
│   └── monthly-review/
│       ├── analysis.yml
│       ├── persona.md
│       └── instructions.md
├── examples/                  # Template jobs
│   ├── monthly-summary/
│   ├── release-notes/
│   └── team-update/
├── activity/                  # Activity files to analyze
│   ├── 2026-01/
│   │   ├── commits.md
│   │   └── changes.md
│   └── 2025-12/
│       ├── commits.md
│       └── changes.md
└── summary/                   # Generated summaries
    ├── release-notes/
    │   ├── 2026-01/
    │   │   ├── summary.md
    │   │   ├── completion.json
    │   │   └── inputs.json
    │   └── 2025-12/
    │       ├── summary.md
    │       ├── completion.json
    │       └── inputs.json
    └── team-update/
        └── 2026-01/
            ├── summary.md
            ├── completion.json
            └── inputs.json
```

**Environment Variable**:
```bash
export KRONOLOGI_DIR=~/.kronologi  # Override default directory
```

## Job Configuration File

### Basic Structure (Traditional Mode)

```yaml
# ~/.kronologi/context/<job-name>/analysis.yml

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

### With Reasoning Mode (Agentic Workflows)

```yaml
# ~/.kronologi/context/<job-name>/analysis.yml

# AI Model settings (base model, not used in reasoning)
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

# Reasoning mode configuration (NEW)
reasoning:
  enabled: true
  provider: anthropic  # or 'openai' (limited tool support)
  maxIterations: 10    # Max tool use rounds
  tools:
    - read_file        # Read specific files
    - list_files       # Discover available files
    - search_files     # Search file content

# Parameters (passed to prompts)
parameters:
  year:
    type: number
    required: true
  month:
    type: number
    required: true

# Content sections (AI explores these dynamically with tools)
content:
  activity:
    name: Monthly Activity
    directory: 'activity'
    pattern: '**/*.md'

# Output configuration
output:
  report:
    name: Monthly Summary
    format: markdown
    pattern: 'summary.md'
```

**Note**: In reasoning mode:
- AI explores files dynamically using tools
- Content sections define what's available, not what to load
- Better token efficiency (only reads what's needed)
- Requires `ANTHROPIC_API_KEY` environment variable

## Model Settings

### model (required)

The AI model to use for generation.

```yaml
model: gpt-4o  # Default for traditional mode
```

**OpenAI Models**:
- `gpt-4o` - Balanced performance (default)
- `gpt-4o-mini` - Fast and cost-effective
- `gpt-4` - High quality
- `o1` - Advanced reasoning
- `o1-mini` - Reasoning on budget
- `o3-mini` - Latest reasoning model

**Anthropic Models** (reasoning mode only):
- `claude-sonnet-4` - Agentic workflows with tool use
- `claude-opus-4` - Premium reasoning and analysis

**Note**: When reasoning mode is enabled, the provider determines which AI is used, and the model setting is primarily for fallback/compatibility.

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

## Reasoning Mode Configuration (New)

### reasoning (optional)

Enable agentic workflows where AI can explore files dynamically.

```yaml
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files
```

### reasoning.enabled (boolean)

Enable reasoning mode with tool use.

```yaml
reasoning:
  enabled: true  # Enable agentic workflows
```

**Default**: `false` (traditional mode)

**When to enable**:
- Large activity datasets (100+ files)
- Need intelligent content selection
- Want better token efficiency
- Complex pattern identification required

### reasoning.provider (string)

AI provider for reasoning mode.

```yaml
reasoning:
  provider: anthropic  # Recommended
  # provider: openai   # Limited tool support
```

**Options**:
- `anthropic` - Full tool support, recommended (requires `ANTHROPIC_API_KEY`)
- `openai` - Basic tool support (requires `OPENAI_API_KEY`)

**Default**: `anthropic`

### reasoning.maxIterations (number)

Maximum number of tool use rounds.

```yaml
reasoning:
  maxIterations: 10  # Default
```

**Guidelines**:
- Simple tasks: `5` iterations
- Standard reports: `10` iterations
- Complex analysis: `20` iterations

**Default**: `10`

### reasoning.tools (array)

Tools available to AI.

```yaml
reasoning:
  tools:
    - read_file     # Read specific files
    - list_files    # Discover available files
    - search_files  # Search file content
```

**Available Tools**:

1. **read_file**
   - Read specific files from activity, summary, or context
   - AI specifies exact path
   - Returns file content

2. **list_files**
   - Discover available files
   - Supports glob patterns
   - Returns file list with metadata

3. **search_files**
   - Search for text in files
   - Case-insensitive matching
   - Returns matching files and line numbers

**Default**: All three tools enabled

### Reasoning Mode Examples

#### Example 1: Basic Reasoning Mode

```yaml
# Enable with defaults
reasoning:
  enabled: true
  provider: anthropic
```

#### Example 2: Limited Tools

```yaml
# Only allow reading and listing (no search)
reasoning:
  enabled: true
  provider: anthropic
  tools:
    - read_file
    - list_files
```

#### Example 3: Extended Exploration

```yaml
# Allow more iterations for complex analysis
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 20
  tools:
    - read_file
    - list_files
    - search_files
```

#### Example 4: OpenAI Reasoning (Limited)

```yaml
# Use OpenAI with basic tool support
reasoning:
  enabled: true
  provider: openai
  maxIterations: 5
```

### Environment Variables for Reasoning

```bash
# Anthropic (recommended)
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI (alternative)
export OPENAI_API_KEY="sk-..."
```

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

  week:
    type: number
    required: false
    min: 1
    max: 53
    description: "Week number for weekly summaries"

  historyWeeks:
    type: number
    default: 1
    description: "Number of weeks of history to include"

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

**Note**: For weekly summaries, use `week` instead of `month` parameter. Weeks are numbered 1-53 using Sunday-based week numbering.

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

  previous_week_summary:
    type: summary
    name: Previous Week Summary
    from: summary
    weeks: 1                 # How many previous weeks
```

**Behavior**:
- Reads from `summary/` directory
- Automatically calculates previous period dates
- Provides continuity between summaries
- Supports both `months` and `weeks` parameters

### History Context

Referenced from other content sources.

```yaml
context:
  historical_context:
    type: history
    name: Last Quarter Context
    from: activity           # Reference content section
    months: 3

  recent_weeks_context:
    type: history
    name: Recent Weeks Context
    from: activity
    weeks: ${parameters.historyWeeks}  # Dynamic based on parameter
```

**Behavior**:
- References content from another section
- Includes in context (background) instead of content (analysis target)
- Useful for "what led to this" information
- Supports both `months` and `weeks` parameters
- Can use parameter references for dynamic values

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

  weekly_history:
    type: activity
    name: Previous Weeks
    directory: 'notes'
    pattern: '*.md'
    weeks: 2                 # Include last 2 weeks
```

**Behavior**:
- Automatically finds files from previous periods
- Uses date-based directory traversal
- Respects `historyMonths` or `historyWeeks` CLI parameter
- For weekly summaries, uses "Week N" directory structure

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

parameters:
  year:
    type: number
  month:
    type: number

context: {}

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

### Pattern 1b: Simple Weekly Summary

```yaml
model: gpt-4o-mini
temperature: 0.7

parameters:
  year:
    type: number
  week:
    type: number

context: {}

content:
  activity:
    type: activity
    directory: 'notes'
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    pattern: 'summary.md'
```

**Use case**: Basic weekly notes summarization with auto-detection

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
