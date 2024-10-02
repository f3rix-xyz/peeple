import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, Crown, Check } from "lucide-react-native";
import { useAtomValue } from "jotai";
import { emailAtom } from "@/lib/atom";
import { router, useFocusEffect } from "expo-router";

interface PlanCardProps {
  email: string;
  title: string;
  price: string;
  features: string[];
  icon: JSX.Element;
  isPremium?: boolean;
}

const SubscriptionScreen: React.FC = () => {
  const email = useAtomValue(emailAtom);

  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.push('/(tabs)/profileScreen'); // Replace with your main screen route
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  return (
    <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.container}>
      <Text style={styles.title}>Choose Your Love Journey!</Text>

      <View style={styles.plansContainer}>
        <PlanCard
          email={email}
          title="Basic Bliss"
          price="₹39/month"
          features={["50 daily like swipes", "See who liked you"]}
          icon={<Zap color="#8B5CF6" size={25} />}
        />

        <PlanCard
          email={email}
          title="Premium Passion"
          price="₹79/month"
          features={[
            "Unlimited like swipes",
            "See who liked you",
            "10x more visibility in feed",
          ]}
          icon={<Crown color="#8B5CF6" size={25} />}
          isPremium={true}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          &copy; 2024 Peeple. All rights reserved.
        </Text>
      </View>
    </LinearGradient>
  );
};

const PlanCard: React.FC<PlanCardProps> = ({
  email,
  title,
  price,
  features,
  icon,
  isPremium = false,
}) => {
  const handleSubscribe = () => {
    Alert.alert(
      "Beta Version",
      "We're currently in beta mode. These features will be available soon!",
      [
        {
          text: "OK",
          onPress: () => console.log("Beta message acknowledged"),
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.planCard, isPremium && styles.premiumCard]}
    >
      <View style={styles.planIconContainer}>{icon}</View>
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planPrice}>{price}</Text>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Check color="#8B5CF6" size={18} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={handleSubscribe}
      >
        <Text style={styles.subscribeButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
    textAlign: "center",
  },
  plansContainer: {
    width: "100%",
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#FFD700",
    borderWidth: 2,
  },
  planIconContainer: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 8,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: "#6D28D9",
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4B5563",
  },
  subscribeButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    paddingBottom: 20,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 12,
  },
});

export default SubscriptionScreen;