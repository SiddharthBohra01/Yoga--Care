import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('yogacare_theme') || localStorage.getItem('lotusflow_theme');

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    darkMode: saved ? saved === 'dark' : true,
  },
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('yogacare_theme', state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('yogacare_theme', state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
