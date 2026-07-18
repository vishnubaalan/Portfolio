import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    paletteOpen: false,
    scrollProgress: 0,
    activeSection: 'hero',
  },
  reducers: {
    setPaletteOpen: (state, action) => {
      state.paletteOpen = action.payload;
    },
    togglePalette: (state) => {
      state.paletteOpen = !state.paletteOpen;
    },
    setScrollProgress: (state, action) => {
      state.scrollProgress = action.payload;
    },
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
  },
});

export const {
  setPaletteOpen,
  togglePalette,
  setScrollProgress,
  setActiveSection,
} = uiSlice.actions;
export default uiSlice.reducer;
