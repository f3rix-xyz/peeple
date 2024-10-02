import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { occupationAtom } from "@/lib/atom";

const { width, height } = Dimensions.get("window");

export type Occupation = {
  feild: string;
  area: "student" | "professional";
};

export default (): JSX.Element => {
  const [selectedOption, setSelectedOption] = useState("");
  const [occupationText, setOccupationText] = useState("");
  const [error, setError] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const setOccupation = useSetAtom(occupationAtom);

  useEffect((): (() => void) | undefined => {
    if (Platform.OS === "ios") {
      const keyboardWillShowSub = Keyboard.addListener(
        "keyboardWillShow",
        (event) => {
          setKeyboardOffset(event.endCoordinates.height);
        },
      );
      const keyboardWillHideSub = Keyboard.addListener(
        "keyboardWillHide",
        () => {
          setKeyboardOffset(0);
        },
      );

      return () => {
        keyboardWillShowSub.remove();
        keyboardWillHideSub.remove();
      };
    }
  }, []);

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    setError("");
  };

  const handleOccupationChange = (text: string) => {
    setOccupationText(text);
    setError("");
  };

  const handleSubmit = () => {
    if (!selectedOption || !occupationText) {
      setError(
        "Please select an option and enter your occupation or field of study.",
      );
      return;
    }
    setOccupation({
      feild: occupationText, // Save the occupation/field entered by the user
      area: selectedOption as "student" | "professional", // Save the selected option
    });
    router.replace("/(onboarding)/contact");
  };

  const getPlaceholderText = () => {
    return selectedOption === "student"
      ? "Enter your field of study"
      : "Enter your occupation";
  };

  const content = (
    <>
      <Text style={styles.title}>Select Your Occupation</Text>
      <View style={styles.card}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              selectedOption === "student" && styles.selectedButton,
            ]}
            onPress={() => handleOptionPress("student")}
          >
            <Text
              style={[
                styles.buttonText,
                selectedOption === "student" && styles.selectedButtonText,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              selectedOption === "professional" && styles.selectedButton,
            ]}
            onPress={() => handleOptionPress("professional")}
          >
            <Text
              style={[
                styles.buttonText,
                selectedOption === "professional" && styles.selectedButtonText,
              ]}
            >
              Professional
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder={getPlaceholderText()}
          placeholderTextColor="#8B5CF6"
          value={occupationText}
          onChangeText={handleOccupationChange}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedOption || !occupationText) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!selectedOption || !occupationText}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardOffset },
          ]}
        >
          {content}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {content}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: width * 0.05, // 5% of screen width
  },
  title: {
    fontSize: width * 0.08, // 8% of screen width
    fontWeight: "800",
    textAlign: "center",
    marginBottom: height * 0.04, // 4% of screen height
    color: "#8B5CF6",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.06, // 6% of screen width
    padding: width * 0.06,
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
    marginBottom: height * 0.04,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: height * 0.04,
  },
  button: {
    paddingVertical: height * 0.015, // 1.5% of screen height
    paddingHorizontal: width * 0.08, // 8% of screen width
    borderRadius: width * 0.06,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  selectedButton: {
    backgroundColor: "#8B5CF6",
  },
  buttonText: {
    fontSize: width * 0.045, // 4.5% of screen width
    fontWeight: "700",
    color: "#8B5CF6",
  },
  selectedButtonText: {
    color: "white",
  },
  input: {
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderRadius: width * 0.04, // 4% of screen width
    padding: width * 0.045,
    marginBottom: height * 0.025, // 2.5% of screen height
    fontSize: width * 0.045,
    color: "#8B5CF6",
    backgroundColor: "#F9F7FF",
  },
  submitButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: height * 0.022, // 2.2% of screen height
    borderRadius: width * 0.04,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    color: "white",
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  errorText: {
    color: "red",
    fontSize: width * 0.035, // 3.5% of screen width
    marginBottom: height * 0.013, // 1.3% of screen height
    textAlign: "center",
  },
});
