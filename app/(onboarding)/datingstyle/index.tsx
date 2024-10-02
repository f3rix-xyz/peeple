import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import {
  bioAtom,
  drinkAtom,
  genderAtom,
  emailAtom,
  heightAtom,
  locationAtom,
  nameAtom,
  relationshipTypeAtom,
  religionAtom,
  smokeAtom,
  occupationAtom,
  dateAtom,
  monthAtom,
  yearAtom,
  instaAtom,
  phoneAtom,
} from "@/lib/atom";

export type RelationshipPreference = "casual" | "serious";

export default function RelationshipPreference(): JSX.Element {
  const [preference, setPreference] = useAtom(relationshipTypeAtom);
  const [animation] = useState(new Animated.Value(0));

  const name = useAtomValue(nameAtom);
  const location = useAtomValue(locationAtom);
  const gender = useAtomValue(genderAtom);
  const height = useAtomValue(heightAtom);
  const religion = useAtomValue(religionAtom);
  const drink = useAtomValue(drinkAtom);
  const smoke = useAtomValue(smokeAtom);
  const bio = useAtomValue(bioAtom);
  const email = useAtomValue(emailAtom);
  const occupation = useAtomValue(occupationAtom);
  const date = useAtomValue(dateAtom);
  const month = useAtomValue(monthAtom);
  const year = useAtomValue(yearAtom);
  const instaId = useAtomValue(instaAtom);
  const phone = useAtomValue(phoneAtom);

  const handleSelectPreference = useCallback(
    (selected: string) => {
      setPreference(selected);
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [animation, setPreference],
  );

  const handleContinue = useCallback(async () => {
    const newUser = {
      name,
      email,
      location,
      gender,
      relationshiptype: preference,
      height,
      religion,
      occupationArea: occupation.area,
      occupationField: occupation.feild,
      drink,
      smoke,
      bio,
      date,
      month,
      year,
      instaId,
      phone,
    };

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API}/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add any authentication headers if required
            // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
          },
          body: JSON.stringify({
            user: newUser,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update preference");
      }

      const data = await response.json();
      console.log("Preference updated successfully:", data);

      // Navigate to the home screen
      router.replace("/(tabs)/homeScreen");
    } catch (error) {
      console.error("Error updating preference:", error);
      Alert.alert("Error", "Failed to update preference. Please try again.", [
        { text: "OK" },
      ]);
    }
  }, [
    name,
    location,
    gender,
    preference,
    height,
    religion,
    occupation,
    drink,
    smoke,
    bio,
    date,
    month,
    year,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are you looking for?</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          onPress={() => handleSelectPreference("casual")}
          style={[
            styles.option,
            preference === "casual" && styles.selectedOption,
          ]}
        >
          <MaterialCommunityIcons
            name="heart-outline"
            size={32}
            color={preference === "casual" ? "white" : "#8B5CF6"}
          />
          <Text
            style={[
              styles.optionText,
              preference === "casual" && styles.selectedText,
            ]}
          >
            Casual Dating
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectPreference("serious")}
          style={[
            styles.option,
            preference === "serious" && styles.selectedOption,
          ]}
        >
          <MaterialCommunityIcons
            name="heart-multiple"
            size={32}
            color={preference === "serious" ? "white" : "#8B5CF6"}
          />
          <Text
            style={[
              styles.optionText,
              preference === "serious" && styles.selectedText,
            ]}
          >
            Serious Relationship
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !preference && styles.disabledButton]}
        disabled={!preference}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  option: {
    width: "45%",
    padding: 20,
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
    marginTop: 10,
  },
  selectedText: {
    color: "white",
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
