import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const SWIPE_THRESHOLD = 120;

interface Profile {
  name: string;
  birthDate: string; // YYYY-MM-DD format
  location: string;
  bio: string;
  workplace: string;
  college: string;
  drink: string;
  smoke: string;
  religion: string;
  relationshipType: string;
  photos: string[];
}

interface ProfileCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (
      _: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      position.setValue({ x: gesture.dx, y: 0 });
    },
    onPanResponderRelease: (
      _: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe("right");
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe("left");
      } else {
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SWIPE_THRESHOLD : -SWIPE_THRESHOLD;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: "left" | "right") => {
    direction === "right" ? onSwipeRight() : onSwipeLeft();
    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const rotateAndTranslate = {
    transform: [
      {
        rotate: position.x.interpolate({
          inputRange: [-SWIPE_THRESHOLD * 1.5, 0, SWIPE_THRESHOLD * 1.5],
          outputRange: ["-30deg", "0deg", "30deg"],
        }),
      },
      ...position.getTranslateTransform(),
    ],
  };

  return (
    <Animated.View
      style={[styles.card, rotateAndTranslate]}
      {...panResponder.panHandlers}
    >
      <View style={styles.profileSection}>
        <Image source={{ uri: profile.photos[0] }} style={styles.coverImage} />
        <Image
          source={{ uri: profile.photos[1] }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.location}>{profile.location}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.quickInfoContainer}>
            <Text style={styles.quickInfoLabel}>Work: {profile.workplace}</Text>
            <Text style={styles.quickInfoLabel}>
              Education: {profile.college}
            </Text>
            <Text style={styles.quickInfoLabel}>Drinks: {profile.drink}</Text>
            <Text style={styles.quickInfoLabel}>Smokes: {profile.smoke}</Text>
            <Text style={styles.quickInfoLabel}>
              Religion: {profile.religion}
            </Text>
            <Text style={styles.quickInfoLabel}>
              Looking for: {profile.relationshipType}
            </Text>
          </View>
        </View>
      </View>
      <Animated.View
        style={[
          styles.actionOverlay,
          {
            opacity: position.x.interpolate({
              inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
              outputRange: [1, 0, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <AntDesign name="heart" size={100} color="#00ff00" />
      </Animated.View>
      <Animated.View
        style={[
          styles.actionOverlay,
          {
            opacity: position.x.interpolate({
              inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
              outputRange: [0, 0, 1],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <AntDesign name="close" size={100} color="#ff0000" />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
    position: "relative",
  },
  profileSection: {
    padding: 20,
  },
  coverImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  profileImage: {
    position: "absolute",
    top: 150,
    left: "50%",
    transform: [{ translateX: -80 }],
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "white",
  },
  infoContainer: {
    marginTop: 100, // Ensure there's space for the profile image
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  location: {
    color: "#A0AEC0",
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 10,
  },
  quickInfoContainer: {
    marginTop: 10,
  },
  quickInfoLabel: {
    fontSize: 14,
    color: "#666",
  },
  actionOverlay: {
    position: "absolute",
    top: 100,
    right: 40,
    transform: [{ rotate: "30deg" }],
  },
});

export default ProfileCard;
