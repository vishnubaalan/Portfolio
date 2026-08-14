/**
 * The chat's behaviour in one place: sending, streaming, stopping, retrying,
 * quota sync and the degradation ladder.
 *
 * Degradation ladder — the panel must never become a dead box in front of a
 * recruiter. Key missing → API error → quota exhausted → offline all land on
 * the same place: a keyword-matched FAQ answer plus a way to email Vishnu.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  addMessage,
  appendDelta,
  clearChat,
  finishMessage,
  nextId,
  setDegraded,
  setError,
  setQuota,
  setStatus,
} from '../store/slices/chatSlice';
import { fetchQuota, streamChat } from '../services/aiChatService';
import { FAQ_MISS, matchFaq } from '../data/ai/faq';
import { clearHistory, saveHistory, saveQuota } from '../utils/chatStorage';

/** Sent to the model; longer threads cost tokens without improving answers. */
const HISTORY_TURNS = 8;
export const MAX_INPUT_CHARS = 500;

export function useAIChat() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) => s.chat.messages);
  const status = useAppSelector((s) => s.chat.status);
  const error = useAppSelector((s) => s.chat.error);
  const quota = useAppSelector((s) => s.chat.quota);
  const degraded = useAppSelector((s) => s.chat.degraded);
  const open = useAppSelector((s) => s.chat.open);

  const abortRef = useRef(null);
  // Mirrored so `send` can read the latest thread without being re-created on
  // every streamed token.
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* Persist the thread so a refresh doesn't lose it. */
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (quota.synced) saveQuota(quota);
  }, [quota]);

  /* Sync the real remaining count once, when the panel first opens. */
  useEffect(() => {
    if (!open || quota.synced) return undefined;
    const controller = new AbortController();

    fetchQuota(controller.signal)
      .then((q) => dispatch(setQuota(q)))
      .catch((err) => {
        if (err?.name !== 'AbortError') dispatch(setQuota({ remaining: quota.remaining }));
      });

    return () => controller.abort();
  }, [open, quota.synced, quota.remaining, dispatch]);

  /** Answer locally — used by every rung of the degradation ladder. */
  const answerFromFaq = useCallback(
    (question, note) => {
      const hit = matchFaq(question);
      const body = hit ? hit.a : FAQ_MISS;
      dispatch(
        addMessage({
          role: 'assistant',
          content: note ? `${note}\n\n${body}` : body,
          source: 'faq',
        }),
      );
      dispatch(setStatus('idle'));
    },
    [dispatch],
  );

  const send = useCallback(
    async (rawText) => {
      const text = String(rawText || '').trim().slice(0, MAX_INPUT_CHARS);
      if (!text || status === 'streaming') return;

      dispatch(addMessage({ role: 'user', content: text }));

      // Out of questions, or no backend at all — answer offline, spend nothing.
      if (quota.remaining === 0) {
        answerFromFaq(text);
        return;
      }
      if (degraded) {
        answerFromFaq(text);
        return;
      }

      const replyId = nextId();
      dispatch(setStatus('streaming'));
      dispatch(addMessage({ id: replyId, role: 'assistant', content: '', streaming: true }));

      const history = [...messagesRef.current, { role: 'user', content: text }]
        .filter((m) => !m.error && m.content)
        .slice(-HISTORY_TURNS)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          messages: history,
          signal: controller.signal,
          onQuota: (q) => dispatch(setQuota(q)),
          onDelta: (delta) => dispatch(appendDelta({ id: replyId, delta })),
        });
        dispatch(finishMessage({ id: replyId, source: 'ai' }));
        dispatch(setStatus('idle'));
        // No local decrement here: the response's X-Chat-Remaining header already
        // carried the post-charge count through onQuota. Doing both double-counts.
      } catch (err) {
        if (err?.name === 'AbortError') {
          // Keep whatever streamed in before the stop.
          dispatch(finishMessage({ id: replyId, source: 'ai' }));
          dispatch(setStatus('idle'));
          return;
        }

        dispatch(finishMessage({ id: replyId, content: '', error: true }));

        switch (err.code) {
          case 'quota_exceeded':
            dispatch(setQuota({ remaining: 0, resetsAt: err.resetsAt || quota.resetsAt }));
            answerFromFaq(text);
            break;
          case 'not_configured':
            // No key at all — latch into offline mode for the session.
            dispatch(setDegraded(true));
            answerFromFaq(text, "I'm running offline right now, so here's the short version:");
            break;
          case 'busy':
            // Transient upstream rate limit. Answer this one from the FAQ, but
            // don't write off the rest of the session.
            answerFromFaq(text, "I'm getting a lot of questions right now — here's the short version:");
            break;
          case 'offline':
            dispatch(setError({ code: 'offline', message: "Can't reach the server right now." }));
            break;
          default:
            dispatch(
              setError({ code: err.code || 'unknown', message: 'Something broke on my end.' }),
            );
        }
      } finally {
        abortRef.current = null;
      }
    },
    [answerFromFaq, degraded, dispatch, quota.remaining, quota.resetsAt, status],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** Re-send the last question. A failed attempt never cost a question. */
  const retry = useCallback(() => {
    const lastUser = [...messagesRef.current].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    dispatch(setStatus('idle'));
    send(lastUser.content);
  }, [dispatch, send]);

  const reset = useCallback(() => {
    dispatch(clearChat());
    clearHistory();
  }, [dispatch]);

  return { messages, status, error, quota, degraded, send, stop, retry, reset };
}
