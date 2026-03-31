import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iconMap: any = {
  home: (props: any) => <Feather name="home" {...props} />,
  build: (props: any) => <Ionicons name="build-outline" {...props} />,
  prebuilts: (props: any) => (
    <MaterialCommunityIcons name="desktop-tower" {...props} />
  ),
  chat: (props: any) => <Ionicons name="chatbubble-outline" {...props} />,
  laptops: (props: any) => <Ionicons name="laptop-outline" {...props} />,
};

const TabIcon = ({ title, icon, focused }: any) => {
  const Icon = iconMap[icon];

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Icon size={22} color={focused ? "#4F46E5" : "#94A3B8"} />
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={{
          fontSize: 8,
          marginTop: 3,
          color: focused ? "#4F46E5" : "#94A3B8",
          fontWeight: focused ? "600" : "400",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default function Layout() {
    const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 6,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",

          // fix: respect safe area
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 56 + Math.max(insets.bottom, 8),
        },
      }}
    >
    
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Home" icon="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="build"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Build" icon="build" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="laptops"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Laptop" icon="laptops" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="prebuilts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon title="PCs" icon="prebuilts" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Chat" icon="chat" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
