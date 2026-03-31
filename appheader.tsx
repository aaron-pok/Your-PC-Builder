import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function AppHeader() {
  const router = useRouter();

  return (
    <View className="my-3 bg-white">
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.7}
        >
          <Text className="ml-3 text-lg font-bold text-slate-900">
            YourPCbuilder
          </Text>
        </TouchableOpacity>
      </View>

      <View className="h-[1px] bg-slate-200" />
    </View>
  );
}