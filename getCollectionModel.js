import React from "react";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PartItem } from "./PickerModel";
import { subtitleFor } from "./PickerModel";

type ComponentKey = "CPU" | "COL" | "GPU" | "RAM" | "MB" | "STO" | "PSU" | "CAS";

const formatNrs = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "NRs —";
  return `NRs ${value.toLocaleString("en-US")}`;
};

export default function OverviewModal({
  visible,
  rows,
  totalPrice,
  selectedCount,
  totalCount,
  missingText,
  onClose,
  onClearAll,
  onChange,
  onRemove,
}: {
  visible: boolean;
  rows: { key: ComponentKey; label: string; item: PartItem | null }[];
  totalPrice: number;
  selectedCount: number;
  totalCount: number;
  missingText: string | null;
  onClose: () => void;
  onClearAll: () => void;
  onChange: (key: ComponentKey) => void;
  onRemove: (key: ComponentKey) => void;
}) {
  function confirmClear() {
    Alert.alert("Clear all selections?", "This will remove all chosen parts.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: onClearAll },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 border-b border-slate-200 flex-row justify-between items-center">
          <Text className="text-lg font-bold">Build Overview</Text>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={confirmClear}
              className="bg-slate-100 px-4 py-2 rounded-full mr-3"
            >
              <Text className="text-slate-700 font-semibold text-sm">Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text className="text-indigo-600 font-bold text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-slate-500 text-xs font-semibold tracking-wider">TOTAL</Text>
            <Text className="text-indigo-600 text-2xl font-bold mt-1">{formatNrs(totalPrice)}</Text>
            <Text className="text-slate-500 text-sm mt-1">
              Selected components: {selectedCount} / {totalCount}
            </Text>

            {missingText ? (
              <View className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <Text className="text-amber-700 font-semibold">{missingText}</Text>
                <Text className="text-amber-700 text-xs mt-1">
                  Tip: tap “Change” beside a component to select it.
                </Text>
              </View>
            ) : (
              <View className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                <Text className="text-emerald-700 font-semibold">
                  All components selected. You’re ready!
                </Text>
              </View>
            )}
          </View>

          {rows.map((row, index) => {
            const picked = row.item;
            const sub = picked ? subtitleFor(row.key, picked) : "";

            return (
              <View key={row.key} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-4">
                    <Text className="text-slate-700 font-bold">{index + 1}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-slate-500 text-xs font-semibold tracking-wider">
                      {row.label}
                    </Text>

                    {picked ? (
                      <>
                        <Text className="text-slate-900 font-bold mt-1" numberOfLines={2}>
                          {picked.name}
                        </Text>

                        {sub ? (
                          <Text className="text-slate-500 text-sm mt-1" numberOfLines={2}>
                            {sub}
                          </Text>
                        ) : null}

                        <Text className="text-indigo-600 font-bold mt-2">
                          {formatNrs(picked.price)}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-slate-400 italic mt-1">Not selected</Text>
                    )}
                  </View>

                  <View className="ml-3">
                    <TouchableOpacity
                      onPress={() => onChange(row.key)}
                      className="bg-indigo-600 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-semibold text-sm">Change</Text>
                    </TouchableOpacity>

                    {picked ? (
                      <TouchableOpacity
                        onPress={() => onRemove(row.key)}
                        className="bg-slate-100 px-4 py-2 rounded-full mt-2"
                      >
                        <Text className="text-slate-700 font-semibold text-sm">Remove</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
