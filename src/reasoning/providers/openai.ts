/**
 * OpenAI Provider
 *
 * Implements the Provider interface for OpenAI's API.
 * Wraps OpenAI SDK calls and normalizes responses.
 */

import { OpenAI } from 'openai';
import { Provider, ProviderConfig } from '../provider';
import { CompletionResponse, Message } from '../types';

export class OpenAIProvider implements Provider {
    private client: OpenAI;

    constructor(apiKey?: string) {
        this.client = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY
        });
    }

    async complete(
        messages: Message[],
        config: ProviderConfig
    ): Promise<CompletionResponse> {
        const response = await this.client.chat.completions.create({
            model: config.model,
            messages: messages as any,
            temperature: config.temperature,
            max_completion_tokens: config.maxTokens,
        });

        return {
            content: response.choices[0].message.content || '',
            usage: {
                inputTokens: response.usage?.prompt_tokens || 0,
                outputTokens: response.usage?.completion_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0,
            },
            model: response.model,
            stopReason: this.mapStopReason(response.choices[0].finish_reason),
        };
    }

    private mapStopReason(reason: string | null): 'end_turn' | 'max_tokens' | 'stop_sequence' {
        switch (reason) {
            case 'stop': return 'end_turn';
            case 'length': return 'max_tokens';
            default: return 'stop_sequence';
        }
    }
}
