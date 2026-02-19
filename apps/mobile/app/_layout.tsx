import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { bootstrapLocalDataLayer } from '@/src/data';

export default function RootLayout() {
  useEffect(() => {
    bootstrapLocalDataLayer();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Foundation' }} />
        <Stack.Screen name="session-recorder" options={{ title: 'Session Recorder' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
