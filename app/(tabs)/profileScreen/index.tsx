import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Edit2, Camera, Settings, ChevronLeft } from "lucide-react-native";
import {
  ImagePickerResult,
  MediaTypeOptions,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { useLogout } from "@/lib/useLogout";
import { User } from "./../../../../api/lib/db/schema";
import { getCityFromCoordinates } from "@/lib/cutyName";
import { useUser } from "@clerk/clerk-expo";
import { getEmail } from "@/lib/getEmail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default (): JSX.Element => {
  const [editing, setEditing] = useState(false);
  const [userr, setUserr] = useState<User>();
  const [photos, setPhotos] = useState([]);
  const handleLogout = useLogout();
  const { user } = useUser();
  let cityName;
  console.log("st");

  useEffect(() => {
    (async () => {
      if (Platform.OS === "ios") {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API}/get-user-from-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          console.log("res is ok");
          const data = await res.json();
          console.log(data.images);
          setUserr(data.user);
          setPhotos(data.images);
          if (data.user) {
            try {
              //const locationData = JSON.parse(data.user.location);
              //const { latitude, longitude } = locationData.coords;
              //cityName = await getCityFromCoordinates(latitude, longitude);
            } catch (e) {
              console.error("Error location", e);
            }
          }
        } else {
          console.error("DB dosen't return User");
        }
      } else {
        const email = user?.emailAddresses[0].emailAddress;
        console.log(email, "says ih");
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API}/user-form-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          },
        );
        console.log("AFTER FETCH AYUSH");
        if (res.ok) {
          console.log("Res is ok in Android");
          const data = await res.json();
          console.log(data);
          setUserr(data.user);
          setPhotos(data.images);
          if (data.user) {
            try {
              /*const locationData = JSON.parse(data.user.location);
              const { latitude, longitude } = locationData.coords;
              cityName = await getCityFromCoordinates(latitude, longitude);
            */
            } catch (e) {
              console.error("Error location", e);
            }
          }
        } else {
          console.error("DB dosen't return User");
        }
      }
    })();
  }, [user]);

  const openGallery = async (index: number): Promise<void> => {
    const result: ImagePickerResult = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhotos = [...photos];
      //@ts-expect-error: W T F
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <ChevronLeft style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Settings style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.nameActions}>
        <Text style={styles.name}>
          {userr?.name}, {Number(new Date().getFullYear()) - (userr?.year || 0)}
        </Text>
        <Text style={styles.location}>{cityName}</Text>
      </View>
      <View style={styles.photoGalleryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoGalleryContent}
        >
          {photos.map(
            (photo: string, index: number): JSX.Element => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                {editing && (
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => openGallery(index)}
                  >
                    <Camera style={styles.cameraIcon} />
                  </TouchableOpacity>
                )}
              </View>
            ),
          )}
        </ScrollView>
      </View>
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About Me</Text>
        {editing ? (
          <TextInput
            defaultValue={user?.bio}
            multiline
            style={styles.textArea}
          />
        ) : (
          <Text style={styles.bio}>{userr?.bio}</Text>
        )}
      </View>
      <View style={styles.upgradeSection}>
        <Text style={styles.upgradeTitle}>Upgrade Your Experience</Text>
        <Text style={styles.upgradeText}>
          Get more matches and premium features!
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.replace("../../subscription")}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickInfoSection}>
        <Text style={styles.quickInfoTitle}>Quick Info</Text>
        <View style={styles.quickInfoGrid}>
          {[
            { icon: "👔", label: "Work", value: userr?.occupationArea },
            { icon: "🎓", label: "Education", value: userr?.occupationField },
            { icon: "🍷", label: "Drinks", value: userr?.drink },
            { icon: "🚬", label: "Smokes", value: userr?.smoke },
            { icon: "🙏", label: "Religion", value: userr?.religion },
            {
              icon: "💑",
              label: "Looking for",
              value: userr?.relationshiptype,
            },
          ].map(
            ({ icon, label, value }): JSX.Element => (
              <View key={label} style={styles.quickInfoItem}>
                <Text style={styles.quickInfoIcon}>{icon}</Text>
                <View style={styles.quickInfoTextContainer}>
                  <Text style={styles.quickInfoLabel}>{label}</Text>
                  <Text style={styles.quickInfoValue}>{value}</Text>
                </View>
                {editing && (
                  <TouchableOpacity>
                    <Edit2 style={styles.editCardIcon} />
                  </TouchableOpacity>
                )}
              </View>
            ),
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  header: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  icon: {
    width: 24,
    height: 24,
  },
  nameActions: {
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
  },
  location: {
    color: "#A0AEC0",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#8B5CF6",
    borderRadius: 50,
  },
  editIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    color: "white",
  },
  editText: {
    color: "white",
    fontSize: 16,
  },
  photoGallery: {
    flexDirection: "row",
    marginTop: 16,
  },
  photoGalleryContainer: {
    alignItems: "center", // Center the content
  },
  photoGalleryContent: {
    justifyContent: "center", // Center the items within the ScrollView
    paddingHorizontal: 16, // Optional: Add padding for aesthetics
  },
  photoContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cameraButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cameraIcon: {
    width: 24,
    height: 24,
    color: "white",
  },
  aboutSection: {
    marginBottom: 30,
    marginTop: 20,
    padding: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: "#4A5568",
  },
  textArea: {
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    height: 100,
  },
  quickInfoSection: {
    marginBottom: 40,
  },
  quickInfoTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickInfoGrid: {
    flexDirection: "column",
  },
  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
    backgroundColor: "rgba(139, 92, 246, 0.04)",
    padding: 12,
    borderRadius: 8,
  },
  quickInfoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  quickInfoTextContainer: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 14,
    color: "#A0AEC0",
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 16,
    color: "#2D3748",
  },
  editCardIcon: {
    width: 16,
    height: 16,
    color: "#A0AEC0",
  },
  upgradeSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    marginBottom: 30,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 16,
    color: "#EDE9FE",
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
});
