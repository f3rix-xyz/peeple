import SplashCard from "@/components/SplashCard";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { useAtom } from "jotai";
import { emailAtom } from "@/lib/atom";
import { userExists } from "@/lib/checkUser";

const logWithColor = (message: string, color: string = "\x1b[37m") => {
  console.log(`${color}%s\x1b[0m`, message);
};
// const getH = (): string => process.env.H ?? ((): never => { throw new Error("H not found"); })();

export default (): JSX.Element => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [emaill, setEmaill] = useAtom(emailAtom);
  // logWithColor(${getH()} hello, "\x1b[36m"); // Cyan

  useEffect((): (() => void) | undefined => {
    logWithColor(`${process.env.EXPO_PUBLIC_API} hii`, "\x1b[36m"); // Cyan
    logWithColor(`${process.env.EXPO_PUBLIC_H} hello`, "\x1b[36m"); // Cyan

    if (isLoaded) {
      logWithColor("isLoaded is true", "\x1b[32m"); // Green

      const timer = setTimeout(async () => {
        logWithColor("Timer triggered after 3 seconds", "\x1b[36m"); // Cyan

        if (Platform.OS === "ios") {
          logWithColor("Platform: iOS", "\x1b[35m"); // Magenta

          const token = await AsyncStorage.getItem("token");
          if (token) {
            logWithColor(`Token found: ${token}`, "\x1b[32m"); // Green
            logWithColor("Sending token for verification", "\x1b[33m"); // Yellow

            const res = await fetch(
              `${process.env.EXPO_PUBLIC_API}/verify-token`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`, // Send the token in the Authorization header
                },
              },
            );

            if (!res.ok) {
              const errorData = await res.json();
              logWithColor(
                `Token verification failed: ${errorData.error}`,
                "\x1b[31m",
              ); // Red
              console.error("GAILED");
              router.replace("/(auth)/signup");
            } else {
              const data2 = await res.json();
              logWithColor(
                `Token verified. Response: ${JSON.stringify(data2)}`,
                "\x1b[32m",
              ); // Green
              console.log(data2);
              const email = data2.email;
              logWithColor(`Email extracted: ${email}`, "\x1b[36m"); // Cyan

              const exists = await userExists(email);
              logWithColor(
                `User exists check result: ${exists}`,
                exists ? "\x1b[32m" : "\x1b[33m",
              ); // Green or Yellow
              setEmaill(email);
              if (exists) {
                logWithColor("Navigating to homeScreen", "\x1b[34m"); // Blue
                router.replace("/(tabs)/homeScreen");
              } else {
                logWithColor("Navigating to moreyoushare", "\x1b[34m"); // Blue
                router.replace("/(onboarding)/moreyoushare");
              }
            }
          } else {
            logWithColor("No token found. Redirecting to signup.", "\x1b[31m"); // Red
            router.replace("/(auth)/signup");
          }
        } else {
          logWithColor("Platform: Android or Web", "\x1b[35m"); // Magenta

          if (isSignedIn) {
            logWithColor("User is signed in", "\x1b[32m"); // Green

            const email = user?.emailAddresses[0].emailAddress;
            if (email) {
              logWithColor(`User email: ${email}`, "\x1b[36m"); // Cyan
              setEmaill(email);

              const exists = await userExists(email);
              logWithColor(
                `User exists check result: ${exists}`,
                exists ? "\x1b[32m" : "\x1b[33m",
              ); // Green or Yellow

              if (exists) {
                logWithColor("Navigating to homeScreen", "\x1b[34m"); // Blue
                router.replace("/(tabs)/homeScreen");
              } else {
                logWithColor("Navigating to moreyoushare", "\x1b[34m"); // Blue
                router.replace("/(onboarding)/moreyoushare");
              }
            }
          } else {
            logWithColor(
              "User is not signed in. Redirecting to signup.",
              "\x1b[31m",
            ); // Red
            router.replace("/(auth)/signup");
          }
        }
      }, 3000); // 3 seconds

      return () => {
        logWithColor("Timer cleared", "\x1b[33m"); // Yellow
        clearTimeout(timer);
      };
    }
  }, [isLoaded, isSignedIn, router]);

  return <SplashCard />;
};
