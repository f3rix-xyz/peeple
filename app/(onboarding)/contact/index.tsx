import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAtom } from "jotai";
import { instaAtom, phoneAtom } from "@/lib/atom";
import { router } from "expo-router";

const PeepleUserInfoForm = () => {
  const [instaId, setInstaId] = useAtom(instaAtom); // Use atom for instaId
  const [contactNumber, setContactNumber] = useAtom(phoneAtom);
  const [error, setError] = useState("");

  const animatedValue = new Animated.Value(0);

  const handleSubmit = () => {
    if (!instaId) {
      setError("Instagram ID is required");
      shakeAnimation();
      return;
    }

    if (
      instaId.length < 3 ||
      instaId.length > 30 ||
      !/^[a-zA-Z0-9._]+$/.test(instaId)
    ) {
      setError("Please enter a valid Instagram ID");
      shakeAnimation();
      return;
    }

    if (
      contactNumber &&
      (contactNumber.length !== 10 || !/^\d+$/.test(contactNumber))
    ) {
      setError("Please enter a valid 10-digit contact number");
      shakeAnimation();
      return;
    }

    router.replace("/(onboarding)/datingstyle");

    // If all checks pass, you can proceed with form submission
    console.log("Form submitted:", { instaId, contactNumber });
    setError("");
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#8B5CF6"]} style={styles.container}>
      <Animated.View
        style={[styles.form, { transform: [{ translateX: animatedValue }] }]}
      >
        <Text style={styles.title}>Join Peeple! 🎉</Text>
        <TextInput
          style={styles.input}
          placeholder="Instagram ID"
          value={instaId}
          onChangeText={setInstaId}
          placeholderTextColor="#8B5CF680"
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number (optional)"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="numeric"
          placeholderTextColor="#8B5CF680"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText} disabled={instaId.length === 0}>
            Let's Go!
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#8B5CF6",
  },
  button: {
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default PeepleUserInfoForm;
