import React, { createContext, useContext, useEffect, useState } from 'react';
import { SETTING_IDS, useSettingsModel } from '@/src/data/SettingsModel';
import { darkColors, defaultColors } from './ThemeContext';

// Optional: define this explicitly if needed
type ThemeColors = typeof defaultColors;

type SettingsContextType = {
  theme: string;
  themeColors: ThemeColors;
  language: string;
  setTheme: (theme: string) => void;
  setLanguage: (language: string) => void;
  isLoaded: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { getSettingById, updateSettingById } = useSettingsModel();

  const [theme, setThemeState] = useState('light');
  const [themeColors, setThemeColorsState] = useState<ThemeColors>(defaultColors);
  const [language, setLanguageState] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [themeSetting, langSetting] = await Promise.all([
        getSettingById(SETTING_IDS.theme),
        getSettingById(SETTING_IDS.language),
      ]);

      if (themeSetting) {
        setThemeState(themeSetting.value);
        if (themeSetting.value === 'dark') {
          setThemeColorsState(darkColors);
        } else {
          setThemeColorsState(defaultColors);
        }
      }

      if (langSetting) {
        setLanguageState(langSetting.value);
      }

      setIsLoaded(true);
    })();
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    updateSettingById(SETTING_IDS.theme, newTheme);
    if (newTheme === 'dark') {
      setThemeColorsState(darkColors);
    } else {
      setThemeColorsState(defaultColors);
    }
  };

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    updateSettingById(SETTING_IDS.language, newLang);
  };

  return (
    <SettingsContext.Provider
      value={{ theme, themeColors, language, setTheme, setLanguage, isLoaded }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
