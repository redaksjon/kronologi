import React from 'react'

function App() {
    return (
        <div className="site">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-glow"></div>
                <div className="hero-content">
                    <div className="badge">Intelligent Reporting with AI Reasoning</div>
                    <h1 className="title">Kronologi</h1>
                    <p className="tagline">
                        Transform your activity and context into comprehensive reports for any timeperiod.
                        <br />
                        <span className="highlight">AI-powered reports with agentic exploration, tool use, and seamless assistant integration.</span>
                    </p>
                    <div className="hero-actions">
                        <a href="https://www.npmjs.com/package/@redaksjon/kronologi" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                            npm install -g @redaksjon/kronologi
                        </a>
                        <a href="https://github.com/redaksjon/kronologi" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </header>

            {/* Problem Statement */}
            <section className="problem-section">
                <div className="container">
                    <h2 className="section-title">The Documentation Challenge</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">1</div>
                            <h3>Scattered Context</h3>
                            <p>Work activities spread across tools<br/>Context lost in time</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">2</div>
                            <h3>Manual Summaries</h3>
                            <p>Hours spent writing release notes<br/>Trying to remember what happened</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">3</div>
                            <h3>Inconsistent Format</h3>
                            <p>Each summary looks different<br/>Missing important details</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Before/After Demo */}
            <section className="demo-section">
                <div className="container">
                    <h2 className="section-title">Automated Intelligence</h2>
                    <div className="demo-grid">
                        <div className="demo-card demo-before">
                            <div className="demo-label">Manual Process</div>
                            <div className="demo-content">
                                <p className="demo-text">
                                    "Let me check git logs... what did we do last month?
                                    Need to read through 50 commits, check Jira, Slack...
                                    This will take hours to write up."
                                </p>
                            </div>
                        </div>
                        <div className="demo-arrow">→</div>
                        <div className="demo-card demo-after">
                            <div className="demo-label">Kronologi Generated</div>
                            <div className="demo-content">
                                <p className="demo-text">
                                    <span className="corrected">January 2024 Report</span>
                                    <br/><br/>
                                    <span className="corrected">Key Achievements:</span>
                                    - Launched authentication system overhaul
                                    - Migrated to microservices architecture
                                    - Improved API response time by 40%
                                    <br/><br/>
                                    <span className="corrected">Generated in 30 seconds from 3 weeks of activity</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modes Section */}
            <section className="modes-section">
                <div className="container">
                    <h2 className="section-title">Two Powerful Modes</h2>
                    <div className="modes-grid">
                        <div className="mode-card">
                            <h3>Traditional Mode</h3>
                            <p className="mode-description">AI receives all content upfront and generates reports in a single pass.</p>
                            <div className="mode-features">
                                <div className="mode-feature">✓ Fast and predictable</div>
                                <div className="mode-feature">✓ Works with any OpenAI model</div>
                                <div className="mode-feature">✓ Simple configuration</div>
                                <div className="mode-feature">✓ Perfect for smaller datasets</div>
                            </div>
                            <div className="mode-code-block">
                                <code>kronologi --job my-job --year 2026 --month 1</code>
                            </div>
                        </div>
                        <div className="mode-card mode-highlight">
                            <div className="mode-badge">NEW</div>
                            <h3>Reasoning Mode</h3>
                            <p className="mode-description">AI actively explores files, searches for context, and makes intelligent decisions.</p>
                            <div className="mode-features">
                                <div className="mode-feature">✓ Better token efficiency</div>
                                <div className="mode-feature">✓ Intelligent content selection</div>
                                <div className="mode-feature">✓ Dynamic file exploration</div>
                                <div className="mode-feature">✓ Perfect for large datasets</div>
                            </div>
                            <div className="mode-code-block">
                                <pre>{`# In analysis.yml
reasoning:
  enabled: true
  provider: anthropic`}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-number">1</div>
                            <h3>🤖 Agentic AI</h3>
                            <p>Reasoning mode enables AI to actively explore files, search for context, and make intelligent decisions about what to include.</p>
                            <div className="feature-code">
                                <code>reasoning: enabled: true</code>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">2</div>
                            <h3>🔌 AI Assistant Integration</h3>
                            <p>Built-in MCP server works seamlessly with Claude Desktop, Cline, and other AI assistants—generate reports directly from chat.</p>
                            <div className="feature-code">
                                <code>kronologi-mcp</code>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">3</div>
                            <h3>🎯 Multiple AI Providers</h3>
                            <p>Choose from OpenAI (GPT-4o, o1) or Anthropic (Claude Sonnet, Opus) models based on your needs and budget.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">4</div>
                            <h3>⚡ Interactive Setup</h3>
                            <p>Create new jobs with guided templates and validate configurations before generating reports.</p>
                            <div className="feature-code">
                                <code>kronologi-init</code>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">5</div>
                            <h3>📊 Flexible Jobs</h3>
                            <p>Define custom report types with configurable parameters, context sources, and output formats for any timeperiod.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">6</div>
                            <h3>🔍 Smart Context</h3>
                            <p>Automatically includes relevant historical summaries and static context with intelligent token management.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Configuration Section */}
            <section className="context-section">
                <div className="container">
                    <div className="context-header">
                        <h2 className="section-title">Flexible Configuration</h2>
                        <p className="section-subtitle">
                            Configure Kronologi to match your workflow. Define custom report types, timeperiods, directories, and output formats.
                        </p>
                    </div>

                    <div className="config-example">
                        <div className="config-card">
                            <h3>Command Line</h3>
                            <div className="config-code">
                                <pre>{`# Create a new job from template
kronologi-init --template monthly-summary my-job

# Validate configuration
kronologi-validate my-job

# Generate report (new format)
kronologi --job my-job --year 2026 --month 1

# Generate with extended history
kronologi --job my-job --year 2026 --month 1 --history-months 3

# Start MCP server for AI assistants
kronologi-mcp`}</pre>
                            </div>
                        </div>
                        <div className="config-card">
                            <h3>Configuration (analysis.yml)</h3>
                            <div className="config-code">
                                <pre>{`name: monthly-summary
model: claude-sonnet-4
temperature: 0.7

# Enable agentic workflows
reasoning:
  enabled: true
  provider: anthropic
  maxIterations: 10
  tools:
    - read_file
    - list_files
    - search_files

content:
  activity:
    directory: "activity"
    pattern: "**/*.md"`}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="use-cases-section">
                <div className="container">
                    <h2 className="section-title">Perfect For</h2>
                    <div className="use-cases-grid">
                        <div className="use-case-card">
                            <h3>🚀 Release Notes</h3>
                            <p>Automatically generate comprehensive release notes from Git history and activity logs.</p>
                        </div>
                        <div className="use-case-card">
                            <h3>📊 Periodic Reports</h3>
                            <p>Create detailed weekly, monthly, or quarterly progress reports for stakeholders and team members.</p>
                        </div>
                        <div className="use-case-card">
                            <h3>📝 Change Logs</h3>
                            <p>Maintain accurate, well-formatted change logs for any timeperiod without manual effort.</p>
                        </div>
                        <div className="use-case-card">
                            <h3>🎯 Sprint Reviews</h3>
                            <p>Summarize sprint or iteration accomplishments with AI-powered context understanding.</p>
                        </div>
                        <div className="use-case-card">
                            <h3>🤖 AI Assistant Integration</h3>
                            <p>Use Kronologi directly from Claude Desktop or Cline—generate reports through natural conversation.</p>
                        </div>
                        <div className="use-case-card">
                            <h3>🔍 Large Dataset Analysis</h3>
                            <p>Let AI explore and discover insights from hundreds of activity files with reasoning mode.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MCP Integration */}
            <section className="mcp-section">
                <div className="container">
                    <h2 className="section-title">AI Assistant Integration</h2>
                    <p className="section-subtitle">
                        Kronologi includes a built-in Model Context Protocol (MCP) server, enabling seamless integration with AI assistants.
                    </p>
                    <div className="mcp-grid">
                        <div className="mcp-card">
                            <h3>🗣️ Natural Language</h3>
                            <p>Generate reports by chatting with Claude or other AI assistants—no command line needed.</p>
                            <div className="mcp-example">
                                <div className="mcp-message user-message">
                                    "Generate a monthly report for project-updates for January 2026"
                                </div>
                                <div className="mcp-message assistant-message">
                                    ✅ Report generated successfully! Here's a summary...
                                </div>
                            </div>
                        </div>
                        <div className="mcp-card">
                            <h3>⚙️ Simple Setup</h3>
                            <p>Add one entry to your Claude Desktop config and you're ready to go.</p>
                            <div className="mcp-code">
                                <pre>{`{
  "mcpServers": {
    "kronologi": {
      "command": "kronologi-mcp"
    }
  }
}`}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Installation */}
            <section className="install-section">
                <div className="container">
                    <h2 className="section-title">Get Started</h2>
                    <div className="install-steps">
                        <div className="install-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Install</h3>
                                <div className="code-block">
                                    <code>npm install -g @redaksjon/kronologi</code>
                                </div>
                            </div>
                        </div>
                        <div className="install-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Configure</h3>
                                <p>Set your AI provider API key</p>
                                <div className="code-block">
                                    <code>export OPENAI_API_KEY=sk-...</code>
                                    <code>export ANTHROPIC_API_KEY=sk-ant-...</code>
                                </div>
                            </div>
                        </div>
                        <div className="install-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Create Job</h3>
                                <div className="code-block">
                                    <code>kronologi-init --template monthly-summary my-job</code>
                                </div>
                            </div>
                        </div>
                        <div className="install-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Generate Report</h3>
                                <div className="code-block">
                                    <code>kronologi --job my-job --year 2026 --month 1</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Name Origin */}
            <section className="origin-section">
                <div className="container">
                    <div className="origin-content">
                        <h2 className="section-title">About the Name</h2>
                        <p className="origin-text">
                            <strong>Kronologi</strong> comes from the Norwegian word for "chronology" or "timeline",
                            reflecting its purpose of creating temporal reports and documentation of your work over customizable timeperiods.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-links">
                            <a href="https://github.com/redaksjon/kronologi" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a href="https://www.npmjs.com/package/@redaksjon/kronologi" target="_blank" rel="noopener noreferrer">npm</a>
                            <a href="https://github.com/redaksjon/kronologi/blob/main/README.md" target="_blank" rel="noopener noreferrer">Documentation</a>
                            <a href="https://github.com/redaksjon/kronologi/blob/main/guide/index.md" target="_blank" rel="noopener noreferrer">Guide</a>
                            <a href="https://github.com/redaksjon/kronologi/blob/main/MCP_GUIDE.md" target="_blank" rel="noopener noreferrer">MCP Guide</a>
                            <a href="https://github.com/redaksjon/kronologi/issues" target="_blank" rel="noopener noreferrer">Issues</a>
                        </div>
                        <div className="footer-copy">
                            <p>Open Source • Apache-2.0 License</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App
