import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq, { RateLimitError } from 'groq-sdk';
import type { ChatCompletionCreateParamsBase } from 'groq-sdk/resources/chat/completions';

import {
  buildContextPrompt,
  GUIDE_INSTRUCTIONS,
  GUIDE_JSON_SCHEMA,
  MAX_GUIDE_ITEMS,
  MAX_REMINDERS,
  SUMMARY_INSTRUCTIONS,
  SUMMARY_JSON_SCHEMA,
  WALKSY_SYSTEM_PROMPT,
} from './assistant.prompt';
import type { AssistantErrorCode, VisitGuide, VisitSummary } from './assistant.types';
import type { AssistantContextDto, ChatRequestDto } from './dto/chat-request.dto';
import type { GuideRequestDto } from './dto/guide-request.dto';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'low';
const MAX_REPLY_TOKENS = 1500;

type ReasoningEffort = NonNullable<ChatCompletionCreateParamsBase['reasoning_effort']>;

class AssistantNotConfiguredError extends Error {}
class InvalidAnswerError extends Error {}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly client: Groq | null;
  private readonly model: string;
  private readonly reasoningEffort: ReasoningEffort;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GROQ_API_KEY');
    this.client = apiKey ? new Groq({ apiKey }) : null;
    this.model = config.get<string>('GROQ_MODEL') || DEFAULT_MODEL;
    this.reasoningEffort = config.get<ReasoningEffort>('GROQ_REASONING_EFFORT') || DEFAULT_REASONING_EFFORT;

    if (!this.client) this.logger.warn('GROQ_API_KEY is not set, the assistant is disabled');
  }

  async *streamReply(request: ChatRequestDto, signal: AbortSignal): AsyncGenerator<string> {
    if (!this.client) throw new AssistantNotConfiguredError();

    const stream = await this.client.chat.completions.create(
      {
        model: this.model,
        stream: true,
        temperature: 0.4, 
        max_completion_tokens: MAX_REPLY_TOKENS,
        reasoning_effort: this.reasoningEffort,
        include_reasoning: false, 
        messages: [{ role: 'system', content: this.systemPrompt(request.context) }, ...request.messages],
      },
      { signal },
    );

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }

  async createGuide(request: GuideRequestDto, signal?: AbortSignal): Promise<VisitGuide> {
    const data = await this.structuredAnswer(request.context, GUIDE_INSTRUCTIONS, request.topic, 'visit_guide', GUIDE_JSON_SCHEMA, signal);

    const guide = { documents: toTextList(data.documents, MAX_GUIDE_ITEMS), steps: toTextList(data.steps, MAX_GUIDE_ITEMS) };
    if (guide.steps.length === 0) throw new InvalidAnswerError('Guide has no steps');
    return guide;
  }

  async createSummary(context: AssistantContextDto, title: string, steps: string[], signal?: AbortSignal): Promise<VisitSummary> {
    const completedSteps = steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    const data = await this.structuredAnswer(
      context,
      SUMMARY_INSTRUCTIONS,
      `Visit: ${title}\nSteps they completed:\n${completedSteps}`,
      'visit_summary',
      SUMMARY_JSON_SCHEMA,
      signal,
    );

    const summary = typeof data.summary === 'string' ? data.summary.trim() : '';
    if (!summary) throw new InvalidAnswerError('Summary is empty');
    return { summary, reminders: toTextList(data.reminders, MAX_REMINDERS) };
  }

  toErrorCode(error: unknown): AssistantErrorCode {
    if (error instanceof AssistantNotConfiguredError) return 'not_configured';
    if (error instanceof RateLimitError) return 'rate_limited';

    this.logger.error('Assistant request failed', error instanceof Error ? error.stack : String(error));
    return 'unavailable';
  }

  private systemPrompt(context: AssistantContextDto): string {
    return `${WALKSY_SYSTEM_PROMPT}\n\n${buildContextPrompt(context)}`;
  }

  private async structuredAnswer(
    context: AssistantContextDto,
    instructions: string,
    userContent: string,
    schemaName: string,
    schema: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>> {
    if (!this.client) throw new AssistantNotConfiguredError();

    const completion = await this.client.chat.completions.create(
      {
        model: this.model,
        temperature: 0.3,
        max_completion_tokens: MAX_REPLY_TOKENS,
        reasoning_effort: this.reasoningEffort,
        include_reasoning: false,
        response_format: { type: 'json_schema', json_schema: { name: schemaName, schema, strict: true } },
        messages: [
          { role: 'system', content: `${this.systemPrompt(context)}\n\n${instructions}` },
          { role: 'user', content: userContent },
        ],
      },
      { signal },
    );

    try {
      const data: unknown = JSON.parse(completion.choices[0]?.message?.content ?? '');
      if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>;
    } catch {

    }
    throw new InvalidAnswerError(`${schemaName} is not a valid JSON object`);
  }
}

function toTextList(value: unknown, max: number): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, max)
    : [];
}
