import AppHeader from "@/components/appheader";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

// ─── Suggestion chips shown on empty state ────────────────────────────────────

const SUGGESTIONS = [
  "Build me a gaming PC under NRs 1,50,000",
  "AMD vs Intel — which is better?",
  "Will RTX 4060 work with a 500W PSU?",
  "Best laptop under NRs 1,00,000 for studying",
];

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <View className={`mb-3 flex-row ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2 mt-1 shrink-0">
          <Ionicons name="sparkles" size={14} color="#4F46E5" />
        </View>
      )}

      <View
        className={[
          "rounded-2xl px-4 py-3",
          isUser
            ? "bg-indigo-600 rounded-tr-sm max-w-[80%]"
            : "bg-slate-100 rounded-tl-sm max-w-[85%]",
        ].join(" ")}
      >
        <Text
          className={`text-sm leading-5 ${
            isUser ? "text-white" : "text-slate-800"
          }`}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <View className="mb-3 flex-row justify-start">
      <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2 mt-1">
        <Ionicons name="sparkles" size={14} color="#4F46E5" />
      </View>
      <View className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-4">
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isEmptyChat = messages.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <AppHeader />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* ── Message list ── */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Empty / welcome state ── */}
            {isEmptyChat && (
              <View className="items-center mt-6 mb-8">
                <View className="w-16 h-16 rounded-2xl bg-indigo-100 items-center justify-center mb-4">
                  <Ionicons name="sparkles" size={32} color="#4F46E5" />
                </View>

                <Text className="text-xl font-bold text-slate-900 mb-1">
                  PC Building Assistant
                </Text>
                <Text className="text-slate-500 text-sm text-center px-6 leading-5">
                  Ask me about components, compatibility, budget builds, or laptop recommendations.
                </Text>

                {/* Suggestion chips */}
                <View className="mt-6 w-full gap-y-2">
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => sendMessage(s)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center justify-between"
                      activeOpacity={0.7}
                    >
                      <Text className="text-slate-700 text-sm flex-1 mr-2">{s}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ── Messages ── */}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {/* ── Typing indicator ── */}
            {loading && <TypingIndicator />}
          </ScrollView>

          {/* ── Input bar ── */}
          <View className="px-4 pb-4 pt-2 border-t border-slate-100 bg-white">
            <View className="flex-row items-end bg-slate-100 rounded-2xl px-4 py-2">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about components, builds..."
                placeholderTextColor="#94A3B8"
                className="flex-1 text-slate-900 text-sm max-h-24 py-1"
                multiline
                autoCorrect={false}
                onSubmitEditing={() => sendMessage()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`ml-2 w-9 h-9 rounded-xl items-center justify-center ${
                  input.trim() && !loading ? "bg-indigo-600" : "bg-slate-300"
                }`}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-up" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
