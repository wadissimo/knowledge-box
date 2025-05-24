import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { SQLiteProvider } from 'expo-sqlite';
import { View, ActivityIndicator } from 'react-native';

import { DATABASE_NAME, useDatabaseFromAsset } from '@/src/hooks/useDatabaseFromAsset';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { migrateDbIfNeeded } from '@/src/data/DbUtils';

import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

import { SettingsProvider, useSettings } from '@/src/context/SettingsContext';
import { ThemeContext, defaultColors, darkColors } from '@/src/context/ThemeContext';
import { setLocale } from '@/src/lib/i18n';
import { StatusBar } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const [database, dbLoaded] = useDatabaseFromAsset();

  useEffect(() => {
    if (fontsLoaded && dbLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbLoaded]);

  if (global.ErrorUtils) {
    const defaultHandler = global.ErrorUtils.getGlobalHandler?.();

    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log('[GlobalErrorHandler]', isFatal ? 'Fatal:' : 'Non-fatal:', error);

      // Optional: rethrow to default handler if needed
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });
  }
  if (typeof globalThis._unhandledPromiseRejectionHandler === 'undefined') {
    globalThis._unhandledPromiseRejectionHandler = (reason, promise) => {
      console.log('[UnhandledPromiseRejection]', reason);
    };
  }

  // Show spinner until fonts and DB are ready
  if (!fontsLoaded || !dbLoaded || !database) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  console.log('segments', segments);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <SQLiteProvider databaseName={DATABASE_NAME} useSuspense={true} onInit={migrateDbIfNeeded}>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </SQLiteProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { isLoaded: settingsLoaded, theme, language } = useSettings();
  const [themeColors, setThemeColors] = useState(defaultColors);

  useEffect(() => {
    if (!settingsLoaded) return;
    if (theme === 'dark') {
      setThemeColors(darkColors);
    } else {
      setThemeColors(defaultColors);
    }
  }, [settingsLoaded, theme]);

  console.log('loaded theme', theme);
  console.log('loaded language', language);

  useEffect(() => {
    if (language) {
      console.log('setting language to', language);
      setLocale(language);
    }
  }, [language]);

  if (!settingsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ themeColors, setThemeColors }}>
      <StatusBar hidden={false} backgroundColor={themeColors.headerBg} barStyle={'light-content'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeContext.Provider>
  );
}
