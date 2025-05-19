import { useRouter } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Sizes } from '../constants/Sizes';

interface ThemeContextType {
  themeColors: typeof defaultColors;
  setThemeColors: React.Dispatch<React.SetStateAction<typeof defaultColors>>;
}

// Default colors for the theme
export const defaultColors = {
  dark: false,
  headerBg: '#2196f3',
  headerText: '#fff',
  subHeaderBg: '#b3e5fc',
  subHeaderText: '#0288d1',
  cardHeaderBg: '#e3f2fd',
  cardHeaderText: '#263238',
  cardBg: '#fff',
  cardText: '#263238',
  inputBg: '#e3f2fd',
  inputText: '#263238',
  text: '#000',
  primaryBtnBg: '#1976d2', //'#1660f5',
  primaryBtnText: '#fff',
  secondaryBtnBg: '#e3f2fd',
  secondaryBtnText: '#1976d2',
  deleteBtnBg: '#d93125',
  deleteBtnText: '#fff',
  popupBg: '#fff',
  popupText: '#000',
  activeTintColor: '#2196f3',
  tabsBg: '#fff',
};

export const darkColors = {
  dark: true,
  headerBg: '#000',
  headerText: '#f00',
  subHeaderBg: '#444',
  subHeaderText: '#f00',
  cardHeaderBg: '#444',
  cardHeaderText: '#fff',
  cardBg: '#999',
  cardText: '#f00',
  inputBg: '#444',
  inputText: '#fff',
  text: '#fff',
  primaryBtnBg: '#555',
  primaryBtnText: '#f00',
  secondaryBtnBg: '#bbb',
  secondaryBtnText: '#000',
  deleteBtnBg: '#f00',
  deleteBtnText: '#000',
  popupBg: '#555',
  popupText: '#fff',
  activeTintColor: '#fff',
  tabsBg: '#000',
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeColors() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeColors must be used within ThemeContextProvider');
  }
  return context;
}

export function useHeaderTitleStyle() {
  const { themeColors } = useThemeColors();

  const headerTitleStyle = {
    color: themeColors.headerText,
    fontSize: 28,
    fontWeight: 'bold' as 'bold',

    letterSpacing: 0.5,
    textShadowColor: '#1565c0',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  };

  return headerTitleStyle;
}

export function useHeaderOptions() {
  const { themeColors } = useThemeColors();
  const router = useRouter();

  const headerTitleStyle = useHeaderTitleStyle();

  return {
    headerShown: true,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <Icon
          name="chevron-left"
          size={38}
          color={themeColors.headerText}
          style={headerTitleStyle}
        />
      </TouchableOpacity>
    ),
    headerBackVisible: false,
    headerShadowVisible: false,
    headerStyle: {
      height: Sizes.headerHeight,
      backgroundColor: themeColors.headerBg,
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTitleStyle,
    headerLeftContainerStyle: {
      backgroundColor: themeColors.headerBg,
    },
    headerRightContainerStyle: {
      backgroundColor: themeColors.headerBg,
    },
  };
}
