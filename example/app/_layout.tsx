import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // Hide the header for all other routes.
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="broadcast"
        options={{
          // Hide the header for all other routes.
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="stream/[id]"
        options={{
          // Hide the header for all other routes.
          headerShown: false,
        }}
      />

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
