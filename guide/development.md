# Development Guide

Contributing to Kronologi development.

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Git**: For version control
- **TypeScript**: Knowledge of TypeScript

### Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd kronologi

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Project Structure

```
kronologi/
├── src/                    # Source code
│   ├── main.ts            # CLI entry point
│   ├── kronologi.ts       # Main orchestration
│   ├── arguments.ts       # CLI argument parsing
│   ├── types.ts           # TypeScript types and schemas
│   ├── constants.ts       # Constants and defaults
│   ├── run.ts             # OpenAI API client
│   ├── logging.ts         # Winston logger
│   ├── output.ts          # Output file writing
│   ├── analysis/          # Analysis engine
│   │   ├── inputs.ts      # Input composition
│   │   ├── prompt.ts      # Prompt building
│   │   ├── configLoader.ts  # Config loading
│   │   ├── file.ts        # File operations
│   │   └── section.ts     # Section processing
│   ├── util/              # Utilities
│   │   ├── storage.ts     # Storage abstraction
│   │   ├── dates.ts       # Date operations
│   │   ├── openai.ts      # OpenAI utilities
│   │   └── general.ts     # General utilities
│   └── error/             # Error types
│       └── ArgumentError.ts
├── tests/                 # Test files
│   ├── run.test.ts
│   ├── constants.test.ts
│   ├── analysis/
│   ├── util/
│   └── error/
├── dist/                  # Compiled JavaScript
├── guide/                 # Documentation (this)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite build config
└── vitest.config.ts       # Vitest test config
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Edit source files in `src/`.

### 3. Build

```bash
npm run build
```

Watches files and rebuilds on changes:
```bash
npm run build:watch
```

### 4. Test

Run all tests:
```bash
npm test
```

Run specific test:
```bash
npm test run.test.ts
```

Watch mode:
```bash
npm test -- --watch
```

### 5. Lint

```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

### 6. Commit

```bash
git add .
git commit -m "feat: add new feature"
```

### 7. Push and PR

```bash
git push origin feature/my-feature
```

Create pull request on GitHub.

## Testing

### Test Framework

Kronologi uses **Vitest** for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch

# Specific file
npm test run.test.ts

# Debug mode
npm test -- --inspect-brk
```

### Writing Tests

Create test files in `tests/` directory:

```typescript
// tests/myfeature.test.ts
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '../src/myfeature';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('../src/storage', () => ({
  read: vi.fn().mockResolvedValue('mocked content'),
  write: vi.fn().mockResolvedValue(undefined)
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'response' } }]
        })
      }
    }
  }))
}));
```

### Test Coverage

```bash
npm run test:coverage
```

View coverage report:
```bash
open coverage/index.html
```

Target: 80%+ coverage for critical paths.

## Code Style

### TypeScript Guidelines

1. **Use strict mode**:
```typescript
// tsconfig.json has strict: true
```

2. **Type everything**:
```typescript
// ✓ Good
function process(input: string): Promise<Result> {
  // ...
}

// ✗ Bad
function process(input) {
  // ...
}
```

3. **Use interfaces for objects**:
```typescript
interface Config {
  model: string;
  temperature?: number;
}
```

4. **Use Zod for validation**:
```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().optional()
});
```

### Naming Conventions

**Files**: camelCase
- `configLoader.ts`
- `dateUtils.ts`

**Classes**: PascalCase
- `ArgumentError`
- `StorageProvider`

**Functions**: camelCase
- `loadConfig()`
- `buildPrompt()`

**Constants**: UPPER_SNAKE_CASE
- `DEFAULT_MODEL`
- `MAX_TOKEN_LIMIT`

**Interfaces**: PascalCase
- `Config`
- `AnalysisInputs`

### Code Organization

**Export patterns**:
```typescript
// ✓ Named exports (preferred)
export function loadConfig() { }
export function saveConfig() { }

// ✗ Default exports (avoid)
export default function() { }
```

**Import ordering**:
```typescript
// 1. Node built-ins
import path from 'path';
import fs from 'fs/promises';

// 2. External dependencies
import { z } from 'zod';
import yaml from 'js-yaml';

// 3. Internal modules
import { loadConfig } from './config';
import { logger } from './logging';
```

## Adding Features

### Adding a New Content Source Type

1. **Update types** in [`src/types.ts`](../src/types.ts):

```typescript
type ContentSourceType =
  | 'static'
  | 'activity'
  | 'history'
  | 'summary'
  | 'database';  // New type

interface DatabaseSource {
  type: 'database';
  name: string;
  query: string;
  connection: string;
}
```

2. **Update schema** in [`src/types.ts`](../src/types.ts):

```typescript
const ContentSourceSchema = z.discriminatedUnion('type', [
  StaticSourceSchema,
  ActivitySourceSchema,
  HistorySourceSchema,
  SummarySourceSchema,
  DatabaseSourceSchema  // New schema
]);
```

3. **Implement loader** in [`src/analysis/inputs.ts`](../src/analysis/inputs.ts):

```typescript
async function loadDatabaseContent(source: DatabaseSource): Promise<string> {
  // Implementation
}
```

4. **Add to gathering logic**:

```typescript
if (source.type === 'database') {
  content = await loadDatabaseContent(source);
}
```

5. **Write tests**:

```typescript
// tests/analysis/database.test.ts
describe('loadDatabaseContent', () => {
  it('should load from database', async () => {
    // Test implementation
  });
});
```

6. **Update documentation**:
- Add to [Configuration Guide](./configuration.md)
- Add example to [Jobs Guide](./jobs.md)

### Adding a New Output Format

1. **Update types** in [`src/types.ts`](../src/types.ts):

```typescript
type OutputFormat =
  | 'markdown'
  | 'json'
  | 'text'
  | 'html';  // New format
```

2. **Implement formatter** in [`src/output.ts`](../src/output.ts):

```typescript
function formatHTML(content: string): string {
  // Convert markdown to HTML
  return convertToHTML(content);
}
```

3. **Add to output logic**:

```typescript
if (outputConfig.format === 'html') {
  content = formatHTML(content);
}
```

4. **Write tests**:

```typescript
// tests/output.test.ts
describe('formatHTML', () => {
  it('should convert markdown to HTML', () => {
    // Test implementation
  });
});
```

### Adding Configuration Options

1. **Update schema** in [`src/types.ts`](../src/types.ts):

```typescript
const JobConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().optional(),
  maxCompletionTokens: z.number().optional(),
  streaming: z.boolean().optional(),  // New option
  // ...
});
```

2. **Update interface**:

```typescript
interface JobConfig {
  model: string;
  temperature?: number;
  maxCompletionTokens?: number;
  streaming?: boolean;  // New field
  // ...
}
```

3. **Use in code**:

```typescript
async function runModel(inputs: Inputs, config: Config): Promise<Completion> {
  const response = await openai.chat.completions.create({
    model: config.model,
    stream: config.streaming,  // Use new option
    // ...
  });
}
```

4. **Document**:
- Add to [Configuration Guide](./configuration.md)
- Add examples

## Architecture Changes

### Adding a New Analysis Phase

If you need to add a processing phase:

1. **Create phase module**:

```typescript
// src/analysis/preprocessing.ts
export async function preprocessInputs(
  inputs: RawInputs
): Promise<ProcessedInputs> {
  // Phase implementation
}
```

2. **Integrate into pipeline** in [`src/kronologi.ts`](../src/kronologi.ts):

```typescript
export async function kronologi(options: Options): Promise<void> {
  const config = await loadConfig(options);
  const rawInputs = await gatherInputs(config);
  const processedInputs = await preprocessInputs(rawInputs);  // New phase
  const completion = await runModel(processedInputs, config);
  await writeOutputs(completion, config);
}
```

3. **Add tests**:

```typescript
// tests/analysis/preprocessing.test.ts
describe('preprocessInputs', () => {
  it('should preprocess inputs correctly', async () => {
    // Tests
  });
});
```

### Refactoring Guidelines

1. **Keep changes small**: One logical change per PR
2. **Maintain backward compatibility**: Don't break existing configs
3. **Add deprecation warnings**: Before removing features
4. **Update tests**: Ensure all tests pass
5. **Update documentation**: Keep docs in sync

## Debugging

### Enable Debug Logging

```bash
# Run with debug output
kronologi my-job 2026 1 --debug
```

### Add Debug Logs

```typescript
import { logger } from './logging';

logger.debug('Processing file', { filePath, size });
logger.verbose('Found files', { count: files.length });
logger.info('Generating summary...');
logger.error('Failed to process', { error });
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Kronologi",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "args": ["release-notes", "2026", "1", "--debug"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Inspecting Prompts

Use `--debug` to see full prompts sent to API:

```bash
kronologi my-job 2026 1 --debug 2>&1 | tee debug.log
```

Check `debug.log` for complete prompt.

## Performance Optimization

### Profile Performance

```typescript
console.time('operation');
await expensiveOperation();
console.timeEnd('operation');
```

### Optimize File I/O

```typescript
// ✓ Good: Parallel reads
const files = await Promise.all(
  paths.map(p => storage.read(p))
);

// ✗ Bad: Sequential reads
for (const path of paths) {
  const content = await storage.read(path);
}
```

### Cache Results

```typescript
const cache = new Map<string, string>();

async function readWithCache(path: string): Promise<string> {
  if (cache.has(path)) {
    return cache.get(path)!;
  }
  const content = await storage.read(path);
  cache.set(path, content);
  return content;
}
```

## Release Process

### Version Bump

```bash
# Patch: 0.0.1 → 0.0.2
npm version patch

# Minor: 0.0.2 → 0.1.0
npm version minor

# Major: 0.1.0 → 1.0.0
npm version major
```

### Publish to npm

```bash
# Build
npm run build

# Test
npm test

# Publish
npm publish
```

### Git Tag

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Contributing Guidelines

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** changes with tests
4. **Ensure** tests pass: `npm test`
5. **Ensure** linting passes: `npm run lint`
6. **Update** documentation
7. **Commit** with clear messages
8. **Push** to your fork
9. **Create** pull request

### Commit Messages

Follow conventional commits:

```bash
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
chore: update dependencies
```

### Code Review

- Be respectful and constructive
- Explain reasoning for changes
- Respond to feedback promptly
- Keep discussions focused

## Common Development Tasks

### Add a New CLI Option

1. Update [`src/arguments.ts`](../src/arguments.ts):

```typescript
program
  .option('--my-option <value>', 'Description')
```

2. Update `ProgramOptions` interface in [`src/types.ts`](../src/types.ts):

```typescript
interface ProgramOptions {
  // ...
  myOption?: string;
}
```

3. Use in code
4. Add tests
5. Update documentation

### Add a New Model

Models are dynamically supported. Just document in [Models Guide](./models.md).

### Fix a Bug

1. **Reproduce**: Create test that fails
2. **Fix**: Implement fix
3. **Verify**: Test passes
4. **Document**: Add to changelog

### Optimize Token Usage

1. **Profile**: Check `completion.json` for token counts
2. **Identify**: Where are tokens being used?
3. **Optimize**: Reduce input or improve prompts
4. **Measure**: Compare before/after

## Documentation

### Updating Guides

Guides are in `guide/` directory:

- [index.md](./index.md) - Main guide
- [quickstart.md](./quickstart.md) - Quick start
- [architecture.md](./architecture.md) - Architecture
- [configuration.md](./configuration.md) - Configuration
- [jobs.md](./jobs.md) - Jobs
- [prompts.md](./prompts.md) - Prompts
- [models.md](./models.md) - Models
- [development.md](./development.md) - This file

### Documentation Standards

- Use markdown
- Include code examples
- Link between guides
- Keep examples up-to-date
- Use clear, simple language

## Getting Help

### Resources

- **Issues**: GitHub issues for bugs and features
- **Discussions**: GitHub discussions for questions
- **Documentation**: This guide and other guides

### Asking Questions

1. Check existing documentation
2. Search existing issues
3. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Code examples

## Next Steps

- Read [Architecture Guide](./architecture.md) for system understanding
- Explore source code in `src/` directory
- Run tests to see how components work
- Try making a small change
- Submit your first PR!

Happy coding! 🚀
