import { createSlice } from '@reduxjs/toolkit';

/** @typedef {'dark' | 'light' | 'system'} ThemeMode */
/** @typedef {'dark' | 'light'} ResolvedTheme */

const readStoredMode = () => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

const readSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const readCurrentApplied = () => {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
};

const initialMode = readStoredMode();
const initialResolved = initialMode === 'system' ? readSystemTheme() : initialMode;

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    /** @type {ThemeMode} */
    mode: initialMode,
    /** @type {ResolvedTheme} */
    resolved: readCurrentApplied() || initialResolved,
  },
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
      state.resolved = action.payload === 'system' ? readSystemTheme() : action.payload;
    },
    setResolved: (state, action) => {
      state.resolved = action.payload;
    },
    toggleMode: (state) => {
      const next = state.resolved === 'dark' ? 'light' : 'dark';
      state.mode = next;
      state.resolved = next;
    },
  },
});

export const { setMode, setResolved, toggleMode } = themeSlice.actions;
export default themeSlice.reducer;
