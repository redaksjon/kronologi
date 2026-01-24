# Architecture Guide

Understanding Kronologi's system design and component architecture.

## System Overview

Kronologi is a **prompt composition and AI summarization pipeline** that supports two operational modes:

### Traditional Mode (Direct API)
1. Loads job-specific configuration
2. Gathers content from multiple sources
3. Composes intelligent prompts
4. Calls AI API (OpenAI) for generation
5. Outputs structured results

### Reasoning Mode (Agentic Workflows)
1. Loads job-specific configuration
2. Initializes AI with tool capabilities
3. AI explores files dynamically using tools
4. Multi-turn conversations with tool execution
5. Outputs structured results with tool call history

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  CLI Interface                      │
│        (arguments.ts, main.ts, commands/)           │
│                                                     │
│  • kronologi (main CLI)                             │
│  • kronologi-init (job creator)                     │
│  • kronologi-validate (config validator)            │
│  • kronologi-mcp (MCP server)                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Orchestration Layer                    │
│                 (kronologi.ts, run.ts)              │
│                                                     │
│  • Loads configuration                              │
│  • Detects reasoning mode                           │
│  • Coordinates analysis                             │
│  • Manages AI interactions                          │
│  • Handles errors and retries                       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │ Reasoning Mode?         │
        │                         │
        ▼ YES                     ▼ NO
┌──────────────────┐      ┌──────────────────┐
│ Reasoning Client │      │  Direct OpenAI   │
│  (agentic mode)  │      │  (traditional)   │
└────────┬─────────┘      └──────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│Providers│ │  Tools   │
│ OpenAI  │ │ read     │
│Anthropic│ │ list     │
└─────────┘ │ search   │
            └──────────┘
```

## Core Components

### 1. CLI Interface

**Files**: [`arguments.ts`](../src/arguments.ts), [`main.ts`](../src/main.ts)

Handles command-line parsing and validation:

```typescript
// Command structure
kronologi <job> <year> <month> [historyMonths] [summaryMonths] [options]

// Parsed into:
interface ProgramOptions {
  job: string;
  year: number;
  month: number;
  historyMonths?: number;
  summaryMonths?: number;
  model?: string;
  timezone?: string;
  configDir?: string;
  contextDirectory?: string;
  activityDirectory?: string;
  summaryDirectory?: string;
  dryRun?: boolean;
  replace?: boolean;
  verbose?: boolean;
  debug?: boolean;
}
```

**Responsibilities**:
- Parse and validate command-line arguments
- Load environment variables
- Set up logging configuration
- Pass control to orchestration layer

### 2. Orchestration Layer

**File**: [`kronologi.ts`](../src/kronologi.ts)

The main coordinator that manages the entire workflow:

```typescript
export async function kronologi(options: ProgramOptions): Promise<void> {
  // 1. Load job configuration
  const config = await loadConfig(job, configDir);

  // 2. Build analysis inputs
  const inputs = await buildInputs(config, parameters);

  // 3. Call OpenAI API
  const completion = await runModel(inputs, config);

  // 4. Write outputs
  await writeOutputs(completion, config);
}
```

**Responsibilities**:
- Load and validate job configuration
- Coordinate analysis engine
- Handle API calls with retry logic
- Manage output generation
- Error handling and recovery

**Error Recovery**:
```typescript
try {
  const completion = await runModel(inputs, config);
} catch (error) {
  if (isTokenLimitError(error)) {
    // Reduce history and retry
    const reducedInputs = reduceHistory(inputs);
    const completion = await runModel(reducedInputs, config);
  }
}
```

### 3. Configuration System

**Files**: [`analysis/configLoader.ts`](../src/analysis/configLoader.ts), [`types.ts`](../src/types.ts)

Loads and validates job configurations using Zod schemas:

```typescript
// Configuration schema
const JobConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().optional(),
  maxCompletionTokens: z.number().optional(),
  parameters: z.record(z.any()).optional(),
  context: z.record(ContentSourceSchema).optional(),
  content: z.record(ContentSourceSchema).optional(),
  output: z.record(OutputConfigSchema).optional()
});

// Content source types
type ContentSource = {
  type: 'static' | 'activity' | 'history' | 'summary';
  name: string;
  directory?: string;
  pattern?: string;
  months?: number;
  from?: string;
};
```

**Configuration Loading**:
1. Find job directory: `.kronologi/jobs/<job-name>/`
2. Load `config.yaml` with Zod validation
3. Load `persona.md` and `instructions.md`
4. Build parameter objects from CLI arguments
5. Resolve directory paths

**Responsibilities**:
- Load and parse YAML configuration
- Validate configuration structure
- Load prompt files (persona, instructions)
- Create runtime parameter objects
- Resolve file paths

### 4. Analysis Engine

**Files**: [`analysis/inputs.ts`](../src/analysis/inputs.ts), [`analysis/prompt.ts`](../src/analysis/prompt.ts)

Composes prompts by gathering and organizing content:

```typescript
// Input structure
interface AnalysisInputs {
  persona: string;           // From persona.md
  instructions: string;      // From instructions.md
  context: ContextSection[]; // Context sources
  content: ContentSection[]; // Content sources
  parameters: Record<string, any>;
}

// Building process
async function buildInputs(config, parameters): Promise<AnalysisInputs> {
  // 1. Load persona and instructions
  const persona = await loadFile('persona.md');
  const instructions = await loadFile('instructions.md');

  // 2. Gather context sections
  const context = await gatherContext(config.context, parameters);

  // 3. Gather content sections
  const content = await gatherContent(config.content, parameters);

  // 4. Apply parameter substitutions
  return applyParameters({ persona, instructions, context, content }, parameters);
}
```

**Content Source Types**:

**Static Context**: Fixed reference material
```yaml
context:
  guidelines:
    type: static
    directory: global
    pattern: '*.md'
```

**Activity Files**: Current period material
```yaml
content:
  activity:
    type: activity
    directory: ''
    pattern: '*.md'
```

**Historical Content**: Previous periods
```yaml
content:
  history:
    type: history
    directory: ''
    months: 3
```

**Previous Summaries**: Continuity reference
```yaml
context:
  previous:
    type: summary
    from: summary
    months: 2
```

**Responsibilities**:
- Load content from all sources
- Apply glob patterns for file discovery
- Perform parameter substitution
- Calculate date ranges for historical content
- Structure content for AI consumption
- Generate input analysis metadata

### 5. API Client

**Files**: [`run.ts`](../src/run.ts), [`util/openai.ts`](../src/util/openai.ts)

Manages OpenAI API interactions:

```typescript
interface ModelInputs {
  persona: string;
  instructions: string;
  context: ContextSection[];
  content: ContentSection[];
  model: string;
  temperature?: number;
  maxTokens?: number;
}

async function runModel(inputs: ModelInputs): Promise<Completion> {
  // 1. Compose messages
  const messages = composeMessages(inputs);

  // 2. Call OpenAI API
  const response = await openai.chat.completions.create({
    model: inputs.model,
    messages,
    temperature: inputs.temperature,
    max_tokens: inputs.maxTokens
  });

  // 3. Extract completion
  return {
    content: response.choices[0].message.content,
    metadata: {
      id: response.id,
      model: response.model,
      usage: response.usage,
      created: response.created
    }
  };
}
```

**Message Composition**:
```typescript
[
  {
    role: 'system',
    content: persona
  },
  {
    role: 'user',
    content: [
      instructions,
      '## Context\n\n' + contextSections,
      '## Content to Analyze\n\n' + contentSections
    ].join('\n\n')
  }
]
```

**Responsibilities**:
- Compose OpenAI API messages
- Handle API calls and responses
- Manage token limits and errors
- Extract and structure completions
- Provide metadata for analysis

### 6. Output System

**File**: [`output.ts`](../src/output.ts)

Writes results to filesystem:

```typescript
interface OutputConfig {
  type: 'summary' | 'analysis' | 'metadata';
  format: 'markdown' | 'json' | 'text';
  pattern: string; // Filename pattern with parameters
}

async function writeOutputs(
  completion: Completion,
  config: JobConfig,
  parameters: Parameters
): Promise<void> {
  // For each output in config
  for (const [name, outputConfig] of Object.entries(config.output)) {
    // 1. Resolve filename
    const filename = resolvePattern(outputConfig.pattern, parameters);

    // 2. Create directory structure
    const directory = buildOutputPath(outputConfig, parameters);

    // 3. Write file
    await writeFile(path.join(directory, filename), content);
  }

  // Always write metadata files
  await writeCompletionMetadata(completion);
  await writeInputsAnalysis(inputs);
}
```

**Output Types**:
- **summary**: Main AI-generated content
- **completion**: API metadata (tokens, model, etc.)
- **inputs**: Analysis of what was sent to AI

**Responsibilities**:
- Create output directory structure
- Apply filename patterns
- Write summary files
- Write metadata files
- Handle file permissions

## Support Systems

### Storage Abstraction

**File**: [`util/storage.ts`](../src/util/storage.ts)

Abstracted filesystem operations:

```typescript
interface StorageProvider {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  list(pattern: string): Promise<string[]>;
  checkPermissions(path: string): Promise<Permissions>;
}

// Current: Local filesystem
// Future: Could support S3, Google Cloud Storage, etc.
```

**Responsibilities**:
- Abstract filesystem operations
- Enable future cloud storage support
- Centralize error handling
- Provide consistent API

### Date Operations

**File**: [`util/dates.ts`](../src/util/dates.ts)

Timezone-aware date calculations:

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Wrapped dayjs for timezone consistency
export function createDate(year: number, month: number, tz?: string): Dayjs {
  return dayjs.tz(`${year}-${month}-01`, tz || 'UTC');
}

export function getPreviousMonths(
  year: number,
  month: number,
  count: number,
  tz?: string
): Array<{year: number, month: number}> {
  const dates = [];
  let current = createDate(year, month, tz);

  for (let i = 0; i < count; i++) {
    current = current.subtract(1, 'month');
    dates.push({
      year: current.year(),
      month: current.month() + 1
    });
  }

  return dates;
}
```

**Responsibilities**:
- Timezone-aware date operations
- Calculate historical date ranges
- Format dates for filenames
- Handle month boundaries

### Logging System

**File**: [`logging.ts`](../src/logging.ts)

Winston-based structured logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: getLogLevel(), // 'error', 'info', 'verbose', 'debug'
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});
```

**Log Levels**:
- **error**: Critical failures
- **info**: Default operational messages
- **verbose**: Detailed progress (`--verbose`)
- **debug**: Full debugging output (`--debug`)

**Responsibilities**:
- Structured logging with levels
- Colored console output
- Timestamp tracking
- Error tracking

## Reasoning Architecture (New)

### Reasoning Client

**Files**: [`reasoning/client.ts`](../src/reasoning/client.ts), [`reasoning/provider.ts`](../src/reasoning/provider.ts)

Provider abstraction for AI interactions:

```typescript
interface Provider {
  complete(messages: Message[], config: ProviderConfig): Promise<CompletionResponse>;
  executeWithTools?(
    messages: Message[],
    tools: Tool[],
    config: ProviderConfig
  ): Promise<{response: CompletionResponse; toolCalls: ToolCall[]}>;
}

class ReasoningClient {
  private provider: Provider;

  async complete(messages: Message[]): Promise<CompletionResponse> {
    return await this.provider.complete(messages, this.config);
  }

  async executeWithTools(
    messages: Message[],
    tools: Tool[],
    options: ExecutionOptions
  ): Promise<ReasoningResult> {
    let iterations = 0;
    const allToolCalls = [];

    while (iterations < options.maxIterations) {
      const {response, toolCalls} = await this.provider.executeWithTools(
        messages,
        tools,
        this.config
      );

      if (!toolCalls || toolCalls.length === 0) {
        return {content: response.content, usage: response.usage, toolCalls: allToolCalls};
      }

      // Execute tools and continue conversation
      for (const call of toolCalls) {
        const result = await executeTool(call, tools);
        messages.push({
          role: 'assistant',
          content: `Tool ${call.name} called with ${JSON.stringify(call.input)}`
        });
        messages.push({
          role: 'user',
          content: `Tool result: ${JSON.stringify(result)}`
        });
      }

      allToolCalls.push(...toolCalls);
      iterations++;
    }
  }
}
```

**Providers**:
- **OpenAIProvider**: Traditional mode with direct completions
- **AnthropicProvider**: Reasoning mode with tool support

**Responsibilities**:
- Abstract AI provider differences
- Manage multi-turn tool execution
- Handle tool call/result loop
- Collect tool execution history

### Tool System

**Files**: [`reasoning/tools/`](../src/reasoning/tools/)

Tools that AI can use to explore content:

```typescript
interface Tool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  execute: (input: TInput, context: ToolContext) => Promise<TOutput>;
}

interface ToolContext {
  storage: Storage.Utility;
  config: KronologiConfig;
  job: JobConfig;
  logger: Logger;
}
```

**Available Tools**:

1. **read_file**: Read specific files
```typescript
{
  name: 'read_file',
  description: 'Read a file from activity, summary, or context directory',
  inputSchema: z.object({
    path: z.string(),
    directory: z.enum(['activity', 'summary', 'context'])
  }),
  execute: async (input, context) => {
    const fullPath = buildPath(input.directory, input.path);
    return await context.storage.readFile(fullPath, 'utf-8');
  }
}
```

2. **list_files**: Discover available files
```typescript
{
  name: 'list_files',
  description: 'List files matching a pattern',
  inputSchema: z.object({
    directory: z.enum(['activity', 'summary', 'context']),
    pattern: z.string().optional()
  }),
  execute: async (input, context) => {
    const files = await context.storage.glob(pattern);
    return files.map(f => ({
      path: f,
      size: getSize(f),
      modified: getModified(f)
    }));
  }
}
```

3. **search_files**: Search file content
```typescript
{
  name: 'search_files',
  description: 'Search for text in files',
  inputSchema: z.object({
    query: z.string(),
    directory: z.enum(['activity', 'summary', 'context']),
    pattern: z.string().optional()
  }),
  execute: async (input, context) => {
    const matches = [];
    await context.storage.forEachFileIn(dir, async (filePath) => {
      const content = await context.storage.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(input.query)) {
          matches.push({
            file: filePath,
            line: idx + 1,
            content: line
          });
        }
      });
    });
    return matches;
  }
}
```

**Tool Registry**:
```typescript
class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getMany(names: string[]): Tool[] {
    return names.map(name => this.get(name)).filter(Boolean);
  }
}

// Global registry
export const globalToolRegistry = new ToolRegistry();
```

**Responsibilities**:
- Provide file access to AI
- Enable content discovery
- Support content search
- Validate tool inputs
- Execute tool operations safely

### Report Generator

**File**: [`reasoning/reportGenerator.ts`](../src/reasoning/reportGenerator.ts)

Dual-mode report generation:

```typescript
// Simple mode (traditional)
export async function generateReportSimple(
  analysisConfig: AnalysisConfig,
  messages: Message[]
): Promise<ReportResult> {
  const client = createReasoningClient({
    provider: 'openai',
    model: analysisConfig.model,
    temperature: analysisConfig.temperature,
    maxTokens: analysisConfig.maxCompletionTokens
  });

  const response = await client.complete(messages);
  return {content: response.content, usage: response.usage};
}

// Agentic mode (reasoning)
export async function generateReportWithTools(
  analysisConfig: AnalysisConfig,
  messages: Message[],
  toolContext: ToolContext
): Promise<ReportResult> {
  const client = createReasoningClient({
    provider: analysisConfig.reasoning.provider,
    model: analysisConfig.model,
    temperature: analysisConfig.temperature,
    maxTokens: analysisConfig.maxCompletionTokens
  }, toolContext);

  const toolNames = analysisConfig.reasoning.tools || ['read_file', 'list_files', 'search_files'];
  const tools = globalToolRegistry.getMany(toolNames);

  const result = await client.executeWithTools(messages, tools, {
    maxIterations: analysisConfig.reasoning.maxIterations || 10
  });

  return {
    content: result.content,
    usage: result.usage,
    toolCalls: result.toolCalls
  };
}
```

**Mode Selection**:
```typescript
// In run.ts
const useReasoning = analysisConfig.reasoning?.enabled ?? false;

let result;
if (useReasoning) {
  result = await generateReportWithTools(analysisConfig, messages, toolContext);
} else {
  result = await generateReportSimple(analysisConfig, messages);
}
```

## MCP Server Architecture (New)

### MCP Server

**File**: [`mcp/server.ts`](../src/mcp/server.ts)

Model Context Protocol server for AI assistant integration:

```typescript
import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'kronologi',
  version: '0.1.0',
  description: 'Intelligent report generation from activity logs using AI'
}, {
  capabilities: {
    tools: {},      // Provide tools to AI assistants
    resources: {},  // Expose reports as resources
    prompts: {}     // Offer workflow prompts
  }
});

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({tools}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args} = request.params;
  const result = await handleToolCall(name, args || {});
  return {content: [{type: 'text', text: JSON.stringify(result, null, 2)}]};
});

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
server.setRequestHandler(ReadResourceRequestSchema, handleReadResource);

// Prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => ({prompts}));
server.setRequestHandler(GetPromptRequestSchema, handleGetPrompt);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

**MCP Tools**:

1. **generate_report**: Generate new reports
```typescript
{
  name: 'generate_report',
  description: 'Generate a Kronologi report',
  inputSchema: {
    type: 'object',
    properties: {
      job: {type: 'string'},
      year: {type: 'number'},
      month: {type: 'number'},
      historyMonths: {type: 'number'},
      summaryMonths: {type: 'number'},
      replace: {type: 'boolean'}
    },
    required: ['job', 'year', 'month']
  }
}
```

2. **list_jobs**: List available jobs
3. **get_report**: Retrieve existing reports
4. **list_reports**: Query available reports

**MCP Resources**:

All reports exposed as resources:
```typescript
{
  uri: 'kronologi://report/{job}/{year-month}',
  name: '{job} Report ({year-month})',
  description: 'Generated report for {job} in {year-month}',
  mimeType: 'text/markdown'
}
```

**MCP Prompts**:

Workflow prompts for common operations:
1. `generate-monthly-report`: Guided report generation
2. `review-recent-reports`: Report analysis workflow

**Responsibilities**:
- Expose Kronologi to AI assistants
- Handle tool calls from assistants
- Provide access to generated reports
- Offer guided workflows
- Maintain MCP protocol compliance

## Data Flow

### Traditional Mode Pipeline

```
1. CLI Input
   ↓
   kronologi --job release-notes --year 2026 --month 1
   ↓
2. Argument Parsing
   ↓
   { job: 'release-notes', year: 2026, month: 1 }
   ↓
3. Configuration Loading
   ↓
   Load: ~/.kronologi/context/release-notes/analysis.yml
   Load: ~/.kronologi/context/release-notes/persona.md
   Load: ~/.kronologi/context/release-notes/instructions.md
   ↓
4. Check Reasoning Mode
   ↓
   reasoning.enabled = false → Use traditional mode
   ↓
5. Context Gathering
   ↓
   Load: ~/.kronologi/context/global/*.md (static context)
   Load: ~/.kronologi/summary/release-notes/2025-12/summary.md
   ↓
6. Content Gathering
   ↓
   Load: ~/.kronologi/activity/2025-*.md (history)
   Load: ~/.kronologi/activity/2026-01/*.md (current)
   ↓
7. Parameter Substitution
   ↓
   Replace {{parameters.year}} → 2026
   Replace {{parameters.month}} → 1
   ↓
8. Prompt Composition
   ↓
   System: [persona]
   User: [instructions + context + content]
   ↓
9. API Call (Simple)
   ↓
   Reasoning Client → OpenAI Provider → gpt-4o
   Single completion call with all content
   ↓
10. Response Processing
    ↓
    Extract: completion.content
    ↓
11. Output Writing
    ↓
    Write: ~/.kronologi/summary/release-notes/2026-01/summary.md
    Write: ~/.kronologi/summary/release-notes/2026-01/completion.json
    Write: ~/.kronologi/summary/release-notes/2026-01/inputs.json
```

### Reasoning Mode Pipeline

```
1. CLI Input
   ↓
   kronologi --job release-notes --year 2026 --month 1
   ↓
2. Argument Parsing
   ↓
   { job: 'release-notes', year: 2026, month: 1 }
   ↓
3. Configuration Loading
   ↓
   Load: ~/.kronologi/context/release-notes/analysis.yml
   reasoning:
     enabled: true
     provider: anthropic
     tools: [read_file, list_files, search_files]
   ↓
4. Check Reasoning Mode
   ↓
   reasoning.enabled = true → Use agentic mode
   ↓
5. Initialize Tool Context
   ↓
   Create tool context with storage, config, logger
   Register tools: read_file, list_files, search_files
   ↓
6. Initial Prompt
   ↓
   System: [persona]
   User: [instructions + minimal context]
   Note: NO activity content sent initially
   ↓
7. Agentic Loop (Multi-turn)
   ↓
   Iteration 1:
     AI → list_files(directory='activity', pattern='2026-01/*.md')
     Tool → Returns list of files

   Iteration 2:
     AI → search_files(query='feature launch', directory='activity')
     Tool → Returns matching files and lines

   Iteration 3:
     AI → read_file(path='2026-01/week1.md', directory='activity')
     Tool → Returns file content

   Iteration 4:
     AI → read_file(path='2026-01/week3.md', directory='activity')
     Tool → Returns file content

   Iteration 5:
     AI → Generates final report (no more tool calls)
   ↓
8. Response Processing
   ↓
   Extract: completion.content
   Collect: All tool calls from iterations
   ↓
9. Output Writing
   ↓
   Write: ~/.kronologi/summary/release-notes/2026-01/summary.md
   Write: ~/.kronologi/summary/release-notes/2026-01/completion.json (with tool calls)
   Write: ~/.kronologi/summary/release-notes/2026-01/inputs.json
```

### MCP Server Flow

```
1. MCP Client (Claude Desktop)
   ↓
   User: "Generate a report for release-notes for January 2026"
   ↓
2. MCP Tool Call
   ↓
   Tool: generate_report
   Args: {job: 'release-notes', year: 2026, month: 1}
   ↓
3. Server Handler
   ↓
   Load job configuration
   Detect reasoning mode
   ↓
4. Execute Generation
   ↓
   [Same as Traditional or Reasoning mode above]
   ↓
5. Return Result
   ↓
   MCP Response: {
     content: [{
       type: 'text',
       text: 'Successfully generated report...'
     }]
   }
   ↓
6. Client Display
   ↓
   Claude shows: "I've generated the report for release-notes..."
```

## Error Handling Strategy

### Token Limit Recovery

```typescript
async function runWithRetry(inputs: Inputs, config: Config): Promise<Completion> {
  try {
    return await runModel(inputs, config);
  } catch (error) {
    if (error.code === 'context_length_exceeded') {
      logger.info('Token limit exceeded, reducing history...');

      // Reduce history months
      const newHistory = Math.max(1, inputs.historyMonths - 1);
      const newSummary = Math.max(0, inputs.summaryMonths - 1);

      logger.info(`Retrying with historyMonths=${newHistory}, summaryMonths=${newSummary}`);

      const reducedInputs = await buildInputs(config, {
        ...inputs.parameters,
        historyMonths: newHistory,
        summaryMonths: newSummary
      });

      return await runModel(reducedInputs, config);
    }
    throw error;
  }
}
```

### Configuration Validation

```typescript
// Zod schema validation catches errors early
try {
  const config = JobConfigSchema.parse(yamlContent);
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('Configuration validation failed:');
    error.errors.forEach(err => {
      logger.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
}
```

### File Operation Errors

```typescript
try {
  const content = await storage.read(filePath);
} catch (error) {
  if (error.code === 'ENOENT') {
    logger.warn(`File not found: ${filePath}`);
    return null; // Continue without this file
  }
  throw error; // Fatal errors propagate
}
```

## Extensibility Points

### 1. Custom Storage Providers

Replace local filesystem with cloud storage:

```typescript
class S3StorageProvider implements StorageProvider {
  async read(path: string): Promise<string> {
    // S3 implementation
  }

  async write(path: string, content: string): Promise<void> {
    // S3 implementation
  }
}
```

### 2. Additional Content Source Types

Add new source types beyond static/activity/history/summary:

```typescript
type ContentSource =
  | StaticSource
  | ActivitySource
  | HistorySource
  | SummarySource
  | DatabaseSource  // New: Query database
  | APISource       // New: Fetch from API
  | GitSource;      // New: Parse git history
```

### 3. Output Formats

Add new output formats:

```typescript
type OutputFormat =
  | 'markdown'
  | 'json'
  | 'text'
  | 'html'      // New: HTML output
  | 'pdf';      // New: PDF generation
```

### 4. AI Providers

Support additional AI providers:

```typescript
interface AIProvider {
  generate(prompt: string, options: GenerateOptions): Promise<Completion>;
}

class OpenAIProvider implements AIProvider { /* ... */ }
class AnthropicProvider implements AIProvider { /* ... */ }
class LocalLLMProvider implements AIProvider { /* ... */ }
```

## Performance Considerations

### Token Usage Optimization

**Problem**: Large prompts consume many tokens
**Solutions**:
1. Use `historyMonths` and `summaryMonths` judiciously
2. Filter content with specific glob patterns
3. Use smaller models for simple tasks (gpt-4o-mini)
4. Monitor `completion.json` for token usage

### File I/O Optimization

**Problem**: Reading many files can be slow
**Solutions**:
1. Parallel file reading with `Promise.all()`
2. Cache file contents during retries
3. Use specific patterns instead of `**/*`

### API Rate Limiting

**Problem**: OpenAI rate limits
**Solutions**:
1. Exponential backoff on rate limit errors
2. Batch processing with delays
3. Use appropriate tier based on usage

## Security Considerations

### API Key Protection

- Never log API keys
- Use environment variables, not config files
- Don't commit `.env` files

### File Path Validation

- Validate all user-provided paths
- Prevent directory traversal attacks
- Check file permissions before writing

### Content Sanitization

- Don't include sensitive data in prompts
- Filter credential files from patterns
- Audit generated outputs before sharing

## Testing Strategy

See [Development Guide](./development.md) for complete testing information.

**Unit Tests**: Test individual functions in isolation
**Integration Tests**: Test component interactions
**End-to-End Tests**: Test complete workflows

## Next Steps

- [Configuration](./configuration.md) - Master configuration options
- [Jobs](./jobs.md) - Understand job structure
- [Prompts](./prompts.md) - Learn prompt engineering
- [Development](./development.md) - Contribute to Kronologi
