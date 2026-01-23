import React from 'react'

function App() {
    return (
        <div className="site">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-glow"></div>
                <div className="hero-content">
                    <div className="badge">Intelligent Reporting for Any Timeperiod</div>
                    <h1 className="title">Kronologi</h1>
                    <p className="tagline">
                        Transform your activity and context into comprehensive reports for any timeperiod.
                        <br />
                        <span className="highlight">AI-powered weekly, monthly, or custom-period summaries of your work.</span>
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

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-number">1</div>
                            <h3>Collect Activity</h3>
                            <p>Kronologi reads your activity files, Git history, and context from configured directories.</p>
                            <div className="feature-code">
                                <code>kronologi release-notes 2024 1</code>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">2</div>
                            <h3>AI Analysis</h3>
                            <p>OpenAI analyzes patterns, identifies key changes, and understands context across your chosen timeperiod with historical continuity.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">3</div>
                            <h3>Generate Report</h3>
                            <p>Produces structured, professional reports in your preferred format—weekly updates, monthly summaries, or custom periods.</p>
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
                            <h3>Command Line Options</h3>
                            <div className="config-code">
                                <pre>{`# Generate monthly release notes for January 2024
kronologi release-notes 2024 1

# Generate weekly update with 3 weeks of history
kronologi weekly-update 2024 1 3

# Custom directories and timezone
kronologi monthly-review 2024 1 \\
  --config-dir ./config \\
  --context-directory ./context \\
  --timezone America/New_York`}</pre>
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
                                <p>Set your OpenAI API key and configure directories</p>
                                <div className="code-block">
                                    <code>export OPENAI_API_KEY=your-key-here</code>
                                </div>
                            </div>
                        </div>
                        <div className="install-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Generate</h3>
                                <div className="code-block">
                                    <code>kronologi release-notes 2024 1</code>
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
