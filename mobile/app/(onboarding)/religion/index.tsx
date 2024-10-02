import { useEffect, useRef, FC } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { religionAtom } from "@/lib/atom";
import { router } from "expo-router";

interface Religion {
  name: string;
  icon: string;
}

export type Religions =
  | "hindu"
  | "muslim"
  | "christian"
  | "jain"
  | "parsi"
  | "atheist"
  | "buddhist"
  | "sikh"
  | "other";

const religions: Religion[] = [
  { name: "hindu", icon: "om" },
  { name: "muslim", icon: "mosque" },
  { name: "christian", icon: "church" },
  { name: "jain", icon: "hands" },
  { name: "parsi", icon: "fire" },
  { name: "atheist", icon: "ban" },
  { name: "buddhist", icon: "dharmachakra" },
  { name: "sikh", icon: "khanda" },
  { name: "other", icon: "ellipsis-h" },
];

interface ReligionCardProps extends Religion {
  index: number;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export default (): JSX.Element => {
  const titleOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const [selectedReligion, setSelectedReligion] = useAtom<string | undefined>(
    religionAtom,
  );

  useEffect(() => {
    titleOpacity.value = withDelay(300, withSpring(1));
    cardScale.value = withDelay(600, withSpring(1));
  }, []);

  const titleStyle = useAnimatedStyle(
    (): { opacity: number; transform: { translateY: number }[] } => ({
      opacity: titleOpacity.value,
      transform: [{ translateY: withSpring(titleOpacity.value * -20) }],
    }),
  );

  const cardStyle = useAnimatedStyle(
    (): { transform: { scale: number }[] } => ({
      transform: [{ scale: cardScale.value }],
    }),
  );

  const ReligionCard: FC<ReligionCardProps> = ({
    name,
    icon,
    index,
    isSelected,
    onSelect,
  }: ReligionCardProps): JSX.Element => {
    const cardOpacity = useSharedValue(0);
    const animated = useRef(false);

    useEffect(() => {
      if (!animated.current) {
        cardOpacity.value = withDelay(index * 100, withSpring(1));
        animated.current = true;
      }
    }, []);

    const animatedCardStyle = useAnimatedStyle((): { opacity: number } => ({
      opacity: cardOpacity.value,
    }));

    return (
      <Animated.View
        style={[
          styles.card,
          animatedCardStyle,
          { backgroundColor: isSelected ? "#8B5CF6" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => onSelect(name)}
        >
          <FontAwesome5
            name={icon}
            size={30}
            color={isSelected ? "#FFFFFF" : "#8B5CF6"}
          />
          <Text
            style={[
              styles.cardText,
              { color: isSelected ? "#FFFFFF" : "#4B5563" },
            ]}
          >
            {name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleContinue = () => {
    if (selectedReligion) {
      router.replace("/(onboarding)/occupation");
    } else {
      alert("Please select a religion.");
    }
  };

  const handleSelectReligion = (name: string) => {
    setSelectedReligion((prevSelected) =>
      prevSelected === name ? null : name,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text style={[styles.title, titleStyle]}>
        What's your religion?
      </Animated.Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          {religions.map(
            (religion: Religion, index: number): JSX.Element => (
              <ReligionCard
                key={religion.name}
                {...religion}
                index={index}
                isSelected={selectedReligion === religion.name}
                onSelect={handleSelectReligion}
              />
            ),
          )}
        </Animated.View>
      </ScrollView>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 80, // Add top margin to move the title down
    marginBottom: 20,
    color: "#8B5CF6",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "30%",
    aspectRatio: 1,
    margin: "1.5%",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
