import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { startNetworkLogging } from 'react-native-network-logger';
import RNShake from 'react-native-shake';

startNetworkLogging();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [loaded] = useFonts({});
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const subscription = RNShake.addListener(() => {
      router.push('/logger');
    });

    return () => {
      // Your code here...
      subscription.remove();
    };
  }, [router]);

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

      <Stack.Screen name="logger" />

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
