import { useCallback, useEffect, useRef, useState } from 'react';

import { AssistantError, fetchVisitGuide, streamAssistantReply } from '../services/assistantApi';
import type { AssistantContext, AssistantErrorCode, ChatMessage, VisitGuide } from '../types/assistant';

// must match MAX_HISTORY_MESSAGES / MAX_MESSAGE_LENGTH in the backend DTO
const MAX_HISTORY_MESSAGES = 20;
export const MAX_QUESTION_LENGTH = 1000;

type ChatStatus = 'idle' | 'waiting' | 'answering';
type AnswerUpdate = (update: (message: ChatMessage) => ChatMessage) => void;

let nextId = 0;
const createId = () => `${Date.now()}-${nextId++}`;

// text version of a guide, sent as history so follow-up questions know what was shown
function guideToText(guide: VisitGuide): string {
  const steps = guide.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  return `Documents needed: ${guide.documents.join(', ') || 'none'}\nSteps:\n${steps}`;
}

export function useAssistantChat(context: AssistantContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<AssistantErrorCode | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // stop the running answer when the screen goes away
  useEffect(() => () => abortRef.current?.abort(), []);

  // shared flow for every question: show it, wait for the answer, handle errors
  const runTurn = useCallback(
    async (
      text: string,
      produceAnswer: (history: Pick<ChatMessage, 'role' | 'content'>[], signal: AbortSignal, update: AnswerUpdate) => Promise<void>,
    ) => {
      const question = text.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!question || status !== 'idle') return;

      const userMessage: ChatMessage = { id: createId(), role: 'user', content: question };
      const answerId = createId();
      // only the latest messages are sent, older ones stay on screen
      const history = [...messages, userMessage]
        .filter((message) => message.content.length > 0)
        .slice(-MAX_HISTORY_MESSAGES)
        .map(({ role, content }) => ({ role, content }));

      setMessages((prev) => [...prev, userMessage, { id: answerId, role: 'assistant', content: '' }]);
      setError(null);
      setStatus('waiting');

      const abort = new AbortController();
      abortRef.current = abort;

      const update: AnswerUpdate = (change) =>
        setMessages((prev) => prev.map((message) => (message.id === answerId ? change(message) : message)));

      try {
        await produceAnswer(history, abort.signal, update);
      } catch (caught) {
        if (!abort.signal.aborted) {
          setError(caught instanceof AssistantError ? caught.code : 'unavailable');
        }
        // drop the answer bubble if nothing arrived, keep a partial answer
        setMessages((prev) => prev.filter((message) => message.id !== answerId || message.content.length > 0));
      } finally {
        if (abortRef.current === abort) abortRef.current = null;
        setStatus('idle');
      }
    },
    [messages, status],
  );

  // typed question: the answer streams in as text
  const send = useCallback(
    (text: string) =>
      runTurn(text, (history, signal, update) =>
        streamAssistantReply({
          context,
          messages: history,
          signal,
          onText: (piece) => {
            setStatus('answering');
            update((message) => ({ ...message, content: message.content + piece }));
          },
        }),
      ),
    [context, runTurn],
  );

  // suggestion card: the answer is a guide with documents + steps
  const askGuide = useCallback(
    (topic: string) =>
      runTurn(topic, async (_history, signal, update) => {
        const guide = await fetchVisitGuide(context, topic, signal);
        update((message) => ({ ...message, guide, content: guideToText(guide) }));
      }),
    [context, runTurn],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, status, busy: status !== 'idle', error, send, askGuide, stop, reset };
}
