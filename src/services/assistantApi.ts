import type {
  AssistantContext,
  AssistantErrorCode,
  AssistantStreamEvent,
  ChatMessage,
  VisitGuide,
} from '../types/assistant';
import { ApiError, apiFetch } from './apiClient';

export class AssistantError extends Error {
  constructor(public readonly code: AssistantErrorCode) {
    super(code);
  }
}

const KNOWN_CODES: AssistantErrorCode[] = ['not_configured', 'rate_limited', 'unavailable', 'network'];

// POST to our backend (with the login token); failures become AssistantError
async function post(path: string, body: unknown, signal: AbortSignal) {
  try {
    return await apiFetch(path, { method: 'POST', body, signal });
  } catch (error) {
    if (error instanceof ApiError) {
      const code = error.code as AssistantErrorCode;
      throw new AssistantError(KNOWN_CODES.includes(code) ? code : 'unavailable');
    }
    throw error;
  }
}

// Asks for the "Documents needed" + "Step-by-step" guide for a tapped suggestion card.
export async function fetchVisitGuide(context: AssistantContext, topic: string, signal: AbortSignal) {
  const response = await post('/assistant/guide', { context, topic }, signal);
  return (await response.json()) as VisitGuide;
}

type StreamReplyOptions = {
  context: AssistantContext;
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  signal: AbortSignal;
  onText: (text: string) => void;
};

// Sends the conversation to our backend and calls onText for every piece of the answer.
// Resolves when the answer is complete, throws AssistantError when something goes wrong.
export async function streamAssistantReply({ context, messages, signal, onText }: StreamReplyOptions) {
  const response = await post('/assistant/chat', { context, messages }, signal);
  if (!response.body) throw new AssistantError('unavailable');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // the body arrives in chunks that don't line up with lines, so keep the unfinished part
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as AssistantStreamEvent;

      if (event.type === 'text') onText(event.text);
      else if (event.type === 'error') throw new AssistantError(event.code);
      else if (event.type === 'done') return;
    }
  }

  // stream ended without "done": the connection broke mid-answer
  throw new AssistantError('network');
}
