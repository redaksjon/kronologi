# Model Selection Guide

Choosing the right OpenAI model for your Kronologi summaries.

## Overview

Kronologi supports all OpenAI models. The model you choose affects:
- **Quality**: How well the AI understands and synthesizes content
- **Cost**: API pricing per token
- **Speed**: How quickly summaries are generated
- **Reasoning**: Depth of analysis and insight

## Supported Models

### GPT-4o (Recommended Default)

```yaml
model: gpt-4o
```

**Characteristics**:
- Balanced performance and cost
- Fast generation speed
- Excellent for most use cases
- Strong instruction following
- Good at structured output

**Best For**:
- Standard release notes
- Monthly summaries
- Team updates
- General documentation

**Cost**: Medium ($2.50/$10.00 per 1M tokens input/output)

**Example Use Case**:
```yaml
# Release notes with standard complexity
model: gpt-4o
temperature: 0.7
maxCompletionTokens: 4000
```

### GPT-4o-mini (Budget-Friendly)

```yaml
model: gpt-4o-mini
```

**Characteristics**:
- Very fast
- Low cost
- Suitable for straightforward tasks
- Good instruction following
- Slightly less nuanced than GPT-4o

**Best For**:
- Simple summaries
- Routine updates
- High-volume processing
- Quick drafts

**Cost**: Low ($0.15/$0.60 per 1M tokens input/output)

**Example Use Case**:
```yaml
# Simple weekly status updates
model: gpt-4o-mini
temperature: 0.7
maxCompletionTokens: 2000
```

### GPT-4 (High Quality)

```yaml
model: gpt-4
```

**Characteristics**:
- Highest quality output
- Excellent reasoning
- Best instruction following
- Slower than GPT-4o
- More expensive

**Best For**:
- Complex analysis
- High-stakes documentation
- Detailed technical writing
- Multi-faceted summaries

**Cost**: High ($30.00/$60.00 per 1M tokens input/output)

**Example Use Case**:
```yaml
# Quarterly board report
model: gpt-4
temperature: 0.5
maxCompletionTokens: 8000
```

### o1 (Advanced Reasoning)

```yaml
model: o1
```

**Characteristics**:
- Extended reasoning capabilities
- Excellent for complex analysis
- Better at identifying patterns
- Slower generation
- Higher cost

**Best For**:
- Complex trend analysis
- Strategic insights
- Multi-source synthesis
- Research summaries

**Cost**: High ($15.00/$60.00 per 1M tokens input/output)

**Example Use Case**:
```yaml
# Quarterly strategic analysis
model: o1
temperature: 1.0  # Note: o1 has different temperature range
maxCompletionTokens: 6000
```

### o1-mini (Reasoning on Budget)

```yaml
model: o1-mini
```

**Characteristics**:
- Reasoning capabilities
- Faster than o1
- More affordable
- Good for moderate complexity

**Best For**:
- Moderate complexity analysis
- Pattern identification
- Balanced cost/reasoning
- Technical summaries

**Cost**: Medium ($3.00/$12.00 per 1M tokens input/output)

**Example Use Case**:
```yaml
# Monthly technical analysis
model: o1-mini
temperature: 1.0
maxCompletionTokens: 4000
```

### o3-mini (Latest Reasoning)

```yaml
model: o3-mini
```

**Characteristics**:
- Latest reasoning model
- Improved over o1-mini
- Good balance of speed and capability
- Cost-effective reasoning

**Best For**:
- Modern reasoning tasks
- Analysis with insights
- Trend identification
- Updated capabilities

**Cost**: Medium (pricing similar to o1-mini)

**Example Use Case**:
```yaml
# Sprint retrospective with insights
model: o3-mini
temperature: 1.0
maxCompletionTokens: 4000
```

## Model Comparison

| Model | Speed | Cost | Quality | Reasoning | Best Use Case |
|-------|-------|------|---------|-----------|---------------|
| gpt-4o | Fast | Medium | High | Good | **Default choice** - balanced |
| gpt-4o-mini | Very Fast | Low | Good | Basic | Simple, high-volume |
| gpt-4 | Medium | High | Highest | Excellent | Complex, high-stakes |
| o1 | Slow | High | High | Excellent | Deep analysis |
| o1-mini | Medium | Medium | Good | Good | Moderate analysis |
| o3-mini | Medium | Medium | Good | Good | Latest reasoning |

## Choosing a Model

### By Use Case

**Release Notes**:
```yaml
model: gpt-4o  # Standard choice
temperature: 0.3  # Factual
```

**Team Updates**:
```yaml
model: gpt-4o-mini  # Fast and cheap
temperature: 0.7  # Balanced
```

**Quarterly Reports**:
```yaml
model: gpt-4  # High quality
temperature: 0.5  # Professional
```

**Strategic Analysis**:
```yaml
model: o1  # Deep reasoning
temperature: 1.0
```

**Sprint Reviews**:
```yaml
model: o3-mini  # Reasoning + speed
temperature: 1.0
```

**Personal Notes**:
```yaml
model: gpt-4o-mini  # Cost-effective
temperature: 0.8  # Creative
```

### By Budget

**Low Budget** (maximize output):
```yaml
model: gpt-4o-mini
maxCompletionTokens: 2000  # Limit output
```

**Medium Budget** (balanced):
```yaml
model: gpt-4o
maxCompletionTokens: 4000
```

**High Budget** (best quality):
```yaml
model: gpt-4
maxCompletionTokens: 8000
```

### By Complexity

**Simple** (straightforward summarization):
```yaml
model: gpt-4o-mini
```

**Moderate** (structured analysis):
```yaml
model: gpt-4o
```

**Complex** (multi-faceted synthesis):
```yaml
model: gpt-4
```

**Analytical** (trend identification, insights):
```yaml
model: o3-mini  # or o1-mini, o1
```

## Temperature Settings

Temperature controls randomness (0.0 to 2.0).

### Factual Output (0.0 - 0.3)

```yaml
temperature: 0.3
```

**Use For**:
- Release notes
- Technical documentation
- API references
- Changelog generation

**Characteristics**:
- Deterministic
- Focused on facts
- Minimal creativity
- Consistent output

### Balanced (0.5 - 0.7)

```yaml
temperature: 0.7
```

**Use For**:
- Monthly summaries
- Team updates
- Project documentation
- General reports

**Characteristics**:
- Natural variation
- Good balance
- Readable and engaging
- Default choice

### Creative (0.8 - 1.0)

```yaml
temperature: 0.9
```

**Use For**:
- Blog posts
- Marketing content
- Personal reflections
- Creative writing

**Characteristics**:
- More variation
- Creative phrasing
- Engaging style
- Less predictable

### Note on o1/o3 Models

```yaml
# o1 and o3 models use different temperature range
model: o1
temperature: 1.0  # Default for reasoning models
```

Reasoning models have fixed temperature. Don't adjust unless needed.

## Token Limits

Control output length with `maxCompletionTokens`.

### Short Summaries (1000 - 2000 tokens)

```yaml
maxCompletionTokens: 1500
```

**Typical Output**:
- 750-1000 words
- 2-3 pages
- Brief summaries
- Quick updates

### Standard Reports (3000 - 5000 tokens)

```yaml
maxCompletionTokens: 4000
```

**Typical Output**:
- 2000-2500 words
- 5-7 pages
- Comprehensive summaries
- Standard reports

### Detailed Documentation (6000 - 10000 tokens)

```yaml
maxCompletionTokens: 8000
```

**Typical Output**:
- 4000-5000 words
- 10-15 pages
- Detailed analysis
- Long-form documentation

### Token Estimation

**1 token ≈ 0.75 words**
**1 token ≈ 4 characters**

Examples:
- 1000 tokens ≈ 750 words ≈ 1.5 pages
- 4000 tokens ≈ 3000 words ≈ 6 pages
- 8000 tokens ≈ 6000 words ≈ 12 pages

## Cost Optimization

### Strategy 1: Use Appropriate Model

Don't use expensive models for simple tasks:

```yaml
# ❌ Overkill for simple summary
model: gpt-4
maxCompletionTokens: 8000

# ✓ Appropriate
model: gpt-4o-mini
maxCompletionTokens: 2000
```

### Strategy 2: Limit History

Reduce input tokens by limiting history:

```bash
# ❌ Expensive: 6 months of history
kronologi release-notes 2026 1 6 3

# ✓ Cheaper: 2 months of history
kronologi release-notes 2026 1 2 1
```

### Strategy 3: Filter Content

Use specific patterns to reduce input:

```yaml
# ❌ Reads everything
content:
  activity:
    pattern: '**/*.md'

# ✓ Reads only relevant files
content:
  activity:
    pattern: 'changes-*.md'
```

### Strategy 4: Right-Size Output

Match token limit to needs:

```yaml
# ❌ Unnecessarily long
maxCompletionTokens: 8000  # for a simple update

# ✓ Appropriate length
maxCompletionTokens: 2000
```

### Strategy 5: Batch Processing

Use smaller model for bulk, expensive model for final:

```bash
# Draft with mini
kronologi draft-notes 2026 1 --model gpt-4o-mini

# Final with gpt-4o
kronologi final-notes 2026 1 --model gpt-4o
```

## Monitoring Costs

### Check Token Usage

After each run, check `completion.json`:

```json
{
  "usage": {
    "prompt_tokens": 2847,      // Input cost
    "completion_tokens": 1205,  // Output cost
    "total_tokens": 4052        // Total cost
  }
}
```

### Calculate Costs

**GPT-4o example**:
- Input: 2847 tokens = $0.007 (at $2.50/1M)
- Output: 1205 tokens = $0.012 (at $10.00/1M)
- Total: **$0.019 per run**

**GPT-4 example**:
- Input: 2847 tokens = $0.085 (at $30.00/1M)
- Output: 1205 tokens = $0.072 (at $60.00/1M)
- Total: **$0.157 per run** (8x more expensive!)

### Budget Planning

**Monthly summaries** (once per month):
- 12 runs/year × $0.019 = **$0.23/year** (gpt-4o)
- 12 runs/year × $0.157 = **$1.88/year** (gpt-4)

**Weekly updates** (4x per month):
- 48 runs/year × $0.019 = **$0.91/year** (gpt-4o)
- 48 runs/year × $0.005 = **$0.24/year** (gpt-4o-mini)

## Configuration Examples

### Example 1: Cost-Optimized Setup

```yaml
# .kronologi/jobs/weekly-update/config.yaml
model: gpt-4o-mini
temperature: 0.7
maxCompletionTokens: 2000

content:
  activity:
    type: activity
    pattern: 'week-*.md'  # Specific files only
```

**Cost**: ~$0.005 per run

### Example 2: Balanced Setup

```yaml
# .kronologi/jobs/release-notes/config.yaml
model: gpt-4o
temperature: 0.5
maxCompletionTokens: 4000

context:
  previous:
    type: summary
    from: summary
    months: 1

content:
  activity:
    type: activity
    pattern: '*.md'
    months: 1  # Limited history
```

**Cost**: ~$0.020 per run

### Example 3: High-Quality Setup

```yaml
# .kronologi/jobs/quarterly-report/config.yaml
model: gpt-4
temperature: 0.5
maxCompletionTokens: 8000

context:
  previous:
    type: summary
    from: summary
    months: 3

content:
  activity:
    type: activity
    pattern: '**/*.md'
    months: 3
```

**Cost**: ~$0.200 per run

### Example 4: Analysis Setup

```yaml
# .kronologi/jobs/sprint-retro/config.yaml
model: o3-mini
temperature: 1.0
maxCompletionTokens: 4000

content:
  tasks:
    type: activity
    directory: 'sprint'
    pattern: '*.md'

  retrospective:
    type: activity
    directory: 'retro'
    pattern: '*.md'
```

**Cost**: ~$0.040 per run

## Switching Models

### Via Configuration

Edit `config.yaml`:

```yaml
model: gpt-4o-mini  # Change this
```

### Via Command Line

Override for single run:

```bash
kronologi release-notes 2026 1 --model gpt-4
```

### Via Environment Variable

Set default for all runs:

```bash
export KRONOLOGI_MODEL="gpt-4o-mini"
kronologi release-notes 2026 1
```

## Testing Models

### Compare Outputs

Test different models on same content:

```bash
# Test with mini
kronologi test-job 2026 1 --model gpt-4o-mini

# Test with standard
kronologi test-job 2026 1 --model gpt-4o --replace

# Test with premium
kronologi test-job 2026 1 --model gpt-4 --replace
```

Compare results in `summary/2026/01/` directory.

### A/B Testing

Create duplicate jobs with different models:

```
.kronologi/jobs/
├── release-notes-mini/  # gpt-4o-mini
├── release-notes/       # gpt-4o
└── release-notes-pro/   # gpt-4
```

Run all and compare:

```bash
kronologi release-notes-mini 2026 1
kronologi release-notes 2026 1
kronologi release-notes-pro 2026 1
```

## Best Practices

### 1. Start with Default

Begin with `gpt-4o` for balanced performance:

```yaml
model: gpt-4o
temperature: 0.7
```

### 2. Optimize After Testing

Try cheaper model if quality is sufficient:

```yaml
model: gpt-4o-mini  # Test this
```

### 3. Match Model to Task

Use expensive models only when needed:
- Simple updates → `gpt-4o-mini`
- Standard reports → `gpt-4o`
- Complex analysis → `gpt-4` or reasoning models

### 4. Monitor Usage

Check `completion.json` regularly:
- Are you using too many tokens?
- Is the model overkill for the task?
- Can you reduce history months?

### 5. Version Control Settings

Track model changes:

```bash
git commit -am "Switch to gpt-4o-mini for cost savings"
```

### 6. Document Rationale

Add comments to config:

```yaml
# Using gpt-4o-mini for cost optimization
# Quality testing showed minimal difference for this use case
model: gpt-4o-mini
```

## Troubleshooting

### Output Quality Too Low

**Problem**: Summaries lack detail or insight

**Solution**:
1. Upgrade model: `gpt-4o-mini` → `gpt-4o` → `gpt-4`
2. Improve prompts (see [Prompts Guide](./prompts.md))
3. Add more context
4. Increase temperature for variety

### Output Too Expensive

**Problem**: Costs are too high

**Solution**:
1. Try smaller model
2. Reduce `maxCompletionTokens`
3. Limit history months
4. Filter content more precisely
5. Use specific glob patterns

### Output Too Inconsistent

**Problem**: Results vary too much between runs

**Solution**:
1. Lower temperature (0.3-0.5)
2. Improve instructions specificity
3. Provide examples in prompts
4. Use more structured output format

### Token Limit Exceeded

**Problem**: Input too large for model

**Solution**:
```bash
# Reduce history
kronologi my-job 2026 1 1 0  # Only 1 month, no previous summaries
```

Or configure automatic reduction:
```yaml
# Kronologi auto-retries with reduced history
# Check completion.json for actual parameters used
```

## Next Steps

- [Prompts](./prompts.md) - Optimize prompts for your model
- [Configuration](./configuration.md) - Configure model settings
- [Development](./development.md) - Contribute to Kronologi
