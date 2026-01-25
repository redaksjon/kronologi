import * as Analysis from "./analysis/inputs";
import { JobConfig, KronologiConfig } from "./types";
import { AnalysisConfig } from "./types";
import { Message } from "./reasoning/types";
import { generateReport } from "./reasoning/reportGenerator";
import { ToolContext } from "./reasoning/tools/types";
import * as Storage from "./util/storage";
import { getLogger } from "./logging";

export const runModel = async (
    analysisConfig: AnalysisConfig,
    kronologiConfig: KronologiConfig,
    jobConfig: JobConfig,
    existingMonthlySummary?: any,
): Promise<{ aiSummary: string, aiUsage: any, monthlySummary: any }> => {
    // Build parameters based on whether this is a week or month-based job
    const params: Record<string, string | number | undefined> = {
        year: jobConfig.year,
    };

    if (jobConfig.week !== undefined) {
        params.week = jobConfig.week;
        params.historyWeeks = jobConfig.historyWeeks;
        params.summaryWeeks = jobConfig.summaryWeeks;
    } else {
        params.month = jobConfig.month;
        params.historyMonths = jobConfig.historyMonths;
        params.summaryMonths = jobConfig.summaryMonths;
    }

    const monthlySummary = existingMonthlySummary || await Analysis.createInputs(jobConfig.job, params, kronologiConfig, jobConfig);

    const messages: Message[] = monthlySummary.request.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
    }));

    // Always use reasoning mode with tools
    const toolContext: ToolContext = {
        storage: Storage.create({ log: getLogger().info }),
        config: kronologiConfig,
        job: jobConfig,
        logger: getLogger(),
    };

    const result = await generateReport(analysisConfig, messages, toolContext);

    return {
        aiSummary: result.content,
        aiUsage: {
            choices: [{
                message: { content: result.content },
                finish_reason: 'stop',
            }],
            usage: {
                prompt_tokens: result.usage.inputTokens,
                completion_tokens: result.usage.outputTokens,
                total_tokens: result.usage.totalTokens,
            },
            model: analysisConfig.model,
        },
        monthlySummary: {
            ...monthlySummary,
            toolCalls: result.toolCalls,
            iterations: result.iterations,
        }
    };
}