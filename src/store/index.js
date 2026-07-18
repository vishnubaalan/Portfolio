import { configureStore } from '@reduxjs/toolkit';
import theme from './slices/themeSlice';
import ui from './slices/uiSlice';
import contact from './slices/contactSlice';

export const store = configureStore({
  reducer: { theme, ui, contact },
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
