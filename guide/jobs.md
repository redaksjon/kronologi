# Jobs Configuration Guide

Understanding and configuring Kronologi jobs for different use cases.

## What is a Job?

A **job** is a complete configuration for a specific type of summary or analysis. Each job has:

1. **Configuration** (`analysis.yml`) - Model settings, parameters, data sources, outputs, reasoning mode
2. **Persona** (`persona.md`) - AI personality and expertise definition
3. **Instructions** (`instructions.md`) - Task-specific instructions and output format

Jobs are stored in `~/.kronologi/context/<job-name>/` and invoked by name:

```bash
# New format (recommended)
kronologi --job <job-name> --year <year> --month <month>

# Legacy format (still supported)
kronologi <job-name> <year> <month>
```

## Job Structure

```
~/.kronologi/context/release-notes/
├── analysis.yml       # Job configuration (NEW)
├── persona.md         # AI persona definition
└── instructions.md    # Task instructions
```

### analysis.yml

Defines behavior and data sources:

```yaml
# Basic configuration
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

# Optional: Reasoning mode (NEW)
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files

# Parameters
parameters:
  year: { type: number, required: true }
  month: { type: number, required: true }

# Context sections
context:
  guidelines:
    type: static
    name: Guidelines
    directory: global

# Content sections
content:
  activity:
    type: activity
    name: Activity
    pattern: '*.md'

# Output configuration
output:
  summary:
    type: summary
    format: markdown
    pattern: 'summary.md'
```

See [Configuration Guide](./configuration.md) for complete reference.

### persona.md

Defines AI's role and expertise:

```markdown
You are an expert technical writer with 10 years of experience creating release notes for developer tools.

## Expertise
- Clear, concise technical communication
- Understanding of software development lifecycle
- Ability to explain complex changes to diverse audiences

## Style
- Professional and technical
- Fact-based and specific
- User-focused language

## Audience
- Developers using our tools
- Technical managers
- DevOps engineers
```

### instructions.md

Task-specific instructions and format:

```markdown
Generate comprehensive release notes for month {{parameters.month}} of {{parameters.year}}.

## Output Format

# Release Notes - {{parameters.month}}/{{parameters.year}}

## Highlights
List 3-5 key achievements or features

## New Features
Detailed description of new capabilities

## Improvements
Enhancements to existing features

## Bug Fixes
Important bugs that were fixed

## Breaking Changes
Changes that require user action

## Guidelines
- Be specific with version numbers
- Include examples where helpful
- Link to documentation when relevant
- Quantify improvements with metrics
```

## Creating a New Job

### Method 1: Using kronologi-init (Recommended)

The easiest way to create a new job is using the interactive command:

```bash
# Interactive mode
kronologi-init

# From template
kronologi-init --template monthly-summary my-job

# List available templates
kronologi-init --list-templates
```

**Available Templates:**
- `monthly-summary` - Basic monthly reports
- `release-notes` - Software release notes
- `team-update` - Team status updates

This automatically creates:
- `~/.kronologi/context/my-job/analysis.yml`
- `~/.kronologi/context/my-job/persona.md`
- `~/.kronologi/context/my-job/instructions.md`

### Method 2: Manual Creation

If you prefer manual setup:

#### Step 1: Create Directory Structure

```bash
mkdir -p ~/.kronologi/context/my-job
cd ~/.kronologi/context/my-job
```

#### Step 2: Create analysis.yml

```yaml
# analysis.yml
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

parameters:
  year: { type: number, required: true }
  month: { type: number, required: true }

content:
  activity:
    name: Monthly Activity
    directory: 'activity'
    pattern: '*.md'

output:
  report:
    name: Monthly Summary
    format: markdown
    pattern: 'summary.md'
```

#### Step 3: Create persona.md

```markdown
You are an expert in [domain].

Your role is to [describe role].

Write in a [style description] style.
```

#### Step 4: Create instructions.md

```markdown
[Describe the task]

## Output Format

[Define the expected output structure]

## Requirements

[List specific requirements]
```

#### Step 5: Validate Configuration

```bash
kronologi-validate my-job
```

This checks for:
- Missing required files
- Invalid parameter references
- Configuration errors

#### Step 6: Test the Job

```bash
# New format
kronologi --job my-job --year 2026 --month 1 --dry-run --verbose

# Legacy format
kronologi my-job 2026 1 --dry-run --verbose
```

## Common Job Types

### 1. Release Notes

**Purpose**: External-facing release documentation

**Create:**
```bash
kronologi-init --template release-notes release-notes
```

**Configuration:**
```yaml
# ~/.kronologi/context/release-notes/analysis.yml
model: gpt-4o
temperature: 0.3  # Factual

context:
  previous_release:
    type: summary
    from: summary
    months: 1

content:
  commits:
    type: activity
    directory: 'git'
    pattern: '*.md'

  changelog:
    type: activity
    directory: 'changes'
    pattern: '*.md'
```

**persona.md**:
```markdown
You are an expert technical writer creating release notes for a developer audience.
Focus on user-facing changes and their impact.
```

**instructions.md**:
```markdown
Create release notes with:
- Highlights (3-5 key changes)
- New features
- Improvements
- Bug fixes
- Breaking changes
```

### 2. Team Updates

**Purpose**: Internal team communication

**Create:**
```bash
kronologi-init --template team-update team-updates
```

**Configuration:**
```yaml
# ~/.kronologi/context/team-updates/analysis.yml
model: gpt-4o-mini
temperature: 0.7

parameters:
  team: { type: string, required: true }

content:
  activity:
    name: Team Activity
    directory: 'teams/{{parameters.team}}'
    pattern: '*.md'
```

**persona.md**:
```markdown
You are a team lead creating an update for internal stakeholders.
Be conversational but informative.
```

**instructions.md**:
```markdown
Create a team update covering:
- Accomplishments
- Challenges
- Next month's focus
- Team morale and insights
```

### 3. Sprint Review

**Purpose**: Agile sprint retrospective

**Create:**
```bash
kronologi-init sprint-review
```

**Configuration:**
```yaml
# ~/.kronologi/context/sprint-review/analysis.yml
model: gpt-4o

parameters:
  sprint: { type: number, required: true }
  team: { type: string, required: true }

content:
  tasks:
    name: Sprint Tasks
    directory: 'sprints/{{parameters.sprint}}'
    pattern: 'tasks-*.md'

  retrospective:
    name: Retrospective Notes
    directory: 'sprints/{{parameters.sprint}}'
    pattern: 'retro.md'
```

**persona.md**:
```markdown
You are an agile coach facilitating a sprint review.
Focus on learning and continuous improvement.
```

**instructions.md**:
```markdown
Create a sprint review with:
- Sprint goals (met/unmet)
- Completed work
- Velocity and metrics
- What went well
- What could be improved
- Action items for next sprint
```

### 4. Monthly Review (Personal)

**Purpose**: Personal monthly reflection

**Create:**
```bash
kronologi-init personal-review
```

**Configuration:**
```yaml
# ~/.kronologi/context/personal-review/analysis.yml
model: gpt-4o
temperature: 0.8  # More reflective

context:
  previous_review:
    type: summary
    from: summary
    months: 1

content:
  notes:
    name: Personal Notes
    directory: 'personal'
    pattern: '*.md'
```

**persona.md**:
```markdown
You are a thoughtful coach helping someone reflect on their month.
Be encouraging and constructive.
```

**instructions.md**:
```markdown
Create a personal monthly review:
- Key achievements
- Challenges faced
- Lessons learned
- Goals for next month
- Areas for growth
```

### 5. Project Documentation

**Purpose**: Generate project documentation from changes

**Create:**
```bash
kronologi-init project-docs
```

**Configuration:**
```yaml
# ~/.kronologi/context/project-docs/analysis.yml
model: gpt-4o
temperature: 0.5

context:
  existing_docs:
    type: static
    directory: 'docs'
    pattern: '*.md'

content:
  changes:
    name: Project Changes
    directory: 'changes'
    pattern: '*.md'
```

**persona.md**:
```markdown
You are a technical documentation specialist.
Create clear, comprehensive documentation for developers.
```

**instructions.md**:
```markdown
Update project documentation based on changes:
- API changes
- New features
- Configuration updates
- Usage examples
- Migration guides
```

### 6. Large Dataset Analysis (with Reasoning Mode)

**Purpose**: Analyze large activity datasets efficiently

**Create:**
```bash
kronologi-init large-analysis
```

**Configuration:**
```yaml
# ~/.kronologi/context/large-analysis/analysis.yml
model: gpt-4o

# Enable reasoning mode for better token efficiency
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 15
  tools:
    - read_file
    - list_files
    - search_files

parameters:
  year: { type: number, required: true }
  month: { type: number, required: true }

content:
  activity:
    name: All Activity
    directory: 'activity'
    pattern: '**/*.md'  # Hundreds of files

output:
  report:
    name: Analysis Summary
    format: markdown
    pattern: 'summary.md'
```

**Why Reasoning Mode:**
- AI explores files dynamically instead of loading all upfront
- Searches for specific patterns and themes
- Better token efficiency with large datasets
- More intelligent content selection

**persona.md**:
```markdown
You are a data analyst specializing in extracting insights from large datasets.
Use the available tools to explore and understand the activity files efficiently.
```

**instructions.md**:
```markdown
Analyze the activity files to create a comprehensive summary.

Use the tools available to you:
1. First list_files to see what's available
2. Then search_files to find relevant themes
3. Read specific files that contain important information

Create a summary covering:
- Key trends and patterns
- Notable events
- Statistical insights
- Recommendations
```

## Advanced Job Patterns

### Multi-Source Aggregation

Combine multiple data sources:

```yaml
content:
  # Git commits
  commits:
    name: Git Activity
    directory: 'git'
    pattern: '*.md'

  # Code reviews
  reviews:
    name: Code Reviews
    directory: 'reviews'
    pattern: '*.md'

  # Issue tracker
  issues:
    name: Issue Tracker
    directory: 'issues'
    pattern: '*.md'

  # Team notes
  notes:
    name: Team Notes
    directory: 'notes'
    pattern: '*.md'
```

### Multi-Project Analysis

Analyze multiple projects together:

```yaml
parameters:
  projects:
    type: array
    items: string
    default: ["project-a", "project-b", "project-c"]

content:
  project_a:
    name: Project A Activity
    directory: 'projects/a'
    pattern: '**/*.md'

  project_b:
    name: Project B Activity
    directory: 'projects/b'
    pattern: '**/*.md'

  project_c:
    name: Project C Activity
    directory: 'projects/c'
    pattern: '**/*.md'
```

### Conditional Content

Use parameters to control content inclusion:

```yaml
parameters:
  include_metrics:
    type: boolean
    default: true

  include_history:
    type: boolean
    default: false

content:
  current:
    name: Current Activity
    directory: 'activity'
    pattern: '*.md'

  # Conditionally included via instructions
  historical:
    name: Historical Activity
    directory: 'activity'
    pattern: '*.md'
    months: 3
```

In `instructions.md`:
```markdown
{{#parameters.include_metrics}}
Include metrics section with:
- Performance data
- Usage statistics
{{/parameters.include_metrics}}

{{#parameters.include_history}}
Provide historical context from previous months.
{{/parameters.include_history}}
```

### Multi-Format Output

Generate multiple formats:

```yaml
output:
  # Full report
  full_report:
    type: summary
    format: markdown
    pattern: 'report-full.md'

  # Executive summary
  executive:
    type: summary
    format: markdown
    pattern: 'report-exec.md'

  # Bullet points
  bullets:
    type: summary
    format: text
    pattern: 'report-bullets.txt'

  # Data
  metadata:
    type: metadata
    format: json
    pattern: 'metadata.json'
```

## Job Parameters

### Built-in Parameters

Always available:

```yaml
parameters:
  year:
    type: number
    required: true
  month:
    type: number
    required: true
```

### Custom Parameters

Define your own:

```yaml
parameters:
  project:
    type: string
    required: true
    description: "Project name"

  version:
    type: string
    required: false
    pattern: "^\\d+\\.\\d+\\.\\d+$"
    description: "Semantic version (e.g., 1.2.3)"

  team:
    type: string
    default: "Engineering"

  include_stats:
    type: boolean
    default: true
```

### Passing Parameters

Via command line:

```bash
# New format
kronologi --job release-notes --year 2026 --month 1 \
  --param project="MyProject" \
  --param version="2.5.0" \
  --param team="Backend"

# Legacy format
kronologi release-notes 2026 1 \
  --param project="MyProject" \
  --param version="2.5.0" \
  --param team="Backend"
```

### Using Parameters

In analysis.yml:
```yaml
content:
  activity:
    name: Project Activity
    directory: '{{parameters.project}}'

output:
  report:
    name: Project Report
    pattern: '{{parameters.project}}-{{parameters.version}}.md'
```

In persona.md:
```markdown
You are creating release notes for {{parameters.project}}.
```

In instructions.md:
```markdown
# Release Notes - {{parameters.project}} v{{parameters.version}}

Generate notes for the {{parameters.team}} team.
```

## Testing Jobs

### Validate Configuration

First, validate your job configuration:

```bash
kronologi-validate my-job
```

Checks for:
- Missing required files
- Invalid parameter references
- Configuration errors
- Unused parameters

### Dry Run

Test without API calls:

```bash
# New format
kronologi --job my-job --year 2026 --month 1 --dry-run

# Legacy format
kronologi my-job 2026 1 --dry-run
```

Shows:
- Configuration loaded
- Files that would be processed
- Output paths
- No API call made

### Verbose Mode

See detailed processing:

```bash
kronologi --job my-job --year 2026 --month 1 --verbose
```

Shows:
- Configuration details
- Files being read
- Token counts
- API request/response
- Tool calls (if reasoning mode enabled)

### Debug Mode

Maximum detail:

```bash
kronologi --job my-job --year 2026 --month 1 --debug
```

Shows everything verbose does plus:
- Full prompts
- Complete API responses
- Internal processing steps
- Tool execution details

## Job Best Practices

### 1. Single Responsibility

One job = one purpose:

```bash
~/.kronologi/context/
├── release-notes/      # External release notes only
├── internal-update/    # Internal communication only
└── metrics-report/     # Metrics analysis only
```

Create focused jobs with `kronologi-init`.

### 2. Descriptive Names

Use clear, descriptive job names:

**Good**:
- `quarterly-review`
- `weekly-status`
- `api-changelog`

**Bad**:
- `job1`
- `summary`
- `report`

### 3. Reusable Context

Share context across jobs:

```yaml
# Both jobs reference shared guidelines
context:
  guidelines:
    type: static
    directory: global
```

### 4. Document Parameters

Add descriptions to custom parameters:

```yaml
parameters:
  sprint:
    type: number
    required: true
    description: "Sprint number (e.g., 42)"
```

### 5. Version Control

Track job configurations in Git:

```bash
# If you keep jobs in your project
git add .kronologi/context/
git commit -m "Add sprint review job"

# Or use a dedicated kronologi config repo
git add ~/.kronologi/context/
```

### 6. Start Simple

Begin with minimal configuration:

```yaml
# analysis.yml
model: gpt-4o
content:
  activity:
    name: Activity
    directory: 'activity'
    pattern: '*.md'
output:
  report:
    name: Summary
    format: markdown
    pattern: 'summary.md'
```

Add complexity as needed:
- Parameters
- Context sources
- Reasoning mode
- Multiple outputs

### 7. Test Incrementally

After each change, validate and test:

```bash
# Validate configuration
kronologi-validate my-job

# Dry run
kronologi --job my-job --year 2026 --month 1 --dry-run --verbose
```

### 8. Monitor Costs

Check token usage after running:

```bash
cat ~/.kronologi/summary/my-job/2026-01/completion.json
```

Optimize if needed:
- Enable reasoning mode for large datasets (better token efficiency)
- Reduce history months
- Use smaller model (`gpt-4o-mini`)
- Filter content more precisely with patterns

## Job Templates

### Minimal Template

```yaml
# config.yaml
model: gpt-4o
content:
  activity:
    type: activity
    pattern: '*.md'
output:
  summary:
    type: summary
    format: markdown
    pattern: 'summary.md'
```

```markdown
<!-- persona.md -->
You are a helpful assistant creating summaries.
```

```markdown
<!-- instructions.md -->
Summarize the provided activity.
```

### Standard Template

```yaml
# config.yaml
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

parameters:
  year: { type: number, required: true }
  month: { type: number, required: true }

context:
  guidelines:
    type: static
    directory: global

content:
  activity:
    type: activity
    pattern: '*.md'

output:
  summary:
    type: summary
    format: markdown
    pattern: 'summary.md'
```

```markdown
<!-- persona.md -->
You are an expert [domain] specialist.

Focus on [specific aspects].
```

```markdown
<!-- instructions.md -->
Create a summary for {{parameters.month}}/{{parameters.year}}.

## Required Sections
1. [Section 1]
2. [Section 2]
3. [Section 3]
```

### Advanced Template

```yaml
# config.yaml
model: gpt-4o
temperature: 0.5
maxCompletionTokens: 8000

parameters:
  year: { type: number, required: true }
  month: { type: number, required: true }
  project: { type: string, required: true }
  version: { type: string, required: false }

context:
  guidelines:
    type: static
    directory: global

  previous_summary:
    type: summary
    from: summary
    months: 1

content:
  activity:
    type: activity
    directory: '{{parameters.project}}'
    pattern: '*.md'

  history:
    type: activity
    directory: '{{parameters.project}}'
    pattern: '*.md'
    months: 3

output:
  summary:
    type: summary
    format: markdown
    pattern: '{{parameters.project}}-summary.md'

  metadata:
    type: metadata
    format: json
    pattern: 'completion.json'
```

## Troubleshooting

### Job Not Found

```
Error: Job 'my-job' not found
```

**Solution**: Ensure directory and files exist:
```bash
ls ~/.kronologi/context/my-job/
# Should show: analysis.yml, persona.md, instructions.md

# Or validate the job
kronologi-validate my-job
```

### Configuration Validation Failed

```
Configuration validation failed:
  - model: Required
```

**Solution**: Run validation to see all issues:
```bash
kronologi-validate my-job
```

Add missing required fields to `analysis.yml`

### No Content Files Found

```
Warning: No files matched pattern '*.md' in directory 'activity'
```

**Solution**:
1. Check pattern in `analysis.yml`
2. Verify files exist in expected location:
   ```bash
   ls ~/.kronologi/activity/2026-01/
   ```
3. Use `--debug` to see paths being searched
4. Validate configuration:
   ```bash
   kronologi-validate my-job
   ```

### Token Limit Exceeded

```
Error: Token limit exceeded
```

**Solution**:
1. **Enable reasoning mode** for better token efficiency:
   ```yaml
   reasoning:
     enabled: true
     provider: anthropic
   ```
2. Reduce history months:
   ```bash
   kronologi --job my-job --year 2026 --month 1 --history-months 1
   ```
3. Use smaller model: `--model gpt-4o-mini`
4. Filter content more precisely with patterns

## Next Steps

- [Prompts](./prompts.md) - Master prompt engineering
- [Configuration](./configuration.md) - Deep dive into config options
- [Models](./models.md) - Choose the right model
- [Development](./development.md) - Contribute to Kronologi
