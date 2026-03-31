// app/(tabs)/index.tsx
import AppHeader from "@/components/appheader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.8, 320);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <AppHeader />

        {/* ── Hero ── */}
        <View className="mx-4 mt-4 mb-6 bg-indigo-500 rounded-3xl p-7 shadow-lg">
          <Text className="text-white text-2xl font-bold mb-3">
            Build Your Dream PC
          </Text>
          <Text className="text-indigo-100 mb-5 leading-6">
            Custom components, expert compatibility checks, and AI-powered advice.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/build")}
            className="bg-white self-start px-6 py-3 rounded-full"
          >
            <Text className="text-indigo-600 font-semibold">Start Building</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recommended header ── */}
        <View className="mx-4 mb-4 flex-row justify-between items-center">
          <Text className="text-slate-900 font-bold text-lg">
            Recommended Pre-builds
          </Text>
          <TouchableOpacity onPress={() => router.push("/prebuilts")}>
            <Text className="text-indigo-600 font-semibold text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        {/* ── Horizontal Cards ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
        >
          {/* Card 1 */}
          <TouchableOpacity
            style={{ width: cardWidth }}
            className="bg-white rounded-3xl shadow-md mr-5 overflow-hidden"
            onPress={() => router.push(`/prebuilt/696df7b2dddf36f801af307c` as any)}
            activeOpacity={0.85}
          >
            <Image
              source={{
                uri: "https://c1.neweggimages.com/productimage/nb640/B11ND2507150I2QWQ64.jpg",
              }}
              className="h-40 w-full bg-slate-100"
              resizeMode="contain"
            />
            <View className="p-5">
              <Text className="font-bold text-slate-900 mb-1">
                Ultimate Game Power
              </Text>
              <Text className="text-slate-500 text-sm mb-3">
                Crush any 4K game with ease. Features top-tier internals and custom
                loop cooling.
              </Text>
              <View className="border-t border-slate-100 pt-3 flex-row justify-between items-center">
                <Text
                  className="text-indigo-600 font-bold text-lg"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  NRs 164,306
                </Text>
                <View className="bg-indigo-50 px-3 py-1 rounded-full">
                  <Text className="text-indigo-600 text-xs font-semibold">
                    View Details →
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity
            style={{ width: cardWidth }}
            className="bg-white rounded-3xl shadow-md mr-5 overflow-hidden"
            onPress={() => router.push(`/prebuilt/696dfeddf66d9075133afefe` as any)}
            activeOpacity={0.85}
          >
            <Image
              source={{
                uri: "https://c1.neweggimages.com/productimage/nb1280/A65ED26011418ZIQGAC.jpg",
              }}
              className="h-40 w-full bg-slate-100"
              resizeMode="contain"
            />
            <View className="p-5">
              <Text className="font-bold text-slate-900 mb-1">
                Compact Office Beast
              </Text>
              <Text className="text-slate-500 text-sm mb-3">
                High-performance hardware packed into a small-form-factor chassis
                to reclaim your desk space.
              </Text>
              <View className="border-t border-slate-100 pt-3 flex-row justify-between items-center">
                <Text
                  className="text-indigo-600 font-bold text-lg"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  NRs 216,050
                </Text>
                <View className="bg-indigo-50 px-3 py-1 rounded-full">
                  <Text className="text-indigo-600 text-xs font-semibold">
                    View Details →
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* ── AI Card ── */}
        <View className="mx-4 mt-5 mb-5 p-5 bg-white rounded-3xl shadow-md flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-11 h-11 rounded-2xl bg-indigo-100 items-center justify-center mr-4">
              <Ionicons name="sparkles" size={22} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-slate-900 mb-1">
                Need help with parts?
              </Text>
              <Text className="text-sm text-slate-500 leading-5">
                Ask our AI consultant for the best bang for your buck.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/chat")}
            className="bg-indigo-600 px-5 py-2.5 rounded-full ml-4"
          >
            <Text className="text-white font-semibold">Chat</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
