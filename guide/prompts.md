# Prompt Engineering Guide

Mastering prompt engineering for effective Kronologi summaries.

## Prompt Structure

Kronologi constructs prompts from three components:

```
┌─────────────────────────────────────┐
│         System Message              │
│        (persona.md)                 │
│                                     │
│  Defines AI's role and expertise   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         User Message                │
│                                     │
│  ┌─────────────────────────────┐  │
│  │   Instructions              │  │
│  │   (instructions.md)         │  │
│  └─────────────────────────────┘  │
│              ↓                     │
│  ┌─────────────────────────────┐  │
│  │   Context                   │  │
│  │   (config: context)         │  │
│  └─────────────────────────────┘  │
│              ↓                     │
│  ┌─────────────────────────────┐  │
│  │   Content                   │  │
│  │   (config: content)         │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## The Persona (persona.md)

Defines who the AI is and how it should behave.

### Basic Structure

```markdown
You are a [role] with [expertise].

## Expertise
- [Area 1]
- [Area 2]
- [Area 3]

## Style
- [Style guideline 1]
- [Style guideline 2]

## Audience
- [Audience 1]
- [Audience 2]
```

### Example: Technical Writer

```markdown
You are an expert technical writer with 10 years of experience creating documentation for developer tools.

## Expertise
- Clear, concise technical communication
- Software development lifecycle understanding
- API documentation and release notes
- Developer education and onboarding

## Style
- Professional and precise
- Active voice preferred
- Fact-based with specific examples
- User-focused language

## Audience
- Software developers (junior to senior)
- DevOps engineers
- Technical managers
```

### Example: Data Analyst

```markdown
You are a senior data analyst specializing in business intelligence and reporting.

## Expertise
- Data interpretation and visualization
- Statistical analysis
- Trend identification
- Actionable insights generation

## Style
- Data-driven and objective
- Clear visualizations described in text
- Executive-friendly language
- Focus on business impact

## Audience
- Executive leadership
- Product managers
- Business stakeholders
```

### Persona Best Practices

1. **Be Specific**: "Expert technical writer" > "Good writer"
2. **Define Expertise**: List concrete skills and knowledge areas
3. **Set Style Guidelines**: How should the AI communicate?
4. **Know Your Audience**: Who will read the output?
5. **Stay Consistent**: Use the same persona for similar jobs

## The Instructions (instructions.md)

Defines what the AI should do and how output should be structured.

### Basic Structure

```markdown
[Task description]

## Output Format

[Exact structure with examples]

## Requirements

- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

## Guidelines

- [Guideline 1]
- [Guideline 2]
```

### Example: Release Notes

```markdown
Generate comprehensive release notes for month {{parameters.month}} of {{parameters.year}}.

## Output Format

# Release Notes - {{parameters.month}}/{{parameters.year}}

## Highlights
List 3-5 key achievements:
- Each highlight should be a complete sentence
- Focus on user impact
- Include metrics when available

## New Features
### [Feature Name]
[Description of the feature]
- What it does
- Who it's for
- Example usage

## Improvements
List enhancements to existing features:
- Be specific about what improved
- Quantify improvements (faster, smaller, etc.)

## Bug Fixes
List important bug fixes:
- Describe the issue
- Explain the fix
- Note affected versions

## Breaking Changes
⚠️ List changes requiring user action:
- Describe the change
- Explain why it was necessary
- Provide migration steps

## Requirements

- Use semantic version numbers
- Include code examples for API changes
- Link to documentation with [text](url) format
- Quantify improvements with metrics (40% faster, 50% smaller)
- Be specific, avoid vague terms like "improved" or "enhanced" without details

## Guidelines

- Focus on user-facing changes, not internal refactoring
- Explain "why" not just "what"
- Use active voice: "Added X" not "X was added"
- Be concise but complete
- Use bullet points for scanability
```

### Example: Sprint Review

```markdown
Create a sprint retrospective for Sprint {{parameters.sprint}} ({{parameters.month}}/{{parameters.year}}).

## Output Format

# Sprint {{parameters.sprint}} Review

## Sprint Goals
List the sprint goals and indicate which were met:
✓ [Goal that was met]
✗ [Goal that was not met]
◐ [Goal that was partially met]

## Completed Work
Organize by theme or feature area:
### [Theme/Area]
- [User story or task]
- [User story or task]

## Metrics
- **Story Points Completed**: [X] / [Y] committed
- **Velocity**: [X] points
- **Sprint Completion**: [X]%

## What Went Well
- [Success or positive observation]
- [Success or positive observation]

## What Could Improve
- [Challenge or area for improvement]
- [Challenge or area for improvement]

## Action Items
- [ ] [Action item for next sprint]
- [ ] [Action item for next sprint]

## Requirements

- Be honest about unmet goals
- Celebrate successes
- Be constructive about challenges
- Make action items specific and assignable

## Guidelines

- Focus on team learning
- Avoid blame or negativity
- Be specific with metrics
- Keep action items achievable
```

### Instructions Best Practices

1. **Provide Exact Format**: Show structure with examples
2. **Use Parameters**: `{{parameters.name}}` for dynamic values
3. **Set Clear Requirements**: What must be included?
4. **Give Guidelines**: How to write (style, tone, approach)
5. **Include Examples**: Show what good output looks like
6. **Be Specific**: Avoid ambiguity

## Context vs Content

Understanding the difference:

### Context (Background Information)

Provides background that informs the analysis but isn't the primary focus.

**Examples**:
- Project guidelines
- Previous summaries
- Style guides
- Historical context
- Company policies

**Configuration**:
```yaml
context:
  guidelines:
    type: static
    name: Project Guidelines
    directory: global

  previous_summary:
    type: summary
    name: Last Month
    from: summary
    months: 1
```

**In Prompt**:
```markdown
## Context

### Project Guidelines
[Content from context/global/guidelines.md]

### Previous Summary
[Last month's summary for continuity]
```

### Content (Primary Material)

The main material for AI to analyze and summarize.

**Examples**:
- Current month's commits
- Activity logs
- Meeting notes
- Changelog entries

**Configuration**:
```yaml
content:
  activity:
    type: activity
    name: Monthly Activity
    directory: ''
    pattern: '*.md'
```

**In Prompt**:
```markdown
## Content to Analyze

### Monthly Activity
[Content from activity/*.md files]
```

## Parameter Substitution

Use parameters for dynamic content.

### Syntax

```markdown
{{parameters.name}}
```

### Available Parameters

**Built-in**:
```markdown
{{parameters.year}}   # e.g., 2026
{{parameters.month}}  # e.g., 1
```

**Custom** (defined in config.yaml):
```markdown
{{parameters.project}}
{{parameters.version}}
{{parameters.team}}
```

### Usage Examples

**In Instructions**:
```markdown
# {{parameters.project}} - Release v{{parameters.version}}

Generate release notes for {{parameters.month}}/{{parameters.year}}.

Team: {{parameters.team}}
```

**In Persona**:
```markdown
You are creating documentation for the {{parameters.team}} team
working on {{parameters.project}}.
```

### Conditional Content

Use Handlebars-style conditionals:

```markdown
{{#parameters.include_metrics}}
## Metrics
Include detailed performance metrics in this section.
{{/parameters.include_metrics}}

{{#parameters.include_history}}
Provide historical context from previous months.
{{/parameters.include_history}}
```

Define boolean parameters in config:
```yaml
parameters:
  include_metrics:
    type: boolean
    default: true
  include_history:
    type: boolean
    default: false
```

## Writing Effective Prompts

### 1. Be Specific

**Bad**:
```markdown
Write a summary of the activity.
```

**Good**:
```markdown
Create a summary with these sections:
1. Highlights (3-5 key points)
2. Detailed changes (by category)
3. Impact analysis (who's affected and how)

Focus on user-facing changes. Include specific version numbers, metrics, and code examples.
```

### 2. Provide Examples

**Bad**:
```markdown
List the new features.
```

**Good**:
```markdown
## New Features

### Feature Name
Brief description of what it does.

**Who it's for**: [target audience]
**Use case**: [example scenario]

```example
// Code example showing usage
const result = newFeature();
```
```

### 3. Define Output Structure

**Bad**:
```markdown
Create release notes.
```

**Good**:
```markdown
# Release Notes - {{parameters.version}}

## Breaking Changes
[List any breaking changes first]

## New Features
[Organized by feature area]

## Improvements
[Organized by component]

## Bug Fixes
[Organized by severity]
```

### 4. Set Clear Expectations

**Bad**:
```markdown
Make it good.
```

**Good**:
```markdown
## Requirements

- Use active voice: "Added" not "Was added"
- Be specific with numbers: "40% faster" not "much faster"
- Include examples for complex changes
- Link to documentation where relevant
- Keep highlights to 2-3 sentences max
- Focus on user impact, not implementation details
```

### 5. Guide the Style

**Bad**:
```markdown
Write professionally.
```

**Good**:
```markdown
## Style Guidelines

- **Tone**: Professional but approachable
- **Voice**: Active voice preferred
- **Technical Level**: Assume developer audience with basic knowledge
- **Format**: Use bullet points for scannability
- **Length**: Be concise - prefer 2 sentences over 5
- **Examples**: Include code examples for API changes
```

## Prompt Patterns

### Pattern 1: Structured Summary

```markdown
Create a structured summary with these sections:

## [Section 1 Name]
[Instructions for section 1]

## [Section 2 Name]
[Instructions for section 2]

## [Section 3 Name]
[Instructions for section 3]

## Requirements
- [Requirement 1]
- [Requirement 2]
```

### Pattern 2: Question-Based

```markdown
Analyze the provided activity and answer these questions:

1. **What were the major achievements?**
   Focus on completed features and resolved issues.

2. **What challenges were encountered?**
   Identify blockers and difficulties.

3. **What's the impact on users?**
   Explain how changes affect end users.

4. **What's next?**
   Preview upcoming work based on current trajectory.
```

### Pattern 3: Audience-Specific

```markdown
Create two versions of this summary:

## Executive Summary
For non-technical stakeholders:
- Business impact
- Key metrics
- Strategic implications
- 2-3 paragraphs max

## Technical Summary
For engineering team:
- Technical changes
- API updates
- Performance metrics
- Architecture decisions
```

### Pattern 4: Comparative Analysis

```markdown
Compare activity from this month against:
- Previous month (from context)
- Historical trends (from history)

## Analysis Format

### Growth Areas
What increased or improved?

### Decline Areas
What decreased or needs attention?

### Trends
What patterns emerged?

### Recommendations
What should we do next?
```

### Pattern 5: Themed Organization

```markdown
Organize activity by theme:

## [Theme 1: e.g., Performance]
All performance-related changes

## [Theme 2: e.g., User Experience]
All UX-related changes

## [Theme 3: e.g., Developer Tools]
All tooling-related changes

Identify themes from the content, don't force pre-defined categories.
```

## Advanced Techniques

### Few-Shot Learning

Provide examples in instructions:

```markdown
Generate release notes following this format.

## Example

### New Features

#### Real-time Collaboration
Added real-time collaborative editing to documents. Multiple users can now edit simultaneously with live cursor tracking and conflict resolution.

**Who it's for**: Teams working on shared documents
**Use case**: Remote teams can collaborate on documents without version conflicts

```typescript
const doc = await Document.create({ collaborative: true });
doc.on('user-joined', (user) => console.log(`${user.name} joined`));
```

### [Your actual content here]
```

### Chain of Thought

Guide AI through reasoning:

```markdown
Analyze the provided activity using this process:

1. **Categorization**: First, categorize all changes by type (features, bugs, improvements)
2. **Priority Assessment**: Identify which changes have highest user impact
3. **Theme Identification**: Find common themes across changes
4. **Impact Analysis**: Assess who's affected and how
5. **Summary Creation**: Create summary based on above analysis

## Output Format
[Show your categorization and reasoning in the final output]
```

### Constraint Specification

Set clear boundaries:

```markdown
## Constraints

- **Length**: Each section must be 3-5 paragraphs
- **Technical Depth**: Assume reader has basic knowledge but isn't expert
- **Code Examples**: Include 1-2 code examples maximum
- **Links**: Link to documentation, don't embed full docs
- **Version Numbers**: Always include version numbers for dependencies
- **Metrics**: Include metrics only when precise numbers available (no estimates)
```

### Output Validation

Ask AI to self-check:

```markdown
After generating the summary, verify:

- [ ] All sections are present
- [ ] No vague terms like "improved" without quantification
- [ ] All code examples are syntactically correct
- [ ] All links use markdown format: [text](url)
- [ ] Version numbers follow semver format
- [ ] No implementation details (unless necessary for understanding)

If any items are not checked, revise the summary.
```

## Troubleshooting Prompts

### Problem: Output Too Vague

**Solution**: Add specificity requirements

```markdown
## Requirements

- ❌ "Improved performance"
- ✓ "Improved load time by 40% (from 2.5s to 1.5s)"

- ❌ "Fixed bugs"
- ✓ "Fixed authentication timeout bug affecting Safari users"

- ❌ "Enhanced UI"
- ✓ "Added dark mode toggle to settings panel"
```

### Problem: Wrong Tone

**Solution**: Strengthen persona and style guidelines

```markdown
<!-- persona.md -->
## Style
- Professional but friendly
- Write as if explaining to a colleague
- Avoid corporate jargon
- Use "we" and "our" (first person plural)
- Be enthusiastic about achievements without exaggeration
```

### Problem: Wrong Structure

**Solution**: Provide exact template

```markdown
Use this EXACT structure (don't add or remove sections):

# Release Notes - {{parameters.version}}

## Highlights
[3-5 bullet points]

## New Features
[Detailed descriptions]

## Improvements
[Enhancements to existing features]

## Bug Fixes
[Fixed issues]

## Breaking Changes
[Changes requiring user action]

Do not add sections like "Known Issues", "Deprecations", or "Next Steps" unless explicitly requested.
```

### Problem: Too Long/Too Short

**Solution**: Specify length constraints

```markdown
## Length Guidelines

- **Highlights**: 3-5 bullet points, 1 sentence each
- **Feature Description**: 2-3 paragraphs per feature
- **Improvements**: 1 sentence per improvement
- **Bug Fixes**: 1 sentence per fix
- **Overall**: Target 800-1200 words total

If content exceeds limits, prioritize by user impact and omit low-impact items.
```

### Problem: Missing Important Information

**Solution**: Add checklist requirements

```markdown
## Required Information

Each new feature MUST include:
- [ ] Feature name
- [ ] What it does (1-2 sentences)
- [ ] Who it's for (target audience)
- [ ] Use case example
- [ ] Code example (if applicable)
- [ ] Link to full documentation

Each bug fix MUST include:
- [ ] Issue description
- [ ] Who was affected
- [ ] How it was fixed
```

## Testing Your Prompts

### 1. Start Simple

Begin with minimal instructions:
```markdown
Summarize the provided activity.
```

### 2. Run and Evaluate

```bash
kronologi my-job 2026 1 --verbose
```

### 3. Identify Issues

- Too vague?
- Wrong tone?
- Missing sections?
- Too long/short?

### 4. Refine Incrementally

Add one improvement at a time:
1. Add structure
2. Add requirements
3. Add examples
4. Add constraints
5. Test again

### 5. Use Version Control

Track prompt evolution:
```bash
git add .kronologi/jobs/my-job/
git commit -m "Refined instructions: added length constraints"
```

## Prompt Examples

See the `/examples/` directory for complete prompt examples:
- [Release Notes](../examples/release-notes/)
- [Sprint Review](../examples/sprint-review/)
- [Monthly Review](../examples/monthly-review/)

## Next Steps

- [Models](./models.md) - Choose the right model for your prompts
- [Jobs](./jobs.md) - Apply prompts in job configurations
- [Development](./development.md) - Contribute to Kronologi
