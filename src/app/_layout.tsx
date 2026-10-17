import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFonts, Fredoka_500Medium } from '@expo-google-fonts/fredoka';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { VisitsProvider } from '../context/VisitsContext';
import { loadSavedLanguage } from '../i18n';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fredoka_500Medium });
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    loadSavedLanguage().finally(() => setLanguageLoaded(true));
  }, []);

  if (!fontsLoaded || !languageLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VisitsProvider>
          <AppStack />
        </VisitsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// waits until we know whether someone is logged in, so no screen flashes
function AppStack() {
  const { status } = useAuth();
  if (status === 'loading') return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
