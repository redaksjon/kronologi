# Kronologi Quick Start Guide

## Installation

```bash
npm install -g @redaksjon/kronologi
```

## Basic Usage

### Generate a Report (Traditional)

```bash
kronologi --job monthly-summary --year 2026 --month 1
```

### Create a New Job

```bash
# Interactive mode
kronologi-init

# With template
kronologi-init --template monthly-summary my-job

# List available templates
kronologi-init --list-templates
```

### Validate Job Configuration

```bash
kronologi-validate my-job
```

## Advanced Features

### Reasoning Mode (AI with Tools)

Enable in your job's `analysis.yml`:

```yaml
reasoning:
  enabled: true
  provider: anthropic  # or openai
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files
```

**What it does:**
- AI can explore activity files dynamically
- Searches for relevant content
- Makes intelligent decisions about what to include
- Better token efficiency (only reads what's needed)

### MCP Server (AI Assistant Integration)

#### Start the Server

```bash
# Via npm
npm run mcp

# Via binary
kronologi-mcp
```

#### Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kronologi": {
      "command": "kronologi-mcp"
    }
  }
}
```

**Available Commands for Claude:**
- "Generate a monthly report for [job] for [month] [year]"
- "List all available Kronologi jobs"
- "Show me the report for [job] from [month] [year]"
- "List all reports for [job]"

## Configuration

### Environment Variables

```bash
# Optional: Set custom Kronologi directory
export KRONOLOGI_DIR=~/.kronologi

# Required: AI provider keys
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

### Job Structure

```
~/.kronologi/
├── context/          # Job configurations
│   └── my-job/
│       ├── analysis.yml      # Job config
│       ├── persona.md        # AI persona
│       └── instructions.md   # Instructions
├── activity/         # Input files
│   └── 2026-01/
│       └── *.md
├── summary/          # Generated reports
│   └── my-job/
│       └── 2026-01/
│           └── summary.md
└── examples/         # Template jobs
    └── monthly-summary/
```

## Common Workflows

### Monthly Team Update

```bash
# 1. Create job from template
kronologi-init --template team-update team-updates

# 2. Edit configuration
# Edit ~/.kronologi/context/team-updates/analysis.yml

# 3. Generate report
kronologi --job team-updates --year 2026 --month 1
```

### Project Release Notes

```bash
# 1. Create job
kronologi-init --template release-notes project-releases

# 2. Enable reasoning mode
# Add to analysis.yml:
#   reasoning:
#     enabled: true
#     provider: anthropic

# 3. Generate notes
kronologi --job project-releases --year 2026 --month 1
```

### Via MCP with Claude

1. Configure MCP (see above)
2. Restart Claude Desktop
3. Ask Claude:
   ```
   Generate a monthly report for team-updates for January 2026
   ```

## Troubleshooting

### "Job not found"

```bash
# List available jobs
ls ~/.kronologi/context/

# Verify job configuration
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

# Check logs
cat ~/Library/Logs/Claude/mcp*.log
```

## Examples

### Basic Job Configuration

```yaml
name: monthly-summary
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

parameters:
  CURRENT_MONTH:
    type: string
    default: "2026-01"
    description: "Current month"

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

### With Reasoning Mode

```yaml
name: monthly-summary
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000

# Enable AI tools
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files

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

## Next Steps

- **Read**: [Quick Start Guide](./guide/quickstart.md) for detailed setup
- **MCP Setup**: [Claude Desktop Integration](./guide/quickstart.md#use-with-claude-desktop-mcp)
- **Explore**: [guide/](./guide/) for comprehensive documentation
- **Examples**: [.kronologi/examples/](~/.kronologi/examples/) for templates
- **Help**: [GitHub Issues](https://github.com/redaksjon/kronologi/issues)

## Key Features

✅ **Intelligent Summaries** - AI-powered monthly reports
✅ **Multiple Providers** - OpenAI or Anthropic
✅ **Reasoning Mode** - AI explores files autonomously
✅ **MCP Integration** - Use with Claude and other AI assistants
✅ **Easy Configuration** - Templates and validation
✅ **Flexible Context** - Historical summaries, static context

---

**Version**: 0.0.12-dev.0
**Status**: Production Ready
**License**: Apache-2.0
