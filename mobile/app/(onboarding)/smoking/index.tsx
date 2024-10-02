import { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSetAtom } from "jotai"; // Jotai imports
import { drinkAtom, smokeAtom } from "@/lib/atom";
import { router } from "expo-router";

interface RadioButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const RadioButton: FC<RadioButtonProps> = ({ title, isSelected, onPress }) => {
  const buttonScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: isSelected ? "#8B5CF6" : "white",
    borderColor: "#8B5CF6",
    borderWidth: 2,
  }));

  const handlePress = () => {
    buttonScale.value = withSpring(0.9, { duration: 100 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { duration: 100 });
    }, 100);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.radioButton}>
      <Animated.View style={[styles.radioButtonCircle, animatedStyle]}>
        <Text
          style={[
            styles.radioButtonText,
            { color: isSelected ? "white" : "#8B5CF6" },
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default () => {
  const [selectedHabits, setSelectedHabits] = useState<Record<string, string>>(
    {},
  );
  const setDrink = useSetAtom(drinkAtom); // Jotai setter for drink
  const setSmoke = useSetAtom(smokeAtom); // Jotai setter for smoke

  const habits = [
    { name: "Drinking", icon: "wine-glass-alt" },
    { name: "Smoking", icon: "smoking" },
  ];

  const handleContinue = () => {
    router.replace("/(onboarding)/location");
  };

  // Save to atoms when user selects
  useEffect(() => {
    if (selectedHabits["Drinking"]) {
      setDrink(selectedHabits["Drinking"]);
    }
    if (selectedHabits["Smoking"]) {
      setSmoke(selectedHabits["Smoking"]);
    }
  }, [selectedHabits, setDrink, setSmoke]);

  // Check if both "Drinking" and "Smoking" have been selected
  const isContinueDisabled =
    !selectedHabits["Drinking"] || !selectedHabits["Smoking"];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Habits</Text>
        {habits.map((habit) => (
          <View key={habit.name} style={styles.card}>
            <View style={styles.habitRow}>
              <FontAwesome5
                name={habit.icon}
                size={30}
                color="#8B5CF6"
                style={
                  habit.name === "Smoking" ? styles.smokingIcon : undefined
                }
              />
              <Text style={styles.habitName}>{habit.name}</Text>
            </View>
            <View style={styles.radioGroup}>
              {["Yes", "No", "Sometimes"].map((option) => (
                <RadioButton
                  key={option}
                  title={option}
                  isSelected={selectedHabits[habit.name] === option}
                  onPress={() =>
                    setSelectedHabits((prev) => ({
                      ...prev,
                      [habit.name]: option,
                    }))
                  }
                />
              ))}
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isContinueDisabled && styles.disabledButton, // Apply disabled styles if needed
          ]}
          onPress={handleContinue}
          disabled={isContinueDisabled} // Disable button if conditions not met
        >
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#8B5CF6",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  habitName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginLeft: 10,
  },
  smokingIcon: {
    marginTop: -5,
  },
  radioGroup: {
    marginTop: 10,
    width: "100%",
  },
  radioButton: {
    marginBottom: 10,
    borderRadius: 10,
  },
  radioButtonCircle: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  radioButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#D1D5DB", // Light gray for disabled state
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
