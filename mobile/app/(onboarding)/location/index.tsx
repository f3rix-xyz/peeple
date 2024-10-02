import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import MapView, { Marker } from "react-native-maps";
import { useAtom } from "jotai";
import { locationAtom } from "@/lib/atom";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default (): JSX.Element => {
  const [location, setLocation] = useAtom<Location.LocationObject | undefined>(
    locationAtom,
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync();
      setLocation(loc);
    })();

    // Animate text
    titleOpacity.value = withSpring(1, { duration: 600 });
    subtitleOpacity.value = withSpring(1, { duration: 800 });
    buttonScale.value = withSpring(1, { duration: 900 });
  }, []);

  const titleStyle = useAnimatedStyle(
    (): { opacity: number; transform: { translateY: number }[] } => ({
      opacity: titleOpacity.value,
      transform: [{ translateY: withSpring(titleOpacity.value * -20) }],
    }),
  );

  const subtitleStyle = useAnimatedStyle(
    (): { opacity: number; transform: { translateY: number }[] } => ({
      opacity: subtitleOpacity.value,
      transform: [{ translateY: withSpring(subtitleOpacity.value * -10) }],
    }),
  );

  const buttonStyle = useAnimatedStyle(
    (): { transform: { scale: number }[] } => ({
      transform: [{ scale: buttonScale.value }],
    }),
  );

  return (
    <View style={styles.container}>
      <MaterialIcons
        name="location-on"
        size={120}
        color="white"
        style={styles.locationIcon}
      />
      <Animated.Text style={[styles.title, titleStyle]}>
        Set Your Location
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        {location
          ? "Location set successfully!"
          : "We need your location to find matches near you."}
      </Animated.Text>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            rotateEnabled={false}
            showsUserLocation={true}
          >
            <Marker coordinate={location.coords} />
          </MapView>
        )}
        {/* Light purple overlay */}
        <View style={styles.overlay} />
      </View>
      <TouchableOpacity
        style={[styles.button, !location && styles.disabledButton]}
        disabled={!location}
        onPress={() => {
          // Add your navigation or logic here
          if (location) {
            router.replace("/(onboarding)/religion");
            // Example navigation
          }
        }}
      >
        <Animated.View style={buttonStyle}>
          <Text style={styles.buttonText}>Continue</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B5CF6", // Purple background color
    padding: 20,
  },
  locationIcon: {
    marginBottom: 20,
    transform: [{ rotate: "20deg" }],
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "white", // White text color
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "white", // White text color
  },
  error: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  mapContainer: {
    width: width * 0.9,
    height: height * 0.5,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 40,
    marginHorizontal: 20, // Added horizontal margins to the map container
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // Reduced opacity for the overlay
  },
  button: {
    backgroundColor: "white", // White background color for the button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#8B5CF6", // Purple text color for the button
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
