# Kronologi MCP Server Guide

## Overview

Kronologi now includes a Model Context Protocol (MCP) server that exposes report generation and management capabilities to AI assistants like Claude. This allows AI tools to generate reports, query historical data, and manage jobs without needing to understand command-line interfaces.

## Quick Start

### Installation

```bash
npm install -g @redaksjon/kronologi
```

### Configuration

Add Kronologi to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "kronologi": {
      "command": "kronologi-mcp"
    }
  }
}
```

Or use it directly:

```bash
npm run mcp
```

## Available Tools

### 1. generate_report

Generate a new report for a specific job, year, and month.

**Input:**
- `job` (string, required): Job name (e.g., "monthly-summary")
- `year` (number, required): Year for the report
- `month` (number, required): Month (1-12)
- `historyMonths` (number, optional): Months of history to include (default: 3)
- `summaryMonths` (number, optional): Months of summaries to include (default: 1)
- `replace` (boolean, optional): Replace existing report (default: false)

**Example:**
```json
{
  "job": "monthly-summary",
  "year": 2026,
  "month": 1
}
```

### 2. list_jobs

List all available Kronologi jobs.

**Input:** None

**Returns:** Array of job names

### 3. get_report

Retrieve an existing report by job, year, and month.

**Input:**
- `job` (string, required): Job name
- `year` (number, required): Year
- `month` (number, required): Month (1-12)

**Returns:** Report content in markdown format

### 4. list_reports

List available reports, optionally filtered by job.

**Input:**
- `job` (string, optional): Filter by job name

**Returns:** Array of reports with metadata

## Resources

Reports are exposed as MCP resources with the following URI format:

```
kronologi://report/{job}/{year-month}
```

**Example:** `kronologi://report/monthly-summary/2026-01`

## Prompts

### generate-monthly-report

Guided workflow for generating a monthly report.

**Arguments:**
- `job`: Job name
- `year`: Year
- `month`: Month

### review-recent-reports

Analyze recent reports for patterns and trends.

**Arguments:**
- `job`: Job name to review

## Usage Examples

### With Claude Desktop

Once configured, you can ask Claude:

```
"Generate a monthly report for the project-updates job for January 2026"
```

Claude will use the `generate_report` tool to create the report.

### With Custom MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: "my-client",
  version: "1.0.0"
});

// Connect to Kronologi MCP server
await client.connect(/* ... */);

// Call a tool
const result = await client.callTool({
  name: "list_jobs",
  arguments: {}
});
```

## Configuration

Kronologi MCP server uses standard Kronologi configuration:

- **KRONOLOGI_DIR**: Base directory (default: `~/.kronologi`)
- **Activity Directory**: `$KRONOLOGI_DIR/activity`
- **Summary Directory**: `$KRONOLOGI_DIR/summary`
- **Context Directory**: `$KRONOLOGI_DIR/context`

## Reasoning Mode Integration

If you've enabled reasoning mode in your job configuration, the MCP server will automatically use it:

```yaml
# In your job's analysis.yml
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files
```

This enables agentic workflows where the AI can actively search through activity files and make intelligent decisions about what to include in reports.

## Troubleshooting

### Server won't start

Ensure you have the required dependencies:
```bash
npm install
npm run build
```

### Jobs not found

Check that your `KRONOLOGI_DIR` is set correctly and contains job configurations in the `context` directory.

### Reports not generating

Verify:
1. Job configuration exists: `~/.kronologi/context/{job}/analysis.yml`
2. Activity files exist for the specified period
3. OpenAI or Anthropic API keys are configured

## Development

To run the MCP server in development:

```bash
npm run watch  # Build in watch mode
npm run mcp    # Run the server
```

To test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector kronologi-mcp
```

## Next Steps

- See [README.md](./README.md) for general Kronologi usage
- See [guide/](./guide/) for detailed configuration options
- See [docs/](./docs/) for API reference

## Support

For issues or questions:
- GitHub: https://github.com/redaksjon/kronologi
- Documentation: https://redaksjon.github.io/kronologi
