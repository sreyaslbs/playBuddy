import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors as AppColors } from '../constants/Styles';
import { AuthProvider, useAuth } from '../context/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { DataProvider } from '../context/DataContext';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <RootLayoutNav />
      </DataProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onSelectRole = segments[1] === 'select-role';

    if (!user && !inAuthGroup) {
      // Redirect to the login page if the user is not authenticated
      router.replace('/(auth)/login');
    } else if (user && !role && !onSelectRole) {
      // Authenticated but no role selected (new user)
      router.replace('/(auth)/select-role');
    } else if (user && role && (inAuthGroup || (segments as string[]).length === 0)) {
      // Authenticated with role - go to main app
      router.replace('/(tabs)');
    }
  }, [user, role, loading, segments]);

  const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: AppColors.primary,
      background: AppColors.background,
      card: AppColors.surface,
      text: AppColors.text,
      border: AppColors.border,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : CustomDefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal/complex" options={{ presentation: 'modal', headerShown: true, title: 'Add Complex' }} />
        <Stack.Screen name="modal/add-court" options={{ presentation: 'modal', headerShown: true, title: 'Add Court' }} />
        <Stack.Screen name="modal/slots" options={{ presentation: 'modal', headerShown: true, title: 'Define Slots' }} />
        <Stack.Screen name="modal/complex-details" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="modal/booking" options={{ presentation: 'modal', headerShown: true, title: 'Book a Slot' }} />
      </Stack>
    </ThemeProvider>
  );
}
