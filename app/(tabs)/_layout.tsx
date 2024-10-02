import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default (): JSX.Element => (
  <Tabs
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false, // Hide the labels
      tabBarStyle: {
        backgroundColor: "transparent", // Set background color to transparent
        height: 60, // Adjust height if needed
        borderTopWidth: 0, // Remove top border
        elevation: 0, // Remove elevation for a flat look
        shadowOpacity: 0, // No shadow
        paddingBottom: 10, // Add padding for icons
      },
      tabBarActiveTintColor: "#8B5CF6", // Active icon color
      tabBarInactiveTintColor: "#9E9E9E", // Inactive icon color
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        // Determine which icon to show based on the current route
        if (route.name === "homeScreen/index") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "chatScreen/index") {
          iconName = focused ? "chatbubble" : "chatbubble-outline";
        } else if (route.name === "likeScreen") {
          iconName = focused ? "heart" : "heart-outline";
        } else if (route.name === "profileScreen/index") {
          iconName = focused ? "person" : "person-outline";
        } else {
          iconName = "alert-circle"; // Default icon if none of the above match
        }

        // Return the icon
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarIconStyle: {
        marginTop: 5, // Adjust the space above icons
      },
    })}
  >
    <Tabs.Screen name="homeScreen" options={{ headerTitle: "Home" }} />
    <Tabs.Screen name="chatScreen" options={{ headerTitle: "Chat" }} />
    <Tabs.Screen name="likeScreen" options={{ headerTitle: "Likes" }} />
    <Tabs.Screen name="profileScreen" options={{ headerTitle: "Profile" }} />
  </Tabs>
);
