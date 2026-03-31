import AppHeader from "@/components/appheader";
import { AntDesign, Ionicons } from "@expo/vector-icons";
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
const PREBUILTS_URL = `${API_BASE}/api/prebuilts`;

type PrebuiltItem = {
  _id: string;

  brand_name?: string;
  series?: string;
  model?: string;

  price?: number | null;
  rating?: number | null;

  category?: string; 
  type?: string;

  // specs
  processor?: string;
  gpu_model?: string;

  ram_size?: number | null;
  ram_type?: string;
  ram?: string;

  storage_size?: number | null;
  storage_type?: string;
  storage?: string;

  motherboard?: string;
  psu?: string;
  psu_wattage?: number | null;

  image_url?: string | null;

  [key: string]: any;
};

const formatNrs = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "NRs —";
  return `NRs ${value.toLocaleString("en-US")}`;
};

const Tag = ({ label }: { label: string }) => (
  <View className="bg-indigo-100 px-3 py-1 rounded-full mr-2 mb-2">
    <Text className="text-indigo-600 text-xs font-semibold">{label}</Text>
  </View>
);

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
      className={`text-xs font-semibold ${active ? "text-white" : "text-slate-700"
        }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const SpecRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-slate-500 text-xs">{label}</Text>
      <Text className="text-slate-900 text-xs font-semibold" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

function buildRamText(p: PrebuiltItem) {
  if (p.ram_size) return `${p.ram_size}GB${p.ram_type ? ` ${p.ram_type}` : ""}`;
  return p.ram ?? "";
}

function buildStorageText(p: PrebuiltItem) {
  if (p.storage_size)
    return `${p.storage_size}GB${p.storage_type ? ` ${p.storage_type}` : ""}`;
  return p.storage ?? "";
}

function buildPsuText(p: PrebuiltItem) {
  if (p.psu_wattage) return `${p.psu_wattage}W`;
  return p.psu ?? "";
}

const PrebuildCard = ({ item }: { item: PrebuiltItem }) => {
  const tags = [item.category, item.brand_name].filter(Boolean) as string[];

  return (
    <View className="bg-white rounded-3xl shadow-md mb-6 overflow-hidden">
      <Image
        source={{ uri: item.image_url || "https://via.placeholder.com/800x400" }}
        className="h-44 w-full bg-slate-100"
        resizeMode="contain"
      />

      {/* Tags */}
      {tags.length > 0 ? (
        <View className="absolute top-3 left-3 flex-row flex-wrap">
          {tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      ) : null}

      <View className="p-5">
        {/* Title */}
        <Text className="text-lg font-bold text-slate-900" numberOfLines={2}>
          {item.model || "Unnamed prebuilt"}
        </Text>

        {/* Meta */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-slate-500 text-sm" numberOfLines={1}>
            {item.type || "Desktop"}
            {item.series ? ` • ${item.series}` : ""}
          </Text>
          <Text className="text-slate-500 text-sm">
            <AntDesign name="star" size={18} color="#ffe234" />
            {typeof item.rating === "number" ? item.rating.toFixed(1) : "—"}
          </Text>
        </View>

        {/* Price */}
        <View className="mt-4">
          <Text className="text-xs text-slate-400 font-semibold">PRICE</Text>
          <Text className="text-indigo-600 text-2xl font-bold">
            {formatNrs(item.price)}
          </Text>
        </View>

        {/* Specifications */}
        <View className="mt-4 bg-slate-50 rounded-2xl p-4">
          <Text className="text-slate-900 font-bold mb-2">Specifications</Text>
          <SpecRow label="CPU" value={item.processor} />
          <SpecRow label="GPU" value={item.gpu_model} />
          <SpecRow label="RAM" value={buildRamText(item) || undefined} />
          <SpecRow label="Storage" value={buildStorageText(item) || undefined} />
          <SpecRow label="Motherboard" value={item.motherboard} />
          <SpecRow label="PSU" value={buildPsuText(item) || undefined} />
        </View>
      </View>
    </View>
  );
};

export default function Prebuilts() {
  const [data, setData] = useState<PrebuiltItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // search + filters
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "rating_desc">(
    "price_asc"
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PREBUILTS_URL, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError(e?.message ?? "Network error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categoryOptions = useMemo(() => {
    const all = data
      .map((x) => x.category)
      .filter(Boolean)
      .map((x) => String(x).trim())
      .filter((x) => x.length > 0);

    return ["All", ...Array.from(new Set(all)).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = data.filter((p) => {
      if (category !== "All" && (p.category ?? "") !== category) return false;

      if (!query) return true;

      const hay = [
        p.brand_name,
        p.series,
        p.model,
        p.processor,
        p.gpu_model,
        p.ram_type,
        p.storage_type,
        p.category,
        p.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });

    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

    return list;
  }, [data, q, category, sort]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppHeader />

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2 mb-3">
          <Text className="text-xl font-bold text-slate-900">Prebuilt PCs</Text>
          <TouchableOpacity
            onPress={load}
            className="bg-slate-100 px-3 py-2 rounded-full"
          >
            <Text className="text-slate-700 font-semibold text-xs">Reload</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="bg-slate-100 rounded-2xl px-4 py-3 mb-3 flex-row items-center">
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search model, CPU, GPU, brand..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-slate-900"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Category chips */}
        <Text className="text-slate-500 text-xs font-semibold mb-2">
          CATEGORY
        </Text>
        <View className="flex-row flex-wrap mb-2">
          {categoryOptions.slice(0, 8).map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>

        {/* Sort chips */}
        <Text className="text-slate-500 text-xs font-semibold mb-2">SORT</Text>
        <View className="flex-row flex-wrap mb-4">
          <Chip
            label="Price Low"
            active={sort === "price_asc"}
            onPress={() => setSort("price_asc")}
          />
          <Chip
            label="Price High"
            active={sort === "price_desc"}
            onPress={() => setSort("price_desc")}
          />
          <Chip
            label="Rating"
            active={sort === "rating_desc"}
            onPress={() => setSort("rating_desc")}
          />
        </View>

        {/* Content */}
        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" />
            <Text className="text-slate-500 mt-3">Loading…</Text>
          </View>
        ) : error ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <Text className="text-red-600 font-semibold">Failed to load</Text>
            <Text className="text-red-500 mt-1">{error}</Text>
            <Text className="text-slate-500 mt-2">
              Make sure backend has GET /api/prebuilts and phone can reach{" "}
              {API_BASE}
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-slate-500 text-sm mb-3">
              Showing {filtered.length} results
            </Text>

            {/* {filtered.map((item) => (
              <PrebuildCard key={item._id} item={item} />
            ))} */}
            {filtered.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => 
                  router.push(`/prebuilt/${item._id}` as any)}
                activeOpacity={0.85}
              >
                <PrebuildCard item={item} />
              </TouchableOpacity>
            ))}
           
            {filtered.length === 0 ? (
              <Text className="text-center text-slate-500 mt-10">
                No prebuilts match your search.
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
