import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setTheme, toggleTheme } from '../store/themeSlice';

interface ThemeContextType {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector((state: RootState) => state.theme.mode);

  const setMode = (newMode: 'light' | 'dark') => {
    dispatch(setTheme(newMode));
  };

  const toggleMode = () => {
    dispatch(toggleTheme());
  };

  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export default ThemeContext; 