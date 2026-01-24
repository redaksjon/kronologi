/**
 * Kronologi MCP Prompts
 *
 * Prompt definitions for common Kronologi workflows.
 * Prompts provide templates for AI assistants to use the tools effectively.
 */

/**
 * Available prompts
 */
export const prompts = [
    {
        name: 'generate-monthly-report',
        description: 'Generate a monthly report for a specific job',
        arguments: [
            {
                name: 'job',
                description: 'The job name',
                required: true,
            },
            {
                name: 'year',
                description: 'Year for the report',
                required: true,
            },
            {
                name: 'month',
                description: 'Month for the report (1-12)',
                required: true,
            },
        ],
    },
    {
        name: 'review-recent-reports',
        description: 'Review recent reports for a job to understand patterns and trends',
        arguments: [
            {
                name: 'job',
                description: 'The job name to review',
                required: true,
            },
        ],
    },
];

/**
 * Get prompt content
 */
export async function handleGetPrompt(name: string, args?: Record<string, string>) {
    switch (name) {
        case 'generate-monthly-report':
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Generate a monthly report using Kronologi:

1. Use the generate_report tool with:
   - job: ${args?.job || '{JOB_NAME}'}
   - year: ${args?.year || '{YEAR}'}
   - month: ${args?.month || '{MONTH}'}

2. Review the generated report and let me know if it completed successfully.

3. If there were any issues, check:
   - Is the job configured correctly? (use list_jobs to verify)
   - Do the activity files exist for this period?
   - Are there any error messages in the output?`,
                        },
                    },
                ],
            };

        case 'review-recent-reports':
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Review recent reports for the ${args?.job || '{JOB_NAME}'} job:

1. Use list_reports to see available reports for this job
2. Get the 3 most recent reports using get_report
3. Analyze the reports for:
   - Common themes or patterns
   - Changes over time
   - Any recurring issues or topics
4. Provide a summary of your findings`,
                        },
                    },
                ],
            };

        default:
            throw new Error(`Unknown prompt: ${name}`);
    }
}
