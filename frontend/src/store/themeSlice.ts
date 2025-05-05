import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Check local storage for saved theme preference or default to light
const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }
  
  // If no saved preference, check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

interface ThemeState {
  mode: 'light' | 'dark';
}

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
      
      // Apply theme to document
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newTheme;
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer; 