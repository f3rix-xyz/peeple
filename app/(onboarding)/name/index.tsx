import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAtom, useAtomValue } from "jotai";
import { bioAtom, emailAtom, nameAtom } from "@/lib/atom";
import { router } from "expo-router";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { useUser } from "@clerk/clerk-expo";

// Colored console logging function
const logWithColor = (message: string, color: string = "\x1b[37m") => {
  console.log(`${color}%s\x1b[0m`, message);
};

const uploadImageToS3 = async (
  username: string,
  imageUri: string,
  imageNumber: number,
) => {
  const filename = `${username}-${imageNumber}.jpeg`;
  logWithColor(`Starting image upload for: ${filename}`, "\x1b[34m"); // Blue

  try {
    let uploadUrl = "";

    try {
      console.log("ayush is");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API}/upload-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename,
          }),
        },
      );
      console.log("comming back");
      if (!response.ok) {
        throw new Error(
          `Failed to upload image. Status: ${response.status} - ${response.statusText}`,
        );
      }

      const result = await response.json();
      uploadUrl = result.uploadUrl;
      console.log("Upload URL:", uploadUrl); // This URL can be used to upload the actual file to S3
    } catch (error: any) {
      console.error("Error during upload image request:", error.message);
    }
    // Fetch image as blob
    logWithColor(`Fetching image from URI: ${imageUri}`, "\x1b[34m"); // Blue
    const response = await fetch(imageUri);
    if (!response.ok) {
      logWithColor(`Failed to fetch image from URI: ${imageUri}`, "\x1b[31m"); // Red
      throw new Error(
        `Image fetch failed with status: ${response.status} - ${response.statusText}`,
      );
    }
    const blob = await response.blob();
    logWithColor(
      `Fetched image as blob successfully. Size: ${blob.size} bytes`,
      "\x1b[32m",
    ); // Green

    // Make the PUT request to upload the image using the signed URL
    logWithColor(`Uploading image using signed URL...`, "\x1b[34m"); // Blue
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (uploadResponse.ok) {
      logWithColor(`Image uploaded successfully: ${filename}`, "\x1b[32m"); // Green
    } else {
      const errorText = await uploadResponse.text();
      logWithColor(
        `Failed to upload image: ${filename} with status: ${uploadResponse.status} - ${errorText}`,
        "\x1b[31m",
      ); // Red
      throw new Error(
        `Image upload failed with status: ${uploadResponse.status} - ${errorText}`,
      );
    }
    // GET
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API}/generate-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filename }),
        },
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log(`Generated Signed URL: ${data.url}`);
      return data;
    } catch (error: any) {
      console.error(`Error fetching signed URL: ${error.message}`);
      throw error;
    }
  } catch (e: any) {
    logWithColor(`Error during upload process: ${e.message}`, "\x1b[31m"); // Red
    // Include contextual information
    logWithColor(
      `Error context - Username: ${username}, Image URI: ${imageUri}, Image Number: ${imageNumber}`,
      "\x1b[31m",
    ); // Red
    throw e; // Rethrow the error for further handling if needed
  }
};

export default (): JSX.Element => {
  const [name, setName] = useAtom<string>(nameAtom);
  const [bio, setBio] = useAtom<string>(bioAtom);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Validation states
  const [nameError, setNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const email = useAtomValue(emailAtom);
  const handleImageUpload = async () => {
    logWithColor("Opening image picker", "\x1b[36m"); // Cyan
    if (images.length >= 4) {
      logWithColor("Max 4 images reached", "\x1b[33m"); // Yellow
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImageUri = result.assets[0].uri;
      logWithColor(`Image URI: ${newImageUri}`, "\x1b[34m"); // Blue
      setImages([...images, newImageUri]);
    }
  };

  const handleDeleteImage = (index: number) => {
    logWithColor(`Deleting image at index: ${index}`, "\x1b[31m"); // Red
    setImages(images.filter((_, i) => i !== index));
  };

  const validateFields = (): boolean => {
    let valid = true;

    logWithColor("Validating fields...", "\x1b[36m"); // Cyan

    if (!name || name.trim() === "") {
      setNameError("Name is required.");
      logWithColor("Name validation failed", "\x1b[31m"); // Red
      valid = false;
    } else {
      setNameError(null);
    }

    if (!bio || bio.trim().length < 20) {
      setBioError("Bio must be at least 20 characters.");
      logWithColor("Bio validation failed", "\x1b[31m"); // Red
      valid = false;
    } else {
      setBioError(null);
    }

    if (images.length === 0) {
      setImageError("Please upload at least one image.");
      logWithColor("Image validation failed", "\x1b[31m"); // Red
      valid = false;
    } else {
      setImageError(null);
    }

    logWithColor(`Validation result: ${valid}`, "\x1b[36m"); // Cyan
    return valid;
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      setLoading(true); // Start loading
      logWithColor(
        "Validation passed. Proceeding with submission.",
        "\x1b[32m",
      ); // Green

      try {
        for (let i = 0; i < images.length; i++) {
          const { url, filename } = await uploadImageToS3(
            email,
            images[i],
            i + 1,
          );
          console.log("URL:", url);
          console.log("Filename:", filename);

          await fetch(`${process.env.EXPO_PUBLIC_API}/profile-images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              url,
            }),
          });
        }

        router.replace("/(onboarding)/gender"); // Redirect after upload
      } catch (error: any) {
        logWithColor(`Error during submission: ${error.message}`, "\x1b[31m"); // Red
      } finally {
        setLoading(false); // Stop loading after everything completes
      }
    } else {
      logWithColor("Validation failed. Not submitting.", "\x1b[31m"); // Red
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Create Your Profile</Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#A78BFA"
        />
        {nameError && <Text style={styles.errorText}>{nameError}</Text>}

        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          placeholderTextColor="#A78BFA"
        />
        {bioError && <Text style={styles.errorText}>{bioError}</Text>}

        {/* Image Upload Section */}
        <View style={styles.imagesContainer}>
          {images.map(
            (image: string, index: number): JSX.Element => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteImage(index)}
                >
                  <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
              </View>
            ),
          )}
          {images.length < 4 && (
            <TouchableOpacity
              style={styles.imageUpload}
              onPress={handleImageUpload}
            >
              <Text style={styles.uploadText}>Upload Image</Text>
            </TouchableOpacity>
          )}
        </View>
        {imageError && <Text style={styles.errorText}>{imageError}</Text>}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Spinner */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B5CF6",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#8B5CF6",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Light transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Ensures it appears on top
  },

  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  imageWrapper: {
    position: "relative",
    width: "48%",
    height: 150,
    marginBottom: 16,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 20,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
  imageUpload: {
    width: "48%",
    height: 150,
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    color: "#8B5CF6",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
