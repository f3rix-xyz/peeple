import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";

export const getEmail = async (): Promise<string | undefined> => {
  console.log("start");
  try {
    const { user } = useUser();
    console.log("again start");
    if (Platform.OS === "ios") {
      console.log("inIOS get mail");
      const token = await AsyncStorage.getItem("token");
      console.log("pre Fetch");
      const res = await fetch(`${process.env.EXPO_PUBLIC_API}/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("pst fetch");
      if (res.ok) {
        const data = await res.json();
        const email = data.email as string;
        return email;
      } else {
        const error = await res.json();
        throw new Error(error);
      }
    } else if (Platform.OS === "android") {
      const email = user?.emailAddresses[0].emailAddress;
      if (email) return email;
      else throw new Error("Clerk dosen't return token");
    } else {
      throw new Error("OS not Supported");
    }
  } catch (e) {
    console.error(e);
    return;
  }
};
