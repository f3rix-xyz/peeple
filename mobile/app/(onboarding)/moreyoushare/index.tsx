import { router } from "expo-router";
import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";

export default (): JSX.Element => {
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);

  useEffect(() => {
    titleOpacity.value = withDelay(300, withSpring(1));
    subtitleOpacity.value = withDelay(600, withSpring(1));
    buttonScale.value = withDelay(900, withSpring(1));
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
      <Animated.Text style={[styles.title, titleStyle]}>
        The more you share, the better it will be!
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        Sharing helps us match you with the perfect people.
      </Animated.Text>
      <View style={styles.iconGrid}>
        {/* Example Icons from the internet */}
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/90/ab/0f/90ab0fc84567709916526ee68320be89.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/17/85/d3/1785d33da4e3ea5ef5c1f3818dc0b4f7.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/fd/6c/9f/fd6c9f207643815c7686cfedc561a2cf.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/c4/43/1a/c4431abaa1eaa7671640e14e0d5e8eee.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/a0/ad/6e/a0ad6e5b6bcf8744b02f4dde1d2327e9.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/564x/f3/a5/82/f3a58269bca2eac445c859ab015d213e.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/67/a4/26/67a42675267715436557cfc09fc2b2b8.jpg",
          }}
          style={styles.icon}
        />
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/05/36/ae/0536aea6be7e51bb7f0f2fdaa5acc2a5.jpg",
          }}
          style={styles.icon}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          router.replace("/(onboarding)/name");
        }}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.button, buttonStyle]}>
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
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#4B5563",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  icon: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
