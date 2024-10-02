import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { genderAtom } from "@/lib/atom";
import { router } from "expo-router";

type Gender = "male" | "female" | "";
export default (): JSX.Element => {
  const [selectedGender, setSelectedGender] = useAtom<Gender>(genderAtom);
  const [animation] = useState(new Animated.Value(1));

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
    Animated.timing(animation, {
      toValue: 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your gender?</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          onPress={() => handleSelectGender("male")}
          style={[
            styles.option,
            selectedGender === "male" && styles.selectedOption,
          ]}
        >
          <Ionicons
            name="male"
            size={48}
            color={selectedGender === "male" ? "white" : "#8B5CF6"}
          />
          <Text
            style={[
              styles.optionText,
              selectedGender === "male" && styles.selectedText,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectGender("female")}
          style={[
            styles.option,
            selectedGender === "female" && styles.selectedOption,
          ]}
        >
          <Ionicons
            name="female"
            size={48}
            color={selectedGender === "female" ? "white" : "#8B5CF6"}
          />
          <Text
            style={[
              styles.optionText,
              selectedGender === "female" && styles.selectedText,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          router.replace("/(onboarding)/age");
        }}
        // onPress={() => navigation.navigate('DatePreference')}
        style={[
          styles.continueButton,
          !selectedGender && styles.disabledButton,
        ]}
        disabled={!selectedGender}
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
    backgroundColor: "white", // Fully white background
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  option: {
    width: "45%",
    padding: 20,
    margin: 10,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selectedOption: {
    backgroundColor: "#8B5CF6",
  },
  optionText: {
    fontSize: 18,
    color: "#8B5CF6",
  },
  selectedText: {
    color: "white",
  },
  continueButton: {
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
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
