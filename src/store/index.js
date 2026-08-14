import { configureStore } from '@reduxjs/toolkit';
import theme from './slices/themeSlice';
import ui from './slices/uiSlice';
import contact from './slices/contactSlice';
import chat from './slices/chatSlice';

export const store = configureStore({
  reducer: { theme, ui, contact, chat },
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
