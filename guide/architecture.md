# Architecture Guide

Understanding Kronologi's system design and component architecture.

## System Overview

Kronologi is a **prompt composition and AI summarization pipeline** that:
1. Loads job-specific configuration
2. Gathers content from multiple sources
3. Composes intelligent prompts
4. Calls OpenAI API for generation
5. Outputs structured results

```
┌─────────────────────────────────────────────────────┐
│                  CLI Interface                      │
│              (arguments.ts, main.ts)                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Orchestration Layer                    │
│                 (kronologi.ts)                      │
│                                                     │
│  • Loads configuration                              │
│  • Coordinates analysis                             │
│  • Manages API calls                                │
│  • Handles errors and retries                       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Config   │  │ Analysis │  │   API    │
│ Loader   │  │  Engine  │  │ Client   │
└──────────┘  └──────────┘  └──────────┘
     │             │             │
     ▼             ▼             ▼
┌─────────────────────────────────────────────────────┐
│               Support Systems                       │
│                                                     │
│  • Storage (filesystem abstraction)                 │
│  • Dates (timezone-aware operations)                │
│  • Logging (structured Winston logger)              │
└─────────────────────────────────────────────────────┘
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

## Data Flow

### Complete Pipeline

```
1. CLI Input
   ↓
   kronologi release-notes 2026 1 3 2
   ↓
2. Argument Parsing
   ↓
   { job: 'release-notes', year: 2026, month: 1,
     historyMonths: 3, summaryMonths: 2 }
   ↓
3. Configuration Loading
   ↓
   Load: .kronologi/jobs/release-notes/config.yaml
   Load: .kronologi/jobs/release-notes/persona.md
   Load: .kronologi/jobs/release-notes/instructions.md
   ↓
4. Parameter Building
   ↓
   { year: 2026, month: 1, ... }
   ↓
5. Context Gathering
   ↓
   Load: context/global/*.md (static context)
   Load: summary/2025/12/summary.md (previous summary)
   Load: summary/2025/11/summary.md (previous summary)
   ↓
6. Content Gathering
   ↓
   Load: activity/2025-*.md (3 months history)
   Load: activity/2026-01-*.md (current month)
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
9. API Call
   ↓
   OpenAI API: gpt-4o
   ↓
10. Response Processing
    ↓
    Extract: completion.choices[0].message.content
    ↓
11. Output Writing
    ↓
    Write: summary/2026/01/summary.md
    Write: summary/2026/01/completion.json
    Write: summary/2026/01/inputs.json
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
