import { createContext, useContext } from 'react';

interface ThemeContextType {
  themeColors: typeof defaultColors;
  setThemeColors: React.Dispatch<React.SetStateAction<typeof defaultColors>>;
  themeName: string;
  setThemeName: React.Dispatch<React.SetStateAction<string>>;
}

// Default colors for the theme
export const defaultColors = {
  dark: false,
  headerBg: '#2196f3',
  headerText: '#fff',
  subHeaderBg: '#b3e5fc',
  subHeaderText: '#0288d1',
  cardBg: '#e3f2fd',
  cardText: '#263238',
  primaryBtnBg: '#1660f5',
  primaryBtnText: '#fff',
  secondaryBtnBg: '#0c96c4',
  secondaryBtnText: '#fff',
  deleteBtnBg: '#d93125',
  deleteBtnText: '#fff',
  popupBg: '#fff',
  popupText: '#000',
};

export const darkColors = {
  dark: true,
  headerBg: '#000',
  headerText: '#f00',
  subHeaderBg: '#000',
  subHeaderText: '#f00',
  cardBg: '#999',
  cardText: '#f00',
  primaryBtnBg: '#999',
  primaryBtnText: '#f00',
  secondaryBtnBg: '#999',
  secondaryBtnText: '#f00',
  deleteBtnBg: '#f00',
  deleteBtnText: '#000',
  popupBg: '#555',
  popupText: '#fff',
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeColors() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeColors must be used within ThemeContextProvider');
  }
  return context;
}
