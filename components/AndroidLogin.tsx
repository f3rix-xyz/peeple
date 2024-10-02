import { useCallback, useEffect, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import MaskedView from "@react-native-masked-view/masked-view";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { maybeCompleteAuthSession } from "expo-web-browser";

const { width, height } = Dimensions.get("window");

maybeCompleteAuthSession();
export default (): JSX.Element => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  // Adjusted particle generation to ensure coverage beyond screen bounds
  const particlesAnim = useRef(
    Array.from({ length: 50 }, () => ({
      translateX: new Animated.Value(Math.random() * (width + 50) - 25), // Allow particles to start beyond the left side
      translateY: new Animated.Value(Math.random() * (height + 50) - 25), // Allow particles to start beyond the top side
      scale: new Animated.Value(Math.random() * 0.8 + 1.2), // Larger particles
      opacity: new Animated.Value(Math.random() * 0.5 + 0.5), // Ensure visibility
    })),
  ).current;

  const waterFlowAnim = useRef(new Animated.Value(0)).current;

  const onPress = useCallback(async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    try {
      const { createdSessionId, signIn, signUp, setActive, authSessionResult } =
        await startOAuthFlow();

      if (authSessionResult?.type === "success") {
        if (setActive) {
          setActive({ session: createdSessionId });
        }
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      router.replace("/chk");
    }
  }, [router]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      ...particlesAnim.map((particle) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.translateY, {
              toValue: Math.random() * height,
              duration: 3000 + Math.random() * 5000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: Math.random() * height,
              duration: 3000 + Math.random() * 5000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
      Animated.loop(
        Animated.timing(waterFlowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, []);

  const waterFlow = waterFlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height], // Use actual numeric values instead of percentages
  });

  return (
    <LinearGradient
      colors={["#2C0735", "#3E1C54", "#502B73"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      {/* Render particles across the whole screen, including top and left sides */}
      {particlesAnim.map(
        (particle, index: number): JSX.Element => (
          <Animated.View
            key={index}
            style={{
              position: "absolute",
              width: index % 3 === 0 ? 8 : index % 3 === 1 ? 6 : 4, // Larger particles
              height: index % 3 === 0 ? 8 : index % 3 === 1 ? 6 : 4,
              backgroundColor:
                index % 3 === 0
                  ? "#B388EB"
                  : index % 3 === 1
                    ? "#8C65D3"
                    : "#5E35B1",
              borderRadius: 4, // Increase border radius for larger particles
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            }}
          />
        ),
      )}

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
          marginBottom: 40,
        }}
      >
        <MaskedView
          maskElement={
            <Text
              style={{
                fontSize: 48,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Join Peeple
            </Text>
          }
        >
          <LinearGradient
            colors={["#B388EB", "#8C65D3", "#5E35B1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 60, width: 300 }} // Specify exact dimensions
          >
            <Animated.View
              style={{
                height: "200%",
                width: "100%",
                transform: [{ translateY: waterFlow }],
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.1)",
                  "rgba(255,255,255,0.3)",
                  "rgba(255,255,255,0.1)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </LinearGradient>
        </MaskedView>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          width: "80%",
          maxWidth: 300,
          shadowColor: "#B388EB",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 15,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "#B388EB",
          }}
        >
          <AntDesign name="google" size={24} color="#B388EB" />
          <Text
            style={{
              marginLeft: 10,
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
            }}
          >
            Log In with Google
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};
