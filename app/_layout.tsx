import { getItemAsync, setItemAsync } from "expo-secure-store";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Stack } from "expo-router";

const tokenCache: {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
} = {
  async getToken(key: string): Promise<string | null> {
    try {
      return getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      return setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

export default (): JSX.Element => (
  <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
    <ClerkLoaded>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Onboarding flow */}

        <Stack.Screen name="index" />
        <Stack.Screen
          name="(auth)/login/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/signup/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ClerkLoaded>
  </ClerkProvider>
);
