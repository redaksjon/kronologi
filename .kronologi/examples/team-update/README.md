# Team Update Template

A flexible template for creating internal team updates with dynamic parameters and customizable sections.

## What This Template Does

This template generates team updates by analyzing activity files and incorporating team-specific context. Perfect for:

- Weekly team stand-ups
- Sprint reviews
- Department updates
- Project status reports

## How It Works

### Input Structure

```
activity/
  2026/
    1/
      team-activities.md
      blockers.md
      wins.md

context/
  team-info/
    members.md
    goals.md
```

### Output Structure

```
summary/
  team-update/
    2026/
      1/
        summary.md          # The team update
        completion.json     # API usage statistics
        inputs.json         # Complete input data
```

## Configuration

### Model Settings

```yaml
model: gpt-4o-mini         # Fast and cost-effective
temperature: 0.7
```

### Parameters

- `year`: Update year (e.g., 2026)
- `month`: Update month (1-12)
- `team`: Team name (default: "Engineering")
- `sprint`: Sprint number (optional)

### Context Sources

```yaml
context:
  team_info:
    type: static
    name: Team Information
    directory: 'team'
    pattern: '*.md'
```

Includes static team information like goals, members, and processes.

### Content Sources

```yaml
content:
  activity:
    type: activity
    directory: 'team'
    pattern: '*.md'
```

## Usage

### Basic Usage

```bash
# Generate update for January 2026
kronologi team-update 2026 1
```

### With Custom Parameters

If your config supports it, you can pass team name and sprint:

```bash
# This depends on your parameter configuration
kronologi team-update 2026 1
```

### Dry Run

```bash
kronologi team-update 2026 1 --dry-run
```

## Customization

### 1. Add Sprint Parameter

Update config.yaml:

```yaml
parameters:
  year:
    type: number
    description: Year for the update
  month:
    type: number
    description: Month for the update (1-12)
  team:
    type: string
    default: "Engineering"
    description: Team name
  sprint:
    type: number
    description: Sprint number
    required: false
```

### 2. Customize the Persona

Edit `persona.md` for your team's voice:

```markdown
You are the team lead for the {{parameters.team}} team.

## Your Role
- Keep the team informed and aligned
- Celebrate wins and acknowledge challenges
- Maintain transparency and trust
- Foster collaboration and communication

## Your Tone
- Friendly and approachable
- Honest about challenges
- Enthusiastic about successes
- Supportive and encouraging
```

### 3. Modify the Output Format

Edit `instructions.md` to match your team's needs:

```markdown
## Output Format

# {{parameters.team}} Team Update - {{parameters.month}}/{{parameters.year}}

## 🎯 Sprint Goals
- [Goal 1]: [Status]
- [Goal 2]: [Status]

## ✅ Completed This Week
- [Item 1]
- [Item 2]

## 🚧 In Progress
- [Item 1]
- [Item 2]

## 🚫 Blockers
- [Blocker 1]: [Action needed]

## 📊 Metrics
- [Metric 1]: [Value]
- [Metric 2]: [Value]

## 👏 Shout-outs
- [Recognition 1]
- [Recognition 2]

## 🔮 Next Week
- [Priority 1]
- [Priority 2]
```

### 4. Add Team Context

Create context files:

```
context/
  team/
    members.md          # Team roster and roles
    goals.md            # Quarterly/annual goals
    processes.md        # Team processes and workflows
```

## Tips

1. **Consistent Structure**: Use the same activity file structure each period
2. **Regular Cadence**: Generate updates on a consistent schedule
3. **Team Input**: Collect input from team members before generating
4. **Metrics**: Include quantitative data when available
5. **Action Items**: Clearly identify blockers and needed actions

## Example Activity Files

### team-activities.md
```markdown
# Team Activities - January 2026

## Development
- Completed user authentication feature
- Refactored database layer
- Implemented new API endpoints

## Testing
- Automated test coverage increased to 85%
- Fixed 12 critical bugs
- Completed security audit

## Deployment
- Deployed v2.1.0 to production
- Migrated 50% of users to new infrastructure
```

### blockers.md
```markdown
# Blockers - January 2026

## Critical
- Waiting on API keys from vendor (3 days)
- Database migration blocked by infrastructure team

## Medium
- Design review pending for new feature
- Need clarification on requirements for project X
```

### wins.md
```markdown
# Wins - January 2026

## Team
- Zero production incidents this month!
- Completed sprint 2 weeks ahead of schedule
- New team member onboarded successfully

## Individual
- Sarah: Led successful customer demo
- Mike: Resolved long-standing performance issue
- Alex: Mentored 3 junior developers
```

## Automation

### Weekly Team Update

```bash
#!/bin/bash
# scripts/weekly-team-update.sh

YEAR=$(date +%Y)
MONTH=$(date +%-m)

echo "Generating team update for $YEAR-$MONTH..."
kronologi team-update $YEAR $MONTH

# Send to team chat (example with Slack)
SUMMARY=$(cat "summary/$YEAR/$MONTH/summary.md")
curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"$SUMMARY\"}" \
  $SLACK_WEBHOOK_URL
```

### Integration with Project Management

```python
# scripts/generate-team-update.py
import subprocess
import json
from datetime import datetime

# Generate update
year = datetime.now().year
month = datetime.now().month
subprocess.run(['kronologi', 'team-update', str(year), str(month)])

# Read output
with open(f'summary/{year}/{month}/summary.md') as f:
    summary = f.read()

# Post to project management tool
# (implementation depends on your tool)
```

## Troubleshooting

### Updates are too generic

- Add more specific activity files
- Include team context with goals and processes
- Provide examples in instructions.md

### Missing important information

- Check that all activity files are in the correct directory
- Verify file patterns match your naming convention
- Ensure team context files are properly referenced

### Tone doesn't match team culture

- Customize the persona.md to reflect your team's voice
- Provide examples of preferred language style
- Adjust temperature setting (lower = more consistent, higher = more creative)

## Best Practices

1. **Collect Input**: Have team members contribute to activity files
2. **Review Before Sharing**: Always review AI-generated updates
3. **Add Personal Touch**: Include team-specific jokes, references, or traditions
4. **Track Trends**: Compare updates over time to identify patterns
5. **Action Items**: Always include clear next steps and owners

## Next Steps

After creating your job:

1. **Create Context Files**: Add team information to context directory
2. **Define Structure**: Establish a consistent activity file structure
3. **Test Generation**: Run with --dry-run to preview
4. **Customize Format**: Adjust to match your team's preferences
5. **Establish Cadence**: Set up regular generation schedule
6. **Gather Feedback**: Get team input on format and content

## Related Templates

- **weekly-summary**: For personal weekly reviews
- **monthly-summary**: For general monthly summaries
- **release-notes**: For product release communications

## Learn More

- [Configuration Guide](../../../guide/configuration.md)
- [Jobs Guide](../../../guide/jobs.md)
- [Prompts Guide](../../../guide/prompts.md)
