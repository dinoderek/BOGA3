import * as SecureStore from 'expo-secure-store';

export type AuthStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};

const inMemoryAuthStorage = new Map<string, string>();
let secureStoreUnavailable = false;

const isSecureStoreEntitlementError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.toLowerCase().includes('required entitlement');
};

const withSecureStoreFallback = async <T>(operation: () => Promise<T>, fallback: () => Promise<T> | T): Promise<T> => {
  if (secureStoreUnavailable) {
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    if (!isSecureStoreEntitlementError(error)) {
      throw error;
    }

    // Unsigned simulator dev-client builds can miss keychain entitlements.
    // Keep auth functional for local test/runtime by degrading to process-local storage.
    secureStoreUnavailable = true;
    return fallback();
  }
};

const secureStoreAuthStorage: AuthStorageAdapter = {
  getItem: (key) =>
    withSecureStoreFallback(
      () => SecureStore.getItemAsync(key),
      () => inMemoryAuthStorage.get(key) ?? null
    ),
  removeItem: (key) =>
    withSecureStoreFallback(
      () => SecureStore.deleteItemAsync(key),
      () => {
        inMemoryAuthStorage.delete(key);
      }
    ),
  setItem: (key, value) =>
    withSecureStoreFallback(
      () => SecureStore.setItemAsync(key, value),
      () => {
        inMemoryAuthStorage.set(key, value);
      }
    ),
};

export const getAuthStorageAdapter = () => secureStoreAuthStorage;

export const __resetAuthStorageAdapterForTests = () => {
  secureStoreUnavailable = false;
  inMemoryAuthStorage.clear();
};
