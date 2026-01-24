/**
 * Kronologi MCP Tools
 *
 * Tool definitions for report generation and management.
 */

import { z } from 'zod';
import { runModel } from '../run';
import { JobConfig, KronologiConfig, AnalysisConfig } from '../types';
import * as fs from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';

// ============================================================================
// Tool Definitions (MCP Schema)
// ============================================================================

export const tools = [
    {
        name: 'generate_report',
        description: 'Generate a Kronologi report for a specific job, year, and month',
        inputSchema: {
            type: 'object',
            properties: {
                job: {
                    type: 'string',
                    description: 'Job name (e.g., "monthly-summary")',
                },
                year: {
                    type: 'number',
                    description: 'Year for the report',
                },
                month: {
                    type: 'number',
                    description: 'Month for the report (1-12)',
                },
                historyMonths: {
                    type: 'number',
                    description: 'Number of months of history to include',
                },
                summaryMonths: {
                    type: 'number',
                    description: 'Number of months of summaries to include',
                },
                replace: {
                    type: 'boolean',
                    description: 'Whether to replace existing report',
                },
            },
            required: ['job', 'year', 'month'],
        },
    },
    {
        name: 'list_jobs',
        description: 'List all available Kronologi jobs',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_report',
        description: 'Get an existing report by job, year, and month',
        inputSchema: {
            type: 'object',
            properties: {
                job: {
                    type: 'string',
                    description: 'Job name',
                },
                year: {
                    type: 'number',
                    description: 'Year of the report',
                },
                month: {
                    type: 'number',
                    description: 'Month of the report (1-12)',
                },
            },
            required: ['job', 'year', 'month'],
        },
    },
    {
        name: 'list_reports',
        description: 'List available reports, optionally filtered by job and date range',
        inputSchema: {
            type: 'object',
            properties: {
                job: {
                    type: 'string',
                    description: 'Filter by job name (optional)',
                },
            },
        },
    },
];

// ============================================================================
// Tool Handlers
// ============================================================================

const GenerateReportInputSchema = z.object({
    job: z.string(),
    year: z.number(),
    month: z.number(),
    historyMonths: z.number().optional().default(3),
    summaryMonths: z.number().optional().default(1),
    replace: z.boolean().optional().default(false),
});

const GetReportInputSchema = z.object({
    job: z.string(),
    year: z.number(),
    month: z.number(),
});

const ListReportsInputSchema = z.object({
    job: z.string().optional(),
});

/**
 * Load Kronologi configuration from environment/defaults
 */
function getKronologiConfig(): KronologiConfig {
    // This would normally come from config loader, but for MCP we use defaults
    const homeDir = process.env.HOME || '';
    const kronologiDir = process.env.KRONOLOGI_DIR || join(homeDir, '.kronologi');

    return {
        dryRun: false,
        verbose: false,
        debug: false,
        timezone: 'America/New_York',
        model: 'gpt-4o',
        contextDirectory: join(kronologiDir, 'context'),
        activityDirectory: join(kronologiDir, 'activity'),
        summaryDirectory: join(kronologiDir, 'summary'),
        replace: false,
    } as KronologiConfig;
}

/**
 * Load job configuration
 */
async function loadJobConfig(jobName: string): Promise<AnalysisConfig> {
    const config = getKronologiConfig();
    const jobPath = join(config.contextDirectory, jobName, 'analysis.yml');

    // Read and parse job config
    await fs.readFile(jobPath, 'utf-8');
    // Simple YAML-like parsing (would use proper YAML parser in production)
    const jobConfig: any = {
        name: jobName,
        model: 'gpt-4o',
        temperature: 0.7,
        maxCompletionTokens: 4000,
        parameters: {},
        context: {},
        content: {},
        output: {},
    };

    return jobConfig as AnalysisConfig;
}

/**
 * Handle generate_report tool call
 */
async function handleGenerateReport(args: any) {
    const input = GenerateReportInputSchema.parse(args);

    const kronologiConfig = getKronologiConfig();
    const analysisConfig = await loadJobConfig(input.job);

    const jobConfig: JobConfig = {
        job: input.job,
        year: input.year,
        month: input.month,
        historyMonths: input.historyMonths,
        summaryMonths: input.summaryMonths,
    };

    const result = await runModel(analysisConfig, kronologiConfig, jobConfig);

    return {
        success: true,
        job: input.job,
        year: input.year,
        month: input.month,
        summary: result.aiSummary,
        usage: result.aiUsage,
    };
}

/**
 * Handle list_jobs tool call
 */
async function handleListJobs() {
    const config = getKronologiConfig();
    const contextDir = config.contextDirectory;

    const entries = await fs.readdir(contextDir, { withFileTypes: true });
    const jobs = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .filter((name) => !name.startsWith('.'));

    return {
        success: true,
        jobs,
        count: jobs.length,
    };
}

/**
 * Handle get_report tool call
 */
async function handleGetReport(args: any) {
    const input = GetReportInputSchema.parse(args);
    const config = getKronologiConfig();

    const yearMonth = `${input.year}-${String(input.month).padStart(2, '0')}`;
    const reportPath = join(config.summaryDirectory, input.job, yearMonth, 'summary.md');

    try {
        const content = await fs.readFile(reportPath, 'utf-8');
        return {
            success: true,
            job: input.job,
            year: input.year,
            month: input.month,
            content,
        };
    } catch {
        return {
            success: false,
            error: `Report not found: ${reportPath}`,
        };
    }
}

/**
 * Handle list_reports tool call
 */
async function handleListReports(args: any) {
    const input = ListReportsInputSchema.parse(args);
    const config = getKronologiConfig();

    const summaryDir = config.summaryDirectory;
    const pattern = input.job
        ? join(summaryDir, input.job, '*', 'summary.md')
        : join(summaryDir, '*', '*', 'summary.md');

    const files = await glob(pattern);

    const reports = files.map((file) => {
        const parts = file.split('/');
        const yearMonth = parts[parts.length - 2];
        const job = parts[parts.length - 3];
        const [year, month] = yearMonth.split('-');

        return {
            job,
            year: parseInt(year),
            month: parseInt(month),
            path: file,
        };
    });

    return {
        success: true,
        reports,
        count: reports.length,
    };
}

/**
 * Main tool call handler
 */
export async function handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
        case 'generate_report':
            return handleGenerateReport(args);
        case 'list_jobs':
            return handleListJobs();
        case 'get_report':
            return handleGetReport(args);
        case 'list_reports':
            return handleListReports(args);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
