import { createSlice } from '@reduxjs/toolkit';

/** @typedef {'idle' | 'sending' | 'success' | 'error'} ContactStatus */

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    /** @type {ContactStatus} */
    status: 'idle',
    /** @type {string | null} */
    error: null,
  },
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
      if (action.payload !== 'error') state.error = null;
    },
    setError: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },
    reset: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setStatus, setError, reset } = contactSlice.actions;
export default contactSlice.reducer;
