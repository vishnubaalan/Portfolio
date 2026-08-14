import { createSlice } from '@reduxjs/toolkit';
import { loadFlags, loadHistory, loadQuota } from '../../utils/chatStorage';

const DEFAULT_LIMIT = 10;

let seq = 0;
export const nextId = () => `m${Date.now().toString(36)}${(seq += 1)}`;

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    open: false,
    /** @type {Array<{id:string, role:'user'|'assistant', content:string, streaming?:boolean, error?:boolean, source?:'ai'|'faq'}>} */
    messages: loadHistory(),
    /** idle | streaming | error */
    status: 'idle',
    /** @type {{code:string, message:string}|null} */
    error: null,
    quota: { ...loadQuota(DEFAULT_LIMIT), synced: false },
    /** true once the API is known to be unavailable — answers come from the FAQ */
    degraded: false,
    flags: loadFlags(),
    /** question queued by a chip/CTA, sent as soon as the panel mounts */
    pendingPrompt: null,
  },
  reducers: {
    setChatOpen: (state, action) => {
      state.open = action.payload;
      if (!action.payload) state.pendingPrompt = null;
    },
    toggleChat: (state) => {
      state.open = !state.open;
    },
    /** Open the panel with a question already queued. */
    askAI: (state, action) => {
      state.open = true;
      state.pendingPrompt = action.payload || null;
    },
    consumePendingPrompt: (state) => {
      state.pendingPrompt = null;
    },
    addMessage: {
      reducer: (state, action) => {
        state.messages.push(action.payload);
      },
      prepare: (message) => ({ payload: { id: nextId(), ...message } }),
    },
    appendDelta: (state, action) => {
      const message = state.messages.find((m) => m.id === action.payload.id);
      if (message) message.content += action.payload.delta;
    },
    finishMessage: (state, action) => {
      const message = state.messages.find((m) => m.id === action.payload.id);
      if (message) {
        message.streaming = false;
        if (action.payload.content !== undefined) message.content = action.payload.content;
        if (action.payload.error) message.error = true;
        if (action.payload.source) message.source = action.payload.source;
      }
    },
    dropMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    setStatus: (state, action) => {
      state.status = action.payload;
      if (action.payload !== 'error') state.error = null;
    },
    setError: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },
    setQuota: (state, action) => {
      state.quota = { ...state.quota, ...action.payload, synced: true };
    },
    setDegraded: (state, action) => {
      state.degraded = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.status = 'idle';
      state.error = null;
    },
    dismissDisclosure: (state) => {
      state.flags.disclosureDismissed = true;
    },
    markHintShown: (state) => {
      state.flags.hintShown = true;
    },
  },
});

export const {
  setChatOpen,
  toggleChat,
  askAI,
  consumePendingPrompt,
  addMessage,
  appendDelta,
  finishMessage,
  dropMessage,
  setStatus,
  setError,
  setQuota,
  setDegraded,
  clearChat,
  dismissDisclosure,
  markHintShown,
} = chatSlice.actions;

export default chatSlice.reducer;
