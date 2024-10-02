import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";

const { width, height } = Dimensions.get("window");

maybeCompleteAuthSession();
export default (): JSX.Element => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const animation = useSharedValue(0);

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  useEffect(() => {
    animation.value = withSpring(1);
  }, []);

  const titleStyle = useAnimatedStyle(
    (): { opacity: number; transform: { translateY: number }[] } => ({
      opacity: interpolate(animation.value, [0, 1], [0, 1]),
      transform: [
        { translateY: interpolate(animation.value, [0, 1], [-50, 0]) },
      ],
    }),
  );

  const buttonStyle = useAnimatedStyle(
    (): { opacity: number; transform: { scale: number }[] } => ({
      opacity: interpolate(animation.value, [0, 1], [0, 1]),
      transform: [
        {
          scale: interpolate(
            animation.value,
            [0, 1],
            [0.8, 1],
            Extrapolate.CLAMP,
          ),
        },
      ],
    }),
  );

  return (
    <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={styles.container}>
      <Animated.View style={[styles.decorCircle, styles.decorCircle1]} />
      <Animated.View style={[styles.decorCircle, styles.decorCircle2]} />

      <Animated.Text style={[styles.title, titleStyle]}>
        Welcome to Peeple
      </Animated.Text>

      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <TouchableOpacity onPress={onPress} style={styles.googleButton}>
          <AntDesign name="google" size={24} color="#4285F4" />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        // onPress={() => navigation.navigate('Signup')}
        style={styles.signupLink}
      >
        <Text style={styles.signupText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    overflow: "hidden",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 50,
    textAlign: "center",
    fontFamily: "Pacifico_400Regular",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: "white",
    fontSize: 16,
  },
  decorCircle: {
    position: "absolute",
    borderRadius: width,
    opacity: 0.2,
  },
  decorCircle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: "#A78BFA",
    top: -width * 0.75,
    left: -width * 0.25,
  },
  decorCircle2: {
    width: width,
    height: width,
    backgroundColor: "#C4B5FD",
    bottom: -width * 0.5,
    right: -width * 0.5,
  },
});
