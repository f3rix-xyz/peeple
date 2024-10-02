import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { heightAtom } from "@/lib/atom";
import { router } from "expo-router";

export default (): JSX.Element => {
  const [height, setHeight] = useAtom(heightAtom); // Default height in cm
  const scaleValue = new Animated.Value(1); // Start visible

  const formatHeight = (cm: number): string => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  };
  const [formattedHeight, setFormattedHeight] = useState(formatHeight(170)); // Store formatted height

  // Animate the scaling of the height text
  const animateScale = () => {
    Animated.timing(scaleValue, {
      toValue: 1.2,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    });
  };

  // Trigger animation and update formatted height when height changes
  useEffect(() => {
    const newHeight = formatHeight(height);
    setFormattedHeight(newHeight); // Update formatted height
    animateScale();
  }, [height]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="ruler"
        size={72}
        color="#8B5CF6"
        style={styles.icon}
      />
      <Text style={styles.title}>What's your height?</Text>

      <Animated.Text
        style={[styles.heightText, { transform: [{ scale: scaleValue }] }]}
      >
        {formattedHeight} {/* Use formatted height here */}
      </Animated.Text>

      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={140}
        maximumValue={220}
        step={1}
        value={height}
        onValueChange={setHeight}
        minimumTrackTintColor="#8B5CF6"
        maximumTrackTintColor="#D1D5DB"
        thumbTintColor="#8B5CF6"
      />

      <Text style={styles.cmText}>{height} cm</Text>

      <TouchableOpacity
        onPress={() => {
          router.replace("/(onboarding)/smoking");
        }}
        // onPress={() => navigation.navigate('Religion')} // Adjust as needed
        style={styles.continueButton}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f3ff", // Light purple shade for canvas
    padding: 20,
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 16,
    textAlign: "center",
  },
  icon: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  heightText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#7C3AED",
    marginBottom: 20,
  },
  cmText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
