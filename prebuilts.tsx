import AppHeader from "@/components/appheader";
import OverviewModal from "@/components/OverviewModel";
import PickerModal, { PartItem, subtitleFor } from "@/components/PickerModel";
import { checkCompatibility } from "@/utils/compatibility";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  LayoutAnimation,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type ComponentKey =
  | "CPU" | "COL" | "GPU"
  | "RAM1" | "RAM2"
  | "MB"
  | "STO1" | "STO2"
  | "PSU" | "CAS";

// ─── Constants ────────────────────────────────────────────────────────────────

const SINGLE_COMPONENTS: { key: ComponentKey; label: string }[] = [
  { key: "MB",  label: "MOTHERBOARD" },
  { key: "CPU", label: "CPU" },
  { key: "GPU", label: "GPU" },
  { key: "PSU", label: "POWER SUPPLY" },
  { key: "COL", label: "CPU COOLER" },
  { key: "CAS", label: "CASE" },
];

const RAM_SLOTS: ComponentKey[] = ["RAM1", "RAM2"];
const STO_SLOTS: ComponentKey[] = ["STO1", "STO2"];

const ALL_KEYS: ComponentKey[] = [
  "CPU", "COL", "GPU", "RAM1", "RAM2", "MB", "STO1", "STO2", "PSU", "CAS",
];

const REQUIRED_KEYS: ComponentKey[] = [
  "CPU", "COL", "GPU", "RAM1", "MB", "STO1", "PSU", "CAS",
];

const REQUIRED_LABEL: Partial<Record<ComponentKey, string>> = {
  CPU: "CPU", COL: "CPU COOLER", GPU: "GPU", RAM1: "RAM",
  MB: "MOTHERBOARD", STO1: "STORAGE", PSU: "POWER SUPPLY", CAS: "CASE",
};

const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

const ENDPOINTS: Record<ComponentKey, string> = {
  CPU:  "/api/cpus",
  COL:  "/api/coolers",
  GPU:  "/api/gpus",
  RAM1: "/api/rams",
  RAM2: "/api/rams",
  MB:   "/api/motherboards",
  STO1: "/api/storages",
  STO2: "/api/storages",
  PSU:  "/api/psus",
  CAS:  "/api/cases",
};

const emptySelected: Record<ComponentKey, PartItem | null> = {
  CPU: null, COL: null, GPU: null,
  RAM1: null, RAM2: null,
  MB: null,
  STO1: null, STO2: null,
  PSU: null, CAS: null,
};

const formatNrs = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "NRs —";
  return `NRs ${value.toLocaleString("en-US")}`;
};

// ─── Compatibility Banner ─────────────────────────────────────────────────────

interface BannerProps {
  errors: { code: string; message: string; keys: string[] }[];
  warnings: { code: string; message: string; keys: string[] }[];
  selectedCount: number;
}

function CompatibilityBanner({ errors, warnings, selectedCount }: BannerProps) {
  if (selectedCount < 2) return null;

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#ecfdf5",
          borderWidth: 1,
          borderColor: "#a7f3d0",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#10b981",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>✓</Text>
        </View>

        <Text
          style={{
            color: "#047857",
            fontWeight: "600",
            fontSize: 14,
            flex: 1,
          }}
        >
          All selected components are compatible
        </Text>
      </View>
    );
  }

  const allIssues = [
    ...errors.map((e) => ({ ...e, type: "error" as const })),
    ...warnings.map((w) => ({ ...w, type: "warning" as const })),
  ];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: hasErrors ? "#fef2f2" : "#fffbeb",
          borderBottomWidth: 1,
          borderBottomColor: hasErrors ? "#fecaca" : "#fde68a",
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: hasErrors ? "#ef4444" : "#f59e0b",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
            {hasErrors ? "!" : "⚠"}
          </Text>
        </View>

        <Text
          style={{
            flex: 1,
            fontWeight: "bold",
            fontSize: 14,
            color: hasErrors ? "#b91c1c" : "#b45309",
          }}
        >
          {hasErrors
            ? `${errors.length} Compatibility Error${errors.length > 1 ? "s" : ""}`
            : `${warnings.length} Warning${warnings.length > 1 ? "s" : ""}`}
          {hasErrors && hasWarnings
            ? ` · ${warnings.length} warning${warnings.length > 1 ? "s" : ""}`
            : ""}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {allIssues.map((issue, i) => (
          <View
            key={`${issue.code}-${i}`}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              paddingVertical: 8,
              borderBottomWidth: i < allIssues.length - 1 ? 1 : 0,
              borderBottomColor: "#f1f5f9",
            }}
          >
            <Text
              style={{
                marginRight: 8,
                marginTop: 2,
                fontSize: 12,
                fontWeight: "bold",
                color: issue.type === "error" ? "#ef4444" : "#f59e0b",
              }}
            >
              {issue.type === "error" ? "✕" : "⚠"}
            </Text>

            <Text
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: 20,
                color: "#334155",
              }}
            >
              {issue.message}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

//Component Row
interface RowProps {
  componentKey: ComponentKey;
  label: string;
  picked: PartItem | null;
  hasError: boolean;
  hasWarn: boolean;
  onPress: () => void;
  onRemove: () => void;
  onAddNext?: () => void;
}

function ComponentRow({
  componentKey, label, picked, hasError, hasWarn, onPress, onRemove, onAddNext,
}: RowProps) {
  const resolvedKey = componentKey.startsWith("RAM") ? "RAM"
    : componentKey.startsWith("STO") ? "STO"
    : componentKey;
  const sub = picked ? subtitleFor(resolvedKey as any, picked) : "";

  return (
    <View
      className={[
        "bg-white rounded-2xl px-4 py-4 shadow-sm flex-row items-center",
        hasError ? "border border-red-300" : hasWarn ? "border border-amber-300" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Left accent bar for compatibility issues */}
      {(hasError || hasWarn) && (
        <View
          className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
            hasError ? "bg-red-400" : "bg-amber-400"
          }`}
        />
      )}

      {/* Main tappable area */}
      <TouchableOpacity
        className="flex-row items-center flex-1"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Thumbnail / placeholder */}
        {picked?.image_url ? (
          <Image
            source={{ uri: picked.image_url }}
            className="w-12 h-12 rounded-2xl mr-4 bg-slate-100"
          />
        ) : (
          <View className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mr-4">
            <Text className="text-slate-400 font-bold text-xs">{resolvedKey}</Text>
          </View>
        )}

        {/* Text info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-x-1">
            <Text className="text-slate-500 text-xs font-semibold tracking-wider">{label}</Text>
            {hasError && (
              <View className="bg-red-100 px-1.5 py-0.5 rounded-full">
                <Text className="text-red-600 text-xs font-bold">!</Text>
              </View>
            )}
            {!hasError && hasWarn && (
              <View className="bg-amber-100 px-1.5 py-0.5 rounded-full">
                <Text className="text-amber-600 text-xs font-bold">⚠</Text>
              </View>
            )}
          </View>

          <Text className="text-slate-900 font-semibold" numberOfLines={1}>
            {picked ? picked.name : "Select component..."}
          </Text>

          {picked && (
            <>
              {sub ? (
                <Text className="text-slate-500 text-sm mt-1" numberOfLines={1}>{sub}</Text>
              ) : null}
              <Text className="text-indigo-600 font-bold mt-1">{formatNrs(picked.price)}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Right action buttons */}
      <View className="flex-row items-center ml-2 gap-x-1">
        {/* + add next slot button — only shown on filled slot when next slot exists */}
        {picked && onAddNext && (
          <TouchableOpacity
            onPress={onAddNext}
            className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center"
            activeOpacity={0.7}
          >
            <Feather name="plus" size={16} color="#4F46E5" />
          </TouchableOpacity>
        )}

        {/* Remove or chevron */}
        {picked ? (
          <TouchableOpacity
            onPress={onRemove}
            className="w-8 h-8 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name="remove-circle-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <Feather name="chevron-right" size={22} color="#CBD5E1" />
        )}
      </View>
    </View>
  );
}

//Dual Slot Group (RAM / Storage).

interface DualSlotProps {
  label: string;
  slot1Key: ComponentKey;
  slot2Key: ComponentKey;
  slot1: PartItem | null;
  slot2: PartItem | null;
  errorKeys: Set<string>;
  warningKeys: Set<string>;
  onPick: (key: ComponentKey) => void;
  onRemove: (key: ComponentKey) => void;
}

function DualSlotGroup({
  label, slot1Key, slot2Key,
  slot1, slot2,
  errorKeys, warningKeys,
  onPick, onRemove,
}: DualSlotProps) {
  return (
    <View className="mx-4 mb-4 gap-y-3">
      {/* Slot 1 — always visible. Shows + button when filled and slot 2 is empty. */}
      <ComponentRow
        componentKey={slot1Key}
        label={`${label} SLOT 1`}
        picked={slot1}
        hasError={errorKeys.has(slot1Key)}
        hasWarn={warningKeys.has(slot1Key)}
        onPress={() => onPick(slot1Key)}
        onRemove={() => onRemove(slot1Key)}
        // Show + only when slot 1 is filled and slot 2 not yet picked
        onAddNext={slot1 && !slot2 ? () => onPick(slot2Key) : undefined}
      />

      {/* Slot 2 — appears only after slot 1 is filled */}
      {slot1 && (
        <ComponentRow
          componentKey={slot2Key}
          label={`${label} SLOT 2`}
          picked={slot2}
          hasError={errorKeys.has(slot2Key)}
          hasWarn={warningKeys.has(slot2Key)}
          onPress={() => onPick(slot2Key)}
          onRemove={() => onRemove(slot2Key)}
          // No onAddNext — slot 2 is the last slot
        />
      )}
    </View>
  );
}

// Main Screen 

export default function Build() {
  const [selected, setSelected] =
    useState<Record<ComponentKey, PartItem | null>>(emptySelected);

  const [activeKey, setActiveKey]       = useState<ComponentKey | null>(null);
  const [items, setItems]               = useState<PartItem[]>([]);
  const [showPicker, setShowPicker]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [pickerError, setPickerError]   = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  // Derived state 

  const selectedCount = useMemo(
    () => ALL_KEYS.filter((k) => selected[k] !== null).length,
    [selected]
  );

  const totalPrice = useMemo(
    () => ALL_KEYS.reduce((sum, k) => sum + (selected[k]?.price ?? 0), 0),
    [selected]
  );

  const missingLabels = useMemo(
    () => REQUIRED_KEYS.filter((k) => !selected[k]).map((k) => REQUIRED_LABEL[k] ?? k),
    [selected]
  );

  const missingText = useMemo(
    () => (missingLabels.length === 0 ? null : `Missing: ${missingLabels.join(", ")}`),
    [missingLabels]
  );

  const overviewRows = useMemo(() => {
    const rows: { key: any; label: string; item: PartItem | null }[] = [];
    for (const c of SINGLE_COMPONENTS) {
      rows.push({ key: c.key, label: c.label, item: selected[c.key] });
    }
    RAM_SLOTS.forEach((k, i) => {
      if (i === 0 || selected[k] || selected[RAM_SLOTS[i - 1]]) {
        rows.push({ key: k, label: `RAM SLOT ${i + 1}`, item: selected[k] });
      }
    });
    STO_SLOTS.forEach((k, i) => {
      if (i === 0 || selected[k] || selected[STO_SLOTS[i - 1]]) {
        rows.push({ key: k, label: `STORAGE SLOT ${i + 1}`, item: selected[k] });
      }
    });
    return rows;
  }, [selected]);

  const pickerTitle = useMemo(() => {
    if (!activeKey) return "Select Item";
    if (activeKey.startsWith("RAM")) return `Select RAM – Slot ${activeKey.slice(-1)}`;
    if (activeKey.startsWith("STO")) return `Select Storage – Slot ${activeKey.slice(-1)}`;
    return `Select ${SINGLE_COMPONENTS.find((c) => c.key === activeKey)?.label ?? activeKey}`;
  }, [activeKey]);

  // ── Compatibility 

 const compatibility = useMemo(
  () => checkCompatibility(selected),
  [selected]
);
  const { errors, warnings, errorKeys, warningKeys } = compatibility;

  // ── Handlers 

  async function openPicker(key: ComponentKey) {
    setActiveKey(key);
    setShowPicker(true);
    setLoading(true);
    setPickerError(null);
    setItems([]);
    try {
      const res = await fetch(`${API_BASE}${ENDPOINTS[key]}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setPickerError(e?.message ?? "Network request failed");
    } finally {
      setLoading(false);
    }
  }

  function onPick(item: PartItem) {
    if (!activeKey) return;
    setSelected((prev) => ({ ...prev, [activeKey]: item }));
    setShowPicker(false);
  }

  function onRemove(key: ComponentKey) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelected((prev) => {
      const next = { ...prev, [key]: null };
      // Cascade: removing slot 1 also clears slot 2
      if (key === "RAM1") next.RAM2 = null;
      if (key === "STO1") next.STO2 = null;
      return next;
    });
  }

  function clearAllNow() { setSelected(emptySelected); }

  function onChangeFromOverview(key: ComponentKey) {
    setShowOverview(false);
    openPicker(key);
  }

  // Cast to avoid TS complaints about extended ComponentKey in older-typed modals
  const pickerActiveKey  = activeKey as any;
  const overviewOnChange = onChangeFromOverview as any;
  const overviewOnRemove = onRemove as any;

  // ── Render

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <AppHeader />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Build Summary ── */}
          <View className="mx-4 mt-4 mb-4 bg-white rounded-3xl p-5 shadow-md flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 font-bold text-lg mb-1">Build Summary</Text>
              <Text className="text-slate-500 text-sm">
                Selected: {selectedCount} / {ALL_KEYS.length}
              </Text>
              {missingText ? (
                <Text className="text-amber-600 text-xs font-semibold mt-2" numberOfLines={2}>
                  {missingText}
                </Text>
              ) : (
                <Text className="text-emerald-600 text-xs font-semibold mt-2">
                  All set! No missing parts.
                </Text>
              )}
            </View>
            <View className="items-end">
              <Text className="text-indigo-600 font-bold text-xl mb-2">
                {formatNrs(totalPrice)}
              </Text>
              <TouchableOpacity
                onPress={() => setShowOverview(true)}
                className="bg-indigo-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-semibold text-sm">OVERVIEW</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Compatibility Banner ── */}
          <CompatibilityBanner
            errors={errors}
            warnings={warnings}
            selectedCount={selectedCount}
          />

          {/* ── Single-slot components ── */}
          {SINGLE_COMPONENTS.map((row) => (
            <View key={row.key} className="mx-4 mb-4">
              <ComponentRow
                componentKey={row.key}
                label={row.label}
                picked={selected[row.key]}
                hasError={errorKeys.has(row.key)}
                hasWarn={warningKeys.has(row.key)}
                onPress={() => openPicker(row.key)}
                onRemove={() => onRemove(row.key)}
              />
            </View>
          ))}

          {/* ── RAM: 2 slots with inline + button ── */}
          <DualSlotGroup
            label="RAM"
            slot1Key="RAM1"
            slot2Key="RAM2"
            slot1={selected.RAM1}
            slot2={selected.RAM2}
            errorKeys={errorKeys}
            warningKeys={warningKeys}
            onPick={openPicker}
            onRemove={onRemove}
          />

          {/* ── Storage: 2 slots with inline + button ── */}
          <DualSlotGroup
            label="STORAGE"
            slot1Key="STO1"
            slot2Key="STO2"
            slot1={selected.STO1}
            slot2={selected.STO2}
            errorKeys={errorKeys}
            warningKeys={warningKeys}
            onPick={openPicker}
            onRemove={onRemove}
          />
        </ScrollView>

        <PickerModal
          visible={showPicker}
          title={pickerTitle}
          activeKey={pickerActiveKey}
          items={items}
          loading={loading}
          error={pickerError}
          onClose={() => setShowPicker(false)}
          onPick={onPick}
        />

        <OverviewModal
          visible={showOverview}
          rows={overviewRows}
          totalPrice={totalPrice}
          selectedCount={selectedCount}
          totalCount={ALL_KEYS.length}
          missingText={missingText}
          onClose={() => setShowOverview(false)}
          onClearAll={clearAllNow}
          onChange={overviewOnChange}
          onRemove={overviewOnRemove}
        />
      </View>
    </SafeAreaView>
  );
}