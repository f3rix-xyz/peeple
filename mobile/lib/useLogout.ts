import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const useLogout = (): (() => Promise<void>) => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem("token");
      router.replace("/(auth)/signup");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return handleLogout;
};
