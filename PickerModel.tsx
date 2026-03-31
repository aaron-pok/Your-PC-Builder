import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Includes RAM1/RAM2 and STO1/STO2 slots
type ComponentKey =
  | "CPU" | "COL" | "GPU"
  | "RAM" | "RAM1" | "RAM2"
  | "MB"
  | "STO" | "STO1" | "STO2"
  | "PSU" | "CAS";

export type PartItem = {
  _id: string;
  name: string;
  price?: number | null;
  image_url?: string | null;
  [key: string]: any;
};

const formatNrs = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "NRs —";
  return `NRs ${value.toLocaleString("en-US")}`;
};

// Normalize slot keys before subtitle lookup
function resolveKey(key: ComponentKey): ComponentKey {
  if (key === "RAM1" || key === "RAM2") return "RAM";
  if (key === "STO1" || key === "STO2") return "STO";
  return key;
}

export function subtitleFor(key: ComponentKey, it: PartItem): string {
  const resolved = resolveKey(key);

  if (resolved === "CPU") {
    const cores = it.core_count ? `${it.core_count} cores` : "";
    const boost = it.boost_clock ? `${it.boost_clock}GHz boost` : "";
    const socket = it.socket ? `${it.socket}` : "";
    return [cores, boost, socket].filter(Boolean).join(" • ");
  }

  if (resolved === "GPU") {
    const chipset = it.chipset ?? "";
    const mem = it.memory ? `${it.memory}GB` : "";
    return [chipset, mem].filter(Boolean).join(" • ");
  }

  if (resolved === "COL") {
    const size = it.size ? `${it.size}mm` : "";
    let rpm = "";
    if (Array.isArray(it.rpm)) rpm = `${it.rpm[0]}-${it.rpm[1]} RPM`;
    else if (typeof it.rpm === "number") rpm = `${it.rpm} RPM`;
    return [size, rpm].filter(Boolean).join(" • ");
  }

  if (resolved === "RAM") {
    const size = it.size ?? "";
    const speed = Array.isArray(it.speed)
      ? `${it.speed[0]}MHz`
      : it.speed ? `${it.speed}MHz` : "";
    const type = it.type ?? "";
    return [size, speed, type].filter(Boolean).join(" • ");
  }

  if (resolved === "MB") {
    const socket = it.socket_mb ?? it.socket ?? "";
    const chipset = it.chipset_mb ?? it.chipset ?? "";
    const ff = it.form_factor ?? "";
    return [socket, chipset, ff].filter(Boolean).join(" • ");
  }

  if (resolved === "STO") {
    const cap = it.capacity ? `${it.capacity}GB` : "";
    const type = it.type ?? "";
    const iface = it.interface_type ?? "";
    return [cap, type, iface].filter(Boolean).join(" • ");
  }

  if (resolved === "PSU") {
    const watt = it.wattage ? `${it.wattage}W` : "";
    const eff = it.efficiency ?? "";
    return [watt, eff].filter(Boolean).join(" • ");
  }

  if (resolved === "CAS") {
    const type = it.type ?? "";
    const sp = it.side_panel ? `${it.side_panel}` : "";
    return [type, sp].filter(Boolean).join(" • ");
  }

  return "";
}

export default function PickerModal({
  visible,
  title,
  activeKey,
  items,
  loading,
  error,
  onClose,
  onPick,
}: {
  visible: boolean;
  title: string;
  activeKey: ComponentKey | null;
  items: PartItem[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onPick: (item: PartItem) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter((it) => {
      const name = String(it.name ?? "").toLowerCase();
      const subtitle = activeKey ? subtitleFor(activeKey, it).toLowerCase() : "";
      const chipset = String(it.chipset ?? "").toLowerCase();
      const socket = String(it.socket ?? "").toLowerCase();
      const type = String(it.type ?? "").toLowerCase();
      const brand = String(it.brand ?? "").toLowerCase();
      const formFactor = String(it.form_factor ?? "").toLowerCase();
      const interfaceType = String(it.interface_type ?? "").toLowerCase();

      return (
        name.includes(q) ||
        subtitle.includes(q) ||
        chipset.includes(q) ||
        socket.includes(q) ||
        type.includes(q) ||
        brand.includes(q) ||
        formFactor.includes(q) ||
        interfaceType.includes(q)
      );
    });
  }, [items, search, activeKey]);

  function handleClose() {
    setSearch("");
    onClose();
  }

  function handlePick(item: PartItem) {
    setSearch("");
    onPick(item);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="p-4 border-b border-slate-200 flex-row justify-between items-center">
          <Text className="text-lg font-bold">{title}</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-indigo-600 font-bold text-base">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="px-4 pt-4">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search component..."
            className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900 bg-white"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
          {/* Loading */}
          {loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
              <Text className="text-slate-500 mt-3">Loading…</Text>
            </View>

          /* Error */
          ) : error ? (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <Text className="text-red-600 font-semibold">Failed to load</Text>
              <Text className="text-red-500 mt-1">{error}</Text>
            </View>

          /* Items list */
          ) : (
            filteredItems.map((it, idx) => {
              const sub = activeKey ? subtitleFor(activeKey, it) : "";
              return (
                <View
                  key={`${it._id}-${idx}`}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row justify-between"
                >
                  <View className="flex-row flex-1">
                    <Image
                      source={{ uri: it.image_url || "https://via.placeholder.com/96" }}
                      className="w-16 h-16 rounded-xl mr-4 bg-slate-100"
                    />
                    <View className="flex-1">
                      <Text className="font-bold text-slate-900" numberOfLines={1}>
                        {it.name}
                      </Text>
                      {sub ? (
                        <Text className="text-slate-500 text-sm mt-1" numberOfLines={1}>
                          {sub}
                        </Text>
                      ) : null}
                      <Text className="text-indigo-600 font-bold mt-1">
                        {formatNrs(it.price)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePick(it)}
                    className="bg-indigo-600 px-4 py-2 rounded-full self-center ml-3"
                  >
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <Text className="text-slate-500 text-center mt-6">
              No matching items found.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}