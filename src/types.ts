import { z } from "zod";
import * as Cardigantime from '@theunwalked/cardigantime';
import * as Dreadcabinet from '@theunwalked/dreadcabinet';
import { Request } from '@riotprompt/riotprompt';

export interface Args extends Dreadcabinet.Args, Cardigantime.Args {
    dryRun?: boolean;
    verbose?: boolean;
    debug?: boolean;
    model?: string;
    filenameOptions?: string[];
    contextDirectory?: string;
    activityDirectory?: string;
    summaryDirectory?: string;
    replace?: boolean;
}

export const KronologiConfigSchema = z.object({
    dryRun: z.boolean(),
    verbose: z.boolean(),
    debug: z.boolean(),
    timezone: z.string(),
    model: z.string(),
    contextDirectory: z.string(),
    activityDirectory: z.string(),
    summaryDirectory: z.string(),
    replace: z.boolean(),
});

export const JobConfigSchema = z.object({
    job: z.string(),
    year: z.number(),
    month: z.number().optional(),
    week: z.number().optional(),
    historyMonths: z.number().optional(),
    summaryMonths: z.number().optional(),
    historyWeeks: z.number().optional(),
    summaryWeeks: z.number().optional(),
    periodType: z.enum(['month', 'week']).optional(),
});

export type KronologiConfig = z.infer<typeof KronologiConfigSchema> & Dreadcabinet.Config & Cardigantime.Config;
export type JobConfig = z.infer<typeof JobConfigSchema>;

export interface ContextConfig {
    type: "history" | "static";
    name: string;
    include?: boolean;
}

export interface StaticContextConfig extends ContextConfig {
    type: "static";
    directory: string;
    pattern?: string;
}

export interface HistoryContextConfig extends ContextConfig {
    type: "history";
    name: string;
    from: string;
    months?: number | string;
    weeks?: number | string;
    include?: boolean;
}

export interface ContentConfig {
    type: "activity" | "summary";
    name: string;
    directory: string;
    pattern?: string;
}

export interface OutputConfig {
    type: "summary";
    format: "markdown";
    name: string;
    pattern: string;
}

export interface ReasoningConfigType {
    provider: 'anthropic' | 'openai';
    maxIterations?: number;
    tools?: string[];  // Tool names to enable
}

export interface AnalysisConfig {
    name: string;
    parameters: {
        [key: string]: {
            type: "string" | "number";
            default: string | number;
            description: string;
            required: boolean;
        }
    }
    temperature: number;
    maxCompletionTokens: number;
    model: string;
    reasoning: ReasoningConfigType;  // Required reasoning config
    context: {
        [key: string]: StaticContextConfig | HistoryContextConfig;
    };
    content: {
        [key: string]: ContentConfig;
    };
    output: {
        [key: string]: OutputConfig;
    };
}

export interface Inputs {
    config: AnalysisConfig;
    request: Request;
}

export interface Parameter {
    type: "string" | "number";
    value: string | number;
    description: string;
    required: boolean;
    default: string | number;
}

export interface Parameters {
    [key: string]: Parameter;
}

export interface FileContents {
    [fileName: string]: string;
}

// ============================================================================
// Tool-Based Content Source Types (Reasoning-Only Mode)
// ============================================================================

/**
 * Configuration for a content source that AI can access via tools
 */
export interface ContentSourceConfig {
    directory: string;
    description: string;  // Describes what content is available for the AI
    patterns?: string[];  // File patterns available
    monthsAvailable?: number;  // How far back history goes
    weeksAvailable?: number;  // How far back history goes (for week-based)
}

/**
 * Content sources configuration for reasoning-only mode
 * Describes what content is available and how to access it via tools
 */
export interface ContentSourcesConfig {
    activity?: ContentSourceConfig;
    history?: ContentSourceConfig;
    summaries?: ContentSourceConfig;
    context?: ContentSourceConfig;
}

/**
 * Extended AnalysisConfig with content sources for reasoning-only mode
 * TODO: In future phases, replace old content/context with contentSources
 */
export interface AnalysisConfigWithSources extends AnalysisConfig {
    contentSources?: ContentSourcesConfig;  // New tool-based content sources
} 