import AppHeader from "@/components/appheader";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;
const LAPTOPS_URL = `${API_BASE}/api/laptops`;

type LaptopItem = {
  _id: string;
  brand_name?: string;
  model?: string;
  price?: number | null;
  rating?: number | null;
  processor?: string;
  ram?: string;
  memory_size?: number | null;
  memory_type?: string;
  gpu_brand?: string;
  gpu_type?: string;
  image_url?: string | null;
  category?: string;
  os?: string;
  [key: string]: any;
};

const formatNrs = (n?: number | null) =>
  typeof n === "number" ? `NRs ${n.toLocaleString("en-US")}` : "NRs —";

function subtitle(l: LaptopItem) {
  const cpu = l.processor ?? "";
  const ram = l.ram ?? "";
  const storage = l.memory_size
    ? `${l.memory_size}GB ${l.memory_type ?? ""}`.trim()
    : "";
  const gpu = l.gpu_brand ? `${l.gpu_brand} ${l.gpu_type ?? ""}`.trim() : "";
  return [cpu, ram, storage, gpu].filter(Boolean).join(" • ");
}

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-3 py-2 rounded-full mr-2 mb-2 ${active ? "bg-indigo-600" : "bg-slate-100"
      }`}
  >
    <Text
      className={`${active ? "text-white" : "text-slate-700"} text-xs font-semibold`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function Laptops() {
  const router = useRouter();

  const [laptops, setLaptops] = useState<LaptopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "rating_desc">(
    "price_asc"
  );

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(LAPTOPS_URL, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setLaptops(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Network error");
      setLaptops([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const brandOptions = useMemo(() => {
    const all = laptops
      .map((l) => l.brand_name)
      .filter(Boolean)
      .map((x) => String(x).trim())
      .filter((x) => x.length > 0);

    return ["All", ...Array.from(new Set(all)).sort()];
  }, [laptops]);

  const categoryOptions = useMemo(() => {
    const all = laptops
      .map((l) => l.category)
      .filter(Boolean)
      .map((x) => String(x).trim())
      .filter((x) => x.length > 0);

    return ["All", ...Array.from(new Set(all)).sort()];
  }, [laptops]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = laptops.filter((l) => {
      if (brand !== "All" && (l.brand_name ?? "") !== brand) return false;
      if (category !== "All" && (l.category ?? "") !== category) return false;

      if (!query) return true;

      const haystack = [
        l.brand_name,
        l.model,
        l.processor,
        l.gpu_brand,
        l.gpu_type,
        l.ram,
        l.os,
        l.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

    return list;
  }, [laptops, q, brand, category, sort]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppHeader />

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-slate-900 mb-3">Laptops</Text>

        <View className="bg-slate-100 rounded-2xl px-4 py-3 mb-3">
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search model, brand, CPU, GPU..."
            placeholderTextColor="#94A3B8"
            className="text-slate-900"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text className="text-slate-500 text-xs font-semibold mb-2">BRAND</Text>
        <View className="flex-row flex-wrap mb-2">
          {brandOptions.map((b) => (
            <Chip
              key={b}
              label={b}
              active={brand === b}
              onPress={() => setBrand(b)}
            />
          ))}
        </View>

        <Text className="text-slate-500 text-xs font-semibold mb-2">
          CATEGORY
        </Text>
        <View className="flex-row flex-wrap mb-2">
          {categoryOptions.map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>

        <Text className="text-slate-500 text-xs font-semibold mb-2">SORT</Text>
        <View className="flex-row mb-4">
          <Chip
            label="Price ↑"
            active={sort === "price_asc"}
            onPress={() => setSort("price_asc")}
          />
          <Chip
            label="Price ↓"
            active={sort === "price_desc"}
            onPress={() => setSort("price_desc")}
          />
          <Chip
            label="Rating"
            active={sort === "rating_desc"}
            onPress={() => setSort("rating_desc")}
          />
        </View>

        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" />
            <Text className="text-slate-500 mt-3">Loading…</Text>
          </View>
        ) : error ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <Text className="text-red-600 font-semibold">
              Failed to load laptops
            </Text>
            <Text className="text-red-500 mt-1">{error}</Text>
          </View>
        ) : (
          <>
            <Text className="text-slate-500 text-sm mb-3">
              Showing {filtered.length} results
            </Text>

            {filtered.map((l) => (
              <TouchableOpacity
                key={l._id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row"
                onPress={() =>
                  router.push({
                    pathname: "/laptop/[id]",
                    params: { id: l._id },
                  })
                }
                activeOpacity={0.85}
              >
                <Image
                  source={{
                    uri:
                      l.image_url && l.image_url.length > 0
                        ? l.image_url
                        : "https://via.placeholder.com/128",
                  }}
                  className="w-20 h-20 rounded-xl mr-4 bg-slate-100"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  <Text className="font-bold text-slate-900" numberOfLines={2}>
                    {l.model || "Unnamed laptop"}
                  </Text>

                  <Text className="text-slate-500 text-sm mt-1" numberOfLines={2}>
                    {subtitle(l)}
                  </Text>

                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-indigo-600 font-bold">
                      {formatNrs(l.price)}
                    </Text>

                    <View className="flex-row items-center">
                      <AntDesign name="star" size={16} color="#facc15" />
                      <Text className="text-slate-500 text-sm ml-1">
                        {typeof l.rating === "number" ? l.rating.toFixed(2) : "—"}
                      </Text>
                    </View>
                  </View>

                  {l.brand_name ? (
                    <Text className="text-slate-400 text-xs mt-1">
                      Brand: {l.brand_name}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}

            {filtered.length === 0 ? (
              <Text className="text-center text-slate-500 mt-10 mb-10">
                No laptops match your search.
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}