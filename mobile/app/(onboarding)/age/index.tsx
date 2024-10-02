import { useAtom } from "jotai";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Cake, ArrowRight } from "lucide-react-native";
import { router } from "expo-router";

const AnimatedCake = Animated.createAnimatedComponent(Cake);
import { dateAtom, monthAtom, yearAtom } from "@/lib/atom";

export default (): JSX.Element => {
  const [date, setDate] = useAtom(dateAtom);
  const [month, setMonth] = useAtom(monthAtom);
  const [year, setYear] = useAtom(yearAtom);

  const cakeRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(cakeRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const cakeSpinAnimation = cakeRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderPicker = (
    items: string[],
    value: number,
    setValue: (value: number) => void,
    placeholder: string,
  ): JSX.Element => (
    <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => setValue(0)}>
        <Text
          style={[
            styles.pickerItem,
            value === 0 ? styles.pickerItemSelected : null,
          ]}
        >
          {placeholder}
        </Text>
      </TouchableOpacity>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item}
          onPress={() =>
            setValue(placeholder === "YYYY" ? parseInt(item) : index + 1)
          }
        >
          <Text
            style={[
              styles.pickerItem,
              (placeholder === "YYYY" ? parseInt(item) : index + 1) === value
                ? styles.pickerItemSelected
                : null,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const years = Array.from({ length: 61 }, (_, i) => (2010 - i).toString());

  return (
    <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.container}>
      <AnimatedCake
        color="white"
        size={80}
        style={[
          styles.cakeIcon,
          { transform: [{ rotate: cakeSpinAnimation }] },
        ]}
      />

      <Text style={styles.title}>When's Your Birthday?</Text>
      <Text style={styles.subtitle}>Let's celebrate you!</Text>

      <View style={styles.dateContainer}>
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Day</Text>
          {renderPicker(days, date, setDate, "DD")}
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Month</Text>
          {renderPicker(months, month, setMonth, "MM")}
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Year</Text>
          {renderPicker(years, year, setYear, "YYYY")}
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          router.replace("/(onboarding)/height");
        }}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <ArrowRight color="#8B5CF6" size={24} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  cakeIcon: {
    marginTop: 40, // Adjusted vertical margin
    marginBottom: 40, // Adjusted vertical margin
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 40, // Adjusted vertical margin
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 40, // Adjusted vertical margin
    textAlign: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40, // Adjusted vertical margin
  },
  dateSection: {
    alignItems: "center",
    width: "30%",
  },
  dateLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  picker: {
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
  },
  pickerItem: {
    color: "white",
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  pickerItemSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    fontWeight: "bold",
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#8B5CF6",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});
