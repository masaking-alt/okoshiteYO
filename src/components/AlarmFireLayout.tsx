import React from "react";
import { Platform, StatusBar, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { palette } from "../theme/colors";

interface Props {
  time: string;
  label: string;
  onGiveUp: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
  showGiveUpButton?: boolean;
  showBackButton?: boolean;
}

const AlarmFireLayout: React.FC<Props> = ({
  time,
  label,
  onGiveUp,
  onBack,
  children,
  backgroundColor = palette.sunrise,
  showGiveUpButton = false,
  showBackButton = false,
}) => {
  const statusBarPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showBackButton && onBack && (
        <TouchableOpacity
          style={[styles.backButton, { top: 16 + statusBarPadding }]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.label}>ALARM</Text>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.subLabel}>{label}</Text>

      <View style={styles.panel}>{children}</View>

      {showGiveUpButton && (
        <TouchableOpacity
          style={styles.dismiss}
          onLongPress={onGiveUp}
          activeOpacity={0.8}
        >
          <Text style={styles.dismissText}>長押しでギブアップ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  label: {
    color: "#fff",
    letterSpacing: 4,
    fontWeight: "600",
  },
  time: {
    color: "#fff",
    fontSize: 80,
    fontWeight: "800",
  },
  subLabel: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  panel: {
    width: "100%",
    marginTop: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 24,
  },
  dismiss: {
    position: "absolute",
    bottom: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dismissText: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 1,
  },
  backButton: {
    position: "absolute",
    left: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default AlarmFireLayout;
