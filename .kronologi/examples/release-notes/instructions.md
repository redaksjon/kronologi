Generate comprehensive release notes for {{parameters.month}}/{{parameters.year}}{{#parameters.version}} (Version {{parameters.version}}){{/parameters.version}}.

## Output Format

# Release Notes{{#parameters.version}} - Version {{parameters.version}}{{/parameters.version}}

**Release Date**: {{parameters.month}}/{{parameters.year}}

## 🌟 Highlights

List 3-5 most significant changes or features. Each highlight should:
- Be a complete sentence explaining the change
- Focus on user impact and value
- Include specific version numbers or identifiers where relevant

Example:
- **New API endpoint for batch processing**: Developers can now process up to 100 items in a single request, reducing latency by up to 80%.

## ✨ New Features

Detailed description of new capabilities added in this release. For each feature:
- Provide a clear title
- Explain what it does and why it's useful
- Include code examples or usage patterns if applicable
- Note any prerequisites or related changes

## 🔧 Improvements

Enhancements to existing features. For each improvement:
- Describe what changed
- Quantify the improvement where possible (performance gains, reduced errors, etc.)
- Explain user benefit

## 🐛 Bug Fixes

Important bugs that were resolved. For each fix:
- Describe the issue that was fixed
- Note any symptoms users may have experienced
- Reference issue numbers if available

## ⚠️ Breaking Changes

**CRITICAL**: Changes that require user action or may break existing implementations.

For each breaking change:
- Clearly state what changed
- Explain the impact on existing code
- Provide migration steps or workarounds
- Include before/after code examples

## 📚 Documentation Updates

Significant documentation improvements or additions.

## 🙏 Contributors

Acknowledge contributors if applicable.

---

## Guidelines

### Content Requirements
- **Be specific**: Include version numbers, dates, metrics, and concrete examples
- **Show impact**: Explain how each change benefits users
- **Link liberally**: Reference documentation, issues, and pull requests
- **Quantify improvements**: Use metrics (performance gains, error reductions, etc.)
- **Code examples**: Include short, clear code snippets for complex changes

### Formatting Standards
- Use emoji sparingly - only for section headers as shown
- Keep bullet points concise (1-2 sentences)
- Use **bold** for feature/change names
- Use `code formatting` for technical terms, commands, and code
- Separate breaking changes section if there are ANY breaking changes

### Tone Guidelines
- Professional but accessible
- Technical accuracy is paramount
- User-focused language ("you can now..." vs "we added...")
- Avoid marketing speak or hyperbole
- Be honest about limitations or known issues

### Quality Checklist
Before finalizing, ensure:
- [ ] All version numbers are correct and consistent
- [ ] Breaking changes are clearly marked and explained
- [ ] Migration steps are provided for breaking changes
- [ ] Code examples are tested and accurate
- [ ] Links to documentation are valid
- [ ] Dates are accurate
- [ ] Content is organized from most to least important
