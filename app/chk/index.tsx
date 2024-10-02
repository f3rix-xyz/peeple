import { emailAtom } from "@/lib/atom";
import { userExists } from "@/lib/checkUser";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export default () => {
  const { isLoaded, user, isSignedIn } = useUser();
  const setEmail = useSetAtom(emailAtom);

  useEffect(() => {
    (async () => {
      if (!isLoaded) {
        console.log("not loaded");
        return;
      }
      if (!isSignedIn) {
        console.log("not signed In");
        return;
      }
      const email = user?.emailAddresses[0].emailAddress;
      console.log(user);
      if (email) {
        setEmail(email);
        const exists = await userExists(email);
        if (exists === true) router.replace("/(tabs)/homeScreen");
        else if (exists === false) router.replace("/(onboarding)/moreyoushare");
      }
    })();
  }, []);
};
