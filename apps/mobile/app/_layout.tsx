import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { bootstrapLocalDataLayer } from '@/src/data';
import { loggedOutSyncAuthSessionSource, SyncAuthSessionProvider, SyncEngineBoundary } from '@/src/sync';

export default function RootLayout() {
  useEffect(() => {
    void bootstrapLocalDataLayer();
  }, []);

  return (
    <SyncAuthSessionProvider source={loggedOutSyncAuthSessionSource}>
      <SyncEngineBoundary />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Sessions' }} />
        <Stack.Screen name="session-list" options={{ title: 'Sessions' }} />
        <Stack.Screen name="session-recorder" options={{ title: 'Session Recorder' }} />
        <Stack.Screen name="exercise-catalog" options={{ title: 'Exercise Catalog' }} />
        <Stack.Screen name="sync-status" options={{ title: 'Sync Status' }} />
        <Stack.Screen name="maestro-harness" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </SyncAuthSessionProvider>
  );
}
