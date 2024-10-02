import { useEffect, useRef } from "react";
import { Text, Animated, Easing } from "react-native";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { LinearGradient } from "expo-linear-gradient";

export default (): JSX.Element | null => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 10,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.elastic(1.5),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  if (!fontsLoaded) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#4C1D95", "#7C3AED", "#8B5CF6"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { rotate: spin }],
        }}
      >
        <Text
          style={{
            fontFamily: "Pacifico_400Regular",
            fontSize: 72,
            color: "white",
            textShadowColor: "rgba(0, 0, 0, 0.75)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 10,
          }}
        >
          Peeple
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 50,
          opacity: fadeAnim,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          Connect. Share. Thrive.
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};
